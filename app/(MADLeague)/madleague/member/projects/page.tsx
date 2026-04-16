'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Users, Calendar, FileText, ExternalLink, Crown, Medal, Loader2 } from 'lucide-react';

interface Competition {
  id: string;
  title: string;
  year: number;
  status: string;
  presentation_date: string | null;
  client_name: string | null;
}

interface Club {
  slug: string;
  name: string;
  region: string;
  color: string | null;
}

interface Submission {
  id: string;
  title: string;
  status: string;
  submitted_at: string | null;
  presentation_url: string | null;
  file_url: string | null;
}

interface ProjectResult {
  rank: number | null;
  award_name: string | null;
  is_crown: boolean;
}

interface TeamEntry {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  myRole: 'leader' | 'member';
  memberCount: number;
  mad_competitions: Competition | null;
  mad_clubs: Club | null;
  submissions: Submission[];
  result: ProjectResult | null;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    upcoming: { label: '예정', color: 'rgba(255,255,255,0.15)' },
    ongoing: { label: '진행 중', color: 'rgba(236,29,37,0.25)' },
    completed: { label: '완료', color: 'rgba(255,255,255,0.08)' },
    cancelled: { label: '취소', color: 'rgba(255,255,255,0.06)' },
  };
  const s = map[status] ?? { label: status, color: 'rgba(255,255,255,0.08)' };
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: s.color, color: status === 'ongoing' ? '#EC1D25' : 'rgba(255,255,255,0.5)' }}
    >
      {s.label}
    </span>
  );
}

function ResultBadge({ result }: { result: ProjectResult }) {
  if (result.is_crown) {
    return (
      <div className="flex items-center gap-1.5 text-[#FFC000]">
        <Crown className="h-4 w-4" />
        <span className="text-xs font-bold">MAD Crown</span>
      </div>
    );
  }
  if (result.rank) {
    return (
      <div className="flex items-center gap-1.5 text-white/70">
        <Medal className="h-4 w-4" />
        <span className="text-xs font-bold">{result.rank}위{result.award_name ? ` · ${result.award_name}` : ''}</span>
      </div>
    );
  }
  if (result.award_name) {
    return (
      <div className="flex items-center gap-1.5 text-white/70">
        <Trophy className="h-4 w-4" />
        <span className="text-xs font-bold">{result.award_name}</span>
      </div>
    );
  }
  return null;
}

function EmptyState() {
  return (
    <div className="bg-neutral-950 border border-neutral-900 p-12 text-center">
      <Trophy className="h-10 w-10 text-neutral-700 mx-auto mb-4" />
      <div className="text-lg font-black mb-2">아직 참여한 프로젝트가 없습니다</div>
      <p className="text-sm text-neutral-500 mb-6">
        경쟁PT·마케톤·아이디어 무브먼트 등 MADLeague 프로그램에 참가하면<br />
        이곳에 이력이 자동으로 기록됩니다.
      </p>
      <Link
        href="/madleague/programs"
        className="inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] text-white font-bold px-6 py-3 text-sm transition"
      >
        프로그램 보기
      </Link>
    </div>
  );
}

export default function ProjectsPage() {
  const [teams, setTeams] = useState<TeamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/madleague/member/projects')
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error === 'UNAUTHORIZED' ? '로그인이 필요합니다.' : data.error);
        } else {
          setTeams(data.teams ?? []);
        }
      })
      .catch(() => setError('네트워크 오류가 발생했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[var(--mad-black,#000)] text-white min-h-screen">
      {/* 헤더 */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(236,29,37,0.12),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          <Link
            href="/madleague/member"
            className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> 매드리거로 돌아가기
          </Link>
          <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">MEMBER · PROJECTS</div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">참여 프로젝트</h1>
          <p className="mt-3 text-sm text-neutral-400">
            경쟁PT · 마케톤 · 아이디어 무브먼트 등 참가 이력이 자동으로 기록됩니다.
          </p>
        </div>
      </section>

      {/* 본문 */}
      <div className="mx-auto max-w-5xl px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-neutral-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">불러오는 중...</span>
          </div>
        ) : error ? (
          <div className="bg-red-950/30 border border-red-900/40 text-red-400 p-6 text-sm">
            {error}
            {error === '로그인이 필요합니다.' && (
              <Link href="/login?redirect=/madleague/member/projects" className="ml-3 underline">
                로그인
              </Link>
            )}
          </div>
        ) : teams.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* 요약 */}
            <div className="flex gap-6 text-sm text-neutral-400 mb-8">
              <span><strong className="text-white">{teams.length}</strong>개 팀 참가</span>
              <span>
                <strong className="text-white">
                  {teams.filter(t => t.result?.is_crown).length}
                </strong>
                 회 MAD Crown
              </span>
              <span>
                <strong className="text-white">
                  {teams.filter(t => t.result?.rank === 1).length}
                </strong>
                 회 1위
              </span>
            </div>

            {/* 팀 카드 목록 */}
            {teams.map(team => {
              const comp = team.mad_competitions;
              const club = team.mad_clubs;
              const sub = team.submissions[0] ?? null;

              return (
                <div
                  key={team.id}
                  className="bg-neutral-950 border border-neutral-900 hover:border-neutral-700 transition-colors"
                >
                  {/* 카드 헤더 */}
                  <div className="p-6 border-b border-neutral-900">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {comp && <StatusBadge status={comp.status} />}
                          {team.myRole === 'leader' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EC1D25]/15 text-[#EC1D25]">
                              팀장
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-black">{team.name}</h2>
                        {team.description && (
                          <p className="mt-1 text-sm text-neutral-400">{team.description}</p>
                        )}
                      </div>
                      {team.result && <ResultBadge result={team.result} />}
                    </div>
                  </div>

                  {/* 카드 메타 */}
                  <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-neutral-500">
                    {comp && (
                      <div>
                        <div className="text-neutral-600 mb-1">대회</div>
                        <div className="text-white font-medium">{comp.title}</div>
                        {comp.client_name && <div className="text-neutral-500">{comp.client_name}</div>}
                      </div>
                    )}
                    {comp && (
                      <div>
                        <div className="text-neutral-600 mb-1">연도</div>
                        <div className="text-white font-medium flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {comp.year}
                          {comp.presentation_date && (
                            <span className="text-neutral-500">
                              · {new Date(comp.presentation_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {club && (
                      <div>
                        <div className="text-neutral-600 mb-1">동아리</div>
                        <div className="flex items-center gap-1.5 text-white font-medium">
                          <span
                            className="h-2.5 w-2.5 rounded-full inline-block"
                            style={{ backgroundColor: club.color ?? '#EC1D25' }}
                          />
                          {club.name}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-neutral-600 mb-1">팀원</div>
                      <div className="text-white font-medium flex items-center gap-1.5">
                        <Users className="h-3 w-3" />
                        {team.memberCount}명
                      </div>
                    </div>
                  </div>

                  {/* 제출물 */}
                  {sub && (
                    <div className="px-6 pb-4">
                      <div className="bg-black border border-neutral-900 p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-neutral-500" />
                          <span className="font-medium">{sub.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            sub.status === 'submitted' ? 'bg-green-950/40 text-green-400' : 'bg-neutral-900 text-neutral-500'
                          }`}>
                            {sub.status === 'submitted' ? '제출완료' : '초안'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {sub.presentation_url && (
                            <a
                              href={sub.presentation_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition"
                            >
                              발표자료 <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {sub.file_url && (
                            <a
                              href={sub.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition"
                            >
                              파일 <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
