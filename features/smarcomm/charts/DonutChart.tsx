'use client';

import { useEffect, useState } from 'react';

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}

export default function DonutChart({ data, size = 180, centerLabel, centerValue }: DonutChartProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 200); }, []);

  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 20;
  const strokeWidth = 24;

  let cumAngle = -90;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 배경 원 */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F1F3" strokeWidth={strokeWidth} />

        {/* 데이터 세그먼트 */}
        {data.map((d, i) => {
          const pct = d.value / total;
          const angle = pct * 360;
          const circ = 2 * Math.PI * r;
          const dashLen = (angle / 360) * circ;
          const dashOffset = ((cumAngle + 90) / 360) * circ;

          cumAngle += angle;

          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${animated ? dashLen : 0} ${circ}`}
              strokeDashoffset={-dashOffset}
              strokeLinecap="round"
              style={{ transition: `stroke-dasharray 1s ease ${i * 0.2}s` }}
            />
          );
        })}

        {/* 중앙 텍스트 */}
        {centerValue && (
          <>
            <text x={cx} y={cy - 4} textAnchor="middle" fill="#111827" style={{ fontSize: 22, fontWeight: 700 }}>
              {centerValue}
            </text>
            {centerLabel && (
              <text x={cx} y={cy + 14} textAnchor="middle" fill="#9CA3AF" style={{ fontSize: 11 }}>
                {centerLabel}
              </text>
            )}
          </>
        )}
      </svg>

      {/* 범례 */}
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-xs text-text-sub">{d.label}</span>
            <span className="text-xs font-semibold text-text">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
