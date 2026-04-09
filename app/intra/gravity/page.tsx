"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, RefreshCw, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Product {
    id: string;
    name: string;
    client_name: string;
    category: string;
    created_at: string;
    competitors: string[];
    target_keywords: string[];
}

interface GravityScore {
    gravity_score: number;
    mention_score: number;
    rank_score: number;
    coverage_score: number;
    scan_date: string;
}

export default function GravityDashboardPage() {
    const supabase = createClient();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [scores, setScores] = useState<Record<string, GravityScore>>({});
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase
            .from("bg_products")
            .select("id, name, category, created_at, competitors, target_keywords, bg_clients(name)")
            .order("created_at", { ascending: false });

        const mapped = (data ?? []).map((p: {
            id: string; name: string; category: string; created_at: string;
            competitors: string[] | null; target_keywords: string[] | null;
            bg_clients: { name: string } | null;
        }) => ({
            id: p.id,
            name: p.name,
            client_name: p.bg_clients?.name ?? "",
            category: p.category,
            created_at: p.created_at,
            competitors: p.competitors ?? [],
            target_keywords: p.target_keywords ?? [],
        }));
        setProducts(mapped);

        if (data && data.length > 0) {
            const scoreMap: Record<string, GravityScore> = {};
            for (const p of data) {
                const { data: s } = await supabase
                    .from("bg_gravity_scores")
                    .select("gravity_score, mention_score, rank_score, coverage_score, scan_date")
                    .eq("product_id", p.id)
                    .order("scan_date", { ascending: false })
                    .limit(1)
                    .single();
                if (s) scoreMap[p.id] = s;
            }
            setScores(scoreMap);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => { load(); }, [load]);

    const runQuickScan = async (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        setScanning(product.id);
        try {
            await fetch("/api/gravity/pain/collect", {
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
            await fetch("/api/gravity/pain/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id }),
            });
            await fetch("/api/gravity/scan/run", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ product_id: product.id, brand_name: product.name }),
            });
        } finally {
            setScanning(null);
            await load();
        }
    };

    const scoreColor = (score: number) => {
        if (score >= 60) return "text-emerald-600";
        if (score >= 30) return "text-amber-600";
        return "text-red-500";
    };

    const scoreBg = (score: number) => {
        if (score >= 60) return "bg-emerald-50 border-emerald-200";
        if (score >= 30) return "bg-amber-50 border-amber-200";
        return "bg-red-50 border-red-200";
    };

    const ScoreIcon = ({ score }: { score: number }) => {
        if (score >= 60) return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
        if (score >= 30) return <Minus className="w-3.5 h-3.5 text-amber-500" />;
        return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
    };

    // 요약 통계
    const scanned = products.filter(p => scores[p.id]);
    const avgScore = scanned.length > 0
        ? Math.round(scanned.reduce((sum, p) => sum + scores[p.id].gravity_score, 0) / scanned.length)
        : 0;
    const highCount = scanned.filter(p => scores[p.id].gravity_score >= 60).length;
    const lowCount = scanned.filter(p => scores[p.id].gravity_score < 30).length;

    return (
        <div className="flex-1 flex flex-col min-h-0">
            <PageHeader
                title="Brand Gravity"
                description="AI 추천 브랜드 노출 분석 · AEO 콘텐츠 전략"
            >
                <button
                    onClick={() => router.push("/intra/gravity/clients")}
                    className="flex items-center gap-1.5 text-xs border border-neutral-200 px-3 py-1.5 text-neutral-600 hover:border-neutral-400 transition-colors"
                >
                    <Plus className="w-3 h-3" /> 클라이언트 추가
                </button>
            </PageHeader>

            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-neutral-400 text-sm">로딩 중...</div>
                ) : (
                    <div className="max-w-6xl mx-auto space-y-6">

                        {/* 요약 통계 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: "전체 클라이언트", value: products.length, sub: `${scanned.length}개 스캔 완료` },
                                { label: "평균 Gravity Score", value: avgScore, sub: "스캔 완료 기준" },
                                { label: "고성과 (60+)", value: highCount, sub: "추천 채널 노출 양호" },
                                { label: "긴급 개선 (30↓)", value: lowCount, sub: "즉각 조치 필요" },
                            ].map(s => (
                                <div key={s.label} className="p-4 bg-white border border-neutral-200">
                                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2">{s.label}</p>
                                    <p className="text-2xl font-semibold text-neutral-900">{s.value}</p>
                                    <p className="text-[11px] text-neutral-400 mt-1">{s.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* 클라이언트 그리드 */}
                        {products.length === 0 ? (
                            <div className="py-16 text-center border border-dashed border-neutral-200">
                                <p className="text-sm text-neutral-400 mb-3">등록된 클라이언트가 없습니다</p>
                                <button
                                    onClick={() => router.push("/intra/gravity/clients")}
                                    className="text-xs text-amber-600 hover:underline"
                                >
                                    클라이언트 추가 →
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {products.map(p => {
                                    const s = scores[p.id];
                                    const isScanning = scanning === p.id;
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => router.push(`/intra/gravity/${p.id}`)}
                                            className="bg-white border border-neutral-200 hover:border-neutral-400 cursor-pointer transition-colors group"
                                        >
                                            {/* 스코어 배너 */}
                                            {s ? (
                                                <div className={`px-4 py-2 border-b ${scoreBg(s.gravity_score)} flex items-center justify-between`}>
                                                    <div className="flex items-center gap-1.5">
                                                        <ScoreIcon score={s.gravity_score} />
                                                        <span className={`text-xs font-semibold ${scoreColor(s.gravity_score)}`}>
                                                            Gravity Score {s.gravity_score}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-neutral-400">
                                                        {new Date(s.scan_date).toLocaleDateString("ko-KR")}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="px-4 py-2 border-b bg-neutral-50 border-neutral-100">
                                                    <span className="text-[10px] text-neutral-400">미스캔</span>
                                                </div>
                                            )}

                                            {/* 카드 본문 */}
                                            <div className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors">
                                                            {p.name}
                                                        </p>
                                                        <p className="text-xs text-neutral-400">{p.client_name}</p>
                                                    </div>
                                                    {s && (
                                                        <span className={`text-3xl font-bold font-mono ${scoreColor(s.gravity_score)}`}>
                                                            {s.gravity_score}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* 서브스코어 */}
                                                {s && (
                                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                                        {[
                                                            { label: "Mention", value: s.mention_score, max: 40 },
                                                            { label: "Rank", value: s.rank_score, max: 30 },
                                                            { label: "Coverage", value: s.coverage_score, max: 30 },
                                                        ].map(m => (
                                                            <div key={m.label}>
                                                                <p className="text-[9px] text-neutral-400 mb-1">{m.label}</p>
                                                                <div className="h-1 bg-neutral-100">
                                                                    <div
                                                                        className="h-full bg-amber-400"
                                                                        style={{ width: `${(m.value / m.max) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <p className="text-[9px] text-neutral-500 mt-0.5">{m.value}/{m.max}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500">{p.category}</span>
                                                    <button
                                                        onClick={e => runQuickScan(e, p)}
                                                        disabled={!!scanning}
                                                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {isScanning
                                                            ? <><RefreshCw className="w-3 h-3 animate-spin" /> 스캔 중</>
                                                            : <><PlayCircle className="w-3 h-3" /> 퀵 스캔</>
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
