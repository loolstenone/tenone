import { NextRequest } from 'next/server';
import { requireMember } from '@/lib/api-guard';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { startOrResumeHitSession, getLatestHitAResult, getResumeInfo } from '@/lib/supabase/hit';
import { gateApi } from '@/lib/hit/membership-server';

/** GET — 로그인 회원의 진행 중 HIT C 세션 (이어서 하기 제안용, 비회원은 null) */
export async function GET(request: NextRequest) {
  return successResponse(await getResumeInfo(request, 'C'));
}

/** POST /api/hit/c/session — 진입(대학생·사회 초년) 검사 세션. 회원 전용, HIT A 완료 필수. 진행 중이면 이어서, {restart:true}면 새로 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const auth = await requireMember(request);
    if (auth instanceof Response) return auth;
    const memberId = auth.memberId;

    const aResult = await getLatestHitAResult(memberId);
    if (!aResult) return errorResponse('HIT - Archetype을 먼저 완료해야 합니다.', 400);

    const gateResult = await gateApi(memberId, 'HIT_LAYER_ONE');
    if (gateResult) return gateResult;

    const session = await startOrResumeHitSession('C', memberId, body?.restart === true);
    return successResponse({ sessionId: session.sessionId, sessionToken: session.sessionToken, resumed: session.resumed }, 201);
  } catch (error) {
    console.error('[HIT C Session] 생성 오류:', error);
    return errorResponse('세션을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.', 500);
  }
}
