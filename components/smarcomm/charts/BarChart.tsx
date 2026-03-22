'use client';

import { useEffect, useState } from 'react';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  color?: string;
  horizontal?: boolean;
}

export default function BarChart({ data, height = 200, color = '#111827', horizontal = false }: BarChartProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  if (data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value)) * 1.1;

  if (horizontal) {
    return (
      <div className="space-y-2">
        {data.map((d, i) => {
          const pct = (d.value / maxVal) * 100;
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-right text-xs text-text-sub">{d.label}</span>
              <div className="flex-1 h-7 rounded-lg bg-surface overflow-hidden">
                <div
                  className="h-full rounded-lg flex items-center px-2"
                  style={{
                    width: animated ? `${pct}%` : '0%',
                    background: d.color || color,
                    transition: `width 1s ease ${i * 0.1}s`,
                  }}
                >
                  <span className="text-[10px] font-semibold text-white whitespace-nowrap">
                    {d.value >= 10000 ? `${(d.value / 10000).toFixed(1)}만` : d.value.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical bar chart
  const padding = { top: 10, right: 10, bottom: 30, left: 10 };
  const width = 600;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barW = Math.min(40, chartW / data.length - 8);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH;
        const x = padding.left + (i / data.length) * chartW + (chartW / data.length - barW) / 2;
        const y = padding.top + chartH - barH;
        return (
          <g key={i}>
            <rect
              x={x} y={animated ? y : padding.top + chartH}
              width={barW} height={animated ? barH : 0}
              rx={4}
              fill={d.color || color}
              style={{ transition: `all 0.8s ease ${i * 0.1}s` }}
            />
            <text x={x + barW / 2} y={height - 5} textAnchor="middle" fill="#9CA3AF" style={{ fontSize: 10 }}>
              {d.label}
            </text>
            <text x={x + barW / 2} y={y - 5} textAnchor="middle" fill="#6B7280" style={{ fontSize: 10, opacity: animated ? 1 : 0, transition: `opacity 0.5s ${i * 0.1 + 0.5}s` }}>
              {d.value >= 10000 ? `${(d.value / 10000).toFixed(0)}만` : d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
