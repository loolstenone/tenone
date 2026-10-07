import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMadPeople } from '@/lib/madleague-people';

export const runtime = 'nodejs';

interface RouteProps {
  params: Promise<{ memberId: string }>;
}

// GET — 퍼블릭 포트폴리오
// portfolio_public=true인 멤버만 조회 가능 (anon도 접근 가능)
// mad_members는 RLS로 본인 행만 열려 있으므로 service_role로 읽되, 공개 컬럼만 고른다 (email·phone 제외)
export async function GET(_req: Request, { params }: RouteProps) {
  const { memberId } = await params;
  const sb = await createClient();

  // 멤버 기본 정보 (portfolio_public=true만)
  const { data: member, error } = await createAdminClient()
    .from('mad_members')
    .select(`
      id, member_id, bio, skill_tags, activity_years,
      university, major, year_in_school, joined_at, status,
      mad_clubs(slug, name, region, color),
      mad_cohorts(year, status)
    `)
    .eq('id', memberId)
    .eq('portfolio_public', true)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!member) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  // 이름·사진 = 공통 프로필(members)
  const person = (await getMadPeople([memberId])).get(memberId);
  Object.assign(member, { name: person?.name ?? '', avatar_url: person?.avatar_url ?? null });

  // 팀 참여 이력 (경쟁PT 결과 포함) — 팀원 키 = members.id, 팀원 행은 비공개라 service_role로 이 회원 것만
  const coreId = (member as { member_id?: string | null }).member_id;
  const { data: teamLinks } = coreId
    ? await createAdminClient().from('program_participants').select('team_id, role').eq('member_id', coreId).not('team_id', 'is', null)
    : { data: [] };
  delete (member as { member_id?: unknown }).member_id;

  const teamIds = (teamLinks ?? []).map((t: { team_id: string }) => t.team_id);

  let teams: unknown[] = [];
  if (teamIds.length > 0) {
    const { data } = await sb
      .from('program_teams')
      .select(`
        id, name,
        mad_competitions:program_rounds(title, year, status, presentation_date)
      `)
      .in('id', teamIds)
      .order('created_at', { ascending: false });
    teams = data ?? [];

    // 결과 (수상)
    // 결과 — 발표된 회차만 (RLS)
    const { data: results } = await sb
      .from('program_results')
      .select('team_id, rank, award_name')
      .in('team_id', teamIds);

    const resultMap: Record<string, unknown> = {};
    (results ?? []).forEach((r: { team_id: string | null; rank: number | null; award_name: string | null }) => {
      if (r.team_id) resultMap[r.team_id] = { ...r, is_crown: false };
    });

    const roleMap: Record<string, string> = {};
    (teamLinks ?? []).forEach((t: { team_id: string; role: string }) => { roleMap[t.team_id] = t.role; });

    teams = teams.map((t: unknown) => ({
      ...(t as Record<string, unknown>),
      myRole: roleMap[(t as { id: string }).id] ?? 'member',
      result: resultMap[(t as { id: string }).id] ?? null,
    }));
  }

  // 발급된 인증서 (public)
  const { data: certs } = await sb
    .from('mad_certificates')
    .select('id, type, issued_at, cert_code, competition_id, award_name')
    .eq('member_id', memberId)
    .eq('status', 'active')
    .order('issued_at', { ascending: false });

  return NextResponse.json({
    member,
    teams,
    certificates: certs ?? [],
  });
}
