'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

type BudgetItem = {
  department: string;
  allocated: number;
  spent: number;
  category: string;
};

const MOCK_BUDGET: BudgetItem[] = [
  { department: '개발팀', allocated: 180000000, spent: 142000000, category: '인건비/장비' },
  { department: '마케팅팀', allocated: 95000000, spent: 88000000, category: '광고/캠페인' },
  { department: '경영지원팀', allocated: 60000000, spent: 35000000, category: '관리비/임차' },
  { department: '디자인팀', allocated: 45000000, spent: 48500000, category: '인건비/툴' },
  { department: '영업팀', allocated: 70000000, spent: 52000000, category: '영업활동/출장' },
  { department: 'HR팀', allocated: 35000000, spent: 28000000, category: '채용/교육' },
];

export default function BudgetPage() {
  const { tenant } = useWIO();
  const isDemo = !tenant || tenant.id === 'demo';
  const [budgetData, setBudgetData] = useState<BudgetItem[]>(isDemo ? MOCK_BUDGET : []);
  const [loading, setLoading] = useState(!isDemo);

  // Supabase에서 예산 데이터 로드
  const loadBudget = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from('budgets')
        .select('*')
        .eq('tenant_id', tenant!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        setBudgetData(data.map((row: any) => ({
          department: row.department || '',
          allocated: row.allocated || 0,
          spent: row.spent || 0,
          category: row.category || '',
        })));
      } else {
        setBudgetData(MOCK_BUDGET);
      }
    } catch {
      setBudgetData(MOCK_BUDGET);
    } finally {
      setLoading(false);
    }
  }, [isDemo, tenant]);

  useEffect(() => { loadBudget(); }, [loadBudget]);

  const totalAllocated = budgetData.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = budgetData.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgetData.filter(b => b.spent > b.allocated);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">예산관리</h1>
          <p className="text-xs text-slate-500 mt-0.5">FIN-BUD &middot; Budget Management</p>
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">총 예산</div>
          <div className="text-lg font-bold">{totalAllocated.toLocaleString()}원</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">총 집행</div>
          <div className="text-lg font-bold text-indigo-400">{totalSpent.toLocaleString()}원</div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-slate-500 mb-1">전체 집행률</div>
          <div className="text-lg font-bold text-amber-400">{Math.round((totalSpent / totalAllocated) * 100)}%</div>
        </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="text-center py-12">
          <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">데이터 로딩 중...</p>
        </div>
      )}

      {/* 예산 초과 알림 */}
      {!loading && overBudget.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-sm font-semibold text-red-400">예산 초과 부서</span>
          </div>
          {overBudget.map(b => (
            <div key={b.department} className="text-xs text-slate-400 ml-6">
              {b.department}: {(b.spent - b.allocated).toLocaleString()}원 초과 (집행률 {Math.round((b.spent / b.allocated) * 100)}%)
            </div>
          ))}
        </div>
      )}

      {/* 부서별 바 차트 */}
      {!loading && <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 mb-4">
        <h3 className="text-sm font-semibold mb-4">부서별 예산 vs 집행</h3>
        <div className="space-y-4">
          {budgetData.map(b => {
            const pct = Math.min((b.spent / b.allocated) * 100, 100);
            const overPct = b.spent > b.allocated ? ((b.spent - b.allocated) / b.allocated) * 100 : 0;
            const isOver = b.spent > b.allocated;
            return (
              <div key={b.department}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{b.department}</span>
                  <span className={`text-xs font-mono ${isOver ? 'text-red-400' : 'text-slate-400'}`}>
                    {Math.round((b.spent / b.allocated) * 100)}%
                  </span>
                </div>
                <div className="relative h-5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500/60' : 'bg-indigo-500/60'}`}
                    style={{ width: `${Math.min(pct + overPct, 100)}%` }}
                  />
                  {/* 예산선 마커 */}
                  {isOver && (
                    <div className="absolute top-0 h-full w-0.5 bg-white/30" style={{ left: `${(b.allocated / b.spent) * 100}%` }} />
                  )}
                </div>
                <div className="flex justify-between mt-0.5 text-[10px] text-slate-600">
                  <span>집행 {b.spent.toLocaleString()}</span>
                  <span>배정 {b.allocated.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>}

      {/* 예산 테이블 */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs text-slate-500">
              <th className="text-left px-4 py-3">부서</th>
              <th className="text-left px-4 py-3">분류</th>
              <th className="text-right px-4 py-3">배정액</th>
              <th className="text-right px-4 py-3">집행액</th>
              <th className="text-right px-4 py-3">잔액</th>
              <th className="text-right px-4 py-3">집행률</th>
            </tr>
          </thead>
          <tbody>
            {budgetData.map(b => {
              const remaining = b.allocated - b.spent;
              const pct = Math.round((b.spent / b.allocated) * 100);
              const isOver = remaining < 0;
              return (
                <tr key={b.department} className={`border-b border-white/5 hover:bg-white/[0.02] ${isOver ? 'bg-red-500/[0.02]' : ''}`}>
                  <td className="px-4 py-2.5 font-medium">{b.department}</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{b.category}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-300">{b.allocated.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-indigo-300">{b.spent.toLocaleString()}</td>
                  <td className={`px-4 py-2.5 text-right font-mono ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>{remaining.toLocaleString()}</td>
                  <td className={`px-4 py-2.5 text-right font-semibold ${pct > 100 ? 'text-red-400' : pct > 80 ? 'text-amber-400' : 'text-slate-400'}`}>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
