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
    ? { active: 'bg-blue-600 text-white border-blue-600', inactive: 'bg-white text-neutral-600 border-neutral-200 hover:border-blue-300' }
    : { active: 'bg-emerald-600 text-white border-emerald-600', inactive: 'bg-white text-neutral-600 border-neutral-200 hover:border-emerald-300' };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-900">{label}</span>
        <span className="text-xs text-neutral-400">{selected.length}/{max}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${selected.includes(tag) ? colors.active : colors.inactive}`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
