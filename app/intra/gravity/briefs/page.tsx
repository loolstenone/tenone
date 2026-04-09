"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface ContentBrief {
    id: string;
    product_id: string;
    product_name: string;
    client_name: string;
    title: string;
    situation_sentence: string;
    target_pain_category: string;
    content_type: string;
    status: string;
    created_at: string;
}

const STATUS_OPTIONS = ["전체", "pending", "draft", "published"];
const TYPE_OPTIONS = ["전체", "blog", "faq", "review_guide", "social", "landing"];

export default function GravityBriefsPage() {
    const supabase = createClient();
    const router = useRouter();

    const [briefs, setBriefs] = useState<ContentBrief[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("전체");
    const [typeFilter, setTypeFilter] = useState("전체");
    const [clientFilter, setClientFilter] = useState("전체");
    const [clients, setClients] = useState<string[]>([]);

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from("bg_content_briefs")
            .select(`
                id, product_id, title, situation_sentence,
                target_pain_category, content_type, status, created_at,
                bg_products(name, bg_clients(name))
            `)
            .order("created_at", { ascending: false });

        const mapped = (data ?? []).map((b: {
            id: string; product_id: string; title: string;
            situation_sentence: string; target_pain_category: string;
            content_type: string; status: string; created_at: string;
            bg_products: { name: string; bg_clients: { name: string } | null } | null;
        }) => ({
            id: b.id,
            product_id: b.product_id,
            product_name: b.bg_products?.name ?? "",
            client_name: b.bg_products?.bg_clients?.name ?? "",
            title: b.title,
            situation_sentence: b.situation_sentence,
            target_pain_category: b.target_pain_category,
            content_type: b.content_type,
            status: b.status,
            created_at: b.created_at,
        }));

        setBriefs(mapped);
        const uniqueClients: string[] = [...new Set(mapped.map((b: ContentBrief) => b.client_name).filter(Boolean))] as string[];
        setClients(uniqueClients);
        setLoading(false);
    }, [supabase]);

    useEffect(() => { load(); }, [load]);

    const filtered = briefs.filter(b => {
        if (statusFilter !== "전체" && b.status !== statusFilter) return false;
        if (typeFilter !== "전체" && b.content_type !== typeFilter) return false;
        if (clientFilter !== "전체" && b.client_name !== clientFilter) return false;
        return true;
    });

    const statusBadge = (s: string) => {
        if (s === "published") return "bg-emerald-100 text-emerald-600";
        if (s === "draft") return "bg-blue-100 text-blue-600";
        return "bg-neutral-100 text-neutral-500";
    };

    const statusLabel: Record<string, string> = {
        pending: "대기", draft: "작성중", published: "발행"
    };
    const typeLabel: Record<string, string> = {
        blog: "블로그", faq: "FAQ", review_guide: "리뷰 가이드",
        social: "소셜", landing: "랜딩"
    };

    // 통계
    const publishedCount = briefs.filter(b => b.status === "published").length;
    const draftCount = briefs.filter(b => b.status === "draft").length;
    const pendingCount = briefs.filter(b => b.status === "pending").length;

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <PageHeader
                title="콘텐츠 브리프"
                description="전체 클라이언트 AEO 콘텐츠 브리프 모아보기"
            >
                <button
                    onClick={() => router.push("/intra/gravity")}
                    className="text-xs border border-neutral-200 px-3 py-1.5 text-neutral-600 hover:border-neutral-400 transition-colors"
                >
                    ← 현황판
                </button>
            </PageHeader>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-5xl mx-auto space-y-5">

                    {/* 요약 */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: "전체", value: briefs.length, active: statusFilter === "전체", onClick: () => setStatusFilter("전체") },
                            { label: "발행", value: publishedCount, active: statusFilter === "published", onClick: () => setStatusFilter("published") },
                            { label: "작성중", value: draftCount, active: statusFilter === "draft", onClick: () => setStatusFilter("draft") },
                            { label: "대기", value: pendingCount, active: statusFilter === "pending", onClick: () => setStatusFilter("pending") },
                        ].map(s => (
                            <button
                                key={s.label}
                                onClick={s.onClick}
                                className={`p-4 text-left border transition-colors ${s.active ? "border-amber-300 bg-amber-50" : "border-neutral-200 bg-white hover:border-neutral-300"}`}
                            >
                                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">{s.label}</p>
                                <p className={`text-2xl font-semibold ${s.active ? "text-amber-600" : "text-neutral-900"}`}>{s.value}</p>
                            </button>
                        ))}
                    </div>

                    {/* 필터 */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">타입</span>
                            <div className="flex gap-1">
                                {TYPE_OPTIONS.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTypeFilter(t)}
                                        className={`text-[11px] px-2.5 py-1 border transition-colors ${typeFilter === t ? "border-amber-400 bg-amber-50 text-amber-700" : "border-neutral-200 text-neutral-500 hover:border-neutral-300"}`}
                                    >
                                        {typeLabel[t] ?? t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {clients.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">클라이언트</span>
                                <select
                                    value={clientFilter}
                                    onChange={e => setClientFilter(e.target.value)}
                                    className="text-[11px] border border-neutral-200 px-2 py-1 focus:outline-none focus:border-amber-400 bg-white text-neutral-600"
                                >
                                    <option>전체</option>
                                    {clients.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                        <span className="text-[11px] text-neutral-400 ml-auto">{filtered.length}개</span>
                    </div>

                    {/* 리스트 */}
                    {loading ? (
                        <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">로딩 중...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-neutral-200">
                            <FileText className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                            <p className="text-sm text-neutral-400">브리프가 없습니다</p>
                            <p className="text-xs text-neutral-300 mt-1">풀 스캔을 실행하면 콘텐츠 브리프가 자동 생성됩니다</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map(b => (
                                <div
                                    key={b.id}
                                    className="border border-neutral-200 bg-white hover:border-neutral-300 transition-colors"
                                >
                                    <div className="flex items-start gap-4 p-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusBadge(b.status)}`}>
                                                    {statusLabel[b.status] ?? b.status}
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">
                                                    {typeLabel[b.content_type] ?? b.content_type}
                                                </span>
                                                {b.target_pain_category && (
                                                    <span className="text-[10px] text-neutral-400">#{b.target_pain_category}</span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium text-neutral-900 mb-1 truncate">{b.title}</p>
                                            {b.situation_sentence && (
                                                <p className="text-xs text-neutral-500 italic line-clamp-1">"{b.situation_sentence}"</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] text-neutral-400">{b.client_name}</span>
                                                {b.product_name && (
                                                    <>
                                                        <span className="text-[10px] text-neutral-200">·</span>
                                                        <span className="text-[10px] text-neutral-400">{b.product_name}</span>
                                                    </>
                                                )}
                                                <span className="text-[10px] text-neutral-300 ml-auto">
                                                    {new Date(b.created_at).toLocaleDateString("ko-KR")}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => router.push(`/intra/gravity/${b.product_id}`)}
                                            className="text-neutral-300 hover:text-amber-500 transition-colors flex-shrink-0 mt-0.5"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
