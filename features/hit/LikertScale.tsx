'use client';

interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/** 7점 척도 의미 — 안내 문구(전혀 아니다 … 매우 그렇다)와 같은 표현 */
const MEANING = ['전혀 아니다', '아니다', '조금 아니다', '보통', '조금 그렇다', '그렇다', '매우 그렇다'];

export default function LikertScale({ value, onChange, disabled }: LikertScaleProps) {
  return (
    <div className="w-full">
      {/* Scale buttons */}
      <div role="radiogroup" aria-label="7점 척도" className="flex items-center justify-between gap-1 sm:gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-pressed={isSelected}
              aria-label={`7점 중 ${n}점 — ${MEANING[n - 1]}`}
              disabled={disabled}
              onClick={() => onChange(n)}
              className={`
                flex items-center justify-center
                min-w-0 min-h-[44px] flex-1
                rounded-xl text-base font-bold
                transition-all duration-200
                ${isSelected
                  ? 'bg-[#E53935] text-white scale-105 shadow-lg shadow-red-200'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
              `}
            >
              {n}
            </button>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-[10px] text-neutral-400 text-center leading-tight">전혀 아니다</span>
        <span className="text-[10px] text-neutral-400 text-center leading-tight">보통</span>
        <span className="text-[10px] text-neutral-400 text-center leading-tight">매우 그렇다</span>
      </div>
    </div>
  );
}
