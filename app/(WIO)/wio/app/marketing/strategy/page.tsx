'use client';

import { useState } from 'react';
import { Target, TrendingUp, DollarSign, Users, BarChart3, ChevronRight } from 'lucide-react';
import { useWIO } from '../../layout';

const MOCK_STRATEGIES = [
  { id: 1, quarter: 'Q1 2026', theme: '브랜드 인지도 확대', budget: 12000, spent: 8400, kpiTarget: 'MAU 50,000', kpiActual: 'MAU 42,300', status: 'active' },
  { id: 2, quarter: 'Q2 2026', theme: '리드 확보 집중', budget: 15000, spent: 0, kpiTarget: 'MQL 2,000', kpiActual: '-', status: 'planned' },
  { id: 3, quarter: 'Q3 2026', theme: '전환율 최적화', budget: 10000, spent: 0, kpiTarget: 'CVR 3.5%', kpiActual: '-', status: 'planned' },
  { id: 4, quarter: 'Q4 2026', theme: '리텐션 강화', budget: 8000, spent: 0, kpiTarget: 'Churn < 5%', kpiActual: '-', status: 'planned' },
];

const BUDGET_SPLIT = [
  { channel: '퍼포먼스 광고', pct: 35, color: 'bg-indigo-500' },
  { channel: '콘텐츠 마케팅', pct: 25, color: 'bg-violet-500' },
  { channel: '인플루언서', pct: 15, color: 'bg-pink-500' },
  { channel: '이벤트/PR', pct: 15, color: 'bg-amber-500' },
  { channel: '기타', pct: 10, color: 'bg-slate-500' },
];

const AUDIENCES = [
  { segment: 'SMB 의사결정자', size: '12,400', growth: '+18%' },
  { segment: '스타트업 마케터', size: '8,200', growth: '+32%' },
  { segment: '에이전시 담당자', size: '3,600', growth: '+9%' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '진행중', color: 'text-emerald-400 bg-emerald-500/10' },
  planned: { label: '예정', color: 'text-blue-400 bg-blue-500/10' },
  completed: { label: '완료', color: 'text-slate-400 bg-slate-500/10' },
};

export default function StrategyPage() {
  const { tenant } = useWIO();
  const isDemo = tenant?.id === 'demo';
  const [selectedQ, setSelectedQ] = useState<number | null>(null);

  const strategies = isDemo ? MOCK_STRATEGIES : MOCK_STRATEGIES;

  const totalBudget = strategies.reduce((s, v) => s + v.budget, 0);
  const totalSpent = strategies.reduce((s, v) => s + v.spent, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">마케팅 전략</h1>
          <p className="text-xs text-slate-500 mt-0.5">MKT-STR &middot; 연간/분기 전략 및 KPI 관리</p>
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: DollarSign, label: '연간 예산', value: `${(totalBudget / 10000).toFixed(1)}억`, sub: '2026년', color: 'text-emerald-400' },
          { icon: TrendingUp, label: '집행률', value: `${totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0}%`, sub: `${(totalSpent / 10000).toFixed(1)}억 집행`, color: 'text-indigo-400' },
          { icon: Users, label: '타겟 오디언스', value: '24.2K', sub: '3 세그먼트', color: 'text-violet-400' },
          { icon: Target, label: 'KPI 달성률', value: '84%', sub: 'Q1 기준', color: 'text-amber-400' },
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

      {/* 예산 배분 바 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">예산 배분</h2>
        <div className="flex rounded-full h-4 overflow-hidden mb-3">
          {BUDGET_SPLIT.map((b, i) => (
            <div key={i} className={`${b.color} h-full`} style={{ width: `${b.pct}%` }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {BUDGET_SPLIT.map((b, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className={`w-2.5 h-2.5 rounded-full ${b.color}`} />
              {b.channel} {b.pct}%
            </div>
          ))}
        </div>
      </div>

      {/* 분기별 전략 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">분기별 전략</h2>
        <div className="space-y-2">
          {strategies.map(s => {
            const st = STATUS_MAP[s.status] || STATUS_MAP.planned;
            return (
              <div key={s.id} onClick={() => setSelectedQ(selectedQ === s.id ? null : s.id)}
                className="flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.01] p-3 cursor-pointer hover:bg-white/[0.04] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{s.quarter}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.theme}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{(s.budget / 10000).toFixed(1)}억</div>
                  <div className="text-[11px] text-slate-500">KPI: {s.kpiTarget}</div>
                </div>
                <ChevronRight size={14} className="text-slate-600" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 타겟 오디언스 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <h2 className="text-sm font-semibold mb-3">타겟 오디언스</h2>
        <div className="space-y-2">
          {AUDIENCES.map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] p-3">
              <div>
                <div className="text-sm font-medium">{a.segment}</div>
                <div className="text-xs text-slate-500">규모: {a.size}</div>
              </div>
              <span className="text-xs font-semibold text-emerald-400">{a.growth}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
