"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Users, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import * as erpDb from "@/lib/supabase/erp";
import { PageHeader } from "@/components/intra/IntraUI";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

interface DivisionPlan {
  name: string;
  billing: number;
  grossProfit: number;
  operatingProfit: number;
  profitRate: number;
  headcount: number;
  quarters: { quarter: string; billing: number; grossProfit: number; operatingProfit: number }[];
}

const divisions: DivisionPlan[] = [
  {
    name: "사업부문",
    billing: 350_000_000,
    grossProfit: 100_000_000,
    operatingProfit: 48_000_000,
    profitRate: 13.7,
    headcount: 16,
    quarters: [
      { quarter: "Q1", billing: 85_000_000, grossProfit: 24_000_000, operatingProfit: 11_500_000 },
      { quarter: "Q2", billing: 92_000_000, grossProfit: 26_000_000, operatingProfit: 12_500_000 },
      { quarter: "Q3", billing: 88_000_000, grossProfit: 25_000_000, operatingProfit: 12_000_000 },
      { quarter: "Q4", billing: 85_000_000, grossProfit: 25_000_000, operatingProfit: 12_000_000 },
    ],
  },
  {
    name: "제작부문",
    billing: 100_000_000,
    grossProfit: 35_000_000,
    operatingProfit: 15_000_000,
    profitRate: 15.0,
    headcount: 14,
    quarters: [
      { quarter: "Q1", billing: 24_000_000, grossProfit: 8_500_000, operatingProfit: 3_600_000 },
      { quarter: "Q2", billing: 26_000_000, grossProfit: 9_000_000, operatingProfit: 3_900_000 },
      { quarter: "Q3", billing: 25_000_000, grossProfit: 8_800_000, operatingProfit: 3_800_000 },
      { quarter: "Q4", billing: 25_000_000, grossProfit: 8_700_000, operatingProfit: 3_700_000 },
    ],
  },
  {
    name: "지원부문",
    billing: 50_000_000,
    grossProfit: 15_000_000,
    operatingProfit: 7_000_000,
    profitRate: 14.0,
    headcount: 10,
    quarters: [
      { quarter: "Q1", billing: 11_000_000, grossProfit: 3_500_000, operatingProfit: 1_600_000 },
      { quarter: "Q2", billing: 13_000_000, grossProfit: 4_000_000, operatingProfit: 1_900_000 },
      { quarter: "Q3", billing: 13_000_000, grossProfit: 3_800_000, operatingProfit: 1_800_000 },
      { quarter: "Q4", billing: 13_000_000, grossProfit: 3_700_000, operatingProfit: 1_700_000 },
    ],
  },
];

const totals = divisions.reduce(
  (acc, d) => ({
    billing: acc.billing + d.billing,
    grossProfit: acc.grossProfit + d.grossProfit,
    operatingProfit: acc.operatingProfit + d.operatingProfit,
    headcount: acc.headcount + d.headcount,
  }),
  { billing: 0, grossProfit: 0, operatingProfit: 0, headcount: 0 }
);

function buildDivisions(rows: Record<string, unknown>[]): DivisionPlan[] {
  const map: Record<string, DivisionPlan> = {};
  rows.forEach(r => {
    const div = (r.division as string) || "기타";
    if (!map[div]) map[div] = { name: div, billing: 0, grossProfit: 0, operatingProfit: 0, profitRate: 0, headcount: 0, quarters: [] };
    const q = (r.quarter as string) || "";
    const billing = (r.billing as number) || 0;
    const gp = (r.gross_profit as number) || 0;
    const op = (r.operating_profit as number) || 0;
    map[div].billing += billing;
    map[div].grossProfit += gp;
    map[div].operatingProfit += op;
    if (q) map[div].quarters.push({ quarter: q, billing, grossProfit: gp, operatingProfit: op });
  });
  Object.values(map).forEach(d => {
    d.profitRate = d.billing > 0 ? Math.round((d.operatingProfit / d.billing) * 1000) / 10 : 0;
  });
  return Object.values(map);
}

export default function DivisionPlanPage() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [divisionData, setDivisionData] = useState<DivisionPlan[]>(divisions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    erpDb.fetchBizPlans().then(rows => {
      if (!cancelled && rows.length > 0) {
        const built = buildDivisions(rows as Record<string, unknown>[]);
        if (built.length > 0) setDivisionData(built);
      }
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const toggle = (name: string) => setExpanded(expanded === name ? null : name);

  return (
    <div>
      <PageHeader title="부문별 계획" description="2026년도 부문별 경영계획" />

      <div className="overflow-x-auto border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-4 py-2.5 text-left font-medium">부문</th>
              <th className="px-4 py-2.5 text-right font-medium">목표 매출</th>
              <th className="px-4 py-2.5 text-right font-medium">목표 매총</th>
              <th className="px-4 py-2.5 text-right font-medium">목표 영업이익</th>
              <th className="px-4 py-2.5 text-right font-medium">이익률</th>
              <th className="px-4 py-2.5 text-right font-medium">인원</th>
            </tr>
          </thead>
          <tbody>
            {divisionData.map((div) => (
              <>
                <tr
                  key={div.name}
                  className="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50"
                  onClick={() => toggle(div.name)}
                >
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    <span className="flex items-center gap-1.5">
                      {expanded === div.name ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      {div.name}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-neutral-700">{krw(div.billing)}</td>
                  <td className="px-4 py-2.5 text-right text-neutral-700">{krw(div.grossProfit)}</td>
                  <td className="px-4 py-2.5 text-right font-medium text-neutral-900">{krw(div.operatingProfit)}</td>
                  <td className="px-4 py-2.5 text-right text-neutral-700">{div.profitRate}%</td>
                  <td className="px-4 py-2.5 text-right text-neutral-700">
                    <span className="flex items-center justify-end gap-1">
                      <Users size={12} />
                      {div.headcount}명
                    </span>
                  </td>
                </tr>
                {expanded === div.name &&
                  div.quarters.map((q) => (
                    <tr key={`${div.name}-${q.quarter}`} className="border-b border-neutral-50 bg-neutral-50/50">
                      <td className="px-4 py-2 pl-10 text-xs text-neutral-500">{q.quarter}</td>
                      <td className="px-4 py-2 text-right text-xs text-neutral-500">{krw(q.billing)}</td>
                      <td className="px-4 py-2 text-right text-xs text-neutral-500">{krw(q.grossProfit)}</td>
                      <td className="px-4 py-2 text-right text-xs font-medium text-neutral-600">{krw(q.operatingProfit)}</td>
                      <td className="px-4 py-2 text-right text-xs text-neutral-500">
                        {q.billing > 0 ? ((q.operatingProfit / q.billing) * 100).toFixed(1) : "0.0"}%
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-neutral-400">-</td>
                    </tr>
                  ))}
              </>
            ))}
            {(() => {
              const t = divisionData.reduce((acc, d) => ({ billing: acc.billing + d.billing, grossProfit: acc.grossProfit + d.grossProfit, operatingProfit: acc.operatingProfit + d.operatingProfit, headcount: acc.headcount + d.headcount }), { billing: 0, grossProfit: 0, operatingProfit: 0, headcount: 0 });
              return (
                <tr className="bg-neutral-50 font-bold">
                  <td className="px-4 py-2.5 text-neutral-900">합계</td>
                  <td className="px-4 py-2.5 text-right text-neutral-900">{krw(t.billing)}</td>
                  <td className="px-4 py-2.5 text-right text-neutral-900">{krw(t.grossProfit)}</td>
                  <td className="px-4 py-2.5 text-right text-neutral-900">{krw(t.operatingProfit)}</td>
                  <td className="px-4 py-2.5 text-right text-neutral-900">{t.billing > 0 ? ((t.operatingProfit / t.billing) * 100).toFixed(1) : 0}%</td>
                  <td className="px-4 py-2.5 text-right text-neutral-900">{t.headcount}명</td>
                </tr>
              );
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
