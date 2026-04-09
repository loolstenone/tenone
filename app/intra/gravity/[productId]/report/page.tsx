"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Product {
    id: string;
    name: string;
    client_name: string;
    category: string;
    competitors: string[];
    target_keywords: string[];
    site_url: string | null;
}

interface Score {
    gravity_score: number;
    mention_score: number;
    context_score: number;
    rank_score: number;
    coverage_score: number;
    scan_date: string;
    competitor_scores: Record<string, number> | null;
}

interface PainPoint {
    id: string;
    pain_category: string;
    extracted_question: string;
    emotion: string;
    situation: string;
    confidence: number;
}

interface ProbeResult {
    id: string;
    ai_model: string;
    question: string;
    brand_mentioned: boolean;
    brand_rank: number | null;
    competitors_mentioned: string[];
    category_headwind: boolean;
    client_brand_context: string | null;
}

interface QuestionPattern {
    id: string;
    pattern_text: string;
    cluster_label: string;
    frequency: number;
    priority: number;
}

interface Gap {
    id: string;
    gap_type: string;
    severity: number;
    detail: string;
}

interface Action {
    id: string;
    action_type: string;
    priority: number;
    brief: string;
    status: string;
    assignee: string | null;
    due_date: string | null;
}

const GAP_LABELS: Record<string, string> = {
    존재부재: "존재 부재",
    맥락불일치: "맥락 불일치",
    소스빈약: "소스 빈약",
    구조부재: "구조 부재",
    경쟁열세: "경쟁 열세",
    카테고리역풍: "카테고리 역풍",
};

const GAP_COLORS: Record<string, string> = {
    존재부재: "bg-red-50 border-red-200 text-red-700",
    맥락불일치: "bg-orange-50 border-orange-200 text-orange-700",
    소스빈약: "bg-amber-50 border-amber-200 text-amber-700",
    구조부재: "bg-blue-50 border-blue-200 text-blue-700",
    경쟁열세: "bg-purple-50 border-purple-200 text-purple-700",
    카테고리역풍: "bg-red-100 border-red-300 text-red-800",
};

const AI_LABELS: Record<string, string> = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    gemini: "Gemini",
    perplexity: "Perplexity",
    copilot: "Copilot",
};

const scoreColor = (s: number) => {
    if (s >= 60) return "text-emerald-600";
    if (s >= 30) return "text-amber-600";
    return "text-red-500";
};

export default function GravityReportPage() {
    const { productId } = useParams<{ productId: string }>();
    const router = useRouter();
    const supabase = createClient();

    const [product, setProduct] = useState<Product | null>(null);
    const [score, setScore] = useState<Score | null>(null);
    const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
    const [probeResults, setProbeResults] = useState<ProbeResult[]>([]);
    const [questions, setQuestions] = useState<QuestionPattern[]>([]);
    const [gaps, setGaps] = useState<Gap[]>([]);
    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);

        const [productRes, scoreRes, painRes, probeRes, qRes, gapRes, actionRes] = await Promise.all([
            supabase
                .from("bg_products")
                .select("id, name, category, competitors, target_keywords, site_url, bg_clients(name)")
                .eq("id", productId)
                .single(),
            supabase
                .from("bg_gravity_scores")
                .select("gravity_score, mention_score, context_score, rank_score, coverage_score, scan_date, competitor_scores")
                .eq("product_id", productId)
                .order("scan_date", { ascending: false })
                .limit(1)
                .single(),
            supabase
                .from("bg_pain_points")
                .select("id, pain_category, extracted_question, emotion, situation, confidence")
                .eq("product_id", productId)
                .order("confidence", { ascending: false })
                .limit(10),
            supabase
                .from("bg_ai_probe_results")
                .select("id, ai_model, question, brand_mentioned, brand_rank, competitors_mentioned, category_headwind, client_brand_context")
                .eq("product_id", productId)
                .order("probed_at", { ascending: false }),
            supabase
                .from("bg_question_patterns")
                .select("id, pattern_text, cluster_label, frequency, priority")
                .eq("product_id", productId)
                .order("priority", { ascending: true })
                .limit(10),
            supabase
                .from("bg_gaps")
                .select("id, gap_type, severity, detail")
                .eq("product_id", productId)
                .order("severity", { ascending: false }),
            supabase
                .from("bg_actions")
                .select("id, action_type, priority, brief, status, assignee, due_date")
                .eq("product_id", productId)
                .order("priority", { ascending: true }),
        ]);

        if (productRes.data) {
            const p = productRes.data as {
                id: string; name: string; category: string;
                competitors: string[] | null; target_keywords: string[] | null;
                site_url: string | null;
                bg_clients: { name: string } | null;
            };
            setProduct({
                id: p.id,
                name: p.name,
                client_name: p.bg_clients?.name ?? "",
                category: p.category,
                competitors: p.competitors ?? [],
                target_keywords: p.target_keywords ?? [],
                site_url: p.site_url,
            });
        }

        if (scoreRes.data) setScore(scoreRes.data as Score);
        setPainPoints((painRes.data ?? []) as PainPoint[]);
        setProbeResults((probeRes.data ?? []) as ProbeResult[]);
        setQuestions((qRes.data ?? []) as QuestionPattern[]);
        setGaps((gapRes.data ?? []) as Gap[]);
        setActions((actionRes.data ?? []) as Action[]);
        setLoading(false);
    }, [supabase, productId]);

    useEffect(() => { load(); }, [load]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-neutral-400 text-sm">
                보고서 생성 중...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex items-center justify-center h-screen text-neutral-400 text-sm">
                데이터를 찾을 수 없습니다
            </div>
        );
    }

    const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
    const scanDate = score?.scan_date
        ? new Date(score.scan_date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
        : today;

    // 프로브 결과 AI별 그룹
    const aiList = ["chatgpt", "claude", "gemini", "perplexity", "copilot"];
    const probeByQuestion: Record<string, Record<string, ProbeResult>> = {};
    probeResults.forEach(r => {
        if (!probeByQuestion[r.question]) probeByQuestion[r.question] = {};
        probeByQuestion[r.question][r.ai_model] = r;
    });
    const questionList = Object.keys(probeByQuestion);

    const competitorData = score?.competitor_scores
        ? Object.entries(score.competitor_scores).sort((a, b) => b[1] - a[1])
        : [];

    return (
        <div className="min-h-screen bg-white">
            {/* 인쇄 전용 숨김 컨트롤 */}
            <div className="print:hidden sticky top-0 z-10 bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between">
                <button
                    onClick={() => router.push(`/intra/gravity/${productId}`)}
                    className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> 돌아가기
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Brand Gravity Report</span>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
                    >
                        <Printer className="w-3.5 h-3.5" /> PDF 저장
                    </button>
                </div>
            </div>

            {/* 보고서 본문 */}
            <div className="max-w-3xl mx-auto px-8 py-12 print:py-8 print:px-6">

                {/* ── 표지 ── */}
                <div className="mb-12 pb-10 border-b border-neutral-200">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <p className="text-[10px] tracking-widest uppercase text-amber-500 font-semibold mb-2">
                                Brand Gravity Report
                            </p>
                            <h1 className="text-3xl font-bold text-neutral-900 mb-1">{product.name}</h1>
                            <p className="text-base text-neutral-500">{product.client_name}</p>
                        </div>
                        {score && (
                            <div className="text-right">
                                <p className="text-[10px] text-neutral-400 mb-1">Gravity Score</p>
                                <p className={`text-6xl font-bold font-mono ${scoreColor(score.gravity_score)}`}>
                                    {score.gravity_score}
                                </p>
                                <p className="text-[10px] text-neutral-400 mt-1">/ 100</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 측정일: {scanDate}</span>
                        <span>발행일: {today}</span>
                        <span>카테고리: {product.category}</span>
                    </div>
                </div>

                {/* ── 1. Score 요약 ── */}
                {score && (
                    <section className="mb-10">
                        <SectionTitle num="01" title="Gravity Score 분석" />
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {[
                                { label: "Mention Score", value: score.mention_score, max: 30, desc: "AI 추천 포함 비율" },
                                { label: "Context Score", value: score.context_score, max: 25, desc: "추천 맥락 일치도" },
                                { label: "Rank Score", value: score.rank_score, max: 25, desc: "추천 리스트 평균 순위" },
                                { label: "Coverage Score", value: score.coverage_score, max: 20, desc: "5대 AI 중 등장 범위" },
                            ].map(m => (
                                <div key={m.label} className="border border-neutral-100 p-4">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <p className="text-xs font-semibold text-neutral-700">{m.label}</p>
                                        <p className="text-lg font-bold text-neutral-900 font-mono">
                                            {m.value ?? 0}
                                            <span className="text-xs text-neutral-400 font-normal">/{m.max}</span>
                                        </p>
                                    </div>
                                    <div className="h-1.5 bg-neutral-100 mb-2">
                                        <div
                                            className="h-full bg-amber-400"
                                            style={{ width: `${((m.value ?? 0) / m.max) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-400">{m.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* 경쟁사 비교 */}
                        {competitorData.length > 0 && (
                            <div>
                                <p className="text-[11px] font-semibold text-neutral-600 mb-2">경쟁사 Score 비교</p>
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr className="bg-neutral-50">
                                            <th className="text-left p-2 border border-neutral-100 font-medium text-neutral-500">브랜드</th>
                                            <th className="text-right p-2 border border-neutral-100 font-medium text-neutral-500">Score</th>
                                            <th className="p-2 border border-neutral-100 font-medium text-neutral-500 w-40">바</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-amber-50">
                                            <td className="p-2 border border-neutral-100 font-semibold text-amber-700">{product.name} (자사)</td>
                                            <td className="p-2 border border-neutral-100 text-right font-bold text-amber-700">{score.gravity_score}</td>
                                            <td className="p-2 border border-neutral-100">
                                                <div className="h-2 bg-neutral-100">
                                                    <div className="h-full bg-amber-400" style={{ width: `${score.gravity_score}%` }} />
                                                </div>
                                            </td>
                                        </tr>
                                        {competitorData.map(([name, val]) => (
                                            <tr key={name}>
                                                <td className="p-2 border border-neutral-100 text-neutral-700">{name}</td>
                                                <td className="p-2 border border-neutral-100 text-right text-neutral-600">{val}</td>
                                                <td className="p-2 border border-neutral-100">
                                                    <div className="h-2 bg-neutral-100">
                                                        <div className="h-full bg-neutral-300" style={{ width: `${val}%` }} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* ── 2. AI 추천 현황 ── */}
                {questionList.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="02" title="AI 추천 현황" />
                        <p className="text-[11px] text-neutral-400 mb-3">
                            ✅ 의도한 맥락으로 등장 &nbsp; ⚠️ 등장했으나 맥락 불일치 &nbsp; ❌ 미등장
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px] border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50">
                                        <th className="text-left p-2 border border-neutral-100 font-medium text-neutral-500 min-w-40">상황 문장</th>
                                        {aiList.map(ai => (
                                            <th key={ai} className="p-2 border border-neutral-100 font-medium text-neutral-500 w-16">
                                                {AI_LABELS[ai] ?? ai}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {questionList.map(q => (
                                        <tr key={q}>
                                            <td className="p-2 border border-neutral-100 text-neutral-600 text-[10px] leading-snug">{q}</td>
                                            {aiList.map(ai => {
                                                const r = probeByQuestion[q]?.[ai];
                                                if (!r) return <td key={ai} className="p-2 border border-neutral-100 text-center text-neutral-200">—</td>;
                                                if (r.category_headwind) return <td key={ai} className="p-2 border border-neutral-100 text-center">🚨</td>;
                                                if (!r.brand_mentioned) return <td key={ai} className="p-2 border border-neutral-100 text-center text-red-400">❌</td>;
                                                if (r.brand_rank && r.brand_rank <= 2) return <td key={ai} className="p-2 border border-neutral-100 text-center text-emerald-600">✅</td>;
                                                return <td key={ai} className="p-2 border border-neutral-100 text-center text-amber-500">⚠️</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* ── 3. 페인 포인트 맵 ── */}
                {painPoints.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="03" title="페인 포인트 맵" />
                        <div className="space-y-2">
                            {painPoints.map((p, i) => (
                                <div key={p.id} className="flex gap-3 items-start border border-neutral-100 p-3">
                                    <span className="text-[11px] font-mono text-neutral-300 w-5 shrink-0 mt-0.5">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">
                                                {p.pain_category}
                                            </span>
                                            {p.emotion && (
                                                <span className="text-[10px] text-neutral-400">{p.emotion}</span>
                                            )}
                                        </div>
                                        {p.extracted_question && (
                                            <p className="text-xs text-neutral-700 leading-snug">"{p.extracted_question}"</p>
                                        )}
                                        {p.situation && (
                                            <p className="text-[10px] text-neutral-400 mt-0.5">{p.situation}</p>
                                        )}
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-[10px] text-neutral-400">신뢰도</p>
                                        <p className="text-xs font-semibold text-neutral-600">{Math.round((p.confidence ?? 0) * 100)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── 4. 갭 진단 ── */}
                {gaps.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="04" title="갭 진단" />
                        <div className="space-y-3">
                            {gaps.map(g => (
                                <div key={g.id} className={`border p-4 ${GAP_COLORS[g.gap_type] ?? "bg-neutral-50 border-neutral-200 text-neutral-700"}`}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[11px] font-bold">
                                            {GAP_LABELS[g.gap_type] ?? g.gap_type}
                                        </span>
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full ${i < g.severity ? "bg-current" : "bg-current opacity-20"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {g.detail && (
                                        <p className="text-[11px] leading-relaxed opacity-90">{g.detail}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── 5. 액션 플랜 ── */}
                {actions.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="05" title="액션 플랜" />
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-neutral-50">
                                    <th className="text-left p-2 border border-neutral-100 font-medium text-neutral-500 w-6">#</th>
                                    <th className="text-left p-2 border border-neutral-100 font-medium text-neutral-500">조치</th>
                                    <th className="p-2 border border-neutral-100 font-medium text-neutral-500 w-20">담당</th>
                                    <th className="p-2 border border-neutral-100 font-medium text-neutral-500 w-20">기한</th>
                                    <th className="p-2 border border-neutral-100 font-medium text-neutral-500 w-16">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actions.map((a, i) => (
                                    <tr key={a.id} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}>
                                        <td className="p-2 border border-neutral-100 text-neutral-400 font-mono">{i + 1}</td>
                                        <td className="p-2 border border-neutral-100 text-neutral-700 leading-snug">{a.brief}</td>
                                        <td className="p-2 border border-neutral-100 text-center text-neutral-500">{a.assignee ?? "—"}</td>
                                        <td className="p-2 border border-neutral-100 text-center text-neutral-500">
                                            {a.due_date ? new Date(a.due_date).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" }) : "—"}
                                        </td>
                                        <td className="p-2 border border-neutral-100 text-center">
                                            <span className={`text-[10px] px-1.5 py-0.5 ${
                                                a.status === "done" ? "bg-emerald-100 text-emerald-600" :
                                                a.status === "in_progress" ? "bg-blue-100 text-blue-600" :
                                                "bg-neutral-100 text-neutral-400"
                                            }`}>
                                                {a.status === "done" ? "완료" : a.status === "in_progress" ? "진행중" : "대기"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* ── 6. 상황 문장 세트 ── */}
                {questions.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="06" title="상황 문장 세트" />
                        <div className="space-y-1.5">
                            {questions.map((q, i) => (
                                <div key={q.id} className="flex gap-3 items-start">
                                    <span className="text-[10px] font-mono text-neutral-300 w-5 shrink-0 mt-0.5">{i + 1}</span>
                                    <div className="flex-1">
                                        <p className="text-xs text-neutral-700">{q.pattern_text}</p>
                                        {q.cluster_label && (
                                            <span className="text-[9px] text-neutral-400">#{q.cluster_label}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── 푸터 ── */}
                <div className="border-t border-neutral-100 pt-6 mt-8 flex items-center justify-between text-[10px] text-neutral-300">
                    <span>Brand Gravity by TenOne</span>
                    <span>{today} 발행</span>
                </div>
            </div>

            {/* 인쇄 스타일 */}
            <style>{`
                @media print {
                    @page { margin: 20mm 16mm; size: A4; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    section { page-break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}

function SectionTitle({ num, title }: { num: string; title: string }) {
    return (
        <div className="flex items-baseline gap-3 mb-4">
            <span className="text-[10px] font-mono text-amber-400">{num}</span>
            <h2 className="text-sm font-bold text-neutral-900 tracking-wide">{title}</h2>
            <div className="flex-1 h-px bg-neutral-100" />
        </div>
    );
}
