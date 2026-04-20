/**
 * POST /api/intra/crm/broadcast/send
 * body: { campaignId: string; testEmails?: string[]; scheduledAt?: string }
 * - testEmails 지정 시 해당 주소로만 발송 (상태 변경 없음)
 * - scheduledAt 미래면 큐 저장만
 * - 그 외 캠페인의 segment + person_ids 기반 대상자 전체 발송
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { buildSegmentQuery, type SegmentRules } from '@/lib/crm-segments';
import { applyVariables, renderCrmHtml, renderCrmText, wrapBodyAsHtml, type VariableContext } from '@/lib/email/crm-template';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenone.biz';

function unsubscribeUrl(personId: string): string {
    const token = Buffer.from(`person:${personId}`).toString('base64url');
    return `${SITE_URL}/unsubscribe?token=${token}`;
}

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
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

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ error: 'RESEND_API_KEY 미설정' }, { status: 500 });

    const { campaignId, testEmails, scheduledAt } = await request.json().catch(() => ({})) as {
        campaignId?: string; testEmails?: string[]; scheduledAt?: string;
    };
    if (!campaignId) return NextResponse.json({ error: 'campaignId가 필요합니다.' }, { status: 400 });

    const { data: campaign, error: cErr } = await supabase
        .from('crm_campaigns').select('*').eq('id', campaignId).single();
    if (cErr || !campaign) return NextResponse.json({ error: '캠페인을 찾을 수 없습니다.' }, { status: 404 });

    const c = campaign as CampaignRow;
    if (c.status === 'sent' && !testEmails) return NextResponse.json({ error: '이미 발송된 캠페인입니다.' }, { status: 400 });
    if (!c.subject || !c.body_text) return NextResponse.json({ error: '제목과 본문을 작성해주세요.' }, { status: 400 });

    // 발신자 정보
    const { data: sender } = await supabase.from('email_senders').select('*').eq('id', c.sender_id).single();
    if (!sender) return NextResponse.json({ error: `발신자 '${c.sender_id}' 없음` }, { status: 400 });

    // 예약 발송
    if (scheduledAt && !testEmails) {
        const d = new Date(scheduledAt);
        if (d.getTime() > Date.now() + 60_000) {
            await supabase.from('crm_campaigns').update({
                status: 'scheduled', scheduled_at: d.toISOString(),
            }).eq('id', campaignId);
            return NextResponse.json({ ok: true, scheduled: true, scheduledAt: d.toISOString() });
        }
    }

    // 대상자 조회
    let targets: PersonTarget[];
    if (testEmails && testEmails.length > 0) {
        targets = testEmails.map(email => ({
            id: `test-${email}`, name: 'Test', email, company: null, position: null,
            do_not_email: false, do_not_contact: false,
        }));
    } else {
        const ids = new Set<string>();
        let resolved: PersonTarget[] = [];

        // 1) segment resolve
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

        // 2) 개별 person_ids 합집합
        if (c.person_ids && c.person_ids.length > 0) {
            const { data } = await supabase
                .from('crm_people')
                .select('id, name, email, company, position, do_not_email, do_not_contact')
                .in('id', c.person_ids);
            for (const r of (data ?? []) as PersonTarget[]) {
                if (!ids.has(r.id)) { ids.add(r.id); resolved.push(r); }
            }
        }

        // 3) do_not_email / do_not_contact / 이메일 없음 제거
        resolved = resolved.filter(r => r.email && !r.do_not_email && !r.do_not_contact);

        if (resolved.length === 0) {
            return NextResponse.json({ error: '발송 가능한 대상이 없습니다.' }, { status: 400 });
        }
        targets = resolved;
    }

    const admin = getAdminClient();
    const resend = new Resend(resendKey);
    let sent = 0;
    const errors: string[] = [];

    const subjectTpl = c.subject;
    const textTpl = c.body_text;
    const htmlTpl = c.body_html || wrapBodyAsHtml(c.body_text);
    const btnUrlTpl = c.button_url || '';

    const BATCH = 50;
    for (let i = 0; i < targets.length; i += BATCH) {
        const batch = targets.slice(i, i + BATCH);

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
                errors.push(`배치 ${Math.floor(i / BATCH) + 1}: ${bErr.message}`);
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
                    if (rows.length > 0) await admin.from('email_sends').insert(rows);
                }
            }
        } catch (e) {
            errors.push(`배치 ${Math.floor(i / BATCH) + 1}: ${e instanceof Error ? e.message : 'unknown'}`);
        }
    }

    if (sent > 0 && !testEmails) {
        await supabase.from('crm_campaigns').update({
            status: 'sent', sent_at: new Date().toISOString(), recipient_count: sent,
        }).eq('id', campaignId);
    }

    return NextResponse.json({ ok: sent > 0, sent, total: targets.length, errors: errors.length ? errors : undefined });
}
