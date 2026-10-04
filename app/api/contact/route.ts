import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyTurnstile, CAPTCHA_REQUIRED_ERROR } from '@/lib/turnstile-server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { formType, name, email, phone, company, message, portfolioUrl, extra, captchaToken } = body;

        // 봇 차단 (2026-10-05: 파트너 문의 1,479건이 전부 봇) — 시크릿 미설정 시 fail-closed
        if (!(await verifyTurnstile(captchaToken, request))) {
            return NextResponse.json({ error: CAPTCHA_REQUIRED_ERROR }, { status: 400 });
        }

        if (!formType || !name || !email) {
            return NextResponse.json({ error: '이름과 이메일은 필수입니다.' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const { error } = await supabase.from('contact_submissions').insert({
            form_type: formType,
            name, email, phone, company, message,
            portfolio_url: portfolioUrl,
            extra: extra || {},
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact submit error:', error);
        return NextResponse.json({ error: '제출에 실패했습니다.' }, { status: 500 });
    }
}
