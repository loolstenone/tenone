import { NextRequest } from 'next/server';
import { requireMember } from '@/lib/api-guard';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createHitSession, getLatestHitAResult } from '@/lib/supabase/hit';
import { gateApi } from '@/lib/hit/membership-server';

/** POST /api/hit/c/session — 진입(대학생·사회 초년) 검사 세션. 회원 전용, HIT A 완료 필수 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireMember(request);
    if (auth instanceof Response) return auth;
    const memberId = auth.memberId;

    const aResult = await getLatestHitAResult(memberId);
    if (!aResult) return errorResponse('HIT A를 먼저 완료해야 합니다.', 400);

    const gateResult = await gateApi(memberId, 'HIT_LAYER_ONE');
    if (gateResult) return gateResult;

    const session = await createHitSession('C', memberId);
    return successResponse({ sessionId: session.id, sessionToken: session.session_token }, 201);
  } catch (error) {
    console.error('[HIT C Session] 생성 오류:', error);
    return errorResponse(error instanceof Error ? error.message : '세션 생성 실패', 500);
  }
}
