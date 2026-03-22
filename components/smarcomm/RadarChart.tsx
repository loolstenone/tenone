'use client';

import { useEffect, useState } from 'react';

interface RadarChartProps {
  labels: string[];
  values: number[]; // 0~100
  size?: number;
}

export default function RadarChart({ labels, values, size = 280 }: RadarChartProps) {
  const [animated, setAnimated] = useState(values.map(() => 0));

  useEffect(() => {
    const t = setTimeout(() => setAnimated(values), 300);
    return () => clearTimeout(t);
  }, [values]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 40;
  const n = labels.length;
  const angleStep = (Math.PI * 2) / n;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const dist = (value / 100) * r;
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
    };
  };

  // 거미줄 그리드 (5단계)
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid circles */}
      {gridLevels.map((level) => {
        const points = Array.from({ length: n }, (_, i) => {
          const p = getPoint(i, level);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={level === 100 ? 1 : 0.5}
          />
        );
      })}

      {/* Axis lines */}
      {labels.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line
            key={`axis-${i}`}
            x1={cx} y1={cy}
            x2={p.x} y2={p.y}
            stroke="#E5E7EB"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={animated.map((v, i) => {
          const p = getPoint(i, v);
          return `${p.x},${p.y}`;
        }).join(' ')}
        fill="rgba(17,24,39,0.08)"
        stroke="#111827"
        strokeWidth={2}
        style={{ transition: 'all 1s cubic-bezier(0.4,0,0.2,1)' }}
      />

      {/* Data points */}
      {animated.map((v, i) => {
        const p = getPoint(i, v);
        return (
          <circle
            key={`dot-${i}`}
            cx={p.x} cy={p.y}
            r={3}
            fill="#111827"
            style={{ transition: 'all 1s cubic-bezier(0.4,0,0.2,1)' }}
          />
        );
      })}

      {/* Labels */}
      {labels.map((label, i) => {
        const p = getPoint(i, 118);
        return (
          <text
            key={`label-${i}`}
            x={p.x} y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#6B7280"
            style={{ fontSize: 11, fontWeight: 500 }}
          >
            {label}
          </text>
        );
      })}

      {/* Score values */}
      {animated.map((v, i) => {
        const p = getPoint(i, v > 30 ? v - 12 : v + 15);
        return (
          <text
            key={`val-${i}`}
            x={p.x} y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#111827"
            style={{ fontSize: 10, fontWeight: 700, transition: 'all 1s' }}
          >
            {v}
          </text>
        );
      })}
    </svg>
  );
}
