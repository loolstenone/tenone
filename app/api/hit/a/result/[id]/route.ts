import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitAResult, getReportModules } from '@/lib/supabase/hit';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await getHitAResult(id);
    if (!result) {
      return errorResponse('결과를 찾을 수 없습니다.', 404);
    }

    // 모듈 콘텐츠 로드 (modules_used가 있으면)
    let reportModules: Record<string, { title: string; content: string }> | null = null;
    if (result.modules_used && result.modules_used.length > 0) {
      try {
        const modules = await getReportModules(result.modules_used);
        reportModules = {};
        for (const m of modules) {
          reportModules[m.id] = { title: m.title, content: m.content };
        }
      } catch {}
    }

    return successResponse({ ...result, report_modules: reportModules });
  } catch (error) {
    console.error('[HIT A Result] 조회 오류:', error);
    const message = error instanceof Error ? error.message : '결과 조회 실패';
    return errorResponse(message, 500);
  }
}
