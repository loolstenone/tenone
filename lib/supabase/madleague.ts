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
}

export interface MadCompetition {
  id: string;
  slug: string | null;
  title: string;
  year: number;
  brief_title: string | null;
  brief_content: string | null;
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
  category: 'interview' | 'case' | 'report' | 'cover' | 'news';
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

export interface MadCompetitionResult {
  id: string;
  competition_id: string;
  team_id: string | null;
  team_name: string;
  club_id: string | null;
  rank: number | null;
  is_crown: boolean;
  award_name: string | null;
  thumbnail_url: string | null;
}

// ────────────────────────────────────────────────────────
// 동아리
// ────────────────────────────────────────────────────────
export async function fetchMadClubs(): Promise<MadClub[]> {
  const sb = await createServerClient();
  const { data } = await sb
    .from('mad_clubs')
    .select('*')
    .eq('status', 'active')
    .order('sort_order');
  return (data || []) as MadClub[];
}

export async function fetchMadClubBySlug(slug: string): Promise<MadClub | null> {
  const sb = await createServerClient();
  const { data } = await sb.from('mad_clubs').select('*').eq('slug', slug).maybeSingle();
  return (data as MadClub) || null;
}

// ────────────────────────────────────────────────────────
// 경쟁PT
// ────────────────────────────────────────────────────────
export async function fetchMadCompetitions(opts?: { year?: number; limit?: number }): Promise<MadCompetition[]> {
  const sb = await createServerClient();
  let q = sb.from('mad_competitions').select('*').order('year', { ascending: false }).order('presentation_date', { ascending: false });
  if (opts?.year) q = q.eq('year', opts.year);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return (data || []) as MadCompetition[];
}

// Hall of Fame: crown + award 위주 (최근순)
export async function fetchMadHallOfFame(limit = 3): Promise<Array<MadCompetition & { result?: MadCompetitionResult }>> {
  const sb = await createServerClient();
  const { data: comps } = await sb
    .from('mad_competitions')
    .select('*')
    .eq('status', 'completed')
    .order('presentation_date', { ascending: false })
    .limit(limit);
  if (!comps || comps.length === 0) return [];
  const ids = comps.map((c) => c.id);
  const { data: results } = await sb
    .from('mad_competition_results')
    .select('*')
    .in('competition_id', ids)
    .order('rank', { ascending: true });
  const resultByComp = new Map<string, MadCompetitionResult>();
  for (const r of (results || []) as MadCompetitionResult[]) {
    if (!resultByComp.has(r.competition_id)) resultByComp.set(r.competition_id, r);
  }
  return (comps as MadCompetition[]).map((c) => ({ ...c, result: resultByComp.get(c.id) }));
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
    sb.from('mad_competitions').select('*', { count: 'exact', head: true }),
    sb.from('mad_competition_results').select('*', { count: 'exact', head: true }).eq('is_crown', true),
  ]);
  const years = new Set((cohorts.data || []).map((r: { year: number }) => r.year));
  return {
    clubCount: clubs.count ?? 0,
    activityYears: years.size,
    competitionCount: comps.count ?? 0,
    crownCount: crowns.count ?? 0,
  };
}
