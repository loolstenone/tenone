import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitSession, updateHitSession, upsertHitResponse } from '@/lib/supabase/hit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, questionId, module, questionIndex, selectedOption, optionValue, responseTimeMs } = body;

    if (!sessionToken || !questionId || !module) {
      return errorResponse('sessionToken, questionId, module은 필수입니다.', 400);
    }

    // optionValue 검증: 1-7 Likert 또는 subscale:value 형식
    const numValue = parseInt(optionValue, 10);
    if (isNaN(numValue) || numValue < 1 || numValue > 7) {
      const parts = optionValue.split(':');
      if (parts.length < 2) {
        return errorResponse('optionValue는 1-7 범위이거나 subscale:value 형식이어야 합니다.', 400);
      }
    }

    const session = await getHitSession(sessionToken);
    if (!session) {
      return errorResponse('세션을 찾을 수 없습니다.', 404);
    }

    if (session.status !== 'in_progress') {
      return errorResponse('이미 완료된 세션입니다.', 400);
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
    console.error('[HIT F Response] 저장 오류:', error);
    const message = error instanceof Error ? error.message : '응답 저장 실패';
    return errorResponse(message, 500);
  }
}
