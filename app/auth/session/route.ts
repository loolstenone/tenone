import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { decryptTokenPayload } from '@/lib/auth-transfer';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(`${origin}/login?error=no_token`);
    }

    // 토큰 복호화 + 만료 검증
    const payload = decryptTokenPayload(token);
    if (!payload) {
        return NextResponse.redirect(`${origin}/login?error=invalid_token`);
    }

    const cookieStore = await cookies();

    // Supabase 세션 설정
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

    const { error } = await supabase.auth.setSession({
        access_token: payload.accessToken,
        refresh_token: payload.refreshToken,
    });

    if (error) {
        console.error('[Auth Session] setSession failed:', error.message);
        return NextResponse.redirect(`${origin}/login?error=session_failed`);
    }

    // 원래 경로로 리다이렉트
    return NextResponse.redirect(`${origin}${payload.returnPath}`);
}
