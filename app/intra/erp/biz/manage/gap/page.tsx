"use client";

import { useState } from "react";
import { BarChart3, Target, TrendingDown } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

interface ComparisonCard {
  title: string;
  icon: typeof Target;
  items: { label: string; value: number }[];
}

const comparisons: ComparisonCard[] = [
  {
    title: "계획 vs 실적",
    icon: Target,
    items: [
      { label: "누적 매출 Gap", value: -8_000_000 },
      { label: "매총 Gap", value: -3_000_000 },
      { label: "영업이익 Gap", value: -2_000_000 },
    ],
  },
  {
    title: "추정 vs 실적",
    icon: TrendingDown,
    items: [
      { label: "누적 매출 Gap", value: -3_000_000 },
      { label: "매총 Gap", value: -1_000_000 },
      { label: "영업이익 Gap", value: -800_000 },
    ],
  },
  {
    title: "추정 정확도",
    icon: BarChart3,
    items: [
      { label: "매출", value: 92.1 },
      { label: "매총", value: 92.3 },
      { label: "영업이익", value: 86.2 },
    ],
  },
];

interface MonthlyTrend {
  month: string;
  plan: number;
  forecast: number;
  actual: number;
  gap: number;
}

const monthlyTrends: MonthlyTrend[] = [
  { month: "1월", plan: 42_000_000, forecast: 40_000_000, actual: 35_000_000, gap: -7_000_000 },
  { month: "2월", plan: 40_000_000, forecast: 38_000_000, actual: 35_000_000, gap: -5_000_000 },
  { month: "3월", plan: 42_000_000, forecast: 40_000_000, actual: 35_000_000, gap: -7_000_000 },
];

const maxBilling = 42_000_000;

export default function GapAnalysisPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-neutral-900">Gap 분석</h1>
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
                  {card.title === "추정 정확도" ? (
                    <span
                      className={clsx(
                        "text-sm font-bold",
                        item.value >= 90 ? "text-green-600" : "text-amber-600"
                      )}
                    >
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
                  <div
                    className="h-4 rounded-sm bg-neutral-300"
                    style={{ width: `${(row.plan / maxBilling) * 100}%` }}
                  />
                  <span className="text-xs text-neutral-400">계획</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={clsx(
                      "h-4 rounded-sm",
                      row.actual >= row.plan ? "bg-green-400" : "bg-neutral-700"
                    )}
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
