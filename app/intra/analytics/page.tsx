"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";
import { BarChart3, Users, Eye, Clock, TrendingUp, TrendingDown, RefreshCw, Globe } from "lucide-react";
import Link from "next/link";

const BRAND_COLORS: Record<string, string> = {
  tenone: "#171717", madleague: "#E8845C", madleap: "#E8845C",
  badak: "#D85A30", smarcomm: "#BA7517", hero: "#5B8FB9",
  mindle: "#5B8FB9", myverse: "#9B7DD4", wio: "#7BAE7F",
  youinone: "#7BAE7F", rook: "#BA7517", montz: "#888780",
  townity: "#888780", scribble: "#888780", naturebox: "#888780",
  korea360: "#888780", seoul360: "#888780",
};

interface BrandSnapshot {
  brand_id: string;
  sessions: number;
  pageviews: number;
  users: number;
  bounce_rate: number;
  avg_session_duration: number;
  date: string;
}

interface UniverseSummary {
  total_sessions: number;
  total_pageviews: number;
  total_users: number;
  brands: BrandSnapshot[];
  synced_at: string | null;
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

export default function AnalyticsOverviewPage() {
  const [summary, setSummary] = useState<UniverseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const supabase = createClient();
    const since = new Date();
    since.setDate(since.getDate() - range);

    supabase
      .from("analytics_snapshots")
      .select("brand_id, sessions, pageviews, users, bounce_rate, avg_session_duration, date, synced_at")
      .gte("date", since.toISOString().split("T")[0])
      .order("date", { ascending: false })
      .then(({ data }) => {
        if (cancelled || !data) return;

        const byBrand: Record<string, BrandSnapshot> = {};
        let lastSync: string | null = null;

        for (const row of data) {
          if (!lastSync || row.synced_at > lastSync) lastSync = row.synced_at;
          if (!byBrand[row.brand_id]) {
            byBrand[row.brand_id] = { ...row, sessions: 0, pageviews: 0, users: 0, bounce_rate: 0, avg_session_duration: 0 };
          }
          byBrand[row.brand_id].sessions += row.sessions;
          byBrand[row.brand_id].pageviews += row.pageviews;
          byBrand[row.brand_id].users += row.users;
          byBrand[row.brand_id].bounce_rate = row.bounce_rate; // latest
          byBrand[row.brand_id].avg_session_duration = row.avg_session_duration;
        }

        const brands = Object.values(byBrand).sort((a, b) => b.sessions - a.sessions);
        setSummary({
          total_sessions: brands.reduce((s, b) => s + b.sessions, 0),
          total_pageviews: brands.reduce((s, b) => s + b.pageviews, 0),
          total_users: brands.reduce((s, b) => s + b.users, 0),
          brands,
          synced_at: lastSync,
        });
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [range]);

  const stats = summary
    ? [
        { label: "총 세션", value: fmt(summary.total_sessions), icon: <BarChart3 className="h-4 w-4" /> },
        { label: "총 페이지뷰", value: fmt(summary.total_pageviews), icon: <Eye className="h-4 w-4" /> },
        { label: "총 사용자", value: fmt(summary.total_users), icon: <Users className="h-4 w-4" /> },
        { label: "활성 브랜드", value: summary.brands.length, icon: <Globe className="h-4 w-4" /> },
      ]
    : [];

  const maxSessions = summary ? Math.max(...summary.brands.map((b) => b.sessions), 1) : 1;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Universe 전체 트래픽 현황">
        <div className="flex items-center gap-1 border border-neutral-200 rounded p-0.5">
          {[7, 14, 30].map((d) => (
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
          href="/intra/analytics/sync"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-neutral-200 text-neutral-600 hover:border-neutral-400 rounded transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          동기화
        </Link>
      </PageHeader>

      {/* 마지막 동기화 */}
      {summary?.synced_at && (
        <p className="text-[11px] text-neutral-400">
          마지막 동기화: {new Date(summary.synced_at).toLocaleString("ko-KR")}
        </p>
      )}

      {/* 미동기화 안내 */}
      {!loading && (!summary || summary.brands.length === 0) && (
        <div className="border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <BarChart3 className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-neutral-600">아직 동기화된 데이터가 없습니다</p>
          <p className="text-xs text-neutral-400 mt-1">
            GA4 서비스 계정을 연결하고 동기화를 실행해주세요.
          </p>
          <Link
            href="/intra/analytics/sync"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-neutral-900 text-white text-xs rounded"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            GA4 연결 및 동기화
          </Link>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-neutral-100 animate-pulse rounded" />
          ))}
        </div>
      )}

      {/* 요약 통계 */}
      {!loading && summary && summary.brands.length > 0 && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="border border-neutral-200 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-neutral-400">{s.label}</span>
                  <span className="text-neutral-300">{s.icon}</span>
                </div>
                <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
                <p className="text-[10px] text-neutral-400 mt-1">최근 {range}일</p>
              </div>
            ))}
          </div>

          {/* 브랜드별 세션 바 차트 */}
          <div className="border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold mb-5">브랜드별 세션</h3>
            <div className="space-y-3">
              {summary.brands.map((b) => (
                <Link key={b.brand_id} href={`/intra/analytics/brands/${b.brand_id}`} className="block group">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500 w-24 truncate shrink-0">{b.brand_id}</span>
                    <div className="flex-1 bg-neutral-100 h-5 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm transition-all"
                        style={{
                          width: `${(b.sessions / maxSessions) * 100}%`,
                          backgroundColor: BRAND_COLORS[b.brand_id] || "#888780",
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-neutral-700 w-14 text-right shrink-0">
                      {fmt(b.sessions)}
                    </span>
                    <span className="text-[10px] text-neutral-400 w-16 text-right shrink-0">
                      이탈 {b.bounce_rate.toFixed(0)}%
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 브랜드 상세 테이블 */}
          <div className="border border-neutral-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold">브랜드별 상세</h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="text-left px-6 py-3 text-neutral-500 font-medium">브랜드</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium">세션</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium">페이지뷰</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium">사용자</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium">이탈률</th>
                  <th className="text-right px-6 py-3 text-neutral-500 font-medium">평균 체류</th>
                </tr>
              </thead>
              <tbody>
                {summary.brands.map((b, i) => (
                  <tr key={b.brand_id} className={`border-b border-neutral-50 hover:bg-neutral-50 transition-colors ${i % 2 === 0 ? "" : "bg-neutral-50/30"}`}>
                    <td className="px-6 py-3">
                      <Link href={`/intra/analytics/brands/${b.brand_id}`} className="flex items-center gap-2 hover:underline">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: BRAND_COLORS[b.brand_id] || "#888780" }}
                        />
                        <span className="font-medium text-neutral-800">{b.brand_id}</span>
                      </Link>
                    </td>
                    <td className="text-right px-4 py-3 text-neutral-700">{fmt(b.sessions)}</td>
                    <td className="text-right px-4 py-3 text-neutral-700">{fmt(b.pageviews)}</td>
                    <td className="text-right px-4 py-3 text-neutral-700">{fmt(b.users)}</td>
                    <td className="text-right px-4 py-3">
                      <span className={b.bounce_rate > 60 ? "text-red-500" : "text-neutral-700"}>
                        {b.bounce_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right px-6 py-3 text-neutral-700">{fmtDuration(b.avg_session_duration)}</td>
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
