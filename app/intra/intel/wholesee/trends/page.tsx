"use client";

import { useState, useEffect } from "react";
import { Clock, Eye, Search, LayoutGrid, List, ExternalLink, TrendingUp, Loader2, Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface TrendArticle {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    status: "trending" | "rising" | "signal" | "fading";
    date: string;
    readTime: string;
    views: number;
    author?: string;
    content?: string;
}

const categories = [
    "전체", "AI / 테크", "마케팅", "소비자", "비즈니스",
    "콘텐츠", "라이프스타일", "인재/커리어", "크리에이터",
];

function mapDbToTrend(r: Record<string, unknown>): TrendArticle {
    const score = (r.relevance_score as number) || 5;
    const status = score >= 9 ? "trending" : score >= 7.5 ? "rising" : score >= 6 ? "signal" : "fading";
    return {
        id: (r.id as string) || "",
        title: (r.title as string) || "",
        excerpt: (r.summary as string) || "",
        category: (r.category as string) || "",
        status,
        date: ((r.published_at as string) || (r.created_at as string) || "").slice(5, 10).replace("-", "."),
        readTime: `${Math.max(3, Math.ceil(((r.full_content as string) || "").length / 300))}분`,
        views: (r.view_count as number) || 0,
        author: (r.agent_name as string) || "Mindle AI",
        content: (r.full_content as string) || "",
    };
}

const intraBadge: Record<string, { label: string; bg: string; text: string }> = {
    trending: { label: "급상승", bg: "bg-red-50", text: "text-red-600" },
    rising: { label: "상승", bg: "bg-amber-50", text: "text-amber-600" },
    signal: { label: "신호", bg: "bg-blue-50", text: "text-blue-600" },
    fading: { label: "하락", bg: "bg-neutral-100", text: "text-neutral-500" },
};

export default function MindleTrendsPage() {
    const [selectedCat, setSelectedCat] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [featured, setFeatured] = useState<TrendArticle | null>(null);
    const [trends, setTrends] = useState<TrendArticle[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from("mindle_trends")
            .select("*")
            .eq("status", "published")
            .order("relevance_score", { ascending: false })
            .then(({ data }: { data: Record<string, unknown>[] | null }) => {
                if (data && data.length > 0) {
                    const mapped = data.map((r: Record<string, unknown>) => mapDbToTrend(r));
                    const feat = mapped.find((_, i) => !!(data[i] as Record<string, unknown>)?.is_featured) || mapped[0];
                    setFeatured(feat);
                    setTrends(mapped.filter((t: TrendArticle) => t.id !== feat.id));
                    setTotalCount(data.length);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = trends.filter((t) => {
        const matchCat = selectedCat === "전체" || t.category === selectedCat;
        const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    const badge = (status: string) => intraBadge[status] || intraBadge.fading;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
        );
    }

    // DB에 데이터 없음
    if (!featured && trends.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-base font-semibold text-neutral-900">트렌드 카드</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">Mindle AI 수집 · 0건</p>
                </div>
                <div className="border border-neutral-200 bg-neutral-50 p-12 text-center space-y-4">
                    <Radio className="h-8 w-8 text-neutral-300 mx-auto" />
                    <div>
                        <p className="text-sm font-medium text-neutral-700">수집된 트렌드가 없습니다</p>
                        <p className="text-xs text-neutral-400 mt-1">
                            RSS 소스를 추가하고 수집을 실행하면 AI가 트렌드 카드를 생성합니다.
                        </p>
                    </div>
                    <div className="flex justify-center gap-2">
                        <Link href="/intra/intel/wholesee/sources"
                            className="px-4 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-700 transition-colors">
                            RSS 소스 관리
                        </Link>
                        <Link href="/intra/intel/wholesee/pipeline"
                            className="px-4 py-2 text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">
                            파이프라인 보기
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-base font-semibold text-neutral-900">트렌드 카드</h2>
                    <p className="text-xs text-neutral-400 mt-0.5">Mindle AI 수집 · {totalCount}건</p>
                </div>
                {featured && (
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>최근 업데이트: {featured.date}</span>
                    </div>
                )}
            </div>

            {/* 주요 트렌드 카드 */}
            {featured && (
                <div className="border border-neutral-200 bg-white p-5 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                        <div className="lg:col-span-3 h-48 bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                            <div className="text-center text-neutral-300">
                                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                                <span className="text-xs">주요 트렌드</span>
                            </div>
                        </div>
                        <div className="lg:col-span-2 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 ${badge(featured.status).bg} ${badge(featured.status).text}`}>
                                    {badge(featured.status).label}
                                </span>
                                <span className="text-[10px] text-neutral-400">{featured.category}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-neutral-900 leading-snug mb-2">
                                {featured.title}
                            </h3>
                            <p className="text-[11px] text-neutral-500 leading-relaxed mb-3 line-clamp-3">{featured.excerpt}</p>
                            <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                                <span className="text-neutral-600 font-medium">{featured.author}</span>
                                <span>{featured.date}</span>
                                <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{featured.readTime}</span>
                                <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{featured.views.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 필터 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 pb-4 border-b border-neutral-100">
                <div className="flex flex-wrap gap-1 flex-1">
                    {categories.map((cat) => (
                        <button key={cat} onClick={() => setSelectedCat(cat)}
                            className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                                selectedCat === cat
                                    ? "bg-neutral-900 text-white"
                                    : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                            }`}>
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-300" />
                        <input type="text" placeholder="검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-7 pr-3 py-1.5 border border-neutral-200 text-[11px] text-neutral-700 placeholder-neutral-300 focus:outline-none focus:border-neutral-400 w-36" />
                    </div>
                    <div className="flex border border-neutral-200 overflow-hidden">
                        <button onClick={() => setViewMode("list")} className={`p-1.5 ${viewMode === "list" ? "bg-neutral-100 text-neutral-700" : "text-neutral-300"}`}>
                            <List className="w-3 h-3" />
                        </button>
                        <button onClick={() => setViewMode("grid")} className={`p-1.5 ${viewMode === "grid" ? "bg-neutral-100 text-neutral-700" : "text-neutral-300"}`}>
                            <LayoutGrid className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 기사 목록 */}
            {viewMode === "list" ? (
                <div className="divide-y divide-neutral-100">
                    {filtered.map((t) => (
                        <article key={t.id} className="group py-3 flex gap-3 hover:bg-neutral-50 transition-colors px-1">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 ${badge(t.status).bg} ${badge(t.status).text}`}>
                                        {badge(t.status).label}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 font-medium">{t.category}</span>
                                    <span className="text-[10px] text-neutral-300">{t.date}</span>
                                </div>
                                <h4 className="text-xs font-semibold text-neutral-800 leading-snug mb-1 group-hover:text-neutral-900">
                                    {t.title}
                                </h4>
                                <p className="text-[11px] text-neutral-400 line-clamp-1 mb-1.5">{t.excerpt}</p>
                                <div className="flex items-center gap-2.5 text-[10px] text-neutral-300">
                                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{t.readTime}</span>
                                    <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{t.views.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="hidden sm:block w-24 h-16 shrink-0 bg-neutral-50 border border-neutral-100" />
                        </article>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((t) => (
                        <article key={t.id} className="group border border-neutral-200 bg-white overflow-hidden hover:border-neutral-300 transition-all">
                            <div className="h-28 bg-neutral-50 flex items-center justify-center">
                                <ExternalLink className="w-5 h-5 text-neutral-200 group-hover:text-neutral-400 transition-colors" />
                            </div>
                            <div className="p-3">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 ${badge(t.status).bg} ${badge(t.status).text}`}>
                                        {badge(t.status).label}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">{t.category}</span>
                                </div>
                                <h4 className="text-xs font-semibold text-neutral-800 leading-snug mb-1.5 line-clamp-2 group-hover:text-neutral-900">{t.title}</h4>
                                <p className="text-[11px] text-neutral-400 line-clamp-2 mb-2">{t.excerpt}</p>
                                <div className="flex items-center gap-2 text-[10px] text-neutral-300">
                                    <span>{t.date}</span>
                                    <span>{t.readTime}</span>
                                    <span>{t.views.toLocaleString()} 조회</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {filtered.length === 0 && (
                <div className="text-center py-12 text-neutral-400">
                    <p className="text-xs">검색 결과가 없습니다.</p>
                </div>
            )}
        </div>
    );
}
