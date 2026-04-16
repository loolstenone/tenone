import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// GET — 로그인 멤버의 팀·제출 이력
// 응답: { teams: TeamEntry[] }
export async function GET() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const { data: member } = await sb
    .from('mad_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!member) return NextResponse.json({ error: 'NOT_A_MEMBER' }, { status: 403 });

  // 내가 속한 팀 ID 목록
  const { data: teamLinks, error: tlErr } = await sb
    .from('mad_team_members')
    .select('team_id, role')
    .eq('member_id', (member as { id: string }).id);
  if (tlErr) return NextResponse.json({ error: tlErr.message }, { status: 500 });

  if (!teamLinks || teamLinks.length === 0) {
    return NextResponse.json({ teams: [] });
  }

  const teamIds = (teamLinks as { team_id: string; role: string }[]).map(t => t.team_id);

  // 팀 상세 (경쟁PT 포함)
  const { data: teams, error: teamsErr } = await sb
    .from('mad_competition_teams')
    .select(`
      id, name, description, created_at,
      mad_competitions(id, title, year, status, presentation_date, client_name),
      mad_clubs(slug, name, region, color)
    `)
    .in('id', teamIds)
    .order('created_at', { ascending: false });
  if (teamsErr) return NextResponse.json({ error: teamsErr.message }, { status: 500 });

  // 팀 제출물
  const { data: submissions } = await sb
    .from('mad_submissions')
    .select('id, team_id, title, status, submitted_at, presentation_url, file_url')
    .in('team_id', teamIds);

  // 팀별 결과 (경쟁PT 수상 등)
  const competitionIds = [
    ...new Set(
      (teams ?? []).map((t: Record<string, unknown>) => {
        const comp = t.mad_competitions as { id: string } | null;
        return comp?.id;
      }).filter(Boolean)
    )
  ] as string[];

  const { data: results } = competitionIds.length > 0
    ? await sb
        .from('mad_competition_results')
        .select('team_id, rank, award_name, is_crown, team_name')
        .in('team_id', teamIds)
    : { data: [] };

  // 팀 멤버 수
  const { data: memberCounts } = await sb
    .from('mad_team_members')
    .select('team_id')
    .in('team_id', teamIds);

  const countByTeam: Record<string, number> = {};
  (memberCounts ?? []).forEach((r: { team_id: string }) => {
    countByTeam[r.team_id] = (countByTeam[r.team_id] ?? 0) + 1;
  });

  const roleByTeam: Record<string, string> = {};
  (teamLinks as { team_id: string; role: string }[]).forEach(t => {
    roleByTeam[t.team_id] = t.role;
  });

  const subByTeam: Record<string, typeof submissions extends null ? never[] : NonNullable<typeof submissions>> = {};
  (submissions ?? []).forEach((s: { team_id: string }) => {
    if (!subByTeam[s.team_id]) subByTeam[s.team_id] = [];
    subByTeam[s.team_id].push(s as never);
  });

  const resultByTeam: Record<string, { rank: number | null; award_name: string | null; is_crown: boolean }> = {};
  (results ?? []).forEach((r: { team_id: string | null; rank: number | null; award_name: string | null; is_crown: boolean }) => {
    if (r.team_id) resultByTeam[r.team_id] = r;
  });

  const enriched = (teams ?? []).map((t: Record<string, unknown>) => ({
    ...t,
    myRole: roleByTeam[t.id as string] ?? 'member',
    memberCount: countByTeam[t.id as string] ?? 0,
    submissions: subByTeam[t.id as string] ?? [],
    result: resultByTeam[t.id as string] ?? null,
  }));

  return NextResponse.json({ teams: enriched });
}
