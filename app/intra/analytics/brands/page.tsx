"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";

const BRAND_COLORS: Record<string, string> = {
  tenone: "#171717", madleague: "#E8845C", madleap: "#E8845C",
  badak: "#D85A30", smarcomm: "#BA7517", hero: "#5B8FB9",
  mindle: "#5B8FB9", myverse: "#9B7DD4", wio: "#7BAE7F",
  youinone: "#7BAE7F", rook: "#BA7517", montz: "#888780",
  townity: "#888780", scribble: "#888780", naturebox: "#888780",
  korea360: "#888780", seoul360: "#888780",
};

function fmt(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

interface BrandSummary {
  brand_id: string;
  sessions: number;
  pageviews: number;
  users: number;
  bounce_rate: number;
  last_date: string;
}

export default function BrandsListPage() {
  const [brands, setBrands] = useState<BrandSummary[]>([]);
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
      .select("brand_id, sessions, pageviews, users, bounce_rate, date")
      .gte("date", since.toISOString().split("T")[0])
      .then(({ data }) => {
        if (cancelled || !data) return;

        const agg: Record<string, BrandSummary> = {};
        for (const row of data) {
          if (!agg[row.brand_id]) {
            agg[row.brand_id] = { brand_id: row.brand_id, sessions: 0, pageviews: 0, users: 0, bounce_rate: 0, last_date: row.date };
          }
          agg[row.brand_id].sessions += row.sessions;
          agg[row.brand_id].pageviews += row.pageviews;
          agg[row.brand_id].users += row.users;
          agg[row.brand_id].bounce_rate = row.bounce_rate;
          if (row.date > agg[row.brand_id].last_date) agg[row.brand_id].last_date = row.date;
        }

        setBrands(Object.values(agg).sort((a, b) => b.sessions - a.sessions));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [range]);

  return (
    <div className="space-y-6">
      <PageHeader title="브랜드별 Analytics" description="브랜드 사이트별 트래픽 현황">
        <div className="flex items-center gap-1 border border-neutral-200 rounded p-0.5">
          {[7, 14, 30, 90].map((d) => (
            <button key={d} onClick={() => setRange(d)}
              className={`px-3 py-1 text-xs rounded transition-colors ${range === d ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}>
              {d}일
            </button>
          ))}
        </div>
      </PageHeader>

      {!loading && brands.length === 0 && (
        <div className="border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
          <p className="text-sm text-neutral-500">데이터 없음</p>
          <Link href="/intra/analytics/sync" className="inline-flex items-center gap-1.5 mt-3 text-xs text-neutral-600 underline">
            <RefreshCw className="h-3 w-3" /> 동기화 실행
          </Link>
        </div>
      )}

      {!loading && brands.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map((b) => (
            <Link key={b.brand_id} href={`/intra/analytics/brands/${b.brand_id}`}
              className="border border-neutral-200 bg-white p-5 hover:border-neutral-400 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: BRAND_COLORS[b.brand_id] || "#888780" }} />
                  <span className="text-sm font-semibold text-neutral-800">{b.brand_id}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-neutral-400 mb-0.5">세션</p>
                  <p className="text-sm font-medium">{fmt(b.sessions)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 mb-0.5">사용자</p>
                  <p className="text-sm font-medium">{fmt(b.users)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 mb-0.5">이탈률</p>
                  <p className={`text-sm font-medium ${b.bounce_rate > 60 ? "text-red-500" : ""}`}>
                    {b.bounce_rate.toFixed(0)}%
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-neutral-400 mt-3">최근 데이터: {b.last_date}</p>
            </Link>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-100 animate-pulse rounded" />
          ))}
        </div>
      )}
    </div>
  );
}
