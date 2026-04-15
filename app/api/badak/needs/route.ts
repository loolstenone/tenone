import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET: 니즈 목록 (관심 인원 많은 순, 최대 100개) + 연결된 모임 전체
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 100);

  const { data: needs, error } = await supabase
    .from('badak_needs')
    .select(`
      id, display_text, count, interest_count, fire_count, status,
      groups:badak_groups!need_id(
        id, title, meeting_type, max_members, current_members,
        schedule, location, event_date, status,
        leader:badak_members!badak_groups_leader_id_fkey(display_name, job_function)
      )
    `)
    .order('count', { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // CloudWord 형식으로 변환
  const maxCount = needs?.[0]?.count ?? 1;

  const words = (needs ?? []).map((n) => {
    type RawGroup = {
      id: string; title: string; meeting_type: string;
      max_members: number; current_members: number;
      schedule: string | null; location: string | null; event_date: string | null;
      status: string;
      leader: { display_name: string; job_function: string } | null;
    };
    const rawGroups = (n.groups as unknown) as RawGroup[];

    // 활성 모임만 (closed/completed 제외)
    const activeGroups = rawGroups.filter(
      (g) => g.status !== 'closed' && g.status !== 'completed',
    );

    const groups = activeGroups.map((g) => ({
      id: g.id,
      title: g.title,
      type: (g.meeting_type === 'recurring' ? 'recurring' : 'once') as 'once' | 'recurring',
      maxMembers: g.max_members,
      currentMembers: g.current_members,
      leaderName: g.leader?.display_name ?? '바닥장',
      leaderJob: g.leader?.job_function ?? '',
      schedule: g.schedule ?? undefined,
      eventDate: g.event_date
        ? new Date(g.event_date).toLocaleDateString('ko-KR', {
            month: 'long', day: 'numeric', weekday: 'short',
          })
        : undefined,
      location: g.location ?? '',
      status: (g.status === 'confirmed' ? 'confirmed' : 'recruiting') as 'recruiting' | 'confirmed' | 'closed',
    }));

    return {
      needId: n.id,
      text: n.display_text,
      size: 0.8 + (n.count / maxCount) * 1.2, // 0.8 ~ 2.0
      hasGroup: groups.length > 0,
      members: n.count,
      interestCount: n.interest_count ?? 0,
      fireCount: n.fire_count ?? 0,
      groups,
      group: groups[0] ?? undefined, // 하위 호환
    };
  });

  return NextResponse.json({ words });
}
