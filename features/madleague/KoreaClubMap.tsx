'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MadClub } from '@/lib/supabase/madleague';

// 지도 이미지 기준 각 동아리 위치 (%)
// 참조: _refs/images/전국 7개 동아리.png
const CLUB_POSITIONS: Record<string, { top: string; left: string }> = {
  madleap: { top: '24%', left: '27%' },   // 수도권
  pad:     { top: '13%', left: '58%' },   // 강원
  adzone:  { top: '42%', left: '33%' },   // 충청
  adlle:   { top: '50%', left: '60%' },   // 대구/경북
  abc:     { top: '56%', left: '17%' },   // 광주/전남
  pam:     { top: '67%', left: '59%' },   // 부산/경남
  suzak:   { top: '83%', left: '30%' },   // 제주
};

interface Props {
  clubs: MadClub[];
}

export function KoreaClubMap({ clubs }: Props) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 520 }}>
      {/* 지도 배경 — 어둡게 처리 */}
      <Image
        src="/logos/madleague/korea-map.png"
        alt="전국 7개 동아리 지도"
        width={520}
        height={680}
        className="w-full h-auto select-none"
        style={{ filter: 'grayscale(1) brightness(0.15) contrast(1.4)' }}
        priority
      />

      {/* 동아리 로고 오버레이 */}
      {clubs.map((club) => {
        const pos = CLUB_POSITIONS[club.slug];
        if (!pos || !club.logo_url) return null;
        return (
          <Link
            key={club.slug}
            href={`/madleague/clubs/${club.slug}`}
            className="absolute group"
            style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }}
          >
            {/* 동그란 배경 + 로고 */}
            <div
              className="relative flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
              style={{
                width: 64,
                height: 64,
                background: 'rgba(0,0,0,0.85)',
                border: `2px solid ${club.color ?? '#EC1D25'}`,
                boxShadow: `0 0 16px ${club.color ?? '#EC1D25'}55`,
              }}
            >
              <Image
                src={club.logo_url}
                alt={club.name}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            {/* 툴팁 */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-black border border-neutral-700 text-white text-xs font-bold px-2 py-1 whitespace-nowrap">
                {club.name}
                <div className="text-[10px] text-neutral-400 font-normal">{club.region}</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
