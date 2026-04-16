'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MadClub } from '@/lib/supabase/madleague';

// DB logo_url 없어도 동작하도록 slug → 로컬 파일 직접 매핑
const LOGO_BY_SLUG: Record<string, string> = {
  madleap: '/logos/madleague/madleap.png',
  pad:     '/logos/madleague/pad.png',
  adzone:  '/logos/madleague/adzone.png',
  adlle:   '/logos/madleague/adlle.jpg',
  abc:     '/logos/madleague/abc.png',
  pam:     '/logos/madleague/pam.png',
  suzak:   '/logos/madleague/suzak.png',
};

// 지도 이미지 기준 각 동아리 위치 (%)
const CLUB_POSITIONS: Record<string, { top: string; left: string }> = {
  madleap: { top: '24%', left: '27%' },
  pad:     { top: '13%', left: '58%' },
  adzone:  { top: '42%', left: '33%' },
  adlle:   { top: '50%', left: '60%' },
  abc:     { top: '56%', left: '17%' },
  pam:     { top: '67%', left: '59%' },
  suzak:   { top: '83%', left: '30%' },
};

interface Props {
  clubs: MadClub[];
}

export function KoreaClubMap({ clubs }: Props) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 520 }}>
      {/* 지도 배경 */}
      <Image
        src="/logos/madleague/korea-map.png"
        alt="전국 7개 동아리 지도"
        width={520}
        height={680}
        className="w-full h-auto select-none"
        style={{ filter: 'grayscale(1) brightness(0.12) contrast(1.5)' }}
        priority
      />

      {/* 동아리 로고 오버레이 */}
      {clubs.map((club) => {
        const pos = CLUB_POSITIONS[club.slug];
        const logo = club.logo_url ?? LOGO_BY_SLUG[club.slug];
        if (!pos || !logo) return null;

        return (
          <Link
            key={club.slug}
            href={`/madleague/clubs/${club.slug}`}
            className="absolute group"
            style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
          >
            <div
              className="flex items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-115"
              style={{
                width: 60,
                height: 60,
                background: 'rgba(0,0,0,0.9)',
                border: `2px solid ${club.color ?? '#EC1D25'}`,
                boxShadow: `0 0 14px ${club.color ?? '#EC1D25'}60`,
              }}
            >
              <Image
                src={logo}
                alt={club.name}
                width={38}
                height={38}
                className="object-contain"
              />
            </div>
            {/* 툴팁 */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-black border border-neutral-700 text-white text-xs font-bold px-2 py-1 whitespace-nowrap">
                {club.name}
                <div className="text-[10px] text-neutral-500 font-normal">{club.region}</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
