"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, PlayCircle, ChevronDown, ChevronUp, Target, Radar, PenTool, ExternalLink, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

/* ── 타입 ── */
interface Product {
    id: string;
    product_name: string;
    brand_name: string;
    category: string;
    created_at: string;
}

interface GravityScore {
    gravity_score: number;
    mention_score: number;
    rank_score: number;
    coverage_score: number;
    scan_date: string;
    gap_summary: {
        top_gaps?: string[];
        quick_wins?: string[];
        brand_mention_rate?: number;
        avg_rank?: number;
    } | null;
}

interface QuestionPattern {
    id: string;
    pattern_text: string;
    cluster_label: string;
    frequency: number;
    priority: number;
}

interface SourceTrace {
    source_type: string;
    source_name: string | null;
    brand_beneficiary: string | null;
    is_own_brand: boolean;
}

interface VoiceBrief {
    id: string;
    content_type: string;
    target_pattern: string | null;
    title_suggestion: string | null;
    key_messages: string[];
    target_ai: string[];
    priority: number;
    status: string;
}

type RunStep = { step: string; ok: boolean; detail?: string };

/* ── 메인 ── */
export default function GravityPage() {
    const supabase = createClient();

    const [products, setProducts] = useState<Product[]>([]);
    const [scores, setScores] = useState<Record<string, GravityScore>>({});
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [patterns, setPatterns] = useState<QuestionPattern[]>([]);
    const [sources, setSources] = useState<SourceTrace[]>([]);
    const [briefs, setBriefs] = useState<VoiceBrief[]>([]);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState<string | null>(null);
    const [runLog, setRunLog] = useState<RunStep[]>([]);
    const [expandedSection, setExpandedSection] = useState<string | null>("briefs");

    /* ── 데이터 로드 ── */
    const loadProducts = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from("bg_products")
            .select("id, product_name, brand_name, category, created_at")
            .order("created_at", { ascending: false });
        setProducts(data ?? []);

        // 최신 gravity score 조회
        if (data && data.length > 0) {
            const scoreMap: Record<string, GravityScore> = {};
            for (const p of data) {
                const { data: s } = await supabase
                    .from("bg_gravity_scores")
                    .select("gravity_score, mention_score, rank_score, coverage_score, scan_date, gap_summary")
                    .eq("product_id", p.id)
                    .order("scan_date", { ascending: false })
                    .limit(1)
                    .single();
                if (s) scoreMap[p.id] = s;
            }
            setScores(scoreMap);
            if (!selectedId && data.length > 0) setSelectedId(data[0].id);
        }
        setLoading(false);
    }, [supabase, selectedId]);

    const loadDetail = useCallback(async (productId: string) => {
        const [{ data: pts }, { data: srcs }, { data: bfs }] = await Promise.all([
            supabase
                .from("bg_question_patterns")
                .select("id, pattern_text, cluster_label, frequency, priority")
                .eq("product_id", productId)
                .order("priority", { ascending: true })
                .limit(10),
            supabase
                .from("bg_source_traces")
                .select("source_type, source_name, brand_beneficiary, is_own_brand")
                .eq("product_id", productId),
            supabase
                .from("bg_voice_briefs")
                .select("id, content_type, target_pattern, title_suggestion, key_messages, target_ai, priority, status")
                .eq("product_id", productId)
                .order("priority", { ascending: true }),
        ]);
        setPatterns(pts ?? []);
        setSources(srcs ?? []);
        setBriefs(bfs ?? []);
    }, [supabase]);

    useEffect(() => { loadProducts(); }, []);

    useEffect(() => {
        if (selectedId) loadDetail(selectedId);
    }, [selectedId, loadDetail]);

    /* ── 스캔 실행 ── */
    const runFullScan = async (product: Product) => {
        setRunning(product.id);
        setRunLog([]);

        const log = (step: string, ok: boolean, detail?: string) => {
            setRunLog(prev => [...prev, { step, ok, detail }]);
        };

        try {
            // 1. Pain classification (기존 리뷰가 있으면)
            const res1 = await fetch("/api/gravity/pain/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id }),
            });
            const d1 = await res1.json();
            log("Pain Classifier", res1.ok, d1.processed ? `${d1.processed}개 처리` : d1.message);

            // 2. Question Mapper
            const res2 = await fetch("/api/gravity/question/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id }),
            });
            const d2 = await res2.json();
            log("Question Mapper", res2.ok, d2.patterns ? `${d2.patterns}개 패턴` : d2.message);

            // 3. AI Prober
            const res3 = await fetch("/api/gravity/probe/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id, brand_name: product.brand_name }),
            });
            const d3 = await res3.json();
            log("AI Prober", res3.ok, d3.probed ? `${d3.probed}개 프로브` : d3.message);

            // 4. Gap Analyzer + Score Tracker (scan/run)
            const res4 = await fetch("/api/gravity/scan/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id, brand_name: product.brand_name }),
            });
            const d4 = await res4.json();
            log("Gap Analyzer + Score Tracker", res4.ok, d4.result?.gravity_score != null ? `Gravity Score: ${d4.result.gravity_score}` : d4.error);

            // 5. Source Tracer
            const res5 = await fetch("/api/gravity/source/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id, brand_name: product.brand_name }),
            });
            const d5 = await res5.json();
            log("Source Tracer", res5.ok, d5.total_sources ? `${d5.total_sources}개 소스` : d5.message);

            // 6. Voice Designer
            const res6 = await fetch("/api/gravity/voice/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id, brand_name: product.brand_name }),
            });
            const d6 = await res6.json();
            log("Voice Designer", res6.ok, d6.briefs_generated ? `${d6.briefs_generated}개 브리프 생성` : d6.error);

        } catch (e) {
            log("오류", false, String(e));
        }

        setRunning(null);
        await loadProducts();
        if (selectedId === product.id) await loadDetail(product.id);
    };

    /* ── 소스 집계 ── */
    const sourceTypeMap = sources.reduce<Record<string, number>>((acc, s) => {
        acc[s.source_type] = (acc[s.source_type] ?? 0) + 1;
        return acc;
    }, {});

    const brandBeneficiaryMap = sources.reduce<Record<string, number>>((acc, s) => {
        if (s.brand_beneficiary) acc[s.brand_beneficiary] = (acc[s.brand_beneficiary] ?? 0) + 1;
        return acc;
    }, {});

    const selectedProduct = products.find(p => p.id === selectedId);
    const selectedScore = selectedId ? scores[selectedId] : null;

    /* ── 스코어 색상 ── */
    const scoreColor = (score: number) => {
        if (score >= 60) return "text-green-400";
        if (score >= 30) return "text-amber-400";
        return "text-red-400";
    };

    const contentTypeLabel: Record<string, string> = {
        blog: "블로그", faq: "FAQ", comparison: "비교글",
        case_study: "케이스 스터디", reddit_post: "Reddit", youtube_script: "유튜브", landing_page: "랜딩페이지",
    };

    /* ── UI ── */
    return (
        <div className="flex-1 flex flex-col min-h-0">
            <PageHeader
                title="Brand Gravity"
                description="AI 추천 브랜드 노출 분석 · AEO 콘텐츠 전략"
            />

            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-neutral-500 text-sm">로딩 중...</div>
                ) : (
                    <div className="max-w-6xl mx-auto space-y-6">

                        {/* 제품 목록 */}
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map(p => {
                                const s = scores[p.id];
                                const isSelected = selectedId === p.id;
                                const isRunning = running === p.id;
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedId(p.id)}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-amber-500/50 bg-amber-500/5" : "border-neutral-800 hover:border-neutral-700 bg-neutral-900"}`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="text-sm font-semibold text-white">{p.brand_name}</p>
                                                <p className="text-xs text-neutral-500">{p.product_name}</p>
                                            </div>
                                            {s && (
                                                <span className={`text-2xl font-bold font-mono ${scoreColor(s.gravity_score)}`}>
                                                    {s.gravity_score}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-neutral-600">
                                                {s ? new Date(s.scan_date).toLocaleDateString("ko-KR") : "미스캔"}
                                            </span>
                                            <button
                                                onClick={e => { e.stopPropagation(); runFullScan(p); }}
                                                disabled={!!running}
                                                className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-amber-500 text-black font-bold rounded hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                            >
                                                {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <PlayCircle className="w-3 h-3" />}
                                                {isRunning ? "스캔 중..." : "스캔"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 실행 로그 */}
                        {runLog.length > 0 && (
                            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                                <p className="text-xs font-semibold text-neutral-400 mb-3">실행 로그</p>
                                <div className="space-y-1.5">
                                    {runLog.map((r, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            {r.ok
                                                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                                : <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                            }
                                            <span className="text-neutral-300 font-medium w-40 shrink-0">{r.step}</span>
                                            <span className="text-neutral-500">{r.detail}</span>
                                        </div>
                                    ))}
                                    {running && (
                                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                                            <Clock className="w-3.5 h-3.5 animate-spin" />
                                            실행 중...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 상세 리포트 */}
                        {selectedProduct && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-2 border-b border-neutral-800">
                                    <h2 className="text-base font-bold text-white">{selectedProduct.brand_name} 리포트</h2>
                                    <a
                                        href={`/brandgravity`}
                                        target="_blank"
                                        className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white transition"
                                    >
                                        <ExternalLink className="w-3 h-3" /> 사이트
                                    </a>
                                </div>

                                {/* Gravity Score 카드 */}
                                {selectedScore ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { label: "Gravity Score", value: selectedScore.gravity_score, suffix: "", max: 100 },
                                            { label: "Mention Score", value: selectedScore.mention_score, suffix: "", max: 40 },
                                            { label: "Rank Score", value: selectedScore.rank_score, suffix: "", max: 30 },
                                            { label: "Coverage Score", value: selectedScore.coverage_score, suffix: "", max: 30 },
                                        ].map(m => (
                                            <div key={m.label} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                                                <p className="text-[10px] text-neutral-500 mb-1">{m.label}</p>
                                                <p className={`text-2xl font-bold font-mono ${scoreColor(m.value)}`}>{m.value}</p>
                                                <p className="text-[10px] text-neutral-700">/ {m.max}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-sm text-neutral-500">
                                        스캔 결과 없음 — 스캔을 실행하세요
                                    </div>
                                )}

                                {/* Top Gaps */}
                                {selectedScore?.gap_summary?.top_gaps && selectedScore.gap_summary.top_gaps.length > 0 && (
                                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                                        <p className="text-xs font-semibold text-red-400 mb-2">주요 갭 (AI에 없는 이유)</p>
                                        <ul className="space-y-1">
                                            {selectedScore.gap_summary.top_gaps.map((g, i) => (
                                                <li key={i} className="text-xs text-neutral-300 flex gap-2">
                                                    <span className="text-red-500 flex-shrink-0">•</span>{g}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Quick Wins */}
                                {selectedScore?.gap_summary?.quick_wins && selectedScore.gap_summary.quick_wins.length > 0 && (
                                    <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                                        <p className="text-xs font-semibold text-green-400 mb-2">Quick Wins (즉시 실행 가능)</p>
                                        <ul className="space-y-1">
                                            {selectedScore.gap_summary.quick_wins.map((w, i) => (
                                                <li key={i} className="text-xs text-neutral-300 flex gap-2">
                                                    <span className="text-green-500 flex-shrink-0">→</span>{w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Voice Briefs */}
                                <Accordion
                                    title="AEO 콘텐츠 브리프"
                                    icon={<PenTool className="w-4 h-4 text-amber-500" />}
                                    count={briefs.length}
                                    open={expandedSection === "briefs"}
                                    onToggle={() => setExpandedSection(prev => prev === "briefs" ? null : "briefs")}
                                >
                                    <div className="space-y-3">
                                        {briefs.length === 0 ? (
                                            <p className="text-xs text-neutral-500 text-center py-4">브리프 없음 — 스캔 후 Voice Designer 실행</p>
                                        ) : briefs.map(b => (
                                            <div key={b.id} className="p-4 border border-neutral-800 rounded-xl hover:border-neutral-700 transition">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${b.priority === 1 ? "bg-amber-500/20 text-amber-400" : "bg-neutral-800 text-neutral-500"}`}>
                                                            P{b.priority}
                                                        </span>
                                                        <span className="text-[10px] px-2 py-0.5 bg-neutral-800 rounded text-neutral-400">
                                                            {contentTypeLabel[b.content_type] ?? b.content_type}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {b.target_ai.map(ai => (
                                                            <span key={ai} className="text-[9px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">{ai}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-sm font-semibold text-white mb-2">{b.title_suggestion}</p>
                                                {b.target_pattern && (
                                                    <p className="text-[11px] text-neutral-500 mb-2">공략 패턴: {b.target_pattern}</p>
                                                )}
                                                {b.key_messages.length > 0 && (
                                                    <ul className="space-y-0.5">
                                                        {b.key_messages.map((m, i) => (
                                                            <li key={i} className="text-[11px] text-neutral-400 flex gap-1.5">
                                                                <span className="text-amber-500 flex-shrink-0">·</span>{m}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Accordion>

                                {/* Question Patterns */}
                                <Accordion
                                    title="소비자 질문 패턴"
                                    icon={<Target className="w-4 h-4 text-blue-400" />}
                                    count={patterns.length}
                                    open={expandedSection === "patterns"}
                                    onToggle={() => setExpandedSection(prev => prev === "patterns" ? null : "patterns")}
                                >
                                    <div className="space-y-2">
                                        {patterns.length === 0 ? (
                                            <p className="text-xs text-neutral-500 text-center py-4">패턴 없음</p>
                                        ) : patterns.map(p => (
                                            <div key={p.id} className="flex items-start gap-3 p-3 border border-neutral-800 rounded-lg">
                                                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-500 rounded font-mono flex-shrink-0">P{p.priority}</span>
                                                <div>
                                                    <p className="text-xs text-white">{p.pattern_text}</p>
                                                    <p className="text-[10px] text-neutral-600">{p.cluster_label} · 빈도 {p.frequency}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Accordion>

                                {/* Source Traces */}
                                <Accordion
                                    title="AI 참조 소스 분석"
                                    icon={<Radar className="w-4 h-4 text-purple-400" />}
                                    count={sources.length}
                                    open={expandedSection === "sources"}
                                    onToggle={() => setExpandedSection(prev => prev === "sources" ? null : "sources")}
                                >
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {/* 소스 타입 */}
                                        <div>
                                            <p className="text-[10px] text-neutral-500 mb-2 uppercase tracking-wider">소스 유형별</p>
                                            <div className="space-y-1.5">
                                                {Object.entries(sourceTypeMap)
                                                    .sort(([, a], [, b]) => b - a)
                                                    .map(([type, count]) => (
                                                        <div key={type} className="flex items-center justify-between text-xs">
                                                            <span className="text-neutral-400">{type}</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-purple-500 rounded-full"
                                                                        style={{ width: `${(count / sources.length) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-neutral-500 w-4 text-right">{count}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                        {/* 수혜 브랜드 */}
                                        <div>
                                            <p className="text-[10px] text-neutral-500 mb-2 uppercase tracking-wider">AI 노출 브랜드</p>
                                            <div className="space-y-1.5">
                                                {Object.entries(brandBeneficiaryMap)
                                                    .sort(([, a], [, b]) => b - a)
                                                    .slice(0, 8)
                                                    .map(([brand, count]) => (
                                                        <div key={brand} className="flex items-center justify-between text-xs">
                                                            <span className={sources.find(s => s.brand_beneficiary === brand)?.is_own_brand ? "text-amber-400" : "text-neutral-400"}>
                                                                {brand}
                                                            </span>
                                                            <span className="text-neutral-500">{count}회</span>
                                                        </div>
                                                    ))}
                                                {Object.keys(brandBeneficiaryMap).length === 0 && (
                                                    <p className="text-[11px] text-neutral-600">데이터 없음</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Accordion>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Accordion 컴포넌트 ── */
function Accordion({
    title, icon, count, open, onToggle, children,
}: {
    title: string;
    icon: React.ReactNode;
    count: number;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="border border-neutral-800 rounded-xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-semibold text-white">{title}</span>
                    {count > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded-full">{count}</span>
                    )}
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>
            {open && <div className="p-4 pt-0 border-t border-neutral-800">{children}</div>}
        </div>
    );
}
