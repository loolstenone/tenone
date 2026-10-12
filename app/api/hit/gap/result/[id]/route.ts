import { NextRequest } from 'next/server';
import { canReadHitResult, stripHitResult } from '@/lib/hit/result-access';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitGapResult } from '@/lib/supabase/hit';
import { createAdminClient } from '@/lib/supabase/admin';
import { selectStageModules, loadReportModules } from '@/lib/hit/stage-report-modules';

/** GET /api/hit/gap/result/[id] — 본인·직원만. 결과 점수 + 규칙 기반 리포트 모듈 (lib/hit/stage-report-modules.ts) */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await getHitGapResult(id);
    if (!result) return errorResponse('결과를 찾을 수 없습니다.', 404);
    if (!(await canReadHitResult(req, result))) return errorResponse('결과를 찾을 수 없습니다.', 404);

    const moduleIds = selectStageModules('gap', result);
    const reportModules = await loadReportModules(createAdminClient(), moduleIds);
    // 관리자 전용 값(faking_flag)은 응답에서 제거
    const { faking_flag: _f, ...safe } = result as Record<string, unknown>;
    void _f;
    return successResponse({ ...stripHitResult(safe), report_modules: reportModules, modules_used: moduleIds });
  } catch (error) {
    console.error('[HIT GAP Result] 조회 오류:', error);
    return errorResponse(error instanceof Error ? error.message : '결과 조회 실패', 500);
  }
}
