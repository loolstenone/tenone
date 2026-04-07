import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createHitSession } from '@/lib/supabase/hit';
import { gateApi } from '@/lib/hit/membership-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hitAResultId, memberId } = body;

    if (!hitAResultId) {
      return errorResponse('hitAResultId는 필수입니다.', 400);
    }

    // 멤버십 게이트 — Deep 모듈은 Premium 이상 필요
    const gateResult = await gateApi(memberId, 'HIT_DEEP');
    if (gateResult) return gateResult;

    const session = await createHitSession('A', memberId);

    return successResponse({
      sessionId: session.id,
      sessionToken: session.session_token,
      hitAResultId,
    }, 201);
  } catch (error) {
    console.error('[HIT A Deep Session] 생성 오류:', error);
    const message = error instanceof Error ? error.message : '심화 세션 생성 실패';
    return errorResponse(message, 500);
  }
}
