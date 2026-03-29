/**
 * Kakao 메시지 전송 API
 *
 * POST: 카카오톡 메시지 전송 (나에게 보내기 / 친구에게 보내기)
 */

import { NextRequest } from 'next/server';
import {
  sendMessageToMe,
  sendMessageToFriend,
  createTextMessage,
  createFeedMessage,
  isKakaoConfigured,
  type KakaoTextMessage,
  type KakaoFeedMessage,
} from '@/lib/integrations/kakao';
import { createClient } from '@/lib/supabase/server';
import { errorResponse, successResponse } from '@/lib/supabase/api-utils';

export async function POST(request: NextRequest) {
  try {
    // 설정 확인
    if (!isKakaoConfigured()) {
      return errorResponse('Kakao API가 설정되지 않았습니다. KAKAO_REST_API_KEY를 확인하세요.', 503);
    }

    // 인증 확인
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse('인증되지 않은 요청입니다.', 401);
    }

    const body = await request.json();
    const {
      action = 'send_to_me',
      messageType = 'text',
      brandId = 'default',
      // 텍스트 메시지 필드
      text,
      linkUrl,
      buttonTitle,
      // 피드 메시지 필드
      title,
      description,
      imageUrl,
      buttons,
      // 친구에게 보내기 필드
      receiverUuids,
    } = body;

    // Kakao access_token 조회 (사용자가 카카오 로그인으로 인증한 경우)
    const { data: integration } = await supabase
      .from('wio_integrations')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('provider', 'kakao')
      .eq('brand_id', brandId)
      .single();

    if (!integration?.access_token) {
      return errorResponse(
        'Kakao 연동이 필요합니다. 카카오 로그인으로 인증해주세요.',
        401
      );
    }

    const kakaoToken = integration.access_token as string;

    // 메시지 템플릿 생성
    let message: KakaoTextMessage | KakaoFeedMessage;

    if (messageType === 'feed') {
      if (!title) {
        return errorResponse('피드 메시지에는 title이 필요합니다.', 400);
      }
      message = createFeedMessage(title, description, imageUrl, linkUrl, buttons);
    } else {
      if (!text) {
        return errorResponse('텍스트 메시지에는 text가 필요합니다.', 400);
      }
      message = createTextMessage(text, linkUrl, buttonTitle);
    }

    // 메시지 전송
    let result;

    switch (action) {
      case 'send_to_me':
        result = await sendMessageToMe(kakaoToken, message);
        break;

      case 'send_to_friends':
        if (!receiverUuids?.length) {
          return errorResponse('receiverUuids가 필요합니다.', 400);
        }
        result = await sendMessageToFriend(kakaoToken, receiverUuids, message);
        break;

      default:
        return errorResponse(
          `지원하지 않는 action: ${action}. (send_to_me, send_to_friends 중 선택)`,
          400
        );
    }

    if (!result.success) {
      return errorResponse(result.message || '메시지 전송에 실패했습니다.', 500);
    }

    return successResponse({
      success: true,
      message: '메시지가 전송되었습니다.',
      detail: result,
    });
  } catch (err) {
    console.error('Kakao 메시지 전송 오류:', err);
    return errorResponse(
      err instanceof Error ? err.message : '메시지 전송 중 오류가 발생했습니다.',
      500
    );
  }
}
