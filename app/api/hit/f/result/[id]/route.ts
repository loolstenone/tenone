import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitFResult } from '@/lib/supabase/hit';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await getHitFResult(id);
    if (!result) {
      return errorResponse('결과를 찾을 수 없습니다.', 404);
    }

    return successResponse(result);
  } catch (error) {
    console.error('[HIT F Result] 조회 오류:', error);
    const message = error instanceof Error ? error.message : '결과 조회 실패';
    return errorResponse(message, 500);
  }
}
