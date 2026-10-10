import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { MapPin, ArrowRight, ArrowUpRight, ChevronLeft, Settings, Mail, Calendar } from 'lucide-react';
import { fetchMadClubBySlug } from '@/lib/supabase/madleague';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canEditClubProfile, canViewClubApplications, getMadAccess } from '@/lib/madleague-roles';
import { sortByYearDesc } from '@/lib/madleague-club-profile';
import { archiveBadgesForClub, ledgerGroupToClubSlug, type ClubBadge } from '@/features/madleague/competition-archive';
import { CompetitionBadge } from '@/features/madleague/CompetitionBadge';
import { fetchClubRecruitForms, recruitPeriodLabel } from '@/lib/madleague-recruit';
import type { ClubProfile } from '@/types/madleague-club-profile';

/*
 * 동아리 소개 페이지 — 표준 템플릿 (2026-10-10)
 *   히어로 → 숫자 → 소개·핵심 가치 → MAD League 경쟁 PT(배지·참가, 자동) → 팀 → 활동·일정 → 프로젝트 → 수상 → 네트워크 → 모집 안내 → 채널
 *   내용 = mad_clubs.profile (운영진이 /clubs/{slug}/manage에서 편집). 비어 있는 섹션은 숨긴다.
 */

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const club = await fetchMadClubBySlug(slug);
  return {
    title: club ? `${club.name} — ${club.region}` : '동아리',
    description: club?.description ?? undefined,
  };
}

function Section({ eyebrow, title, children, tinted }: { eyebrow: string; title: string; children: ReactNode; tinted?: boolean }) {
  return (
    <section className={tinted ? 'bg-neutral-950 border-y border-neutral-900' : ''}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">{eyebrow}</div>
        <h2 className="text-3xl sm:text-4xl font-black mb-10">{title}</h2>
        {children}
      </div>
    </section>
  );
}

/** 경쟁 PT 참가 기록 — 인증서 대장 집계 (동아리 단위 인원 수만, 개인 정보 없음) */
async function competitionParticipation(slug: string): Promise<Array<{ year: number; title: string; count: number }>> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from('program_certificates')
      .select('snapshot')
      .eq('brand_id', 'madleague').eq('type', 'participation').is('revoked_at', null)
      .limit(5000);
    const byRound = new Map<string, { year: number; title: string; count: number }>();
    for (const row of (data ?? []) as Array<{ snapshot: Record<string, unknown> | null }>) {
      const s = row.snapshot ?? {};
      if (ledgerGroupToClubSlug(s.group_name as string | null) !== slug) continue;
      const year = Number(s.year);
      const title = String(s.round_title ?? s.title ?? '');
      if (!year || !title) continue;
      const key = `${year}|${title}`;
      const cur = byRound.get(key) ?? { year, title, count: 0 };
      cur.count += 1;
      byRound.set(key, cur);
    }
    return [...byRound.values()].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  } catch {
    return [];
  }
}

export default async function ClubDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const club = await fetchMadClubBySlug(slug);
  if (!club) notFound();
  const profile = ((club as unknown as { profile?: ClubProfile }).profile ?? {}) as ClubProfile;

  const sb = await createClient();
  const [archiveRes, resultsRes, participation, recruitForms] = await Promise.all([
    sb.from('mad_archive').select('id, title, year, thumbnail_url, type, award').eq('club_id', club.id).order('year', { ascending: false }).limit(6),
    // 코어 프로그램 결과 — 발표된 회차만 RLS로 읽힘, 동아리 = context.club_id
    sb.from('program_results').select('id, team_name, rank, award_name, round_id').eq('context->>club_id', club.id).order('rank', { ascending: true }),
    competitionParticipation(club.slug),
    fetchClubRecruitForms(),
  ]);
  const recruitForm = recruitForms.get(club.slug) ?? null;
  const archive = (archiveRes.data ?? []) as Array<{ id: string; title: string; year: number; thumbnail_url: string | null; type: string; award: string | null }>;
  const results = (resultsRes.data ?? []) as Array<{ id: string; team_name: string; rank: number | null; award_name: string | null; round_id: string }>;

  // 새 회차 수상 → 배지 (회차 연도·이름)
  const roundIds = [...new Set(results.map(r => r.round_id))];
  const { data: rounds } = roundIds.length
    ? await sb.from('program_rounds').select('id, year, title').in('id', roundIds)
    : { data: [] as Array<{ id: string; year: number; title: string }> };
  const roundMap = new Map((rounds ?? []).map(r => [r.id, r]));
  const liveBadges: ClubBadge[] = results.flatMap(r => {
    const round = roundMap.get(r.round_id);
    if (!round) return [];
    const label = r.rank ? `${r.rank}위` : (r.award_name ?? '수상');
    return [{ key: r.id, year: round.year, title: round.title, rank: r.rank, label: r.award_name && r.rank ? `${label} · ${r.award_name}` : label }];
  });
  const badges = [...liveBadges, ...archiveBadgesForClub(club.slug)].sort((a, b) => b.year - a.year || (a.rank ?? 99) - (b.rank ?? 99));

  const accent = club.color ?? '#EC1D25';
  const awards = sortByYearDesc(profile.awards ?? []);
  const projects = sortByYearDesc(profile.projects ?? []);
  const stats = [
    ...(club.established_year ? [{ label: '창립', value: `${club.established_year}년` }] : []),
    ...(profile.stats ?? []),
    ...(badges.length ? [{ label: 'MAD League 경쟁 PT 수상', value: `${badges.length}회` }] : []),
  ];
  // 모집: 공동 모집 지원서(유니버스 폼)가 열려 있으면 그것이 우선, 아니면 운영진이 적은 안내·외부 링크
  const formOpen = recruitForm?.availability === 'open';
  const recruitOpen = formOpen || profile.recruit?.status === 'open';
  const recruitPeriod = (formOpen && recruitForm ? recruitPeriodLabel(recruitForm) : null) ?? profile.recruit?.period;
  const recruitHref = formOpen && recruitForm ? `/madleague/forms/${recruitForm.slug}` : profile.recruit?.link;
  const showRecruit = recruitOpen || !!profile.recruit;

  // 동아리 관리 링크: 직원 · 이 동아리 운영진 · 담당 멘토(지원서만)
  let canManage = false;
  try {
    const { data: { user } } = await sb.auth.getUser();
    if (user) {
      const adminClient = createAdminClient();
      const { data: memberRow } = await adminClient.from('members').select('id').eq('auth_id', user.id).maybeSingle();
      if (memberRow) {
        const access = await getMadAccess(memberRow.id);
        canManage = canViewClubApplications(access, memberRow.id, club) || canEditClubProfile(access, memberRow.id, club);
      }
    }
  } catch { /* 비로그인 시 무시 */ }

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* Back link */}
      <div className="mx-auto max-w-7xl px-6 pt-8 flex items-center justify-between">
        <Link href="/madleague/clubs" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition">
          <ChevronLeft className="h-4 w-4" /> 동아리 목록
        </Link>
        {canManage && (
          <Link
            href={`/madleague/clubs/${slug}/manage`}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-neutral-700 text-neutral-400 hover:border-neutral-400 hover:text-white transition"
          >
            <Settings className="h-3.5 w-3.5" /> 동아리 관리
          </Link>
        )}
      </div>

      {/* 히어로 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 20% 50%, ${accent}, transparent 60%)` }} aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          {club.logo_url ? (
            <div className="h-20 w-20 mb-8 flex items-center justify-center bg-white">
              <Image src={club.logo_url} alt={club.name} width={80} height={80} className="object-contain" />
            </div>
          ) : (
            <div className="h-20 w-20 mb-8" style={{ backgroundColor: accent }} />
          )}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight">{club.name}</h1>
          {profile.full_name && <p className="mt-3 text-lg text-neutral-300">{profile.full_name}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-neutral-400">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{club.region}</span>
            {profile.universities && <span className="text-sm">{profile.universities}</span>}
          </div>
          {profile.slogan && <p className="mt-10 text-2xl sm:text-3xl font-black break-keep">“{profile.slogan}”</p>}
          {club.description && <p className="mt-6 max-w-2xl text-lg text-neutral-300 leading-relaxed break-keep">{club.description}</p>}
          {recruitOpen && (
            <a href="#recruit" className="mt-8 inline-flex items-center gap-2 bg-[#EC1D25] px-5 py-3 text-sm font-bold">
              부원 모집 중{recruitPeriod ? ` · ${recruitPeriod}` : ''} <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </section>

      {/* 숫자 */}
      {stats.length > 0 && (
        <section className="border-y border-neutral-900 bg-black">
          <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label}>
                <div className="text-xs font-bold tracking-widest text-neutral-500 mb-2">{s.label}</div>
                <div className="text-2xl sm:text-3xl font-black break-keep">{s.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 소개 · 핵심 가치 */}
      {(profile.intro || (profile.values?.length ?? 0) > 0) && (
        <Section eyebrow="ABOUT" title="동아리 소개">
          {profile.intro && <p className="max-w-3xl text-lg text-neutral-300 leading-relaxed whitespace-pre-line break-keep">{profile.intro}</p>}
          {profile.values && profile.values.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.values.map(v => (
                <div key={v.title} className="border border-neutral-900 bg-neutral-950 p-6">
                  <div className="text-xl font-black">{v.title}</div>
                  {v.desc && <p className="mt-3 text-sm text-neutral-400 leading-relaxed break-keep">{v.desc}</p>}
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* MAD League 경쟁 PT — 자동 */}
      {(badges.length > 0 || participation.length > 0) && (
        <Section eyebrow="MAD LEAGUE" title="경쟁 PT" tinted>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {badges.map(b => (
                <div key={b.key} className="w-32 sm:w-40 text-center">
                  {b.img
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={b.img} alt={`${b.title} ${b.label}`} className="w-full h-auto" />
                    : <CompetitionBadge year={b.year} rank={b.rank} logoUrl={club.logo_url} clubName={club.name} className="w-full h-auto" />}
                  <div className="mt-3 text-xs text-neutral-400 break-keep">{b.title}</div>
                  <div className="text-sm font-bold">{b.label}</div>
                </div>
              ))}
            </div>
          )}
          {participation.length > 0 && (
            <div className={badges.length ? 'mt-14' : ''}>
              <div className="text-sm font-bold text-neutral-400 mb-4">참가 기록</div>
              <div className="divide-y divide-neutral-900 border-y border-neutral-900">
                {participation.map(p => (
                  <div key={`${p.year}-${p.title}`} className="flex items-center justify-between py-4 text-sm">
                    <span><span className="text-neutral-500 mr-3 tabular-nums">{p.year}</span>{p.title}</span>
                    <span className="text-neutral-400">{p.count}명 참가</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Link href="/madleague/programs/competition" className="mt-10 inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white">
            명예의 전당 보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </Section>
      )}

      {/* 팀 구성 */}
      {profile.teams && profile.teams.length > 0 && (
        <Section eyebrow="TEAMS" title="팀 구성">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.teams.map(t => (
              <div key={t.name} className="border border-neutral-900 bg-neutral-950 p-6">
                <div className="text-xl font-black" style={{ color: accent }}>{t.name}</div>
                {t.desc && <p className="mt-3 text-sm text-neutral-300 leading-relaxed whitespace-pre-line break-keep">{t.desc}</p>}
                {t.fit && <p className="mt-4 text-xs text-neutral-500">{t.fit}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 활동 · 연간 일정 */}
      {((profile.programs?.length ?? 0) > 0 || (profile.schedule?.length ?? 0) > 0) && (
        <Section eyebrow="ACTIVITIES" title="활동" tinted>
          {profile.programs && profile.programs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.programs.map(p => (
                <div key={p.title} className="border border-neutral-900 bg-black p-6">
                  <div className="text-lg font-black">{p.title}</div>
                  {p.desc && <p className="mt-2 text-sm text-neutral-400 leading-relaxed whitespace-pre-line break-keep">{p.desc}</p>}
                </div>
              ))}
            </div>
          )}
          {profile.schedule && profile.schedule.length > 0 && (
            <div className={profile.programs?.length ? 'mt-14' : ''}>
              <div className="text-sm font-bold text-neutral-400 mb-4 inline-flex items-center gap-2"><Calendar className="h-4 w-4" />연간 일정</div>
              <div className="divide-y divide-neutral-900 border-y border-neutral-900">
                {profile.schedule.map((s, i) => (
                  <div key={i} className="flex gap-6 py-4 text-sm">
                    <span className="w-20 shrink-0 font-bold" style={{ color: accent }}>{s.when}</span>
                    <span><span className="font-bold">{s.title}</span>{s.desc && <span className="ml-2 text-neutral-400">{s.desc}</span>}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* 프로젝트 */}
      {projects.length > 0 && (
        <Section eyebrow="PROJECTS" title="프로젝트">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => (
              <div key={i} className="border border-neutral-900 bg-neutral-950 p-6 flex flex-col">
                <div className="text-xs text-neutral-500">{[p.year, p.type].filter(Boolean).join(' · ')}</div>
                <div className="mt-2 text-sm font-bold text-neutral-300">{p.client}</div>
                <div className="mt-1 text-lg font-black break-keep">{p.title}</div>
                {p.result && <div className="mt-3 text-sm font-bold" style={{ color: accent }}>{p.result}</div>}
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-auto pt-4 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white">
                    자료 보기 <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 수상 내역 */}
      {awards.length > 0 && (
        <Section eyebrow="AWARDS" title="수상 내역" tinted>
          <div className="divide-y divide-neutral-900 border-y border-neutral-900">
            {awards.map((a, i) => (
              <div key={i} className="grid grid-cols-[4rem_1fr] sm:grid-cols-[5rem_1fr_auto] gap-x-4 gap-y-1 py-4 text-sm">
                <span className="text-neutral-500 tabular-nums">{a.year}</span>
                <span className="break-keep">{a.contest}{a.work && <span className="ml-2 text-neutral-500">{a.work}</span>}</span>
                <span className="col-start-2 sm:col-start-auto font-bold text-[#FFC000]">{a.prize}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 대표 활동 (옛 아카이브) */}
      {archive.length > 0 && (
        <Section eyebrow="ARCHIVE" title="대표 활동">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {archive.map((a) => (
              <div key={a.id} className="bg-neutral-950 border border-neutral-900 overflow-hidden">
                <div className="aspect-[4/3] bg-neutral-900">
                  {a.thumbnail_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.thumbnail_url} alt={a.title} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <div className="text-xs text-neutral-500 tracking-wider">{a.type} · {a.year}</div>
                  <div className="mt-1 font-bold text-sm line-clamp-2">{a.title}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 멘토·교육 네트워크 */}
      {profile.network && profile.network.length > 0 && (
        <Section eyebrow="NETWORK" title="함께한 기업·기관">
          <div className="flex flex-wrap gap-2">
            {profile.network.map(n => (
              <span key={n.name} className="border border-neutral-800 px-4 py-2 text-sm">
                {n.name}{n.kind && <span className="ml-2 text-neutral-500">{n.kind}</span>}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* 모집 안내 */}
      {showRecruit && (
        <section id="recruit" style={{ backgroundColor: recruitOpen ? accent : undefined }} className={recruitOpen ? '' : 'bg-neutral-950 border-y border-neutral-900'}>
          <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-end">
            <div>
              <div className="text-sm font-bold tracking-widest text-white/80">RECRUIT</div>
              <div className="mt-2 text-3xl font-black">{recruitOpen ? '부원 모집 중' : '부원 모집'}{recruitPeriod ? ` · ${recruitPeriod}` : ''}</div>
              {profile.recruit?.target && <p className="mt-4 max-w-2xl text-white/90 break-keep"><span className="font-bold mr-2">대상</span>{profile.recruit?.target}</p>}
              {profile.recruit?.process && <p className="mt-2 max-w-2xl text-white/90 whitespace-pre-line break-keep"><span className="font-bold mr-2">절차</span>{profile.recruit?.process}</p>}
              {!recruitOpen && <p className="mt-4 text-sm text-neutral-400">지금은 모집 기간이 아닙니다. 아래 채널에서 다음 모집 소식을 확인하세요.</p>}
              {formOpen && <Link href="/madleague/clubs/recruit" className="mt-4 inline-block text-sm text-white/80 underline underline-offset-4">전국 동아리 공동 모집 보기</Link>}
            </div>
            {recruitOpen && recruitHref && (
              formOpen
                ? <Link href={recruitHref} className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-8 py-4 transition">지원하기 <ArrowRight className="h-4 w-4" /></Link>
                : <a href={recruitHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-8 py-4 transition">지원하기 <ArrowUpRight className="h-4 w-4" /></a>
            )}
          </div>
        </section>
      )}

      {/* 채널 · 연락 */}
      {(profile.contact_email || (profile.channels?.length ?? 0) > 0) && (
        <Section eyebrow="CONTACT" title="채널">
          <div className="flex flex-wrap gap-3">
            {profile.contact_email && (
              <a href={`mailto:${profile.contact_email}`} className="inline-flex items-center gap-2 border border-neutral-700 px-4 py-2 text-sm hover:border-white">
                <Mail className="h-4 w-4" />{profile.contact_email}
              </a>
            )}
            {profile.channels?.map(c => (
              <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border border-neutral-700 px-4 py-2 text-sm hover:border-white">
                {c.label} <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* 매드리거 등록 (소속 인증) */}
      <section className="bg-black border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm font-bold tracking-widest text-neutral-500">{club.name} 부원이라면</div>
            <div className="mt-2 text-2xl sm:text-3xl font-black">매드리거로 등록하세요</div>
          </div>
          <Link
            href={`/madleague/apply?club=${club.slug}`}
            className="inline-flex items-center gap-2 font-bold px-8 py-4 transition text-white"
            style={{ backgroundColor: accent }}
          >
            매드리거 등록 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
