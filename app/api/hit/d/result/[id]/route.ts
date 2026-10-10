import { NextRequest } from 'next/server';
import { canReadHitResult, stripHitResult } from '@/lib/hit/result-access';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitDResult } from '@/lib/supabase/hit';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await getHitDResult(id);
    if (!result) {
      return errorResponse('결과를 찾을 수 없습니다.', 404);
    }
    // 회원 결과는 본인·직원만 (2026-10-11)
    if (!(await canReadHitResult(req, result))) return errorResponse('결과를 찾을 수 없습니다.', 404);

    return successResponse(stripHitResult(result));
  } catch (error) {
    console.error('[HIT D Result] 조회 오류:', error);
    const message = error instanceof Error ? error.message : '결과 조회 실패';
    return errorResponse(message, 500);
  }
}
