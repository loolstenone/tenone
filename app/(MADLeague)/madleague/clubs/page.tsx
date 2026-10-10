import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { fetchMadClubs } from '@/lib/supabase/madleague';
import { computeClubRankings } from '@/lib/madleague-club-ranking';
import { ClubList, type ClubListRow } from '@/features/madleague/ClubList';

export const revalidate = 300;

export const metadata = {
  title: '동아리',
  description: '전국 7개 권역 MADLeague 공식 동아리',
};

export default async function ClubsPage() {
  const [clubs, rankings] = await Promise.all([fetchMadClubs(), computeClubRankings().catch(() => new Map())]);
  // 랭킹 순위 — 점수 높은 순, 동점은 같은 순위, 0점은 순위 없음
  const scores = clubs.map(c => rankings.get(c.slug)?.score ?? 0);
  const rows: ClubListRow[] = clubs.map((c, i) => {
    const r = rankings.get(c.slug);
    const score = scores[i];
    return {
      slug: c.slug, name: c.name, region: c.region, logo_url: c.logo_url, color: c.color,
      score, teams: r?.teams ?? 0, partial: r?.partial ?? false,
      rank: score > 0 ? scores.filter(s => s > score).length + 1 : null,
    };
  });

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* Header */}
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-32">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">CLUBS</div>
          <h1 className="mt-3 text-5xl sm:text-7xl font-black tracking-tight">
            전국 {clubs.length}개 동아리
          </h1>
          <p className="mt-8 max-w-xl text-lg text-neutral-400 leading-relaxed">
            수도권부터 제주까지, 대한민국 7개 권역의 대학생 광고·마케팅 동아리가
            하나의 리그로 뭉쳤다.
          </p>
          <Link href="/madleague/clubs/recruit"
            className="mt-10 inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] px-6 py-3 text-sm font-bold text-white transition">
            동아리 부원 공동 모집 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 동아리 목록 — 리스트 · 항목별 정렬 · 랭킹 */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <ClubList rows={rows} />
      </section>

      {/* New Club CTA */}
      <section className="bg-neutral-950 border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-32">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold tracking-widest text-[#FFC000]">NEW CLUB</div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white">
                우리 학교에도 MADLeague 동아리를 만들고 싶다면
              </h2>
              <p className="mt-3 text-neutral-400">
                신규 동아리 모집 절차와 가입 조건을 안내합니다.
              </p>
            </div>
            <Link
              href="/madleague/about"
              className="inline-flex items-center gap-2 border border-[#FFC000] hover:bg-[#FFC000] hover:text-black text-[#FFC000] font-bold px-6 py-3 transition whitespace-nowrap"
            >
              신규 동아리 절차
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
