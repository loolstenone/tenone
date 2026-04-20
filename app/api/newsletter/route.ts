import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { renderConfirmHtml, renderConfirmText } from '@/lib/email/newsletter-template';

function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenone.biz';
const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL || 'noreply@tenone.biz';
const REPLY_TO = process.env.NEWSLETTER_REPLY_TO || 'lools@tenone.biz';

/** 브랜드별 확인 메일 설정 — fromName은 "{브랜드} · Ten:One™ Universe" 자동 생성 */
const BRAND_CONFIG: Record<string, { name: string; color: string }> = {
    mindle:  { name: 'Mindle',            color: '#F5C518' },
    tenone:  { name: 'Ten:One™ Universe', color: '#000000' },
    hero:    { name: 'HeRo',              color: '#0a0a0a' },
    badak:   { name: 'Badak',             color: '#0a0a0a' },
    myverse: { name: 'Myverse',           color: '#6366f1' },
    jakka:   { name: 'JAKKA',             color: '#171717' },
    montz:   { name: 'MoNTZ',             color: '#c8a97e' },
};

function getFromName(brandName: string): string {
    return brandName === 'Ten:One™ Universe' ? brandName : `${brandName} · Ten:One™ Universe`;
}

function getSubject(brandName: string): string {
    return brandName === 'Ten:One™ Universe'
        ? `[Ten:One™ Universe] 뉴스레터 구독 인증`
        : `[${brandName}] 뉴스레터 구독 인증 · Ten:One™ Universe`;
}

/** 구독자 id → base64url 토큰 */
function makeToken(id: string): string {
    return Buffer.from(id).toString('base64url');
}

export async function POST(request: NextRequest) {
    try {
        const { email, nickname, name, memberId, source } = await request.json();
        if (!email) return NextResponse.json({ error: '이메일은 필수입니다.' }, { status: 400 });

        // nickname 우선, 없으면 name 폴백 (로그인 회원)
        const displayName = nickname || name || null;

        const supabase = getAdminClient();

        // 1. 구독자 upsert (미인증 상태로)
        const { data: subscriber, error } = await supabase
            .from('newsletter_subscribers')
            .upsert(
                {
                    email,
                    name: displayName,
                    member_id: memberId || null,
                    is_active: false,   // 확인 메일 클릭 후 활성화
                    source: source || null,
                },
                { onConflict: 'email' }
            )
            .select('id, is_active')
            .single();

        if (error) throw error;

        // 2. 브랜드 태그 등록
        if (subscriber?.id && source) {
            await supabase
                .from('subscriber_tags')
                .upsert(
                    { subscriber_id: subscriber.id, tag: source },
                    { onConflict: 'subscriber_id,tag' }
                );
        }

        // 3. 확인 메일 발송 (Resend)
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey && subscriber?.id) {
            const brand = BRAND_CONFIG[source] || BRAND_CONFIG.tenone;
            const token = makeToken(subscriber.id);
            const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${token}`;

            const resend = new Resend(resendKey);
            const fromHeader = `${getFromName(brand.name)} <${FROM_EMAIL}>`;
            const subject = getSubject(brand.name);
            const { data: sent } = await resend.emails.send({
                from: fromHeader,
                to: email,
                replyTo: REPLY_TO,
                subject,
                html: renderConfirmHtml({
                    nickname: displayName || '구독자',
                    brandName: brand.name,
                    brandColor: brand.color,
                    confirmUrl,
                    siteUrl: SITE_URL,
                }),
                text: renderConfirmText({
                    nickname: displayName || '구독자',
                    brandName: brand.name,
                    brandColor: brand.color,
                    confirmUrl,
                    siteUrl: SITE_URL,
                }),
            });

            // 발송 기록
            await supabase.from('email_sends').insert({
                kind: 'confirm',
                source_id: subscriber.id,
                subscriber_id: subscriber.id,
                member_id: memberId || null,
                from_addr: FROM_EMAIL,
                to_addr: email,
                reply_to: REPLY_TO,
                subject,
                resend_id: sent?.id ?? null,
                status: sent?.id ? 'sent' : 'failed',
                sent_at: sent?.id ? new Date().toISOString() : null,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Newsletter subscribe error:', error);
        return NextResponse.json({ error: '구독에 실패했습니다.' }, { status: 500 });
    }
}
