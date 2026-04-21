"use client";

/**
 * Whole See — 크롤링 상태
 * 웹 크롤러·뉴스레터 수신봇·소셜 스크래퍼 상태 모니터링
 */

import { useEffect, useState } from "react";
import { Activity, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface CrawlerRow {
    id: string;
    crawler_name: string;
    status: string;
    last_run: string | null;
    last_count: number | null;
    error_message: string | null;
    updated_at: string;
}

function rel(dateStr: string | null): string {
    if (!dateStr) return "-";
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (d < 1) return "방금 전";
    if (d < 60) return `${d}분 전`;
    const h = Math.floor(d / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

export default function CrawlingPage() {
    const [rows, setRows] = useState<CrawlerRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const { data } = await sb.from("crawler_status").select("*").order("updated_at", { ascending: false });
            setRows(data ?? []);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    const OK_STATUSES = ["ok", "running", "success", "active"];
    const ERROR_STATUSES = ["error", "failed"];
    const statusCount = {
        ok: rows.filter(r => OK_STATUSES.includes(r.status)).length,
        error: rows.filter(r => ERROR_STATUSES.includes(r.status)).length,
        idle: rows.filter(r => !OK_STATUSES.includes(r.status) && !ERROR_STATUSES.includes(r.status)).length,
    };

    return (
        <div className="space-y-6">
            <PageHeader title="크롤링" description="Whole See 크롤러 · 뉴스레터 봇 · 소셜 스크래퍼 모니터링" />

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-[11px] text-neutral-500">정상</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">{statusCount.ok}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                        <span className="text-[11px] text-neutral-500">오류</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">{statusCount.error}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-neutral-500" />
                        <span className="text-[11px] text-neutral-500">대기</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">{statusCount.idle}</p>
                </div>
            </div>

            {/* Crawler List */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-neutral-500" />
                    크롤러 목록 ({rows.length})
                </h2>
                {rows.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-8 text-center text-xs text-neutral-400">
                        등록된 크롤러가 없습니다.
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">크롤러</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">최근 수집</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">최근 실행</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">오류</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                        <td className="px-3 py-2 font-medium text-neutral-900">{r.crawler_name}</td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                                OK_STATUSES.includes(r.status) ? "bg-emerald-100 text-emerald-700" :
                                                ERROR_STATUSES.includes(r.status) ? "bg-rose-100 text-rose-700" :
                                                "bg-neutral-100 text-neutral-600"
                                            }`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right text-neutral-700">{r.last_count?.toLocaleString() ?? "-"}</td>
                                        <td className="px-3 py-2 text-right text-neutral-500">{rel(r.last_run)}</td>
                                        <td className="px-3 py-2 text-rose-600 text-[10px] truncate max-w-[240px]">{r.error_message || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
