'use client';

interface CompetencyChartProps {
  common: Record<string, number>;
  trackScores: Record<string, number>;
  trackName: string;
}

// 공통 역량 한글명
const COMMON_NAMES: Record<string, string> = {
  communication: '커뮤니케이션',
  problem_solving: '문제해결',
  teamwork: '팀워크',
  leadership: '리더십',
  time_management: '시간관리',
  critical_thinking: '비판적 사고',
  digital_literacy: '디지털 리터러시',
  project_management: '프로젝트 관리',
};

// 트랙별 역량 한글명
const TRACK_NAMES: Record<string, string> = {
  market_analysis: '시장분석',
  positioning: '포지셔닝',
  consumer_insight: '소비자 인사이트',
  brand_identity: '브랜드 아이덴티티',
  storytelling: '스토리텔링',
  experience_design: '경험설계',
  campaign_planning: '캠페인 기획',
  creative_direction: '크리에이티브 디렉션',
  media_strategy: '미디어 전략',
  content_strategy: '콘텐츠 전략',
  copywriting: '카피라이팅',
  sns_management: 'SNS 운영',
  data_analysis: '데이터 분석',
  performance_marketing: '퍼포먼스 마케팅',
  growth_hacking: '그로스해킹',
  ab_testing: 'A/B 테스팅',
  channel_management: '채널관리',
  roi_optimization: 'ROI 최적화',
};

function getScoreLevel(score: number): { color: string; label: string } {
  if (score >= 80) return { color: 'bg-green-500', label: '우수' };
  if (score >= 60) return { color: 'bg-yellow-500', label: '보통' };
  return { color: 'bg-red-400', label: '보완 필요' };
}

export default function CompetencyChart({ common, trackScores, trackName }: CompetencyChartProps) {
  return (
    <div className="space-y-6">
      {/* Common Competency */}
      <div>
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
          공통 역량
        </h3>
        <div className="space-y-2">
          {Object.entries(common).map(([key, score]) => {
            const { color } = getScoreLevel(score);
            const name = COMMON_NAMES[key] || key;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-neutral-600 w-24 flex-shrink-0 text-right">
                  {name}
                </span>
                <div className="flex-1 h-5 bg-neutral-100 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${color}`}
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

      {/* Track Competency */}
      {Object.keys(trackScores).length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">
            트랙 역량
          </h3>
          <p className="text-xs text-neutral-500 mb-3">{trackName}</p>
          <div className="space-y-2">
            {Object.entries(trackScores).map(([key, score]) => {
              const { color } = getScoreLevel(score);
              const name = TRACK_NAMES[key] || key;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-600 w-24 flex-shrink-0 text-right">
                    {name}
                  </span>
                  <div className="flex-1 h-5 bg-neutral-100 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color}`}
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
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-neutral-400 pt-2">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> 80+ 우수
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> 60-79 보통
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> 60 미만 보완 필요
        </span>
      </div>
    </div>
  );
}
