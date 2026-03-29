/**
 * Slack 이벤트 수신 웹훅
 *
 * POST: Slack에서 이벤트 수신 (멘션, 메시지 등)
 * - URL verification challenge 처리
 * - 서명 검증으로 보안 확보
 */

import { NextRequest } from 'next/server';
import { verifySlackSignature, handleChallenge, type SlackEvent } from '@/lib/integrations/slack';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signingSecret = process.env.SLACK_SIGNING_SECRET;

    // 서명 검증 (signing secret이 설정된 경우)
    if (signingSecret) {
      const timestamp = request.headers.get('x-slack-request-timestamp') || '';
      const signature = request.headers.get('x-slack-signature') || '';

      if (!timestamp || !signature) {
        return errorResponse('Slack 서명 헤더가 누락되었습니다.', 401);
      }

      const isValid = verifySlackSignature(signingSecret, timestamp, rawBody, signature);
      if (!isValid) {
        return errorResponse('Slack 서명 검증 실패', 401);
      }
    }

    const event: SlackEvent = JSON.parse(rawBody);

    // URL verification (Slack 앱 설정 시 최초 1회)
    const challenge = handleChallenge(event);
    if (challenge) {
      return successResponse({ challenge });
    }

    // 이벤트 처리
    if (event.event) {
      const { type, text, user, channel } = event.event;

      // 이벤트 타입별 처리
      switch (type) {
        case 'app_mention':
          // 앱이 멘션됐을 때
          console.log(`[Slack] 멘션 수신 - user: ${user}, channel: ${channel}, text: ${text}`);
          // TODO: 멘션 이벤트를 WIO 알림으로 전환
          break;

        case 'message':
          // DM 또는 채널 메시지
          console.log(`[Slack] 메시지 수신 - user: ${user}, channel: ${channel}`);
          // TODO: 필요 시 메시지 이벤트 처리
          break;

        default:
          console.log(`[Slack] 미처리 이벤트 타입: ${type}`);
      }
    }

    // Slack은 3초 이내 200 응답을 기대
    return successResponse({ ok: true });
  } catch (err) {
    console.error('Slack 웹훅 처리 오류:', err);
    // Slack 재전송 방지를 위해 200 반환
    return successResponse({ ok: true, error: 'internal_error' });
  }
}
