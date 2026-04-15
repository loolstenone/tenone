import Link from 'next/link';
import { Trophy, Users, Search, Lightbulb, Presentation, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { fetchMadClubs } from '@/lib/supabase/madleague';

export const revalidate = 300;

export const metadata = {
  title: '경쟁 PT — Hall of Fame',
  description: '실제 기업 과제에 동아리가 경쟁. MADLeague 경쟁PT 수상작 아카이브.',
};

interface PageProps {
  searchParams: Promise<{ year?: string; club?: string; client?: string }>;
}

const STEPS = [
  { icon: Users, title: '팀 구성', desc: '같은 권역 또는 크로스 권역으로 4~6인 팀을 구성한다.' },
  { icon: Search, title: '과제 분석', desc: '실제 기업이 제시하는 마케팅 과제를 분석하고 시장 조사.' },
  { icon: Lightbulb, title: '전략 수립', desc: '타겟·포지셔닝·크리에이티브·미디어 플랜까지.' },
  { icon: Presentation, title: '경쟁 PT', desc: '현업 심사위원단 앞에서 경쟁 프레젠테이션. 최고의 전략이 이긴다.' },
];

export default async function CompetitionPage({ searchParams }: PageProps) {
  const { year, club, client } = await searchParams;
  const yearFilter = year ? Number(year) : undefined;

  const sb = await createClient();
  const clubs = await fetchMadClubs();

  // 경쟁PT + 결과 + 동아리 조인
  let compQ = sb.from('mad_competitions').select('*').order('year', { ascending: false }).order('presentation_date', { ascending: false });
  if (yearFilter) compQ = compQ.eq('year', yearFilter);
  if (client) compQ = compQ.ilike('client_name', `%${client}%`);
  const { data: compsRaw } = await compQ;
  const comps = (compsRaw ?? []) as Array<{
    id: string; slug: string | null; title: string; year: number; client_name: string | null; presentation_date: string | null;
  }>;

  // 결과 조인 (동아리 필터용)
  const { data: resultsRaw } = await sb.from('mad_competition_results')
    .select('*')
    .in('competition_id', comps.length ? comps.map((c) => c.id) : ['00000000-0000-0000-0000-000000000000'])
    .order('rank', { ascending: true });
  const results = (resultsRaw ?? []) as Array<{
    id: string; competition_id: string; team_name: string; club_id: string | null; rank: number | null; is_crown: boolean; award_name: string | null;
  }>;

  const clubById = new Map(clubs.map((c) => [c.id, c]));
  const clubFilter = club ? clubs.find((c) => c.slug === club) : undefined;

  // 연도 필터 옵션 (DB에서 추출)
  const { data: allYears } = await sb.from('mad_competitions').select('year');
  const yearOptions = Array.from(new Set((allYears ?? []).map((r: { year: number }) => r.year))).sort((a, b) => b - a);

  // 필터 적용된 comps
  const displayComps = comps.filter((c) => {
    if (!clubFilter) return true;
    return results.some((r) => r.competition_id === c.id && r.club_id === clubFilter.id);
  });

  // MAD Crown 개수
  const crownCount = results.filter((r) => r.is_crown).length;

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(236,29,37,0.2),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">COMPETITION</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">경쟁 PT</h1>
          <p className="mt-6 max-w-2xl text-lg text-neutral-300 leading-relaxed">
            실제 기업이 던지는 진짜 과제. 전국 동아리가 같은 브리프를 놓고 경쟁한다.
            최고의 전략은 <span className="text-[#FFC000] font-bold">MAD Crown</span>을 받는다.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-xs font-bold tracking-widest text-neutral-500 mb-3">PROCESS</div>
        <h2 className="text-2xl sm:text-3xl font-black mb-10">경쟁PT는 이렇게 진행된다</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="bg-neutral-950 border border-neutral-900 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-[#EC1D25] flex items-center justify-center text-xs font-black">
                  {i + 1}
                </div>
                <s.icon className="h-5 w-5 text-neutral-500" />
              </div>
              <div className="font-bold">{s.title}</div>
              <div className="mt-2 text-xs text-neutral-500 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Hall of Fame */}
      <section className="bg-neutral-950 border-y border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <div className="text-xs font-bold tracking-widest text-[#FFC000]">HALL OF FAME</div>
              <h2 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight">수상작 아카이브</h2>
              <div className="mt-3 text-sm text-neutral-400">
                총 {comps.length}개 경쟁PT · {crownCount}개 MAD Crown
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            <FilterChip href="/madleague/programs/competition" active={!yearFilter && !club && !client}>
              전체
            </FilterChip>
            {yearOptions.map((y) => (
              <FilterChip
                key={y}
                href={`/madleague/programs/competition?year=${y}${club ? `&club=${club}` : ''}`}
                active={yearFilter === y}
              >
                {y}
              </FilterChip>
            ))}
            <div className="w-px bg-neutral-800 mx-2" />
            {clubs.map((c) => (
              <FilterChip
                key={c.slug}
                href={`/madleague/programs/competition?club=${c.slug}${yearFilter ? `&year=${yearFilter}` : ''}`}
                active={club === c.slug}
                color={c.color ?? undefined}
              >
                {c.name}
              </FilterChip>
            ))}
          </div>

          {/* Hall of Fame list */}
          {displayComps.length === 0 ? (
            <div className="bg-black border border-neutral-900 p-12 text-center text-neutral-500">
              조건에 맞는 경쟁PT가 없습니다.
            </div>
          ) : (
            <div className="space-y-6">
              {displayComps.map((comp) => {
                const compResults = results.filter((r) => r.competition_id === comp.id);
                if (clubFilter && !compResults.some((r) => r.club_id === clubFilter.id)) return null;
                return (
                  <div key={comp.id} className="bg-black border border-neutral-900 p-8">
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                      <div>
                        <div className="text-xs font-bold tracking-widest text-neutral-500">{comp.year}</div>
                        <h3 className="mt-1 text-2xl font-black">{comp.client_name ?? comp.title}</h3>
                        <div className="mt-2 text-sm text-neutral-400">{comp.title}</div>
                      </div>
                      {compResults.some((r) => r.is_crown) && (
                        <div className="inline-flex items-center gap-2 text-[#FFC000] text-sm font-bold">
                          <Trophy className="h-4 w-4" /> MAD CROWN
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {compResults.map((r) => {
                        const teamClub = r.club_id ? clubById.get(r.club_id) : null;
                        return (
                          <div
                            key={r.id}
                            className={`border p-4 ${
                              r.is_crown ? 'border-[#FFC000] bg-[#FFC000]/5' : 'border-neutral-900 bg-neutral-950'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-black text-white">{r.rank}위</span>
                              {r.is_crown && <span className="text-[#FFC000] font-bold">♛ CROWN</span>}
                            </div>
                            <div className="mt-2 text-lg font-bold">{r.team_name}</div>
                            {teamClub && (
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-400">
                                <span
                                  className="inline-block h-2 w-2 rounded-full"
                                  style={{ backgroundColor: teamClub.color ?? '#EC1D25' }}
                                />
                                {teamClub.name}
                              </div>
                            )}
                            {r.award_name && (
                              <div className="mt-3 text-xs text-[#EC1D25] font-bold">{r.award_name}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Corporate partner CTA */}
      <section className="bg-[#EC1D25]">
        <div className="mx-auto max-w-7xl px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm font-bold tracking-widest text-white/80">FOR CORPORATE</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">과제 기업으로 참여하시겠습니까?</h2>
            <p className="mt-2 text-white/90 text-sm">전국 대학생의 크리에이티브를 기업의 마케팅 과제에 연결합니다.</p>
          </div>
          <Link
            href="/madleague/about"
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-8 py-4 transition"
          >
            문의하기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
  color,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 border transition ${
        active
          ? 'bg-[#EC1D25] border-[#EC1D25] text-white'
          : 'bg-black border-neutral-800 text-neutral-400 hover:border-[#EC1D25] hover:text-white'
      }`}
    >
      {color && <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </Link>
  );
}
