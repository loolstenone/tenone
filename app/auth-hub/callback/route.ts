import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { encryptTokenPayload } from '@/lib/auth-transfer';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    const cookieStore = await cookies();

    // Supabase 서버 클라이언트로 code → session 교환
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
        console.error('[Auth Hub] Code exchange failed:', error?.message);
        return NextResponse.redirect(new URL('/login?error=code_exchange_failed', request.url));
    }

    // 저장된 리턴 정보 읽기 (쿠키 우선, state 파라미터 fallback)
    const compositeState = cookieStore.get('auth_state')?.value || '';
    // state 형식: "userState|returnDomain|returnPath" (쿠키 유실 대비 백업)
    const stateParts = compositeState.split('|');
    const state = stateParts[0] || '';
    const stateDomain = stateParts[1] || '';
    const statePath = stateParts[2] || '';

    const returnDomain = cookieStore.get('auth_return_domain')?.value || stateDomain || 'tenone.biz';
    const returnPath = cookieStore.get('auth_return_path')?.value || statePath || '/';

    // 토큰 암호화
    const encrypted = encryptTokenPayload({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        returnPath,
        timestamp: Date.now(),
    });

    // 리턴 쿠키 정리
    cookieStore.delete('auth_return_domain');
    cookieStore.delete('auth_return_path');
    cookieStore.delete('auth_state');

    // 원래 도메인으로 리다이렉트
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const port = process.env.NODE_ENV === 'production' ? '' : ':3000';
    const targetUrl = `${protocol}://${returnDomain}${port}/auth/session?token=${encodeURIComponent(encrypted)}&state=${encodeURIComponent(state)}`;

    return NextResponse.redirect(targetUrl);
}
