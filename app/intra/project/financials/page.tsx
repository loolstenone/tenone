"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Users,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import type { ProjectFinancials } from "@/types/project";

// ── 포맷 헬퍼 ──
const krw = (n: number) => new Intl.NumberFormat("ko-KR").format(n) + "원";
const krwShort = (n: number) => {
  if (n >= 100000000) return (n / 100000000).toFixed(1).replace(/\.0$/, "") + "억";
  if (n >= 10000) return (n / 10000).toFixed(0) + "만";
  return new Intl.NumberFormat("ko-KR").format(n);
};
const pct = (n: number, d: number) => (d === 0 ? "0.0" : ((n / d) * 100).toFixed(1));

// ── 프로젝트 데이터 타입 ──
interface ProjectPL {
  code: string;
  name: string;
  type: "클라이언트" | "커뮤니티" | "내부";
  financials: ProjectFinancials;
  billingDetail: { label: string; amount: number }[];
  exCostDetail: { label: string; amount: number }[];
  inCostDetail: { label: string; amount: number }[];
  staffCosts: { name: string; hours: number; rate: number; amount: number }[];
}

// ── Mock 데이터 ──
const projects: ProjectPL[] = [
  {
    code: "PRJ-2026-001",
    name: "LUKI 2nd Single",
    type: "클라이언트",
    financials: {
      billing: 200000000,
      exCost: 130000000,
      revenue: 70000000,
      inCost: 35000000,
      profit: 35000000,
    },
    billingDetail: [
      { label: "클라이언트 청구액", amount: 160000000 },
      { label: "스폰서 수입", amount: 30000000 },
      { label: "기타 수입", amount: 10000000 },
    ],
    exCostDetail: [
      { label: "제작 외주 (MV/촬영)", amount: 80000000 },
      { label: "매체 비용 (SNS/PR)", amount: 35000000 },
      { label: "기타 외부비", amount: 15000000 },
    ],
    inCostDetail: [
      { label: "내부 인건비 (타임시트)", amount: 22000000 },
      { label: "공통비용 배분", amount: 8000000 },
      { label: "제경비", amount: 5000000 },
    ],
    staffCosts: [
      { name: "Cheonil Jeon", hours: 120, rate: 65000, amount: 7800000 },
      { name: "Sarah Kim", hours: 95, rate: 50000, amount: 4750000 },
      { name: "김콘텐", hours: 80, rate: 45000, amount: 3600000 },
      { name: "이준서", hours: 70, rate: 45000, amount: 3150000 },
      { name: "박하늘", hours: 54, rate: 50000, amount: 2700000 },
    ],
  },
  {
    code: "PRJ-2026-003",
    name: "리제로스 시즌2",
    type: "커뮤니티",
    financials: {
      billing: 100000000,
      exCost: 65000000,
      revenue: 35000000,
      inCost: 18000000,
      profit: 17000000,
    },
    billingDetail: [
      { label: "스폰서 수입", amount: 60000000 },
      { label: "IP 라이선스", amount: 25000000 },
      { label: "굿즈 판매", amount: 15000000 },
    ],
    exCostDetail: [
      { label: "제작 외주", amount: 35000000 },
      { label: "매체 비용", amount: 20000000 },
      { label: "이벤트 운영", amount: 10000000 },
    ],
    inCostDetail: [
      { label: "내부 인건비 (타임시트)", amount: 10000000 },
      { label: "공통비용 배분", amount: 5000000 },
      { label: "제경비", amount: 3000000 },
    ],
    staffCosts: [
      { name: "Cheonil Jeon", hours: 60, rate: 65000, amount: 3900000 },
      { name: "이준서", hours: 80, rate: 45000, amount: 3600000 },
      { name: "박하늘", hours: 50, rate: 50000, amount: 2500000 },
    ],
  },
  {
    code: "PRJ-2026-002",
    name: "MADLeap 5기",
    type: "내부",
    financials: {
      billing: 50000000,
      exCost: 30000000,
      revenue: 20000000,
      inCost: 10000000,
      profit: 10000000,
    },
    billingDetail: [
      { label: "참가비 수입", amount: 20000000 },
      { label: "스폰서 수입", amount: 25000000 },
      { label: "기타", amount: 5000000 },
    ],
    exCostDetail: [
      { label: "공간 임대", amount: 12000000 },
      { label: "강사 비용", amount: 10000000 },
      { label: "기타 운영비", amount: 8000000 },
    ],
    inCostDetail: [
      { label: "내부 인건비 (타임시트)", amount: 6000000 },
      { label: "공통비용 배분", amount: 2500000 },
      { label: "제경비", amount: 1500000 },
    ],
    staffCosts: [
      { name: "Sarah Kim", hours: 80, rate: 50000, amount: 4000000 },
      { name: "김준호", hours: 40, rate: 50000, amount: 2000000 },
    ],
  },
];

// ── 합계 ──
const totals = projects.reduce(
  (acc, p) => ({
    billing: acc.billing + p.financials.billing,
    exCost: acc.exCost + p.financials.exCost,
    revenue: acc.revenue + p.financials.revenue,
    inCost: acc.inCost + p.financials.inCost,
    profit: acc.profit + p.financials.profit,
  }),
  { billing: 0, exCost: 0, revenue: 0, inCost: 0, profit: 0 }
);

const typeBadge: Record<string, string> = {
  "클라이언트": "bg-blue-50 text-blue-600",
  "커뮤니티": "bg-violet-50 text-violet-600",
  "내부": "bg-neutral-100 text-neutral-600",
};

export default function FinancialsPage() {
  const { isStaff } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggle(code: string) {
    setExpanded((prev) => ({ ...prev, [code]: !prev[code] }));
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">프로젝트 손익</h1>
        <p className="text-sm text-neutral-500 mt-1">프로젝트별 수익성 관리</p>
      </div>

      {/* 직원 전용 안내 */}
      <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
        <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
        <span>이 페이지는 내부 직원 전용입니다</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "총 취급액 (Billing)",
            value: krw(totals.billing),
            icon: DollarSign,
            color: "text-neutral-900",
          },
          {
            label: "총 매출총이익 (Revenue)",
            value: krw(totals.revenue),
            icon: TrendingUp,
            color: "text-neutral-900",
          },
          {
            label: "매출총이익률",
            value: pct(totals.revenue, totals.billing) + "%",
            icon: BarChart3,
            color: "text-neutral-900",
          },
          {
            label: "총 영업이익 (Profit)",
            value: krw(totals.profit),
            icon: TrendingUp,
            color: "text-green-600",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="border border-neutral-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <card.icon className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-xs text-neutral-500">{card.label}</span>
            </div>
            <p className={clsx("text-lg font-bold", card.color)}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* P&L Table */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="text-left py-2.5 px-3 font-medium text-neutral-500 w-10" />
              <th className="text-left py-2.5 px-3 font-medium text-neutral-500">프로젝트</th>
              <th className="text-center py-2.5 px-2 font-medium text-neutral-500">유형</th>
              <th className="text-right py-2.5 px-3 font-medium text-neutral-500">Billing</th>
              <th className="text-right py-2.5 px-3 font-medium text-neutral-500">Ex-Cost</th>
              <th className="text-right py-2.5 px-3 font-medium text-neutral-500">Revenue</th>
              <th className="text-right py-2.5 px-3 font-medium text-neutral-500">In-Cost</th>
              <th className="text-right py-2.5 px-3 font-medium text-neutral-500">Profit</th>
              <th className="text-right py-2.5 px-3 font-medium text-neutral-500">이익률</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => {
              const isOpen = expanded[proj.code] ?? false;
              const f = proj.financials;
              const profitRate = pct(f.profit, f.billing);
              return (
                <ProjectRow
                  key={proj.code}
                  project={proj}
                  isOpen={isOpen}
                  profitRate={profitRate}
                  onToggle={() => toggle(proj.code)}
                />
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-50 border-t border-neutral-200 font-medium text-xs">
              <td className="py-2.5 px-3" />
              <td className="py-2.5 px-3 font-semibold">합계</td>
              <td />
              <td className="text-right py-2.5 px-3">{krw(totals.billing)}</td>
              <td className="text-right py-2.5 px-3 text-red-600">{krw(totals.exCost)}</td>
              <td className="text-right py-2.5 px-3">{krw(totals.revenue)}</td>
              <td className="text-right py-2.5 px-3 text-red-600">{krw(totals.inCost)}</td>
              <td className="text-right py-2.5 px-3 text-green-600 font-bold">
                {krw(totals.profit)}
              </td>
              <td className="text-right py-2.5 px-3">{pct(totals.profit, totals.billing)}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ── 프로젝트 행 + 확장 상세 ──
function ProjectRow({
  project,
  isOpen,
  profitRate,
  onToggle,
}: {
  project: ProjectPL;
  isOpen: boolean;
  profitRate: string;
  onToggle: () => void;
}) {
  const f = project.financials;

  return (
    <>
      {/* Main row */}
      <tr
        className="border-b border-neutral-100 hover:bg-neutral-50/30 cursor-pointer transition-colors"
        onClick={onToggle}
      >
        <td className="py-2.5 px-3 text-neutral-400">
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </td>
        <td className="py-2.5 px-3">
          <div>
            <span className="text-xs text-neutral-400 font-mono mr-1.5">{project.code}</span>
            <span className="font-medium text-neutral-800">{project.name}</span>
          </div>
        </td>
        <td className="text-center py-2.5 px-2">
          <span
            className={clsx(
              "px-2 py-0.5 rounded text-xs font-medium",
              typeBadge[project.type]
            )}
          >
            {project.type}
          </span>
        </td>
        <td className="text-right py-2.5 px-3 font-medium">{krw(f.billing)}</td>
        <td className="text-right py-2.5 px-3 text-red-600">{krw(f.exCost)}</td>
        <td className="text-right py-2.5 px-3 font-medium">{krw(f.revenue)}</td>
        <td className="text-right py-2.5 px-3 text-red-600">{krw(f.inCost)}</td>
        <td className="text-right py-2.5 px-3 text-green-600 font-bold">{krw(f.profit)}</td>
        <td className="text-right py-2.5 px-3">
          <span
            className={clsx(
              "font-medium",
              parseFloat(profitRate) >= 20
                ? "text-green-600"
                : parseFloat(profitRate) >= 10
                  ? "text-neutral-700"
                  : "text-red-500"
            )}
          >
            {profitRate}%
          </span>
        </td>
      </tr>

      {/* Expanded detail */}
      {isOpen && (
        <tr className="border-b border-neutral-100">
          <td colSpan={9} className="px-6 py-4 bg-neutral-50/50">
            <div className="grid grid-cols-3 gap-6">
              {/* Billing 상세 */}
              <DetailBlock
                title="Billing 상세 (취급액)"
                items={project.billingDetail}
                total={f.billing}
                color="text-neutral-900"
              />
              {/* Ex-Cost 상세 */}
              <DetailBlock
                title="Ex-Cost 상세 (외부비)"
                items={project.exCostDetail}
                total={f.exCost}
                color="text-red-600"
              />
              {/* In-Cost 상세 */}
              <DetailBlock
                title="In-Cost 상세 (내부비)"
                items={project.inCostDetail}
                total={f.inCost}
                color="text-red-600"
              />
            </div>

            {/* P&L Flow */}
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
                <span className="font-medium text-neutral-700">손익 흐름:</span>
                <span>Billing {krwShort(f.billing)}</span>
                <span>-</span>
                <span className="text-red-500">Ex-Cost {krwShort(f.exCost)}</span>
                <span>=</span>
                <span className="font-medium">Revenue {krwShort(f.revenue)}</span>
                <span>-</span>
                <span className="text-red-500">In-Cost {krwShort(f.inCost)}</span>
                <span>=</span>
                <span className="font-bold text-green-600">Profit {krwShort(f.profit)}</span>
              </div>
            </div>

            {/* 내부 인건비 상세 */}
            <div className="mt-2 pt-3 border-t border-neutral-200">
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="h-3 w-3 text-neutral-400" />
                <span className="text-xs font-semibold text-neutral-700">
                  내부 인건비 상세 (타임시트 연동)
                </span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-neutral-400">
                    <th className="text-left py-1.5 font-medium">이름</th>
                    <th className="text-right py-1.5 font-medium">투입 시수</th>
                    <th className="text-right py-1.5 font-medium">시간 단가</th>
                    <th className="text-right py-1.5 font-medium">금액</th>
                  </tr>
                </thead>
                <tbody>
                  {project.staffCosts.map((sc) => (
                    <tr key={sc.name} className="border-t border-neutral-100">
                      <td className="py-1.5 text-neutral-700">{sc.name}</td>
                      <td className="text-right py-1.5 text-neutral-600">{sc.hours}h</td>
                      <td className="text-right py-1.5 text-neutral-500">
                        {new Intl.NumberFormat("ko-KR").format(sc.rate)}원/h
                      </td>
                      <td className="text-right py-1.5 font-medium text-neutral-700">
                        {krw(sc.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-neutral-200 font-medium">
                    <td className="py-1.5">합계</td>
                    <td className="text-right py-1.5">
                      {project.staffCosts.reduce((s, c) => s + c.hours, 0)}h
                    </td>
                    <td />
                    <td className="text-right py-1.5">
                      {krw(project.staffCosts.reduce((s, c) => s + c.amount, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── 상세 블록 컴포넌트 ──
function DetailBlock({
  title,
  items,
  total,
  color,
}: {
  title: string;
  items: { label: string; amount: number }[];
  total: number;
  color: string;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-600 mb-2">{title}</h4>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between text-xs">
            <span className="text-neutral-500">{item.label}</span>
            <span className="text-neutral-700">{krw(item.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between text-xs pt-1.5 mt-1.5 border-t border-neutral-200">
          <span className="font-medium">합계</span>
          <span className={clsx("font-bold", color)}>{krw(total)}</span>
        </div>
      </div>
    </div>
  );
}
