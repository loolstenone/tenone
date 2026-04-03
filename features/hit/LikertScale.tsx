'use client';

interface LikertScaleProps {
  value: number | null;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const LABELS = ['매우\n비동의', '', '비동의', '', '보통', '', '동의', '', '매우\n동의'];

export default function LikertScale({ value, onChange, disabled }: LikertScaleProps) {
  return (
    <div className="w-full">
      {/* Scale buttons */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => onChange(n)}
              className={`
                flex items-center justify-center
                min-w-[44px] min-h-[44px] w-full
                rounded-xl text-base font-bold
                transition-all duration-200
                ${isSelected
                  ? 'bg-[#E53935] text-white scale-110 shadow-lg shadow-red-200'
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
        <span className="text-[10px] text-neutral-400 text-center whitespace-pre-line leading-tight">
          {LABELS[0]}
        </span>
        <span className="text-[10px] text-neutral-400 text-center whitespace-pre-line leading-tight">
          {LABELS[4]}
        </span>
        <span className="text-[10px] text-neutral-400 text-center whitespace-pre-line leading-tight">
          {LABELS[8]}
        </span>
      </div>
    </div>
  );
}
