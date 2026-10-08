import { NextRequest, NextResponse } from 'next/server';
import { safeRedirect } from '@/lib/login-href';
import { consumeSsoToken, establishSession, isAllowedSiteOrigin, isHubHost } from '@/lib/sso-server';

/**
 * SSO Adopt — 허브(auth.tenone.biz)에서 실행. 사이트에서 막 로그인한 세션을 허브에도 독립 세션으로 등록하고
 * 그 사이트의 원래 페이지로 돌려보낸다. 돌아갈 origin·경로는 토큰 발급 때 서버가 정한 값만 쓴다.
 */
export async function GET(request: NextRequest) {
    if (!isHubHost(request)) return NextResponse.json({ error: 'SSO hub only' }, { status: 404 });

    const host = request.headers.get('host') || '';
    const row = await consumeSsoToken(request.nextUrl.searchParams.get('token'), 'to_hub', host);
    if (!row || !isAllowedSiteOrigin(row.return_origin)) {
        return NextResponse.redirect(new URL('https://www.tenone.biz/'));
    }

    const back = new URL(safeRedirect(row.final_path), row.return_origin);
    const response = NextResponse.redirect(back);
    // 실패해도 사이트 로그인은 이미 끝났으므로 그대로 복귀 (허브 등록만 빠짐)
    await establishSession(request, response, row.otp_hash, row.user_id);
    return response;
}
