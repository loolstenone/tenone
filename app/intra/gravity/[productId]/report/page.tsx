"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, Calendar, AlertTriangle, TrendingDown, FileText } from "lucide-react";
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

interface CompetitorScore {
    count: number;
    mention_rate: number;
}

interface Score {
    gravity_score: number;
    mention_score: number;
    context_score: number;
    rank_score: number;
    coverage_score: number;
    scan_date: string;
    competitor_scores: Record<string, CompetitorScore> | null;
    gap_summary?: { top_gaps?: string[]; quick_wins?: string[] };
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

interface SourceTrace {
    id: string;
    ai_model: string;
    source_type: string;
    source_url: string | null;
    source_name: string | null;
    source_snippet: string | null;
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
    why: string | null;
    status: string;
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

const SOURCE_TYPE_KO: Record<string, string> = {
    blog: "블로그",
    news: "뉴스",
    reddit: "Reddit",
    youtube: "유튜브",
    faq: "FAQ",
    official: "공식 사이트",
    review: "리뷰",
    forum: "포럼",
    wiki: "위키",
    other: "기타",
};

const CONTENT_TYPE_KO: Record<string, string> = {
    blog: "블로그 포스트",
    faq: "FAQ 페이지",
    comparison: "비교 콘텐츠",
    case_study: "케이스 스터디",
    reddit_post: "Reddit 게시글",
    youtube_script: "유튜브 스크립트",
    landing_page: "랜딩 페이지",
};

const scoreColor = (s: number) => {
    if (s >= 60) return "text-emerald-600";
    if (s >= 30) return "text-amber-600";
    return "text-red-500";
};

const scoreBg = (s: number) => {
    if (s >= 60) return "bg-emerald-500";
    if (s >= 30) return "bg-amber-500";
    return "bg-red-500";
};

const scoreGrade = (s: number) => {
    if (s >= 70) return { grade: "A", label: "AI 추천 강자", color: "text-emerald-600" };
    if (s >= 50) return { grade: "B", label: "가시성 확보 중", color: "text-blue-600" };
    if (s >= 30) return { grade: "C", label: "개선 시급", color: "text-amber-600" };
    return { grade: "D", label: "AI 비가시 상태", color: "text-red-600" };
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
    const [sourceTraces, setSourceTraces] = useState<SourceTrace[]>([]);
    const [voiceBriefs, setVoiceBriefs] = useState<VoiceBrief[]>([]);
    const [brandValues, setBrandValues] = useState<{ awareness_score: number; favorability_score: number; recommendation_score: number; satisfaction_score: number; overall_score: number; diagnosis_text: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);

        const [productRes, scoreRes, painRes, probeRes, qRes, gapRes, actionRes, sourceRes, briefRes, bvRes] = await Promise.all([
            supabase
                .from("bg_products")
                .select("id, name, category, competitors, target_keywords, site_url, bg_clients(name)")
                .eq("id", productId)
                .single(),
            supabase
                .from("bg_gravity_scores")
                .select("gravity_score, mention_score, context_score, rank_score, coverage_score, scan_date, competitor_scores, gap_summary")
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
            supabase
                .from("bg_source_traces")
                .select("id, ai_model, source_type, source_url, source_name, source_snippet, brand_beneficiary, is_own_brand")
                .eq("product_id", productId),
            supabase
                .from("bg_voice_briefs")
                .select("id, content_type, target_pattern, title_suggestion, key_messages, target_ai, priority, why, status")
                .eq("product_id", productId)
                .order("priority", { ascending: true }),
            supabase
                .from("bg_brand_values")
                .select("awareness_score, favorability_score, recommendation_score, satisfaction_score, overall_score, diagnosis_text")
                .eq("product_id", productId)
                .order("created_at", { ascending: false })
                .limit(1)
                .single(),
        ]);

        if (productRes.error) console.error("[report] productRes error:", productRes.error);
        if (scoreRes.error) console.error("[report] scoreRes error:", scoreRes.error);

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
        setSourceTraces((sourceRes.data ?? []) as SourceTrace[]);
        setVoiceBriefs((briefRes.data ?? []) as VoiceBrief[]);
        if (bvRes.data) setBrandValues(bvRes.data as { awareness_score: number; favorability_score: number; recommendation_score: number; satisfaction_score: number; overall_score: number; diagnosis_text: string });
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

    // AI별 탐침 결과 매트릭스
    const aiList = ["chatgpt", "claude", "gemini", "perplexity", "copilot"];
    const probeByQuestion: Record<string, Record<string, ProbeResult>> = {};
    probeResults.forEach(r => {
        if (!probeByQuestion[r.question]) probeByQuestion[r.question] = {};
        probeByQuestion[r.question][r.ai_model] = r;
    });
    const questionList = Object.keys(probeByQuestion);

    // competitor_scores: {name: {count, mention_rate}} → display용 [{name, displayScore}] 변환
    const competitorData: Array<{ name: string; displayScore: number; mentionRate: number }> = score?.competitor_scores
        ? Object.entries(score.competitor_scores)
            .map(([name, v]) => ({ name, displayScore: Math.round((v.mention_rate ?? 0) * 100), mentionRate: v.mention_rate ?? 0 }))
            .sort((a, b) => b.displayScore - a.displayScore)
        : [];

    // 통계 계산
    const totalProbes = probeResults.length;
    const mentionedCount = probeResults.filter(r => r.brand_mentioned).length;
    const mentionRate = totalProbes > 0 ? Math.round((mentionedCount / totalProbes) * 100) : 0;
    const headwindCount = probeResults.filter(r => r.category_headwind).length;
    const headwindQuestions = questionList.filter(q =>
        Object.values(probeByQuestion[q]).some(r => r.category_headwind)
    );

    // 경쟁사 소스 (is_own_brand = false)
    const competitorSources = sourceTraces.filter(s => !s.is_own_brand);
    const ownSources = sourceTraces.filter(s => s.is_own_brand);
    const sourceTypeCount: Record<string, number> = {};
    competitorSources.forEach(s => {
        if (s.source_type) sourceTypeCount[s.source_type] = (sourceTypeCount[s.source_type] ?? 0) + 1;
    });
    const sortedSourceTypes = Object.entries(sourceTypeCount).sort((a, b) => b[1] - a[1]);

    // 등급
    const grade = score ? scoreGrade(score.gravity_score) : null;

    // 핵심 갭 (severity 최고값)
    const topGap = gaps[0];

    // 즉시 실행 액션 (priority 1)
    const quickActions = actions.filter(a => a.priority === 1);

    // JSON-LD 생성
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions.slice(0, 5).map(q => ({
            "@type": "Question",
            "name": q.pattern_text,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": `${product.name}에 대한 전문 답변을 이 페이지에서 확인하세요.`
            }
        }))
    };

    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": product.name,
        "url": product.site_url ?? "",
        "description": `${product.name}은 ${product.category} 분야의 전문 브랜드입니다.`,
        "areaServed": "KR",
        "knowsAbout": product.target_keywords.slice(0, 5)
    };

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
                <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400">Brand Gravity Report — {product.name}</span>
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
                <div className="mb-12 pb-10 border-b border-neutral-200 print:page-break-after-avoid">
                    <p className="text-[10px] tracking-widest uppercase text-amber-500 font-semibold mb-6">
                        Brand Gravity Report · Confidential
                    </p>
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-neutral-900 mb-2">{product.name}</h1>
                            <p className="text-base text-neutral-500 mb-1">{product.client_name}</p>
                            <p className="text-xs text-neutral-400">{product.category} 카테고리</p>
                        </div>
                        {score && grade && (
                            <div className="text-right">
                                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${scoreBg(score.gravity_score)} text-white mb-2`}>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold font-mono leading-none">{score.gravity_score}</p>
                                        <p className="text-[10px] opacity-80">/ 100</p>
                                    </div>
                                </div>
                                <p className={`text-xs font-bold ${grade.color}`}>{grade.grade}등급 — {grade.label}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-6 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 측정일: {scanDate}</span>
                        <span>발행일: {today}</span>
                        <span>대상 AI: ChatGPT·Claude·Gemini·Perplexity·Copilot</span>
                    </div>
                </div>

                {/* ── 01. Executive Summary ── */}
                <section className="mb-10">
                    <SectionTitle num="01" title="Executive Summary" />
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <StatCard
                            label="AI 추천율"
                            value={`${mentionRate}%`}
                            sub={`${mentionedCount}/${totalProbes} 탐침`}
                            accent={mentionRate >= 40 ? "emerald" : mentionRate >= 20 ? "amber" : "red"}
                        />
                        <StatCard
                            label="카테고리 역풍"
                            value={`${headwindCount}건`}
                            sub="AI가 카테고리 추천 자체를 기피"
                            accent={headwindCount > 0 ? "red" : "emerald"}
                        />
                        <StatCard
                            label="즉시 실행 조치"
                            value={`${quickActions.length}건`}
                            sub="Priority 1 액션"
                            accent="amber"
                        />
                    </div>

                    {/* 핵심 발견 사항 */}
                    <div className="border border-neutral-100 p-4 mb-4">
                        <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">핵심 발견 사항</p>
                        <ul className="space-y-2">
                            {score && (
                                <li className="flex gap-2 text-xs text-neutral-700">
                                    <span className="text-amber-500 mt-0.5">▸</span>
                                    <span>{product.name}의 Brand Gravity Score는 <strong>{score.gravity_score}점</strong>으로 {grade?.label} 상태다. 전체 탐침의 {mentionRate}%에서만 AI 추천에 등장했다.</span>
                                </li>
                            )}
                            {topGap && (
                                <li className="flex gap-2 text-xs text-neutral-700">
                                    <span className="text-red-400 mt-0.5">▸</span>
                                    <span>가장 심각한 갭은 <strong>{GAP_LABELS[topGap.gap_type] ?? topGap.gap_type}</strong>(심각도 {topGap.severity}/5)이다. {topGap.detail}</span>
                                </li>
                            )}
                            {headwindCount > 0 && (
                                <li className="flex gap-2 text-xs text-neutral-700">
                                    <span className="text-red-500 mt-0.5">▸</span>
                                    <span>{headwindCount}개 질문에서 AI가 {product.category} 카테고리 추천 자체를 거부했다. 카테고리 인식 개선이 선행 과제다.</span>
                                </li>
                            )}
                            {competitorSources.length > 0 && (
                                <li className="flex gap-2 text-xs text-neutral-700">
                                    <span className="text-purple-400 mt-0.5">▸</span>
                                    <span>경쟁사는 주로 <strong>{sortedSourceTypes[0]?.[0] ? SOURCE_TYPE_KO[sortedSourceTypes[0][0]] ?? sortedSourceTypes[0][0] : "블로그"}</strong> 소스를 통해 AI 추천을 획득하고 있다.</span>
                                </li>
                            )}
                            {quickActions.length > 0 && (
                                <li className="flex gap-2 text-xs text-neutral-700">
                                    <span className="text-emerald-500 mt-0.5">▸</span>
                                    <span>즉시 실행 가능한 Priority 1 액션 {quickActions.length}건을 통해 단기 Score 개선이 가능하다.</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* 권고 한 줄 */}
                    {quickActions[0] && (
                        <div className="bg-amber-50 border border-amber-200 p-3 flex gap-3 items-start">
                            <span className="text-amber-500 text-base mt-0.5">⚡</span>
                            <div>
                                <p className="text-[10px] font-semibold text-amber-700 mb-0.5">최우선 권고</p>
                                <p className="text-xs text-amber-800">{quickActions[0].brief}</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* ── 02. Gravity Score 분석 ── */}
                {score && (
                    <section className="mb-10">
                        <SectionTitle num="02" title="Gravity Score 상세 분석" />

                        {/* 서브스코어 카드 */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {[
                                { label: "Mention Score", value: score.mention_score, max: 40, desc: "AI 응답 내 브랜드 언급 비율 (0~40점)" },
                                { label: "Context Score", value: score.context_score, max: 25, desc: "소스 품질 + 맥락 일치도 (0~25점)" },
                                { label: "Rank Score", value: score.rank_score, max: 20, desc: "추천 리스트 순위 가중치 (0~20점)" },
                                { label: "Coverage Score", value: score.coverage_score, max: 15, desc: "5대 AI 엔진 중 등장 엔진 수 (0~15점)" },
                            ].map(m => (
                                <div key={m.label} className="border border-neutral-100 p-4">
                                    <div className="flex items-baseline justify-between mb-2">
                                        <p className="text-xs font-semibold text-neutral-700">{m.label}</p>
                                        <p className="text-xl font-bold text-neutral-900 font-mono">
                                            {m.value ?? 0}
                                            <span className="text-xs text-neutral-400 font-normal ml-0.5">/{m.max}</span>
                                        </p>
                                    </div>
                                    <div className="h-2 bg-neutral-100 mb-2">
                                        <div
                                            className="h-full bg-amber-400"
                                            style={{ width: `${((m.value ?? 0) / m.max) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-400 leading-relaxed">{m.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* 경쟁사 비교 */}
                        {competitorData.length > 0 && (
                            <div>
                                <p className="text-[11px] font-semibold text-neutral-600 mb-2">경쟁사 AI 언급률 비교</p>
                                <div className="space-y-1.5">
                                    {[
                                        { name: `${product.name} (자사)`, displayScore: score.gravity_score, isSelf: true },
                                        ...competitorData.map(c => ({ name: c.name, displayScore: c.displayScore, isSelf: false }))
                                    ].map(item => (
                                        <div key={item.name} className={`flex items-center gap-3 p-2 ${item.isSelf ? "bg-amber-50 border border-amber-100" : "bg-neutral-50"}`}>
                                            <span className={`text-xs w-36 shrink-0 truncate ${item.isSelf ? "font-semibold text-amber-700" : "text-neutral-600"}`}>{item.name}</span>
                                            <div className="flex-1 h-2 bg-neutral-100">
                                                <div
                                                    className={`h-full ${item.isSelf ? "bg-amber-400" : "bg-neutral-300"}`}
                                                    style={{ width: `${item.displayScore}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs font-mono w-8 text-right shrink-0 ${item.isSelf ? "font-bold text-amber-700" : "text-neutral-500"}`}>{item.displayScore}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {/* ── 03. 페인 포인트 맵 ── */}
                {painPoints.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="03" title="소비자 페인 포인트 맵" />
                        <p className="text-[11px] text-neutral-400 mb-3">
                            실제 소비자 리뷰·후기에서 추출한 Pain Point. AI 탐침 질문의 원천이다.
                        </p>
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

                {/* ── 04. 카테고리 역풍 분석 ── */}
                {headwindCount > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="04" title="카테고리 역풍 분석" />
                        <div className="bg-red-50 border border-red-200 p-4 mb-4 flex gap-3 items-start">
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-red-700 mb-1">카테고리 역풍이란?</p>
                                <p className="text-[11px] text-red-600 leading-relaxed">
                                    AI가 특정 카테고리 자체에 대한 추천을 기피하는 현상이다. 브랜드 문제가 아닌 카테고리 인식 문제로, 개별 브랜드 노력만으로는 해결이 어렵다. {product.category} 카테고리에서 {headwindCount}건의 역풍이 감지됐다.
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {headwindQuestions.map((q, i) => {
                                const results = Object.values(probeByQuestion[q]).filter(r => r.category_headwind);
                                const affectedAIs = results.map(r => AI_LABELS[r.ai_model] ?? r.ai_model);
                                return (
                                    <div key={i} className="border border-red-100 p-3">
                                        <p className="text-xs text-neutral-700 mb-1">"{q}"</p>
                                        <div className="flex items-center gap-2">
                                            <TrendingDown className="w-3 h-3 text-red-400" />
                                            <p className="text-[10px] text-red-500">역풍 AI: {affectedAIs.join(", ")}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {headwindQuestions.length > 0 && (
                            <div className="mt-3 p-3 bg-neutral-50 border border-neutral-100">
                                <p className="text-[11px] font-semibold text-neutral-600 mb-1">권고 대응 전략</p>
                                <p className="text-[11px] text-neutral-500 leading-relaxed">
                                    카테고리 역풍 질문에 대해서는 경쟁사 비교 콘텐츠보다 "왜 이 카테고리가 필요한가"를 설명하는 교육형 콘텐츠를 우선 제작하라. AI는 카테고리 정당성이 충분히 확인된 후에야 개별 브랜드를 추천한다.
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {/* ── 05. AI 추천 지도 ── */}
                {questionList.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="05" title="AI 추천 지도" />
                        <p className="text-[11px] text-neutral-400 mb-3">
                            ✅ 상위 노출 (rank 1~2) &nbsp; ⚠️ 하위 등장 &nbsp; ❌ 미등장 &nbsp; 🚨 카테고리 역풍
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[10px] border-collapse">
                                <thead>
                                    <tr className="bg-neutral-50">
                                        <th className="text-left p-2 border border-neutral-100 font-medium text-neutral-500 min-w-40">상황 질문</th>
                                        {aiList.map(ai => (
                                            <th key={ai} className="p-2 border border-neutral-100 font-medium text-neutral-500 w-16 text-center">
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
                                                if (r.category_headwind) return <td key={ai} className="p-2 border border-neutral-100 text-center bg-red-50">🚨</td>;
                                                if (!r.brand_mentioned) return <td key={ai} className="p-2 border border-neutral-100 text-center">❌</td>;
                                                if (r.brand_rank && r.brand_rank <= 2) return <td key={ai} className="p-2 border border-neutral-100 text-center bg-emerald-50">✅</td>;
                                                return <td key={ai} className="p-2 border border-neutral-100 text-center bg-amber-50">⚠️</td>;
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* AI별 통계 */}
                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {aiList.map(ai => {
                                const aiProbes = probeResults.filter(r => r.ai_model === ai);
                                const aiMentions = aiProbes.filter(r => r.brand_mentioned && !r.category_headwind).length;
                                const aiTotal = aiProbes.filter(r => !r.category_headwind).length;
                                const aiRate = aiTotal > 0 ? Math.round((aiMentions / aiTotal) * 100) : 0;
                                return (
                                    <div key={ai} className="text-center border border-neutral-100 p-2">
                                        <p className="text-[10px] font-semibold text-neutral-600 mb-1">{AI_LABELS[ai] ?? ai}</p>
                                        <p className={`text-base font-bold font-mono ${scoreColor(aiRate)}`}>{aiRate}%</p>
                                        <p className="text-[9px] text-neutral-400">{aiMentions}/{aiTotal}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ── 06. 경쟁사 소스 역추적 ── */}
                {sourceTraces.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="06" title="경쟁사 소스 역추적" />
                        <p className="text-[11px] text-neutral-400 mb-4">
                            AI가 경쟁사를 추천할 때 인용하는 소스 유형을 분석했다. 이 소스 유형에서 자사 콘텐츠 비중을 늘리는 것이 핵심 전략이다.
                        </p>

                        {/* 소스 유형 분포 */}
                        {sortedSourceTypes.length > 0 && (
                            <div className="mb-5">
                                <p className="text-[11px] font-semibold text-neutral-600 mb-2">경쟁사 인용 소스 유형 분포</p>
                                <div className="space-y-1.5">
                                    {sortedSourceTypes.map(([type, count]) => {
                                        const maxCount = sortedSourceTypes[0]?.[1] ?? 1;
                                        return (
                                            <div key={type} className="flex items-center gap-3">
                                                <span className="text-[11px] text-neutral-500 w-20 shrink-0">
                                                    {SOURCE_TYPE_KO[type] ?? type}
                                                </span>
                                                <div className="flex-1 h-2 bg-neutral-100">
                                                    <div
                                                        className="h-full bg-purple-300"
                                                        style={{ width: `${(count / maxCount) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-mono text-neutral-500 w-8 text-right shrink-0">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 경쟁사 소스 목록 (상위 8개) */}
                        {competitorSources.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[11px] font-semibold text-neutral-600 mb-2">주요 경쟁사 인용 소스</p>
                                <div className="space-y-1.5">
                                    {competitorSources.slice(0, 8).map(s => (
                                        <div key={s.id} className="flex gap-3 items-start border border-neutral-100 p-2.5">
                                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 shrink-0">
                                                {SOURCE_TYPE_KO[s.source_type] ?? s.source_type}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                {s.source_name && <p className="text-[11px] font-medium text-neutral-700 truncate">{s.source_name}</p>}
                                                {s.source_snippet && <p className="text-[10px] text-neutral-400 leading-snug mt-0.5 line-clamp-2">{s.source_snippet}</p>}
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-[10px] text-neutral-400">{AI_LABELS[s.ai_model] ?? s.ai_model}</p>
                                                {s.brand_beneficiary && <p className="text-[10px] text-purple-500">{s.brand_beneficiary}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 자사 소스 현황 */}
                        <div className="p-3 bg-neutral-50 border border-neutral-100">
                            <p className="text-[11px] font-semibold text-neutral-600 mb-1">자사 노출 소스 현황</p>
                            {ownSources.length > 0 ? (
                                <p className="text-[11px] text-neutral-500">자사 소스 {ownSources.length}건 감지. 경쟁사 대비 {Math.round((ownSources.length / Math.max(competitorSources.length, 1)) * 100)}% 수준.</p>
                            ) : (
                                <p className="text-[11px] text-red-500">자사 콘텐츠가 AI 인용 소스로 감지되지 않았다. 콘텐츠 생산이 시급하다.</p>
                            )}
                        </div>
                    </section>
                )}

                {/* ── 07. 갭 진단 ── */}
                {gaps.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="07" title="갭 진단" />
                        <div className="space-y-3">
                            {gaps.map(g => (
                                <div key={g.id} className={`border p-4 ${GAP_COLORS[g.gap_type] ?? "bg-neutral-50 border-neutral-200 text-neutral-700"}`}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[11px] font-bold">
                                            {GAP_LABELS[g.gap_type] ?? g.gap_type}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] opacity-70">심각도</span>
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-2 h-2 rounded-full ${i < g.severity ? "bg-current" : "bg-current opacity-20"}`}
                                                    />
                                                ))}
                                            </div>
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

                {/* ── 08. 브랜드 보이스 전환 가이드 ── */}
                {voiceBriefs.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="08" title="브랜드 보이스 전환 가이드" />
                        <p className="text-[11px] text-neutral-400 mb-4">
                            AI 추천을 획득하기 위해 만들어야 할 콘텐츠 브리프. 소비자 질문 패턴과 경쟁사 소스 분석을 기반으로 도출됐다.
                        </p>
                        <div className="space-y-4">
                            {voiceBriefs.map((b, i) => (
                                <div key={b.id} className="border border-neutral-100 p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono text-neutral-300">{String(i + 1).padStart(2, "0")}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">
                                                {CONTENT_TYPE_KO[b.content_type] ?? b.content_type}
                                            </span>
                                            {b.priority === 1 && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 font-semibold">즉시 실행</span>
                                            )}
                                        </div>
                                        {b.target_ai && b.target_ai.length > 0 && (
                                            <div className="flex gap-1">
                                                {b.target_ai.map(ai => (
                                                    <span key={ai} className="text-[9px] px-1 py-0.5 bg-blue-50 text-blue-500">{AI_LABELS[ai] ?? ai}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {b.title_suggestion && (
                                        <p className="text-sm font-semibold text-neutral-800 mb-2">"{b.title_suggestion}"</p>
                                    )}

                                    {b.target_pattern && (
                                        <div className="mb-3">
                                            <p className="text-[10px] text-neutral-400 mb-0.5">공략 질문 패턴</p>
                                            <p className="text-[11px] text-neutral-600 italic">"{b.target_pattern}"</p>
                                        </div>
                                    )}

                                    {b.why && (
                                        <div className="mb-3 pl-2 border-l-2 border-amber-200">
                                            <p className="text-[11px] text-amber-700">{b.why}</p>
                                        </div>
                                    )}

                                    {b.key_messages && b.key_messages.length > 0 && (
                                        <div>
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
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── 09. 구조화 데이터 코드 ── */}
                {questions.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="09" title="구조화 데이터 코드 (JSON-LD)" />
                        <p className="text-[11px] text-neutral-400 mb-3">
                            아래 JSON-LD를 사이트 <code className="bg-neutral-100 px-1 text-[10px]">&lt;head&gt;</code>에 삽입하면 AI 검색엔진의 콘텐츠 파싱 정확도가 향상된다.
                        </p>

                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                                <p className="text-[11px] font-semibold text-neutral-600">FAQPage 스키마</p>
                            </div>
                            <pre className="bg-neutral-900 text-neutral-100 text-[10px] p-4 overflow-x-auto leading-relaxed rounded-none font-mono">
                                <code>{JSON.stringify(faqJsonLd, null, 2)}</code>
                            </pre>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                                <p className="text-[11px] font-semibold text-neutral-600">Organization 스키마</p>
                            </div>
                            <pre className="bg-neutral-900 text-neutral-100 text-[10px] p-4 overflow-x-auto leading-relaxed rounded-none font-mono">
                                <code>{JSON.stringify(orgJsonLd, null, 2)}</code>
                            </pre>
                        </div>
                    </section>
                )}

                {/* ── 10. 액션 플랜 ── */}
                {actions.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="10" title="액션 플랜" />
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-neutral-50">
                                    <th className="text-left p-2 border border-neutral-100 font-medium text-neutral-500 w-6">#</th>
                                    <th className="text-left p-2 border border-neutral-100 font-medium text-neutral-500 w-16">우선순위</th>
                                    <th className="text-left p-2 border border-neutral-100 font-medium text-neutral-500">조치 내용</th>
                                    <th className="p-2 border border-neutral-100 font-medium text-neutral-500 w-20">담당</th>
                                    <th className="p-2 border border-neutral-100 font-medium text-neutral-500 w-20">기한</th>
                                    <th className="p-2 border border-neutral-100 font-medium text-neutral-500 w-16">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actions.map((a, i) => (
                                    <tr key={a.id} className={i % 2 === 0 ? "bg-white" : "bg-neutral-50/50"}>
                                        <td className="p-2 border border-neutral-100 text-neutral-400 font-mono">{i + 1}</td>
                                        <td className="p-2 border border-neutral-100 text-center">
                                            <span className={`text-[10px] px-1.5 py-0.5 font-semibold ${
                                                a.priority === 1 ? "bg-red-100 text-red-600" :
                                                a.priority === 2 ? "bg-amber-100 text-amber-600" :
                                                "bg-neutral-100 text-neutral-400"
                                            }`}>
                                                P{a.priority}
                                            </span>
                                        </td>
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

                {/* ── 11. 브랜드 가치 진단 ── */}
                {brandValues && (
                    <section className="mb-10">
                        <SectionTitle num="11" title="브랜드 가치 진단 (인지도·호감도·추천도·만족도)" />
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {[
                                { label: "인지도", score: brandValues.awareness_score, icon: "👁️", desc: "AI·검색·소셜에서 브랜드가 알려진 정도" },
                                { label: "호감도", score: brandValues.favorability_score, icon: "❤️", desc: "소비자가 브랜드를 긍정적으로 인식하는 정도" },
                                { label: "추천도", score: brandValues.recommendation_score, icon: "👍", desc: "AI·소비자가 브랜드를 추천하는 빈도" },
                                { label: "만족도", score: brandValues.satisfaction_score, icon: "⭐", desc: "구매 후 만족도·재구매 의향" },
                            ].map(v => (
                                <div key={v.label} className="border border-neutral-100 p-3">
                                    <p className="text-[10px] text-neutral-400 mb-1">{v.icon} {v.label}</p>
                                    <p className={`text-2xl font-bold ${v.score >= 60 ? "text-emerald-600" : v.score >= 30 ? "text-amber-600" : "text-red-500"}`}>
                                        {v.score}<span className="text-xs font-normal text-neutral-400">/100</span>
                                    </p>
                                    <div className="mt-1.5 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${v.score >= 60 ? "bg-emerald-400" : v.score >= 30 ? "bg-amber-400" : "bg-red-400"}`}
                                            style={{ width: `${v.score}%` }} />
                                    </div>
                                    <p className="text-[9px] text-neutral-400 mt-1">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-neutral-50 border border-neutral-100">
                            <p className="text-[10px] font-semibold text-neutral-600 mb-1">종합 점수: {brandValues.overall_score}/100</p>
                            <p className="text-[11px] text-neutral-500 leading-relaxed">{brandValues.diagnosis_text}</p>
                        </div>
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-100">
                            <p className="text-[10px] font-semibold text-amber-700 mb-1">개선 방향</p>
                            <ul className="text-[11px] text-neutral-600 space-y-1 list-disc list-inside">
                                {brandValues.awareness_score < 30 && <li>인지도 구축: 위키피디아 등록, SEO 최적화, PR/인플루언서 활용</li>}
                                {brandValues.favorability_score < 50 && <li>호감도 개선: 부정 리뷰 대응, 제품 개선 포인트 반영, 브랜드 스토리 강화</li>}
                                {brandValues.recommendation_score < 50 && <li>추천도 강화: AEO 콘텐츠 생산, 리뷰 활성화, 비교 콘텐츠 제작</li>}
                                {brandValues.satisfaction_score < 50 && <li>만족도 제고: 핵심 불만 해결, 재구매 프로그램, 고객 커뮤니케이션 강화</li>}
                            </ul>
                        </div>
                    </section>
                )}

                {/* ── 12. 세일즈 액션 플랜 ── */}
                <section className="mb-10">
                    <SectionTitle num="12" title="세일즈 액션 플랜" />
                    <p className="text-[11px] text-neutral-400 mb-4">
                        분석 결과를 바탕으로, 매출을 올리기 위한 구체적 실행 계획을 제안합니다.
                    </p>
                    <div className="space-y-3">
                        {[
                            {
                                phase: "즉시 (1~2주)",
                                color: "border-red-200 bg-red-50",
                                actions: score?.gap_summary?.quick_wins?.slice(0, 3) ?? ["빠른 개선 데이터 없음 — Gap Analyzer 실행 필요"],
                            },
                            {
                                phase: "단기 (1~3개월)",
                                color: "border-amber-200 bg-amber-50",
                                actions: [
                                    "AEO 콘텐츠 브리프 5건 실행 (Voice Designer 결과 기반)",
                                    "검색 최적화 (SEO) — 핵심 키워드 상위 노출 전략",
                                    "리뷰 확보 캠페인 — 구매 고객 리뷰 요청 자동화",
                                ],
                            },
                            {
                                phase: "중장기 (3~6개월)",
                                color: "border-blue-200 bg-blue-50",
                                actions: [
                                    "월간 Gravity Score 모니터링 + 재스캔",
                                    "경쟁사 벤치마크 정기 비교",
                                    "구조화 데이터 + 위키피디아 등록으로 AI 학습 소스 확보",
                                ],
                            },
                        ].map(p => (
                            <div key={p.phase} className={`border p-3 ${p.color}`}>
                                <p className="text-xs font-semibold text-neutral-700 mb-2">{p.phase}</p>
                                <ul className="text-[11px] text-neutral-600 space-y-1">
                                    {p.actions.map((a, i) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                            <span className="text-neutral-400">•</span>
                                            <span>{a}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 부록 구분선 ── */}
                <div className="border-t-2 border-neutral-200 pt-8 mt-8 mb-8">
                    <p className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold">Appendix</p>
                </div>

                {/* ── 부록 A: 상황 문장 세트 ── */}
                {questions.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="A" title="상황 문장 세트 (AI 탐침 질문)" />
                        <p className="text-[11px] text-neutral-400 mb-3">
                            소비자가 AI에게 묻는 실제 질문 패턴. 이 문장들을 FAQ 콘텐츠의 제목으로 활용하라.
                        </p>
                        <div className="space-y-1.5">
                            {questions.map((q, i) => (
                                <div key={q.id} className="flex gap-3 items-start border border-neutral-100 p-2.5">
                                    <span className="text-[10px] font-mono text-neutral-300 w-5 shrink-0 mt-0.5">{i + 1}</span>
                                    <div className="flex-1">
                                        <p className="text-xs text-neutral-700">{q.pattern_text}</p>
                                        {q.cluster_label && (
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] text-neutral-400">#{q.cluster_label}</span>
                                                {q.frequency > 0 && <span className="text-[9px] text-neutral-300">빈도 {q.frequency}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── 부록 B: 측정 방법론 ── */}
                <section className="mb-10">
                    <SectionTitle num="B" title="Brand Gravity 측정 방법론" />
                    <div className="space-y-3 text-[11px] text-neutral-600 leading-relaxed">
                        <div className="border border-neutral-100 p-4">
                            <p className="font-semibold text-neutral-700 mb-2">Gravity Score 공식</p>
                            <p className="font-mono text-xs bg-neutral-50 p-2 mb-2">
                                Gravity Score = Mention(40) + Context(25) + Rank(20) + Coverage(15)
                            </p>
                            <ul className="space-y-1">
                                <li><strong>Mention Score (40점)</strong>: AI 응답 내 브랜드 언급 비율 × 40</li>
                                <li><strong>Context Score (25점)</strong>: 자사 소스 비율(60%) + 소스 다양성(40%) × 25</li>
                                <li><strong>Rank Score (20점)</strong>: 추천 리스트 내 브랜드 순위 가중치 × 20</li>
                                <li><strong>Coverage Score (15점)</strong>: 5대 AI 엔진 중 브랜드를 언급한 엔진 수 비율 × 15</li>
                            </ul>
                        </div>
                        <div className="border border-neutral-100 p-4">
                            <p className="font-semibold text-neutral-700 mb-2">탐침 프로세스</p>
                            <ol className="space-y-1 list-decimal list-inside">
                                <li>Pain Collector: 네이버 블로그/리뷰에서 소비자 발화 수집</li>
                                <li>Pain Classifier: Claude API로 페인 포인트 분류 및 신뢰도 산정</li>
                                <li>Question Mapper: 페인 포인트 → 상황 질문 패턴 클러스터링</li>
                                <li>AI Prober: 5대 AI에 질문 후 응답 분석 (브랜드 언급/순위/맥락)</li>
                                <li>Gap Analyzer: 탐침 결과 기반 갭 유형 진단 및 Gravity Score 산출</li>
                                <li>Source Tracer: AI 응답의 인용 소스 역추적 분석</li>
                                <li>Voice Designer: 갭과 소스 패턴 기반 콘텐츠 브리프 생성</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* ── 부록 C: 경쟁사 상세 ── */}
                {competitorData.length > 0 && (
                    <section className="mb-10">
                        <SectionTitle num="C" title="경쟁사 Gravity Score 상세" />
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="bg-neutral-50">
                                    <th className="text-left p-2 border border-neutral-100 font-medium text-neutral-500">브랜드</th>
                                    <th className="text-right p-2 border border-neutral-100 font-medium text-neutral-500 w-20">Score</th>
                                    <th className="p-2 border border-neutral-100 font-medium text-neutral-500 w-16">등급</th>
                                    <th className="p-2 border border-neutral-100 font-medium text-neutral-500 w-40">자사 대비</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-amber-50">
                                    <td className="p-2 border border-neutral-100 font-semibold text-amber-700">{product.name} (자사)</td>
                                    <td className="p-2 border border-neutral-100 text-right font-bold text-amber-700">{score?.gravity_score ?? 0}</td>
                                    <td className="p-2 border border-neutral-100 text-center font-bold text-amber-700">{grade?.grade}</td>
                                    <td className="p-2 border border-neutral-100 text-center text-neutral-400">—</td>
                                </tr>
                                {competitorData.map((c) => {
                                    const diff = c.displayScore - (score?.gravity_score ?? 0);
                                    const compGrade = scoreGrade(c.displayScore);
                                    return (
                                        <tr key={c.name}>
                                            <td className="p-2 border border-neutral-100 text-neutral-700">{c.name}</td>
                                            <td className="p-2 border border-neutral-100 text-right text-neutral-600">{c.displayScore}</td>
                                            <td className={`p-2 border border-neutral-100 text-center font-semibold ${compGrade.color}`}>{compGrade.grade}</td>
                                            <td className="p-2 border border-neutral-100 text-center">
                                                <span className={`text-[11px] font-mono ${diff > 0 ? "text-red-500" : "text-emerald-600"}`}>
                                                    {diff > 0 ? `+${diff}` : diff}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* ── 부록 D: 용어 정의 ── */}
                <section className="mb-10">
                    <SectionTitle num="D" title="용어 정의" />
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
                        {[
                            { term: "Brand Gravity", def: "AI 추천 엔진이 브랜드를 자발적으로 추천하는 인력(引力)" },
                            { term: "AEO", def: "AI Engine Optimization — AI 추천 최적화 전략" },
                            { term: "AI Prober", def: "5대 AI에 질문을 던져 브랜드 등장 여부를 자동 측정하는 엔진" },
                            { term: "카테고리 역풍", def: "AI가 특정 카테고리 자체를 기피하거나 추천을 거부하는 현상" },
                            { term: "Pain Point", def: "소비자 후기·리뷰에서 추출한 실제 불만·필요·기대" },
                            { term: "Source Trace", def: "AI가 브랜드를 추천할 때 참조하는 인터넷 소스 역추적" },
                            { term: "Voice Brief", def: "AI 추천을 획득하기 위해 제작해야 할 콘텐츠 명세서" },
                            { term: "Gravity Score", def: "Mention+Context+Rank+Coverage 4개 지표의 합산 (0~100)" },
                            { term: "Context Score", def: "AI 언급 시 의도한 맥락(용도/상황)과 일치하는 정도" },
                            { term: "JSON-LD", def: "AI/검색엔진이 콘텐츠를 정확히 파싱하도록 돕는 구조화 데이터" },
                        ].map(({ term, def }) => (
                            <div key={term} className="flex gap-2 py-1.5 border-b border-neutral-50">
                                <span className="font-semibold text-neutral-700 shrink-0 w-28">{term}</span>
                                <span className="text-neutral-500 leading-snug">{def}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 푸터 ── */}
                <div className="border-t border-neutral-100 pt-6 mt-8 flex items-center justify-between text-[10px] text-neutral-300">
                    <span>Brand Gravity Report by TenOne · Confidential</span>
                    <span>{today} 발행</span>
                </div>
            </div>

            {/* 인쇄 스타일 */}
            <style>{`
                @media print {
                    @page { margin: 20mm 16mm; size: A4; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    section { page-break-inside: avoid; }
                    pre { white-space: pre-wrap; word-break: break-all; }
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

function StatCard({ label, value, sub, accent }: {
    label: string;
    value: string;
    sub: string;
    accent: "emerald" | "amber" | "red";
}) {
    const colors = {
        emerald: "border-emerald-100 bg-emerald-50",
        amber: "border-amber-100 bg-amber-50",
        red: "border-red-100 bg-red-50",
    };
    const valueColors = {
        emerald: "text-emerald-700",
        amber: "text-amber-700",
        red: "text-red-600",
    };
    return (
        <div className={`border p-4 ${colors[accent]}`}>
            <p className="text-[10px] text-neutral-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold font-mono ${valueColors[accent]}`}>{value}</p>
            <p className="text-[10px] text-neutral-400 mt-1">{sub}</p>
        </div>
    );
}
