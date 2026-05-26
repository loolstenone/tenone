// Mindle 약신호 코너 — Phase 1-B (Newen K-Market Lens 패턴)
//
// 정직성 라벨:
//   - 산식: signal_score = relevance/10 × 0.7 + recency × 0.3
//   - mention_growth_pct: 카테고리 활성도 (같은 카테고리 모든 카드 공유)
//   - Phase 2에서 시계열 분석 + 자체 시그널 추출 알고리즘 도입 예정
//
// Server Component 전용. fetchPublishedTrends 응용 fetcher는 별도.

import Link from "next/link";
import { TrendingUp, Sparkles, ArrowUpRight } from "lucide-react";
import { categoryLabel, type MindleTrend } from "@/lib/mindle/trend-data";

export interface WeakSignal extends MindleTrend {
    signal_score: number | null;
    mention_growth_pct: number | null;
    percentile_rank: number | null;
}

interface WeakSignalCornerProps {
    items: WeakSignal[];
    minScore?: number;
}

export default function WeakSignalCorner({ items, minScore = 0.85 }: WeakSignalCornerProps) {
    const strong = items.filter(i => (i.signal_score ?? 0) >= minScore);
    if (strong.length === 0) return null;

    return (
        <section className="px-6 py-12">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <h2 className="text-lg font-bold text-white">약신호 (Weak Signals)</h2>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 uppercase tracking-wide">
                            지금 가속 중
                        </span>
                    </div>
                    <span className="text-[10px] text-indigo-400/40">
                        🔬 산식: relevance × 0.7 + 최근성 × 0.3 (단순 산식, Phase 2 시계열 분석 예정)
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {strong.slice(0, 6).map(t => (
                        <SignalCard key={t.id} item={t} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function SignalCard({ item }: { item: WeakSignal }) {
    const score = item.signal_score ?? 0;
    const scorePct = Math.round(score * 100);
    const growth = item.mention_growth_pct;
    const date = item.created_at.slice(5, 10).replace("-", ".");

    // 카테고리 활성도 라벨
    const growthLabel = growth === null
        ? null
        : growth >= 999
            ? "신규 카테고리"
            : growth > 0
                ? `+${Math.round(growth)}%`
                : `${Math.round(growth)}%`;
    const growthClass = growth === null || growth === 0
        ? "text-indigo-400/40"
        : growth > 0
            ? "text-emerald-400"
            : "text-rose-400";

    return (
        <Link
            href={`/mindle/trends/${item.id}`}
            className="group block rounded-xl bg-gradient-to-br from-amber-900/20 via-white/[0.02] to-transparent border border-amber-500/20 hover:border-amber-400/40 p-4 transition-all"
        >
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300">시그널 {scorePct}</span>
                </div>
                {growthLabel && (
                    <span className={`text-[10px] font-semibold ${growthClass}`}>
                        {growthLabel}
                    </span>
                )}
            </div>

            <h3 className="text-sm font-semibold text-white leading-snug mb-2 group-hover:text-amber-200 transition-colors line-clamp-2">
                {item.title}
            </h3>

            <div className="flex items-center justify-between text-[10px] text-indigo-400/40">
                <span>{categoryLabel(item.category)} · {date}</span>
                <ArrowUpRight className="w-3 h-3 group-hover:text-amber-300 transition-colors" />
            </div>

            {/* 시그널 강도 게이지 */}
            <div className="mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
                    style={{ width: `${scorePct}%` }}
                />
            </div>
        </Link>
    );
}
