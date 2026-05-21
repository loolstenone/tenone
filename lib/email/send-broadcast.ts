/**
 * 공용 이메일 캠페인 발송 헬퍼.
 *
 * `crm_campaigns` row 한 건을 받아 대상자 조회·배치 발송·`email_sends` 로깅·status 갱신을 수행한다.
 * 인증·권한·tenant 검증은 호출자(`/api/intra/crm/broadcast/send`, `/api/smarcomm/email/send`) 책임.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildSegmentQuery, type SegmentRules } from '@/lib/crm-segments';
import {
    applyVariables,
    renderCrmHtml,
    renderCrmText,
    wrapBodyAsHtml,
    type VariableContext,
} from '@/lib/email/crm-template';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenone.biz';
const BATCH_SIZE = 50;

export class BroadcastError extends Error {
    constructor(message: string, public status: number) {
        super(message);
        this.name = 'BroadcastError';
    }
}

export interface SendBroadcastInput {
    campaignId: string;
    testEmails?: string[];
    scheduledAt?: string;
    /** RLS 적용 client — caller가 권한·tenant 검증 후 전달 */
    supabase: SupabaseClient;
    /** service_role client — email_sends 로그 INSERT용 */
    adminSupabase: SupabaseClient;
}

export interface SendBroadcastResult {
    ok: boolean;
    sent: number;
    total: number;
    scheduled?: boolean;
    scheduledAt?: string;
    errors?: string[];
}

interface CampaignRow {
    id: string;
    name: string;
    segment_id: string | null;
    person_ids: string[] | null;
    sender_id: string;
    subject: string;
    preheader: string | null;
    body_html: string | null;
    body_text: string | null;
    button_label: string | null;
    button_url: string | null;
    brand_name: string | null;
    brand_color: string | null;
    status: string;
}

interface PersonTarget {
    id: string;
    name: string | null;
    email: string;
    company: string | null;
    position: string | null;
    do_not_email: boolean | null;
    do_not_contact: boolean | null;
}

function unsubscribeUrl(personId: string): string {
    const token = Buffer.from(`person:${personId}`).toString('base64url');
    return `${SITE_URL}/unsubscribe?token=${token}`;
}

export async function sendCampaignBroadcast(input: SendBroadcastInput): Promise<SendBroadcastResult> {
    const { campaignId, testEmails, scheduledAt, supabase, adminSupabase } = input;

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) throw new BroadcastError('RESEND_API_KEY 미설정', 500);

    const { data: campaign, error: cErr } = await supabase
        .from('crm_campaigns').select('*').eq('id', campaignId).single();
    if (cErr || !campaign) throw new BroadcastError('캠페인을 찾을 수 없습니다.', 404);

    const c = campaign as CampaignRow;
    if (c.status === 'sent' && !testEmails) throw new BroadcastError('이미 발송된 캠페인입니다.', 400);
    if (!c.subject || !c.body_text) throw new BroadcastError('제목과 본문을 작성해주세요.', 400);

    const { data: sender } = await supabase.from('email_senders').select('*').eq('id', c.sender_id).single();
    if (!sender) throw new BroadcastError(`발신자 '${c.sender_id}' 없음`, 400);

    // 예약 발송: 미래 시점이면 status='scheduled'로만 저장하고 종료
    if (scheduledAt && !testEmails) {
        const d = new Date(scheduledAt);
        if (d.getTime() > Date.now() + 60_000) {
            await supabase.from('crm_campaigns').update({
                status: 'scheduled', scheduled_at: d.toISOString(),
            }).eq('id', campaignId);
            return { ok: true, sent: 0, total: 0, scheduled: true, scheduledAt: d.toISOString() };
        }
    }

    const targets = await resolveTargets(supabase, c, testEmails);
    if (targets.length === 0) throw new BroadcastError('발송 가능한 대상이 없습니다.', 400);

    const resend = new Resend(resendKey);
    let sent = 0;
    const errors: string[] = [];

    const subjectTpl = c.subject;
    const textTpl = c.body_text;
    const htmlTpl = c.body_html || wrapBodyAsHtml(c.body_text);
    const btnUrlTpl = c.button_url || '';

    for (let i = 0; i < targets.length; i += BATCH_SIZE) {
        const batch = targets.slice(i, i + BATCH_SIZE);

        const emailBatch = batch.map(t => {
            const ctx: VariableContext = {
                name: t.name, email: t.email, company: t.company, position: t.position,
                brand: c.brand_name,
            };
            const subject = applyVariables(subjectTpl, ctx);
            const bodyHtml = applyVariables(htmlTpl, ctx);
            const bodyText = applyVariables(textTpl, ctx);
            const unsubUrl = unsubscribeUrl(t.id);
            return {
                from: `${sender.from_name} <${sender.from_addr}>`,
                to: t.email,
                subject,
                html: renderCrmHtml({
                    subject, preheader: c.preheader ?? undefined, bodyHtml,
                    bodyText,
                    buttonLabel: c.button_label || undefined,
                    buttonUrl: btnUrlTpl ? applyVariables(btnUrlTpl, ctx) : undefined,
                    brandName: c.brand_name || undefined,
                    brandColor: c.brand_color || undefined,
                    siteUrl: SITE_URL,
                    unsubscribeUrl: unsubUrl,
                }),
                text: renderCrmText({
                    subject, bodyHtml: '', bodyText,
                    buttonLabel: c.button_label || undefined,
                    buttonUrl: btnUrlTpl ? applyVariables(btnUrlTpl, ctx) : undefined,
                    unsubscribeUrl: unsubUrl,
                }),
                replyTo: sender.reply_to || undefined,
                headers: {
                    'List-Unsubscribe': `<${unsubUrl}>`,
                    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                },
            };
        });

        try {
            const { data: result, error: bErr } = await resend.batch.send(emailBatch);
            if (bErr) {
                errors.push(`배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${bErr.message}`);
            } else {
                sent += result?.data?.length ?? batch.length;
                if (!testEmails) {
                    const resendIds = result?.data ?? [];
                    const nowIso = new Date().toISOString();
                    const rows = batch.map((t, idx) => ({
                        kind: 'crm_broadcast' as const,
                        source_id: campaignId,
                        person_id: t.id,
                        from_addr: sender.from_addr,
                        to_addr: t.email,
                        reply_to: sender.reply_to ?? null,
                        subject: applyVariables(subjectTpl, { name: t.name, email: t.email, company: t.company }),
                        resend_id: resendIds[idx]?.id ?? null,
                        status: 'sent' as const,
                        sent_at: nowIso,
                    }));
                    if (rows.length > 0) await adminSupabase.from('email_sends').insert(rows);
                }
            }
        } catch (e) {
            errors.push(`배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${e instanceof Error ? e.message : 'unknown'}`);
        }
    }

    if (sent > 0 && !testEmails) {
        await supabase.from('crm_campaigns').update({
            status: 'sent', sent_at: new Date().toISOString(), recipient_count: sent,
        }).eq('id', campaignId);
    }

    return { ok: sent > 0, sent, total: targets.length, errors: errors.length ? errors : undefined };
}

async function resolveTargets(
    supabase: SupabaseClient,
    c: CampaignRow,
    testEmails?: string[],
): Promise<PersonTarget[]> {
    if (testEmails && testEmails.length > 0) {
        return testEmails.map(email => ({
            id: `test-${email}`, name: 'Test', email, company: null, position: null,
            do_not_email: false, do_not_contact: false,
        }));
    }

    const ids = new Set<string>();
    let resolved: PersonTarget[] = [];

    if (c.segment_id) {
        const { data: seg } = await supabase
            .from('crm_segments').select('rules').eq('id', c.segment_id).single();
        if (seg?.rules) {
            const q = buildSegmentQuery(
                supabase,
                seg.rules as SegmentRules,
                'id, name, email, company, position, do_not_email, do_not_contact'
            );
            const { data } = await q.limit(10000);
            for (const r of (data ?? []) as unknown as PersonTarget[]) {
                if (!ids.has(r.id)) { ids.add(r.id); resolved.push(r); }
            }
        }
    }

    if (c.person_ids && c.person_ids.length > 0) {
        const { data } = await supabase
            .from('crm_people')
            .select('id, name, email, company, position, do_not_email, do_not_contact')
            .in('id', c.person_ids);
        for (const r of (data ?? []) as PersonTarget[]) {
            if (!ids.has(r.id)) { ids.add(r.id); resolved.push(r); }
        }
    }

    return resolved.filter(r => r.email && !r.do_not_email && !r.do_not_contact);
}
