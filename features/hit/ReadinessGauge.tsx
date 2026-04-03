'use client';

import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ReadinessGaugeProps {
  self: number;
  portfolio: number;
  interview: number;
  network: number;
  total: number;
  grade: string;
  gaps: string[];
}

const GRADE_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  A: { bg: 'bg-green-50', text: 'text-green-600', ring: 'ring-green-300' },
  B: { bg: 'bg-yellow-50', text: 'text-yellow-600', ring: 'ring-yellow-300' },
  C: { bg: 'bg-orange-50', text: 'text-orange-600', ring: 'ring-orange-300' },
  D: { bg: 'bg-red-50', text: 'text-red-600', ring: 'ring-red-300' },
};

const DOMAINS: { key: string; label: string }[] = [
  { key: 'self', label: '자기이해' },
  { key: 'portfolio', label: '포트폴리오' },
  { key: 'interview', label: '면접준비' },
  { key: 'network', label: '네트워킹' },
];

function getDomainStatus(score: number): { icon: typeof CheckCircle; label: string; color: string } {
  if (score >= 70) return { icon: CheckCircle, label: 'Ready', color: 'text-green-500' };
  if (score >= 50) return { icon: Clock, label: 'In Progress', color: 'text-yellow-500' };
  return { icon: AlertCircle, label: 'Gap', color: 'text-red-400' };
}

export default function ReadinessGauge({ self, portfolio, interview, network, total, grade, gaps }: ReadinessGaugeProps) {
  const scores: Record<string, number> = { self, portfolio, interview, network };
  const gradeStyle = GRADE_COLORS[grade] || GRADE_COLORS.D;

  return (
    <div>
      {/* Grade Circle */}
      <div className="flex justify-center mb-6">
        <div className={`
          w-24 h-24 rounded-full flex flex-col items-center justify-center
          ${gradeStyle.bg} ring-4 ${gradeStyle.ring}
        `}>
          <span className={`text-4xl font-black ${gradeStyle.text}`}>{grade}</span>
          <span className="text-[10px] text-neutral-500 font-medium">총점 {total}</span>
        </div>
      </div>

      {/* Domain Bars */}
      <div className="space-y-3">
        {DOMAINS.map((domain) => {
          const score = scores[domain.key] ?? 0;
          const status = getDomainStatus(score);
          const StatusIcon = status.icon;

          return (
            <div key={domain.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-neutral-700">{domain.label}</span>
                <div className="flex items-center gap-1">
                  <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                  <span className={`text-[10px] font-medium ${status.color}`}>{status.label}</span>
                </div>
              </div>
              <div className="h-5 bg-neutral-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-400'
                  }`}
                  style={{ width: `${score}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-end pr-2.5 text-[10px] font-bold text-neutral-700">
                  {score}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gap Items */}
      {gaps.length > 0 && (
        <div className="mt-5 p-4 bg-red-50 rounded-xl">
          <p className="text-xs font-bold text-red-700 mb-2">보완이 필요한 영역</p>
          <div className="flex flex-wrap gap-1.5">
            {gaps.map((gap) => (
              <span key={gap} className="px-2.5 py-1 bg-white text-red-600 text-xs rounded-full border border-red-200 font-medium">
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
