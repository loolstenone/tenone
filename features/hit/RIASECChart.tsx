'use client';

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

  return (
    <div>
      {/* Holland Code */}
      <div className="text-center mb-6">
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Holland Code</span>
        <div className="flex items-center justify-center gap-1 mt-2">
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

      {/* Bars */}
      <div className="space-y-3">
        {TYPES.map((type) => {
          const score = scores[type.key] ?? 0;
          const isInCode = hollandCode.includes(type.label);

          return (
            <div key={type.key} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-16 flex-shrink-0">
                <span
                  className={`
                    inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold text-white
                    ${isInCode ? '' : 'opacity-40'}
                  `}
                  style={{ backgroundColor: type.color }}
                >
                  {type.label}
                </span>
                <span className={`text-xs ${isInCode ? 'text-neutral-700 font-medium' : 'text-neutral-400'}`}>
                  {type.labelKo}
                </span>
              </div>
              <div className="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${score}%`,
                    backgroundColor: type.color,
                    opacity: isInCode ? 1 : 0.4,
                  }}
                />
                <span className="absolute inset-0 flex items-center justify-end pr-2.5 text-[11px] font-bold text-neutral-700">
                  {score}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
