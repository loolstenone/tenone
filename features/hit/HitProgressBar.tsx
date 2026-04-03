'use client';

interface HitProgressBarProps {
  current: number;
  total: number;
  moduleName: string;
}

export default function HitProgressBar({ current, total, moduleName }: HitProgressBarProps) {
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#E53935] transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="text-xs text-neutral-500">{moduleName}</span>
        <span className="text-xs text-neutral-500">
          {current} / {total}
        </span>
      </div>
    </div>
  );
}
