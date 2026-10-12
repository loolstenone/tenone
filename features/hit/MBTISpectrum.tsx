'use client';

/**
 * 성격 4축 — 한 축의 양쪽 비율 (예: 외향 78 · 내향 22). 반대 성향도 함께 있다는 것을 보여 주기 위해 막대 하나를 양쪽으로 나눠 그린다.
 * 2026-10-12: 가운데에서 한쪽으로만 칠하던 방식 → 78%가 절반 길이로 보이고 반대쪽이 0처럼 보이던 문제 수정
 */
interface MBTISpectrumProps {
  eScore: number; // 0-100, higher = more E
  sScore: number; // 0-100, higher = more S
  tScore: number; // 0-100, higher = more T
  jScore: number; // 0-100, higher = more J
}

interface AxisProps {
  leftLabel: string; rightLabel: string; leftDesc: string; rightDesc: string;
  score: number; // 왼쪽 비율 0-100
}

function strength(p: number) {
  if (p >= 70) return '뚜렷함';
  if (p >= 60) return '조금 기욺';
  return '거의 반반';
}

function SpectrumAxis({ leftLabel, rightLabel, leftDesc, rightDesc, score }: AxisProps) {
  const left = Math.max(0, Math.min(100, Math.round(score)));
  const right = 100 - left;
  const leftWins = left >= right;
  const dominant = leftWins ? left : right;

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-baseline justify-between text-sm">
        <span className={leftWins ? 'font-bold text-neutral-900' : 'text-neutral-400'}>{leftDesc} {leftLabel} <span className="tabular-nums">{left}</span></span>
        <span className="text-[12px] text-neutral-400">{leftWins ? leftDesc : rightDesc} {strength(dominant)}</span>
        <span className={!leftWins ? 'font-bold text-neutral-900' : 'text-neutral-400'}><span className="tabular-nums">{right}</span> {rightLabel} {rightDesc}</span>
      </div>
      <div className="relative mt-2 h-3 flex rounded-full overflow-hidden">
        <div className={leftWins ? 'bg-[#E53935]' : 'bg-neutral-200'} style={{ width: `${left}%` }} />
        <div className={!leftWins ? 'bg-[#E53935]' : 'bg-neutral-200'} style={{ width: `${right}%` }} />
        <div className="absolute inset-y-0 left-1/2 w-px bg-white" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function MBTISpectrum({ eScore, sScore, tScore, jScore }: MBTISpectrumProps) {
  return (
    <div className="w-full">
      <div className="divide-y divide-neutral-100">
        <SpectrumAxis leftLabel="E" rightLabel="I" leftDesc="외향" rightDesc="내향" score={eScore} />
        <SpectrumAxis leftLabel="S" rightLabel="N" leftDesc="감각" rightDesc="직관" score={sScore} />
        <SpectrumAxis leftLabel="T" rightLabel="F" leftDesc="사고" rightDesc="감정" score={tScore} />
        <SpectrumAxis leftLabel="J" rightLabel="P" leftDesc="판단" rightDesc="인식" score={jScore} />
      </div>
      <p className="text-[12px] text-neutral-400 mt-5 leading-relaxed">
        한 축의 두 성향은 합쳐서 100입니다. 누구나 양쪽을 다 가지고 있고, 더 큰 쪽이 평소에 자주 쓰는 성향입니다. 50에 가까울수록 상황에 따라 두 쪽을 오갑니다.
      </p>
    </div>
  );
}
