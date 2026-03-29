'use client';

import { useState } from 'react';
import { Zap, TrendingUp, TrendingDown, DollarSign, MousePointerClick, Eye, ShoppingCart, Lightbulb } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_CHANNELS = [
  { id: 1, name: '네이버 검색광고', icon: '🟢', budget: 1200, spent: 980, impressions: 520000, clicks: 16640, conversions: 832, cpc: 589, ctr: 3.2, cvr: 5.0, roas: 420 },
  { id: 2, name: '구글 Ads', icon: '🔵', budget: 800, spent: 620, impressions: 1400000, clicks: 11200, conversions: 448, cpc: 554, ctr: 0.8, cvr: 4.0, roas: 380 },
  { id: 3, name: '메타 (Facebook/Instagram)', icon: '🟣', budget: 600, spent: 540, impressions: 380000, clicks: 7220, conversions: 361, cpc: 748, ctr: 1.9, cvr: 5.0, roas: 350 },
  { id: 4, name: '카카오모먼트', icon: '🟡', budget: 400, spent: 280, impressions: 210000, clicks: 4410, conversions: 176, cpc: 635, ctr: 2.1, cvr: 4.0, roas: 310 },
];

const SUGGESTIONS = [
  { channel: '네이버', text: 'CPC 대비 전환율 높음 - 예산 15% 증액 추천', type: 'increase' },
  { channel: '구글', text: '디스플레이 캠페인 CTR 낮음 - 소재 교체 필요', type: 'optimize' },
  { channel: '카카오', text: 'ROAS 310% - 목표(350%) 미달, 타겟 재설정 권장', type: 'warning' },
];

export default function PerformancePage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('month');

  const channels = isDemo ? MOCK_CHANNELS : MOCK_CHANNELS;
  const totalBudget = channels.reduce((s, c) => s + c.budget, 0);
  const totalSpent = channels.reduce((s, c) => s + c.spent, 0);
  const totalConversions = channels.reduce((s, c) => s + c.conversions, 0);
  const avgROAS = Math.round(channels.reduce((s, c) => s + c.roas, 0) / channels.length);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">퍼포먼스 마케팅</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-PFM &middot; 채널별 실시간 성과 대시보드</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-white/5 p-0.5">
          {[{ key: 'today' as const, label: '오늘' }, { key: 'week' as const, label: '이번주' }, { key: 'month' as const, label: '이번달' }].map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1 text-xs rounded-md ${period === p.key ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 핵심 KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: DollarSign, label: '총 집행', value: `${totalSpent.toLocaleString()}만`, sub: `예산 ${totalBudget.toLocaleString()}만 (${Math.round((totalSpent / totalBudget) * 100)}%)`, color: 'text-emerald-400' },
          { icon: MousePointerClick, label: '평균 CPC', value: `${Math.round(channels.reduce((s, c) => s + c.cpc, 0) / channels.length)}원`, sub: '전주 대비 -3.2%', color: 'text-blue-400' },
          { icon: ShoppingCart, label: '총 전환', value: totalConversions.toLocaleString(), sub: 'CVR 평균 4.5%', color: 'text-violet-400' },
          { icon: TrendingUp, label: '평균 ROAS', value: `${avgROAS}%`, sub: '목표 350%', color: avgROAS >= 350 ? 'text-emerald-400' : 'text-amber-400' },
        ].map((c, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2">
              <c.icon size={14} className={c.color} />
              <span className="text-[11px] text-slate-500">{c.label}</span>
            </div>
            <div className="text-lg font-bold">{c.value}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* 채널별 성과 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">채널별 성과</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-500">
                <th className="text-left py-2 pr-3">채널</th>
                <th className="text-right py-2 px-2">예산</th>
                <th className="text-right py-2 px-2">집행</th>
                <th className="text-right py-2 px-2">노출</th>
                <th className="text-right py-2 px-2">클릭</th>
                <th className="text-right py-2 px-2">CPC</th>
                <th className="text-right py-2 px-2">CTR</th>
                <th className="text-right py-2 px-2">전환</th>
                <th className="text-right py-2 px-2">CVR</th>
                <th className="text-right py-2 pl-2">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {channels.map(c => (
                <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2.5 pr-3 font-medium"><span className="mr-1.5">{c.icon}</span>{c.name}</td>
                  <td className="py-2.5 px-2 text-right">{c.budget.toLocaleString()}만</td>
                  <td className="py-2.5 px-2 text-right">{c.spent.toLocaleString()}만</td>
                  <td className="py-2.5 px-2 text-right">{(c.impressions / 10000).toFixed(1)}만</td>
                  <td className="py-2.5 px-2 text-right">{c.clicks.toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-right">{c.cpc}원</td>
                  <td className="py-2.5 px-2 text-right">{c.ctr}%</td>
                  <td className="py-2.5 px-2 text-right font-bold">{c.conversions.toLocaleString()}</td>
                  <td className="py-2.5 px-2 text-right">{c.cvr}%</td>
                  <td className={`py-2.5 pl-2 text-right font-bold ${c.roas >= 350 ? 'text-emerald-400' : 'text-amber-400'}`}>{c.roas}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 예산 소진율 바 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">예산 소진율</h2>
        <div className="space-y-3">
          {channels.map(c => (
            <div key={c.id}>
              <div className="flex justify-between text-xs mb-1">
                <span>{c.icon} {c.name}</span>
                <span className="text-slate-400">{c.spent.toLocaleString()} / {c.budget.toLocaleString()}만 ({Math.round((c.spent / c.budget) * 100)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.round((c.spent / c.budget) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI 최적화 제안 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Lightbulb size={14} className="text-amber-400" /> 최적화 제안</h2>
        <div className="space-y-2">
          {SUGGESTIONS.map((s, i) => (
            <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 ${s.type === 'increase' ? 'border-emerald-500/20 bg-emerald-500/5' : s.type === 'warning' ? 'border-amber-500/20 bg-amber-500/5' : 'border-blue-500/20 bg-blue-500/5'}`}>
              {s.type === 'increase' ? <TrendingUp size={14} className="text-emerald-400 mt-0.5" /> : s.type === 'warning' ? <TrendingDown size={14} className="text-amber-400 mt-0.5" /> : <Zap size={14} className="text-blue-400 mt-0.5" />}
              <div>
                <div className="text-xs font-medium">{s.channel}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
