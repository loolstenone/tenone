import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  fetchMadClubs,
  fetchMadHallOfFame,
  fetchMadArticles,
} from '@/lib/supabase/madleague';
import { KoreaClubMap } from '@/features/madleague/KoreaClubMap';

export const revalidate = 300; // 5분 캐시

export default async function Page() {
  const [clubs, hallOfFame, articles] = await Promise.all([
    fetchMadClubs(),
    fetchMadHallOfFame(3),
    fetchMadArticles({ limit: 4 }),
  ]);

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* ─── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EC1D25]/20 via-black to-black" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.15),transparent_50%)]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 sm:pt-32 sm:pb-40">
          <div className="flex items-center gap-3 text-[#EC1D25] font-bold tracking-widest text-xs mb-6">
            <span className="h-px w-8 bg-[#EC1D25]" />
            MATCH · ACT · DEVELOP
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
            실전이 우리를
            <br />
            <span className="text-[#EC1D25]">강하게 하리라</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-neutral-300 leading-relaxed">
            대한민국 전역의 광고·마케팅 대학생 동아리 연합.
            <br />
            진짜 기업 과제로, 진짜 실력을 키운다.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/madleague/apply"
              className="inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] text-white font-bold px-8 py-4 transition"
            >
              다음 기수 합류하기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/madleague/about"
              className="inline-flex items-center gap-2 border border-neutral-600 hover:border-white text-white font-bold px-8 py-4 transition"
            >
              매드리그란
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 프로그램 ──────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader eyebrow="PROGRAMS" title="7가지 실전 무대" />
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ProgramCard href="/madleague/programs/competition" title="경쟁 PT" desc="실제 기업 과제에 동아리가 경쟁 — MAD Crown을 향해" featured />
          <ProgramCard href="/madleague/programs/project" title="PJT" desc="실전 프로젝트 OJT — 현장에서 배운다" />
          <ProgramCard href="/madleague/programs/markethon" title="마케톤" desc="Marketing + Hacking + Marathon — 72시간의 열정" />
          <ProgramCard href="/madleague/programs/insight-touring" title="인사이트 투어링" desc="지역·기업을 돌며 혁신 제안" />
          <ProgramCard href="/madleague/programs/im" title="아이디어 무브먼트" desc="사회 문제 해결 아이디어 전국 쇼케이스" />
          <ProgramCard href="/madleague/programs/dam" title="DAM 파티" desc="Digital Advertising Meeting — 기업과의 만남" />
        </div>
      </section>

      {/* ─── 동아리 지도 ─────────────────────────── */}
      <section className="bg-neutral-950 border-y border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeader
            eyebrow="CLUBS"
            title={`전국 ${clubs.length}개 동아리`}
            action={{ href: '/madleague/clubs', label: '동아리 전체 보기' }}
          />
          <div className="mt-12 flex justify-center">
            <KoreaClubMap clubs={clubs} />
          </div>
        </div>
      </section>

      {/* ─── Hall of Fame ─────────────────────────── */}
      {hallOfFame.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeader
            eyebrow="HALL OF FAME"
            title="최근 경쟁PT 수상작"
            action={{ href: '/madleague/programs/competition', label: '전체 보기' }}
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {hallOfFame.map((hof) => (
              <div
                key={hof.id}
                className="group relative bg-neutral-950 border border-neutral-900 hover:border-[#FFC000] transition p-8"
              >
                {hof.result?.is_crown && (
                  <div className="absolute top-4 right-4 text-[#FFC000] text-xs font-bold tracking-wider">
                    ♛ MAD CROWN
                  </div>
                )}
                <div className="text-xs text-neutral-500 font-bold tracking-wider">
                  {hof.year}
                </div>
                <div className="mt-3 text-xl font-black text-white">{hof.client_name ?? hof.title}</div>
                {hof.result && (
                  <div className="mt-6 pt-6 border-t border-neutral-900">
                    <div className="text-sm text-neutral-400">수상팀</div>
                    <div className="mt-1 font-bold text-white">{hof.result.team_name}</div>
                    {hof.result.award_name && (
                      <div className="mt-2 text-sm text-[#EC1D25] font-bold">{hof.result.award_name}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── MADzine 최신 ──────────────────────────── */}
      {articles.length > 0 && (
        <section className="bg-white text-neutral-900 border-y border-neutral-200">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <SectionHeader
              eyebrow="MADZINE"
              title="최신 콘텐츠"
              action={{ href: '/madleague/madzine', label: '매거진 전체' }}
              dark={false}
            />
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/madleague/madzine/${a.slug}`}
                  className="group block"
                >
                  <div className="aspect-[4/3] bg-neutral-100 overflow-hidden">
                    {a.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.thumbnail_url} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-neutral-200 to-neutral-100 flex items-center justify-center text-neutral-400 text-xs tracking-widest">
                        {a.category.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-xs text-[#EC1D25] font-bold tracking-wider uppercase">
                    {a.category}
                  </div>
                  <div className="mt-2 font-bold group-hover:text-[#EC1D25] transition">
                    {a.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ─────────────────────────────────── */}
      <section className="bg-[#EC1D25]">
        <div className="mx-auto max-w-7xl px-6 py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-sm font-bold tracking-widest text-white/80">DAMBE 들이 기다린다</div>
            <div className="mt-2 text-3xl sm:text-4xl font-black text-white">담비라 세상아!</div>
          </div>
          <Link
            href="/madleague/apply"
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-8 py-4 transition"
          >
            지원하기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}


function SectionHeader({
  eyebrow,
  title,
  action,
  dark = true,
}: {
  eyebrow: string;
  title: string;
  action?: { href: string; label: string };
  dark?: boolean;
}) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4">
      <div>
        <div className="text-xs font-bold tracking-widest text-[#EC1D25]">{eyebrow}</div>
        <h2 className={`mt-2 text-3xl sm:text-5xl font-black tracking-tight ${dark ? 'text-white' : 'text-neutral-900'}`}>
          {title}
        </h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className={`text-sm font-bold hover:text-[#EC1D25] transition ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}

function ProgramCard({
  href,
  title,
  desc,
  featured = false,
}: {
  href: string;
  title: string;
  desc: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative p-8 border transition ${
        featured
          ? 'bg-[#EC1D25] border-[#EC1D25] hover:bg-[#d01820]'
          : 'bg-black border-neutral-900 hover:border-[#EC1D25]'
      }`}
    >
      <div className="text-2xl font-black text-white">{title}</div>
      <div className={`mt-3 text-sm leading-relaxed ${featured ? 'text-white/80' : 'text-neutral-400'}`}>
        {desc}
      </div>
      <ArrowRight className={`mt-6 h-5 w-5 ${featured ? 'text-white' : 'text-neutral-600 group-hover:text-[#EC1D25]'} transition`} />
    </Link>
  );
}
