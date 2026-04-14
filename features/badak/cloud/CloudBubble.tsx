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

export function CloudBubble({ word, index, total, rotation, radius = 180, onClick }: CloudBubbleProps) {
  const phi = Math.acos(-1 + (2 * index + 1) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;
  const r = radius;

  let sx = Math.cos(theta) * Math.sin(phi);
  let sy = Math.sin(theta) * Math.sin(phi);
  let sz = Math.cos(phi);

  const cosY = Math.cos(rotation.y), sinY = Math.sin(rotation.y);
  const rx = sx * cosY - sz * sinY;
  sz = sx * sinY + sz * cosY;
  sx = rx;

  const cosX = Math.cos(rotation.x), sinX = Math.sin(rotation.x);
  const ry = sy * cosX - sz * sinX;
  sz = sy * sinX + sz * cosX;
  sy = ry;

  // Perspective projection for globe-like depth
  const perspective = 600;
  const projScale = perspective / (perspective + r - sz * r);
  const x = sx * r * projScale;
  const y = sy * r * projScale;
  const depth = (sz + 1) / 2;

  const scale = projScale * (0.5 + depth * 0.5);
  const opacity = Math.pow(depth, 1.5) * 0.9 + 0.1;
  const fontSize = Math.max(9, Math.min(13, word.size * 9));

  const color = word.hasGroup
    ? ['#ffd93d', '#fbbf24', '#f59e0b', '#fcd34d'][index % 4]
    : ['#94a3b8', '#a1a1aa', '#9ca3af', '#cbd5e1'][index % 4];

  // Hide items on the far back of the sphere
  if (depth < 0.15) return null;

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
        filter: depth < 0.3 ? `blur(${(1 - depth * 3) * 2}px)` : 'none',
      }}
    >
      {word.text}
    </div>
  );
}
