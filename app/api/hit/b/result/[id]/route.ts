import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitBResult } from '@/lib/supabase/hit';
import { selectBModules } from '@/lib/hit/report-assembler';
import { createClient as createServerClient } from '@supabase/supabase-js';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await getHitBResult(id);
    if (!result) {
      return errorResponse('결과를 찾을 수 없습니다.', 404);
    }

    // 모듈 선택
    const modulesUsed = selectBModules({
      personalityScores: result.personality_scores || {},
      hollandCode: result.holland_code || '',
      competencyCommon: result.competency_common || {},
      readinessGrade: result.readiness_grade || 'D',
    });

    // 모듈 콘텐츠 조회
    let reportModules: Record<string, { title: string; content: string }> = {};
    if (modulesUsed.length > 0) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const sb = createServerClient(supabaseUrl, supabaseKey);
        const { data: mods } = await sb
          .from('hit_report_modules')
          .select('id, title, content')
          .in('id', modulesUsed);

        if (mods) {
          mods.forEach((m: { id: string; title: string; content: string }) => {
            // 점수 플레이스홀더 치환
            let title = m.title;
            let content = m.content;
            // {score} 치환은 개별 모듈마다 다르므로 제거
            title = title.replace(/\{score\}/g, '').replace(/\{[^}]+\}/g, '');
            content = content.replace(/\{score\}/g, '').replace(/\{[^}]+\}/g, '');
            reportModules[m.id] = { title: title.trim(), content: content.trim() };
          });
        }
      } catch {}
    }

    return successResponse({ ...result, report_modules: reportModules, modules_used: modulesUsed });
  } catch (error) {
    console.error('[HIT B Result] 조회 오류:', error);
    const message = error instanceof Error ? error.message : '결과 조회 실패';
    return errorResponse(message, 500);
  }
}
