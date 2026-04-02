"use client";

import { useState, useEffect } from "react";
import { BarChart3, Target, TrendingDown, Loader2 } from "lucide-react";
import clsx from "clsx";
import * as erpDb from "@/lib/supabase/erp";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

interface MonthlyTrend {
  month: string;
  plan: number;
  forecast: number;
  actual: number;
  gap: number;
}

const mockMonthlyTrends: MonthlyTrend[] = [
  { month: "1월", plan: 42_000_000, forecast: 40_000_000, actual: 35_000_000, gap: -7_000_000 },
  { month: "2월", plan: 40_000_000, forecast: 38_000_000, actual: 35_000_000, gap: -5_000_000 },
  { month: "3월", plan: 42_000_000, forecast: 40_000_000, actual: 35_000_000, gap: -7_000_000 },
];

interface ComparisonSummary {
  planVsActualRevenue: number;
  planVsActualGp: number;
  planVsActualOp: number;
  fcVsActualRevenue: number;
  fcVsActualGp: number;
  fcVsActualOp: number;
  accRevenue: number;
  accGp: number;
  accOp: number;
}

const mockSummary: ComparisonSummary = {
  planVsActualRevenue: -8_000_000, planVsActualGp: -3_000_000, planVsActualOp: -2_000_000,
  fcVsActualRevenue: -3_000_000, fcVsActualGp: -1_000_000, fcVsActualOp: -800_000,
  accRevenue: 92.1, accGp: 92.3, accOp: 86.2,
};

export default function GapAnalysisPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>(mockMonthlyTrends);
  const [summary, setSummary] = useState<ComparisonSummary>(mockSummary);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // 올해 전체 월별 데이터 (매출 항목만)
        const rows = await erpDb.fetchMonthlyForecasts({ year: now.getFullYear() });
        if (!cancelled && rows.length > 0) {
          // 월별로 "매출" 항목 집계
          const monthMap: Record<number, { plan: number; forecast: number; actual: number }> = {};
          rows.forEach(r => {
            const m = r.month as number;
            const item = (r.item as string) || "";
            if (!item.includes("매출") || item.includes("매총") || item.includes("총이익")) return;
            if (!monthMap[m]) monthMap[m] = { plan: 0, forecast: 0, actual: 0 };
            monthMap[m].plan += (r.plan as number) || 0;
            monthMap[m].forecast += (r.forecast_2 as number) || (r.forecast_1 as number) || 0;
            monthMap[m].actual += (r.actual as number) || 0;
          });

          const trends: MonthlyTrend[] = Object.entries(monthMap)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([m, v]) => ({
              month: `${m}월`,
              plan: v.plan,
              forecast: v.forecast,
              actual: v.actual,
              gap: v.actual - v.plan,
            }));

          if (trends.length > 0) {
            setMonthlyTrends(trends);
            // 누적 Gap 계산
            const totPlan = trends.reduce((s, t) => s + t.plan, 0);
            const totFc = trends.reduce((s, t) => s + t.forecast, 0);
            const totActual = trends.reduce((s, t) => s + t.actual, 0);
            setSummary(prev => ({
              ...prev,
              planVsActualRevenue: totActual - totPlan,
              fcVsActualRevenue: totActual - totFc,
              accRevenue: totFc ? Math.round((totActual / totFc) * 1000) / 10 : prev.accRevenue,
            }));
          }
        }
      } catch { /* mock 유지 */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const maxBilling = Math.max(...monthlyTrends.map(t => t.plan), 1);

  const comparisons = [
    {
      title: "계획 vs 실적",
      icon: Target,
      items: [
        { label: "누적 매출 Gap", value: summary.planVsActualRevenue },
        { label: "매총 Gap", value: summary.planVsActualGp },
        { label: "영업이익 Gap", value: summary.planVsActualOp },
      ],
      isAccuracy: false,
    },
    {
      title: "추정 vs 실적",
      icon: TrendingDown,
      items: [
        { label: "누적 매출 Gap", value: summary.fcVsActualRevenue },
        { label: "매총 Gap", value: summary.fcVsActualGp },
        { label: "영업이익 Gap", value: summary.fcVsActualOp },
      ],
      isAccuracy: false,
    },
    {
      title: "추정 정확도",
      icon: BarChart3,
      items: [
        { label: "매출", value: summary.accRevenue },
        { label: "매총", value: summary.accGp },
        { label: "영업이익", value: summary.accOp },
      ],
      isAccuracy: true,
    },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-neutral-900">Gap 분석</h1>
        <p className="text-sm text-neutral-500">계획 vs 추정 vs 실적 비교</p>
      </div>

      {/* Comparison Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        {comparisons.map((card) => (
          <div key={card.title} className="border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
              <card.icon size={14} />
              {card.title}
            </div>
            <div className="space-y-2">
              {card.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">{item.label}</span>
                  {card.isAccuracy ? (
                    <span className={clsx("text-sm font-bold", item.value >= 90 ? "text-green-600" : "text-amber-600")}>
                      {item.value}%
                    </span>
                  ) : (
                    <span className={clsx("text-sm font-bold", item.value < 0 ? "text-red-600" : "text-green-600")}>
                      {krw(item.value)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Trend Table */}
      <div className="mb-6 overflow-x-auto border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-4 py-2.5 text-left font-medium">월</th>
              <th className="px-4 py-2.5 text-right font-medium">계획</th>
              <th className="px-4 py-2.5 text-right font-medium">추정</th>
              <th className="px-4 py-2.5 text-right font-medium">실적</th>
              <th className="px-4 py-2.5 text-right font-medium">Gap</th>
            </tr>
          </thead>
          <tbody>
            {monthlyTrends.map((row) => (
              <tr
                key={row.month}
                className={clsx(
                  "cursor-pointer border-b border-neutral-100 hover:bg-neutral-50",
                  selectedMonth === row.month && "bg-neutral-50"
                )}
                onClick={() => setSelectedMonth(selectedMonth === row.month ? null : row.month)}
              >
                <td className="px-4 py-2.5 font-medium text-neutral-900">{row.month}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(row.plan)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-500">{krw(row.forecast)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-neutral-900">{krw(row.actual)}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className={clsx("font-medium", row.gap < 0 ? "text-red-600" : "text-green-600")}>
                    {krw(row.gap)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar Chart Visualization */}
      <div className="border border-neutral-200 bg-white p-4">
        <h3 className="mb-4 text-xs font-medium text-neutral-500">계획 vs 실적 (매출 기준)</h3>
        <div className="space-y-3">
          {monthlyTrends.map((row) => (
            <div key={row.month} className="flex items-center gap-3">
              <span className="w-8 text-xs font-medium text-neutral-500">{row.month}</span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-4 rounded-sm bg-neutral-300" style={{ width: `${(row.plan / maxBilling) * 100}%` }} />
                  <span className="text-xs text-neutral-400">계획</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={clsx("h-4 rounded-sm", row.actual >= row.plan ? "bg-green-400" : "bg-neutral-700")}
                    style={{ width: `${(row.actual / maxBilling) * 100}%` }}
                  />
                  <span className="text-xs text-neutral-400">실적</span>
                </div>
              </div>
              <span className={clsx("w-20 text-right text-xs font-medium", row.gap < 0 ? "text-red-600" : "text-green-600")}>
                {krw(row.gap)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 border-t border-neutral-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <div className="h-2.5 w-2.5 rounded-sm bg-neutral-300" />
            계획
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <div className="h-2.5 w-2.5 rounded-sm bg-neutral-700" />
            실적
          </div>
        </div>
      </div>
    </div>
  );
}
