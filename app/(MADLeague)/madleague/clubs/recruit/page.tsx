import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ArrowRight } from 'lucide-react';
import { fetchMadClubs } from '@/lib/supabase/madleague';
import { fetchClubRecruitForms, recruitPeriodLabel } from '@/lib/madleague-recruit';
import { AVAILABILITY_LABEL } from '@/lib/forms';
import type { ClubProfile } from '@/types/madleague-club-profile';

/*
 * 동아리 부원 공동 모집 — 전국 동아리 모집을 한 페이지에서 (2026-10-10)
 * 지원은 동아리별 지원서(유니버스 폼 program=club-recruit:{slug}) — 응답은 그 동아리 운영진·직원만 본다
 */

export const revalidate = 300;

export const metadata = {
  title: '동아리 부원 공동 모집',
  description: '전국 MADLeague 동아리 부원 모집을 한곳에서 — 원하는 동아리를 골라 지원하세요.',
};

export default async function ClubRecruitPage() {
  const [clubs, forms] = await Promise.all([fetchMadClubs(), fetchClubRecruitForms()]);
  const rows = clubs.map(club => {
    const form = forms.get(club.slug) ?? null;
    const recruit = ((club as unknown as { profile?: ClubProfile }).profile ?? {}).recruit;
    return { club, form, recruit, open: form?.availability === 'open' };
  });
  // 모집 중인 동아리 먼저, 그 안에서는 이름순(fetchMadClubs 순서 유지)
  const sorted = [...rows.filter(r => r.open), ...rows.filter(r => !r.open)];
  const openCount = rows.filter(r => r.open).length;

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-28">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">RECRUIT</div>
          <h1 className="mt-3 text-5xl sm:text-7xl font-black tracking-tight break-keep">동아리 부원 공동 모집</h1>
          <p className="mt-8 max-w-2xl text-lg text-neutral-400 leading-relaxed break-keep">
            전국 {clubs.length}개 MADLeague 동아리가 함께 부원을 모집합니다. 내 지역·관심에 맞는 동아리를 골라 지원하세요.
            지원서는 지원한 동아리 운영진과 MAD League 운영진만 봅니다.
          </p>
          <p className="mt-6 text-sm font-bold">
            {openCount > 0 ? <span className="text-[#EC1D25]">지금 {openCount}개 동아리 모집 중</span> : <span className="text-neutral-500">지금은 모집 중인 동아리가 없습니다 — 각 동아리 소개에서 다음 모집 소식을 확인하세요</span>}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sorted.map(({ club, form, recruit, open }) => {
            const period = form ? recruitPeriodLabel(form) : recruit?.period;
            return (
              <div key={club.slug} className={`bg-neutral-950 border p-8 flex flex-col ${open ? 'border-[#EC1D25]' : 'border-neutral-900'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {club.logo_url
                      ? <div className="h-14 w-14 flex items-center justify-center bg-white shrink-0"><Image src={club.logo_url} alt={club.name} width={56} height={56} className="object-contain" /></div>
                      : <div className="h-14 w-14 shrink-0" style={{ backgroundColor: club.color ?? '#EC1D25' }} />}
                    <div>
                      <div className="text-3xl font-black">{club.name}</div>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-400"><MapPin className="h-3.5 w-3.5" />{club.region}</div>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 text-xs font-bold ${open ? 'bg-[#EC1D25] text-white' : 'border border-neutral-800 text-neutral-500'}`}>
                    {open ? '모집 중' : form ? AVAILABILITY_LABEL[form.availability] : '모집 전'}
                  </span>
                </div>

                <dl className="mt-6 space-y-2 text-sm">
                  {period && <div className="flex gap-3"><dt className="w-12 shrink-0 text-neutral-500">기간</dt><dd>{period}</dd></div>}
                  {recruit?.target && <div className="flex gap-3"><dt className="w-12 shrink-0 text-neutral-500">대상</dt><dd className="text-neutral-300 break-keep">{recruit.target}</dd></div>}
                  {recruit?.process && <div className="flex gap-3"><dt className="w-12 shrink-0 text-neutral-500">절차</dt><dd className="text-neutral-300 whitespace-pre-line break-keep">{recruit.process}</dd></div>}
                </dl>

                <div className="mt-auto pt-8 flex flex-wrap gap-3">
                  {open && form && (
                    <Link href={`/madleague/forms/${form.slug}`} className="inline-flex items-center gap-2 bg-[#EC1D25] hover:bg-[#d01820] px-5 py-3 text-sm font-bold">
                      {club.name} 지원하기 <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  <Link href={`/madleague/clubs/${club.slug}`} className="inline-flex items-center gap-2 border border-neutral-700 hover:border-white px-5 py-3 text-sm font-bold text-neutral-300 hover:text-white">
                    동아리 소개
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
