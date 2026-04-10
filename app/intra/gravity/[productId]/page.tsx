"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft, PlayCircle, RefreshCw, CheckCircle, XCircle,
    ChevronDown, ChevronUp, FileBarChart2, TrendingUp, TrendingDown,
    Minus, Play, Activity,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Product {
    id: string;
    name: string;
    client_name: string;
    category: string;
    competitors: string[];
    target_keywords: string[];
}

interface GravityScore {
    gravity_score: number;
    mention_score: number;
    context_score: number;
    rank_score: number;
    coverage_score: number;
    scan_date: string;
}

interface PainPoint {
    id: string;
    pain_summary: string;
    category: string;
    urgency: string;
    frequency: number;
    representative_quote: string;
}

interface QuestionPattern {
    id: string;
    pattern_text: string;
    situation_type: string;
    priority_rank: number;
    pain_keyword: string;
}

interface ContentBrief {
    id: string;
    title: string;
    situation_sentence: string;
    target_pain_category: string;
    content_type: string;
    status: string;
    created_at: string;
}

interface ScanLog {
    step: string;
    ok: boolean;
    label: string;
    detail?: string;
}

interface StepCounts {
    collect: number;
    classify: number;
    question: number;
    probe: number;
    gap: number;
    source: number;
    voice: number;
}

const STEPS = [
    {
        key: "collect", label: "Pain Collector", desc: "네이버 블로그 리뷰 수집",
        countTable: "bg_pain_sources",
        apiPath: null, // uses collect endpoint below
    },
    {
        key: "classify", label: "Pain Classifier", desc: "페인 포인트 분류",
        countTable: "bg_pain_points",
        apiPath: "/api/gravity/pain/run",
    },
    {
        key: "question", label: "Question Mapper", desc: "AI 질문 패턴 클러스터링",
        countTable: "bg_question_patterns",
        apiPath: "/api/gravity/question/run",
    },
    {
        key: "probe", label: "AI Prober", desc: "4대 AI 동시 질의 실행",
        countTable: "bg_ai_probe_results",
        apiPath: "/api/gravity/probe/run",
    },
    {
        key: "gap", label: "Gap Analyzer", desc: "Gravity Score 산출",
        countTable: "bg_gravity_scores",
        apiPath: "/api/gravity/gap/run",
    },
    {
        key: "source", label: "Source Tracer", desc: "AI 추천 출처 역추적",
        countTable: "bg_source_traces",
        apiPath: "/api/gravity/source/run",
    },
    {
        key: "voice", label: "Voice Designer", desc: "AEO 콘텐츠 브리프 생성",
        countTable: "bg_voice_briefs",
        apiPath: "/api/gravity/voice/run",
    },
];

export default function GravityProductPage() {
    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const productId = params.productId as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [score, setScore] = useState<GravityScore | null>(null);
    const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
    const [patterns, setPatterns] = useState<QuestionPattern[]>([]);
    const [briefs, setBriefs] = useState<ContentBrief[]>([]);
    const [stepCounts, setStepCounts] = useState<StepCounts>({
        collect: 0, classify: 0, question: 0, probe: 0, gap: 0, source: 0, voice: 0,
    });
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [stepRunning, setStepRunning] = useState<string | null>(null);
    const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
    const [currentStep, setCurrentStep] = useState<string | null>(null);
    const [openSection, setOpenSection] = useState<string>("pain");
    const [showPipeline, setShowPipeline] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);

        const { data: p } = await supabase
            .from("bg_products")
            .select("id, name, category, competitors, target_keywords, bg_clients(name)")
            .eq("id", productId)
            .single();

        if (!p) { setLoading(false); return; }

        const prod = {
            id: p.id,
            name: p.name,
            client_name: (p.bg_clients as { name: string } | null)?.name ?? "",
            category: p.category,
            competitors: (p.competitors as string[] | null) ?? [],
            target_keywords: (p.target_keywords as string[] | null) ?? [],
        };
        setProduct(prod);

        const [scoreRes, painRes, patternRes, briefRes,
               cCollect, cClassify, cQuestion, cProbe, cGap, cSource, cVoice] =
            await Promise.all([
                supabase.from("bg_gravity_scores")
                    .select("gravity_score, mention_score, context_score, rank_score, coverage_score, scan_date")
                    .eq("product_id", productId).order("scan_date", { ascending: false }).limit(1).single(),
                supabase.from("bg_pain_points")
                    .select("id, pain_summary, category, urgency, frequency, representative_quote")
                    .eq("product_id", productId).order("frequency", { ascending: false }).limit(20),
                supabase.from("bg_question_patterns")
                    .select("id, pattern_text, situation_type, priority_rank, pain_keyword")
                    .eq("product_id", productId).order("priority_rank", { ascending: true }).limit(20),
                supabase.from("bg_content_briefs")
                    .select("id, title, situation_sentence, target_pain_category, content_type, status, created_at")
                    .eq("product_id", productId).order("created_at", { ascending: false }).limit(20),
                supabase.from("bg_pain_sources").select("id", { count: "exact", head: true }).eq("product_id", productId),
                supabase.from("bg_pain_points").select("id", { count: "exact", head: true }).eq("product_id", productId),
                supabase.from("bg_question_patterns").select("id", { count: "exact", head: true }).eq("product_id", productId),
                supabase.from("bg_ai_probe_results").select("id", { count: "exact", head: true }).eq("product_id", productId),
                supabase.from("bg_gravity_scores").select("id", { count: "exact", head: true }).eq("product_id", productId),
                supabase.from("bg_source_traces").select("id", { count: "exact", head: true }).eq("product_id", productId),
                supabase.from("bg_voice_briefs").select("id", { count: "exact", head: true }).eq("product_id", productId),
            ]);

        if (scoreRes.data) setScore(scoreRes.data);
        setPainPoints((painRes.data ?? []) as PainPoint[]);
        setPatterns((patternRes.data ?? []) as QuestionPattern[]);
        setBriefs((briefRes.data ?? []) as ContentBrief[]);
        setStepCounts({
            collect: cCollect.count ?? 0,
            classify: cClassify.count ?? 0,
            question: cQuestion.count ?? 0,
            probe: cProbe.count ?? 0,
            gap: cGap.count ?? 0,
            source: cSource.count ?? 0,
            voice: cVoice.count ?? 0,
        });

        setLoading(false);
    }, [supabase, productId]);

    useEffect(() => { load(); }, [load]);

    const log = (step: string, label: string, ok: boolean, detail?: string) => {
        setScanLogs(prev => [...prev, { step, label, ok, detail }]);
    };

    const callStep = async (key: string, prod: Product): Promise<{ ok: boolean; detail: string }> => {
        try {
            let r: Response;
            if (key === "collect") {
                r = await fetch("/api/gravity/pain/collect", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product_id: prod.id, brand_name: prod.name,
                        category: prod.category, keywords: prod.target_keywords,
                        competitors: prod.competitors,
                    }),
                });
                const d = await r.json().catch(() => ({}));
                return { ok: r.ok, detail: r.ok ? `${d.total_collected ?? 0}개 수집` : d.error };
            }
            if (key === "classify") {
                r = await fetch("/api/gravity/pain/run", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_id: prod.id, limit: 30 }),
                });
                const d = await r.json().catch(() => ({}));
                return { ok: r.ok, detail: r.ok ? `${d.classified ?? 0}개 분류` : d.error };
            }
            if (key === "question") {
                r = await fetch("/api/gravity/question/run", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_id: prod.id, top_n: 30 }),
                });
                const d = await r.json().catch(() => ({}));
                return { ok: r.ok, detail: r.ok ? `${d.patterns_generated ?? 0}개 패턴` : d.error };
            }
            if (key === "probe") {
                r = await fetch("/api/gravity/probe/run", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        product_id: prod.id, brand_name: prod.name,
                        competitors: prod.competitors,
                        models: ["claude", "chatgpt", "gemini", "perplexity"], pattern_limit: 10,
                    }),
                });
                const d = await r.json().catch(() => ({}));
                return { ok: r.ok, detail: r.ok ? `${d.total_probed ?? 0}개 질의` : d.error };
            }
            if (key === "gap") {
                r = await fetch("/api/gravity/gap/run", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_id: prod.id, brand_name: prod.name, competitors: prod.competitors }),
                });
                const d = await r.json().catch(() => ({}));
                return { ok: r.ok, detail: r.ok ? `Gravity Score ${d.gravity_score ?? "-"}` : d.error };
            }
            if (key === "source") {
                r = await fetch("/api/gravity/source/run", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_id: prod.id, brand_name: prod.name, competitors: prod.competitors }),
                });
                const d = await r.json().catch(() => ({}));
                return { ok: r.ok, detail: r.ok ? `${d.traced ?? 0}건 추적` : d.error };
            }
            if (key === "voice") {
                r = await fetch("/api/gravity/voice/run", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ product_id: prod.id, brand_name: prod.name }),
                });
                const d = await r.json().catch(() => ({}));
                return { ok: r.ok, detail: r.ok ? `${d.briefs_created ?? 0}개 브리프` : d.error };
            }
            return { ok: false, detail: "알 수 없는 스텝" };
        } catch (e) {
            return { ok: false, detail: String(e) };
        }
    };

    const runStep = async (key: string) => {
        if (!product || stepRunning || scanning) return;
        setStepRunning(key);
        const step = STEPS.find(s => s.key === key)!;
        const result = await callStep(key, product);
        setStepRunning(null);
        log(key, step.label, result.ok, result.detail);
        await load();
    };

    const runFullScan = async () => {
        if (!product) return;
        setScanning(true);
        setScanLogs([]);
        for (const s of STEPS) {
            setCurrentStep(s.key);
            const result = await callStep(s.key, product);
            log(s.key, s.label, result.ok, result.detail);
        }
        setCurrentStep(null);
        setScanning(false);
        await load();
    };

    const scoreColor = (s: number) => s >= 60 ? "text-emerald-600" : s >= 30 ? "text-amber-600" : "text-red-500";
    const scoreBg = (s: number) => s >= 60 ? "bg-emerald-50 border-emerald-200" : s >= 30 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
    const urgencyBadge = (u: string) => {
        if (u === "high") return "bg-red-100 text-red-600";
        if (u === "medium") return "bg-amber-100 text-amber-600";
        return "bg-neutral-100 text-neutral-500";
    };
    const statusBadge = (s: string) => {
        if (s === "published") return "bg-emerald-100 text-emerald-600";
        if (s === "draft") return "bg-blue-100 text-blue-600";
        return "bg-neutral-100 text-neutral-500";
    };

    const countKey = (key: string): number => stepCounts[key as keyof StepCounts] ?? 0;

    const Accordion = ({ id, title, count, children }: { id: string; title: string; count?: number; children: React.ReactNode }) => (
        <div className="border border-neutral-200 bg-white">
            <button
                onClick={() => setOpenSection(openSection === id ? "" : id)}
                className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-800">{title}</span>
                    {count !== undefined && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded-full">{count}</span>
                    )}
                </div>
                {openSection === id ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
            </button>
            {openSection === id && <div className="border-t border-neutral-100 p-5">{children}</div>}
        </div>
    );

    if (loading) {
        return <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">로딩 중...</div>;
    }
    if (!product) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sm text-neutral-500 mb-3">클라이언트를 찾을 수 없습니다</p>
                    <button onClick={() => router.push("/intra/gravity")} className="text-xs text-amber-600 hover:underline">← 목록으로</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <PageHeader title={product.name} description={`${product.client_name} · ${product.category}`}>
                <button
                    onClick={() => router.push("/intra/gravity")}
                    className="flex items-center gap-1.5 text-xs border border-neutral-200 px-3 py-1.5 text-neutral-600 hover:border-neutral-400 transition-colors"
                >
                    <ArrowLeft className="w-3 h-3" /> 목록
                </button>
                <button
                    onClick={() => router.push(`/intra/gravity/${productId}/report`)}
                    className="flex items-center gap-1.5 text-xs border border-neutral-200 px-3 py-1.5 text-neutral-600 hover:border-neutral-400 transition-colors"
                >
                    <FileBarChart2 className="w-3 h-3" /> 보고서
                </button>
                <button
                    onClick={runFullScan}
                    disabled={scanning || !!stepRunning}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    {scanning
                        ? <><RefreshCw className="w-3 h-3 animate-spin" /> 스캔 중</>
                        : <><PlayCircle className="w-3 h-3" /> 풀 스캔</>}
                </button>
            </PageHeader>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-5xl mx-auto space-y-5">

                    {/* ── 파이프라인 관리 패널 ── */}
                    <div className="border border-neutral-200 bg-white">
                        <button
                            onClick={() => setShowPipeline(!showPipeline)}
                            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Activity className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-semibold text-neutral-800">파이프라인 관리</span>
                                <span className="text-[10px] text-neutral-400">단계별 실행 · 데이터 확인</span>
                            </div>
                            {showPipeline
                                ? <ChevronUp className="w-4 h-4 text-neutral-400" />
                                : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                        </button>
                        {showPipeline && (
                            <div className="border-t border-neutral-100">
                                {STEPS.map((s, idx) => {
                                    const count = countKey(s.key);
                                    const isRunning = stepRunning === s.key || (scanning && currentStep === s.key);
                                    const isDone = count > 0;
                                    const lastLog = scanLogs.findLast(l => l.step === s.key);

                                    return (
                                        <div
                                            key={s.key}
                                            className={`flex items-center gap-4 px-5 py-3 ${idx < STEPS.length - 1 ? "border-b border-neutral-50" : ""}`}
                                        >
                                            {/* 번호 */}
                                            <span className="text-[10px] font-mono text-neutral-300 w-5 shrink-0">
                                                {String(idx + 1).padStart(2, "0")}
                                            </span>

                                            {/* 상태 아이콘 */}
                                            {isRunning ? (
                                                <RefreshCw className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                                            ) : isDone ? (
                                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border border-neutral-200 shrink-0" />
                                            )}

                                            {/* 레이블 + 설명 */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-medium ${isRunning ? "text-amber-600" : isDone ? "text-neutral-800" : "text-neutral-400"}`}>
                                                        {s.label}
                                                    </span>
                                                    {count > 0 && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
                                                            {count.toLocaleString()}건
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-neutral-400">{s.desc}</p>
                                                {lastLog?.detail && (
                                                    <p className={`text-[10px] mt-0.5 ${lastLog.ok ? "text-neutral-500" : "text-red-400"}`}>
                                                        → {lastLog.detail}
                                                    </p>
                                                )}
                                            </div>

                                            {/* 실행 버튼 */}
                                            <button
                                                onClick={() => runStep(s.key)}
                                                disabled={isRunning || scanning || !!stepRunning}
                                                className={`flex items-center gap-1 text-[11px] px-2.5 py-1 border font-medium transition-colors shrink-0 ${
                                                    isRunning
                                                        ? "border-amber-200 text-amber-400 cursor-not-allowed"
                                                        : isDone
                                                            ? "border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700"
                                                            : "border-amber-300 text-amber-600 hover:bg-amber-50"
                                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                                            >
                                                {isRunning
                                                    ? <><RefreshCw className="w-3 h-3 animate-spin" /> 실행 중</>
                                                    : <><Play className="w-3 h-3" /> {isDone ? "재실행" : "실행"}</>}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 풀 스캔 진행 로그 */}
                    {(scanning || (scanLogs.length > 0 && !stepRunning)) && (
                        <div className="border border-neutral-200 bg-white p-5">
                            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">풀 스캔 진행</p>
                            <div className="space-y-2">
                                {STEPS.map(s => {
                                    const done = scanLogs.findLast(l => l.step === s.key);
                                    const active = currentStep === s.key;
                                    return (
                                        <div key={s.key} className={`flex items-center gap-3 text-sm ${!done && !active ? "opacity-30" : ""}`}>
                                            {done ? (
                                                done.ok
                                                    ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                    : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            ) : active ? (
                                                <RefreshCw className="w-4 h-4 text-amber-500 animate-spin flex-shrink-0" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border border-neutral-300 flex-shrink-0" />
                                            )}
                                            <span className={`font-medium ${active ? "text-amber-600" : done?.ok ? "text-neutral-800" : done ? "text-red-500" : "text-neutral-400"}`}>
                                                {s.label}
                                            </span>
                                            <span className="text-[11px] text-neutral-400">{s.desc}</span>
                                            {done?.detail && (
                                                <span className={`ml-auto text-[11px] ${done.ok ? "text-neutral-500" : "text-red-400"}`}>{done.detail}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Gravity Score */}
                    {score ? (
                        <div className={`border p-5 ${scoreBg(score.gravity_score)}`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">Gravity Score</p>
                                    <div className="flex items-end gap-3">
                                        <span className={`text-6xl font-bold font-mono ${scoreColor(score.gravity_score)}`}>
                                            {score.gravity_score}
                                        </span>
                                        <span className="text-neutral-400 text-sm pb-2">/ 100</span>
                                        {score.gravity_score >= 60
                                            ? <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
                                            : score.gravity_score >= 30
                                                ? <Minus className="w-5 h-5 text-amber-500 mb-2" />
                                                : <TrendingDown className="w-5 h-5 text-red-400 mb-2" />}
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        마지막 스캔: {new Date(score.scan_date).toLocaleDateString("ko-KR")}
                                    </p>
                                </div>
                                <div className="grid grid-cols-4 gap-4 text-center">
                                    {[
                                        { label: "Mention", value: score.mention_score, max: 30 },
                                        { label: "Context", value: score.context_score, max: 25 },
                                        { label: "Rank", value: score.rank_score, max: 25 },
                                        { label: "Coverage", value: score.coverage_score, max: 20 },
                                    ].map(m => (
                                        <div key={m.label}>
                                            <p className="text-[10px] text-neutral-400 mb-1">{m.label}</p>
                                            <p className={`text-xl font-bold ${scoreColor((m.value / m.max) * 100)}`}>{m.value}</p>
                                            <p className="text-[10px] text-neutral-400">/ {m.max}</p>
                                            <div className="mt-1.5 h-1 bg-neutral-200">
                                                <div className="h-full bg-amber-400" style={{ width: `${(m.value / m.max) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="border border-dashed border-neutral-200 p-8 text-center">
                            <p className="text-sm text-neutral-400 mb-2">아직 스캔 결과가 없습니다</p>
                            <p className="text-xs text-neutral-300">파이프라인을 실행하면 Gravity Score가 산출됩니다</p>
                        </div>
                    )}

                    {/* 메타 정보 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="border border-neutral-200 bg-white p-4">
                            <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2">경쟁사</p>
                            {product.competitors.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {product.competitors.map(c => (
                                        <span key={c} className="text-[11px] px-2 py-0.5 bg-neutral-100 text-neutral-600">{c}</span>
                                    ))}
                                </div>
                            ) : <p className="text-xs text-neutral-400">미등록</p>}
                        </div>
                        <div className="border border-neutral-200 bg-white p-4">
                            <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2">타겟 키워드</p>
                            {product.target_keywords.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {product.target_keywords.map(k => (
                                        <span key={k} className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200">{k}</span>
                                    ))}
                                </div>
                            ) : <p className="text-xs text-neutral-400">미등록</p>}
                        </div>
                    </div>

                    {/* 페인 포인트 */}
                    <Accordion id="pain" title="페인 포인트" count={painPoints.length}>
                        {painPoints.length === 0 ? (
                            <p className="text-sm text-neutral-400 text-center py-4">데이터 없음 — Pain Classifier 실행 후 확인하세요</p>
                        ) : (
                            <div className="space-y-3">
                                {painPoints.map(p => (
                                    <div key={p.id} className="border border-neutral-100 p-3.5">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <p className="text-sm font-medium text-neutral-800">{p.pain_summary}</p>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${urgencyBadge(p.urgency)}`}>{p.urgency}</span>
                                                <span className="text-[10px] text-neutral-400">×{p.frequency}</span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-neutral-400 italic">"{p.representative_quote}"</p>
                                        <p className="text-[10px] text-neutral-300 mt-1">{p.category}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Accordion>

                    {/* 질문 패턴 */}
                    <Accordion id="patterns" title="AI 질문 패턴" count={patterns.length}>
                        {patterns.length === 0 ? (
                            <p className="text-sm text-neutral-400 text-center py-4">데이터 없음 — Question Mapper 실행 후 확인하세요</p>
                        ) : (
                            <div className="space-y-2">
                                {patterns.map((p, i) => (
                                    <div key={p.id} className="flex items-start gap-3 py-2 border-b border-neutral-50 last:border-0">
                                        <span className="text-[10px] font-mono text-neutral-300 w-5 flex-shrink-0 mt-0.5">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-sm text-neutral-800">{p.pattern_text}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] text-neutral-400">{p.situation_type}</span>
                                                {p.pain_keyword && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600">#{p.pain_keyword}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Accordion>

                    {/* 콘텐츠 브리프 */}
                    <Accordion id="briefs" title="AEO 콘텐츠 브리프" count={briefs.length}>
                        {briefs.length === 0 ? (
                            <p className="text-sm text-neutral-400 text-center py-4">데이터 없음 — Voice Designer 실행 후 확인하세요</p>
                        ) : (
                            <div className="space-y-3">
                                {briefs.map(b => (
                                    <div key={b.id} className="border border-neutral-100 p-3.5">
                                        <div className="flex items-start justify-between gap-3 mb-1.5">
                                            <p className="text-sm font-medium text-neutral-800">{b.title}</p>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusBadge(b.status)}`}>{b.status}</span>
                                                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{b.content_type}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-neutral-500 italic">"{b.situation_sentence}"</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] text-neutral-300">{b.target_pain_category}</span>
                                            <span className="text-[10px] text-neutral-300">
                                                {new Date(b.created_at).toLocaleDateString("ko-KR")}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Accordion>

                </div>
            </div>
        </div>
    );
}
