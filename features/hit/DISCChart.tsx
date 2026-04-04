'use client';

interface DISCChartProps {
  d: number; // 0-100
  i: number;
  s: number;
  c: number;
  primary: string; // 'D' | 'I' | 'S' | 'C'
}

const DISC_CONFIG = {
  D: { color: '#E53935', label: 'D 주도성' },
  I: { color: '#FFB300', label: 'I 사교성' },
  S: { color: '#43A047', label: 'S 안정성' },
  C: { color: '#1E88E5', label: 'C 신중성' },
} as const;

type DISCKey = keyof typeof DISC_CONFIG;

export default function DISCChart({ d, i, s, c, primary }: DISCChartProps) {
  const scores: { key: DISCKey; value: number }[] = [
    { key: 'D', value: d },
    { key: 'I', value: i },
    { key: 'S', value: s },
    { key: 'C', value: c },
  ];

  return (
    <div className="w-full space-y-4">
      {scores.map(({ key, value }) => {
        const config = DISC_CONFIG[key];
        const isPrimary = key === primary;

        return (
          <div key={key} className="flex items-center gap-3">
            {/* Label */}
            <div className="w-20 shrink-0">
              <span
                className={`text-sm ${isPrimary ? 'font-bold' : 'font-medium'}`}
                style={{ color: config.color }}
              >
                {config.label}
              </span>
            </div>

            {/* Bar track */}
            <div className="flex-1 relative">
              <div
                className={`w-full bg-neutral-100 rounded-full overflow-hidden ${isPrimary ? 'h-5' : 'h-3.5'}`}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${value}%`,
                    backgroundColor: config.color,
                  }}
                />
              </div>
            </div>

            {/* Percentage */}
            <div className="w-12 text-right shrink-0">
              <span
                className={`text-sm tabular-nums ${isPrimary ? 'font-bold' : 'font-medium'} text-neutral-700`}
              >
                {value}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
