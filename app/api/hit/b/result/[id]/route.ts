import { NextRequest } from 'next/server';
import { canReadHitResult, stripHitResult } from '@/lib/hit/result-access';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitBResultFull } from '@/lib/supabase/hit';
import { selectBModules, selectBTrackModules } from '@/lib/hit/report-assembler';
import { createAdminClient } from '@/lib/supabase/admin';

/** GET /api/hit/b/result/[id] — 본인·직원만. 리포트 모듈(COMP-*)은 핵심역량 점수로 선택 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await getHitBResultFull(id);
    if (!result) return errorResponse('결과를 찾을 수 없습니다.', 404);
    if (!(await canReadHitResult(req, result))) return errorResponse('결과를 찾을 수 없습니다.', 404);

    const modulesUsed = [...selectBModules({ competencyCommon: result.competency_common || {} }), ...selectBTrackModules(result.competency_track_scores)];
    const reportModules: Record<string, { title: string; content: string }> = {};
    if (modulesUsed.length > 0) {
      try {
        const { data: mods } = await createAdminClient().from('hit_report_modules').select('id, title, content').in('id', modulesUsed);
        for (const m of (mods ?? []) as { id: string; title: string; content: string }[]) {
          reportModules[m.id] = {
            title: m.title.replace(/\{[^}]+\}/g, '').replace(/\s*%\s*/g, ' ').replace(/\s+/g, ' ').trim(),
            content: m.content.replace(/\{[^}]+\}/g, '').trim(),
          };
        }
      } catch { /* 모듈 없이도 결과는 표시 */ }
    }

    // 트랙 표시명 (hit_competency_tracks가 원천)
    let trackName: string | null = null;
    if (result.competency_track) {
      const { data: t } = await createAdminClient().from('hit_competency_tracks').select('name_ko').eq('id', result.competency_track).maybeSingle();
      trackName = (t?.name_ko as string | undefined) ?? null;
    }

    // 관리자 전용 컬럼은 응답에서 제거 (옛 alert_*·dark_triad_flags 포함)
    const { alert_n1: _a1, alert_m1: _a2, alert_p1: _a3, alert_level: _a4, dark_triad_flags: _d, ...safe } = result;
    void _a1; void _a2; void _a3; void _a4; void _d;
    return successResponse({ ...stripHitResult(safe), track_name: trackName, report_modules: reportModules, modules_used: modulesUsed });
  } catch (error) {
    console.error('[HIT B Result] 조회 오류:', error);
    return errorResponse('결과 조회 실패', 500);
  }
}
