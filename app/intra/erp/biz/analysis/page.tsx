"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, Target, Percent } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

interface MonthlyPL {
  month: string;
  billing: number;
  exCost: number;
  grossProfit: number;
  inCost: number;
  operatingProfit: number;
  profitRate: number;
  isActual: boolean;
}

const monthlyData: MonthlyPL[] = [
  { month: "1월", billing: 35_000_000, exCost: 23_000_000, grossProfit: 12_000_000, inCost: 7_000_000, operatingProfit: 5_000_000, profitRate: 14.3, isActual: true },
  { month: "2월", billing: 35_000_000, exCost: 23_000_000, grossProfit: 12_000_000, inCost: 7_000_000, operatingProfit: 5_000_000, profitRate: 14.3, isActual: true },
  { month: "3월", billing: 35_000_000, exCost: 23_000_000, grossProfit: 12_000_000, inCost: 7_000_000, operatingProfit: 5_000_000, profitRate: 14.3, isActual: false },
  { month: "4월", billing: 42_000_000, exCost: 27_000_000, grossProfit: 15_000_000, inCost: 8_000_000, operatingProfit: 7_000_000, profitRate: 16.7, isActual: false },
  { month: "5월", billing: 42_000_000, exCost: 27_000_000, grossProfit: 15_000_000, inCost: 8_000_000, operatingProfit: 7_000_000, profitRate: 16.7, isActual: false },
  { month: "6월", billing: 45_000_000, exCost: 29_000_000, grossProfit: 16_000_000, inCost: 8_000_000, operatingProfit: 8_000_000, profitRate: 17.8, isActual: false },
  { month: "7월", billing: 42_000_000, exCost: 27_000_000, grossProfit: 15_000_000, inCost: 8_000_000, operatingProfit: 7_000_000, profitRate: 16.7, isActual: false },
  { month: "8월", billing: 40_000_000, exCost: 26_000_000, grossProfit: 14_000_000, inCost: 7_500_000, operatingProfit: 6_500_000, profitRate: 16.3, isActual: false },
  { month: "9월", billing: 43_000_000, exCost: 28_000_000, grossProfit: 15_000_000, inCost: 8_000_000, operatingProfit: 7_000_000, profitRate: 16.3, isActual: false },
  { month: "10월", billing: 42_000_000, exCost: 27_000_000, grossProfit: 15_000_000, inCost: 8_000_000, operatingProfit: 7_000_000, profitRate: 16.7, isActual: false },
  { month: "11월", billing: 42_000_000, exCost: 27_000_000, grossProfit: 15_000_000, inCost: 8_000_000, operatingProfit: 7_000_000, profitRate: 16.7, isActual: false },
  { month: "12월", billing: 40_000_000, exCost: 26_000_000, grossProfit: 14_000_000, inCost: 7_500_000, operatingProfit: 6_500_000, profitRate: 16.3, isActual: false },
];

const ytdActual = monthlyData.filter((m) => m.isActual);
const ytdBilling = ytdActual.reduce((s, m) => s + m.billing, 0);
const ytdGross = ytdActual.reduce((s, m) => s + m.grossProfit, 0);
const ytdOp = ytdActual.reduce((s, m) => s + m.operatingProfit, 0);
const ytdRate = ((ytdOp / ytdBilling) * 100).toFixed(1);

export default function PLDashboardPage() {
  const { user } = useAuth();
  const [showYoY, setShowYoY] = useState(false);

  const summaryCards = [
    { label: "YTD 매출", value: krw(ytdBilling), icon: DollarSign },
    { label: "YTD 매총", value: krw(ytdGross), icon: TrendingUp },
    { label: "YTD 영업이익", value: krw(ytdOp), icon: Target },
    { label: "이익률", value: `${ytdRate}%`, icon: Percent },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">손익 현황</h1>
          <p className="text-sm text-neutral-500">전사 손익 대시보드</p>
        </div>
        <button
          onClick={() => setShowYoY(!showYoY)}
          className={clsx(
            "rounded-md px-3 py-1.5 text-xs font-medium",
            showYoY ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          전년 대비
        </button>
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
            {showYoY && (
              <p className="mt-0.5 text-xs text-green-600">+12% YoY</p>
            )}
          </div>
        ))}
      </div>

      {/* Monthly P&L Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-4 py-2.5 text-left font-medium">월</th>
              <th className="px-4 py-2.5 text-right font-medium">매출</th>
              <th className="px-4 py-2.5 text-right font-medium">외부비</th>
              <th className="px-4 py-2.5 text-right font-medium">매총</th>
              <th className="px-4 py-2.5 text-right font-medium">내부비</th>
              <th className="px-4 py-2.5 text-right font-medium">영업이익</th>
              <th className="px-4 py-2.5 text-right font-medium">이익률</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((row) => (
              <tr
                key={row.month}
                className={clsx(
                  "border-b border-neutral-100 hover:bg-neutral-50",
                  !row.isActual && "text-neutral-400"
                )}
              >
                <td className="px-4 py-2.5 font-medium text-neutral-900">
                  <span className="flex items-center gap-1.5">
                    {row.month}
                    {!row.isActual && (
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-400">
                        {row.month === "3월" ? "추정" : "계획"}
                      </span>
                    )}
                  </span>
                </td>
                <td className={clsx("px-4 py-2.5 text-right", row.isActual ? "text-neutral-700" : "text-neutral-400")}>
                  {krw(row.billing)}
                </td>
                <td className={clsx("px-4 py-2.5 text-right", row.isActual ? "text-neutral-700" : "text-neutral-400")}>
                  {krw(row.exCost)}
                </td>
                <td className={clsx("px-4 py-2.5 text-right", row.isActual ? "text-neutral-700" : "text-neutral-400")}>
                  {krw(row.grossProfit)}
                </td>
                <td className={clsx("px-4 py-2.5 text-right", row.isActual ? "text-neutral-700" : "text-neutral-400")}>
                  {krw(row.inCost)}
                </td>
                <td className={clsx("px-4 py-2.5 text-right font-medium", row.isActual ? "text-neutral-900" : "text-neutral-400")}>
                  {krw(row.operatingProfit)}
                </td>
                <td className={clsx("px-4 py-2.5 text-right", row.isActual ? "text-neutral-700" : "text-neutral-400")}>
                  {row.profitRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
