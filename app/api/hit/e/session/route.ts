import { NextRequest } from 'next/server';
import { requireMember } from '@/lib/api-guard';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createHitSession, getLatestHitAResult } from '@/lib/supabase/hit';
import { createAdminClient as createClient } from '@/lib/supabase/admin';
import { gateApi } from '@/lib/hit/membership-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hitAResultId } = body;
    // HIT 검사는 회원 전용 (2026-10-12) — 회원 식별은 로그인 세션으로만, body의 memberId는 신뢰하지 않음
    const auth = await requireMember(request);
    if (auth instanceof Response) return auth;
    const memberId = auth.memberId;

    // HIT A 완료 확인 — 본인 것만. ?a= 가 없으면 본인 최신 A (2026-10-12)
    const supabase = createClient();
    let aResult: { id: string } | null = null;
    if (hitAResultId) {
      const { data } = await supabase.from('hit_a_results').select('id').eq('id', hitAResultId).eq('member_id', memberId).maybeSingle();
      aResult = data;
    }
    if (!aResult) aResult = await getLatestHitAResult(memberId);

    if (!aResult) {
      return errorResponse('HIT - Archetype 결과를 찾을 수 없습니다. 먼저 HIT - Archetype을 완료해주세요.', 400);
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
