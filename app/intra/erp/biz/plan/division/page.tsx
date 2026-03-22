"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

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

export default function DivisionPlanPage() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (name: string) => setExpanded(expanded === name ? null : name);

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-neutral-900">부문별 계획</h1>
        <p className="text-sm text-neutral-500">2026년도 부문별 경영계획</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
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
            {divisions.map((div) => (
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
                        {((q.operatingProfit / q.billing) * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-neutral-400">-</td>
                    </tr>
                  ))}
              </>
            ))}
            <tr className="bg-neutral-50 font-bold">
              <td className="px-4 py-2.5 text-neutral-900">합계</td>
              <td className="px-4 py-2.5 text-right text-neutral-900">{krw(totals.billing)}</td>
              <td className="px-4 py-2.5 text-right text-neutral-900">{krw(totals.grossProfit)}</td>
              <td className="px-4 py-2.5 text-right text-neutral-900">{krw(totals.operatingProfit)}</td>
              <td className="px-4 py-2.5 text-right text-neutral-900">
                {((totals.operatingProfit / totals.billing) * 100).toFixed(1)}%
              </td>
              <td className="px-4 py-2.5 text-right text-neutral-900">{totals.headcount}명</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
