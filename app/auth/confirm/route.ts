import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCookieDomain } from '@/lib/domain-registry';
import type { EmailOtpType } from '@supabase/supabase-js';

/**
 * OTP 기반 인증 확인 엔드포인트 (PKCE 대체)
 *
 * Supabase 이메일 링크가 여기로 오면 token_hash를 verifyOtp로 교환해 세션 설정.
 * PKCE와 달리 클라이언트 verifier 쿠키가 필요 없어서 크로스 디바이스/탭에서도 동작.
 *
 * 이메일 템플릿에서:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    const next = searchParams.get('next') || '/';
    const hostname = request.headers.get('host') || '';
    const cookieStore = await cookies();
    const cookieDomain = getCookieDomain(hostname);

    if (!token_hash || !type) {
        return NextResponse.redirect(`${origin}/login?error=missing_otp_params`);
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        cookieStore.set(name, value, {
                            ...options,
                            ...(cookieDomain && { domain: cookieDomain }),
                        });
                    });
                },
            },
            auth: { storageKey: 'tenone-auth' },
        }
    );

    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (error) {
        console.error('[auth/confirm] verifyOtp error:', error.message);
        return NextResponse.redirect(`${origin}/login?error=otp_invalid&msg=${encodeURIComponent(error.message)}`);
    }

    // 성공 → next 경로로 리다이렉트 (세션 쿠키 이미 설정됨)
    return NextResponse.redirect(`${origin}${next}`);
}
