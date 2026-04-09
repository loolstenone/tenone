"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft, PlayCircle, RefreshCw, CheckCircle, XCircle,
    ChevronDown, ChevronUp, FileBarChart2, TrendingUp, TrendingDown, Minus
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

const STEPS = [
    { key: "collect", label: "Pain Collector", desc: "네이버 블로그 리뷰 수집" },
    { key: "classify", label: "Pain Classifier", desc: "페인 포인트 분류" },
    { key: "question", label: "Question Mapper", desc: "질문 패턴 클러스터링" },
    { key: "probe", label: "AI Prober", desc: "5대 AI 질의 실행" },
    { key: "gap", label: "Gap Analyzer", desc: "Gravity Score 산출" },
    { key: "source", label: "Source Tracer", desc: "추천 출처 추적" },
    { key: "voice", label: "Voice Designer", desc: "브랜드 보이스 설계" },
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
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
    const [currentStep, setCurrentStep] = useState<string | null>(null);
    const [openSection, setOpenSection] = useState<string>("pain");

    const load = useCallback(async () => {
        setLoading(true);

        const { data: p } = await supabase
            .from("bg_products")
            .select("id, name, category, competitors, target_keywords, bg_clients(name)")
            .eq("id", productId)
            .single();

        if (!p) { setLoading(false); return; }

        setProduct({
            id: p.id,
            name: p.name,
            client_name: (p.bg_clients as { name: string } | null)?.name ?? "",
            category: p.category,
            competitors: (p.competitors as string[] | null) ?? [],
            target_keywords: (p.target_keywords as string[] | null) ?? [],
        });

        const [scoreRes, painRes, patternRes, briefRes] = await Promise.all([
            supabase
                .from("bg_gravity_scores")
                .select("gravity_score, mention_score, context_score, rank_score, coverage_score, scan_date")
                .eq("product_id", productId)
                .order("scan_date", { ascending: false })
                .limit(1)
                .single(),
            supabase
                .from("bg_pain_points")
                .select("id, pain_summary, category, urgency, frequency, representative_quote")
                .eq("product_id", productId)
                .order("frequency", { ascending: false })
                .limit(20),
            supabase
                .from("bg_question_patterns")
                .select("id, pattern_text, situation_type, priority_rank, pain_keyword")
                .eq("product_id", productId)
                .order("priority_rank", { ascending: true })
                .limit(20),
            supabase
                .from("bg_content_briefs")
                .select("id, title, situation_sentence, target_pain_category, content_type, status, created_at")
                .eq("product_id", productId)
                .order("created_at", { ascending: false })
                .limit(20),
        ]);

        if (scoreRes.data) setScore(scoreRes.data);
        setPainPoints((painRes.data ?? []) as PainPoint[]);
        setPatterns((patternRes.data ?? []) as QuestionPattern[]);
        setBriefs((briefRes.data ?? []) as ContentBrief[]);

        setLoading(false);
    }, [supabase, productId]);

    useEffect(() => { load(); }, [load]);

    const log = (step: string, label: string, ok: boolean, detail?: string) => {
        setScanLogs(prev => [...prev, { step, label, ok, detail }]);
    };

    const runFullScan = async () => {
        if (!product) return;
        setScanning(true);
        setScanLogs([]);

        // Step 1: Collect
        setCurrentStep("collect");
        try {
            const r = await fetch("/api/gravity/pain/collect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: product.id,
                    brand_name: product.name,
                    category: product.category,
                    keywords: product.target_keywords,
                    competitors: product.competitors,
                }),
            });
            const d = await r.json().catch(() => ({}));
            log("collect", "Pain Collector", r.ok, r.ok ? `${d.total_collected ?? 0}개 수집` : d.error);
        } catch (e) {
            log("collect", "Pain Collector", false, String(e));
        }

        // Step 2: Classify
        setCurrentStep("classify");
        try {
            const r = await fetch("/api/gravity/pain/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id, limit: 30 }),
            });
            const d = await r.json().catch(() => ({}));
            log("classify", "Pain Classifier", r.ok, r.ok ? `${d.classified ?? 0}개 분류` : d.error);
        } catch (e) {
            log("classify", "Pain Classifier", false, String(e));
        }

        // Step 3: Question
        setCurrentStep("question");
        try {
            const r = await fetch("/api/gravity/question/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id, top_n: 30 }),
            });
            const d = await r.json().catch(() => ({}));
            log("question", "Question Mapper", r.ok, r.ok ? `${d.patterns_generated ?? 0}개 패턴` : d.error);
        } catch (e) {
            log("question", "Question Mapper", false, String(e));
        }

        // Step 4: Probe
        setCurrentStep("probe");
        try {
            const r = await fetch("/api/gravity/probe/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: product.id,
                    brand_name: product.name,
                    competitors: product.competitors,
                    models: ["claude", "chatgpt", "gemini", "perplexity"],
                    pattern_limit: 10,
                }),
            });
            const d = await r.json().catch(() => ({}));
            log("probe", "AI Prober", r.ok, r.ok ? `${d.total_probed ?? 0}개 질의` : d.error);
        } catch (e) {
            log("probe", "AI Prober", false, String(e));
        }

        // Step 5: Gap/Score
        setCurrentStep("gap");
        try {
            const r = await fetch("/api/gravity/gap/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: product.id,
                    brand_name: product.name,
                    competitors: product.competitors,
                }),
            });
            const d = await r.json().catch(() => ({}));
            log("gap", "Gap Analyzer", r.ok, r.ok ? `Gravity Score ${d.gravity_score ?? "-"}` : d.error);
        } catch (e) {
            log("gap", "Gap Analyzer", false, String(e));
        }

        // Step 6: Source
        setCurrentStep("source");
        try {
            const r = await fetch("/api/gravity/source/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: product.id,
                    brand_name: product.name,
                    competitors: product.competitors,
                }),
            });
            const d = await r.json().catch(() => ({}));
            log("source", "Source Tracer", r.ok, r.ok ? "추적 완료" : d.error);
        } catch (e) {
            log("source", "Source Tracer", false, String(e));
        }

        // Step 7: Voice
        setCurrentStep("voice");
        try {
            const r = await fetch("/api/gravity/voice/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id, brand_name: product.name }),
            });
            const d = await r.json().catch(() => ({}));
            log("voice", "Voice Designer", r.ok, r.ok ? "보이스 가이드 생성" : d.error);
        } catch (e) {
            log("voice", "Voice Designer", false, String(e));
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

    const Section = ({ id, title, count, children }: { id: string; title: string; count?: number; children: React.ReactNode }) => (
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
        return (
            <div className="flex-1 flex items-center justify-center text-neutral-400 text-sm">로딩 중...</div>
        );
    }

    if (!product) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sm text-neutral-500 mb-3">클라이언트를 찾을 수 없습니다</p>
                    <button onClick={() => router.push("/intra/gravity")} className="text-xs text-amber-600 hover:underline">
                        ← 목록으로
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <PageHeader
                title={product.name}
                description={`${product.client_name} · ${product.category}`}
            >
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
                    disabled={scanning}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    {scanning
                        ? <><RefreshCw className="w-3 h-3 animate-spin" /> 스캔 중</>
                        : <><PlayCircle className="w-3 h-3" /> 풀 스캔</>}
                </button>
            </PageHeader>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-5xl mx-auto space-y-5">

                    {/* 스캔 진행 로그 */}
                    {(scanning || scanLogs.length > 0) && (
                        <div className="border border-neutral-200 bg-white p-5">
                            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">스캔 진행</p>
                            <div className="space-y-2">
                                {STEPS.map(s => {
                                    const done = scanLogs.find(l => l.step === s.key);
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
                            <p className="text-xs text-neutral-300">풀 스캔을 실행하면 Gravity Score가 산출됩니다</p>
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
                    <Section id="pain" title="페인 포인트" count={painPoints.length}>
                        {painPoints.length === 0 ? (
                            <p className="text-sm text-neutral-400 text-center py-4">데이터 없음 — 스캔 후 확인하세요</p>
                        ) : (
                            <div className="space-y-3">
                                {painPoints.map(p => (
                                    <div key={p.id} className="border border-neutral-100 p-3.5">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <p className="text-sm font-medium text-neutral-800">{p.pain_summary}</p>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${urgencyBadge(p.urgency)}`}>
                                                    {p.urgency}
                                                </span>
                                                <span className="text-[10px] text-neutral-400">×{p.frequency}</span>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-neutral-400 italic">"{p.representative_quote}"</p>
                                        <p className="text-[10px] text-neutral-300 mt-1">{p.category}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Section>

                    {/* 질문 패턴 */}
                    <Section id="patterns" title="AI 질문 패턴" count={patterns.length}>
                        {patterns.length === 0 ? (
                            <p className="text-sm text-neutral-400 text-center py-4">데이터 없음 — 스캔 후 확인하세요</p>
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
                    </Section>

                    {/* 콘텐츠 브리프 */}
                    <Section id="briefs" title="콘텐츠 브리프" count={briefs.length}>
                        {briefs.length === 0 ? (
                            <p className="text-sm text-neutral-400 text-center py-4">데이터 없음 — 스캔 후 확인하세요</p>
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
                    </Section>

                </div>
            </div>
        </div>
    );
}
