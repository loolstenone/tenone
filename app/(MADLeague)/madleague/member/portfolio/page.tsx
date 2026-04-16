import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, ExternalLink, Eye, EyeOff, Trophy, Award, Tag } from 'lucide-react';

export const metadata = { title: '내 포트폴리오', description: '매드리거 포트폴리오 관리' };

const CERT_LABEL: Record<string, string> = {
  activity: '활동인증서',
  competition: '경쟁PT 참가증',
  award: '수상확인서',
  crown: 'MAD Crown',
};

export default async function PortfolioPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect('/login?redirect=/madleague/member/portfolio');

  const { data: member } = await sb
    .from('mad_members')
    .select(`
      id, name, bio, skill_tags, activity_years, avatar_url,
      university, major, portfolio_public, joined_at,
      mad_clubs(slug, name, region, color),
      mad_cohorts(year, status)
    `)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!member) redirect('/madleague/member');

  const m = member as unknown as {
    id: string;
    name: string;
    bio: string | null;
    skill_tags: string[] | null;
    activity_years: number[] | null;
    avatar_url: string | null;
    university: string | null;
    major: string | null;
    portfolio_public: boolean;
    joined_at: string;
    mad_clubs: { slug: string; name: string; region: string; color: string | null } | null;
    mad_cohorts: { year: number; status: string } | null;
  };

  // 팀 이력
  const { data: teamLinks } = await sb
    .from('mad_team_members')
    .select('team_id, role')
    .eq('member_id', m.id);

  const teamIds = (teamLinks ?? []).map((t: { team_id: string }) => t.team_id);

  let teams: { id: string; name: string; myRole: string; mad_competitions: { title: string; year: number } | null; result: { rank: number | null; award_name: string | null; is_crown: boolean } | null }[] = [];
  if (teamIds.length > 0) {
    const { data: teamsData } = await sb
      .from('mad_competition_teams')
      .select('id, name, mad_competitions(title, year)')
      .in('id', teamIds)
      .order('created_at', { ascending: false });

    const { data: results } = await sb
      .from('mad_competition_results')
      .select('team_id, rank, award_name, is_crown')
      .in('team_id', teamIds);

    const resultMap: Record<string, { rank: number | null; award_name: string | null; is_crown: boolean }> = {};
    (results ?? []).forEach((r: { team_id: string | null; rank: number | null; award_name: string | null; is_crown: boolean }) => {
      if (r.team_id) resultMap[r.team_id] = r;
    });

    const roleMap: Record<string, string> = {};
    (teamLinks ?? []).forEach((t: { team_id: string; role: string }) => { roleMap[t.team_id] = t.role; });

    type TeamRow = { id: string; name: string; mad_competitions: { title: string; year: number } | null };
    teams = ((teamsData ?? []) as unknown as TeamRow[]).map((t) => ({
      ...t,
      myRole: roleMap[t.id] ?? 'member',
      result: resultMap[t.id] ?? null,
    }));
  }

  // 인증서
  const { data: certs } = await sb
    .from('mad_certificates')
    .select('id, type, issued_at, cert_code')
    .eq('member_id', m.id)
    .eq('status', 'active')
    .order('issued_at', { ascending: false });

  const publicUrl = `/madleague/portfolio/${m.id}`;

  return (
    <div className="bg-[var(--mad-black,#000)] text-white min-h-screen">
      {/* 헤더 */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(236,29,37,0.1),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          <Link href="/madleague/member" className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> 매드리거로 돌아가기
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">MEMBER · PORTFOLIO</div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">내 포트폴리오</h1>
              <p className="mt-2 text-sm text-neutral-500">
                활동 이력이 자동으로 집계됩니다.{' '}
                {m.portfolio_public
                  ? <span className="text-green-400">공개 중</span>
                  : <span className="text-neutral-500">비공개</span>
                }
              </p>
            </div>
            <div className="flex gap-2">
              {m.portfolio_public && (
                <Link
                  href={publicUrl}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs border border-neutral-700 hover:border-white text-white px-4 py-2 transition"
                >
                  <ExternalLink className="h-3 w-3" /> 공개 보기
                </Link>
              )}
              <Link
                href="/madleague/member/profile"
                className="inline-flex items-center gap-1.5 text-xs border border-neutral-700 hover:border-white text-white px-4 py-2 transition"
              >
                프로필 편집
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">

        {/* 공개 설정 배너 */}
        <div className={`border p-5 flex items-center justify-between gap-4 ${
          m.portfolio_public
            ? 'border-green-900/40 bg-green-950/20'
            : 'border-neutral-800 bg-neutral-950'
        }`}>
          <div className="flex items-center gap-3">
            {m.portfolio_public
              ? <Eye className="h-5 w-5 text-green-400" />
              : <EyeOff className="h-5 w-5 text-neutral-500" />
            }
            <div>
              <div className="font-bold text-sm">
                {m.portfolio_public ? '포트폴리오 공개 중' : '포트폴리오 비공개'}
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                {m.portfolio_public
                  ? `누구나 ${publicUrl} 에서 볼 수 있습니다.`
                  : '프로필 편집 > 포트폴리오 공개 설정으로 공개할 수 있습니다.'
                }
              </div>
            </div>
          </div>
          <Link
            href="/madleague/member/profile"
            className="text-xs border border-neutral-700 hover:border-white px-4 py-2 transition whitespace-nowrap"
          >
            설정 변경
          </Link>
        </div>

        {/* 기본 정보 */}
        <div className="bg-neutral-950 border border-neutral-900 p-8">
          <h2 className="text-lg font-black mb-6 flex items-center gap-2">
            기본 정보
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-neutral-600 mb-1">이름</div>
              <div className="font-bold">{m.name}</div>
            </div>
            {m.mad_clubs && (
              <div>
                <div className="text-xs text-neutral-600 mb-1">동아리</div>
                <div className="flex items-center gap-2 font-bold">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.mad_clubs.color ?? '#EC1D25' }} />
                  {m.mad_clubs.name}
                  <span className="text-neutral-500 font-normal">· {m.mad_clubs.region}</span>
                </div>
              </div>
            )}
            {m.university && (
              <div>
                <div className="text-xs text-neutral-600 mb-1">학교</div>
                <div className="font-medium">{m.university}{m.major && ` · ${m.major}`}</div>
              </div>
            )}
            <div>
              <div className="text-xs text-neutral-600 mb-1">활동 연도</div>
              <div className="font-medium">{(m.activity_years ?? []).join(', ') || '-'}</div>
            </div>
          </div>
          {m.bio && (
            <div className="mt-6 pt-6 border-t border-neutral-900">
              <div className="text-xs text-neutral-600 mb-2">소개</div>
              <p className="text-sm text-neutral-300 leading-relaxed">{m.bio}</p>
            </div>
          )}
          {(m.skill_tags ?? []).length > 0 && (
            <div className="mt-4">
              <div className="text-xs text-neutral-600 mb-2 flex items-center gap-1.5"><Tag className="h-3 w-3" /> 스킬 태그</div>
              <div className="flex flex-wrap gap-2">
                {(m.skill_tags ?? []).map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 프로젝트 이력 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Trophy className="h-5 w-5 text-neutral-500" /> 참여 프로젝트
            </h2>
            <Link href="/madleague/member/projects" className="text-xs text-neutral-500 hover:text-white transition">
              전체 보기 →
            </Link>
          </div>
          {teams.length === 0 ? (
            <div className="bg-neutral-950 border border-neutral-900 p-8 text-center text-sm text-neutral-500">
              아직 참여한 프로젝트가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map(team => (
                <div key={team.id} className="bg-neutral-950 border border-neutral-900 p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-sm">{team.name}</div>
                    {team.mad_competitions && (
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {team.mad_competitions.title} · {team.mad_competitions.year}
                      </div>
                    )}
                  </div>
                  {team.result && (
                    <div className={`text-xs font-bold px-2 py-1 ${
                      team.result.is_crown
                        ? 'bg-[#FFC000]/15 text-[#FFC000] border border-[#FFC000]/25'
                        : 'bg-neutral-900 text-neutral-400'
                    }`}>
                      {team.result.is_crown ? 'MAD Crown' : team.result.award_name ?? (team.result.rank ? `${team.result.rank}위` : '참가')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 인증서 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Award className="h-5 w-5 text-neutral-500" /> 인증서
            </h2>
            <Link href="/madleague/member/certificate" className="text-xs text-neutral-500 hover:text-white transition">
              인증서 발급 →
            </Link>
          </div>
          {(certs ?? []).length === 0 ? (
            <div className="bg-neutral-950 border border-neutral-900 p-8 text-center text-sm text-neutral-500">
              발급된 인증서가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(certs ?? []).map((cert: { id: string; type: string; issued_at: string; cert_code: string }) => (
                <Link
                  key={cert.id}
                  href={`/madleague/certificate/verify/${cert.cert_code}`}
                  className="bg-neutral-950 border border-neutral-900 hover:border-neutral-700 p-5 flex items-center justify-between transition"
                >
                  <div>
                    <div className="font-bold text-sm">{CERT_LABEL[cert.type] ?? cert.type}</div>
                    <div className="text-xs text-neutral-600 mt-0.5">
                      {new Date(cert.issued_at).toLocaleDateString('ko-KR')} · #{cert.cert_code}
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-neutral-600" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
