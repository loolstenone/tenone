'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { MOCK_SALES, formatCurrency } from '@/lib/smarcomm/dashboard-data';
import LineChart from '@/components/smarcomm/charts/LineChart';
import BarChart from '@/components/smarcomm/charts/BarChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';

export default function AnalyticsPage() {
  const [sales, setSales] = useState(MOCK_SALES);
  const [newMonth, setNewMonth] = useState('');
  const [newRevenue, setNewRevenue] = useState('');
  const [newAdSpend, setNewAdSpend] = useState('');
  const [newConversions, setNewConversions] = useState('');

  const handleAdd = () => {
    if (!newMonth || !newRevenue) return;
    setSales([...sales, {
      month: newMonth,
      revenue: parseInt(newRevenue) || 0,
      adSpend: parseInt(newAdSpend) || 0,
      conversions: parseInt(newConversions) || 0,
    }]);
    setNewMonth(''); setNewRevenue(''); setNewAdSpend(''); setNewConversions('');
  };

  const maxRevenue = Math.max(...sales.map(s => s.revenue));
  const totalRevenue = sales.reduce((s, e) => s + e.revenue, 0);
  const totalAdSpend = sales.reduce((s, e) => s + e.adSpend, 0);
  const avgRoas = totalAdSpend > 0 ? (totalRevenue / totalAdSpend * 100).toFixed(0) : '-';

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-xl font-bold text-text">매출 분석</h1>

      {/* Summary */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">총 매출</div>
          <div className="text-xl font-bold text-text">{formatCurrency(totalRevenue)}원</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">총 광고비</div>
          <div className="text-xl font-bold text-text">{formatCurrency(totalAdSpend)}원</div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="text-xs text-text-muted">평균 ROAS</div>
          <div className="text-xl font-bold text-text">{avgRoas}%</div>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">매출 추이</h2>
          <LineChart
            data={sales.map(s => ({ label: s.month.replace('2025-', '').replace('2026-', ''), value: s.revenue }))}
            height={220}
            color={getChartColors()[0]}
          />
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-text">광고비 추이</h2>
          <LineChart
            data={sales.map(s => ({ label: s.month.replace('2025-', '').replace('2026-', ''), value: s.adSpend }))}
            height={220}
            color={getChartColors()[1]}
          />
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-text">월별 ROAS</h2>
        <BarChart
          data={sales.map(s => ({
            label: s.month.replace('2025-', '').replace('2026-', ''),
            value: s.adSpend > 0 ? Math.round(s.revenue / s.adSpend * 100) : 0,
            color: s.revenue / s.adSpend >= 4 ? getChartColors()[0] : s.revenue / s.adSpend >= 3 ? getChartColors()[2] : getChartColors()[4],
          }))}
          height={180}
        />
      </div>

      {/* Manual Input */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-text">매출 데이터 입력</h2>
        <div className="grid gap-3 sm:grid-cols-5">
          <input type="month" value={newMonth} onChange={e => setNewMonth(e.target.value)} className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-text focus:outline-none" />
          <input type="number" value={newRevenue} onChange={e => setNewRevenue(e.target.value)} placeholder="매출 (원)" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
          <input type="number" value={newAdSpend} onChange={e => setNewAdSpend(e.target.value)} placeholder="광고비 (원)" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
          <input type="number" value={newConversions} onChange={e => setNewConversions(e.target.value)} placeholder="전환 수" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
          <button onClick={handleAdd} className="flex items-center justify-center gap-1 rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white hover:bg-accent-sub">
            <Plus size={15} /> 추가
          </button>
        </div>
      </div>
    </div>
  );
}
