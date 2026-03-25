"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

interface ActualRow {
  item: string;
  plan: number;
  forecast: number;
  actual: number;
  gapPlan: number;
  gapPlanPct: string;
  gapFc: number;
  gapFcPct: string;
}

const actualData: ActualRow[] = [
  { item: "매출", plan: 40_000_000, forecast: 38_000_000, actual: 35_000_000, gapPlan: -5_000_000, gapPlanPct: "-12.5%", gapFc: -3_000_000, gapFcPct: "-7.9%" },
  { item: "외부비", plan: 26_000_000, forecast: 25_000_000, actual: 23_000_000, gapPlan: -3_000_000, gapPlanPct: "-11.5%", gapFc: -2_000_000, gapFcPct: "-8.0%" },
  { item: "매출총이익", plan: 14_000_000, forecast: 13_000_000, actual: 12_000_000, gapPlan: -2_000_000, gapPlanPct: "-14.3%", gapFc: -1_000_000, gapFcPct: "-7.7%" },
  { item: "내부비", plan: 7_500_000, forecast: 7_200_000, actual: 7_000_000, gapPlan: -500_000, gapPlanPct: "-6.7%", gapFc: -200_000, gapFcPct: "-2.8%" },
  { item: "영업이익", plan: 6_500_000, forecast: 5_800_000, actual: 5_000_000, gapPlan: -1_500_000, gapPlanPct: "-23.1%", gapFc: -800_000, gapFcPct: "-13.8%" },
];

type Status = "미확정" | "확정";

export default function ActualConfirmPage() {
  const { user } = useAuth();
  const [monthIdx, setMonthIdx] = useState(1); // 2월
  const [status, setStatus] = useState<Status>("미확정");

  const prevMonth = () => setMonthIdx((p) => Math.max(0, p - 1));
  const nextMonth = () => setMonthIdx((p) => Math.min(11, p + 1));

  return (
    <div className="max-w-6xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">실적 확정</h1>
          <p className="text-sm text-neutral-500">2026년 {months[monthIdx]} 실적</p>
        </div>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-medium",
            status === "확정" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
          )}
        >
          {status}
        </span>
      </div>

      {/* Month Selector */}
      <div className="mb-4 flex items-center gap-2 border border-neutral-200 bg-white px-3 py-1.5 w-fit">
        <button onClick={prevMonth} className="text-neutral-400 hover:text-neutral-700">
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[3rem] text-center text-sm font-medium text-neutral-900">{months[monthIdx]}</span>
        <button onClick={nextMonth} className="text-neutral-400 hover:text-neutral-700">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Actual Table */}
      <div className="overflow-x-auto border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-4 py-2.5 text-left font-medium">항목</th>
              <th className="px-4 py-2.5 text-right font-medium">경영계획</th>
              <th className="px-4 py-2.5 text-right font-medium">최종추정</th>
              <th className="px-4 py-2.5 text-right font-medium">실적</th>
              <th className="px-4 py-2.5 text-right font-medium">Gap (계획 vs 실적)</th>
              <th className="px-4 py-2.5 text-right font-medium">Gap (추정 vs 실적)</th>
            </tr>
          </thead>
          <tbody>
            {actualData.map((row) => (
              <tr
                key={row.item}
                className={clsx(
                  "border-b border-neutral-100 hover:bg-neutral-50",
                  row.item === "영업이익" && "font-medium"
                )}
              >
                <td className="px-4 py-2.5 font-medium text-neutral-900">{row.item}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(row.plan)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-500">{krw(row.forecast)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-neutral-900">{krw(row.actual)}</td>
                <td className="px-4 py-2.5 text-right">
                  <span className={clsx("font-medium", row.gapPlan < 0 ? "text-red-600" : "text-green-600")}>
                    {krw(row.gapPlan)}
                  </span>
                  <span className="ml-1 text-xs text-neutral-400">({row.gapPlanPct})</span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className={clsx("font-medium", row.gapFc < 0 ? "text-red-600" : "text-green-600")}>
                    {krw(row.gapFc)}
                  </span>
                  <span className="ml-1 text-xs text-neutral-400">({row.gapFcPct})</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setStatus("확정")}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
        >
          <CheckCircle size={14} />
          실적 확정
        </button>
      </div>
    </div>
  );
}
