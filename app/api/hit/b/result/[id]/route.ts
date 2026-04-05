import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitBResultFull } from '@/lib/supabase/hit';
import { selectBModules } from '@/lib/hit/report-assembler';
import { createClient as createServerClient } from '@supabase/supabase-js';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const resultFull = await getHitBResultFull(id);
    if (!resultFull) {
      return errorResponse('결과를 찾을 수 없습니다.', 404);
    }

    // 클라이언트 응답에서 dark_triad + alert 필드 제거
    const { alert_n1, alert_m1, alert_p1, alert_level, ...result } = resultFull;
    if (result.personality_scores) {
      const safe = { ...result.personality_scores };
      delete safe.narcissism_dark;
      delete safe.psychopathy_dark;
      delete safe.machiavellianism_dark;
      result.personality_scores = safe;
    }
    if (result.dark_triad_flags) {
      result.dark_triad_flags = {}; // 빈 객체로 전달
    }

    // 모듈 선택 (원본 점수로)
    const modulesUsed = selectBModules({
      personalityScores: resultFull.personality_scores || {},
      hollandCode: resultFull.holland_code || '',
      competencyCommon: resultFull.competency_common || {},
      readinessGrade: resultFull.readiness_grade || 'D',
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
