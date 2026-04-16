'use client';

import Image from 'next/image';

export function KoreaClubMap() {
  return (
    <div className="mx-auto overflow-hidden rounded-2xl" style={{ maxWidth: 520 }}>
      <Image
        src="/logos/madleague/korea-map.png"
        alt="전국 7개 권역 지도"
        width={520}
        height={680}
        className="w-full h-auto select-none"
        priority
      />
    </div>
  );
}
