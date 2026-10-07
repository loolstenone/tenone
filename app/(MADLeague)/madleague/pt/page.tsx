import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getMadAccess } from '@/lib/madleague-roles';
import { MadLoginButton } from '@/features/madleague/MadLoginButton';
import { PtSubmissionPanel } from '@/features/madleague/PtSubmissionPanel';
import { Trophy, Users, Medal, Calendar, ChevronRight, ArrowRight } from 'lucide-react';

export const metadata = {
  title: '경쟁PT 워크스페이스',
  description: '경쟁 PT 참여 팀의 작업 공간 — 브리프·팀·제출·결과.',
};

/* ─── 타입 ─── */
interface Competition {
  id: string;
  title: string;
  year: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  brief_title: string | null;
  brief_content: string | null;
  kind: 'competition' | 'project';
  final_deadline: string | null;
  results_published_at: string | null;
  client_name: string | null;
  client_logo_url: string | null;
  start_date: string | null;
  end_date: string | null;
  presentation_date: string | null;
}

interface Team {
  id: string;
  name: string;
  description: string | null;
  competition_id: string;
  memberCount: number;
  myRole: 'leader' | 'member' | null;
  isFinalist: boolean;
  result: { rank: number | null; award_name: string | null; is_crown: boolean } | null;
}

/* ─── 서브 컴포넌트 ─── */
function CompStatusBadge({ status }: { status: Competition['status'] }) {
  const map = {
    upcoming:  { label: '모집 예정', cls: 'bg-white/10 text-white/60' },
    ongoing:   { label: '진행 중', cls: 'bg-[#EC1D25]/20 text-[#EC1D25]' },
    completed: { label: '종료', cls: 'bg-white/5 text-white/40' },
    cancelled: { label: '취소', cls: 'bg-white/5 text-white/30' },
  };
  const s = map[status];
  return <span className={`text-[11px] font-bold px-2.5 py-1 ${s.cls}`}>{s.label}</span>;
}

function ResultBadge({ result }: { result: NonNullable<Team['result']> }) {
  // 경쟁 PT에는 MAD Crown 표기를 쓰지 않는다 — 순위만 (사용자 결정 2026-10-07)
  if (result.rank) return (
    <div className="inline-flex items-center gap-1.5 text-sm font-bold text-white/60">
      <Medal className="h-4 w-4" /> {result.rank}위{result.award_name ? ` · ${result.award_name}` : ''}
    </div>
  );
  if (result.award_name) return (
    <div className="inline-flex items-center gap-1.5 text-sm font-bold text-white/60">
      <Trophy className="h-4 w-4" /> {result.award_name}
    </div>
  );
  return null;
}

const fmtDay = (d: string) => new Date(`${d}T00:00:00+09:00`).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

function TeamPanel({ team, comp }: { team: Team; comp: Competition }) {
  return (
    <div className="bg-neutral-950 border border-[#EC1D25]/30 p-6 space-y-5">
      {/* 팀 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#EC1D25]/15 text-[#EC1D25]">
              {team.myRole === 'leader' ? '내 팀 · 팀장' : '내 팀 · 팀원'}
            </span>
            {team.isFinalist && <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FFC000]/15 text-[#FFC000]">본선 진출</span>}
          </div>
          <h3 className="text-xl font-black">{team.name}</h3>
          {team.description && <p className="text-sm text-neutral-500 mt-1">{team.description}</p>}
        </div>
        {team.result && <ResultBadge result={team.result} />}
      </div>

      {/* 팀 메타 */}
      <div className="flex items-center gap-4 text-sm text-neutral-500 border-t border-neutral-900 pt-4">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" /> 팀원 {team.memberCount}명
        </span>
      </div>

      {/* 본선 제출 — 진출 팀만, 현장 PT 전까지 디벨롭한 제안서 */}
      {team.isFinalist && (
        <div className="border border-[#FFC000]/30 p-5">
          <div className="text-xs font-bold tracking-widest text-[#FFC000] mb-1">본선 제출 · FINAL</div>
          <p className="text-xs text-neutral-500 mb-4">현장 PT 전까지 디벨롭한 제안서를 올려 주세요.{comp.final_deadline ? ` 마감 ${fmtDay(comp.final_deadline)}` : ''}</p>
          <PtSubmissionPanel teamId={team.id} stage="final" />
        </div>
      )}

      {/* 예선 제출 — 팀원 누구나 올리고 최종 제출 (마감 전) */}
      <div>
        <div className="text-xs font-bold tracking-widest text-neutral-600 mb-3">{comp.kind === 'project' ? '제출 · SUBMISSION' : '예선 제출 · SUBMISSION'}</div>
        <PtSubmissionPanel teamId={team.id} stage="prelim" />
      </div>
    </div>
  );
}

function OtherTeamsGrid({ teams }: { teams: Team[] }) {
  if (teams.length === 0) return null;
  return (
    <div className="space-y-3">
      {teams.map(team => (
        <div key={team.id} className="bg-neutral-950 border border-neutral-900 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-neutral-600 shrink-0" />
            <div>
              <div className="text-sm font-bold">{team.name}</div>
              <div className="text-xs text-neutral-600 mt-0.5">{team.memberCount}명</div>
            </div>
          </div>
          {team.result && <ResultBadge result={team.result} />}
        </div>
      ))}
    </div>
  );
}

/* ─── 메인 ─── */
export default async function PTWorkspacePage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return (
      <div className="bg-black text-white min-h-[60vh]">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">MADLEAGUER · PT</div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black">매드리거만 입장 가능합니다</h1>
          <MadLoginButton className="mt-8 inline-block bg-[#EC1D25] text-white font-bold px-8 py-4">로그인</MadLoginButton>
        </div>
      </div>
    );
  }

  const { data: memberRow } = await sb.from('members').select('id').eq('auth_id', user.id).maybeSingle();
  if (!memberRow) redirect('/madleague/apply');

  // 매드리거(club·showcase 활동 역할) 또는 직원만 — member_capability_roles SSOT
  const access = await getMadAccess(memberRow.id);
  if (!access.canEnter) redirect('/madleague/apply');

  /* ── 데이터 로드 ── 입장 확인 후 서버에서만 (팀원·제출물 행은 RLS 비공개) */
  const db = createAdminClient();

  // 진행 중·예정 대회
  const { data: competitions } = await db
    .from('mad_competitions')
    .select('*')
    .in('status', ['ongoing', 'upcoming'])
    .order('year', { ascending: false })
    .order('presentation_date', { ascending: true });

  // 최근 완료 대회도 1개 추가 (결과 확인용)
  const { data: recentCompleted } = await db
    .from('mad_competitions')
    .select('*')
    .eq('status', 'completed')
    .order('presentation_date', { ascending: false })
    .limit(1);

  const allComps: Competition[] = [...(competitions ?? []), ...(recentCompleted ?? [])];
  const compIds = allComps.map(c => c.id);

  // 전체 팀 (해당 대회들)
  const { data: rawTeams } = compIds.length > 0
    ? await db
        .from('mad_competition_teams')
        .select('id, name, description, competition_id, is_finalist')
        .in('competition_id', compIds)
    : { data: [] };

  const teamIds = (rawTeams ?? []).map((t: { id: string }) => t.id);

  // 내 팀 소속 — 팀원 키 = members.id (데이터 계약 1조)
  const myTeamIds = new Set<string>();
  const myRoleByTeam: Record<string, 'leader' | 'member'> = {};

  if (teamIds.length > 0) {
    const { data: myLinks } = await db
      .from('mad_team_members')
      .select('team_id, role')
      .eq('member_id', memberRow.id)
      .in('team_id', teamIds);
    (myLinks ?? []).forEach((l: { team_id: string; role: string }) => {
      myTeamIds.add(l.team_id);
      myRoleByTeam[l.team_id] = l.role as 'leader' | 'member';
    });
  }

  // 팀 멤버 수
  const { data: memberCountRows } = teamIds.length > 0
    ? await db.from('mad_team_members').select('team_id').in('team_id', teamIds)
    : { data: [] };
  const countByTeam: Record<string, number> = {};
  (memberCountRows ?? []).forEach((r: { team_id: string }) => {
    countByTeam[r.team_id] = (countByTeam[r.team_id] ?? 0) + 1;
  });

  // 수상 결과
  const { data: results } = teamIds.length > 0
    ? await db.from('mad_competition_results').select('team_id, rank, award_name, is_crown').in('team_id', teamIds)
    : { data: [] };
  const resultByTeam: Record<string, Team['result']> = {};
  // 결과 발표 전에는 숨김 (results_published_at — 인트라 '결과 발표')
  const publishedComp = new Set(allComps.filter(c => c.results_published_at).map(c => c.id));
  const compOfTeam = new Map((rawTeams ?? []).map((t: { id: string; competition_id: string }) => [t.id, t.competition_id]));
  (results ?? []).forEach((r: { team_id: string | null; rank: number | null; award_name: string | null; is_crown: boolean }) => {
    if (r.team_id && publishedComp.has(compOfTeam.get(r.team_id) ?? '')) resultByTeam[r.team_id] = r;
  });

  // 팀 조합
  const teams: Team[] = (rawTeams ?? []).map((t: { id: string; name: string; description: string | null; competition_id: string; is_finalist: boolean }) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    competition_id: t.competition_id,
    memberCount: countByTeam[t.id] ?? 0,
    myRole: myTeamIds.has(t.id) ? (myRoleByTeam[t.id] ?? 'member') : null,
    isFinalist: t.is_finalist,
    result: resultByTeam[t.id] ?? null,
    isMyTeam: myTeamIds.has(t.id),
  }));

  // 대회별 팀 인덱스
  const teamsByComp: Record<string, Team[]> = {};
  teams.forEach(t => {
    if (!teamsByComp[t.competition_id]) teamsByComp[t.competition_id] = [];
    teamsByComp[t.competition_id].push(t);
  });

  return (
    <div className="bg-black text-white min-h-screen">
      {/* 헤더 */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,rgba(236,29,37,0.15),transparent_55%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-500 mb-4">
            <Link href="/madleague/madleaguer" className="hover:text-white transition">MADLEAGUER</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#EC1D25]">PT WORKSPACE</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-7 w-7 text-[#EC1D25]" />
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">경쟁PT 워크스페이스</h1>
          </div>
          <p className="text-sm text-neutral-400 max-w-lg">
            경쟁 PT 참여 팀의 작업 공간.
            팀 현황 확인, 제출물 관리, 발표 준비를 여기서 합니다.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12 space-y-16">
        {/* 대회별 섹션 */}
        {allComps.length === 0 ? (
          <section className="bg-neutral-950 border border-neutral-900 p-16 text-center">
            <Trophy className="h-12 w-12 text-neutral-700 mx-auto mb-6" />
            <div className="text-xl font-black mb-3">현재 진행 중인 경쟁PT가 없습니다</div>
            <p className="text-sm text-neutral-500 mb-8 max-w-sm mx-auto">
              다음 경쟁PT 일정은 MADLeague 공지를 확인하세요.
              지난 수상작은 아카이브에서 볼 수 있습니다.
            </p>
            <Link
              href="/madleague/programs/competition"
              className="inline-flex items-center gap-2 border border-neutral-700 hover:border-white text-white font-bold px-6 py-3 text-sm transition"
            >
              수상작 아카이브 보기 <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : (
          allComps.map((comp) => {
            const compTeams = teamsByComp[comp.id] ?? [];
            const myTeam = compTeams.find(t => t.myRole !== null) ?? null;
            const otherTeams = compTeams.filter(t => t.myRole === null);

            return (
              <section key={comp.id}>
                {/* 대회 헤더 */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8 pb-6 border-b border-neutral-900">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CompStatusBadge status={comp.status} />
                      <span className="text-[11px] font-bold px-2.5 py-1 bg-white/5 text-white/60">{comp.kind === 'project' ? '프로젝트' : '경쟁 PT'}</span>
                      <span className="text-xs text-neutral-600">{comp.year}년</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black">{comp.title}</h2>
                    {comp.client_name && (
                      <p className="text-sm text-neutral-500 mt-1">클라이언트 · {comp.client_name}</p>
                    )}
                    {comp.brief_title && (
                      <p className="mt-3 text-sm text-neutral-400 max-w-xl">{comp.brief_title}</p>
                    )}
                    {(myTeam || access.isStaff || access.roles.some(r => r.capability_key === 'showcase' && r.context?.competition_id === comp.id)) && (
                      <Link href={`/madleague/pt/${comp.id}`}
                        className="mt-4 inline-flex items-center gap-2 bg-[#EC1D25] px-5 py-2.5 text-sm font-bold text-white">
                        공지 · Q&amp;A · 제출 <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                    {/* 브리프 내용 — 참여 팀원에게만 (인트라 경쟁 PT에서 입력) */}
                    {comp.brief_content && myTeamIds.size > 0 && compTeams.some(t => t.myRole !== null) && (
                      <p className="mt-3 text-sm text-neutral-300 max-w-2xl whitespace-pre-line leading-relaxed">{comp.brief_content}</p>
                    )}
                  </div>
                  {comp.presentation_date && (
                    <div className="bg-neutral-950 border border-neutral-900 px-5 py-3 text-center shrink-0">
                      <div className="text-xs text-neutral-600 mb-1 font-bold tracking-widest">발표일</div>
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Calendar className="h-4 w-4 text-[#EC1D25]" />
                        {new Date(comp.presentation_date).toLocaleDateString('ko-KR', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 내 팀 패널 */}
                {myTeam ? (
                  <div className="mb-8">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-4">MY TEAM</div>
                    <TeamPanel team={myTeam} comp={comp} />
                  </div>
                ) : comp.status === 'ongoing' ? (
                  <div className="mb-8 bg-neutral-950 border border-dashed border-neutral-800 p-8 text-center">
                    <Users className="h-8 w-8 text-neutral-700 mx-auto mb-3" />
                    <p className="text-sm text-neutral-500 mb-4">아직 참여 팀이 없습니다. 운영진에게 팀 배정을 요청하세요.</p>
                    <Link href="/madleague/contact"
                      className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600 px-5 py-2.5 transition">
                      운영진 문의
                    </Link>
                  </div>
                ) : null}

                {/* 전체 팀 현황 */}
                {otherTeams.length > 0 && (
                  <div>
                    <div className="text-xs font-bold tracking-widest text-neutral-600 mb-4">
                      ALL TEAMS · {otherTeams.length}팀 참가
                    </div>
                    <OtherTeamsGrid teams={otherTeams} />
                  </div>
                )}

                {compTeams.length === 0 && comp.status === 'completed' && (
                  <p className="text-sm text-neutral-600">이 대회의 팀 데이터가 없습니다.</p>
                )}
              </section>
            );
          })
        )}

        {/* 하단 링크 */}
        <section className="grid sm:grid-cols-2 gap-4 border-t border-neutral-900 pt-12">
          <Link
            href="/madleague/programs/competition"
            className="group bg-neutral-950 border border-neutral-900 hover:border-[#FFC000]/40 p-6 transition-all"
          >
            <Medal className="h-5 w-5 text-[#FFC000] mb-3" />
            <div className="font-black mb-1">명예의 전당</div>
            <p className="text-sm text-neutral-500 mb-4">역대 경쟁PT 수상작 아카이브</p>
            <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-400 group-hover:text-[#FFC000] group-hover:gap-3 transition-all">
              아카이브 보기 <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
