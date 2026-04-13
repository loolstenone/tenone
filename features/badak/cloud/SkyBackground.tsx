'use client';

import { useMemo } from 'react';
import type { SkyInfo } from '@/types/badak';

interface SkyBackgroundProps {
  skyInfo: SkyInfo;
  children: React.ReactNode;
}

export function SkyBackground({
  skyInfo,
  children,
}: SkyBackgroundProps) {
  const showStars = skyInfo.period === 'night' || skyInfo.period === 'dawn';
  const isLight = skyInfo.period === 'morning' || skyInfo.period === 'day' || skyInfo.period === 'afternoon';

  const stars = useMemo(() => {
    if (!showStars) return [];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      width: 1 + ((i * 7 + 3) % 3),
      left: ((i * 37 + 13) % 100),
      top: ((i * 23 + 7) % 40),
      opacity: 0.3 + ((i * 11 + 5) % 6) / 10,
      duration: 2 + ((i * 13 + 3) % 4),
      delay: ((i * 17 + 1) % 30) / 10,
    }));
  }, [showStars]);

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{
        height: '100vh',
        width: '100%',
        background: skyInfo.bg,
      }}
    >
      {showStars &&
        stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.width}px`,
              height: `${star.width}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              opacity: star.opacity,
              animation: `badak-pulse ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      {/* Dark overlay for light sky periods */}
      {isLight && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'rgba(10, 10, 26, 0.35)' }}
        />
      )}
      {children}
    </div>
  );
}
