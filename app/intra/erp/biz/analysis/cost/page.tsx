"use client";

import { useState, useEffect } from "react";
import { PieChart, Layers, TrendingUp, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader } from "@/components/intra/IntraUI";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

interface CostItem {
  name: string;
  amount: number;
  ratio: number;
}

interface MonthlyCostRow {
  month: string;
  exCost: number;
  inCost: number;
  total: number;
}

interface AllocationRow {
  division: string;
  commonCost: number;
  ratio: number;
  headcount: number;
}





// Map expense category → external or internal bucket
const EXTERNAL_TYPES = ["외주비", "제작외주", "매체비", "광고비", "행사비"];
const INTERNAL_TYPES = ["인건비", "공통비", "제경비", "복리후생", "교육훈련"];

function buildCostBreakdown(rows: Record<string, unknown>[]) {
  const exMap: Record<string, number> = {};
  const inMap: Record<string, number> = {};
  const monthlyMap: Record<string, { ex: number; in: number }> = {};

  rows.forEach(r => {
    const amount = (r.amount as number) || 0;
    const category = (r.category as string) || (r.expense_type as string) || "기타";
    const dateStr = (r.expense_date as string) || "";
    const month = dateStr.slice(0, 7); // "YYYY-MM"

    const isExternal = EXTERNAL_TYPES.some(t => category.includes(t));
    const isInternal = INTERNAL_TYPES.some(t => category.includes(t));

    if (isExternal) {
      exMap[category] = (exMap[category] || 0) + amount;
    } else if (isInternal) {
      inMap[category] = (inMap[category] || 0) + amount;
    } else {
      exMap["기타"] = (exMap["기타"] || 0) + amount;
    }

    if (month) {
      if (!monthlyMap[month]) monthlyMap[month] = { ex: 0, in: 0 };
      if (isInternal) monthlyMap[month].in += amount;
      else monthlyMap[month].ex += amount;
    }
  });

  const toItems = (map: Record<string, number>): CostItem[] => {
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amount]) => ({
        name,
        amount,
        ratio: total > 0 ? Math.round((amount / total) * 100) : 0,
      }));
  };

  const monthly: MonthlyCostRow[] = Object.entries(monthlyMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([m, v]) => ({
      month: `${parseInt(m.slice(5))}월`,
      exCost: v.ex,
      inCost: v.in,
      total: v.ex + v.in,
    }));

  return { exItems: toItems(exMap), inItems: toItems(inMap), monthly };
}

const barColors = ["bg-neutral-700", "bg-neutral-400", "bg-neutral-200"];

export default function CostAnalysisPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"external" | "internal">("external");
  const [externalCosts, setExternalCosts] = useState<CostItem[]>([]);
  const [internalCosts, setInternalCosts] = useState<CostItem[]>([]);
  const [monthlyCosts, setMonthlyCosts] = useState<MonthlyCostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    erpDb.fetchExpenses({ limit: 200 }).then((rows) => {
      if (!cancelled && rows.length > 0) {
        const { exItems, inItems, monthly } = buildCostBreakdown(rows as Record<string, unknown>[]);
        if (exItems.length > 0) setExternalCosts(exItems);
        if (inItems.length > 0) setInternalCosts(inItems);
        if (monthly.length > 0) setMonthlyCosts(monthly);
      }
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const allocations: AllocationRow[] = []; // 배부 기준 데이터 미구현 — 실데이터 연결 전까지 비움
  const activeCosts = tab === "external" ? externalCosts : internalCosts;
  const totalCost = activeCosts.reduce((s, c) => s + c.amount, 0);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

  return (
    <div>
      <PageHeader title="비용 분석" description="외부비/내부비 구성 및 추이" />

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
      <div className="mb-6 border border-neutral-200 bg-white p-4">
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
      <div className="mb-6 overflow-x-auto border border-neutral-200 bg-white">
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
      <div className="overflow-x-auto border border-neutral-200 bg-white">
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
