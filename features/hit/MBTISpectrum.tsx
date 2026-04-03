'use client';

interface MBTISpectrumProps {
  eScore: number; // 0-100, higher = more E
  sScore: number; // 0-100, higher = more S
  tScore: number; // 0-100, higher = more T
  jScore: number; // 0-100, higher = more J
}

interface AxisProps {
  leftLabel: string;
  rightLabel: string;
  leftDesc: string;
  rightDesc: string;
  score: number; // 0-100, higher = more left
}

function SpectrumAxis({ leftLabel, rightLabel, leftDesc, rightDesc, score }: AxisProps) {
  const isLeft = score >= 50;
  const dominantPercent = isLeft ? score : 100 - score;
  const barWidth = Math.abs(score - 50) / 50;

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center gap-3">
        {/* Left label */}
        <div className="w-16 text-right shrink-0">
          <span className={`text-sm font-semibold ${isLeft ? 'text-[#E53935]' : 'text-neutral-400'}`}>
            {leftLabel}
          </span>
          <p className="text-[10px] text-neutral-400 leading-tight">{leftDesc}</p>
        </div>

        {/* Bar */}
        <svg className="flex-1 h-6" viewBox="0 0 200 24" preserveAspectRatio="none">
          {/* Track */}
          <rect x="0" y="8" width="200" height="8" rx="4" fill="#f5f5f5" />
          {/* Center line */}
          <line x1="100" y1="4" x2="100" y2="20" stroke="#d4d4d4" strokeWidth="1" />
          {/* Fill */}
          {isLeft ? (
            <rect
              x={100 - barWidth * 100}
              y="8"
              width={barWidth * 100}
              height="8"
              rx="4"
              fill="#E53935"
            />
          ) : (
            <rect
              x="100"
              y="8"
              width={barWidth * 100}
              height="8"
              rx="4"
              fill="#E53935"
            />
          )}
        </svg>

        {/* Right label */}
        <div className="w-16 text-left shrink-0">
          <span className={`text-sm font-semibold ${!isLeft ? 'text-[#E53935]' : 'text-neutral-400'}`}>
            {rightLabel}
          </span>
          <p className="text-[10px] text-neutral-400 leading-tight">{rightDesc}</p>
        </div>
      </div>

      {/* Percentage */}
      <div className={`text-xs font-medium text-[#E53935] mt-1 ${isLeft ? 'text-left pl-19' : 'text-right pr-19'}`}>
        {dominantPercent}%
      </div>
    </div>
  );
}

export default function MBTISpectrum({ eScore, sScore, tScore, jScore }: MBTISpectrumProps) {
  return (
    <div className="w-full">
      <SpectrumAxis leftLabel="E" rightLabel="I" leftDesc="외향" rightDesc="내향" score={eScore} />
      <SpectrumAxis leftLabel="S" rightLabel="N" leftDesc="감각" rightDesc="직관" score={sScore} />
      <SpectrumAxis leftLabel="T" rightLabel="F" leftDesc="사고" rightDesc="감정" score={tScore} />
      <SpectrumAxis leftLabel="J" rightLabel="P" leftDesc="판단" rightDesc="인식" score={jScore} />
    </div>
  );
}
