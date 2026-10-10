/**
 * Gmail OAuth 시작 (뉴스레터 수신용 계정 연결) — 직원 전용
 * GET /api/auth/gmail/start
 *
 * CSRF 방지 state를 쿠키(.tenone.biz)에 두고 Google 인증 페이지로 보낸다.
 * 인증 완료 후 /api/auth/gmail/callback으로 돌아옴 (Google 콘솔에 등록된 redirect URI = tenone.biz).
 */
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getAuthUrl, GMAIL_REDIRECT_URI, GMAIL_STATE_COOKIE } from '@/lib/gmail/client';
import { requireStaff } from '@/lib/api-guard';
import { getCookieDomain } from '@/lib/domain-registry';

export async function GET(request: NextRequest) {
    const auth = await requireStaff(request);
    if (auth instanceof NextResponse) return auth;

    const state = randomBytes(24).toString('base64url');
    const res = NextResponse.redirect(getAuthUrl(GMAIL_REDIRECT_URI, state));
    res.cookies.set(GMAIL_STATE_COOKIE, state, {
        httpOnly: true, secure: true, sameSite: 'lax', path: '/api/auth/gmail', maxAge: 600,
        domain: getCookieDomain(request.nextUrl.hostname),
    });
    return res;
}
