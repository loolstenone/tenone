import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET /api/badak/members/[id] — 공개 프로필 조회 (인증 불필요)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data: member, error } = await supabase
    .from('badak_members')
    .select(`
      id, display_name, avatar_url,
      job_function, industry, experience_years, job_level,
      bio, looking_for, can_offer, interest_tags,
      is_active, created_at
    `)
    .eq('id', id)
    .single();

  if (error || !member) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // 내가 개설한 모임 (공개 상태만)
  const { data: groups } = await supabase
    .from('badak_groups')
    .select('id, title, meeting_type, status, current_members, max_members, schedule, event_date, location')
    .eq('leader_id', id)
    .neq('status', 'closed')
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    member: {
      id: member.id,
      displayName: member.display_name,
      avatarUrl: member.avatar_url,
      jobFunction: member.job_function,
      industry: member.industry,
      experienceYears: member.experience_years,
      jobLevel: member.job_level,
      bio: member.bio,
      lookingFor: member.looking_for ?? [],
      canOffer: member.can_offer ?? [],
      interestTags: member.interest_tags ?? [],
      isActive: member.is_active,
      joinedAt: member.created_at,
    },
    groups: (groups ?? []).map((g) => ({
      id: g.id,
      title: g.title,
      type: g.meeting_type,
      status: g.status,
      currentMembers: g.current_members,
      maxMembers: g.max_members,
      schedule: g.schedule,
      eventDate: g.event_date,
      location: g.location,
    })),
  });
}
