"use client";

/**
 * Whole See — 뉴스레터 수집 (외부 수집)
 *
 * deepdirectdrill@gmail.com 같은 Gmail 계정으로 받은 외부 뉴스레터를
 * Whole See가 자동 수집해 트렌드 원천으로 활용.
 *
 * ⚠️ UMS의 뉴스레터(Mindle 발행물)와는 다른 개념.
 *   - 이 페이지 = 외부에서 받는(수신) 뉴스레터
 *   - UMS 뉴스레터 = Mindle이 독자에게 보내는(발송) 뉴스레터
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Mail, Inbox, Loader2, CheckCircle2, AlertCircle, ExternalLink,
    Sparkles, RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface GmailAccount {
    id: string;
    email: string;
    is_active: boolean;
    label: string | null;
    expiry_date: number | null;
    created_at: string;
    updated_at: string;
}

interface NewsletterSource {
    id: string;
    name: string;
    url: string;
    is_active: boolean;
    last_crawled_at: string | null;
    crawl_count: number;
    error_count: number;
    crawl_interval_hours: number;
}

interface CollectedNewsletter {
    id: string;
    title: string;
    author: string | null;
    source_name: string | null;
    collected_at: string;
    status: string;
    category: string | null;
}

function rel(dateStr: string | null): string {
    if (!dateStr) return "미수집";
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (d < 1) return "방금 전";
    if (d < 60) return `${d}분 전`;
    const h = Math.floor(d / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

export default function WholeSeeNewsletterPage() {
    const [loading, setLoading] = useState(true);
    const [gmails, setGmails] = useState<GmailAccount[]>([]);
    const [sources, setSources] = useState<NewsletterSource[]>([]);
    const [collected, setCollected] = useState<CollectedNewsletter[]>([]);
    const [collectedCount, setCollectedCount] = useState(0);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const [gRes, sRes, cRes, cntRes] = await Promise.all([
                sb.from("gmail_oauth_tokens").select("*").order("updated_at", { ascending: false }),
                sb.from("mindle_sources").select("*").eq("source_type", "newsletter").order("last_crawled_at", { ascending: false, nullsFirst: false }),
                sb.from("collected_data").select("id, title, author, source_name, collected_at, status, category")
                    .eq("source_type", "newsletter").order("collected_at", { ascending: false }).limit(20),
                sb.from("collected_data").select("*", { count: "exact", head: true }).eq("source_type", "newsletter"),
            ]);
            setGmails(gRes.data ?? []);
            setSources(sRes.data ?? []);
            setCollected(cRes.data ?? []);
            setCollectedCount(cntRes.count ?? 0);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    const activeSourceCount = sources.filter(s => s.is_active).length;
    const totalCrawls = sources.reduce((s, r) => s + (r.crawl_count || 0), 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title="뉴스레터 수집"
                description="외부에서 받는 뉴스레터를 Gmail로 자동 수신 → Whole See 트렌드 원천으로 활용"
            />

            {/* 구분 안내 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 leading-relaxed">
                    <strong>수신 현황 모니터링 페이지입니다.</strong> 소스 추가·수정·검증은 <Link href="/intra/ums/external/sources" className="underline font-semibold">UMS &gt; 외부 리소스</Link>에서,
                    Mindle이 독자에게 <strong>발송</strong>하는 뉴스레터는 <Link href="/intra/ums/newsletter/issues" className="underline font-semibold">UMS 뉴스레터 이슈 관리</Link>에서.
                </p>
            </div>

            {/* 수집 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="text-[11px] text-neutral-500">Gmail 계정</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">{gmails.filter(g => g.is_active).length} / {gmails.length}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">활성 / 전체</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Inbox className="h-4 w-4 text-emerald-600" />
                        <span className="text-[11px] text-neutral-500">뉴스레터 소스</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">{activeSourceCount} / {sources.length}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">활성 / 전체</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-amber-600" />
                        <span className="text-[11px] text-neutral-500">수집 건수 (누적)</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">{collectedCount.toLocaleString()}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">collected_data</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <RefreshCw className="h-4 w-4 text-violet-600" />
                        <span className="text-[11px] text-neutral-500">크롤 실행 수</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">{totalCrawls.toLocaleString()}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">소스별 누적</p>
                </div>
            </div>

            {/* Gmail 계정 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    연결된 Gmail 계정
                </h2>
                {gmails.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">
                        연결된 Gmail 계정이 없습니다. <Link href="/api/auth/gmail/authorize" className="text-blue-600 underline">Gmail 연결하기</Link>
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">이메일</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">라벨</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">토큰 만료</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">최근 갱신</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gmails.map(g => (
                                    <tr key={g.id} className="border-b border-neutral-100 last:border-0">
                                        <td className="px-3 py-2 font-medium text-neutral-900">{g.email}</td>
                                        <td className="px-3 py-2 text-neutral-600">{g.label || "-"}</td>
                                        <td className="px-3 py-2">
                                            {g.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-700 text-[10px]">
                                                    <CheckCircle2 className="h-3 w-3" /> 활성
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-neutral-400 text-[10px]">비활성</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-right text-neutral-500">
                                            {g.expiry_date ? new Date(g.expiry_date).toLocaleDateString() : "-"}
                                        </td>
                                        <td className="px-3 py-2 text-right text-neutral-500">{rel(g.updated_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 뉴스레터 소스 */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                        <Inbox className="h-4 w-4 text-emerald-500" />
                        등록된 뉴스레터 소스
                    </h2>
                    <Link href="/intra/intel/wholesee/sources" className="text-[11px] text-neutral-500 hover:text-neutral-800">
                        전체 소스 관리 →
                    </Link>
                </div>
                {sources.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">
                        등록된 뉴스레터 소스가 없습니다.
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">소스</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">URL</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">크롤 수</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">오류</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">최근 수집</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sources.map(s => (
                                    <tr key={s.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                        <td className="px-3 py-2 font-medium text-neutral-900">{s.name}</td>
                                        <td className="px-3 py-2 text-neutral-500 truncate max-w-[280px]">{s.url}</td>
                                        <td className="px-3 py-2">
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                                                {s.is_active ? "활성" : "정지"}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right text-neutral-700">{s.crawl_count}</td>
                                        <td className={`px-3 py-2 text-right ${s.error_count > 0 ? "text-rose-600" : "text-neutral-400"}`}>{s.error_count}</td>
                                        <td className="px-3 py-2 text-right text-neutral-500">{rel(s.last_crawled_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 최근 수집물 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    최근 수집된 뉴스레터 ({collectedCount.toLocaleString()}건 중 최신 20)
                </h2>
                {collected.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">
                        아직 수집된 뉴스레터가 없습니다. Cron이 Gmail을 폴링하면 여기에 쌓입니다.
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                        {collected.map(c => (
                            <div key={c.id} className="px-3 py-2 flex items-center gap-3 text-xs">
                                {c.category && (
                                    <span className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-semibold">{c.category}</span>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-neutral-800 truncate">{c.title}</p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">
                                        {c.author || "?"} · {c.source_name || "?"}
                                    </p>
                                </div>
                                <span className="text-[10px] text-neutral-500 shrink-0">{rel(c.collected_at)}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                                    c.status === "processed" ? "bg-emerald-100 text-emerald-700" :
                                    c.status === "pending" ? "bg-neutral-100 text-neutral-600" :
                                    "bg-amber-100 text-amber-700"
                                }`}>
                                    {c.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
