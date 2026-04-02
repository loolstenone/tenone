"use client";

import { useState, useEffect } from "react";
import { Trophy, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import * as projectsDb from "@/lib/supabase/projects";
import { PageHeader } from "@/components/intra/IntraUI";

const krw = (n: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

interface ProjectPL {
  rank: number;
  code: string;
  name: string;
  type: string;
  billing: number;
  grossProfit: number;
  operatingProfit: number;
  profitRate: number;
}

const projects: ProjectPL[] = [
  { rank: 1, code: "PRJ-2026-0005", name: "Badak 네트워크", type: "플랫폼", billing: 50_000_000, grossProfit: 18_000_000, operatingProfit: 10_000_000, profitRate: 20.0 },
  { rank: 2, code: "PRJ-2026-0001", name: "LUKI AI 그룹", type: "AI/콘텐츠", billing: 80_000_000, grossProfit: 25_000_000, operatingProfit: 14_000_000, profitRate: 17.5 },
  { rank: 3, code: "PRJ-2026-0003", name: "리제로스 IP", type: "IP/라이선스", billing: 30_000_000, grossProfit: 9_000_000, operatingProfit: 5_100_000, profitRate: 17.0 },
  { rank: 4, code: "PRJ-2026-0002", name: "RooK 크리에이터", type: "AI/콘텐츠", billing: 60_000_000, grossProfit: 18_000_000, operatingProfit: 9_600_000, profitRate: 16.0 },
  { rank: 5, code: "PRJ-2026-0004", name: "MADLeap 프로그램", type: "교육/커뮤니티", billing: 40_000_000, grossProfit: 11_000_000, operatingProfit: 6_000_000, profitRate: 15.0 },
];

const mockProjects = projects;

export default function ProjectProfitPage() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<"profitRate" | "billing" | "operatingProfit">("profitRate");
  const [projectData, setProjectData] = useState<ProjectPL[]>(mockProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    projectsDb.fetchProjects({ limit: 100 }).then(({ projects: rows }) => {
      if (!cancelled && rows.length > 0) {
        const mapped: ProjectPL[] = rows
          .filter((r: Record<string, unknown>) => (r.billing as number) > 0)
          .map((r: Record<string, unknown>, i: number) => {
            const billing = (r.billing as number) || 0;
            const revenue = (r.revenue as number) || 0;
            const profit = (r.profit as number) || 0;
            const grossProfit = billing - revenue;
            const profitRate = billing > 0 ? Math.round((profit / billing) * 1000) / 10 : 0;
            return {
              rank: i + 1,
              code: (r.code as string) || "",
              name: (r.name as string) || "",
              type: (r.type as string) || "",
              billing,
              grossProfit,
              operatingProfit: profit,
              profitRate,
            };
          });
        if (mapped.length > 0) setProjectData(mapped);
      }
    }).catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const sorted = [...projectData].sort((a, b) => b[sortBy] - a[sortBy]).map((p, i) => ({ ...p, rank: i + 1 }));
  const avgRate = projectData.length > 0 ? (projectData.reduce((s, p) => s + p.profitRate, 0) / projectData.length).toFixed(1) : "0";
  const topProject = sorted[0];
  const bottomProject = sorted[sorted.length - 1];

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

  return (
    <div>
      <PageHeader title="프로젝트 수익성" description="프로젝트별 손익 랭킹" />

      {/* Summary */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="border border-neutral-200 bg-white p-4">
          <p className="mb-1 text-xs text-neutral-500">평균 이익률</p>
          <p className="text-xl font-bold text-neutral-900">{avgRate}%</p>
        </div>
        <div className="border border-neutral-200 bg-white p-4">
          <div className="mb-1 flex items-center gap-1 text-xs text-green-600">
            <ArrowUp size={12} />
            최고 이익률
          </div>
          <p className="text-sm font-bold text-neutral-900">{topProject.name}</p>
          <p className="text-lg font-bold text-green-600">{topProject.profitRate}%</p>
        </div>
        <div className="border border-neutral-200 bg-white p-4">
          <div className="mb-1 flex items-center gap-1 text-xs text-red-500">
            <ArrowDown size={12} />
            최저 이익률
          </div>
          <p className="text-sm font-bold text-neutral-900">{bottomProject.name}</p>
          <p className="text-lg font-bold text-red-500">{bottomProject.profitRate}%</p>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-3 flex gap-1">
        {([
          { key: "profitRate", label: "이익률순" },
          { key: "billing", label: "매출순" },
          { key: "operatingProfit", label: "영업이익순" },
        ] as const).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={clsx(
              "rounded-md px-3 py-1.5 text-xs font-medium",
              sortBy === opt.key ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Project Ranking Table */}
      <div className="overflow-x-auto border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-4 py-2.5 text-center font-medium">순위</th>
              <th className="px-4 py-2.5 text-left font-medium">프로젝트</th>
              <th className="px-4 py-2.5 text-left font-medium">유형</th>
              <th className="px-4 py-2.5 text-right font-medium">취급액</th>
              <th className="px-4 py-2.5 text-right font-medium">매총</th>
              <th className="px-4 py-2.5 text-right font-medium">영업이익</th>
              <th className="px-4 py-2.5 text-right font-medium">이익률</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((prj) => (
              <tr key={prj.code} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="px-4 py-2.5 text-center">
                  {prj.rank <= 3 ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white">
                      {prj.rank}
                    </span>
                  ) : (
                    <span className="text-xs text-neutral-500">{prj.rank}</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <p className="font-medium text-neutral-900">{prj.name}</p>
                  <p className="text-xs text-neutral-400">{prj.code}</p>
                </td>
                <td className="px-4 py-2.5">
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">{prj.type}</span>
                </td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(prj.billing)}</td>
                <td className="px-4 py-2.5 text-right text-neutral-700">{krw(prj.grossProfit)}</td>
                <td className="px-4 py-2.5 text-right font-medium text-neutral-900">{krw(prj.operatingProfit)}</td>
                <td className="px-4 py-2.5 text-right">
                  <span
                    className={clsx(
                      "font-bold",
                      prj.profitRate >= 17 ? "text-green-600" : prj.profitRate >= 15 ? "text-neutral-700" : "text-red-500"
                    )}
                  >
                    {prj.profitRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top/Bottom Highlight */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-green-700">
            <Trophy size={12} />
            Top 프로젝트
          </div>
          <p className="text-sm font-bold text-neutral-900">{topProject.name}</p>
          <p className="text-xs text-neutral-600">
            취급액 {krw(topProject.billing)} / 이익률 {topProject.profitRate}%
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-red-600">
            <ArrowDown size={12} />
            Bottom 프로젝트
          </div>
          <p className="text-sm font-bold text-neutral-900">{bottomProject.name}</p>
          <p className="text-xs text-neutral-600">
            취급액 {krw(bottomProject.billing)} / 이익률 {bottomProject.profitRate}%
          </p>
        </div>
      </div>
    </div>
  );
}
