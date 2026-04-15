import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// GET /api/badak/members/[id] — 공개 프로필 조회 (인증 불필요)
// id = badak_members.id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data: member, error } = await supabase
    .from('badak_members')
    .select(`
      id, user_id, display_name, avatar_url,
      job_function, industry, experience_years, job_level,
      bio, looking_for, can_offer, interest_tags,
      career,
      instagram_url, facebook_url, linkedin_url, homepage_url,
      profile_public,
      is_active, created_at
    `)
    .eq('id', id)
    .single();

  if (error || !member) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // members 테이블에서 최신 이름/아바타 가져오기 (source of truth)
  const { data: mainMember } = await supabase
    .from('members')
    .select('name, avatar_url, affiliations')
    .eq('auth_id', member.user_id)
    .single();

  // 멤버십 확인: members.affiliations에 'badak' 있어야 공개 프로필 노출
  // (없으면 탈퇴/미온보딩 상태이므로 404 처리)
  const affiliations: string[] = mainMember?.affiliations ?? [];
  if (mainMember && !affiliations.includes('badak')) {
    return NextResponse.json({ error: 'Not a Badak member' }, { status: 404 });
  }

  // 프로필 비공개 설정 존중 — false면 최소 정보만 반환
  const isPublic = member.profile_public !== false;

  // 이름: members.name 우선, 없으면 badak_members.display_name
  const displayName = mainMember?.name || member.display_name;
  // 아바타: members.avatar_url 우선
  const avatarUrl = mainMember?.avatar_url || member.avatar_url;

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
      displayName,
      avatarUrl,
      jobFunction: isPublic ? member.job_function : null,
      industry: isPublic ? member.industry : null,
      experienceYears: isPublic ? member.experience_years : null,
      jobLevel: isPublic ? member.job_level : null,
      bio: isPublic ? member.bio : null,
      lookingFor: isPublic ? (member.looking_for ?? []) : [],
      canOffer: isPublic ? (member.can_offer ?? []) : [],
      interestTags: isPublic ? (member.interest_tags ?? []) : [],
      career: isPublic ? (member.career ?? []) : [],
      instagramUrl: isPublic ? member.instagram_url : null,
      facebookUrl: isPublic ? member.facebook_url : null,
      linkedinUrl: isPublic ? member.linkedin_url : null,
      homepageUrl: isPublic ? member.homepage_url : null,
      profilePublic: isPublic,
      affiliations,
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
