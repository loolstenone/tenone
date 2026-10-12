import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, updateHitSession, upsertHitResponse } from '@/lib/supabase/hit';
import { requireMember } from '@/lib/api-guard';
import { HIT_A_UF_MODULE } from '@/lib/hit/a-modules';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, questionId, module, questionIndex, selectedOption, optionValue, responseTimeMs } = body;

    if (!sessionToken || !questionId || !module) {
      return errorResponse('sessionToken, questionId, module은 필수입니다.', 400);
    }

    const session = await getHitSession(sessionToken);
    if (!session) {
      return errorResponse('세션을 찾을 수 없습니다.', 404);
    }
    // 본인 세션에만 저장 — 토큰만 알면 남의 검사에 답을 쓸 수 있던 구멍 (2026-10-12)
    const auth = await requireMember(request);
    if (auth instanceof Response) return auth;
    if (session.member_id !== auth.memberId) return errorResponse('세션을 찾을 수 없습니다.', 404);

    if (session.status !== 'in_progress') {
      return errorResponse('이미 완료된 세션입니다.', 400);
    }

    // UF 기저요인은 회원 세션만 (lib/hit/a-modules.ts)
    if (module === HIT_A_UF_MODULE && !session.member_id) {
      return errorResponse('회원만 응답할 수 있는 문항입니다.', 403);
    }

    await upsertHitResponse({
      sessionId: session.id,
      module,
      questionId,
      questionIndex,
      selectedOption,
      optionValue,
      responseTimeMs,
    });

    await updateHitSession(sessionToken, {
      current_module: module,
      current_index: questionIndex,
    });

    return successResponse({ success: true });
  } catch (error) {
    console.error('[HIT A Response] 저장 오류:', error);
    return errorResponse('응답 저장 실패', 500);
  }
}
