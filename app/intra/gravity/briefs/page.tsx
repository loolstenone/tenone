"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText, ExternalLink, CheckCircle, Clock } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface VoiceBrief {
    id: string;
    product_id: string;
    product_name: string;
    client_name: string;
    content_type: string;
    target_pattern: string | null;
    title_suggestion: string | null;
    key_messages: string[] | null;
    target_ai: string[] | null;
    priority: number;
    why: string | null;
    status: string;
    created_at: string;
}

const CONTENT_TYPE_KO: Record<string, string> = {
    blog: "블로그",
    faq: "FAQ",
    comparison: "비교 콘텐츠",
    case_study: "케이스 스터디",
    reddit_post: "커뮤니티 포스트",
    youtube_script: "유튜브 스크립트",
    landing_page: "랜딩 페이지",
};

const AI_LABELS: Record<string, string> = {
    claude: "Claude",
    chatgpt: "ChatGPT",
    gemini: "Gemini",
    perplexity: "Perplexity",
    copilot: "Copilot",
};

const TYPE_OPTIONS = ["전체", "blog", "faq", "comparison", "case_study", "reddit_post", "youtube_script", "landing_page"];

export default function GravityBriefsPage() {
    const supabase = createClient();
    const router = useRouter();

    const [briefs, setBriefs] = useState<VoiceBrief[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("전체");
    const [typeFilter, setTypeFilter] = useState("전체");
    const [clientFilter, setClientFilter] = useState("전체");
    const [clients, setClients] = useState<string[]>([]);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from("bg_voice_briefs")
            .select(`
                id, product_id, content_type, target_pattern,
                title_suggestion, key_messages, target_ai,
                priority, why, status, created_at,
                bg_products(name, bg_clients(name))
            `)
            .order("priority", { ascending: true })
            .order("created_at", { ascending: false });

        const mapped = (data ?? []).map((b: {
            id: string; product_id: string; content_type: string;
            target_pattern: string | null; title_suggestion: string | null;
            key_messages: string[] | null; target_ai: string[] | null;
            priority: number; why: string | null; status: string; created_at: string;
            bg_products: { name: string; bg_clients: { name: string } | null } | null;
        }) => ({
            id: b.id,
            product_id: b.product_id,
            product_name: b.bg_products?.name ?? "",
            client_name: b.bg_products?.bg_clients?.name ?? "",
            content_type: b.content_type,
            target_pattern: b.target_pattern,
            title_suggestion: b.title_suggestion,
            key_messages: b.key_messages,
            target_ai: b.target_ai,
            priority: b.priority,
            why: b.why,
            status: b.status,
            created_at: b.created_at,
        }));

        setBriefs(mapped);
        const uniqueClients: string[] = [...new Set(
            mapped.map((b: VoiceBrief) => b.client_name).filter(Boolean)
        )] as string[];
        setClients(uniqueClients);
        setLoading(false);
    }, [supabase]);

    useEffect(() => { load(); }, [load]);

    const approve = async (id: string) => {
        setApprovingId(id);
        await supabase
            .from("bg_voice_briefs")
            .update({ status: "approved" })
            .eq("id", id);
        setBriefs(prev => prev.map(b => b.id === id ? { ...b, status: "approved" } : b));
        setApprovingId(null);
    };

    const filtered = briefs.filter(b => {
        if (statusFilter !== "전체" && b.status !== statusFilter) return false;
        if (typeFilter !== "전체" && b.content_type !== typeFilter) return false;
        if (clientFilter !== "전체" && b.client_name !== clientFilter) return false;
        return true;
    });

    const totalCount = briefs.length;
    const draftCount = briefs.filter(b => b.status === "draft").length;
    const approvedCount = briefs.filter(b => b.status === "approved").length;

    const priorityLabel = (p: number) => {
        if (p === 1) return { text: "즉시 실행", cls: "bg-red-100 text-red-600" };
        if (p === 2) return { text: "단기", cls: "bg-amber-100 text-amber-600" };
        return { text: "장기", cls: "bg-neutral-100 text-neutral-500" };
    };

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <PageHeader
                title="콘텐츠 브리프"
                description="AEO 처방 콘텐츠 브리프 — 검수 후 클라이언트 납품"
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

                    {/* 요약 탭 */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "전체", value: totalCount, key: "전체" },
                            { label: "검수 대기", value: draftCount, key: "draft" },
                            { label: "승인 완료", value: approvedCount, key: "approved" },
                        ].map(s => (
                            <button
                                key={s.key}
                                onClick={() => setStatusFilter(s.key)}
                                className={`p-4 text-left border transition-colors ${statusFilter === s.key ? "border-amber-300 bg-amber-50" : "border-neutral-200 bg-white hover:border-neutral-300"}`}
                            >
                                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">{s.label}</p>
                                <p className={`text-2xl font-semibold ${statusFilter === s.key ? "text-amber-600" : "text-neutral-900"}`}>{s.value}</p>
                            </button>
                        ))}
                    </div>

                    {/* 필터 */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-neutral-400 uppercase tracking-wider">타입</span>
                            <div className="flex gap-1 flex-wrap">
                                {TYPE_OPTIONS.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTypeFilter(t)}
                                        className={`text-[11px] px-2.5 py-1 border transition-colors ${typeFilter === t ? "border-amber-400 bg-amber-50 text-amber-700" : "border-neutral-200 text-neutral-500 hover:border-neutral-300"}`}
                                    >
                                        {CONTENT_TYPE_KO[t] ?? t}
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

                    {/* 브리프 리스트 */}
                    {loading ? (
                        <div className="flex items-center justify-center h-32 text-neutral-400 text-sm">로딩 중...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-neutral-200">
                            <FileText className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                            <p className="text-sm text-neutral-400">브리프가 없습니다</p>
                            <p className="text-xs text-neutral-300 mt-1">풀 스캔 → voice 단계를 실행하면 AEO 콘텐츠 브리프가 자동 생성됩니다</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map((b, i) => {
                                const pri = priorityLabel(b.priority);
                                const isApproved = b.status === "approved";
                                return (
                                    <div
                                        key={b.id}
                                        className={`border bg-white transition-colors ${isApproved ? "border-emerald-200" : "border-neutral-200 hover:border-neutral-300"}`}
                                    >
                                        <div className="p-4">
                                            {/* 헤더 행 */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[10px] font-mono text-neutral-300">{String(i + 1).padStart(2, "0")}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">
                                                        {CONTENT_TYPE_KO[b.content_type] ?? b.content_type}
                                                    </span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 ${pri.cls}`}>{pri.text}</span>
                                                    {isApproved ? (
                                                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600">
                                                            <CheckCircle className="w-3 h-3" />승인
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-400">
                                                            <Clock className="w-3 h-3" />검수 대기
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {b.target_ai && b.target_ai.length > 0 && (
                                                        <div className="flex gap-1">
                                                            {b.target_ai.map(ai => (
                                                                <span key={ai} className="text-[9px] px-1 py-0.5 bg-blue-50 text-blue-500">
                                                                    {AI_LABELS[ai] ?? ai}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* 제목 */}
                                            {b.title_suggestion && (
                                                <p className="text-sm font-semibold text-neutral-800 mb-2">
                                                    &ldquo;{b.title_suggestion}&rdquo;
                                                </p>
                                            )}

                                            {/* 공략 패턴 */}
                                            {b.target_pattern && (
                                                <div className="mb-2">
                                                    <span className="text-[10px] text-neutral-400">공략 패턴: </span>
                                                    <span className="text-[11px] text-neutral-600 italic">&ldquo;{b.target_pattern}&rdquo;</span>
                                                </div>
                                            )}

                                            {/* Why */}
                                            {b.why && (
                                                <div className="mb-2 pl-2 border-l-2 border-amber-200">
                                                    <p className="text-[11px] text-amber-700">{b.why}</p>
                                                </div>
                                            )}

                                            {/* 핵심 메시지 */}
                                            {b.key_messages && b.key_messages.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-[10px] text-neutral-400 mb-1">AI가 인용할 핵심 메시지</p>
                                                    <ul className="space-y-0.5">
                                                        {b.key_messages.map((msg, mi) => (
                                                            <li key={mi} className="flex gap-1.5 text-[11px] text-neutral-600">
                                                                <span className="text-amber-400 shrink-0">·</span>
                                                                <span>{msg}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* 푸터 행 */}
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                                                <div className="flex items-center gap-2">
                                                    {b.client_name && (
                                                        <span className="text-[10px] text-neutral-500 font-medium">{b.client_name}</span>
                                                    )}
                                                    {b.product_name && (
                                                        <>
                                                            <span className="text-[10px] text-neutral-300">·</span>
                                                            <span className="text-[10px] text-neutral-400">{b.product_name}</span>
                                                        </>
                                                    )}
                                                    <span className="text-[10px] text-neutral-300">
                                                        {new Date(b.created_at).toLocaleDateString("ko-KR")}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!isApproved && (
                                                        <button
                                                            onClick={() => approve(b.id)}
                                                            disabled={approvingId === b.id}
                                                            className="text-[11px] px-3 py-1 bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            {approvingId === b.id ? "처리 중..." : "승인"}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => router.push(`/intra/gravity/${b.product_id}`)}
                                                        className="text-neutral-300 hover:text-amber-500 transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
