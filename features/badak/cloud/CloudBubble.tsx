'use client';

import type { CloudWord } from '@/types/badak';

interface CloudBubbleProps {
  word: CloudWord;
  index: number;
  total: number;
  rotation: { x: number; y: number };
  radius?: number;
  onClick: (word: CloudWord) => void;
}

const TRUNCATE_LEN = 14; // 구에서 보여주는 최대 글자 수

export function CloudBubble({ word, index, total, rotation, radius = 180, onClick }: CloudBubbleProps) {
  // Fibonacci lattice로 구 표면에 균등 배치
  const phi = Math.acos(-1 + (2 * index + 1) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;
  const r = radius;

  let sx = Math.cos(theta) * Math.sin(phi);
  let sy = Math.sin(theta) * Math.sin(phi);
  let sz = Math.cos(phi);

  // Y축 회전 (좌우 스핀)
  const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);
  const rx = sx * cosY - sz * sinY;
  sz = sx * sinY + sz * cosY;
  sx = rx;

  // X축 회전 (상하 틸트)
  const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
  const ry = sy * cosX - sz * sinX;
  sz = sy * sinX + sz * cosX;
  sy = ry;

  // 원근 투영 (depth 효과)
  const perspective = 600;
  const projScale = perspective / (perspective + r - sz * r);
  const x = sx * r * projScale;
  const y = sy * r * projScale;
  const depth = (sz + 1) / 2;

  const scale = projScale * (0.5 + depth * 0.5);
  const opacity = Math.pow(depth, 1.5) * 0.9 + 0.1;
  // 반응형 폰트: 작은 구에서는 더 작게
  const baseFontMax = radius < 180 ? 13 : 16;
  const baseFontMin = radius < 180 ? 9 : 11;
  const fontSize = Math.max(baseFontMin, Math.min(baseFontMax, word.size * baseFontMin));

  // 텍스트 자르기 (모바일에선 더 짧게)
  const maxLen = radius < 180 ? 10 : TRUNCATE_LEN;
  const displayText = word.text.length > maxLen
    ? word.text.slice(0, maxLen) + '…'
    : word.text;

  const color = word.hasGroup
    ? ['#ffd93d', '#fbbf24', '#f59e0b', '#fcd34d'][index % 4]
    : ['#94a3b8', '#a1a1aa', '#9ca3af', '#cbd5e1'][index % 4];

  // 구 뒷면은 숨김 (더 엄격한 기준으로 밀도 감소)
  if (depth < 0.2) return null;

  return (
    <div
      onClick={() => onClick(word)}
      className="absolute cursor-pointer whitespace-nowrap"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        zIndex: Math.round(depth * 100),
        transition: 'left 0.08s linear, top 0.08s linear, transform 0.08s linear, opacity 0.15s ease-out',
        willChange: 'left, top, transform, opacity',
        fontSize: `${fontSize}px`,
        fontWeight: depth > 0.6 ? 700 : 500,
        color,
        letterSpacing: '-0.03em',
        lineHeight: 1.2,
        textShadow: depth > 0.7 ? '0 1px 6px rgba(0,0,0,0.4)' : 'none',
        filter: depth < 0.35 ? `blur(${(1 - depth * 3) * 2}px)` : 'none',
      }}
      title={word.text.length > maxLen ? word.text : undefined}
    >
      {displayText}
    </div>
  );
}
