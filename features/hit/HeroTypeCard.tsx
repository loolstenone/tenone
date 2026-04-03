'use client';

interface HeroTypeCardProps {
  typeCode: string;   // e.g. "D-INTJ"
  nameKo: string;     // e.g. "전략적 지휘관"
  nickname: string;   // e.g. "건축가"
  category: string;   // e.g. "분석형 리더"
  traits: string;     // paragraph description
  careers: string;    // career direction text
}

const DISC_COLORS: Record<string, string> = {
  D: '#E53935',
  I: '#FFB300',
  S: '#43A047',
  C: '#1E88E5',
};

function getDiscType(typeCode: string): string {
  const first = typeCode.charAt(0).toUpperCase();
  return DISC_COLORS[first] ? first : 'D';
}

export default function HeroTypeCard({
  typeCode,
  nameKo,
  nickname,
  category,
  traits,
  careers,
}: HeroTypeCardProps) {
  const discType = getDiscType(typeCode);
  const accentColor = DISC_COLORS[discType] ?? '#E53935';

  return (
    <div
      className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
      style={{ borderLeftWidth: '4px', borderLeftColor: accentColor }}
    >
      <div className="p-6 md:p-8">
        {/* Type code */}
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: accentColor }}>
          {typeCode}
        </h2>

        {/* Korean name */}
        <p className="text-xl md:text-2xl font-semibold text-neutral-900 mt-1">
          {nameKo}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: accentColor }}
          >
            {nickname}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
            {category}
          </span>
        </div>

        {/* Traits */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            성격 특성
          </h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            {traits}
          </p>
        </div>

        {/* Careers */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            커리어 방향
          </h3>
          <p className="text-sm text-neutral-700 leading-relaxed">
            {careers}
          </p>
        </div>
      </div>
    </div>
  );
}
