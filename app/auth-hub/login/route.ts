import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isAllowedReturnDomain } from '@/lib/auth-transfer';
import { AUTH_DOMAIN } from '@/lib/site-config';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') as 'google' | 'kakao';
    const returnDomain = searchParams.get('returnDomain') || '';
    const returnPath = searchParams.get('returnPath') || '/';
    const state = searchParams.get('state') || '';

    // 유효성 검증
    if (!provider || !['google', 'kakao'].includes(provider)) {
        return NextResponse.redirect(new URL('/login?error=invalid_provider', request.url));
    }

    if (!isAllowedReturnDomain(returnDomain)) {
        return NextResponse.redirect(new URL('/login?error=invalid_domain', request.url));
    }

    // returnDomain + returnPath를 쿠키에 저장 (10분 만료)
    const cookieStore = await cookies();
    cookieStore.set('auth_return_domain', returnDomain, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
    });
    cookieStore.set('auth_return_path', returnPath, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
    });
    // state에 returnDomain을 백업 인코딩 (쿠키 유실 대비)
    const compositeState = `${state}|${returnDomain}|${returnPath}`;
    cookieStore.set('auth_state', compositeState, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
    });

    // Supabase OAuth 시작
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

    // 콜백 URL = auth.tenone.biz/auth-hub/callback (항상 고정)
    const callbackUrl = `${AUTH_DOMAIN}/auth-hub/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl },
    });

    if (error || !data?.url) {
        return NextResponse.redirect(new URL('/login?error=oauth_init_failed', request.url));
    }

    return NextResponse.redirect(data.url);
}
