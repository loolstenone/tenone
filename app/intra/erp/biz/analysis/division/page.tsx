"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader } from "@/components/intra/IntraUI";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

interface DivisionData {
  name: string;
  billing: number;
  grossProfit: number;
  operatingProfit: number;
  profitRate: number;
  prevProfitRate: number;
  headcount: number;
  perCapita: number;
}

const mockDivisions: DivisionData[] = [
  { name: "관리부문", billing: 20_000_000, grossProfit: 6_000_000, operatingProfit: 2_500_000, profitRate: 12.5, prevProfitRate: 11.8, headcount: 5, perCapita: 4_000_000 },
  { name: "사업부문", billing: 58_000_000, grossProfit: 17_000_000, operatingProfit: 8_000_000, profitRate: 13.8, prevProfitRate: 14.2, headcount: 16, perCapita: 3_625_000 },
  { name: "제작부문", billing: 17_000_000, grossProfit: 6_000_000, operatingProfit: 2_500_000, profitRate: 14.7, prevProfitRate: 14.7, headcount: 14, perCapita: 1_214_286 },
  { name: "지원부문", billing: 10_000_000, grossProfit: 3_000_000, operatingProfit: 2_000_000, profitRate: 20.0, prevProfitRate: 18.5, headcount: 10, perCapita: 1_000_000 },
];

function buildDivisionData(rows: Record<string, unknown>[]): DivisionData[] {
  // Group by division, accumulate two most-recent quarters for prev/current comparison
  const quarterMap: Record<string, Record<string, unknown>[]> = {};
  rows.forEach(r => {
    const div = (r.division as string) || "기타";
    if (!quarterMap[div]) quarterMap[div] = [];
    quarterMap[div].push(r);
  });
  return Object.entries(quarterMap).map(([name, qRows]) => {
    // Sort by quarter desc — first is current, second is previous
    qRows.sort((a, b) => ((b.quarter as string) || "").localeCompare((a.quarter as string) || ""));
    const cur = qRows[0];
    const prev = qRows[1];
    const billing = (cur.billing as number) || 0;
    const gp = (cur.gross_profit as number) || 0;
    const op = (cur.operating_profit as number) || 0;
    const headcount = (cur.headcount as number) || 0;
    const profitRate = billing > 0 ? Math.round((op / billing) * 1000) / 10 : 0;
    const prevBilling = prev ? ((prev.billing as number) || 0) : billing;
    const prevOp = prev ? ((prev.operating_profit as number) || 0) : op;
    const prevProfitRate = prevBilling > 0 ? Math.round((prevOp / prevBilling) * 1000) / 10 : profitRate;
    return {
      name,
      billing,
      grossProfit: gp,
      operatingProfit: op,
      profitRate,
      prevProfitRate,
      headcount,
      perCapita: headcount > 0 ? Math.round(billing / headcount) : 0,
    };
  });
}

function TrendIcon({ current, prev }: { current: number; prev: number }) {
  if (current > prev) return <TrendingUp size={12} className="text-green-600" />;
  if (current < prev) return <TrendingDown size={12} className="text-red-600" />;
  return <Minus size={12} className="text-neutral-400" />;
}

function TrendLabel({ current, prev }: { current: number; prev: number }) {
  const diff = (current - prev).toFixed(1);
  if (current > prev) return <span className="text-xs text-green-600">+{diff}%p</span>;
  if (current < prev) return <span className="text-xs text-red-600">{diff}%p</span>;
  return <span className="text-xs text-neutral-400">-</span>;
}

export default function DivisionProfitPage() {
  const { user } = useAuth();
  const [selectedDiv, setSelectedDiv] = useState<string | null>(null);
  const [divisions, setDivisions] = useState<DivisionData[]>(mockDivisions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    erpDb.fetchBizPlans().then((rows) => {
      if (!cancelled && rows.length > 0) {
        const built = buildDivisionData(rows as Record<string, unknown>[]);
        if (built.length > 0) setDivisions(built);
      }
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const maxBilling = Math.max(...divisions.map((d) => d.billing));

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

  return (
    <div>
      <PageHeader title="부문별 이익률" description="부문별 수익성 분석" />

      {/* Division Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {divisions.map((div) => (
          <div
            key={div.name}
            className={clsx(
              "cursor-pointer rounded-lg border bg-white p-4 transition-colors",
              selectedDiv === div.name ? "border-neutral-400" : "border-neutral-200 hover:border-neutral-300"
            )}
            onClick={() => setSelectedDiv(selectedDiv === div.name ? null : div.name)}
          >
            <p className="mb-2 text-xs font-medium text-neutral-500">{div.name}</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">매출</span>
                <span className="text-xs font-medium text-neutral-700">{krw(div.billing)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">매총</span>
                <span className="text-xs font-medium text-neutral-700">{krw(div.grossProfit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">영업이익</span>
                <span className="text-xs font-bold text-neutral-900">{krw(div.operatingProfit)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-100 pt-1.5">
                <span className="text-xs text-neutral-400">이익률</span>
                <span className="flex items-center gap-1">
                  <span className="text-sm font-bold text-neutral-900">{div.profitRate}%</span>
                  <TrendIcon current={div.profitRate} prev={div.prevProfitRate} />
                </span>
              </div>
              <div className="flex justify-end">
                <TrendLabel current={div.profitRate} prev={div.prevProfitRate} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="mb-6 overflow-x-auto border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-4 py-2.5 text-left font-medium">부문</th>
              <th className="px-4 py-2.5 text-right font-medium">매출</th>
              <th className="px-4 py-2.5 text-right font-medium">매총</th>
              <th className="px-4 py-2.5 text-right font-medium">영업이익</th>
              <th className="px-4 py-2.5 text-right font-medium">이익률</th>
              <th className="px-4 py-2.5 text-right font-medium">인원</th>
              <th className="px-4 py-2.5 text-right font-medium">1인당 매출</th>
            </tr>
          </thead>
          <tbody>
            {divisions.map((div) => (
              <tr key={div.name} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-2.5 font-medium text-neutral-900">{div.name}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(div.billing)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(div.grossProfit)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-neutral-900">{krw(div.operatingProfit)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{div.profitRate}%</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{div.headcount}명</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(div.perCapita)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar Visualization */}
      <div className="border border-neutral-200 bg-white p-4">
        <h3 className="mb-4 text-xs font-medium text-neutral-500">부문별 매출 비교</h3>
        <div className="space-y-3">
          {divisions.map((div) => (
            <div key={div.name} className="flex items-center gap-3">
              <span className="w-16 text-xs font-medium text-neutral-500">{div.name}</span>
              <div className="flex-1">
                <div
                  className="flex h-6 items-center rounded-sm bg-neutral-200"
                  style={{ width: `${(div.billing / maxBilling) * 100}%` }}
                >
                  <div
                    className="h-6 rounded-sm bg-neutral-700"
                    style={{ width: `${(div.operatingProfit / div.billing) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-20 text-right text-xs font-medium text-neutral-700">{div.profitRate}%</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 border-t border-neutral-100 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <div className="h-2.5 w-2.5 rounded-sm bg-neutral-200" />
            매출
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <div className="h-2.5 w-2.5 rounded-sm bg-neutral-700" />
            영업이익
          </div>
        </div>
      </div>
    </div>
  );
}
