"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";
import { ArrowLeft, Eye, Users, Clock, TrendingDown } from "lucide-react";
import Link from "next/link";

interface DailySnapshot {
  date: string;
  sessions: number;
  pageviews: number;
  users: number;
  bounce_rate: number;
  avg_session_duration: number;
  top_pages: { path: string; views: number }[];
  traffic_sources: { source: string; sessions: number }[];
}

function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function BrandAnalyticsPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const [data, setData] = useState<DailySnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const supabase = createClient();
    const since = new Date();
    since.setDate(since.getDate() - range);

    supabase
      .from("analytics_snapshots")
      .select("date, sessions, pageviews, users, bounce_rate, avg_session_duration, top_pages, traffic_sources")
      .eq("brand_id", brandId)
      .gte("date", since.toISOString().split("T")[0])
      .order("date", { ascending: true })
      .then(({ data: rows }: { data: DailySnapshot[] | null }) => {
        if (cancelled) return;
        setData((rows ?? []) as DailySnapshot[]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [brandId, range]);

  const totals = data.reduce(
    (acc, d) => ({
      sessions: acc.sessions + d.sessions,
      pageviews: acc.pageviews + d.pageviews,
      users: acc.users + d.users,
    }),
    { sessions: 0, pageviews: 0, users: 0 }
  );

  const latest = data[data.length - 1];
  const maxSessions = Math.max(...data.map((d) => d.sessions), 1);

  // 상위 페이지 집계
  const pageAgg: Record<string, number> = {};
  for (const d of data) {
    for (const p of (d.top_pages || [])) {
      pageAgg[p.path] = (pageAgg[p.path] || 0) + p.views;
    }
  }
  const topPages = Object.entries(pageAgg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // 유입 소스 집계
  const srcAgg: Record<string, number> = {};
  for (const d of data) {
    for (const s of (d.traffic_sources || [])) {
      srcAgg[s.source] = (srcAgg[s.source] || 0) + s.sessions;
    }
  }
  const topSources = Object.entries(srcAgg).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxSrc = Math.max(...topSources.map((s) => s[1]), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title={brandId}
        description={`최근 ${range}일 트래픽 분석`}
      >
        <div className="flex items-center gap-1 border border-neutral-200 rounded p-0.5">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                range === d ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {d}일
            </button>
          ))}
        </div>
        <Link
          href="/intra/analytics"
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          전체
        </Link>
      </PageHeader>

      {/* 미동기화 */}
      {!loading && data.length === 0 && (
        <div className="border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <p className="text-sm text-neutral-500">이 브랜드의 데이터가 없습니다.</p>
          <p className="text-xs text-neutral-400 mt-1">동기화를 실행하면 GA4 데이터가 여기 표시됩니다.</p>
        </div>
      )}

      {/* 요약 */}
      {!loading && data.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "세션", value: fmt(totals.sessions) },
              { label: "페이지뷰", value: fmt(totals.pageviews) },
              { label: "사용자", value: fmt(totals.users) },
              { label: "이탈률", value: latest ? `${latest.bounce_rate.toFixed(1)}%` : "-" },
            ].map((s) => (
              <div key={s.label} className="border border-neutral-200 bg-white p-5">
                <p className="text-xs text-neutral-400 mb-3">{s.label}</p>
                <p className="text-2xl font-semibold">{s.value}</p>
                <p className="text-[10px] text-neutral-400 mt-1">최근 {range}일</p>
              </div>
            ))}
          </div>

          {/* 일별 세션 바 차트 */}
          <div className="border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold mb-5">일별 세션</h3>
            <div className="flex items-end gap-1 h-32">
              {data.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex items-end justify-center h-28">
                    <div
                      className="w-full bg-neutral-800 rounded-t-sm transition-all group-hover:bg-neutral-600"
                      style={{ height: `${(d.sessions / maxSessions) * 100}%`, minHeight: "2px" }}
                      title={`${d.date}: ${d.sessions} 세션`}
                    />
                  </div>
                  {data.length <= 14 && (
                    <span className="text-[9px] text-neutral-400 rotate-0">{d.date.slice(5)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 상위 페이지 + 유입 소스 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-neutral-200 bg-white p-6">
              <h3 className="text-sm font-semibold mb-4">상위 페이지</h3>
              {topPages.length === 0 ? (
                <p className="text-xs text-neutral-400">데이터 없음</p>
              ) : (
                <div className="space-y-2">
                  {topPages.map(([path, views]) => (
                    <div key={path} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-neutral-600 truncate flex-1">{path || "/"}</span>
                      <span className="text-xs font-medium text-neutral-800 shrink-0">{fmt(views)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-neutral-200 bg-white p-6">
              <h3 className="text-sm font-semibold mb-4">유입 소스</h3>
              {topSources.length === 0 ? (
                <p className="text-xs text-neutral-400">데이터 없음</p>
              ) : (
                <div className="space-y-2.5">
                  {topSources.map(([src, cnt]) => (
                    <div key={src}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs text-neutral-600">{src}</span>
                        <span className="text-xs font-medium text-neutral-800">{fmt(cnt)}</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-800 rounded-full"
                          style={{ width: `${(cnt / maxSrc) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 일별 상세 테이블 */}
          <div className="border border-neutral-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold">일별 상세</h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="text-left px-6 py-3 text-neutral-500 font-medium">날짜</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium">세션</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium">페이지뷰</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium">사용자</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium">이탈률</th>
                  <th className="text-right px-6 py-3 text-neutral-500 font-medium">평균 체류</th>
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map((d) => (
                  <tr key={d.date} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-2.5 text-neutral-700">{d.date}</td>
                    <td className="text-right px-4 py-2.5 text-neutral-700">{fmt(d.sessions)}</td>
                    <td className="text-right px-4 py-2.5 text-neutral-700">{fmt(d.pageviews)}</td>
                    <td className="text-right px-4 py-2.5 text-neutral-700">{fmt(d.users)}</td>
                    <td className="text-right px-4 py-2.5">
                      <span className={d.bounce_rate > 60 ? "text-red-500" : "text-neutral-700"}>
                        {d.bounce_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right px-6 py-2.5 text-neutral-700">{fmtDuration(d.avg_session_duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
