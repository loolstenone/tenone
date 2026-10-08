import { NextRequest, NextResponse } from 'next/server';
import { safeRedirect } from '@/lib/login-href';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCookieDomain, isTenoneFamily, isExternalDomain } from '@/lib/domain-registry';
import { earnUC } from '@/lib/supabase/uc';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';

const supabaseAdmin = createAdminClient();

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
    // next는 같은 사이트 상대 경로만 — `${origin}${next}`에 .evil.com·@evil.com 붙는 변조 차단 (점검 축3 H-5)
    const next = safeRedirect(searchParams.get('next'));
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

    const { data: verifyData, error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (error) {
        console.error('[auth/confirm] verifyOtp error:', error.message);
        return NextResponse.redirect(`${origin}/login?error=otp_invalid&msg=${encodeURIComponent(error.message)}`);
    }

    // 이메일 인증 완료 시 signup_complete UC 지급
    if (type === 'signup' && verifyData?.user) {
        const { data: memberRow } = await supabaseAdmin
            .from('members')
            .select('id')
            .eq('auth_id', verifyData.user.id)
            .maybeSingle();
        if (memberRow) {
            await earnUC(memberRow.id, 'signup_complete', null);
        }
    }

    // 가입 인증: 메일 링크가 Site URL(tenone.biz)로 열려도 가입한 브랜드 사이트로 돌려보낸다 (§1.2.1 이탈 방지)
    //  - 가입 사이트 = signUp 때 저장한 user_metadata.consent.origin_site (hostname)
    //  - *.tenone.biz → 쿠키 공유라 그대로 이동 · 독립 도메인 → 허브(auth.tenone.biz) SSO로 로그인까지 넘김 (One ID)
    if (type === 'signup' && next === '/' && verifyData?.user) {
        const originSite = (verifyData.user.user_metadata?.consent as { origin_site?: string } | undefined)?.origin_site;
        const brandUrl = signupSiteReturn(originSite, hostname);
        if (brandUrl) return NextResponse.redirect(brandUrl);
    }

    // 성공 → next 경로로 리다이렉트 (세션 쿠키 이미 설정됨)
    return NextResponse.redirect(`${origin}${next}`);
}

/** 가입한 사이트로 돌아갈 주소 — 지금 호스트와 같거나 등록되지 않은 호스트면 null */
function signupSiteReturn(originSite: string | undefined, currentHost: string): string | null {
    if (!originSite) return null;
    const host = originSite.toLowerCase();
    const current = currentHost.split(':')[0];
    if (host === current || host === 'localhost' || current === 'localhost') return null;
    if (isTenoneFamily(host)) {
        // 같은 .tenone.biz 쿠키 — 바로 이동 (staging·서브도메인)
        return isTenoneFamily(current) ? `https://${host}/` : null;
    }
    if (!isExternalDomain(host)) return null;
    // 독립 도메인 — 허브가 지금 막 만든 세션(.tenone.biz 쿠키)을 그 도메인으로 넘긴다
    if (!isTenoneFamily(current)) return null;
    const sso = new URL('/api/sso/initiate', 'https://auth.tenone.biz');
    sso.searchParams.set('origin', `https://${host}`);
    sso.searchParams.set('final', '/');
    return sso.toString();
}
