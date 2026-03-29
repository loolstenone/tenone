'use client';

import { useState } from 'react';
import {
  LayoutDashboard, TrendingUp, TrendingDown, Users, DollarSign,
  AlertTriangle, ArrowUpRight, ArrowDownRight, Building2, Briefcase,
  BarChart3, Activity, Shield, RefreshCw, ChevronDown,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Mock: BU 데이터 ── */
interface BUData {
  id: string;
  name: string;
  color: string;
  revenue: number[];       // 6개월 (억원)
  cost: number[];          // 6개월
  customers: number;
  employees: number;
  projects: number;
  growthYoY: number;       // %
  margin: number;          // %
}

const MOCK_BUS: BUData[] = [
  { id: 'bu-a', name: 'SmarComm', color: 'text-indigo-400', revenue: [4.2, 4.5, 4.8, 5.1, 5.4, 5.8], cost: [3.1, 3.2, 3.3, 3.5, 3.6, 3.8], customers: 124, employees: 18, projects: 12, growthYoY: 32, margin: 34.5 },
  { id: 'bu-b', name: 'MADLeague', color: 'text-emerald-400', revenue: [1.8, 2.0, 2.2, 2.1, 2.5, 2.8], cost: [1.5, 1.6, 1.7, 1.7, 1.9, 2.0], customers: 340, employees: 8, projects: 24, growthYoY: 55, margin: 28.6 },
  { id: 'bu-c', name: 'HeRo', color: 'text-violet-400', revenue: [3.0, 3.2, 3.1, 3.5, 3.8, 4.0], cost: [2.4, 2.5, 2.5, 2.7, 2.9, 3.0], customers: 89, employees: 14, projects: 8, growthYoY: 25, margin: 25.0 },
  { id: 'bu-d', name: 'Mindle', color: 'text-amber-400', revenue: [0.8, 1.0, 1.2, 1.5, 1.8, 2.2], cost: [0.9, 1.0, 1.1, 1.2, 1.3, 1.4], customers: 210, employees: 6, projects: 5, growthYoY: 175, margin: 36.4 },
  { id: 'bu-e', name: 'YouInOne', color: 'text-cyan-400', revenue: [2.0, 2.1, 2.3, 2.2, 2.4, 2.6], cost: [1.8, 1.8, 1.9, 1.9, 2.0, 2.1], customers: 67, employees: 10, projects: 6, growthYoY: 18, margin: 19.2 },
];

const MONTHS = ['10월', '11월', '12월', '1월', '2월', '3월'];

/* ── Mock: Alerts ── */
const MOCK_ALERTS = [
  { id: 'a1', type: 'warning' as const, title: 'YouInOne 마진 하락', desc: '3개월 연속 영업이익률 하락 (21% → 19.2%)', bu: 'YouInOne' },
  { id: 'a2', type: 'danger' as const, title: 'HeRo 고객 이탈 증가', desc: '이번 달 이탈률 8.2% (전월 5.1%)', bu: 'HeRo' },
  { id: 'a3', type: 'info' as const, title: 'Mindle 예산 초과 임박', desc: '분기 예산 대비 92% 소진, 잔여 1개월', bu: 'Mindle' },
];

const ALERT_STYLE = {
  danger: { bg: 'bg-red-500/10 border-red-500/20', icon: 'text-red-400' },
  warning: { bg: 'bg-amber-500/10 border-amber-500/20', icon: 'text-amber-400' },
  info: { bg: 'bg-blue-500/10 border-blue-500/20', icon: 'text-blue-400' },
};

/* ── Mock: 크로스 BU 시너지 ── */
const SYNERGY = {
  customerMigration: 12.4,  // 고객 이동률 %
  crossSellConversion: 8.7,  // 크로스셀링 전환율 %
  integratedCampaignROI: 340, // 통합 캠페인 ROI %
};

export default function HoldingDashboardPage() {
  const { isMaster, isDemo } = useWIO();

  if (!isMaster && !isDemo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Shield size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">지주사 전용 페이지입니다</h2>
        <p className="text-sm text-slate-500">Holding Company 권한이 필요합니다.</p>
      </div>
    );
  }

  const totalRevenue = MOCK_BUS.reduce((s, bu) => s + bu.revenue[5], 0);
  const totalCustomers = MOCK_BUS.reduce((s, bu) => s + bu.customers, 0);
  const totalEmployees = MOCK_BUS.reduce((s, bu) => s + bu.employees, 0);
  const totalProjects = MOCK_BUS.reduce((s, bu) => s + bu.projects, 0);

  // 6개월 전사 합산
  const totalRevenueByMonth = MONTHS.map((_, i) => MOCK_BUS.reduce((s, bu) => s + bu.revenue[i], 0));
  const totalCostByMonth = MONTHS.map((_, i) => MOCK_BUS.reduce((s, bu) => s + bu.cost[i], 0));
  const maxBar = Math.max(...totalRevenueByMonth, ...totalCostByMonth);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={20} className="text-indigo-400" />
            <h1 className="text-xl font-bold">그룹 경영 대시보드</h1>
            <span className="text-[10px] font-mono text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">HLD-MDB</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">멀티 브랜드 총괄 경영 현황</p>
        </div>
      </div>

      {/* 핵심 지표 */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { icon: DollarSign, label: '전사 월 매출', value: `${totalRevenue.toFixed(1)}억`, sub: '이번 달', color: 'text-emerald-400', trend: '+14.2%', up: true },
          { icon: Users, label: '전체 고객', value: totalCustomers.toLocaleString(), sub: '활성 고객', color: 'text-indigo-400', trend: '+8.3%', up: true },
          { icon: Building2, label: '전체 직원', value: totalEmployees, sub: `${MOCK_BUS.length}개 BU`, color: 'text-violet-400', trend: '+12명', up: true },
          { icon: Briefcase, label: '진행 프로젝트', value: totalProjects, sub: '이번 분기', color: 'text-amber-400', trend: '-2건', up: false },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 mb-2"><s.icon size={16} className={s.color} /><span className="text-xs text-slate-500">{s.label}</span></div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="flex items-center gap-1 mt-0.5">
              {s.up ? <ArrowUpRight size={11} className="text-emerald-400" /> : <ArrowDownRight size={11} className="text-red-400" />}
              <span className={`text-[10px] ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>{s.trend}</span>
              <span className="text-[10px] text-slate-600 ml-1">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 좌: BU별 카드 + 테이블 */}
        <div className="lg:col-span-2 space-y-4">
          {/* BU 카드 그리드 */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_BUS.map(bu => {
              const latestRev = bu.revenue[5];
              const prevRev = bu.revenue[4];
              const mom = ((latestRev - prevRev) / prevRev * 100).toFixed(1);
              const momUp = latestRev >= prevRev;
              // sparkline (simple CSS bars)
              const sparkMax = Math.max(...bu.revenue);
              return (
                <div key={bu.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-semibold ${bu.color}`}>{bu.name}</span>
                    <div className="flex items-center gap-0.5">
                      {momUp ? <ArrowUpRight size={12} className="text-emerald-400" /> : <ArrowDownRight size={12} className="text-red-400" />}
                      <span className={`text-[10px] font-bold ${momUp ? 'text-emerald-400' : 'text-red-400'}`}>{mom}%</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold mb-1">{latestRev.toFixed(1)}억</div>
                  <div className="text-[10px] text-slate-500 mb-3">영업이익률 {bu.margin}% | 고객 {bu.customers}</div>
                  {/* Sparkline */}
                  <div className="flex items-end gap-0.5 h-6">
                    {bu.revenue.map((v, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-sm ${i === 5 ? 'bg-white/30' : 'bg-white/10'}`}
                        style={{ height: `${(v / sparkMax) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* BU 비교 테이블 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 size={15} className="text-indigo-400" /> BU 비교 분석
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-white/5">
                    <th className="text-left px-5 py-2.5 font-medium">BU</th>
                    <th className="text-right px-3 py-2.5 font-medium">매출(억)</th>
                    <th className="text-right px-3 py-2.5 font-medium">이익(억)</th>
                    <th className="text-right px-3 py-2.5 font-medium">마진</th>
                    <th className="text-right px-3 py-2.5 font-medium">YoY</th>
                    <th className="text-right px-3 py-2.5 font-medium">인원</th>
                    <th className="text-right px-3 py-2.5 font-medium">프로젝트</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MOCK_BUS.map(bu => {
                    const profit = bu.revenue[5] - bu.cost[5];
                    return (
                      <tr key={bu.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className={`px-5 py-3 font-medium ${bu.color}`}>{bu.name}</td>
                        <td className="text-right px-3 py-3">{bu.revenue[5].toFixed(1)}</td>
                        <td className="text-right px-3 py-3">{profit.toFixed(1)}</td>
                        <td className="text-right px-3 py-3">{bu.margin}%</td>
                        <td className="text-right px-3 py-3">
                          <span className={bu.growthYoY >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {bu.growthYoY >= 0 ? '+' : ''}{bu.growthYoY}%
                          </span>
                        </td>
                        <td className="text-right px-3 py-3 text-slate-400">{bu.employees}</td>
                        <td className="text-right px-3 py-3 text-slate-400">{bu.projects}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 월간 매출 vs 비용 바 차트 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Activity size={15} className="text-emerald-400" /> 전사 매출 vs 비용 (6개월)
              </span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-3 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" /> 매출</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block" /> 비용</span>
              </div>
              <div className="space-y-2">
                {MONTHS.map((month, i) => (
                  <div key={month} className="flex items-center gap-3">
                    <span className="w-8 text-[11px] text-slate-500 text-right">{month}</span>
                    <div className="flex-1 flex items-center gap-1 h-5">
                      <div
                        className="h-full bg-indigo-500/60 rounded-sm"
                        style={{ width: `${(totalRevenueByMonth[i] / maxBar) * 100}%` }}
                      />
                      <span className="text-[10px] text-indigo-300">{totalRevenueByMonth[i].toFixed(1)}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-1 h-5">
                      <div
                        className="h-full bg-slate-600/60 rounded-sm"
                        style={{ width: `${(totalCostByMonth[i] / maxBar) * 100}%` }}
                      />
                      <span className="text-[10px] text-slate-400">{totalCostByMonth[i].toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 우측 */}
        <div className="space-y-4">
          {/* 크로스 BU 시너지 */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp size={15} className="text-cyan-400" /> 크로스 BU 시너지
              </span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">고객 이동률</span>
                  <span className="font-bold text-white">{SYNERGY.customerMigration}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${SYNERGY.customerMigration * 3}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">크로스셀링 전환율</span>
                  <span className="font-bold text-white">{SYNERGY.crossSellConversion}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${SYNERGY.crossSellConversion * 4}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">통합 캠페인 ROI</span>
                  <span className="font-bold text-emerald-400">{SYNERGY.integratedCampaignROI}%</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(SYNERGY.integratedCampaignROI / 5, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="px-5 py-3 border-b border-white/5">
              <span className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-400" /> 주요 이슈 알림
              </span>
            </div>
            <div className="p-3 space-y-2">
              {MOCK_ALERTS.map(alert => {
                const style = ALERT_STYLE[alert.type];
                return (
                  <div key={alert.id} className={`rounded-lg border p-3 ${style.bg}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={13} className={style.icon} />
                      <span className="text-sm font-semibold">{alert.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{alert.desc}</p>
                    <span className="text-[9px] text-slate-500 mt-1 inline-block">{alert.bu}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
