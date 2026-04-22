/**
 * Gmail OAuth 시작
 * GET /api/auth/gmail/start
 *
 * Google OAuth 인증 페이지로 리디렉트.
 * 인증 완료 후 /api/auth/gmail/callback으로 돌아옴.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/gmail/client';

export async function GET(request: NextRequest) {
    const redirectUri = `https://tenone.biz/api/auth/gmail/callback`;
    const authUrl = getAuthUrl(redirectUri);

    return NextResponse.redirect(authUrl);
}
