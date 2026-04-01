'use client';

import { useEffect, useState } from 'react';

interface GaugeChartProps {
  score: number;
  label: string;
  color: string;
  size?: number;
}

export default function GaugeChart({ score, label, color, size = 120 }: GaugeChartProps) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const pct = (animated / 100) * 0.75;

  return (
    <div className="text-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#F0F1F3" strokeWidth="6"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text
          x={size / 2} y={size / 2 - 2}
          textAnchor="middle" fill="#111827"
          style={{ fontSize: size * 0.26, fontWeight: 700 }}
        >
          {animated}
        </text>
        <text
          x={size / 2} y={size / 2 + 14}
          textAnchor="middle" fill="#9CA3AF"
          style={{ fontSize: 10 }}
        >
          / 100
        </text>
      </svg>
      <div className="mt-[-2px] text-xs font-medium tracking-wider text-text-sub">
        {label}
      </div>
    </div>
  );
}
