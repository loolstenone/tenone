import { NextRequest, NextResponse } from 'next/server';
import { safeRedirect } from '@/lib/login-href';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAllowedSiteOrigin, mintSsoToken, ssoSupabase, SSO_HUB_ORIGIN } from '@/lib/sso-server';

/**
 * SSO Publish — 사이트(독립 도메인)에서 로그인 성공 직후 실행. 이 로그인을 허브에도 등록해
 * 다른 유니버스 사이트에서 다시 로그인하지 않게 한다.
 * GET ?final=/rook/projects → 허브 /api/sso/adopt?token=… → 허브가 세션 저장 후 이 사이트 final로 복귀
 * 실패하면 그냥 final로 (로그인 자체는 이미 끝났으므로 사용자 흐름을 막지 않는다)
 */
export async function GET(request: NextRequest) {
    const origin = request.nextUrl.origin;
    const final_path = safeRedirect(request.nextUrl.searchParams.get('final'));
    const fallback = NextResponse.redirect(new URL(final_path, origin));

    if (!isAllowedSiteOrigin(origin)) return fallback;

    const { data: { user } } = await ssoSupabase(request, NextResponse.next()).auth.getUser();
    if (!user?.email) return fallback;

    // 회원가입(동의)을 마친 계정만 허브에 등록 — 소셜 첫 로그인 직후(가입 화면 전)에는 다른 사이트로 로그인을 넘기지 않는다 (2026-10-15)
    const { data: member } = await createAdminClient().from('members').select('id').eq('auth_id', user.id).maybeSingle();
    if (!member) return fallback;

    const token = await mintSsoToken({
        userId: user.id,
        email: user.email,
        direction: 'to_hub',
        exchangeOrigin: SSO_HUB_ORIGIN,
        returnOrigin: origin,
        finalPath: final_path,
    });
    if (!token) return fallback;

    const adopt = new URL('/api/sso/adopt', SSO_HUB_ORIGIN);
    adopt.searchParams.set('token', token);
    return NextResponse.redirect(adopt);
}
