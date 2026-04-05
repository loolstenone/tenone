'use client';

import { AlertTriangle } from 'lucide-react';

interface PersonalityRadarProps {
  scores: Record<string, number>;
  darkTriadFlags: Record<string, boolean>;
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

      {/* 주의 영역 — dark_triad 라벨 노출하지 않음 */}
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
              <p className="text-xs text-amber-500 mt-2">
                더 정확한 해석을 위해 전문 상담사와의 대면 상담을 권합니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
