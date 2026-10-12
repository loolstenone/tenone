import { NextRequest } from 'next/server';
import { canReadHitResult } from '@/lib/hit/result-access';
import { successResponse, errorResponse } from '@/lib/supabase/api-utils';
import { createAdminClient } from '@/lib/supabase/admin';
import { CORE_COMPETENCY_LABELS, type CoreCompetency } from '@/lib/hit/scoring-b';
import { STAGE_LABELS } from '@/lib/hit/report-copy';
import { HIT_STAGES } from '@/lib/hit/stages';

/**
 * GET /api/hit/chain?type=a|b|c|d|e|f|gap&id= — 한 회차의 A·B·생애주기 결과를 한 줄로 (본인·직원만)
 * 묶는 기준 = 같은 HIT A 결과(hit_a_result_id). 없으면 같은 회원의 최신 결과.
 */
const STAGE_TABLES = [
  { key: 'c', table: 'hit_c_results', score: 'readiness_total' },
  { key: 'd', table: 'hit_d_results', score: 'transition_readiness' },
  { key: 'e', table: 'hit_e_results', score: 'senior_readiness' },
  { key: 'f', table: 'hit_f_results', score: 'second_act_readiness' },
  { key: 'gap', table: 'hit_gap_results', score: 'reentry_readiness' },
] as const;
const TABLE: Record<string, string> = { a: 'hit_a_results', b: 'hit_b_results', ...Object.fromEntries(STAGE_TABLES.map(s => [s.key, s.table])) };

type Row = Record<string, unknown>;

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type') ?? '';
    const id = req.nextUrl.searchParams.get('id') ?? '';
    if (!TABLE[type] || !id) return errorResponse('type·id가 필요합니다.', 400);
    const sb = createAdminClient();

    const { data: self } = await sb.from(TABLE[type]).select('*').eq('id', id).maybeSingle();
    if (!self || !(await canReadHitResult(req, self as { member_id?: string | null }))) return errorResponse('결과를 찾을 수 없습니다.', 404);
    const memberId = (self as Row).member_id as string | null;

    // 같은 회차 찾기: hit_a_result_id 일치 우선, 없으면 회원 최신
    const pick = async (table: string, aId: string | null): Promise<Row | null> => {
      if (aId) {
        const { data } = await sb.from(table).select('*').eq('hit_a_result_id', aId).order('created_at', { ascending: false }).limit(1);
        if (data?.[0]) return data[0] as Row;
      }
      if (!memberId) return null;
      const { data } = await sb.from(table).select('*').eq('member_id', memberId).order('created_at', { ascending: false }).limit(1);
      return (data?.[0] as Row) ?? null;
    };

    let a: Row | null = type === 'a' ? (self as Row) : null;
    const aRef = type === 'a' ? id : ((self as Row).hit_a_result_id as string | null);
    if (!a && aRef) a = ((await sb.from('hit_a_results').select('*').eq('id', aRef).maybeSingle()).data as Row) ?? null;
    if (!a && memberId) a = ((await sb.from('hit_a_results').select('*').eq('member_id', memberId).order('created_at', { ascending: false }).limit(1)).data?.[0] as Row) ?? null;
    const aId = (a?.id as string | undefined) ?? null;

    const b = type === 'b' ? (self as Row) : await pick('hit_b_results', aId);

    // 생애주기·상황 결과 — 같은 회차의 단계별 최신을 모두 모은다 (C 다음 D를 해도 C가 사라지지 않게).
    // 보고 있는 결과가 생애주기면 그 결과 자신을 우선한다.
    const found: { key: string; row: Row }[] = [];
    if (type !== 'a' && type !== 'b') found.push({ key: type, row: self as Row });
    for (const s of STAGE_TABLES) {
      if (s.key === type) continue;
      const row = await pick(s.table, aId);
      if (row) found.push({ key: s.key, row });
    }
    found.sort((x, y) => (x.key === type ? -1 : y.key === type ? 1 : String(y.row.created_at).localeCompare(String(x.row.created_at))));
    const stage = found[0] ?? null;

    // A 이름 = 64유형 SSOT의 캐릭터명
    let aName = (a?.type_name_ko as string | undefined) ?? '';
    if (a?.type_code) {
      const { data: ht } = await sb.from('hit_hero_types').select('character_name').eq('type_code', a.type_code as string).maybeSingle();
      if (ht?.character_name) aName = ht.character_name as string;
    }

    let bLine: string | null = null;
    if (b) {
      const common = (b.competency_common as Record<string, number>) ?? {};
      const top = (Object.entries(common) as [CoreCompetency, number][]).sort((x, y) => y[1] - x[1])[0];
      let track = (b.competency_track as string) ?? '';
      if (track) track = ((await sb.from('hit_competency_tracks').select('name_ko').eq('id', track).maybeSingle()).data?.name_ko as string) ?? track;
      bLine = [top ? `강점 ${CORE_COMPETENCY_LABELS[top[0]] ?? top[0]} ${top[1]}` : null, track || null].filter(Boolean).join(' · ');
    }

    const shape = (f: { key: string; row: Row }) => {
      const meta = STAGE_TABLES.find(t => t.key === f.key)!;
      return {
        key: f.key, id: f.row.id,
        name: HIT_STAGES[f.key as keyof typeof HIT_STAGES]?.code ?? '',
        headline: `준비도 ${Number(f.row[meta.score] ?? 0)}`,
        sub: STAGE_LABELS[String(f.row.journey_stage)] ?? '',
      };
    };
    return successResponse({
      a: a ? { id: a.id, headline: `${a.type_code ?? ''}`, sub: aName } : null,
      b: b ? { id: b.id, headline: bLine ?? '', sub: STAGE_LABELS[String(b.journey_stage)] ?? '' } : null,
      stage: stage ? shape(stage) : null,
      stages: found.map(shape),
    });
  } catch (error) {
    console.error('[HIT chain] 조회 오류:', error);
    return errorResponse('조회 실패', 500);
  }
}
