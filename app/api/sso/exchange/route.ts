import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

/**
 * SSO Exchange — 타 도메인(smarcomm.biz 등)에서 호출
 *
 * 흐름:
 * 1. /api/sso/initiate에서 받은 일회성 토큰으로 세션 복원
 * 2. Supabase setSession() → 현재 도메인 쿠키에 세션 저��
 * 3. 최종 목���지로 리다이렉트
 *
 * Query params:
 *   token: SSO 일회성 토���
 *   final: 최종 리다���렉트 경로 (/dashboard)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const final_path = searchParams.get('final') || '/';
    const origin = request.nextUrl.origin;

    if (!token) {
        return NextResponse.redirect(new URL(`/login?error=sso_no_token`, origin));
    }

    // service_role로 토큰 조회 (RLS ��회)
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: ssoToken, error: fetchError } = await adminClient
        .from('sso_tokens')
        .select('*')
        .eq('token', token)
        .eq('used', false)
        .single();

    if (fetchError || !ssoToken) {
        return NextResponse.redirect(new URL(`/login?error=sso_invalid_token`, origin));
    }

    // 만료 확인 (60초)
    if (new Date(ssoToken.expires_at) < new Date()) {
        // 만료된 토큰 삭제
        await adminClient.from('sso_tokens').delete().eq('id', ssoToken.id);
        return NextResponse.redirect(new URL(`/login?error=sso_token_expired`, origin));
    }

    // 토큰 사용 처리 (일회성)
    await adminClient.from('sso_tokens').update({ used: true }).eq('id', ssoToken.id);

    // 현재 도메인에 Supabase 세션 쿠키 설정
    let response = NextResponse.redirect(new URL(final_path, origin));

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, {
                            ...options,
                            // ���재 도메인 전용 쿠키 (domain 미지정 = 현재 호스트)
                        });
                    });
                },
            },
            auth: { storageKey: 'tenone-auth' },
        }
    );

    // setSession으로 세션 복원 → 쿠키 자동 설정
    const { error: sessionError } = await supabase.auth.setSession({
        access_token: ssoToken.access_token,
        refresh_token: ssoToken.refresh_token,
    });

    if (sessionError) {
        console.error('[SSO] setSession error:', sessionError);
        return NextResponse.redirect(new URL(`/login?error=sso_session_failed`, origin));
    }

    // 사용된 토큰 삭제 (정리)
    adminClient.from('sso_tokens').delete().eq('id', ssoToken.id).then(() => {});

    return response;
}
