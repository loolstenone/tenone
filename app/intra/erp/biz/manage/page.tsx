"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Send, Loader2 } from "lucide-react";
import clsx from "clsx";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader } from "@/components/intra/IntraUI";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

const ITEMS = ["매출 (Billing)", "외부비 (Ex-Cost)", "매출총이익", "내부비", "영업이익"];

interface ForecastRow {
  item: string;
  plan: number;
  fc1: number;
  fc2: number;
  prevActual: number;
  gap: number;
}

const mockForecast: ForecastRow[] = [
  { item: "매출 (Billing)", plan: 42_000_000, fc1: 38_000_000, fc2: 40_000_000, prevActual: 35_000_000, gap: -2_000_000 },
  { item: "외부비 (Ex-Cost)", plan: 27_000_000, fc1: 25_000_000, fc2: 26_000_000, prevActual: 23_000_000, gap: -1_000_000 },
  { item: "매출총이익", plan: 15_000_000, fc1: 13_000_000, fc2: 14_000_000, prevActual: 12_000_000, gap: -1_000_000 },
  { item: "내부비", plan: 8_000_000, fc1: 7_500_000, fc2: 7_800_000, prevActual: 7_000_000, gap: -200_000 },
  { item: "영업이익", plan: 7_000_000, fc1: 5_500_000, fc2: 6_200_000, prevActual: 5_000_000, gap: -800_000 },
];

type Status = "작성중" | "검토요청" | "승인완료";

const statusFromDb: Record<string, Status> = {
  draft: "작성중", review: "검토요청", confirmed: "승인완료",
};

export default function MonthlyForecastPage() {
  const now = new Date();
  const [monthIdx, setMonthIdx] = useState(now.getMonth());
  const [round, setRound] = useState(2);
  const [status, setStatus] = useState<Status>("작성중");
  const [forecastData, setForecastData] = useState<ForecastRow[]>(mockForecast);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await erpDb.fetchMonthlyForecasts({ year: now.getFullYear(), month: monthIdx + 1 });
        if (!cancelled && rows.length > 0) {
          // 이전 달 실적 (prevActual) — 한 달 전 actual
          const prevMonth = monthIdx === 0 ? 12 : monthIdx;
          const prevYear = monthIdx === 0 ? now.getFullYear() - 1 : now.getFullYear();
          const prevRows = await erpDb.fetchMonthlyForecasts({ year: prevYear, month: prevMonth });
          const prevMap: Record<string, number> = {};
          prevRows.forEach(r => { prevMap[r.item as string] = (r.actual as number) || 0; });

          // 현재 round는 첫 번째 행에서 읽기
          const firstRow = rows[0];
          if (firstRow.round) setRound(firstRow.round as number);
          if (firstRow.status) setStatus(statusFromDb[firstRow.status as string] || "작성중");

          const mapped: ForecastRow[] = ITEMS.map(item => {
            const r = rows.find(x => x.item === item) as Record<string, unknown> | undefined;
            const plan = (r?.plan as number) || 0;
            const fc2 = (r?.forecast_2 as number) || 0;
            return {
              item,
              plan,
              fc1: (r?.forecast_1 as number) || 0,
              fc2,
              prevActual: prevMap[item] || 0,
              gap: fc2 - plan,
            };
          });
          if (!cancelled) setForecastData(mapped);
        }
      } catch { /* mock 유지 */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [monthIdx]);

  const prevMonth = () => setMonthIdx((p) => Math.max(0, p - 1));
  const nextMonth = () => setMonthIdx((p) => Math.min(11, p + 1));

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="월별 추정"
        description={`${now.getFullYear()}년 ${months[monthIdx]} ${round}차 추정`}
      >
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
      </PageHeader>

      {/* Selectors */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2 border border-neutral-200 bg-white px-3 py-1.5">
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
      <div className="overflow-x-auto border border-neutral-200 bg-white">
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
