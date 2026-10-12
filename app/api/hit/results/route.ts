import { NextRequest, NextResponse } from 'next/server';
import { requireMember } from '@/lib/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { HIT_STAGES, type HitStageKey } from '@/lib/hit/stages';

/**
 * GET /api/hit/results — 로그인 회원 본인의 HIT 결과 목록 (A·B·C·D·E·F·GAP, 최신순)
 * 본인 식별은 세션만 사용. member_id는 응답에 포함하지 않는다.
 */
const SOURCES: { key: HitStageKey; table: string; cols: string }[] = [
  { key: 'a', table: 'hit_a_results', cols: 'id, created_at, type_code, type_nickname' },
  { key: 'b', table: 'hit_b_results', cols: 'id, created_at, competency_track, readiness_grade' },
  { key: 'c', table: 'hit_c_results', cols: 'id, created_at, readiness_total' },
  { key: 'd', table: 'hit_d_results', cols: 'id, created_at, transition_readiness' },
  { key: 'e', table: 'hit_e_results', cols: 'id, created_at, senior_readiness' },
  { key: 'f', table: 'hit_f_results', cols: 'id, created_at, second_act_readiness' },
  { key: 'gap', table: 'hit_gap_results', cols: 'id, created_at, reentry_readiness' },
];

type Row = Record<string, unknown>;

export interface HitResultItem {
  id: string;
  stage: HitStageKey;
  createdAt: string;
  headline: string;
  href: string;
}

export async function GET(req: NextRequest) {
  const auth = await requireMember(req);
  if (auth instanceof NextResponse) return auth;
  try {
    const sb = createAdminClient();

    // B 트랙 이름 (id → 이름)
    const { data: tracks } = await sb.from('hit_competency_tracks').select('id, name_ko');
    const trackName = new Map<string, string>((tracks ?? []).map((t: Row) => [String(t.id), String(t.name_ko)]));

    const settled = await Promise.all(SOURCES.map(async s => {
      const { data, error } = await sb.from(s.table).select(s.cols).eq('member_id', auth.memberId).order('created_at', { ascending: false }).limit(20);
      if (error) { console.error(`[HIT results] ${s.table}`, error.message); return { s, rows: [] as Row[], failed: true }; }
      return { s, rows: (data ?? []) as unknown as Row[], failed: false };
    }));

    const items: HitResultItem[] = [];
    for (const { s, rows } of settled) {
      for (const r of rows) {
        let headline = '';
        if (s.key === 'a') headline = [r.type_code, r.type_nickname].filter(Boolean).join(' · ');
        else if (s.key === 'b') {
          const t = r.competency_track ? (trackName.get(String(r.competency_track)) ?? String(r.competency_track)) : '';
          headline = [t, r.readiness_grade ? `준비도 ${r.readiness_grade}등급` : ''].filter(Boolean).join(' · ');
        } else {
          const col = s.cols.split(', ')[2];
          const v = r[col];
          headline = v == null ? '' : `준비도 ${Number(v)}`;
        }
        items.push({
          id: String(r.id), stage: s.key, createdAt: String(r.created_at),
          headline: headline || HIT_STAGES[s.key].name,
          href: `/hero/hit/${s.key}/result/${r.id}`,
        });
      }
    }
    items.sort((x, y) => y.createdAt.localeCompare(x.createdAt));

    // 일부 테이블만 실패한 경우에도 나머지는 보여주되, 전부 실패하면 오류
    if (settled.every(x => x.failed)) return NextResponse.json({ error: '조회 실패' }, { status: 500 });
    return NextResponse.json({ results: items, partial: settled.some(x => x.failed) });
  } catch (error) {
    console.error('[HIT results] 조회 오류:', error);
    return NextResponse.json({ error: '조회 실패' }, { status: 500 });
  }
}
