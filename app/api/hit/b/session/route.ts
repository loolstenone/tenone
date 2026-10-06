import { NextRequest } from 'next/server';
import { getApiUser } from '@/lib/api-guard';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createHitSession, getLatestHitAResult } from '@/lib/supabase/hit';
import { gateApi } from '@/lib/hit/membership-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hitAResultId } = body;
    // 회원 식별은 로그인 세션으로만 — body의 memberId는 신뢰하지 않음
    const memberId = (await getApiUser(request))?.memberId ?? undefined;

    // HIT A 완료 확인
    if (hitAResultId) {
      // hitAResultId가 제공된 경우 직접 확인
      const { createAdminClient: createClient } = await import('@/lib/supabase/admin');
      const supabase = createClient();
      const { data: aResult } = await supabase
        .from('hit_a_results')
        .select('id')
        .eq('id', hitAResultId)
        .maybeSingle();

      if (!aResult) {
        return errorResponse('HIT A 결과를 찾을 수 없습니다. 먼저 HIT A를 완료해주세요.', 400);
      }
    } else {
      // memberId로 최근 HIT A 결과 검색
      const aResult = await getLatestHitAResult(memberId);
      if (!aResult) {
        return errorResponse('HIT A를 먼저 완료해야 합니다.', 400);
      }
    }

    const gateResult = await gateApi(memberId, 'HIT_LAYER_ONE');
    if (gateResult) return gateResult;

    const session = await createHitSession('B', memberId);

    return successResponse({
      sessionId: session.id,
      sessionToken: session.session_token,
    }, 201);
  } catch (error) {
    console.error('[HIT B Session] 생성 오류:', error);
    const message = error instanceof Error ? error.message : '세션 생성 실패';
    return errorResponse(message, 500);
  }
}
