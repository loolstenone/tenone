// Mindle 트렌드 검색·목록 (Server Component) — Phase 0
// query params: ?cat=...&q=...&view=list|grid&page=1

import Link from "next/link";
import { Clock, Eye, Search, LayoutGrid, List, ArrowUpRight, Sparkles } from "lucide-react";
import {
    fetchPublishedTrends,
    countPublishedTrends,
    getCategoryCounts,
    categoryLabel,
    getTrendStatus,
    type MindleTrend,
} from "@/lib/mindle/trend-data";
import TrustLabel from "@/features/mindle/TrustLabel";

export const revalidate = 300;

const PAGE_SIZE = 18;

const CATEGORY_NAV = [
    "all",
    "tech",
    "trend_market",
    "business_corporate",
    "marketing_branding",
    "creator_trend",
    "talent_career",
    "industry_vertical",
    "community_signal",
];

const statusBadge: Record<string, { label: string; color: string }> = {
    trending: { label: "급상승", color: "bg-[#F5C518] text-black" },
    rising: { label: "상승", color: "bg-orange-500/20 text-orange-300" },
    signal: { label: "시그널", color: "bg-blue-500/20 text-blue-300" },
};

export default async function MindleTrendsPage({
    searchParams,
}: {
    searchParams: Promise<{ cat?: string; q?: string; view?: string; page?: string }>;
}) {
    const sp = await searchParams;
    const activeCat = sp.cat ?? "all";
    const query = sp.q ?? "";
    const viewMode: "list" | "grid" = sp.view === "grid" ? "grid" : "list";
    const pageNum = Math.max(1, Number(sp.page ?? "1") || 1);
    const offset = (pageNum - 1) * PAGE_SIZE;

    const [trends, totalCount, categoryCounts] = await Promise.all([
        fetchPublishedTrends({ category: activeCat, query, limit: PAGE_SIZE, offset }),
        countPublishedTrends({ category: activeCat, query }),
        getCategoryCounts(),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    // featured (별도 1건) — 1페이지에서만 표시
    const featuredArr = pageNum === 1 ? await fetchPublishedTrends({ featuredOnly: true, limit: 1 }) : [];
    const featured = featuredArr[0] ?? null;

    function buildHref(patch: Partial<{ cat: string; q: string; view: string; page: number }>) {
        const params = new URLSearchParams();
        const next = {
            cat: patch.cat ?? activeCat,
            q: patch.q ?? query,
            view: patch.view ?? viewMode,
            page: patch.page ?? 1,
        };
        if (next.cat && next.cat !== "all") params.set("cat", next.cat);
        if (next.q) params.set("q", next.q);
        if (next.view && next.view !== "list") params.set("view", next.view);
        if (next.page && Number(next.page) > 1) params.set("page", String(next.page));
        const qs = params.toString();
        return qs ? `/mindle/trends?${qs}` : "/mindle/trends";
    }

    return (
        <div className="bg-[#0A0A0A] min-h-screen">
            <div className="mx-auto max-w-5xl px-6">
                {/* Featured (1페이지 + 활성 카테고리=전체일 때만) */}
                {featured && activeCat === "all" && !query && (
                    <section className="py-8 border-b border-neutral-800/50">
                        <Link href={`/mindle/trends/${featured.id}`} className="group block">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
                                <span className="text-[10px] font-semibold text-[#F5C518] uppercase tracking-wider">
                                    Featured
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusBadge[getTrendStatus(featured.relevance_score)].color}`}>
                                    {statusBadge[getTrendStatus(featured.relevance_score)].label}
                                </span>
                                <span className="text-[11px] text-neutral-500">{categoryLabel(featured.category)}</span>
                            </div>
                            <h1 className="text-xl sm:text-3xl font-bold text-white leading-tight mb-3 group-hover:text-[#F5C518] transition-colors">
                                {featured.title}
                            </h1>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-3">{featured.summary}</p>
                            <TrustLabel
                                sources={featured.source_names}
                                sourceUrls={featured.source_urls}
                                analyzedAt={featured.created_at}
                                relevance={featured.relevance_score}
                                agentName={featured.agent_name}
                                accentClass="text-neutral-500"
                            />
                        </Link>
                    </section>
                )}

                {/* Filters & Search */}
                <section className="py-5 border-b border-neutral-800/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                        {CATEGORY_NAV.map((cat) => {
                            const isActive = activeCat === cat;
                            const count = cat === "all" ? totalCount : categoryCounts.find(c => c.category === cat)?.count ?? 0;
                            return (
                                <Link
                                    key={cat}
                                    href={buildHref({ cat, page: 1 })}
                                    className={`px-3 py-1 rounded text-[11px] font-semibold tracking-wide transition-colors ${
                                        isActive ? "bg-white text-black" : "text-neutral-500 hover:text-white"
                                    }`}
                                >
                                    {cat === "all" ? "전체" : categoryLabel(cat)} <span className="opacity-60">{count}</span>
                                </Link>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-2">
                        <form action="/mindle/trends" method="get" className="relative">
                            {activeCat !== "all" && <input type="hidden" name="cat" value={activeCat} />}
                            {viewMode !== "list" && <input type="hidden" name="view" value={viewMode} />}
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                            <input
                                name="q"
                                type="text"
                                placeholder="검색 후 Enter"
                                defaultValue={query}
                                className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-[12px] text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 w-40"
                            />
                        </form>
                        <div className="flex border border-neutral-800 rounded overflow-hidden">
                            <Link
                                href={buildHref({ view: "list" })}
                                className={`p-1.5 ${viewMode === "list" ? "bg-neutral-800 text-white" : "text-neutral-600"}`}
                            >
                                <List className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                                href={buildHref({ view: "grid" })}
                                className={`p-1.5 ${viewMode === "grid" ? "bg-neutral-800 text-white" : "text-neutral-600"}`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* 결과 메타 */}
                <div className="pt-4 text-xs text-neutral-500">
                    <span className="text-emerald-400">실측 DB</span> · 전체 <strong className="text-white">{totalCount.toLocaleString()}</strong>건
                    {query && <> · 검색 “{query}”</>}
                    {activeCat !== "all" && <> · {categoryLabel(activeCat)}</>}
                </div>

                {/* Articles */}
                <section className="py-6">
                    {trends.length === 0 ? (
                        <div className="text-center py-16 text-neutral-600">
                            <p className="text-sm">검색 결과가 없습니다.</p>
                        </div>
                    ) : viewMode === "list" ? (
                        <div className="divide-y divide-neutral-800/40">
                            {trends.map(t => <TrendListRow key={t.id} t={t} />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {trends.map(t => <TrendGridCard key={t.id} t={t} />)}
                        </div>
                    )}
                </section>

                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <section className="pb-12 flex items-center justify-center gap-2">
                        {pageNum > 1 && (
                            <Link
                                href={buildHref({ page: pageNum - 1 })}
                                className="px-3 py-1.5 text-xs text-neutral-400 border border-neutral-800 rounded hover:text-white"
                            >
                                ← 이전
                            </Link>
                        )}
                        <span className="text-xs text-neutral-500">
                            {pageNum} / {totalPages}
                        </span>
                        {pageNum < totalPages && (
                            <Link
                                href={buildHref({ page: pageNum + 1 })}
                                className="px-3 py-1.5 text-xs text-neutral-400 border border-neutral-800 rounded hover:text-white"
                            >
                                다음 →
                            </Link>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}

function TrendListRow({ t }: { t: MindleTrend }) {
    const status = getTrendStatus(t.relevance_score);
    const sb = statusBadge[status];
    return (
        <Link href={`/mindle/trends/${t.id}`}>
            <article className="group py-5 flex gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sb.color}`}>{sb.label}</span>
                        <span className="text-[10px] text-neutral-500 font-medium">{categoryLabel(t.category)}</span>
                        <span className="text-[10px] text-neutral-700">{t.created_at.slice(0, 10)}</span>
                    </div>
                    <h3 className="text-white font-bold text-[15px] leading-snug mb-1.5 group-hover:text-[#F5C518] transition-colors">
                        {t.title}
                    </h3>
                    <p className="text-neutral-500 text-[13px] line-clamp-1 mb-2">{t.summary}</p>
                    <div className="flex items-center gap-3 text-[10px] text-neutral-600">
                        {t.view_count > 0 && (
                            <span className="flex items-center gap-1">
                                <Eye className="w-2.5 h-2.5" />
                                {t.view_count.toLocaleString()}
                            </span>
                        )}
                        <span>관련성 {Math.round(t.relevance_score * 100)}%</span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            출처 {t.source_names.length}
                        </span>
                    </div>
                </div>
                <div className="hidden sm:block w-28 h-20 shrink-0 rounded-lg bg-neutral-900 border border-neutral-800/50 group-hover:border-[#F5C518]/20 transition-colors" />
            </article>
        </Link>
    );
}

function TrendGridCard({ t }: { t: MindleTrend }) {
    const status = getTrendStatus(t.relevance_score);
    const sb = statusBadge[status];
    return (
        <Link href={`/mindle/trends/${t.id}`}>
            <article className="group rounded-xl border border-neutral-800/50 bg-neutral-900/20 overflow-hidden hover:border-[#F5C518]/30 transition-all h-full flex flex-col">
                <div className="h-32 bg-gradient-to-br from-neutral-800/30 to-neutral-900 flex items-center justify-center">
                    <ArrowUpRight className="w-6 h-6 text-neutral-800 group-hover:text-[#F5C518]/30 transition-colors" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sb.color}`}>{sb.label}</span>
                        <span className="text-[10px] text-neutral-500">{categoryLabel(t.category)}</span>
                    </div>
                    <h3 className="text-white font-bold text-sm leading-snug mb-2 group-hover:text-[#F5C518] transition-colors line-clamp-2">
                        {t.title}
                    </h3>
                    <p className="text-neutral-500 text-[12px] line-clamp-2 mb-3">{t.summary}</p>
                    <div className="mt-auto flex items-center gap-2 text-[10px] text-neutral-600">
                        <span>{t.created_at.slice(0, 10)}</span>
                        <span>관련성 {Math.round(t.relevance_score * 100)}%</span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
