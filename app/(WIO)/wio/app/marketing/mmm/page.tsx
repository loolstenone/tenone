'use client';

import { useState } from 'react';
import { BarChart3, Sliders, TrendingUp, DollarSign, Lightbulb } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_CHANNELS = [
  { id: 1, name: '네이버 검색광고', currentBudget: 1200, contribution: 28, optimizedBudget: 1500, deltaROI: '+12%' },
  { id: 2, name: '구글 Ads', currentBudget: 800, contribution: 22, optimizedBudget: 900, deltaROI: '+8%' },
  { id: 3, name: '메타 광고', currentBudget: 600, contribution: 20, optimizedBudget: 700, deltaROI: '+15%' },
  { id: 4, name: '카카오모먼트', currentBudget: 400, contribution: 10, optimizedBudget: 300, deltaROI: '-5%' },
  { id: 5, name: '콘텐츠 마케팅', currentBudget: 500, contribution: 12, optimizedBudget: 450, deltaROI: '+3%' },
  { id: 6, name: '인플루언서', currentBudget: 300, contribution: 8, optimizedBudget: 350, deltaROI: '+18%' },
];

const BAR_COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500'];

export default function MMMPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [budgetMultiplier, setBudgetMultiplier] = useState(100);

  const channels = isDemo ? MOCK_CHANNELS : MOCK_CHANNELS;
  const totalCurrent = channels.reduce((s, c) => s + c.currentBudget, 0);
  const totalOptimized = channels.reduce((s, c) => s + c.optimizedBudget, 0);
  const adjustedBudget = Math.round(totalCurrent * budgetMultiplier / 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">미디어 믹스 모델</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-MMM &middot; 채널별 기여도 분석 및 예산 최적화 시뮬레이션</p>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">현재 월 예산</div>
          <div className="text-lg font-bold">{totalCurrent.toLocaleString()}만</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">최적화 예산</div>
          <div className="text-lg font-bold text-emerald-400">{totalOptimized.toLocaleString()}만</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-[11px] text-slate-500 mb-1">예상 ROI 변화</div>
          <div className="text-lg font-bold text-indigo-400">+9.2%</div>
        </div>
      </div>

      {/* 채널별 기여도 바 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 size={14} /> 채널별 기여도</h2>
        <div className="flex rounded-full h-6 overflow-hidden mb-3">
          {channels.map((c, i) => (
            <div key={c.id} className={`${BAR_COLORS[i]} h-full flex items-center justify-center text-[9px] font-bold text-white`} style={{ width: `${c.contribution}%` }}>
              {c.contribution >= 10 ? `${c.contribution}%` : ''}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {channels.map((c, i) => (
            <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className={`w-2.5 h-2.5 rounded-full ${BAR_COLORS[i]}`} />
              {c.name} {c.contribution}%
            </div>
          ))}
        </div>
      </div>

      {/* 예산 시뮬레이션 슬라이더 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><Sliders size={14} /> 예산 시뮬레이션</h2>
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-slate-500">총 예산 조정</span>
            <span className="font-bold">{budgetMultiplier}% ({adjustedBudget.toLocaleString()}만)</span>
          </div>
          <input type="range" min={50} max={200} value={budgetMultiplier} onChange={e => setBudgetMultiplier(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-indigo-500" />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            <span>50%</span><span>100%</span><span>200%</span>
          </div>
        </div>

        {/* 채널별 배분 */}
        <div className="space-y-3">
          {channels.map((c, i) => {
            const adjusted = Math.round(c.optimizedBudget * budgetMultiplier / 100);
            const diff = adjusted - c.currentBudget;
            return (
              <div key={c.id} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${BAR_COLORS[i]} shrink-0`} />
                <div className="flex-1 min-w-0 text-xs font-medium">{c.name}</div>
                <div className="text-xs text-slate-500 w-16 text-right">{c.currentBudget}만</div>
                <div className="text-xs w-4 text-center text-slate-600">&rarr;</div>
                <div className="text-xs font-bold w-16 text-right">{adjusted}만</div>
                <div className={`text-[10px] font-semibold w-14 text-right ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {diff >= 0 ? '+' : ''}{diff}만
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI 인사이트 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Lightbulb size={14} className="text-amber-400" /> AI 인사이트</h2>
        <div className="space-y-2 text-xs text-slate-400">
          <p>&bull; 네이버 검색광고의 한계수익률이 가장 높아 예산 증액 시 최대 효과 예상</p>
          <p>&bull; 카카오모먼트는 기여도 대비 비용이 높아 예산 축소 후 타 채널로 재배분 권장</p>
          <p>&bull; 인플루언서 마케팅의 ROI 개선 폭이 가장 크므로 시범 확대 고려</p>
        </div>
      </div>
    </div>
  );
}
