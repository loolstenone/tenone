import { NextRequest, NextResponse } from 'next/server';
import { safeRedirect } from '@/lib/login-href';
import { isAllowedSiteOrigin, isHubHost, mintSsoToken, ssoSupabase } from '@/lib/sso-server';

/**
 * SSO Initiate — 허브(auth.tenone.biz)에서 실행. 사이트의 로그인 버튼이 여기로 보낸다.
 *
 * GET ?origin=https://www.rook.co.kr&final=/rook/projects
 *   허브 세션 있음 → 일회용 토큰 → {origin}/api/sso/exchange?token=…
 *   허브 세션 없음 → {origin}/api/sso/return?final=… (사이트가 로그인 모달을 연다)
 * 허브는 로그인 화면을 띄우지 않는다 — 로그인은 항상 브랜드 사이트 안에서 (§1.2.1 이탈 방지)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const final_path = safeRedirect(searchParams.get('final'));

    if (!isHubHost(request)) return NextResponse.json({ error: 'SSO hub only' }, { status: 404 });
    if (!isAllowedSiteOrigin(origin)) return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });

    const back = new URL('/api/sso/return', origin);
    back.searchParams.set('final', final_path);

    const probe = NextResponse.next();
    const { data: { user } } = await ssoSupabase(request, probe).auth.getUser();
    if (!user?.email) return NextResponse.redirect(back);

    const token = await mintSsoToken({
        userId: user.id,
        email: user.email,
        direction: 'to_site',
        exchangeOrigin: origin,
        returnOrigin: origin,
        finalPath: final_path,
    });
    if (!token) return NextResponse.redirect(back);

    const exchange = new URL('/api/sso/exchange', origin);
    exchange.searchParams.set('token', token);
    return NextResponse.redirect(exchange);
}
