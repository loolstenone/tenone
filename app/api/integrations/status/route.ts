/**
 * 연동 상태 조회 API
 *
 * GET: 현재 사용자의 모든 외부 연동 상태 반환
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isGoogleCalendarConfigured, getAuthUrl } from '@/lib/integrations/google-calendar';
import { isKakaoConfigured } from '@/lib/integrations/kakao';
import { isSlackWebhookConfigured, isSlackOAuthConfigured } from '@/lib/integrations/slack';

interface IntegrationStatus {
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  errorCount?: number;
  errorMessage?: string;
  authUrl?: string;
  webhookUrl?: string;
  configured: boolean; // 환경변수 설정 여부
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 환경변수 기반 설정 상태
    const configStatus: Record<string, IntegrationStatus> = {
      google_calendar: {
        status: 'disconnected',
        configured: isGoogleCalendarConfigured(),
        authUrl: isGoogleCalendarConfigured() ? getAuthUrl(user?.id) : undefined,
      },
      kakao: {
        status: 'disconnected',
        configured: isKakaoConfigured(),
      },
      slack: {
        status: 'disconnected',
        configured: isSlackWebhookConfigured() || isSlackOAuthConfigured(),
      },
      github: { status: 'disconnected', configured: false },
      notion: { status: 'disconnected', configured: false },
      figma: { status: 'disconnected', configured: false },
    };

    // 로그인한 사용자가 있으면 DB에서 연동 상태 조회
    if (user) {
      const { data: userIntegrations } = await supabase
        .from('wio_integrations')
        .select('provider, status, connected_at, updated_at, error_count, error_message')
        .eq('user_id', user.id);

      if (userIntegrations) {
        for (const int of userIntegrations) {
          const provider = int.provider as string;
          if (configStatus[provider]) {
            configStatus[provider] = {
              ...configStatus[provider],
              status: (int.status as 'connected' | 'disconnected' | 'error') || 'disconnected',
              lastSync: (int.updated_at as string) || undefined,
              errorCount: (int.error_count as number) || 0,
              errorMessage: (int.error_message as string) || undefined,
            };
          }
        }
      }
    }

    return NextResponse.json({ integrations: configStatus });
  } catch (err) {
    console.error('연동 상태 조회 오류:', err);
    // 오류 시에도 기본 상태 반환 (페이지가 깨지지 않도록)
    return NextResponse.json({
      integrations: {
        google_calendar: { status: 'disconnected', configured: false },
        kakao: { status: 'disconnected', configured: false },
        slack: { status: 'disconnected', configured: false },
        github: { status: 'disconnected', configured: false },
        notion: { status: 'disconnected', configured: false },
        figma: { status: 'disconnected', configured: false },
      },
    });
  }
}
