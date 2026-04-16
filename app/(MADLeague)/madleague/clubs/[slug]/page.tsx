import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { MapPin, Calendar, Users, ArrowRight, ChevronLeft } from 'lucide-react';
import { fetchMadClubBySlug } from '@/lib/supabase/madleague';
import { createClient } from '@/lib/supabase/server';

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

export default async function ClubDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const club = await fetchMadClubBySlug(slug);
  if (!club) notFound();

  // 활동연도 / 수상 작품 로드 (병렬)
  const sb = await createClient();
  const [cohortsRes, archiveRes, resultsRes] = await Promise.all([
    sb.from('mad_cohorts').select('year, member_count, status').eq('club_id', club.id).order('year', { ascending: false }),
    sb.from('mad_archive').select('id, title, year, thumbnail_url, type, award').eq('club_id', club.id).order('year', { ascending: false }).limit(6),
    sb.from('mad_competition_results').select('id, team_name, rank, is_crown, award_name, competition_id').eq('club_id', club.id).order('rank', { ascending: true }),
  ]);
  const cohorts = (cohortsRes.data ?? []) as Array<{ year: number; member_count: number; status: string }>;
  const archive = (archiveRes.data ?? []) as Array<{ id: string; title: string; year: number; thumbnail_url: string | null; type: string; award: string | null }>;
  const results = (resultsRes.data ?? []) as Array<{ id: string; team_name: string; rank: number | null; is_crown: boolean; award_name: string | null }>;

  const activeYears = cohorts.map((c) => c.year);
  const totalMembers = cohorts.reduce((sum, c) => sum + (c.member_count ?? 0), 0);
  const accent = club.color ?? '#EC1D25';

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* Back link */}
      <div className="mx-auto max-w-7xl px-6 pt-8">
        <Link
          href="/madleague/clubs"
          className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition"
        >
          <ChevronLeft className="h-4 w-4" /> 동아리 목록
        </Link>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: `radial-gradient(circle at 20% 50%, ${accent}, transparent 60%)` }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          {club.logo_url ? (
            <div className="h-20 w-20 mb-8 flex items-center justify-center">
              <Image src={club.logo_url} alt={club.name} width={80} height={80} className="object-contain" />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-full mb-8" style={{ backgroundColor: accent }} />
          )}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight">{club.name}</h1>
          <div className="mt-4 flex items-center gap-2 text-neutral-400">
            <MapPin className="h-4 w-4" />
            {club.region}
          </div>
          {club.description && (
            <p className="mt-8 max-w-2xl text-lg text-neutral-300 leading-relaxed">
              {club.description}
            </p>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-900 bg-black">
        <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-3 gap-8">
          <div>
            <div className="text-xs font-bold tracking-widest text-neutral-500 mb-2">활동연도</div>
            <div className="text-3xl font-black tabular-nums">{activeYears.length}<span className="text-lg text-neutral-500 ml-1">년</span></div>
            {activeYears.length > 0 && (
              <div className="mt-1 text-xs text-neutral-500">{activeYears.join(' · ')}</div>
            )}
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest text-neutral-500 mb-2">누적 인원</div>
            <div className="text-3xl font-black tabular-nums">{totalMembers}<span className="text-lg text-neutral-500 ml-1">명</span></div>
          </div>
          <div>
            <div className="text-xs font-bold tracking-widest text-neutral-500 mb-2">수상 내역</div>
            <div className="text-3xl font-black tabular-nums">{results.length}<span className="text-lg text-neutral-500 ml-1">건</span></div>
          </div>
        </div>
      </section>

      {/* Activity Years */}
      {cohorts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">HISTORY</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-10">활동 연도</h2>
          <div className="space-y-4">
            {cohorts.map((c) => (
              <div
                key={c.year}
                className="flex items-center justify-between bg-neutral-950 border border-neutral-900 p-6"
              >
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-neutral-500" />
                  <div>
                    <div className="text-2xl font-black">{c.year}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {c.status === 'active' ? '활동 중' : c.status === 'completed' ? '완료' : '모집 중'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Users className="h-4 w-4" />
                  {c.member_count}명
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Awards */}
      {results.length > 0 && (
        <section className="bg-neutral-950 border-y border-neutral-900">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="text-xs font-bold tracking-widest text-[#FFC000] mb-3">AWARDS</div>
            <h2 className="text-3xl sm:text-4xl font-black mb-10">수상 내역</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((r) => (
                <div key={r.id} className="bg-black border border-neutral-900 p-6">
                  {r.is_crown && (
                    <div className="text-xs font-bold tracking-widest text-[#FFC000] mb-2">♛ MAD CROWN</div>
                  )}
                  <div className="text-lg font-bold">{r.team_name}</div>
                  {r.award_name && (
                    <div className="mt-2 text-sm text-[#EC1D25] font-bold">{r.award_name}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery / Archive */}
      {archive.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">ARCHIVE</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-10">대표 활동</h2>
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
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">{a.type} · {a.year}</div>
                  <div className="mt-1 font-bold text-sm line-clamp-2">{a.title}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Apply CTA */}
      <section style={{ backgroundColor: accent }}>
        <div className="mx-auto max-w-7xl px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm font-bold tracking-widest text-white/80">{club.name}에 지원하기</div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-white">{club.region} 거점 동아리 합류</div>
          </div>
          <Link
            href={`/madleague/apply?club=${club.slug}`}
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-8 py-4 transition"
          >
            지원하기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
