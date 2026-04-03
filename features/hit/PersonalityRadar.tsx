'use client';

import { AlertTriangle } from 'lucide-react';

interface PersonalityRadarProps {
  scores: Record<string, number>;
  darkTriadFlags: Record<string, boolean>;
}

// 15 하위척도 한글 매핑
const SUBSCALE_NAMES: Record<string, string> = {
  openness: '개방성',
  conscientiousness: '성실성',
  extraversion: '외향성',
  agreeableness: '친화성',
  neuroticism: '신경성',
  curiosity: '호기심',
  creativity_trait: '창의성',
  discipline: '자기규율',
  empathy: '공감능력',
  assertiveness: '자기주장',
  resilience: '회복탄력성',
  adaptability: '적응력',
  self_awareness: '자기인식',
  emotional_regulation: '감정조절',
  growth_mindset: '성장마인드셋',
  // Dark triad
  narcissism_dark: '자기도취',
  machiavellianism_dark: '권모술수',
  psychopathy_dark: '냉담함',
};

// 카테고리 그룹
const CATEGORIES: { name: string; subscales: string[]; color: string }[] = [
  { name: 'Big 5', subscales: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'], color: '#E53935' },
  { name: '핵심 역량', subscales: ['curiosity', 'creativity_trait', 'discipline', 'empathy', 'assertiveness'], color: '#1565C0' },
  { name: '내적 자원', subscales: ['resilience', 'adaptability', 'self_awareness', 'emotional_regulation', 'growth_mindset'], color: '#2E7D32' },
];

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-400';
  return 'bg-red-400';
}

export default function PersonalityRadar({ scores, darkTriadFlags }: PersonalityRadarProps) {
  const hasDarkFlags = Object.values(darkTriadFlags).some(v => v);

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
                const name = SUBSCALE_NAMES[subscale] || subscale;

                return (
                  <div key={subscale} className="flex items-center gap-3">
                    <span className="text-xs text-neutral-600 w-20 flex-shrink-0 text-right">
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

      {/* Dark Triad Warning */}
      {hasDarkFlags && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700 mb-1">주의 영역 감지</p>
              <p className="text-xs text-amber-600">
                일부 성격 특성이 높은 수준으로 나타났습니다. 이는 리더십이나 결단력의 원천이 될 수 있지만,
                대인관계에서 주의가 필요할 수 있습니다.
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {Object.entries(darkTriadFlags)
                  .filter(([, flagged]) => flagged)
                  .map(([key]) => (
                    <span key={key} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full font-medium">
                      {SUBSCALE_NAMES[key] || key}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
