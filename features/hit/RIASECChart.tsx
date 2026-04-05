'use client';

import RadarChart from './RadarChart';

interface RIASECChartProps {
  r: number;
  i: number;
  a: number;
  s: number;
  e: number;
  c: number;
  hollandCode: string;
}

const TYPES: { key: string; label: string; labelKo: string; color: string }[] = [
  { key: 'r', label: 'R', labelKo: '현실형', color: '#795548' },
  { key: 'i', label: 'I', labelKo: '탐구형', color: '#1565C0' },
  { key: 'a', label: 'A', labelKo: '예술형', color: '#7B1FA2' },
  { key: 's', label: 'S', labelKo: '사회형', color: '#2E7D32' },
  { key: 'e', label: 'E', labelKo: '진취형', color: '#E65100' },
  { key: 'c', label: 'C', labelKo: '관습형', color: '#546E7A' },
];

export default function RIASECChart({ r, i, a, s, e, c, hollandCode }: RIASECChartProps) {
  const scores: Record<string, number> = { r, i, a, s, e, c };

  const radarData = TYPES.map(t => ({
    label: `${t.label} ${t.labelKo}`,
    value: scores[t.key] ?? 0,
  }));

  return (
    <div>
      {/* Holland Code */}
      <div className="text-center mb-6">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Holland Code</span>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {hollandCode.split('').map((char, idx) => {
            const typeInfo = TYPES.find(t => t.label === char);
            return (
              <span
                key={idx}
                className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white font-extrabold text-lg"
                style={{ backgroundColor: typeInfo?.color || '#999' }}
              >
                {char}
              </span>
            );
          })}
        </div>
      </div>

      {/* 6각 레이더 차트 */}
      <div className="flex justify-center mb-6">
        <RadarChart data={radarData} size={280} />
      </div>

      {/* 점수 목록 */}
      <div className="grid grid-cols-3 gap-3">
        {TYPES.map((type) => {
          const score = scores[type.key] ?? 0;
          const isInCode = hollandCode.includes(type.label);
          return (
            <div key={type.key} className={`flex items-center gap-2 p-2 rounded-lg ${isInCode ? 'bg-neutral-50' : ''}`}>
              <span
                className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white ${isInCode ? '' : 'opacity-40'}`}
                style={{ backgroundColor: type.color }}
              >
                {type.label}
              </span>
              <div>
                <p className={`text-xs font-medium ${isInCode ? 'text-neutral-800' : 'text-neutral-400'}`}>{type.labelKo}</p>
                <p className={`text-sm font-bold ${isInCode ? 'text-neutral-900' : 'text-neutral-400'}`}>{score}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
