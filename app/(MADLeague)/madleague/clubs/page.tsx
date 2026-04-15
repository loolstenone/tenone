import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { fetchMadClubs } from '@/lib/supabase/madleague';

export const revalidate = 300;

export const metadata = {
  title: '동아리',
  description: '전국 7개 권역 MADLeague 공식 동아리',
};

export default async function ClubsPage() {
  const clubs = await fetchMadClubs();

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* Header */}
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">CLUBS</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">
            전국 {clubs.length}개 동아리
          </h1>
          <p className="mt-6 max-w-xl text-neutral-400 leading-relaxed">
            수도권부터 제주까지, 대한민국 7개 권역의 대학생 광고·마케팅 동아리가
            하나의 리그로 뭉쳤다.
          </p>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <Link
              key={club.slug}
              href={`/madleague/clubs/${club.slug}`}
              className="group relative bg-neutral-950 border border-neutral-900 hover:border-[#EC1D25] transition p-8"
            >
              <div
                className="h-14 w-14 rounded-full mb-6"
                style={{ backgroundColor: club.color ?? '#EC1D25' }}
              />
              <div className="text-3xl font-black text-white">{club.name}</div>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-neutral-400">
                <MapPin className="h-3.5 w-3.5" />
                {club.region}
              </div>
              {club.description && (
                <p className="mt-6 text-sm text-neutral-500 leading-relaxed line-clamp-3">
                  {club.description}
                </p>
              )}
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-neutral-400 group-hover:text-[#EC1D25] transition">
                동아리 상세 <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Club CTA */}
      <section className="bg-neutral-950 border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
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
