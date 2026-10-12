'use client';

/**
 * DISC 행동 비중 — 네 방식의 합이 100인 '비중'이다 (lib/hit/scoring.ts scoreBT).
 * 고르게 나오면 25%씩이고 실제로는 15~40% 사이에 모인다 → 막대 눈금을 0~50%로 두고 25% 기준선을 그린다.
 * 1·2위 차이가 작으면 '복합형'으로 읽는다 (2026-10-12 — 36%가 어떻게 대표 유형이냐는 오해 방지).
 */
interface DISCChartProps {
  d: number;
  i: number;
  s: number;
  c: number;
  primary: string; // 'D' | 'I' | 'S' | 'C'
  /** 방식별 강도 0~100 (R7). 있으면 막대 = 강도, 비중은 보조 표기 */
  intensity?: { D: number; I: number; S: number; C: number } | null;
}

const DISC_CONFIG = {
  D: { color: '#E53935', label: 'D 주도형', what: '목표를 향해 빠르게 결정하고 밀어붙임' },
  I: { color: '#FFB300', label: 'I 사교형', what: '사람을 모으고 분위기를 띄우며 설득함' },
  S: { color: '#43A047', label: 'S 안정형', what: '꾸준하고 차분하게 팀을 받쳐 줌' },
  C: { color: '#1E88E5', label: 'C 신중형', what: '정확성과 기준을 중시하며 꼼꼼히 확인함' },
} as const;

type DISCKey = keyof typeof DISC_CONFIG;
const SCALE_MAX = 50; // 비중 50%를 막대 끝으로

/** 강도 기준 읽기 — 1·2위 강도 차이로 뚜렷/경향/복합 */
export function discIntensityReading(it: Record<DISCKey, number>) {
  const sorted = (Object.entries(it) as [DISCKey, number][]).sort((a, b) => b[1] - a[1]);
  const [first, second] = sorted;
  const gap = first[1] - second[1];
  const name = (k: DISCKey) => DISC_CONFIG[k].label.slice(2);
  if (gap < 8) return `${name(first[0])}(${first[1]})과 ${name(second[0])}(${second[1]}) 방식을 비슷한 세기로 함께 쓰는 복합형입니다.`;
  if (gap < 15) return `${name(first[0])} 방식(${first[1]})이 가장 강하고, ${name(second[0])} 방식(${second[1]})도 자주 함께 나타납니다.`;
  return `${name(first[0])} 방식이 뚜렷하게 강합니다(${first[1]}). 다음은 ${name(second[0])}(${second[1]})입니다.`;
}

export function discReading(scores: Record<DISCKey, number>) {
  const sorted = (Object.entries(scores) as [DISCKey, number][]).sort((a, b) => b[1] - a[1]);
  const [first, second] = sorted;
  const gap = first[1] - second[1];
  const name = (k: DISCKey) => DISC_CONFIG[k].label.slice(2);
  if (gap < 4) return `${name(first[0])}과 ${name(second[0])} 방식을 비슷하게 함께 쓰는 복합형입니다 (${first[1]}% · ${second[1]}%).`;
  if (gap < 8) return `평소에는 ${name(first[0])}(${first[1]}%)으로 움직이고, ${name(second[0])}(${second[1]}%) 방식도 자주 함께 씁니다.`;
  return `${name(first[0])}(${first[1]}%) 방식이 뚜렷하게 앞섭니다. 다음은 ${name(second[0])}(${second[1]}%)입니다.`;
}

export default function DISCChart({ d, i, s, c, primary, intensity }: DISCChartProps) {
  const share: Record<DISCKey, number> = { D: d, I: i, S: s, C: c };
  if (intensity && Object.values(intensity).some(v => v > 0)) return <IntensityView intensity={intensity} share={share} primary={primary} />;
  const scores: { key: DISCKey; value: number }[] = [
    { key: 'D', value: d }, { key: 'I', value: i }, { key: 'S', value: s }, { key: 'C', value: c },
  ];

  return (
    <div className="w-full">
      <p className="text-[15px] text-neutral-800 leading-[1.8] mb-6">{discReading({ D: d, I: i, S: s, C: c })}</p>
      <div className="space-y-4">
        {scores.map(({ key, value }) => {
          const config = DISC_CONFIG[key];
          const isPrimary = key === primary;
          return (
            <div key={key}>
              <div className="flex items-center gap-3">
                <span className={`w-20 shrink-0 text-sm ${isPrimary ? 'font-bold' : 'font-medium'}`} style={{ color: config.color }}>{config.label}</span>
                <div className="flex-1 relative h-4">
                  <div className="absolute inset-y-0 left-0 right-0 my-auto h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / SCALE_MAX) * 100)}%`, backgroundColor: config.color, opacity: isPrimary ? 1 : 0.75 }} />
                  </div>
                  {/* 25% 기준선 (고르게 나올 때) */}
                  <div className="absolute top-[-3px] bottom-[-3px] left-1/2 border-l border-dashed border-neutral-400" aria-hidden="true" />
                </div>
                <span className={`w-12 text-right shrink-0 text-sm tabular-nums ${isPrimary ? 'font-bold' : 'font-medium'} text-neutral-700`}>{value}%</span>
              </div>
              <p className="text-[12px] text-neutral-400 mt-1 pl-[92px]">{config.what}</p>
            </div>
          );
        })}
      </div>
      <p className="text-[12px] text-neutral-400 mt-5 leading-relaxed">
        네 방식의 비중을 합치면 100%입니다. 넷이 고르면 각각 25%(점선)이고, 점선보다 길수록 평소에 더 많이 쓰는 방식입니다. 누구나 네 방식을 모두 씁니다.
      </p>
    </div>
  );
}

/** 강도 보기 (R7) — 막대 = 강도 0~100, 오른쪽에 비중 보조 */
function IntensityView({ intensity, share, primary }: { intensity: Record<DISCKey, number>; share: Record<DISCKey, number>; primary: string }) {
  const keys: DISCKey[] = ['D', 'I', 'S', 'C'];
  return (
    <div className="w-full">
      <p className="text-[15px] text-neutral-800 leading-[1.8] mb-6">{discIntensityReading(intensity)}</p>
      <div className="space-y-4">
        {keys.map(key => {
          const config = DISC_CONFIG[key];
          const isPrimary = key === primary;
          const v = intensity[key] ?? 0;
          return (
            <div key={key}>
              <div className="flex items-center gap-3">
                <span className={`w-20 shrink-0 text-sm ${isPrimary ? 'font-bold' : 'font-medium'}`} style={{ color: config.color }}>{config.label}</span>
                <div className="flex-1 h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(2, Math.min(100, v))}%`, backgroundColor: config.color, opacity: isPrimary ? 1 : 0.75 }} />
                </div>
                <span className={`w-10 text-right shrink-0 text-sm tabular-nums ${isPrimary ? 'font-bold' : 'font-medium'} text-neutral-800`}>{v}</span>
              </div>
              <p className="text-[12px] text-neutral-400 mt-1 pl-[92px]">{config.what} · 비중 {share[key]}%</p>
            </div>
          );
        })}
      </div>
      <p className="text-[12px] text-neutral-400 mt-5 leading-relaxed">
        강도(0~100)는 그 방식의 문항에 얼마나 "그렇다"고 답했는지입니다. 비중은 네 방식의 응답 합계를 100으로 나눈 값이라 고르게 나오면 25%씩입니다. 누구나 네 방식을 모두 씁니다.
      </p>
    </div>
  );
}
