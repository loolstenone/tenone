import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  FolderKanban, Users, Crown, Medal, ArrowRight, Calendar,
  BookOpen, ChevronRight, Trophy
} from 'lucide-react';

export const metadata = {
  title: '프로젝트 워크스페이스',
  description: '매드리거가 함께 기획하고 실행하는 프로젝트 허브.',
};

/* ─── 타입 ─── */
interface Team {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  memberCount: number;
  competition: { id: string; title: string; year: number; status: string; client_name: string | null; presentation_date: string | null } | null;
  club: { name: string; color: string | null } | null;
  result: { rank: number | null; award_name: string | null; is_crown: boolean } | null;
  isMyTeam: boolean;
  myRole: 'leader' | 'member' | null;
}

/* ─── 서브 컴포넌트 ─── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    upcoming:  { label: '예정', cls: 'bg-white/10 text-white/50' },
    ongoing:   { label: '진행 중', cls: 'bg-[#EC1D25]/20 text-[#EC1D25]' },
    completed: { label: '완료', cls: 'bg-white/5 text-white/40' },
    cancelled: { label: '취소', cls: 'bg-white/5 text-white/30' },
  };
  const s = map[status] ?? { label: status, cls: 'bg-white/5 text-white/30' };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

function ResultBadge({ result }: { result: NonNullable<Team['result']> }) {
  if (result.is_crown) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FFC000]">
      <Crown className="h-3 w-3" /> MAD Crown
    </span>
  );
  if (result.rank) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/50">
      <Medal className="h-3 w-3" /> {result.rank}위{result.award_name ? ` · ${result.award_name}` : ''}
    </span>
  );
  return null;
}

function TeamCard({ team, showMyBadge }: { team: Team; showMyBadge?: boolean }) {
  return (
    <div className={`bg-neutral-950 border transition-colors p-6 ${
      team.isMyTeam ? 'border-[#EC1D25]/40 hover:border-[#EC1D25]' : 'border-neutral-900 hover:border-neutral-700'
    }`}>
      {/* 상단 */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {team.competition && <StatusBadge status={team.competition.status} />}
          {showMyBadge && team.isMyTeam && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EC1D25]/15 text-[#EC1D25]">
              {team.myRole === 'leader' ? '내 팀 · 팀장' : '내 팀'}
            </span>
          )}
        </div>
        {team.result && <ResultBadge result={team.result} />}
      </div>

      <h3 className="text-lg font-black mb-1">{team.name}</h3>
      {team.description && <p className="text-sm text-neutral-500 mb-4">{team.description}</p>}

      {/* 메타 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-neutral-500">
        {team.competition && (
          <div>
            <div className="text-neutral-700 mb-0.5">대회</div>
            <div className="text-white/70 font-medium">{team.competition.title}</div>
            {team.competition.client_name && <div>{team.competition.client_name}</div>}
          </div>
        )}
        {team.competition?.presentation_date && (
          <div>
            <div className="text-neutral-700 mb-0.5">발표일</div>
            <div className="text-white/70 font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(team.competition.presentation_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        )}
        <div>
          <div className="text-neutral-700 mb-0.5">팀원</div>
          <div className="text-white/70 font-medium flex items-center gap-1">
            <Users className="h-3 w-3" /> {team.memberCount}명
            {team.club && <span className="text-neutral-500"> · {team.club.name}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 메인 ─── */
export default async function ProjectsWorkspacePage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return (
      <div className="bg-black text-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">ARENA · PROJECTS</div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black">매드리거만 입장 가능합니다</h1>
          <Link href="/login?redirect=/madleague/projects" className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">로그인</Link>
        </div>
      </div>
    );
  }

  const { data: memberRow } = await sb.from('members').select('id').eq('auth_id', user.id).maybeSingle();
  if (!memberRow) redirect('/madleague/apply');

  const { data: roleRow } = await sb
    .from('member_roles')
    .select('id')
    .eq('member_id', memberRow.id)
    .in('role', ['approved_member', 'leader', 'mentor', 'corporate', 'staff', 'manager', 'super_admin'])
    .eq('context', 'brand:madleague')
    .eq('is_active', true)
    .maybeSingle();

  const { data: globalAdmin } = roleRow ? { data: null } : await sb
    .from('member_roles')
    .select('id')
    .eq('member_id', memberRow.id)
    .eq('role', 'super_admin')
    .eq('is_active', true)
    .maybeSingle();

  if (!roleRow && !globalAdmin) redirect('/madleague/apply');

  /* ── 데이터 로드 ── */
  // mad_members.id (팀 소속 확인용)
  const { data: madMember } = await sb
    .from('mad_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  // 내가 속한 team_id 목록
  let myTeamIds: Set<string> = new Set();
  let myTeamRoles: Record<string, 'leader' | 'member'> = {};

  if (madMember) {
    const { data: links } = await sb
      .from('mad_team_members')
      .select('team_id, role')
      .eq('member_id', (madMember as { id: string }).id);
    (links ?? []).forEach((l: { team_id: string; role: string }) => {
      myTeamIds.add(l.team_id);
      myTeamRoles[l.team_id] = l.role as 'leader' | 'member';
    });
  }

  // 전체 팀 (competition join)
  const { data: rawTeams } = await sb
    .from('mad_competition_teams')
    .select(`
      id, name, description, created_at,
      mad_competitions(id, title, year, status, client_name, presentation_date),
      mad_clubs(name, color)
    `)
    .order('created_at', { ascending: false });

  // 팀 멤버 수
  const teamIds = (rawTeams ?? []).map((t: { id: string }) => t.id);
  const { data: memberCountRows } = teamIds.length > 0
    ? await sb.from('mad_team_members').select('team_id').in('team_id', teamIds)
    : { data: [] };
  const countByTeam: Record<string, number> = {};
  (memberCountRows ?? []).forEach((r: { team_id: string }) => {
    countByTeam[r.team_id] = (countByTeam[r.team_id] ?? 0) + 1;
  });

  // 수상 결과
  const { data: results } = teamIds.length > 0
    ? await sb.from('mad_competition_results').select('team_id, rank, award_name, is_crown').in('team_id', teamIds)
    : { data: [] };
  const resultByTeam: Record<string, Team['result']> = {};
  (results ?? []).forEach((r: { team_id: string | null; rank: number | null; award_name: string | null; is_crown: boolean }) => {
    if (r.team_id) resultByTeam[r.team_id] = r;
  });

  // 팀 데이터 조합
  const teams: Team[] = (rawTeams ?? []).map((t: Record<string, unknown>) => {
    const comp = t.mad_competitions as Team['competition'];
    const club = t.mad_clubs as Team['club'];
    return {
      id: t.id as string,
      name: t.name as string,
      description: t.description as string | null,
      created_at: t.created_at as string,
      memberCount: countByTeam[t.id as string] ?? 0,
      competition: comp,
      club,
      result: resultByTeam[t.id as string] ?? null,
      isMyTeam: myTeamIds.has(t.id as string),
      myRole: myTeamIds.has(t.id as string) ? (myTeamRoles[t.id as string] ?? 'member') : null,
    };
  });

  const myTeams = teams.filter(t => t.isMyTeam);
  const ongoingTeams = teams.filter(t => t.competition?.status === 'ongoing' && !t.isMyTeam);
  const otherTeams = teams.filter(t => t.competition?.status !== 'ongoing' && !t.isMyTeam);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* 헤더 */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,29,37,0.1),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-500 mb-4">
            <Link href="/madleague/arena" className="hover:text-white transition">ARENA</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#EC1D25]">PROJECTS</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FolderKanban className="h-7 w-7 text-[#EC1D25]" />
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">프로젝트</h1>
              </div>
              <p className="text-sm text-neutral-400 max-w-lg">
                매드리거가 함께 기획하고 실행하는 팀 프로젝트 워크스페이스.
                경쟁PT·마케톤·아이디어 무브먼트 팀 활동이 모두 기록됩니다.
              </p>
            </div>
            <Link
              href="/madleague/member/projects"
              className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 px-5 py-2.5 transition shrink-0"
            >
              <BookOpen className="h-4 w-4" /> 내 참여 이력 전체보기
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-16">
        {/* 내 팀 */}
        {myTeams.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-1">MY TEAMS</div>
                <h2 className="text-2xl font-black">내 팀</h2>
              </div>
              <span className="text-sm text-neutral-500">{myTeams.length}개 팀</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {myTeams.map(t => <TeamCard key={t.id} team={t} showMyBadge />)}
            </div>
          </section>
        )}

        {/* 진행 중인 팀 */}
        {ongoingTeams.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-bold tracking-widest text-neutral-500 mb-1">ONGOING</div>
                <h2 className="text-2xl font-black">진행 중인 팀</h2>
              </div>
              <span className="text-sm text-neutral-500">{ongoingTeams.length}개 팀</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ongoingTeams.map(t => <TeamCard key={t.id} team={t} />)}
            </div>
          </section>
        )}

        {/* 전체 팀 없음 */}
        {teams.length === 0 && (
          <section className="bg-neutral-950 border border-neutral-900 p-16 text-center">
            <FolderKanban className="h-12 w-12 text-neutral-700 mx-auto mb-6" />
            <div className="text-xl font-black mb-3">아직 등록된 팀이 없습니다</div>
            <p className="text-sm text-neutral-500 mb-8 max-w-sm mx-auto">
              MADLeague 경쟁PT·마케톤·아이디어 무브먼트에 팀으로 참가하면
              이곳에 워크스페이스가 생성됩니다.
            </p>
            <Link
              href="/madleague/programs"
              className="inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] text-white font-bold px-6 py-3 text-sm transition"
            >
              프로그램 보기 <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        {/* 이전 팀 기록 */}
        {otherTeams.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs font-bold tracking-widest text-neutral-500 mb-1">ARCHIVE</div>
                <h2 className="text-2xl font-black">지난 팀 기록</h2>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherTeams.map(t => <TeamCard key={t.id} team={t} />)}
            </div>
          </section>
        )}

        {/* 하단 네비 */}
        <section className="grid sm:grid-cols-2 gap-4 border-t border-neutral-900 pt-12">
          <Link
            href="/madleague/pt"
            className="group bg-neutral-950 border border-neutral-900 hover:border-[#EC1D25] p-6 transition-all"
          >
            <Trophy className="h-5 w-5 text-[#EC1D25] mb-3" />
            <div className="font-black mb-1">경쟁PT 워크스페이스</div>
            <p className="text-sm text-neutral-500 mb-4">현재 대회 팀 관리 및 제출물 업로드</p>
            <div className="flex items-center gap-1.5 text-sm font-bold text-[#EC1D25] group-hover:gap-3 transition-all">
              입장 <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
          <Link
            href="/madleague/programs"
            className="group bg-neutral-950 border border-neutral-900 hover:border-neutral-600 p-6 transition-all"
          >
            <BookOpen className="h-5 w-5 text-neutral-500 mb-3" />
            <div className="font-black mb-1">MADLeague 프로그램</div>
            <p className="text-sm text-neutral-500 mb-4">경쟁PT · 마케톤 · 아이디어 무브먼트 · DAM</p>
            <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-400 group-hover:text-white group-hover:gap-3 transition-all">
              보기 <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
