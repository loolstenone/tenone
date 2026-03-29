'use client';

import { useState } from 'react';
import { GitBranch, ArrowRight, BarChart3, Percent } from 'lucide-react';
import { useWIO } from '../../layout';

type Model = 'last' | 'first' | 'linear' | 'time_decay';

const MODELS: { key: Model; label: string; desc: string }[] = [
  { key: 'last', label: 'Last Click', desc: '마지막 터치포인트에 100% 기여' },
  { key: 'first', label: 'First Click', desc: '첫 터치포인트에 100% 기여' },
  { key: 'linear', label: 'Linear', desc: '모든 터치포인트에 균등 배분' },
  { key: 'time_decay', label: 'Time Decay', desc: '전환에 가까울수록 높은 가중치' },
];

const MOCK_CHANNELS = ['네이버 검색', '구글 디스플레이', '메타 광고', '블로그', '이메일', '직접방문'];

const MOCK_DATA: Record<Model, { channel: string; contribution: number; conversions: number; revenue: number }[]> = {
  last: [
    { channel: '네이버 검색', contribution: 35, conversions: 420, revenue: 8400 },
    { channel: '직접방문', contribution: 25, conversions: 300, revenue: 6000 },
    { channel: '메타 광고', contribution: 18, conversions: 216, revenue: 4320 },
    { channel: '이메일', contribution: 12, conversions: 144, revenue: 2880 },
    { channel: '구글 디스플레이', contribution: 7, conversions: 84, revenue: 1680 },
    { channel: '블로그', contribution: 3, conversions: 36, revenue: 720 },
  ],
  first: [
    { channel: '구글 디스플레이', contribution: 30, conversions: 360, revenue: 7200 },
    { channel: '네이버 검색', contribution: 28, conversions: 336, revenue: 6720 },
    { channel: '메타 광고', contribution: 22, conversions: 264, revenue: 5280 },
    { channel: '블로그', contribution: 12, conversions: 144, revenue: 2880 },
    { channel: '이메일', contribution: 5, conversions: 60, revenue: 1200 },
    { channel: '직접방문', contribution: 3, conversions: 36, revenue: 720 },
  ],
  linear: [
    { channel: '네이버 검색', contribution: 24, conversions: 288, revenue: 5760 },
    { channel: '메타 광고', contribution: 22, conversions: 264, revenue: 5280 },
    { channel: '구글 디스플레이', contribution: 20, conversions: 240, revenue: 4800 },
    { channel: '이메일', contribution: 14, conversions: 168, revenue: 3360 },
    { channel: '블로그', contribution: 12, conversions: 144, revenue: 2880 },
    { channel: '직접방문', contribution: 8, conversions: 96, revenue: 1920 },
  ],
  time_decay: [
    { channel: '네이버 검색', contribution: 30, conversions: 360, revenue: 7200 },
    { channel: '직접방문', contribution: 20, conversions: 240, revenue: 4800 },
    { channel: '메타 광고', contribution: 20, conversions: 240, revenue: 4800 },
    { channel: '이메일', contribution: 15, conversions: 180, revenue: 3600 },
    { channel: '구글 디스플레이', contribution: 10, conversions: 120, revenue: 2400 },
    { channel: '블로그', contribution: 5, conversions: 60, revenue: 1200 },
  ],
};

const MOCK_PATHS = [
  { path: ['구글 디스플레이', '블로그', '네이버 검색', '직접방문'], conversions: 124, pct: 10.3 },
  { path: ['메타 광고', '네이버 검색', '직접방문'], conversions: 98, pct: 8.2 },
  { path: ['네이버 검색', '직접방문'], conversions: 210, pct: 17.5 },
  { path: ['이메일', '직접방문'], conversions: 86, pct: 7.2 },
  { path: ['구글 디스플레이', '메타 광고', '이메일', '직접방문'], conversions: 72, pct: 6.0 },
];

const BAR_COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500', 'bg-slate-500'];

export default function AttributionPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [model, setModel] = useState<Model>('last');

  const data = isDemo ? MOCK_DATA[model] : MOCK_DATA[model];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">어트리뷰션</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-ATR &middot; 전환 경로 분석 및 채널별 기여도</p>
        </div>
      </div>

      {/* 모델 선택 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {MODELS.map(m => (
          <button key={m.key} onClick={() => setModel(m.key)}
            className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${model === m.key ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="text-xs text-slate-500 mb-4">{MODELS.find(m => m.key === model)?.desc}</div>

      {/* 채널별 기여도 바 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><BarChart3 size={14} /> 채널별 기여도</h2>
        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={d.channel}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{d.channel}</span>
                <span className="text-slate-400">{d.contribution}% &middot; {d.conversions}건 &middot; {d.revenue.toLocaleString()}만</span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <div className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]} transition-all duration-500`} style={{ width: `${d.contribution}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 전환 경로 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2"><GitBranch size={14} /> 주요 전환 경로</h2>
        <div className="space-y-3">
          {MOCK_PATHS.map((p, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.01] p-3">
              <div className="flex items-center gap-1 flex-1 overflow-x-auto">
                {p.path.map((step, j) => (
                  <div key={j} className="flex items-center gap-1">
                    <span className="text-xs whitespace-nowrap px-2 py-0.5 rounded-full bg-white/5">{step}</span>
                    {j < p.path.length - 1 && <ArrowRight size={10} className="text-slate-600 shrink-0" />}
                  </div>
                ))}
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold">{p.conversions}건</div>
                <div className="text-[10px] text-slate-500">{p.pct}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
