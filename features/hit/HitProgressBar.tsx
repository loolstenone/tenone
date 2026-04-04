'use client';

interface HitProgressBarProps {
  current: number;
  total: number;
  moduleName: string;
}

export default function HitProgressBar({ current, total, moduleName }: HitProgressBarProps) {
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-neutral-400 tracking-wide">{moduleName}</span>
        <span className="text-[11px] text-neutral-400 font-mono">
          {current}/{total}
        </span>
      </div>
      <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#E53935] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
