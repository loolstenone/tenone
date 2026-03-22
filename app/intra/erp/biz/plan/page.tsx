"use client";

import { useState } from "react";
import { Target, TrendingUp, DollarSign, Percent, FileEdit } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

interface QuarterRow {
  quarter: string;
  billing: number;
  exCost: number;
  grossProfit: number;
  inCost: number;
  operatingProfit: number;
}

const quarterData: QuarterRow[] = [
  { quarter: "Q1", billing: 120_000_000, exCost: 78_000_000, grossProfit: 42_000_000, inCost: 22_000_000, operatingProfit: 20_000_000 },
  { quarter: "Q2", billing: 130_000_000, exCost: 84_000_000, grossProfit: 46_000_000, inCost: 24_000_000, operatingProfit: 22_000_000 },
  { quarter: "Q3", billing: 125_000_000, exCost: 81_000_000, grossProfit: 44_000_000, inCost: 23_000_000, operatingProfit: 21_000_000 },
  { quarter: "Q4", billing: 125_000_000, exCost: 82_000_000, grossProfit: 43_000_000, inCost: 22_000_000, operatingProfit: 21_000_000 },
];

const totalRow = quarterData.reduce(
  (acc, r) => ({
    billing: acc.billing + r.billing,
    exCost: acc.exCost + r.exCost,
    grossProfit: acc.grossProfit + r.grossProfit,
    inCost: acc.inCost + r.inCost,
    operatingProfit: acc.operatingProfit + r.operatingProfit,
  }),
  { billing: 0, exCost: 0, grossProfit: 0, inCost: 0, operatingProfit: 0 }
);

export default function AnnualPlanPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"확정" | "수립중">("확정");

  const profitRate = ((totalRow.operatingProfit / totalRow.billing) * 100).toFixed(1);

  const summaryCards = [
    { label: "목표 매출 (Billing)", value: krw(totalRow.billing), icon: DollarSign },
    { label: "목표 매출총이익 (Revenue)", value: krw(totalRow.grossProfit), icon: TrendingUp },
    { label: "목표 영업이익 (Profit)", value: krw(totalRow.operatingProfit), icon: Target },
    { label: "이익률", value: `${profitRate}%`, icon: Percent },
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">연간 경영계획</h1>
          <p className="text-sm text-neutral-500">2026년도 경영계획</p>
        </div>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-medium",
            status === "확정" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          )}
        >
          {status}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
              <c.icon size={14} />
              {c.label}
            </div>
            <p className="text-lg font-bold text-neutral-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Quarterly Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-4 py-2.5 text-left font-medium">분기</th>
              <th className="px-4 py-2.5 text-right font-medium">목표 매출</th>
              <th className="px-4 py-2.5 text-right font-medium">목표 외부비</th>
              <th className="px-4 py-2.5 text-right font-medium">목표 매총</th>
              <th className="px-4 py-2.5 text-right font-medium">목표 내부비</th>
              <th className="px-4 py-2.5 text-right font-medium">목표 영업이익</th>
            </tr>
          </thead>
          <tbody>
            {quarterData.map((row) => (
              <tr key={row.quarter} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-2.5 font-medium text-neutral-900">{row.quarter}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(row.billing)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(row.exCost)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(row.grossProfit)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(row.inCost)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-neutral-900">{krw(row.operatingProfit)}</td>
              </tr>
            ))}
            <tr className="bg-neutral-50 font-bold">
              <td className="px-4 py-2.5 text-neutral-900">합계</td>
              <td className="px-4 py-2.5 text-right text-neutral-900">{krw(totalRow.billing)}</td>
              <td className="px-4 py-2.5 text-right text-neutral-900">{krw(totalRow.exCost)}</td>
              <td className="px-4 py-2.5 text-right text-neutral-900">{krw(totalRow.grossProfit)}</td>
              <td className="px-4 py-2.5 text-right text-neutral-900">{krw(totalRow.inCost)}</td>
              <td className="px-4 py-2.5 text-right text-neutral-900">{krw(totalRow.operatingProfit)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setStatus(status === "확정" ? "수립중" : "확정")}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
        >
          <FileEdit size={14} />
          계획 수립
        </button>
      </div>
    </div>
  );
}
