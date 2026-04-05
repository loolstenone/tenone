'use client';

interface PersonalityRadarProps {
  scores: Record<string, number>;
  darkTriadFlags?: Record<string, boolean>;
  labels?: Record<string, string>;
}

// 실제 DB 키 → 소비자 친화 한국어
const SUBSCALE_NAMES: Record<string, string> = {
  warmth: '공감력',
  control: '자기조절',
  tension: '스트레스 반응',
  openness: '개방성',
  optimism: '낙관성',
  adventure: '도전성',
  dominance: '추진력',
  intellect: '탐구심',
  suspicion: '경계심',
  conscience: '책임감',
  sensitivity: '감수성',
  independence: '자립성',
  perfectionism: '꼼꼼함',
  self_discipline: '자기관리',
  social_boldness: '적극성',
};

// 카테고리 그룹 (실제 DB 키 기반)
const CATEGORIES: { name: string; subscales: string[]; color: string }[] = [
  {
    name: '대인관계',
    subscales: ['warmth', 'social_boldness', 'sensitivity', 'suspicion'],
    color: '#E53935',
  },
  {
    name: '내적 자원',
    subscales: ['openness', 'intellect', 'adventure', 'optimism'],
    color: '#1565C0',
  },
  {
    name: '자기관리',
    subscales: ['control', 'conscience', 'self_discipline', 'perfectionism'],
    color: '#2E7D32',
  },
  {
    name: '독립성',
    subscales: ['dominance', 'independence', 'tension'],
    color: '#FF8F00',
  },
];

function getScoreColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  if (score >= 30) return 'bg-orange-400';
  return 'bg-red-400';
}

export default function PersonalityRadar({ scores, labels }: PersonalityRadarProps) {
  // DB 라벨 우선, 없으면 하드코딩 fallback
  const getName = (key: string) => labels?.[key] || SUBSCALE_NAMES[key] || key;

  return (
    <div className="space-y-6">
      {CATEGORIES.map((cat) => {
        const visibleSubscales = cat.subscales.filter(s => scores[s] !== undefined);
        if (visibleSubscales.length === 0) return null;

        return (
          <div key={cat.name}>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
              {cat.name}
            </h3>
            <div className="space-y-2">
              {visibleSubscales.map((subscale) => {
                const score = scores[subscale] ?? 0;
                const name = getName(subscale);

                return (
                  <div key={subscale} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-600 w-24 flex-shrink-0 text-right">
                      {name}
                    </span>
                    <div className="flex-1 h-5 bg-neutral-100 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getScoreColor(score)}`}
                        style={{ width: `${score}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-bold text-neutral-700">
                        {score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* dark_triad: 소비자에게 일체 노출하지 않음. 관리자 전용 내부 플래그. */}
    </div>
  );
}
