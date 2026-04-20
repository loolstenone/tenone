/**
 * POST /api/webhooks/resend
 * Resend Webhook 수신 → email_events + email_sends 업데이트
 *
 * 이벤트 종류 (Resend):
 *   email.sent, email.delivered, email.delivery_delayed,
 *   email.opened, email.clicked, email.bounced, email.complained
 *
 * 서명 검증: Svix 표준 (svix-id, svix-timestamp, svix-signature)
 *   - secret: RESEND_WEBHOOK_SECRET (Resend Dashboard에서 발급)
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}

/** Svix 서명 검증 (Resend가 Svix를 사용) */
function verifySvixSignature(
    payload: string,
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
    secret: string
): boolean {
    try {
        // secret 형식: whsec_xxx → base64 디코드
        const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
        const signedContent = `${svixId}.${svixTimestamp}.${payload}`;
        const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64');

        // svixSignature 형식: "v1,<base64sig> v1,<base64sig2> ..."
        const signatures = svixSignature.split(' ').map(s => s.split(',')[1]).filter(Boolean);
        return signatures.some(sig => {
            const a = Buffer.from(sig, 'base64');
            const b = Buffer.from(expected, 'base64');
            return a.length === b.length && timingSafeEqual(a, b);
        });
    } catch {
        return false;
    }
}

interface ResendWebhookEvent {
    type: string;                  // 'email.sent', 'email.delivered', ...
    created_at: string;
    data: {
        email_id?: string;          // Resend 내부 ID (resend_id)
        from?: string;
        to?: string | string[];
        subject?: string;
        created_at?: string;
        // 이벤트별 추가 필드
        click?: { link?: string };
        bounce?: { type?: string; message?: string };
    };
}

export async function POST(request: NextRequest) {
    const raw = await request.text();
    const secret = process.env.RESEND_WEBHOOK_SECRET;

    // 서명 검증 (secret 설정된 경우만)
    if (secret) {
        const svixId = request.headers.get('svix-id');
        const svixTimestamp = request.headers.get('svix-timestamp');
        const svixSignature = request.headers.get('svix-signature');
        if (!svixId || !svixTimestamp || !svixSignature) {
            return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 });
        }
        if (!verifySvixSignature(raw, svixId, svixTimestamp, svixSignature, secret)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
    }

    let event: ResendWebhookEvent;
    try {
        event = JSON.parse(raw);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const resendId = event.data?.email_id;

    // 원본 이벤트 저장
    const { data: send } = resendId
        ? await supabase.from('email_sends').select('id').eq('resend_id', resendId).maybeSingle()
        : { data: null };

    await supabase.from('email_events').insert({
        send_id: send?.id ?? null,
        resend_id: resendId ?? null,
        event_type: event.type,
        payload: event as unknown as Record<string, unknown>,
    });

    // email_sends 상태/타임스탬프 업데이트
    if (resendId) {
        const now = new Date().toISOString();
        const updates: Record<string, unknown> = {};
        switch (event.type) {
            case 'email.sent':       updates.status = 'sent';      updates.sent_at = now; break;
            case 'email.delivered':  updates.status = 'delivered'; updates.delivered_at = now; break;
            case 'email.opened':     updates.opened_at = now; break;
            case 'email.clicked':    updates.clicked_at = now; break;
            case 'email.bounced':    updates.status = 'bounced';   updates.bounced_at = now; break;
            case 'email.complained': updates.status = 'complained';updates.complained_at = now; break;
        }
        if (Object.keys(updates).length > 0) {
            await supabase.from('email_sends').update(updates).eq('resend_id', resendId);
        }

        // 구독자 테이블도 동시 업데이트 (바운스·수신거부·오픈·클릭)
        if (send?.id) {
            const { data: sendRow } = await supabase
                .from('email_sends')
                .select('subscriber_id')
                .eq('id', send.id)
                .single();
            const subscriberId = sendRow?.subscriber_id;
            if (subscriberId) {
                switch (event.type) {
                    case 'email.opened':
                        await supabase.from('newsletter_subscribers')
                            .update({ last_opened_at: now })
                            .eq('id', subscriberId);
                        break;
                    case 'email.clicked':
                        await supabase.from('newsletter_subscribers')
                            .update({ last_clicked_at: now })
                            .eq('id', subscriberId);
                        break;
                    case 'email.bounced': {
                        // bounce_count 증가 + 3회 이상 시 자동 비활성
                        const { data: sub } = await supabase
                            .from('newsletter_subscribers')
                            .select('bounce_count')
                            .eq('id', subscriberId)
                            .single();
                        const newCount = (sub?.bounce_count ?? 0) + 1;
                        await supabase.from('newsletter_subscribers').update({
                            bounced_at: now,
                            bounce_count: newCount,
                            is_active: newCount >= 3 ? false : undefined,
                        }).eq('id', subscriberId);
                        break;
                    }
                    case 'email.complained':
                        await supabase.from('newsletter_subscribers').update({
                            complained_at: now,
                            is_active: false,
                        }).eq('id', subscriberId);
                        break;
                }
            }
        }
    }

    return NextResponse.json({ ok: true });
}

// GET: 헬스체크
export async function GET() {
    return NextResponse.json({ ok: true, service: 'resend-webhook' });
}
