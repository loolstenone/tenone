"use client";

import { useState, useEffect } from "react";
import { Search, Brain, ShoppingCart, Eye, Heart, Star, ThumbsUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PrescanResult {
    market_type: string;
    brand_mention_rate: number;
    competitor_mention_rates: Record<string, number>;
    journey_heatmap: Record<string, Array<{ brand: boolean; competitors: string[]; question?: string }>>;
    diagnosis_text: string;
}

interface BrandValues {
    awareness_score: number;
    favorability_score: number;
    recommendation_score: number;
    satisfaction_score: number;
    overall_score: number;
    diagnosis_text: string;
}

const MARKET_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    "A'": { label: "카테고리 비가시", color: "text-red-600", bg: "bg-red-50 border-red-200" },
    "A": { label: "무명 브랜드", color: "text-red-500", bg: "bg-red-50 border-red-200" },
    "B": { label: "인지-비추천", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
    "C": { label: "선점 브랜드", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
};

const JOURNEY_LABELS: Record<string, string> = {
    awareness: "인지",
    exploration: "탐색",
    comparison: "비교",
    purchase: "구매결정",
    loyalty: "재구매",
};

function ScoreBar({ label, score, max, icon }: { label: string; score: number; max: number; icon: React.ReactNode }) {
    const pct = max > 0 ? (score / max) * 100 : 0;
    const color = score >= 60 ? "bg-emerald-400" : score >= 30 ? "bg-amber-400" : "bg-red-400";
    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-16 text-[10px] text-neutral-500">
                {icon}
                <span>{label}</span>
            </div>
            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-mono font-semibold text-neutral-700 w-8 text-right">{score}</span>
        </div>
    );
}

export function PrescanCard({ productId }: { productId: string }) {
    const supabase = createClient();
    const [prescan, setPrescan] = useState<PrescanResult | null>(null);
    const [values, setValues] = useState<BrandValues | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [{ data: ps }, { data: bv }] = await Promise.all([
                supabase
                    .from("bg_prescan_results")
                    .select("market_type, brand_mention_rate, competitor_mention_rates, journey_heatmap, diagnosis_text")
                    .eq("product_id", productId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single(),
                supabase
                    .from("bg_brand_values")
                    .select("awareness_score, favorability_score, recommendation_score, satisfaction_score, overall_score, diagnosis_text")
                    .eq("product_id", productId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .single(),
            ]);
            setPrescan(ps);
            setValues(bv);
            setLoading(false);
        }
        load();
    }, [supabase, productId]);

    if (loading) return null;
    if (!prescan && !values) return null;

    const mt = prescan ? MARKET_TYPE_LABELS[prescan.market_type] || MARKET_TYPE_LABELS["A"] : null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Pre-Scan 결과 */}
            {prescan && mt && (
                <div className="bg-white border border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5 text-blue-500" />
                            <p className="text-xs font-semibold text-neutral-700">시장 사전 진단</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 border font-semibold ${mt.bg} ${mt.color}`}>
                            {prescan.market_type} · {mt.label}
                        </span>
                    </div>

                    {/* AI 언급률 */}
                    <div className="mb-3">
                        <p className="text-[10px] text-neutral-400 mb-1">AI 브랜드 언급률</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-neutral-900">{prescan.brand_mention_rate}%</span>
                            <span className="text-[10px] text-neutral-400">/ 경쟁사 평균 {
                                (() => {
                                    const rates = Object.values(prescan.competitor_mention_rates || {});
                                    return rates.length > 0 ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0;
                                })()
                            }%</span>
                        </div>
                    </div>

                    {/* 구매 여정 히트맵 */}
                    {prescan.journey_heatmap && Object.keys(prescan.journey_heatmap).length > 0 && (
                        <div>
                            <p className="text-[10px] text-neutral-400 mb-1.5">구매 여정 AI 가시성</p>
                            <div className="space-y-1.5">
                                {Object.entries(prescan.journey_heatmap).map(([stage, probes]) => (
                                    <div key={stage} className="flex items-start gap-2">
                                        <span className="text-[10px] text-neutral-500 w-12 pt-0.5 shrink-0">{JOURNEY_LABELS[stage] || stage}</span>
                                        <div className="flex flex-col gap-1 flex-1">
                                            {probes.map((p, i) => (
                                                <div
                                                    key={i}
                                                    title={p.question || `질문 ${i + 1}`}
                                                    className={`flex items-center gap-1.5 px-1.5 py-0.5 border cursor-default ${p.brand ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}
                                                >
                                                    <span className={`text-[9px] font-bold ${p.brand ? "text-emerald-600" : "text-red-400"}`}>
                                                        {p.brand ? "✓" : "✗"}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-500 truncate">
                                                        {p.question ? p.question.slice(0, 28) + (p.question.length > 28 ? "…" : "") : `질문 ${i + 1}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 진단 문장 */}
                    <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed">{prescan.diagnosis_text}</p>
                </div>
            )}

            {/* Brand Value Card */}
            {values && (
                <div className="bg-white border border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-violet-500" />
                            <p className="text-xs font-semibold text-neutral-700">브랜드 가치</p>
                        </div>
                        <span className="text-lg font-bold text-neutral-900">{values.overall_score}<span className="text-xs font-normal text-neutral-400">/100</span></span>
                    </div>

                    <div className="space-y-2.5">
                        <ScoreBar label="인지도" score={values.awareness_score} max={100} icon={<Eye className="w-3 h-3" />} />
                        <ScoreBar label="호감도" score={values.favorability_score} max={100} icon={<Heart className="w-3 h-3" />} />
                        <ScoreBar label="추천도" score={values.recommendation_score} max={100} icon={<ThumbsUp className="w-3 h-3" />} />
                        <ScoreBar label="만족도" score={values.satisfaction_score} max={100} icon={<Star className="w-3 h-3" />} />
                    </div>

                    <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed">{values.diagnosis_text}</p>
                </div>
            )}
        </div>
    );
}
