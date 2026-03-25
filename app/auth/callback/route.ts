import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const hostname = request.headers.get('host') || '';
    const cookieStore = await cookies();

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
                            cookieStore.set(name, value, options);
                        });
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // redirect 쿠키 삭제
            if (authRedirectCookie) {
                cookieStore.set('auth_redirect', '', { path: '/', maxAge: 0 });
            }
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // 에러 시 로그인 페이지로
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
