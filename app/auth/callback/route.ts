import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCookieDomain } from '@/lib/domain-registry';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const hostname = request.headers.get('host') || '';
    const cookieStore = await cookies();
    const cookieDomain = getCookieDomain(hostname);

    // SmarComm 도메인이면 기본 리다이렉트를 /dashboard로
    const defaultNext = hostname.includes('smarcomm') ? '/dashboard' : '/';
    // 쿠키에 저장된 redirect 목적지 복원 (소셜 로그인 시 설정됨)
    const authRedirectCookie = cookieStore.get('auth_redirect')?.value;
    const pendingRedirect = authRedirectCookie ? decodeURIComponent(authRedirectCookie) : null;
    const next = searchParams.get('next') ?? pendingRedirect ?? defaultNext;

    if (code) {
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
                auth: {
                    storageKey: 'tenone-auth',
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // redirect 쿠키 삭제
            if (authRedirectCookie) {
                cookieStore.set('auth_redirect', '', { path: '/', maxAge: 0 });
            }
            // 비밀번호 재설정 플로우 감지
            const type = searchParams.get('type');
            if (type === 'recovery') {
                return NextResponse.redirect(`${origin}/reset-password`);
            }
            return NextResponse.redirect(`${origin}${next}`);
        }
        // 디버깅용: 실제 에러 + 쿠키 스냅샷 노출 (운영 안정화 후 제거)
        const allCookieNames = cookieStore.getAll().map(c => c.name).join(',');
        const hasVerifier = cookieStore.getAll().some(c => c.name.includes('code-verifier'));
        console.error('[auth/callback] exchange error:', error.message, 'host:', hostname, 'hasVerifier:', hasVerifier, 'cookies:', allCookieNames);
        return NextResponse.redirect(`${origin}/login?error=auth_callback_error&msg=${encodeURIComponent(error.message)}&hasVerifier=${hasVerifier}&cookies=${encodeURIComponent(allCookieNames.slice(0, 500))}`);
    }

    // 코드 자체가 없음
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error&msg=no_code`);
}
