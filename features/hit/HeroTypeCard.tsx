'use client';

interface HeroTypeCardProps {
  typeCode: string;
  nameKo: string;
  nickname: string;
  category: string;
  traits: string;
  careers: string;
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
    <div className="border-l-[3px] pl-6" style={{ borderColor: accentColor }}>
      {/* 유형 코드 + 이름 — 한 줄 */}
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-2xl font-extrabold tracking-tight" style={{ color: accentColor }}>
          {typeCode}
        </span>
        <span className="text-lg font-bold text-neutral-900">{nameKo}</span>
      </div>

      {/* 별칭 + 카테고리 */}
      <p className="text-xs text-neutral-400 mb-4">
        {nickname} · {category}
      </p>

      {/* 특성 + 커리어 — 2단 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-[13px] text-neutral-600 leading-relaxed">
        <div>
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">특성</p>
          <p>{traits}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">커리어 방향</p>
          <p>{careers}</p>
        </div>
      </div>
    </div>
  );
}
