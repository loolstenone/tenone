'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Award, Tag, Calendar, GraduationCap, Crown, Medal, Loader2, Share2, Check } from 'lucide-react';

interface Competition { title: string; year: number; status: string }
interface Team {
  id: string;
  name: string;
  myRole: string;
  mad_competitions: Competition | null;
  result: { rank: number | null; award_name: string | null; is_crown: boolean } | null;
}
interface Certificate { id: string; type: string; issued_at: string; cert_code: string }
interface Member {
  id: string;
  name: string;
  bio: string | null;
  skill_tags: string[] | null;
  activity_years: number[] | null;
  avatar_url: string | null;
  university: string | null;
  major: string | null;
  joined_at: string;
  mad_clubs: { slug: string; name: string; region: string; color: string | null } | null;
  mad_cohorts: { year: number; status: string } | null;
}

const CERT_LABEL: Record<string, string> = {
  activity: '활동인증서',
  competition: '경쟁PT 참가증',
  award: '수상확인서',
  crown: 'MAD Crown',
};

export default function PublicPortfolioPage({ params }: { params: Promise<{ memberId: string }> }) {
  const [memberId, setMemberId] = useState<string | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    params.then(p => setMemberId(p.memberId));
  }, [params]);

  useEffect(() => {
    if (!memberId) return;
    fetch(`/api/madleague/portfolio/${memberId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error === 'NOT_FOUND') { setNotFound(true); return; }
        setMember(data.member);
        setTeams(data.teams ?? []);
        setCerts(data.certificates ?? []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [memberId]);

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `${member?.name}의 포트폴리오`, url }); return; } catch { /* fallback */ }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (notFound || !member) {
    return (
      <div className="bg-[var(--mad-black,#000)] text-white min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-4">PORTFOLIO</div>
          <h1 className="text-3xl font-black mb-4">포트폴리오를 찾을 수 없습니다</h1>
          <p className="text-neutral-500 text-sm mb-8">비공개이거나 존재하지 않는 포트폴리오입니다.</p>
          <Link href="/madleague/member" className="inline-flex items-center gap-2 border border-neutral-700 hover:border-white text-white font-bold px-6 py-3 text-sm transition">
            매드리거로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const club = member.mad_clubs;
  const crownCount = teams.filter(t => t.result?.is_crown).length;
  const awardCount = teams.filter(t => t.result && (t.result.rank === 1 || t.result.is_crown)).length;

  return (
    <div className="bg-[var(--mad-black,#000)] text-white min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.12),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-16">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-6">MADLEAGUE · PORTFOLIO</div>
          <div className="flex items-start gap-6">
            {/* 아바타 */}
            <div
              className="flex-shrink-0 w-20 h-20 flex items-center justify-center text-2xl font-black"
              style={{
                background: club?.color ? `${club.color}22` : 'rgba(236,29,37,0.15)',
                border: `1px solid ${club?.color ?? '#EC1D25'}40`,
              }}
            >
              {member.avatar_url
                ? <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                : member.name.charAt(0)
              }
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{member.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                {club && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: club.color ?? '#EC1D25' }} />
                    <strong className="text-white">{club.name}</strong>
                    <span className="text-neutral-600">· {club.region}</span>
                  </span>
                )}
                {member.university && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {member.university}{member.major ? ` · ${member.major}` : ''}
                  </span>
                )}
                {(member.activity_years ?? []).length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {(member.activity_years ?? []).join(' · ')}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={share}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs border border-neutral-700 hover:border-white px-3 py-2 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? '복사됨' : '공유'}
            </button>
          </div>
          {member.bio && (
            <p className="mt-6 text-neutral-400 leading-relaxed max-w-2xl">{member.bio}</p>
          )}
          {(member.skill_tags ?? []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(member.skill_tags ?? []).map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 bg-neutral-950 border border-neutral-800 text-neutral-300 flex items-center gap-1">
                  <Tag className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 요약 수치 */}
      {(teams.length > 0 || certs.length > 0) && (
        <section className="border-b border-neutral-900">
          <div className="mx-auto max-w-5xl px-6 py-8 grid grid-cols-3 divide-x divide-neutral-900">
            <div className="text-center px-4">
              <div className="text-3xl font-black">{teams.length}</div>
              <div className="text-xs text-neutral-500 mt-1">참여 프로젝트</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl font-black text-[#FFC000]">{crownCount}</div>
              <div className="text-xs text-neutral-500 mt-1">MAD Crown</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl font-black">{certs.length}</div>
              <div className="text-xs text-neutral-500 mt-1">인증서</div>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-12">
        {/* 프로젝트 이력 */}
        {teams.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-5 w-5 text-neutral-500" />
              <h2 className="text-xl font-black">참여 프로젝트</h2>
            </div>
            <div className="space-y-3">
              {teams.map(team => (
                <div key={team.id} className="bg-neutral-950 border border-neutral-900 p-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-black">{team.name}</div>
                    {team.mad_competitions && (
                      <div className="text-xs text-neutral-500 mt-1">
                        {team.mad_competitions.title} · {team.mad_competitions.year}
                        {team.myRole === 'leader' && <span className="ml-2 text-[#EC1D25]">팀장</span>}
                      </div>
                    )}
                  </div>
                  {team.result && (
                    team.result.is_crown ? (
                      <div className="flex items-center gap-1.5 text-[#FFC000]">
                        <Crown className="h-4 w-4" />
                        <span className="text-xs font-bold">MAD Crown</span>
                      </div>
                    ) : team.result.rank === 1 ? (
                      <div className="flex items-center gap-1.5 text-white/70">
                        <Medal className="h-4 w-4" />
                        <span className="text-xs font-bold">1위{team.result.award_name ? ` · ${team.result.award_name}` : ''}</span>
                      </div>
                    ) : team.result.award_name ? (
                      <div className="text-xs font-bold text-neutral-400">{team.result.award_name}</div>
                    ) : null
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 인증서 */}
        {certs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Award className="h-5 w-5 text-neutral-500" />
              <h2 className="text-xl font-black">인증서</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {certs.map(cert => (
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
                  <div className="text-xs text-neutral-600">진위 확인 →</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 빈 상태 */}
        {teams.length === 0 && certs.length === 0 && (
          <div className="text-center py-16 text-neutral-600 text-sm">
            아직 공개된 활동 이력이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
