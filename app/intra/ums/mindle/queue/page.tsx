// Mindle 검수 큐 (Server Component) — Whole See Step 3
// status='collected' 카드를 운영자가 1-click published/draft/rejected 전환

import Link from "next/link";
import { ExternalLink, Inbox } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/intra/IntraUI";
import { categoryLabel } from "@/lib/mindle/trend-data";
import QueueRow from "@/features/mindle/QueueRow";

export const dynamic = "force-dynamic";

interface QueueItem {
    id: string;
    title: string;
    summary: string;
    full_content: string | null;
    category: string;
    relevance_score: number;
    source_urls: string[];
    source_names: string[];
    agent_name: string;
    created_at: string;
}

async function fetchQueue(opts: { category?: string; minScore: number; maxScore: number; limit: number }): Promise<QueueItem[]> {
    const admin = createAdminClient();
    let q = admin
        .from("mindle_trends")
        .select("id, title, summary, full_content, category, relevance_score, source_urls, source_names, agent_name, created_at")
        .eq("status", "collected")
        .gte("relevance_score", opts.minScore)
        .lt("relevance_score", opts.maxScore)
        .order("relevance_score", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(opts.limit);

    if (opts.category && opts.category !== "all") {
        q = q.eq("category", opts.category);
    }

    const { data } = await q;
    return (data ?? []) as QueueItem[];
}

async function fetchCategoryCounts(): Promise<Array<{ category: string; count: number }>> {
    const admin = createAdminClient();
    const { data } = await admin
        .from("mindle_trends")
        .select("category")
        .eq("status", "collected");
    if (!data) return [];
    const counts: Record<string, number> = {};
    for (const r of data as Array<{ category: string }>) {
        counts[r.category] = (counts[r.category] ?? 0) + 1;
    }
    return Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
}

async function fetchScoreSummary(): Promise<{ total: number; score9: number; score8: number; score7: number; score6: number }> {
    const admin = createAdminClient();
    const { data, count } = await admin
        .from("mindle_trends")
        .select("relevance_score", { count: "exact" })
        .eq("status", "collected");
    if (!data) return { total: 0, score9: 0, score8: 0, score7: 0, score6: 0 };
    const summary = { total: count ?? data.length, score9: 0, score8: 0, score7: 0, score6: 0 };
    for (const r of data as Array<{ relevance_score: number }>) {
        if (r.relevance_score >= 9) summary.score9++;
        else if (r.relevance_score >= 8) summary.score8++;
        else if (r.relevance_score >= 7) summary.score7++;
        else summary.score6++;
    }
    return summary;
}

export default async function MindleQueuePage({
    searchParams,
}: {
    searchParams: Promise<{ cat?: string; score?: string }>;
}) {
    const sp = await searchParams;
    const activeCat = sp.cat ?? "all";
    const scoreFilter = sp.score ?? "all"; // 'all' | '9' | '8' | '7' | '6'

    const scoreRange: { min: number; max: number } = (() => {
        switch (scoreFilter) {
            case "9": return { min: 9, max: 11 };
            case "8": return { min: 8, max: 9 };
            case "7": return { min: 7, max: 8 };
            case "6": return { min: 6, max: 7 };
            default: return { min: 0, max: 11 };
        }
    })();

    const [items, categoryCounts, summary] = await Promise.all([
        fetchQueue({ category: activeCat, minScore: scoreRange.min, maxScore: scoreRange.max, limit: 50 }),
        fetchCategoryCounts(),
        fetchScoreSummary(),
    ]);

    function buildHref(patch: Partial<{ cat: string; score: string }>) {
        const params = new URLSearchParams();
        const next = {
            cat: patch.cat ?? activeCat,
            score: patch.score ?? scoreFilter,
        };
        if (next.cat && next.cat !== "all") params.set("cat", next.cat);
        if (next.score && next.score !== "all") params.set("score", next.score);
        const qs = params.toString();
        return qs ? `/intra/ums/mindle/queue?${qs}` : "/intra/ums/mindle/queue";
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Mindle 검수 큐"
                description={`Whole See가 자동 생성한 트렌드 카드를 1-click으로 발행·초안·기각 처리. 현재 검수 대기 ${summary.total.toLocaleString()}건.`}
            />

            {/* 점수 분포 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <ScoreCard label="전체" value={summary.total} active={scoreFilter === "all"} href={buildHref({ score: "all" })} />
                <ScoreCard label="9+" sub="자동 발행 후보" value={summary.score9} accent="#10b981" active={scoreFilter === "9"} href={buildHref({ score: "9" })} />
                <ScoreCard label="8~8.9" sub="우선 검수" value={summary.score8} accent="#3b82f6" active={scoreFilter === "8"} href={buildHref({ score: "8" })} />
                <ScoreCard label="7~7.9" sub="일반 검수" value={summary.score7} accent="#6366f1" active={scoreFilter === "7"} href={buildHref({ score: "7" })} />
                <ScoreCard label="6~6.9" sub="신중 검토" value={summary.score6} accent="#f59e0b" active={scoreFilter === "6"} href={buildHref({ score: "6" })} />
            </div>

            {/* 카테고리 필터 */}
            <div className="flex flex-wrap gap-1.5">
                <Link
                    href={buildHref({ cat: "all" })}
                    className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                        activeCat === "all" ? "bg-text text-white" : "bg-surface text-text-sub hover:text-text"
                    }`}
                >
                    전체 <span className="opacity-70">{summary.total}</span>
                </Link>
                {categoryCounts.map(c => (
                    <Link
                        key={c.category}
                        href={buildHref({ cat: c.category })}
                        className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                            activeCat === c.category ? "bg-text text-white" : "bg-surface text-text-sub hover:text-text"
                        }`}
                    >
                        {categoryLabel(c.category)} <span className="opacity-70">{c.count}</span>
                    </Link>
                ))}
            </div>

            {/* 카드 리스트 */}
            <div className="rounded-2xl border border-border bg-white overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-text">검수 대상 {items.length.toLocaleString()}건</h2>
                    <span className="text-xs text-text-muted">
                        🔬 mindle_trends · status=collected · 점수 내림차순 50건씩
                    </span>
                </div>

                {items.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <Inbox className="w-10 h-10 text-text-muted mx-auto mb-3" />
                        <p className="text-sm text-text-sub">검수 대기 카드가 없습니다.</p>
                        <p className="text-xs text-text-muted mt-1">
                            Whole See가 매시간 5건 자동 생성합니다. 다음 정각에 다시 확인하세요.
                        </p>
                        <Link
                            href="/mindle/trends"
                            className="inline-flex items-center gap-1 mt-4 text-xs text-text-sub hover:text-text"
                        >
                            발행된 카드 보기 <ExternalLink className="w-3 h-3" />
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {items.map(item => (
                            <QueueRow
                                key={item.id}
                                id={item.id}
                                title={item.title}
                                summary={item.summary}
                                category={item.category}
                                categoryLabel={categoryLabel(item.category)}
                                relevance={item.relevance_score}
                                sourceNames={item.source_names}
                                sourceUrls={item.source_urls}
                                agentName={item.agent_name}
                                createdAt={item.created_at}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ScoreCard({
    label,
    sub,
    value,
    accent,
    active,
    href,
}: {
    label: string;
    sub?: string;
    value: number;
    accent?: string;
    active: boolean;
    href: string;
}) {
    return (
        <Link
            href={href}
            className={`rounded-xl border p-3 transition-all ${
                active ? "border-text bg-text/5" : "border-border bg-white hover:border-text/30"
            }`}
        >
            <div className="text-[10px] font-semibold text-text-muted tracking-wider">{label}</div>
            <div className="text-2xl font-bold mt-1" style={{ color: accent ?? "#0F172A" }}>
                {value.toLocaleString()}
            </div>
            {sub && <div className="text-[10px] text-text-muted mt-0.5">{sub}</div>}
        </Link>
    );
}
