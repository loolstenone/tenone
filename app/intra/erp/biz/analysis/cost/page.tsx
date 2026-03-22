"use client";

import { useState } from "react";
import { PieChart, Layers, TrendingUp } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

// External cost breakdown
interface CostItem {
  name: string;
  amount: number;
  ratio: number;
}

const externalCosts: CostItem[] = [
  { name: "제작외주", amount: 10_350_000, ratio: 45 },
  { name: "매체비", amount: 8_050_000, ratio: 35 },
  { name: "기타", amount: 4_600_000, ratio: 20 },
];

const internalCosts: CostItem[] = [
  { name: "인건비", amount: 4_200_000, ratio: 60 },
  { name: "공통비", amount: 1_750_000, ratio: 25 },
  { name: "제경비", amount: 1_050_000, ratio: 15 },
];

interface MonthlyCostRow {
  month: string;
  exCost: number;
  inCost: number;
  total: number;
}

const monthlyCosts: MonthlyCostRow[] = [
  { month: "1월", exCost: 23_000_000, inCost: 7_000_000, total: 30_000_000 },
  { month: "2월", exCost: 23_000_000, inCost: 7_000_000, total: 30_000_000 },
  { month: "3월", exCost: 26_000_000, inCost: 7_800_000, total: 33_800_000 },
];

interface AllocationRow {
  division: string;
  commonCost: number;
  ratio: number;
  headcount: number;
}

const allocations: AllocationRow[] = [
  { division: "사업부문", commonCost: 875_000, ratio: 40, headcount: 16 },
  { division: "제작부문", commonCost: 656_000, ratio: 30, headcount: 14 },
  { division: "지원부문", commonCost: 438_000, ratio: 20, headcount: 10 },
  { division: "관리부문", commonCost: 219_000, ratio: 10, headcount: 5 },
];

const barColors = ["bg-neutral-700", "bg-neutral-400", "bg-neutral-200"];

export default function CostAnalysisPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"external" | "internal">("external");

  const activeCosts = tab === "external" ? externalCosts : internalCosts;
  const totalCost = activeCosts.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-900">비용 분석</h1>
        <p className="text-sm text-neutral-500">외부비/내부비 구성 및 추이</p>
      </div>

      {/* Tab Selector */}
      <div className="mb-4 flex gap-1">
        <button
          onClick={() => setTab("external")}
          className={clsx(
            "rounded-md px-3 py-1.5 text-xs font-medium",
            tab === "external" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          외부비 구성
        </button>
        <button
          onClick={() => setTab("internal")}
          className={clsx(
            "rounded-md px-3 py-1.5 text-xs font-medium",
            tab === "internal" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          내부비 구성
        </button>
      </div>

      {/* Cost Breakdown */}
      <div className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
          <PieChart size={14} />
          {tab === "external" ? "외부비" : "내부비"} 구성 (월평균)
        </div>

        {/* Stacked Bar */}
        <div className="mb-4 flex h-8 overflow-hidden rounded-md">
          {activeCosts.map((cost, i) => (
            <div
              key={cost.name}
              className={clsx("flex items-center justify-center text-xs font-medium", barColors[i], i === 0 ? "text-white" : "text-neutral-700")}
              style={{ width: `${cost.ratio}%` }}
            >
              {cost.ratio}%
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="space-y-2">
          {activeCosts.map((cost, i) => (
            <div key={cost.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={clsx("h-3 w-3 rounded-sm", barColors[i])} />
                <span className="text-sm text-neutral-700">{cost.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-900">{krw(cost.amount)}</span>
                <span className="w-10 text-right text-xs text-neutral-400">{cost.ratio}%</span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
            <span className="text-sm font-medium text-neutral-900">합계</span>
            <span className="text-sm font-bold text-neutral-900">{krw(totalCost)}</span>
          </div>
        </div>
      </div>

      {/* Monthly Cost Trend */}
      <div className="mb-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <div className="flex items-center gap-1.5 px-4 pt-3 text-xs font-medium text-neutral-500">
          <TrendingUp size={14} />
          월별 비용 추이
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-4 py-2.5 text-left font-medium">월</th>
              <th className="px-4 py-2.5 text-right font-medium">외부비</th>
              <th className="px-4 py-2.5 text-right font-medium">내부비</th>
              <th className="px-4 py-2.5 text-right font-medium">합계</th>
            </tr>
          </thead>
          <tbody>
            {monthlyCosts.map((row) => (
              <tr key={row.month} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-2.5 font-medium text-neutral-900">{row.month}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(row.exCost)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(row.inCost)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-neutral-900">{krw(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Allocation Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <div className="flex items-center gap-1.5 px-4 pt-3 text-xs font-medium text-neutral-500">
          <Layers size={14} />
          배부율 현황 (공통비 배분)
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-4 py-2.5 text-left font-medium">부문</th>
              <th className="px-4 py-2.5 text-right font-medium">배부 공통비</th>
              <th className="px-4 py-2.5 text-right font-medium">배부율</th>
              <th className="px-4 py-2.5 text-right font-medium">인원</th>
              <th className="px-4 py-2.5 text-right font-medium">비율 바</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((row) => (
              <tr key={row.division} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-2.5 font-medium text-neutral-900">{row.division}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(row.commonCost)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{row.ratio}%</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{row.headcount}명</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-3 w-24 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-neutral-600"
                        style={{ width: `${row.ratio}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
