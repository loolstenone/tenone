import { NextRequest, NextResponse } from 'next/server';
import { safeRedirect } from '@/lib/login-href';
import { consumeSsoToken, establishSession, SSO_NONE_COOKIE, SSO_NONE_MAX_AGE } from '@/lib/sso-server';

/**
 * SSO Exchange — 사이트(독립 도메인)에서 실행. 허브가 발급한 일회용 토큰으로 이 도메인에 독립 세션을 만든다.
 * GET ?token=… → 세션 쿠키 설정 → 토큰 발급 때 정한 경로로 이동 (쿼리로 받은 경로는 쓰지 않는다)
 */
export async function GET(request: NextRequest) {
    const origin = request.nextUrl.origin;
    const host = request.headers.get('host') || '';
    const row = await consumeSsoToken(request.nextUrl.searchParams.get('token'), 'to_site', host);

    // 실패하면 오류 화면 대신 일반 로그인으로 (잠시 SSO를 다시 묻지 않음)
    const giveUp = (path: string) => {
        const res = NextResponse.redirect(new URL(safeRedirect(path), origin));
        res.cookies.set(SSO_NONE_COOKIE, '1', { path: '/', maxAge: SSO_NONE_MAX_AGE, sameSite: 'lax', secure: true });
        return res;
    };
    if (!row) return giveUp('/');

    const response = NextResponse.redirect(new URL(safeRedirect(row.final_path), origin));
    const ok = await establishSession(request, response, row.otp_hash, row.user_id);
    return ok ? response : giveUp(row.final_path);
}
