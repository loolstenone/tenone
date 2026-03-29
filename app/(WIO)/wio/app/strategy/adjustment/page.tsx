'use client';

import { useState } from 'react';
import {
  SlidersHorizontal, TrendingUp, TrendingDown, Users, DollarSign, BarChart3,
  ArrowUpDown, Clock, ChevronRight,
} from 'lucide-react';
import { useWIO } from '../../layout';

/* ── Types ── */
type BU = {
  id: string;
  name: string;
  revenue: number;
  profit: number;
  growthRate: number;
  headcount: number;
  budget: number;
};

type AdjustmentLog = {
  id: string;
  date: string;
  action: string;
  fromBU: string;
  toBU: string;
  amount: number;
  reason: string;
};

type PriorityItem = {
  id: string;
  name: string;
  impact: number;   // 1-10
  effort: number;    // 1-10
  quadrant: 'do_first' | 'schedule' | 'delegate' | 'eliminate';
};

/* ── Mock BU data ── */
const MOCK_BUS: BU[] = [
  { id: 'bu1', name: 'WIO SaaS 사업부', revenue: 1200000000, profit: 280000000, growthRate: 45, headcount: 18, budget: 1500000000 },
  { id: 'bu2', name: 'MAD / 커뮤니티 사업부', revenue: 800000000, profit: 120000000, growthRate: 25, headcount: 12, budget: 900000000 },
  { id: 'bu3', name: 'SmarComm 마케팅 사업부', revenue: 350000000, profit: -50000000, growthRate: 60, headcount: 8, budget: 600000000 },
  { id: 'bu4', name: '프로젝트 수주 사업부', revenue: 850000000, profit: 200000000, growthRate: 10, headcount: 15, budget: 700000000 },
];

/* ── Mock adjustment logs ── */
const MOCK_LOGS: AdjustmentLog[] = [
  { id: 'a1', date: '2026-03-25', action: '예산 이전', fromBU: '프로젝트 수주 사업부', toBU: 'SmarComm 마케팅 사업부', amount: 100000000, reason: 'SmarComm 마케팅 캠페인 집중 투자' },
  { id: 'a2', date: '2026-03-15', action: '인원 재배치', fromBU: 'MAD / 커뮤니티 사업부', toBU: 'WIO SaaS 사업부', amount: 0, reason: '개발 인력 2명 WIO 전환' },
  { id: 'a3', date: '2026-02-28', action: '예산 증액', fromBU: '-', toBU: 'WIO SaaS 사업부', amount: 200000000, reason: 'AI 에이전트 개발 가속화' },
  { id: 'a4', date: '2026-02-10', action: '예산 감액', fromBU: '프로젝트 수주 사업부', toBU: '-', amount: 50000000, reason: '정부과제 지연에 따른 예산 조정' },
  { id: 'a5', date: '2026-01-20', action: '조직 개편', fromBU: '-', toBU: '-', amount: 0, reason: 'SmarComm 독립 사업부 승격' },
];

/* ── Priority matrix items ── */
const PRIORITIES: PriorityItem[] = [
  { id: 'p1', name: 'WIO Enterprise 영업', impact: 9, effort: 7, quadrant: 'do_first' },
  { id: 'p2', name: 'AI 에이전트 MVP', impact: 10, effort: 9, quadrant: 'do_first' },
  { id: 'p3', name: 'MAD 대학 확장', impact: 7, effort: 5, quadrant: 'schedule' },
  { id: 'p4', name: 'SmarComm 상용화', impact: 8, effort: 8, quadrant: 'do_first' },
  { id: 'p5', name: '콘텐츠 마케팅', impact: 5, effort: 3, quadrant: 'schedule' },
  { id: 'p6', name: '내부 시스템 고도화', impact: 4, effort: 6, quadrant: 'delegate' },
  { id: 'p7', name: '해외 진출 조사', impact: 6, effort: 4, quadrant: 'schedule' },
  { id: 'p8', name: '레거시 도구 정리', impact: 2, effort: 2, quadrant: 'eliminate' },
];

const fmtB = (n: number) => {
  if (Math.abs(n) >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  return `${(n / 10000000).toFixed(0)}천만`;
};

export default function AdjustmentPage() {
  const { isDemo } = useWIO();
  const [budgets, setBudgets] = useState<Record<string, number>>(
    Object.fromEntries(MOCK_BUS.map(b => [b.id, b.budget]))
  );
  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">사업 조정</h1>
        <p className="text-xs text-slate-500 mt-0.5">STR-ADJ · BU별 자원 배분 & 우선순위 관리</p>
      </div>

      {/* BU Comparison table */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><BarChart3 size={16} className="text-indigo-400" />BU별 비교</h2>
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.02] text-xs text-slate-500 uppercase tracking-wider">
                <th className="text-left px-4 py-3">사업부</th>
                <th className="text-right px-4 py-3">매출</th>
                <th className="text-right px-4 py-3">이익</th>
                <th className="text-center px-4 py-3">성장률</th>
                <th className="text-center px-4 py-3">인원</th>
                <th className="text-right px-4 py-3">예산</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BUS.map(bu => (
                <tr key={bu.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium">{bu.name}</td>
                  <td className="px-4 py-3 text-right text-indigo-300 font-bold">{fmtB(bu.revenue)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${bu.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtB(bu.profit)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1">
                      {bu.growthRate >= 0 ? <TrendingUp size={12} className="text-emerald-400" /> : <TrendingDown size={12} className="text-red-400" />}
                      <span className={bu.growthRate >= 0 ? 'text-emerald-400' : 'text-red-400'}>{bu.growthRate}%</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1"><Users size={12} className="text-slate-500" />{bu.headcount}명</span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">{fmtB(bu.budget)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Budget simulator */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><SlidersHorizontal size={16} className="text-violet-400" />자원 재배분 시뮬레이터</h2>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>총 예산</span>
            <span className="font-bold text-white">{fmtB(totalBudget)}</span>
          </div>
          {MOCK_BUS.map(bu => {
            const pct = Math.round((budgets[bu.id] / totalBudget) * 100);
            return (
              <div key={bu.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm">{bu.name}</span>
                  <span className="text-xs text-slate-400">{fmtB(budgets[bu.id])} ({pct}%)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3000000000}
                  step={50000000}
                  value={budgets[bu.id]}
                  onChange={e => setBudgets(prev => ({ ...prev, [bu.id]: Number(e.target.value) }))}
                  className="w-full h-1.5 rounded-full appearance-none bg-white/5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            );
          })}
          {isDemo && <p className="text-xs text-amber-500/80 text-center">데모 모드 - 슬라이더를 움직여 시뮬레이션해보세요</p>}
        </div>
      </div>

      {/* Priority matrix */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><ArrowUpDown size={16} className="text-amber-400" />우선순위 매트릭스 (Impact vs Effort)</h2>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Do First: High Impact, High Effort */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="text-xs font-bold text-emerald-400 mb-2">즉시 실행 (High Impact / High Effort)</div>
              {PRIORITIES.filter(p => p.quadrant === 'do_first').map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm py-1">
                  <ChevronRight size={10} className="text-emerald-500" />
                  <span>{p.name}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">I:{p.impact} E:{p.effort}</span>
                </div>
              ))}
            </div>
            {/* Schedule: High Impact, Low Effort */}
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="text-xs font-bold text-blue-400 mb-2">일정 계획 (High Impact / Low Effort)</div>
              {PRIORITIES.filter(p => p.quadrant === 'schedule').map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm py-1">
                  <ChevronRight size={10} className="text-blue-500" />
                  <span>{p.name}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">I:{p.impact} E:{p.effort}</span>
                </div>
              ))}
            </div>
            {/* Delegate: Low Impact, High Effort */}
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="text-xs font-bold text-amber-400 mb-2">위임 (Low Impact / High Effort)</div>
              {PRIORITIES.filter(p => p.quadrant === 'delegate').map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm py-1">
                  <ChevronRight size={10} className="text-amber-500" />
                  <span>{p.name}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">I:{p.impact} E:{p.effort}</span>
                </div>
              ))}
            </div>
            {/* Eliminate: Low Impact, Low Effort */}
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <div className="text-xs font-bold text-red-400 mb-2">제거/보류 (Low Impact / Low Effort)</div>
              {PRIORITIES.filter(p => p.quadrant === 'eliminate').map(p => (
                <div key={p.id} className="flex items-center gap-2 text-sm py-1">
                  <ChevronRight size={10} className="text-red-500" />
                  <span>{p.name}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">I:{p.impact} E:{p.effort}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Adjustment history */}
      <div>
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><Clock size={16} className="text-slate-400" />조정 이력 (최근 5건)</h2>
        <div className="space-y-2">
          {MOCK_LOGS.map(log => (
            <div key={log.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-slate-500">{log.date}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">{log.action}</span>
                </div>
                <div className="text-sm">{log.reason}</div>
                {log.fromBU !== '-' && log.toBU !== '-' && (
                  <div className="text-xs text-slate-500 mt-1">{log.fromBU} → {log.toBU} {log.amount > 0 && `(${fmtB(log.amount)})`}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
