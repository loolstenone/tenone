import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

// GET — 로그인 멤버의 팀·제출 이력 (코어 프로그램 모듈 중 MADLeague 창구 회차)
// 응답: { teams: TeamEntry[] } — 화면 호환을 위해 mad_competitions·mad_clubs 키 유지
// 참가자·제출물은 비공개 테이블이라 본인 것만 service_role로 읽는다. 결과는 발표된 회차만.
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

  // 팀원 키 = members.id (데이터 계약 1조)
  const { data: core } = await sb.from('members').select('id').eq('auth_id', user.id).maybeSingle();
  if (!core) return NextResponse.json({ teams: [] });
  const admin = createAdminClient();

  const { data: links, error: linkErr } = await admin
    .from('program_participants')
    .select('team_id, role, round:program_rounds(id, title, year, status, presentation_date, client_name, channels, results_published_at)')
    .eq('member_id', core.id)
    .not('team_id', 'is', null);
  if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 });

  type Round = { id: string; title: string; year: number; status: string; presentation_date: string | null; client_name: string | null; channels: string[]; results_published_at: string | null };
  const mine = ((links ?? []) as unknown as { team_id: string; role: string; round: Round | null }[])
    .filter(l => l.round && (l.round.channels ?? []).includes('madleague'));
  if (!mine.length) return NextResponse.json({ teams: [] });
  const teamIds = mine.map(l => l.team_id);

  const [{ data: teams }, { data: submissions }, { data: results }, { data: memberRows }] = await Promise.all([
    admin.from('program_teams').select('id, name, description, created_at, context').in('id', teamIds).order('created_at', { ascending: false }),
    admin.from('program_submissions').select('id, team_id, stage, title, status, submitted_at, presentation_url').in('team_id', teamIds),
    admin.from('program_results').select('team_id, rank, award_name').in('team_id', teamIds),
    admin.from('program_participants').select('team_id').in('team_id', teamIds),
  ]);

  const clubIds = [...new Set((teams ?? []).map(t => (t.context as { club_id?: string } | null)?.club_id).filter(Boolean))] as string[];
  const { data: clubs } = clubIds.length
    ? await admin.from('mad_clubs').select('id, slug, name, region, color').in('id', clubIds)
    : { data: [] as { id: string; slug: string; name: string; region: string; color: string | null }[] };
  const clubById = new Map((clubs ?? []).map(c => [c.id, { slug: c.slug, name: c.name, region: c.region, color: c.color }]));

  const linkByTeam = new Map(mine.map(l => [l.team_id, l]));
  const countByTeam: Record<string, number> = {};
  (memberRows ?? []).forEach((r: { team_id: string }) => { countByTeam[r.team_id] = (countByTeam[r.team_id] ?? 0) + 1; });

  const enriched = (teams ?? []).map(t => {
    const link = linkByTeam.get(t.id)!;
    const r = link.round!;
    const published = !!r.results_published_at;
    const res = published ? (results ?? []).find(x => x.team_id === t.id) : null;
    const clubId = (t.context as { club_id?: string } | null)?.club_id;
    return {
      id: t.id, name: t.name, description: t.description, created_at: t.created_at,
      myRole: link.role,
      memberCount: countByTeam[t.id] ?? 0,
      mad_competitions: { id: r.id, title: r.title, year: r.year, status: r.status, presentation_date: r.presentation_date, client_name: r.client_name },
      mad_clubs: clubId ? clubById.get(clubId) ?? null : null,
      // 파일은 회차 방에서 서명 URL로만 내려받는다 (file_url 비노출)
      submissions: (submissions ?? []).filter(s => s.team_id === t.id)
        .sort((x, y) => (x.stage === 'final' ? -1 : 1) - (y.stage === 'final' ? -1 : 1))
        .map(s => ({ id: s.id, title: s.title, status: s.status, submitted_at: s.submitted_at, presentation_url: s.presentation_url, file_url: null })),
      result: res ? { rank: res.rank, award_name: res.award_name, is_crown: false } : null,
    };
  });

  return NextResponse.json({ teams: enriched });
}
