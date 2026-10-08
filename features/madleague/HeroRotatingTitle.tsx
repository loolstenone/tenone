'use client';

import { useEffect, useState } from 'react';

/**
 * MADLeague 홈 히어로 — 카피가 슬라이드로 교체되는 제목.
 * 모든 카피를 같은 그리드 칸에 겹쳐 높이가 가장 긴 카피에 맞춰 고정 (교체 때 레이아웃 출렁임 없음).
 * 서버 렌더는 첫 카피(검색엔진용) · prefers-reduced-motion이면 슬라이드 없이 교체.
 */
const COPIES: { top: string; accent: string }[] = [
  { top: '전략과 크리에이티브,', accent: '양손잡이 마케터' },
  { top: '세상을 바꾸는,', accent: '우리는 모두 기획자다' },
  { top: '실전이 우리를,', accent: '강하게 하리라' },
];

const INTERVAL_MS = 3000;

export function HeroRotatingTitle() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % COPIES.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-tight tracking-tight">
      <span className="sr-only">{COPIES[0].top} {COPIES[0].accent}</span>
      <span className="grid" aria-hidden>
        {COPIES.map((c, i) => {
          const state = i === index ? 'active' : i === (index - 1 + COPIES.length) % COPIES.length ? 'leaving' : 'waiting';
          return (
            <span
              key={c.accent}
              className={`col-start-1 row-start-1 block transition-all duration-700 ease-out motion-reduce:transition-none ${
                state === 'active'
                  ? 'opacity-100 translate-y-0'
                  : state === 'leaving'
                    ? 'opacity-0 -translate-y-6'
                    : 'opacity-0 translate-y-6'
              }`}
            >
              {c.top}
              <br />
              <span className="text-[#EC1D25]">{c.accent}</span>
            </span>
          );
        })}
      </span>
    </h1>
  );
}
