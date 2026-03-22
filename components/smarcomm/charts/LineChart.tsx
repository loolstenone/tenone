'use client';

import { useEffect, useState } from 'react';

interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  showArea?: boolean;
}

export default function LineChart({ data, height = 200, color = '#111827', showArea = true }: LineChartProps) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);

  if (data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const width = 600;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.value)) * 1.1;
  const minVal = 0;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // Y축 눈금
  const yTicks = 4;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minVal + ((maxVal - minVal) / yTicks) * i;
    const y = padding.top + chartH - (i / yTicks) * chartH;
    return { val, y };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Y축 그리드 */}
      {yLines.map((tick, i) => (
        <g key={i}>
          <line x1={padding.left} y1={tick.y} x2={width - padding.right} y2={tick.y} stroke="#E5E7EB" strokeWidth={0.5} />
          <text x={padding.left - 8} y={tick.y + 4} textAnchor="end" fill="#9CA3AF" style={{ fontSize: 10 }}>
            {tick.val >= 10000 ? `${(tick.val / 10000).toFixed(0)}만` : tick.val >= 1000 ? `${(tick.val / 1000).toFixed(0)}k` : Math.round(tick.val)}
          </text>
        </g>
      ))}

      {/* X축 라벨 */}
      {data.map((d, i) => {
        if (data.length > 8 && i % 2 !== 0) return null;
        return (
          <text key={i} x={points[i].x} y={height - 5} textAnchor="middle" fill="#9CA3AF" style={{ fontSize: 10 }}>
            {d.label}
          </text>
        );
      })}

      {/* 영역 */}
      {showArea && (
        <path d={areaPath} fill={`${color}10`} style={{ transition: 'opacity 1s', opacity: animated ? 1 : 0 }} />
      )}

      {/* 라인 */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: animated ? 'none' : '2000',
          strokeDashoffset: animated ? '0' : '2000',
          transition: 'stroke-dashoffset 1.5s ease',
        }}
      />

      {/* 데이터 포인트 */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="white" stroke={color} strokeWidth={2}
          style={{ opacity: animated ? 1 : 0, transition: `opacity 0.5s ${i * 0.1}s` }} />
      ))}
    </svg>
  );
}
