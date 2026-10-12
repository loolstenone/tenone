import type { HitBResult } from '@/types/hit';

/** /api/hit/b/result/[id] 응답 → 화면 모델 (결과·보고서 페이지 공용) */
export function mapHitBResult(data: Record<string, unknown>): HitBResult & { trackName: string } {
  const matrix = data.interest_efficacy_matrix as HitBResult['matrix'] | null | undefined;
  return {
    id: String(data.id),
    sessionId: String(data.session_id),
    memberId: null,
    hitAResultId: (data.hit_a_result_id as string | null) ?? null,
    competencyCommon: (data.competency_common as Record<string, number>) || {},
    competencyTrack: String(data.competency_track ?? ''),
    competencyTrackScores: (data.competency_track_scores as Record<string, number>) || {},
    efficacyScores: (data.efficacy_scores as Record<string, number>) || {},
    efficacyTop3: String(data.efficacy_top3 ?? ''),
    matrix: matrix ?? null,
    insightSelf: Number(data.insight_self ?? 0),
    insightJob: Number(data.insight_job ?? 0),
    insightTotal: Number(data.insight_total ?? 0),
    aiReport: (data.ai_report as string | null) ?? null,
    journeyStage: String(data.journey_stage ?? 'discovering'),
    createdAt: String(data.created_at ?? ''),
    trackName: String(data.track_name ?? data.competency_track ?? ''),
  };
}

export const B_STAGE_INFO: Record<string, { label: string; color: string }> = {
  ready: { label: '방향이 분명함', color: 'text-green-600 bg-green-50' },
  developing: { label: '역량 개발 중', color: 'text-yellow-600 bg-yellow-50' },
  exploring: { label: '탐색 단계', color: 'text-orange-600 bg-orange-50' },
  discovering: { label: '발견 단계', color: 'text-red-600 bg-red-50' },
};

export const MATRIX_CELL_INFO: Record<string, { label: string; hint: string; tone: string }> = {
  최적영역: { label: '최적 영역', hint: '끌리고, 할 수 있다 — 중심에 둘 일', tone: 'bg-green-50 text-green-700 border-green-200' },
  탐색학습필요: { label: '배우면 되는 영역', hint: '끌리지만 아직 자신이 없다 — 학습으로 메울 수 있다', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
  소진리스크: { label: '소진 주의', hint: '할 수 있지만 끌리지 않는다 — 오래 하면 지친다', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  비관심영역: { label: '비관심 영역', hint: '지금은 우선순위가 아니다', tone: 'bg-neutral-50 text-neutral-500 border-neutral-200' },
  미측정: { label: '미측정', hint: 'HIT - Archetype 흥미 결과가 있어야 교차할 수 있다', tone: 'bg-neutral-50 text-neutral-400 border-dashed border-neutral-200' },
};

export function cleanMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^[-*]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .trim();
}
