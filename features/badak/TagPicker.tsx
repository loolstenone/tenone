'use client';

interface Props {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (tags: string[]) => void;
  max?: number;
  color?: 'blue' | 'emerald';
}

export default function TagPicker({ label, options, selected, onChange, max = 5, color = 'blue' }: Props) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else if (selected.length < max) {
      onChange([...selected, tag]);
    }
  };

  const colors = color === 'blue'
    ? { active: 'bg-neutral-600 text-white border-neutral-600', inactive: 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300' }
    : { active: 'bg-neutral-600 text-white border-neutral-600', inactive: 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300' };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-neutral-900">{label}</span>
        <span className="text-xs text-neutral-400">{selected.length}/{max}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`rounded-none border px-3 py-1.5 text-sm transition-colors ${selected.includes(tag) ? colors.active : colors.inactive}`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
