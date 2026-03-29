/**
 * Slack 메시지 전송 API
 *
 * POST: Slack 채널에 메시지 전송
 * - Webhook 방식 (간단한 알림)
 * - Bot Token 방식 (채널 지정 가능)
 */

import { NextRequest } from 'next/server';
import {
  sendWebhookMessage,
  sendChannelMessage,
  forwardNotification,
  createSimpleMessage,
  createSectionMessage,
  isSlackWebhookConfigured,
} from '@/lib/integrations/slack';
import { createClient } from '@/lib/supabase/server';
import { errorResponse, successResponse } from '@/lib/supabase/api-utils';

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse('인증되지 않은 요청입니다.', 401);
    }

    const body = await request.json();
    const {
      method = 'webhook', // 'webhook' | 'bot'
      brandId = 'default',
      // 공통
      channel,
      text,
      // webhook 전용
      webhookUrl,
      // bot 전용 (DB에서 토큰 조회)
      // 알림 포워딩
      notification,
      // 섹션 메시지
      title,
      fields,
    } = body;

    // ─── Webhook 방식 ─────────────────────────────────

    if (method === 'webhook') {
      if (!isSlackWebhookConfigured() && !webhookUrl) {
        return errorResponse(
          'Slack Webhook이 설정되지 않았습니다. SLACK_WEBHOOK_URL을 확인하세요.',
          503
        );
      }

      let result;

      if (notification) {
        // 알림 포워딩 모드
        result = await forwardNotification(notification, webhookUrl);
      } else if (title && fields) {
        // 섹션 메시지 모드
        const message = createSectionMessage(title, fields);
        result = await sendWebhookMessage(message, webhookUrl);
      } else if (text) {
        // 단순 텍스트 모드
        const message = createSimpleMessage(text);
        result = await sendWebhookMessage(message, webhookUrl);
      } else {
        return errorResponse('text, notification, 또는 title+fields가 필요합니다.', 400);
      }

      if (!result.success) {
        return errorResponse(result.error || 'Slack 전송에 실패했습니다.', 500);
      }

      return successResponse({ success: true, method: 'webhook' });
    }

    // ─── Bot Token 방식 ───────────────────────────────

    if (method === 'bot') {
      if (!channel) {
        return errorResponse('Bot 방식은 channel이 필요합니다.', 400);
      }

      // DB에서 Bot Token 조회
      const { data: integration } = await supabase
        .from('wio_integrations')
        .select('access_token')
        .eq('user_id', user.id)
        .eq('provider', 'slack')
        .eq('brand_id', brandId)
        .single();

      if (!integration?.access_token) {
        return errorResponse(
          'Slack 워크스페이스 연동이 필요합니다. Slack OAuth로 연결해주세요.',
          401
        );
      }

      const botToken = integration.access_token as string;

      if (!text) {
        return errorResponse('text가 필요합니다.', 400);
      }

      const result = await sendChannelMessage(botToken, channel, { text });

      if (!result.ok) {
        return errorResponse(result.error || 'Slack 채널 메시지 전송 실패', 500);
      }

      return successResponse({
        success: true,
        method: 'bot',
        channel: result.channel,
        ts: result.ts,
      });
    }

    return errorResponse(`지원하지 않는 method: ${method}. (webhook, bot 중 선택)`, 400);
  } catch (err) {
    console.error('Slack 메시지 전송 오류:', err);
    return errorResponse(
      err instanceof Error ? err.message : '메시지 전송 중 오류가 발생했습니다.',
      500
    );
  }
}
