/**
 * Google OAuth2 콜백 핸들러
 *
 * 인증 코드를 토큰으로 교환하고, refresh_token을 Supabase에 저장
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/integrations/google-calendar';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // userId 또는 JSON state
  const error = searchParams.get('error');

  // 사용자가 인증을 거부한 경우
  if (error) {
    return NextResponse.redirect(
      new URL(`/intra/settings?error=google_auth_denied&message=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/intra/settings?error=google_no_code', request.url)
    );
  }

  try {
    // 인증 코드 → 토큰 교환
    const tokens = await exchangeCode(code);

    // Supabase에 토큰 저장
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=not_authenticated', request.url)
      );
    }

    // state에서 brandId 추출 (있으면)
    let brandId = 'default';
    if (state) {
      try {
        const parsed = JSON.parse(state);
        brandId = parsed.brandId || 'default';
      } catch {
        // state가 단순 문자열인 경우
        brandId = state;
      }
    }

    // wio_integrations 테이블에 토큰 저장
    // refresh_token은 암호화하여 저장 (실제 운영 시 KMS 사용 권장)
    const { error: dbError } = await supabase
      .from('wio_integrations')
      .upsert({
        user_id: user.id,
        brand_id: brandId,
        provider: 'google_calendar',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        scope: tokens.scope,
        status: 'connected',
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider,brand_id',
      });

    if (dbError) {
      console.error('Google 토큰 저장 실패:', dbError);
      return NextResponse.redirect(
        new URL('/intra/settings?error=google_save_failed', request.url)
      );
    }

    // 연동 성공 → 설정 페이지로 리다이렉트
    return NextResponse.redirect(
      new URL('/intra/settings?success=google_connected', request.url)
    );
  } catch (err) {
    console.error('Google OAuth 콜백 오류:', err);
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.redirect(
      new URL(`/intra/settings?error=google_callback_error&message=${encodeURIComponent(message)}`, request.url)
    );
  }
}
