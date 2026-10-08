import { NextRequest, NextResponse } from 'next/server';
import { safeRedirect } from '@/lib/login-href';
import { SSO_NONE_COOKIE, SSO_NONE_MAX_AGE } from '@/lib/sso-server';

/**
 * SSO Return — 사이트에서 실행. 허브에 로그인 기록이 없을 때 돌아오는 곳.
 * 잠시 SSO를 다시 묻지 않도록 표시하고 원래 경로로 → LoginModal이 일반 로그인 화면을 연다.
 */
export async function GET(request: NextRequest) {
    const final_path = safeRedirect(request.nextUrl.searchParams.get('final'));
    const res = NextResponse.redirect(new URL(final_path, request.nextUrl.origin));
    res.cookies.set(SSO_NONE_COOKIE, '1', { path: '/', maxAge: SSO_NONE_MAX_AGE, sameSite: 'lax', secure: true });
    return res;
}
