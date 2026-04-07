import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createHitSession } from '@/lib/supabase/hit';
import { createClient } from '@/lib/supabase/client';
import { gateApi } from '@/lib/hit/membership';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, hitAResultId } = body;

    // HIT A 완료 확인 (필수)
    if (!hitAResultId) {
      return errorResponse('hitAResultId는 필수입니다. HIT A를 먼저 완료해주세요.', 400);
    }

    const supabase = createClient();
    const { data: aResult } = await supabase
      .from('hit_a_results')
      .select('id')
      .eq('id', hitAResultId)
      .maybeSingle();

    if (!aResult) {
      return errorResponse('HIT A 결과를 찾을 수 없습니다. 먼저 HIT A를 완료해주세요.', 400);
    }

    const gateResult = await gateApi(memberId, 'HIT_LAYER_ONE');
    if (gateResult) return gateResult;

    const session = await createHitSession('E', memberId);

    return successResponse({
      sessionId: session.id,
      sessionToken: session.session_token,
    }, 201);
  } catch (error) {
    console.error('[HIT E Session] 생성 오류:', error);
    const message = error instanceof Error ? error.message : '세션 생성 실패';
    return errorResponse(message, 500);
  }
}
