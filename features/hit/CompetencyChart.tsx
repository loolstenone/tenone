'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CompetencyChartProps {
  common: Record<string, number>;
  trackScores: Record<string, number>;
  trackName: string;
}

// 역량 한글명
const NAMES: Record<string, string> = {
  communication: '커뮤니케이션', problem_solving: '문제해결', collaboration: '협업',
  self_management: '자기관리', learning_agility: '학습 민첩성', initiative: '주도성',
  persuasion: '설득력', consistency: '일관성', digital_literacy: '디지털 리터러시',
  market_analysis: '시장분석', consumer_insight: '소비자 인사이트', data_driven: '데이터 기반 의사결정',
  analytics: '분석', brand_identity: '브랜드 아이덴티티', storytelling: '스토리텔링',
  visual_sense: '시각적 감각', creative_concept: '크리에이티브 컨셉', content_creation: '콘텐츠 제작',
  campaign_mgmt: '캠페인 관리', planning: '기획', reporting: '보고서 작성',
  strategic_thinking: '전략적 사고', seo: 'SEO', editorial: '편집',
  customer_focus: '고객 중심', stakeholder_mgmt: '이해관계자 관리',
  platform_knowledge: '플랫폼 이해', audience_engagement: '오디언스 참여',
  copy_writing: '카피라이팅', media_planning: '미디어 기획',
  ab_testing: 'A/B 테스팅', funnel_optimization: '퍼널 최적화',
};

// 6카테고리 그룹핑
const CATEGORIES: { name: string; keys: string[]; color: string }[] = [
  { name: '소통·협업', keys: ['communication', 'collaboration', 'persuasion', 'stakeholder_mgmt'], color: 'bg-blue-500' },
  { name: '분석·데이터', keys: ['analytics', 'data_driven', 'market_analysis', 'consumer_insight', 'ab_testing', 'funnel_optimization'], color: 'bg-green-500' },
  { name: '창의·콘텐츠', keys: ['storytelling', 'visual_sense', 'creative_concept', 'content_creation', 'copy_writing', 'brand_identity'], color: 'bg-purple-500' },
  { name: '실행·관리', keys: ['campaign_mgmt', 'self_management', 'initiative', 'consistency', 'learning_agility'], color: 'bg-orange-500' },
  { name: '전략·기획', keys: ['strategic_thinking', 'planning', 'reporting', 'seo', 'editorial', 'customer_focus'], color: 'bg-red-500' },
  { name: '디지털·플랫폼', keys: ['digital_literacy', 'platform_knowledge', 'audience_engagement', 'media_planning'], color: 'bg-cyan-500' },
];

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-400';
}

export default function CompetencyChart({ common, trackScores, trackName }: CompetencyChartProps) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const allScores = { ...common, ...trackScores };

  // 카테고리별 평균 산출
  const catData = CATEGORIES.map(cat => {
    const vals = cat.keys.map(k => allScores[k]).filter(v => v !== undefined && v > 0);
    const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    const items = cat.keys
      .filter(k => allScores[k] !== undefined)
      .map(k => ({ key: k, name: NAMES[k] || k, score: allScores[k] }))
      .sort((a, b) => b.score - a.score);
    return { ...cat, avg, items };
  }).filter(c => c.avg > 0);

  return (
    <div className="space-y-4">
      {/* 카테고리 평균 바 차트 */}
      {catData.map(cat => (
        <div key={cat.name}>
          {/* 카테고리 바 */}
          <button
            onClick={() => setExpandedCat(expandedCat === cat.name ? null : cat.name)}
            className="w-full flex items-center gap-3 group"
          >
            <span className="text-sm text-neutral-700 w-28 flex-shrink-0 text-right font-medium">
              {cat.name}
            </span>
            <div className="flex-1 h-7 bg-neutral-100 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                style={{ width: `${cat.avg}%`, opacity: 0.8 }}
              />
              <span className="absolute inset-0 flex items-center justify-end pr-3 text-xs font-bold text-neutral-700">
                {cat.avg}
              </span>
            </div>
            <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform ${expandedCat === cat.name ? 'rotate-180' : ''}`} />
          </button>

          {/* 펼치기: 상세 역량 */}
          {expandedCat === cat.name && (
            <div className="ml-32 mt-2 mb-4 space-y-1.5 border-l-2 border-neutral-100 pl-4">
              {cat.items.map(item => (
                <div key={item.key} className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500 w-28 flex-shrink-0 text-right">
                    {item.name}
                  </span>
                  <div className="flex-1 h-4 bg-neutral-50 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full ${getBarColor(item.score)}`}
                      style={{ width: `${item.score}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-end pr-2 text-[9px] font-bold text-neutral-600">
                      {item.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* 범례 */}
      <div className="flex items-center gap-4 text-[10px] text-neutral-400 pt-3 border-t border-neutral-100">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> 80+ 우수</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> 60-79 보통</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> 60 미만 보완 필요</span>
        <span className="ml-auto text-neutral-300">카테고리를 클릭하면 상세 역량을 볼 수 있습니다</span>
      </div>
    </div>
  );
}
