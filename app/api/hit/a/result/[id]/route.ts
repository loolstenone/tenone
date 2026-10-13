import { NextRequest } from 'next/server';
import { canReadHitResult, stripHitResult } from '@/lib/hit/result-access';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { getHitAResult, getReportModules } from '@/lib/supabase/hit';
import { selectModules } from '@/lib/hit/report-assembler';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await getHitAResult(id);
    if (!result) {
      return errorResponse('결과를 찾을 수 없습니다.', 404);
    }
    // 회원 결과는 본인·직원만 (2026-10-11)
    if (!(await canReadHitResult(req, result))) return errorResponse('결과를 찾을 수 없습니다.', 404);

    // 해설 모듈은 읽을 때마다 점수로 다시 고른다 (C~G와 같은 방식, 2026-10-12) — 선택 규칙을 고치면 지난 결과에도 바로 반영.
    // 저장된 modules_used는 채점 당시 기록으로만 남긴다 (MBTI 방향·원칙 수호 누락 결함이 저장본에 남아 있었음)
    const n = (v: unknown) => Number(v ?? 0);
    const nn = (v: unknown) => (v == null ? null : Number(v));
    const UF_KEYS = ['uf_sibling', 'uf_parent', 'uf_family', 'uf_peer', 'uf_self', 'uf_temperament', 'uf_economic', 'uf_trauma', 'uf_cultural'] as const;
    let modulesUsed: string[] = result.modules_used ?? [];
    try {
      modulesUsed = selectModules({
        discD: n(result.disc_d_score), discI: n(result.disc_i_score), discS: n(result.disc_s_score), discC: n(result.disc_c_score),
        discPrimary: result.disc_primary, discSubtype: result.disc_subtype, mbtiType: result.mbti_type,
        mbtiEScore: n(result.mbti_e_score), mbtiSScore: n(result.mbti_s_score), mbtiTScore: n(result.mbti_t_score), mbtiJScore: n(result.mbti_j_score),
        sPowerScores: (result.s_power_scores ?? undefined) as Record<string, number> | undefined,
        apTop3Code: result.ap_top3_code ?? null,
        chScores: result.ch_integrity != null ? {
          integrity: n(result.ch_integrity), relational: n(result.ch_relational), emotional: n(result.ch_emotional),
          ethics: n(result.ch_ethics), growth: n(result.ch_growth),
        } : undefined,
        // 영역별 null = 해당 없음·응답 부족 → 해설 생략. 형제 영역을 건너뛴(외동) 결과도 나머지 영역은 나가야 한다 (2026-10-13)
        ufScores: UF_KEYS.some(k => result[k] != null) || result.uf_trauma_exposure != null ? {
          sibling: nn(result.uf_sibling), parent: nn(result.uf_parent), family: nn(result.uf_family), peer: nn(result.uf_peer), self: nn(result.uf_self),
          temperament: nn(result.uf_temperament), economic: nn(result.uf_economic), trauma: nn(result.uf_trauma), cultural: nn(result.uf_cultural),
        } : undefined,
        ufTraumaExposure: (result.uf_trauma_exposure as boolean | null | undefined) ?? null,
      });
    } catch { /* 저장본으로 대체 */ }

    let reportModules: Record<string, { title: string; content: string }> | null = null;
    if (modulesUsed.length > 0) {
      try {
        const modules = await getReportModules(modulesUsed);
        // 선택 규칙 순서대로 (성격 E→S→T→J, 강점 1·2·3위) — DB 반환 순서를 쓰면 화면 순서가 섞였다 (2026-10-13)
        const byId = new Map(modules.map(m => [m.id, m]));
        reportModules = {};
        for (const id of modulesUsed) {
          const m = byId.get(id);
          if (m) reportModules[id] = { title: m.title, content: m.content };
        }
      } catch {}
    }

    return successResponse({ ...stripHitResult(result), report_modules: reportModules });
  } catch (error) {
    console.error('[HIT A Result] 조회 오류:', error);
    return errorResponse('결과 조회 실패', 500); // 내부 오류 문구는 로그로만 (2026-10-12)
  }
}
