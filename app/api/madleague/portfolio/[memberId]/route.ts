import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface RouteProps {
  params: Promise<{ memberId: string }>;
}

// GET — 퍼블릭 포트폴리오
// portfolio_public=true인 멤버만 조회 가능 (anon도 접근 가능)
export async function GET(_req: Request, { params }: RouteProps) {
  const { memberId } = await params;
  const sb = await createClient();

  // 멤버 기본 정보 (portfolio_public=true만)
  const { data: member, error } = await sb
    .from('mad_members')
    .select(`
      id, name, bio, skill_tags, activity_years, avatar_url,
      university, major, year_in_school, joined_at, status,
      mad_clubs(slug, name, region, color),
      mad_cohorts(year, status)
    `)
    .eq('id', memberId)
    .eq('portfolio_public', true)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!member) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  // 팀 참여 이력 (경쟁PT 결과 포함)
  const { data: teamLinks } = await sb
    .from('mad_team_members')
    .select('team_id, role')
    .eq('member_id', memberId);

  const teamIds = (teamLinks ?? []).map((t: { team_id: string }) => t.team_id);

  let teams: unknown[] = [];
  if (teamIds.length > 0) {
    const { data } = await sb
      .from('mad_competition_teams')
      .select(`
        id, name,
        mad_competitions(title, year, status, presentation_date)
      `)
      .in('id', teamIds)
      .order('created_at', { ascending: false });
    teams = data ?? [];

    // 결과 (수상)
    const { data: results } = await sb
      .from('mad_competition_results')
      .select('team_id, rank, award_name, is_crown')
      .in('team_id', teamIds);

    const resultMap: Record<string, unknown> = {};
    (results ?? []).forEach((r: { team_id: string | null; rank: number | null; award_name: string | null; is_crown: boolean }) => {
      if (r.team_id) resultMap[r.team_id] = r;
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
