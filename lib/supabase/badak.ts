/**
 * Badak.biz Supabase CRUD
 * badak_profiles, badak_connections, badak_feedbacks, badak_stars
 */
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import type { BadakProfile, BadakConnection, BadakFeedback, BadakStar, ProfileSearchParams } from '@/types/badak';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── 유틸 ──

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
    result[snakeKey] = value;
  }
  return result;
}

function toProfile(row: Record<string, unknown>): BadakProfile {
  return snakeToCamel(row) as unknown as BadakProfile;
}

function toConnection(row: Record<string, unknown>): BadakConnection {
  const conn = snakeToCamel(row) as unknown as BadakConnection;
  if (row.requester && typeof row.requester === 'object') {
    conn.requesterProfile = toProfile(row.requester as Record<string, unknown>);
  }
  if (row.target && typeof row.target === 'object') {
    conn.targetProfile = toProfile(row.target as Record<string, unknown>);
  }
  return conn;
}

function toStar(row: Record<string, unknown>): BadakStar {
  const star = snakeToCamel(row) as unknown as BadakStar;
  if (row.featured_profile && typeof row.featured_profile === 'object') {
    star.featuredProfile = toProfile(row.featured_profile as Record<string, unknown>);
  }
  return star;
}

// ══════════════════════════════════════
// 프로필
// ══════════════════════════════════════

export async function fetchBadakProfile(userId: string): Promise<BadakProfile | null> {
  const { data, error } = await supabase
    .from('badak_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return toProfile(data);
}

export async function fetchBadakProfiles(params: ProfileSearchParams = {}): Promise<{ profiles: BadakProfile[]; total: number }> {
  const { jobFunction, industry, jobLevel, lookingFor, canOffer, search, page = 1, limit = 12 } = params;
  const from = (page - 1) * limit;

  let query = supabase
    .from('badak_profiles')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (jobFunction) query = query.eq('job_function', jobFunction);
  if (industry) query = query.eq('industry', industry);
  if (jobLevel) query = query.eq('job_level', jobLevel);
  if (lookingFor) query = query.contains('looking_for', [lookingFor]);
  if (canOffer) query = query.contains('can_offer', [canOffer]);
  if (search) query = query.or(`display_name.ilike.%${search}%,bio.ilike.%${search}%`);

  const { data, count, error } = await query;
  if (error) { console.error('fetchBadakProfiles error:', error); return { profiles: [], total: 0 }; }
  return { profiles: (data || []).map(toProfile), total: count || 0 };
}

export async function upsertBadakProfile(profile: Partial<BadakProfile> & { id: string }): Promise<BadakProfile | null> {
  const snake = camelToSnake(profile as Record<string, unknown>);
  snake.updated_at = new Date().toISOString();
  const { data, error } = await supabase
    .from('badak_profiles')
    .upsert(snake, { onConflict: 'id' })
    .select()
    .single();
  if (error) { console.error('upsertBadakProfile error:', error); return null; }
  return toProfile(data);
}

// ══════════════════════════════════════
// 연결
// ══════════════════════════════════════

export async function createConnection(requesterId: string, targetId: string, message: string): Promise<BadakConnection | null> {
  const { data, error } = await supabase
    .from('badak_connections')
    .insert({ requester_id: requesterId, target_id: targetId, message })
    .select()
    .single();
  if (error) { console.error('createConnection error:', error); return null; }
  return toConnection(data);
}

export async function respondToConnection(connectionId: string, status: 'accepted' | 'declined'): Promise<boolean> {
  const { error } = await supabase
    .from('badak_connections')
    .update({ status, responded_at: new Date().toISOString() })
    .eq('id', connectionId);
  return !error;
}

export async function fetchMyConnections(userId: string, type: 'sent' | 'received' | 'accepted'): Promise<BadakConnection[]> {
  let query = supabase
    .from('badak_connections')
    .select('*, requester:badak_profiles!badak_connections_requester_id_fkey(*), target:badak_profiles!badak_connections_target_id_fkey(*)')
    .order('created_at', { ascending: false });

  if (type === 'sent') {
    query = query.eq('requester_id', userId).eq('status', 'pending');
  } else if (type === 'received') {
    query = query.eq('target_id', userId).eq('status', 'pending');
  } else {
    query = query.or(`requester_id.eq.${userId},target_id.eq.${userId}`).eq('status', 'accepted');
  }

  const { data, error } = await query;
  if (error) { console.error('fetchMyConnections error:', error); return []; }
  return (data || []).map(toConnection);
}

export async function checkConnectionStatus(requesterId: string, targetId: string): Promise<'none' | 'pending' | 'accepted' | 'declined'> {
  const { data } = await supabase
    .from('badak_connections')
    .select('status')
    .or(`and(requester_id.eq.${requesterId},target_id.eq.${targetId}),and(requester_id.eq.${targetId},target_id.eq.${requesterId})`)
    .limit(1)
    .single();
  if (!data) return 'none';
  return data.status as 'pending' | 'accepted' | 'declined';
}

// ══════════════════════════════════════
// 피드백
// ══════════════════════════════════════

export async function submitFeedback(connectionId: string, giverId: string, wasHelpful: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('badak_feedbacks')
    .upsert({ connection_id: connectionId, giver_id: giverId, was_helpful: wasHelpful }, { onConflict: 'connection_id,giver_id' });
  return !error;
}

// ══════════════════════════════════════
// 이바닥 스타
// ══════════════════════════════════════

export async function fetchStars(options: { limit?: number; page?: number } = {}): Promise<{ stars: BadakStar[]; total: number }> {
  const { limit = 10, page = 1 } = options;
  const from = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from('badak_stars')
    .select('*, featured_profile:badak_profiles!badak_stars_featured_profile_id_fkey(*)', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) { console.error('fetchStars error:', error); return { stars: [], total: 0 }; }
  return { stars: (data || []).map(toStar), total: count || 0 };
}

export async function fetchStarBySlug(slug: string): Promise<BadakStar | null> {
  const { data, error } = await supabase
    .from('badak_stars')
    .select('*, featured_profile:badak_profiles!badak_stars_featured_profile_id_fkey(*)')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return toStar(data);
}

// ══════════════════════════════════════
// 통계 (랜딩 소셜 프루프)
// ══════════════════════════════════════

export async function fetchBadakStats(): Promise<{ profileCount: number; connectionCount: number; industryCount: number }> {
  const [profileRes, connRes] = await Promise.all([
    supabase.from('badak_profiles').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('badak_connections').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
  ]);
  // 산업 수는 프로필에서 distinct industry 수
  const { data: industries } = await supabase.from('badak_profiles').select('industry').eq('is_active', true);
  const uniqueIndustries = new Set((industries || []).map((r: { industry: string }) => r.industry));

  return {
    profileCount: profileRes.count || 0,
    connectionCount: connRes.count || 0,
    industryCount: uniqueIndustries.size,
  };
}
