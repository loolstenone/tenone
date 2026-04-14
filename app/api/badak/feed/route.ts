import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY_PROD || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || '전체';

  // 모임 확정/마감 임박
  const { data: groups } = await supabase
    .from('badak_groups')
    .select(`
      id, title, status, max_members, current_members,
      event_date, location, tags, cover_image_url,
      leader:badak_members!badak_groups_leader_id_fkey(display_name, job_function, experience_years)
    `)
    .in('status', ['recruiting', 'confirmed'])
    .order('event_date', { ascending: true })
    .limit(10);

  // 니즈 모이는 중
  const { data: gatheringNeeds } = await supabase
    .from('badak_needs')
    .select('id, display_text, count, threshold')
    .eq('status', 'gathering')
    .order('count', { ascending: false })
    .limit(5);

  // 스토리
  const { data: stories } = await supabase
    .from('badak_stories')
    .select(`
      id, title, before_role, after_role,
      member:badak_members!badak_stories_member_id_fkey(display_name)
    `)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(3);

  // Feed items 조합
  type FeedItemOut = {
    type: string;
    badge: string;
    title: string;
    leader?: string;
    leaderJob?: string;
    members?: number;
    max?: number;
    date?: string;
    location?: string;
    tags?: string[];
    count?: number;
    threshold?: number;
    author?: string;
    authorJob?: string;
    imageUrl?: string;
  };
  const feed: FeedItemOut[] = [];

  // 그룹 → 피드 아이템
  for (const g of groups || []) {
    const isUrgent = g.current_members / g.max_members > 0.9;
    const leader = g.leader as { display_name: string; job_function: string; experience_years: number } | null;
    feed.push({
      type: 'group',
      badge: isUrgent ? '마감 임박' : '모임 확정',
      title: g.title,
      leader: `바닥장 ${leader?.display_name || ''}`,
      leaderJob: `${leader?.job_function || ''} ${leader?.experience_years || ''}년차`,
      members: g.current_members,
      max: g.max_members,
      date: g.event_date ? new Date(g.event_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' }) : '',
      location: g.location || '',
      tags: g.tags || [],
      imageUrl: g.cover_image_url || undefined,
    });
  }

  // 니즈 → 피드 아이템
  for (const n of gatheringNeeds || []) {
    feed.push({
      type: 'needs',
      badge: '니즈 모이는 중',
      title: n.display_text,
      count: n.count,
      threshold: n.threshold,
    });
  }

  // 스토리 → 피드 아이템
  for (const s of stories || []) {
    const member = s.member as { display_name: string } | null;
    feed.push({
      type: 'story',
      badge: 'Next Stage 스토리',
      title: s.title,
      author: member?.display_name || '',
      authorJob: `${s.before_role || ''} → ${s.after_role || ''}`,
    });
  }

  return NextResponse.json({ feed });
}
