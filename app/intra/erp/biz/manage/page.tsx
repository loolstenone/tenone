"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

interface ForecastRow {
  item: string;
  plan: number;
  fc1: number;
  fc2: number;
  prevActual: number;
  gap: number;
}

const forecastData: ForecastRow[] = [
  { item: "매출 (Billing)", plan: 42_000_000, fc1: 38_000_000, fc2: 40_000_000, prevActual: 35_000_000, gap: -2_000_000 },
  { item: "외부비 (Ex-Cost)", plan: 27_000_000, fc1: 25_000_000, fc2: 26_000_000, prevActual: 23_000_000, gap: -1_000_000 },
  { item: "매출총이익", plan: 15_000_000, fc1: 13_000_000, fc2: 14_000_000, prevActual: 12_000_000, gap: -1_000_000 },
  { item: "내부비", plan: 8_000_000, fc1: 7_500_000, fc2: 7_800_000, prevActual: 7_000_000, gap: -200_000 },
  { item: "영업이익", plan: 7_000_000, fc1: 5_500_000, fc2: 6_200_000, prevActual: 5_000_000, gap: -800_000 },
];

type Status = "작성중" | "검토요청" | "승인완료";

export default function MonthlyForecastPage() {
  const { user } = useAuth();
  const [monthIdx, setMonthIdx] = useState(2); // 3월
  const [round, setRound] = useState(2); // 2차
  const [status, setStatus] = useState<Status>("작성중");

  const prevMonth = () => setMonthIdx((p) => Math.max(0, p - 1));
  const nextMonth = () => setMonthIdx((p) => Math.min(11, p + 1));

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">월별 추정</h1>
          <p className="text-sm text-neutral-500">
            2026년 {months[monthIdx]} {round}차 추정
          </p>
        </div>
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-medium",
            status === "승인완료" && "bg-green-100 text-green-700",
            status === "검토요청" && "bg-blue-100 text-blue-700",
            status === "작성중" && "bg-amber-100 text-amber-700"
          )}
        >
          {status}
        </span>
      </div>

      {/* Selectors */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5">
          <button onClick={prevMonth} className="text-neutral-400 hover:text-neutral-700">
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[3rem] text-center text-sm font-medium text-neutral-900">{months[monthIdx]}</span>
          <button onClick={nextMonth} className="text-neutral-400 hover:text-neutral-700">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((r) => (
            <button
              key={r}
              onClick={() => setRound(r)}
              className={clsx(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                round === r ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {r}차
            </button>
          ))}
        </div>
      </div>

      {/* Forecast Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-4 py-2.5 text-left font-medium">항목</th>
              <th className="px-4 py-2.5 text-right font-medium">경영계획</th>
              <th className="px-4 py-2.5 text-right font-medium">1차 추정</th>
              <th className="px-4 py-2.5 text-right font-medium">2차 추정</th>
              <th className="px-4 py-2.5 text-right font-medium">전월 실적</th>
              <th className="px-4 py-2.5 text-right font-medium">Gap (계획 vs 추정)</th>
            </tr>
          </thead>
          <tbody>
            {forecastData.map((row) => (
              <tr
                key={row.item}
                className={clsx(
                  "border-b border-neutral-100 hover:bg-neutral-50",
                  row.item === "영업이익" && "font-medium"
                )}
              >
                <td className="px-4 py-2.5 font-medium text-neutral-900">{row.item}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(row.plan)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-500">{krw(row.fc1)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(row.fc2)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-500">{krw(row.prevActual)}</td>
                <td
                  className={clsx(
                    "px-4 py-2.5 text-right font-medium",
                    row.gap < 0 ? "text-red-600" : "text-green-600"
                  )}
                >
                  {krw(row.gap)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setStatus("검토요청")}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800"
        >
          <Send size={14} />
          검토 요청
        </button>
      </div>
    </div>
  );
}
