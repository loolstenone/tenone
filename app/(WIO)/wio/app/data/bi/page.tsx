'use client';

import { useState } from 'react';
import {
  BarChart3, DollarSign, Users, TrendingUp, TrendingDown, Target,
  Briefcase, ArrowUpRight, ArrowDownRight, Minus, CheckCircle2,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── 권한별 뷰 ── */
type RoleView = 'ceo' | 'head' | 'lead' | 'member';
const ROLE_TABS: { key: RoleView; label: string }[] = [
  { key: 'ceo', label: 'CEO' },
  { key: 'head', label: '본부장' },
  { key: 'lead', label: '팀장' },
  { key: 'member', label: '일반' },
];

/* ── Mock 핵심 지표 ── */
const KPI_DATA: Record<RoleView, {
  icon: any; label: string; value: string; prev: number; targetPct: number;
  spark: number[]; color: string;
}[]> = {
  ceo: [
    { icon: DollarSign, label: '월 매출', value: '12.4억', prev: 8.2, targetPct: 88, spark: [8.1, 9.2, 10.5, 11.0, 11.4, 12.4], color: 'text-emerald-400' },
    { icon: TrendingUp, label: '영업이익', value: '2.1억', prev: 5.3, targetPct: 72, spark: [1.5, 1.7, 1.8, 1.9, 2.0, 2.1], color: 'text-blue-400' },
    { icon: Users, label: '고객 수', value: '1,247', prev: 3.1, targetPct: 91, spark: [1100, 1120, 1150, 1190, 1210, 1247], color: 'text-violet-400' },
    { icon: Target, label: 'NPS', value: '72', prev: -2.0, targetPct: 80, spark: [68, 70, 74, 73, 74, 72], color: 'text-amber-400' },
    { icon: Users, label: '이직률', value: '4.2%', prev: -0.8, targetPct: 95, spark: [6.1, 5.5, 5.0, 4.8, 5.0, 4.2], color: 'text-cyan-400' },
    { icon: CheckCircle2, label: '프로젝트 완료율', value: '87%', prev: 4.5, targetPct: 87, spark: [78, 80, 82, 83, 85, 87], color: 'text-indigo-400' },
  ],
  head: [
    { icon: DollarSign, label: '본부 매출', value: '4.8억', prev: 6.7, targetPct: 85, spark: [3.8, 4.0, 4.2, 4.4, 4.5, 4.8], color: 'text-emerald-400' },
    { icon: TrendingUp, label: '본부 이익', value: '0.9억', prev: 3.2, targetPct: 70, spark: [0.6, 0.7, 0.7, 0.8, 0.85, 0.9], color: 'text-blue-400' },
    { icon: Briefcase, label: '진행 프로젝트', value: '14건', prev: 2.0, targetPct: 82, spark: [10, 11, 12, 12, 13, 14], color: 'text-violet-400' },
    { icon: Users, label: '팀원 수', value: '38명', prev: 0, targetPct: 100, spark: [35, 36, 36, 37, 38, 38], color: 'text-amber-400' },
  ],
  lead: [
    { icon: Briefcase, label: '팀 프로젝트', value: '5건', prev: 1.0, targetPct: 90, spark: [3, 4, 4, 4, 5, 5], color: 'text-emerald-400' },
    { icon: CheckCircle2, label: '완료율', value: '92%', prev: 5.0, targetPct: 92, spark: [80, 82, 85, 88, 90, 92], color: 'text-blue-400' },
    { icon: Users, label: '팀원', value: '8명', prev: 0, targetPct: 100, spark: [7, 7, 8, 8, 8, 8], color: 'text-violet-400' },
  ],
  member: [
    { icon: Briefcase, label: '내 프로젝트', value: '3건', prev: 0, targetPct: 100, spark: [2, 2, 3, 3, 3, 3], color: 'text-emerald-400' },
    { icon: CheckCircle2, label: '완료 태스크', value: '24건', prev: 12.0, targetPct: 80, spark: [15, 17, 19, 20, 22, 24], color: 'text-blue-400' },
  ],
};

/* ── 매출 추이 (6개월) ── */
const REVENUE_MONTHS = ['10월', '11월', '12월', '1월', '2월', '3월'];
const REVENUE_DATA = [
  { revenue: 9.2, cost: 7.1 },
  { revenue: 10.1, cost: 7.8 },
  { revenue: 10.5, cost: 8.0 },
  { revenue: 11.0, cost: 8.2 },
  { revenue: 11.4, cost: 8.5 },
  { revenue: 12.4, cost: 9.3 },
];
const REVENUE_MAX = 14;

/* ── 부서별 예산 집행률 ── */
const DEPT_BUDGET = [
  { dept: '사업본부', pct: 78, color: 'bg-emerald-500' },
  { dept: '개발본부', pct: 65, color: 'bg-blue-500' },
  { dept: '마케팅팀', pct: 92, color: 'bg-amber-500' },
  { dept: '디자인팀', pct: 54, color: 'bg-violet-500' },
  { dept: '경영지원', pct: 41, color: 'bg-cyan-500' },
];

/* ── Top 5 프로젝트 ── */
const TOP_PROJECTS = [
  { name: 'SmarComm 플랫폼 구축', revenue: '3.2억', pct: 25.8 },
  { name: 'MADLeague 시즌4 운영', revenue: '2.1억', pct: 16.9 },
  { name: 'HeRo AI 매칭 시스템', revenue: '1.8억', pct: 14.5 },
  { name: 'Badak 네트워킹 앱', revenue: '1.5억', pct: 12.1 },
  { name: 'Evolution School 플랫폼', revenue: '1.2억', pct: 9.7 },
];

/* ── 스파크라인 SVG ── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80, h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const strokeColor = color.includes('emerald') ? '#34d399' : color.includes('blue') ? '#60a5fa' : color.includes('violet') ? '#a78bfa' : color.includes('amber') ? '#fbbf24' : color.includes('cyan') ? '#22d3ee' : color.includes('indigo') ? '#818cf8' : '#94a3b8';
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BIPage() {
  const { tenant, isDemo } = useWIO();
  const [roleView, setRoleView] = useState<RoleView>('ceo');
  const kpis = KPI_DATA[roleView];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">BI 대시보드</h1>
          <p className="text-sm text-slate-500 mt-0.5">{tenant?.name ?? 'Orbi'} 경영 현황</p>
        </div>
        {isDemo && <span className="text-xs text-amber-400/60 bg-amber-500/10 px-2.5 py-1 rounded-full">데모 데이터</span>}
      </div>

      {/* 권한별 뷰 탭 */}
      <div className="flex gap-2 mb-5">
        {ROLE_TABS.map(t => (
          <button key={t.key} onClick={() => setRoleView(t.key)}
            className={`rounded-lg px-4 py-2 text-sm transition-all ${roleView === t.key ? 'bg-indigo-600/10 text-indigo-400 font-semibold' : 'text-slate-400 hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <kpi.icon size={15} className={kpi.color} />
                <span className="text-xs text-slate-500">{kpi.label}</span>
              </div>
              <Sparkline data={kpi.spark} color={kpi.color} />
            </div>
            <div className="text-2xl font-bold mb-2">{kpi.value}</div>
            <div className="flex items-center justify-between">
              {/* 전월비 */}
              <div className="flex items-center gap-1 text-xs">
                {kpi.prev > 0 ? <ArrowUpRight size={12} className="text-emerald-400" /> : kpi.prev < 0 ? <ArrowDownRight size={12} className="text-red-400" /> : <Minus size={12} className="text-slate-500" />}
                <span className={kpi.prev > 0 ? 'text-emerald-400' : kpi.prev < 0 ? 'text-red-400' : 'text-slate-500'}>
                  {kpi.prev > 0 ? '+' : ''}{kpi.prev}% 전월비
                </span>
              </div>
              {/* 목표 달성률 바 */}
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.min(kpi.targetPct, 100)}%` }} />
                </div>
                <span className="text-xs text-slate-500">{kpi.targetPct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 매출 추이 (6개월) */}
      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-semibold mb-4">매출 추이 (최근 6개월)</h2>
        <div className="flex items-end gap-3 h-40">
          {REVENUE_DATA.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: '120px' }}>
                <div className="flex-1 bg-emerald-500/80 rounded-t transition-all" style={{ height: `${(d.revenue / REVENUE_MAX) * 100}%` }} title={`매출 ${d.revenue}억`} />
                <div className="flex-1 bg-red-400/40 rounded-t transition-all" style={{ height: `${(d.cost / REVENUE_MAX) * 100}%` }} title={`비용 ${d.cost}억`} />
              </div>
              <span className="text-[10px] text-slate-500">{REVENUE_MONTHS[i]}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-3">
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" /><span className="text-xs text-slate-400">매출</span></div>
          <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-400/40" /><span className="text-xs text-slate-400">비용</span></div>
        </div>
      </div>

      {/* 부서별 예산 집행률 */}
      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-semibold mb-4">부서별 예산 집행률</h2>
        <div className="space-y-3">
          {DEPT_BUDGET.map((d, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">{d.dept}</span>
                <span className="font-semibold">{d.pct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className={`h-full rounded-full ${d.color} transition-all`} style={{ width: `${d.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 프로젝트 */}
      <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-semibold mb-4">Top 5 프로젝트 (매출 기여)</h2>
        <div className="space-y-2">
          {TOP_PROJECTS.map((p, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5 border border-white/5">
              <span className="text-xs font-bold text-indigo-400 w-5">{i + 1}</span>
              <span className="text-sm flex-1 truncate">{p.name}</span>
              <span className="text-sm font-semibold text-emerald-400">{p.revenue}</span>
              <span className="text-xs text-slate-500 w-12 text-right">{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
