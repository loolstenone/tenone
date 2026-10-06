"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Target, Percent, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import * as erpDb from "@/lib/supabase/erp";
import * as projectsDb from "@/lib/supabase/projects";
import { PageHeader } from "@/components/intra/IntraUI";

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


interface YtdSummary { billing: number; grossProfit: number; operatingProfit: number; }


export default function PLDashboardPage() {
  const { user } = useAuth();
  const [showYoY, setShowYoY] = useState(false);
  const [ytd, setYtd] = useState<YtdSummary>({ billing: 0, grossProfit: 0, operatingProfit: 0 });
  const [monthlyData] = useState<MonthlyPL[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    projectsDb.fetchProjects({ limit: 200 }).then(({ projects: rows }) => {
      if (!cancelled && rows.length > 0) {
        const totalBilling = rows.reduce((s: number, r: Record<string, unknown>) => s + ((r.billing as number) || 0), 0);
        const totalRevenue = rows.reduce((s: number, r: Record<string, unknown>) => s + ((r.revenue as number) || 0), 0);
        const totalProfit = rows.reduce((s: number, r: Record<string, unknown>) => s + ((r.profit as number) || 0), 0);
        if (totalBilling > 0) setYtd({ billing: totalBilling, grossProfit: totalBilling - totalRevenue, operatingProfit: totalProfit });
      }
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const ytdRate = ytd.billing > 0 ? ((ytd.operatingProfit / ytd.billing) * 100).toFixed(1) : "0.0";

  const summaryCards = [
    { label: "YTD 매출", value: krw(ytd.billing), icon: DollarSign },
    { label: "YTD 매총", value: krw(ytd.grossProfit), icon: TrendingUp },
    { label: "YTD 영업이익", value: krw(ytd.operatingProfit), icon: Target },
    { label: "이익률", value: `${ytdRate}%`, icon: Percent },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="손익 현황" description="전사 손익 대시보드">
        <button
          onClick={() => setShowYoY(!showYoY)}
          className={clsx(
            "rounded-md px-3 py-1.5 text-xs font-medium",
            showYoY ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          )}
        >
          전년 대비
        </button>
      </PageHeader>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="border border-neutral-200 bg-white p-4">
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
      <div className="overflow-x-auto border border-neutral-200 bg-white">
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
