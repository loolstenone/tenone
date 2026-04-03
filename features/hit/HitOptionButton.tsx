'use client';

interface HitOptionButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  index: number;
  shortcut?: string;
}

export default function HitOptionButton({
  label,
  selected,
  onClick,
  index,
  shortcut,
}: HitOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative w-full min-h-[56px] px-5 py-4 rounded-xl border text-left
        transition-all duration-150 cursor-pointer
        ${
          selected
            ? 'border-[#E53935] bg-red-50 text-[#E53935] font-medium'
            : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400'
        }
      `}
    >
      <span className="text-base">{label}</span>
      {shortcut && (
        <span
          className={`
            hidden md:inline-flex absolute top-2 right-2
            w-6 h-6 items-center justify-center rounded text-xs font-mono
            ${selected ? 'bg-[#E53935] text-white' : 'bg-neutral-100 text-neutral-400'}
          `}
        >
          {shortcut}
        </span>
      )}
    </button>
  );
}
