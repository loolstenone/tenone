import type { MadzineCategory } from '@/lib/madzine-categories';
// MADLeague 브랜드 DB 접근 헬퍼 (Phase 1)
import { createClient as createServerClient } from './server';

export type MadClubStatus = 'active' | 'preparing' | 'dormant';

export interface MadClub {
  id: string;
  slug: string;
  name: string;
  region: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  color: string | null;
  status: MadClubStatus;
  established_year: number | null;
  joined_madleague_year: number | null;
  sort_order: number;
  president_member_id: string | null;
}

/** MADLeague 창구의 프로그램 회차 (코어 program_rounds) — 공개 컬럼만 (brief_content는 참여자 전용이라 제외) */
export interface MadCompetition {
  id: string;
  slug: string | null;
  title: string;
  year: number;
  kind: string;
  brief_title: string | null;
  client_name: string | null;
  client_logo_url: string | null;
  cover_url: string | null;
  start_date: string | null;
  end_date: string | null;
  presentation_date: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface MadArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: MadzineCategory;
  club_id: string | null;
  author_name: string | null;
  author_avatar_url: string | null;
  thumbnail_url: string | null;
  tags: string[] | null;
  year: number | null;
  likes_count: number;
  views_count: number;
  is_featured: boolean;
  published_at: string;
}

export interface MadArchiveItem {
  id: string;
  title: string;
  description: string | null;
  type: 'competition' | 'project' | 'markethon' | 'insight_touring' | 'im' | 'dam';
  club_id: string | null;
  competition_id: string | null;
  year: number;
  thumbnail_url: string | null;
  award: string | null;
  tags: string[] | null;
  is_featured: boolean;
}

/** 프로그램 결과 (코어 program_results) — 발표된 회차만 RLS로 읽힘. 소속 동아리 = context.club_id */
export interface MadCompetitionResult {
  id: string;
  round_id: string;
  team_id: string | null;
  team_name: string;
  context: { club_id?: string } | null;
  rank: number | null;
  is_crown: boolean;
  award_name: string | null;
}

// 공개 컬럼 (program_rounds 컬럼 단위 GRANT와 일치)
const ROUND_PUBLIC_COLS = 'id, slug, title, year, kind, brief_title, client_name, client_logo_url, cover_url, start_date, end_date, presentation_date, status, results_published_at';
const RESULT_PUBLIC_COLS = 'id, round_id, team_id, team_name, context, rank, award_name';

// ────────────────────────────────────────────────────────
// 동아리
// ────────────────────────────────────────────────────────
export async function fetchMadClubs(): Promise<MadClub[]> {
  const sb = await createServerClient();
  const { data } = await sb
    .from('mad_clubs')
    .select('*')
    .eq('status', 'active');
  // 동아리 이름 알파벳순 (2026-10-10 사용자 결정 — 대소문자·공백 무시)
  return ((data || []) as MadClub[]).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

export async function fetchMadClubBySlug(slug: string): Promise<MadClub | null> {
  const sb = await createServerClient();
  const { data } = await sb.from('mad_clubs').select('*').eq('slug', slug).maybeSingle();
  return (data as MadClub) || null;
}

// ────────────────────────────────────────────────────────
// 경쟁PT — 코어 프로그램 모듈(program_*) 중 MADLeague 창구 회차
// ────────────────────────────────────────────────────────
export async function fetchMadCompetitions(opts?: { year?: number; limit?: number }): Promise<MadCompetition[]> {
  const sb = await createServerClient();
  let q = sb.from('program_rounds').select(ROUND_PUBLIC_COLS).contains('channels', ['madleague'])
    .order('year', { ascending: false }).order('presentation_date', { ascending: false });
  if (opts?.year) q = q.eq('year', opts.year);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data || []) as MadCompetition[];
}

// Hall of Fame: crown + award 위주 (최근순)
export async function fetchMadHallOfFame(limit = 3): Promise<Array<MadCompetition & { result?: MadCompetitionResult }>> {
  const sb = await createServerClient();
  const { data: comps } = await sb
    .from('program_rounds')
    .select(ROUND_PUBLIC_COLS)
    .eq('brand_id', 'madleague')
    .eq('status', 'completed')
    .eq('kind', 'competition')
    .order('presentation_date', { ascending: false })
    .limit(limit);
  if (!comps || comps.length === 0) return [];
  const ids = comps.map((c) => c.id);
  const { data: results } = await sb
    .from('program_results')
    .select(RESULT_PUBLIC_COLS)
    .in('round_id', ids)
    .order('rank', { ascending: true });
  const resultByComp = new Map<string, MadCompetitionResult>();
  for (const r of (results || []) as unknown as Omit<MadCompetitionResult, 'is_crown'>[]) {
    if (!resultByComp.has(r.round_id)) resultByComp.set(r.round_id, { ...r, is_crown: false });
  }
  return (comps as unknown as MadCompetition[]).map((c) => ({ ...c, result: resultByComp.get(c.id) }));
}

/**
 * 명예의 전당 — 결과 발표된 경쟁 PT 회차 (results_published_at, kind='competition')
 * 결과 읽기는 RLS가 발표된 회차만 허용. 팀 이름·동아리만 (팀원 이름 비노출)
 */
export interface MadHallRound {
  id: string; title: string; year: number; client_name: string | null; client_logo_url: string | null;
  brief_title: string | null; presentation_date: string | null; results_published_at: string;
  results: { rank: number | null; award_name: string | null; team_name: string; club: { name: string; logo_url: string | null } | null }[];
}
export async function fetchMadHallRounds(): Promise<MadHallRound[]> {
  const sb = await createServerClient();
  const { data: comps } = await sb
    .from('program_rounds')
    .select('id, title, year, client_name, client_logo_url, brief_title, presentation_date, results_published_at')
    .eq('brand_id', 'madleague')
    .eq('kind', 'competition')
    .not('results_published_at', 'is', null)
    .order('year', { ascending: false })
    .order('results_published_at', { ascending: false });
  if (!comps?.length) return [];
  const { data: rawResults } = await sb
    .from('program_results')
    .select('round_id, rank, award_name, team_name, context')
    .in('round_id', comps.map(c => c.id));
  const results = (rawResults ?? []).map(r => ({ ...r, club_id: (r.context as { club_id?: string } | null)?.club_id ?? null }));
  const clubIds = [...new Set(results.map(r => r.club_id).filter(Boolean))] as string[];
  const { data: clubs } = clubIds.length
    ? await sb.from('mad_clubs').select('id, name, logo_url').in('id', clubIds)
    : { data: [] as { id: string; name: string; logo_url: string | null }[] };
  const clubById = new Map((clubs ?? []).map(c => [c.id, { name: c.name, logo_url: c.logo_url }]));
  return comps
    .map(c => ({
      ...c,
      results: results.filter(r => r.round_id === c.id)
        .sort((x, y) => (x.rank ?? 99) - (y.rank ?? 99))
        .map(r => ({ rank: r.rank, award_name: r.award_name, team_name: r.team_name ?? '', club: r.club_id ? clubById.get(r.club_id) ?? null : null })),
    }))
    .filter(c => c.results.length > 0) as MadHallRound[];
}

// ────────────────────────────────────────────────────────
// MADzine
// ────────────────────────────────────────────────────────
export async function fetchMadArticles(opts?: { category?: MadArticle['category']; limit?: number }): Promise<MadArticle[]> {
  const sb = await createServerClient();
  let q = sb
    .from('mad_articles')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });
  if (opts?.category) q = q.eq('category', opts.category);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data || []) as MadArticle[];
}

// ────────────────────────────────────────────────────────
// 집계 (Home Numbers 섹션)
// ────────────────────────────────────────────────────────
export interface MadStats {
  clubCount: number;
  activityYears: number;
  competitionCount: number;
  crownCount: number;
}

export async function fetchMadStats(): Promise<MadStats> {
  const sb = await createServerClient();
  const [clubs, cohorts, comps, crowns] = await Promise.all([
    sb.from('mad_clubs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    sb.from('mad_cohorts').select('year'),
    sb.from('program_rounds').select('id', { count: 'exact', head: true }).eq('brand_id', 'madleague').eq('kind', 'competition'),
    // MAD Crown 표기는 결정 대기 — 코어 결과에는 Crown이 없어 0 (경쟁 PT는 순위만, 2026-10-07)
    Promise.resolve({ count: 0 }),
  ]);
  const years = new Set((cohorts.data || []).map((r: { year: number }) => r.year));
  return {
    clubCount: clubs.count ?? 0,
    activityYears: years.size,
    competitionCount: comps.count ?? 0,
    crownCount: crowns.count ?? 0,
  };
}
