/**
 * MADLeague 동아리 랭킹 (2026-10-10 사용자 결정)
 *   점수 = 경쟁 PT 참가 팀마다 최고 성적 점수의 합 — 1등 5 · 2등 4 · 3등 3 · 본선 2 · 참여 1
 *
 * 원천 (같은 팀을 두 번 세지 않는다)
 *   ① 인증서 대장(program_certificates, cert_key 'ledger:%') — 팀명이 있으면 팀별 최고 성적
 *   ② 옛 명예의 전당 배지(competition-archive.ts) — 대장에 수상 기록이 없는 회차·동아리 보충 (4위 = 본선)
 *   ③ 인트라 결과 발표 회차(program_teams·program_results, context.club_id) — 대장에 없는 새 회차
 *   팀명이 없는 대장 행: 수상 결과마다 1팀, 참가만 있으면 최소 1팀 (실제 팀 수는 더 많을 수 있음 → minimum 표시)
 */
import { createAdminClient } from '@/lib/supabase/admin';
import { COMPETITION_ARCHIVE, ledgerGroupToClubSlug } from '@/features/madleague/competition-archive';

export const RESULT_POINTS: Record<string, number> = { '1등': 5, '2등': 4, '3등': 3, '본선': 2, '참가': 1 };
const RANK_RESULT: Record<number, string> = { 1: '1등', 2: '2등', 3: '3등' };

export interface ClubRanking {
  slug: string;
  score: number;
  teams: number;
  /** 팀 정보가 빠진 회차가 있어 실제보다 낮을 수 있음 */
  partial: boolean;
}

/** 회차 키 — 연도 + 클라이언트(공백·'경쟁 PT' 제거) */
const roundKey = (year: number | string, name: string) =>
  `${year}|${name.replace(/경쟁\s*PT/gi, '').replace(/\(.*?\)/g, '').replace(/\s+/g, '').replace(/^\d{4}/, '')}`;

const pts = (result: string) => RESULT_POINTS[result] ?? 0;

export async function computeClubRankings(): Promise<Map<string, ClubRanking>> {
  const admin = createAdminClient();
  // (회차, 동아리) → 팀별 점수 목록
  const cell = new Map<string, { named: Map<string, number>; unnamed: string[]; unnamedParticipation: boolean }>();
  const get = (k: string) => {
    let c = cell.get(k);
    if (!c) { c = { named: new Map(), unnamed: [], unnamedParticipation: false }; cell.set(k, c); }
    return c;
  };

  // ① 대장
  const { data: ledger } = await admin.from('program_certificates')
    .select('type, result, snapshot').eq('brand_id', 'madleague').like('cert_key', 'ledger:%').is('revoked_at', null).limit(5000);
  const unnamedAwardSeen = new Set<string>();
  for (const row of (ledger ?? []) as Array<{ type: string; result: string | null; snapshot: Record<string, unknown> | null }>) {
    const s = row.snapshot ?? {};
    const club = ledgerGroupToClubSlug(s.group_name as string | null);
    if (!club || !s.year) continue;
    const key = `${roundKey(s.year as number, String(s.title ?? s.round_title ?? ''))}|${club}`;
    const c = get(key);
    const result = row.type === 'participation' ? '참가' : String(row.result ?? '');
    const team = typeof s.team_name === 'string' && s.team_name.trim() ? s.team_name.trim() : null;
    if (team) {
      c.named.set(team, Math.max(c.named.get(team) ?? 0, pts(result)));
    } else if (row.type === 'participation') {
      c.unnamedParticipation = true;
    } else if (!unnamedAwardSeen.has(`${key}|${result}`)) {
      unnamedAwardSeen.add(`${key}|${result}`); // 팀명 없는 수상 = 결과마다 1팀
      c.unnamed.push(result);
    }
  }

  // ② 옛 명예의 전당 — 대장에 그 성적 팀이 없을 때만 보충
  for (const r of COMPETITION_ARCHIVE) {
    for (const a of r.awards) {
      const key = `${roundKey(r.year, r.client)}|${a.club}`;
      const c = get(key);
      const result = RANK_RESULT[a.rank] ?? '본선';
      const p = pts(result);
      const hasNamed = [...c.named.values()].filter(v => v === p).length;
      const hasUnnamed = c.unnamed.filter(u => pts(u) === p).length;
      const archiveSame = r.awards.filter(x => x.club === a.club && (RANK_RESULT[x.rank] ?? '본선') === result).length;
      if (hasNamed + hasUnnamed < archiveSame) c.unnamed.push(result);
    }
  }

  // ③ 인트라 결과 발표 회차 (대장·옛 기록에 없는 회차만)
  const { data: rounds } = await admin.from('program_rounds')
    .select('id, year, title, client_name').eq('brand_id', 'madleague').eq('kind', 'competition').not('results_published_at', 'is', null);
  const known = new Set([...cell.keys()].map(k => k.split('|').slice(0, 2).join('|')));
  const liveRounds = (rounds ?? []).filter(r => !known.has(roundKey(r.year, r.client_name ?? r.title)));
  if (liveRounds.length) {
    const ids = liveRounds.map(r => r.id);
    const [{ data: teams }, { data: results }] = await Promise.all([
      admin.from('program_teams').select('id, round_id, is_finalist, context').in('round_id', ids),
      admin.from('program_results').select('team_id, rank').in('round_id', ids),
    ]);
    const rankOf = new Map((results ?? []).filter(x => x.team_id).map(x => [x.team_id as string, x.rank as number | null]));
    for (const t of (teams ?? []) as Array<{ id: string; round_id: string; is_finalist: boolean | null; context: Record<string, unknown> | null }>) {
      const clubId = t.context?.club_id as string | undefined;
      if (!clubId) continue;
      const rank = rankOf.get(t.id);
      const result = rank && RANK_RESULT[rank] ? RANK_RESULT[rank] : t.is_finalist || rank ? '본선' : '참가';
      get(`live:${t.round_id}|club-id:${clubId}`).named.set(t.id, pts(result));
    }
  }

  // 동아리별 합계 (③은 club_id → slug 변환)
  const { data: clubs } = await admin.from('mad_clubs').select('id, slug');
  const slugById = new Map((clubs ?? []).map(c => [c.id, c.slug]));
  const out = new Map<string, ClubRanking>();
  for (const [key, c] of cell) {
    const last = key.split('|').pop()!;
    const slug = last.startsWith('club-id:') ? slugById.get(last.slice(8)) : last;
    if (!slug) continue;
    const scores = [...c.named.values(), ...c.unnamed.map(pts)];
    let partial = false;
    if (c.unnamedParticipation) {
      partial = true; // 팀명 없는 참가자 — 팀 수를 알 수 없음
      if (!scores.length) scores.push(1);
    }
    const cur = out.get(slug) ?? { slug, score: 0, teams: 0, partial: false };
    out.set(slug, { slug, score: cur.score + scores.reduce((a, b) => a + b, 0), teams: cur.teams + scores.length, partial: cur.partial || partial });
  }
  return out;
}
