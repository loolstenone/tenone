"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, LayoutGrid, List, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import PostCard from "./PostCard";
import PostListItem from "./PostListItem";
import PostAccordion from "./PostAccordion";
import type { Post, PostListResponse, BoardConfig, PostListParams, SiteCode } from "@/types/board";

interface BoardListProps {
    site: SiteCode;
    board: string;
    boardConfig?: BoardConfig;
    accentColor?: string;
    layout?: 'default' | 'accordion';
    onPostClick?: (post: Post) => void;
}

type SortOption = "latest" | "popular" | "comments" | "views";
type PeriodOption = "all" | "today" | "week" | "month" | "year";

const sortLabels: Record<SortOption, string> = {
    latest: "최신순",
    popular: "인기순",
    comments: "댓글순",
    views: "조회순",
};

const periodLabels: Record<PeriodOption, string> = {
    all: "전체",
    today: "오늘",
    week: "이번 주",
    month: "이번 달",
    year: "올해",
};

export default function BoardList({ site, board, boardConfig, accentColor = "#171717", layout = 'default', onPostClick }: BoardListProps) {
    const defaultView = boardConfig?.settings?.defaultView || "card";
    const defaultLimit = boardConfig?.settings?.postsPerPage || 12;

    const [posts, setPosts] = useState<Post[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const [viewMode, setViewMode] = useState<"card" | "list">(defaultView);
    const [page, setPage] = useState(1);
    const [limit] = useState(defaultLimit);
    const [category, setCategory] = useState<string>("");
    const [sort, setSort] = useState<SortOption>("latest");
    const [period, setPeriod] = useState<PeriodOption>("all");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const categories = boardConfig?.categories || [];

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                site,
                board,
                page: String(page),
                limit: String(limit),
                sort,
                period,
                status: "published",
            });
            if (category) params.set("category", category);
            if (search) params.set("search", search);

            const res = await fetch(`/api/board/posts?${params}`);
            if (!res.ok) throw new Error("Failed to fetch posts");
            const data: PostListResponse = await res.json();
            setPosts(data.posts);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error("게시글 로딩 실패:", err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [site, board, page, limit, category, sort, period, search]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    const handleCategoryChange = (cat: string) => {
        setCategory(cat);
        setPage(1);
    };

    return (
        <div className="w-full">
            {/* 카테고리 탭 */}
            {categories.length > 0 && (
                <div className="flex items-center gap-1 border-b mb-4 overflow-x-auto" style={{ borderColor: 'var(--tn-border, #e5e5e5)' }}>
                    <button
                        onClick={() => handleCategoryChange("")}
                        className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                            category === ""
                                ? "font-semibold border-current bg-white/5"
                                : "border-transparent hover:opacity-70"
                        }`}
                        style={category === "" ? { color: accentColor || '#fff' } : { color: 'var(--tn-text-muted, #999)' }}
                    >
                        전체
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                                category === cat
                                    ? "font-semibold border-current bg-white/5"
                                    : "border-transparent hover:opacity-70"
                            }`}
                            style={category === cat ? { color: accentColor || '#fff' } : { color: 'var(--tn-text-muted, #999)' }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* 툴바: 검색 + 뷰전환 + 정렬 */}
            <div className="flex items-center justify-between gap-3 mb-4">
                {/* 검색 */}
                <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 tn-text-muted" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="검색..."
                        className="w-full pl-9 pr-3 py-2 text-sm border tn-border rounded-lg focus:outline-none bg-transparent tn-text"
                        style={{ borderColor: "var(--tn-border)" }}
                    />
                </form>

                <div className="flex items-center gap-2">
                    {/* 필터 토글 */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-2.5 min-w-[44px] min-h-[44px] rounded-lg border tn-border transition-colors flex items-center justify-center"
                        style={{ borderColor: "var(--tn-border)" }}
                    >
                        <SlidersHorizontal className="h-4 w-4 tn-text-muted" />
                    </button>

                    {/* 뷰 전환 */}
                    <div className="flex border tn-border rounded-lg overflow-hidden" style={{ borderColor: "var(--tn-border)" }}>
                        <button
                            onClick={() => setViewMode("card")}
                            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors tn-text"
                            style={viewMode === "card" ? { backgroundColor: "var(--tn-bg-alt)" } : {}}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors tn-text"
                            style={viewMode === "list" ? { backgroundColor: "var(--tn-bg-alt)" } : {}}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 필터 패널 */}
            {showFilters && (
                <div className="flex flex-wrap items-center gap-3 mb-4 p-3 tn-bg-alt rounded-lg border tn-border" style={{ borderColor: "var(--tn-border)" }}>
                    <div className="flex items-center gap-2">
                        <span className="text-xs tn-text-sub">정렬</span>
                        <select
                            value={sort}
                            onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
                            className="text-sm border tn-border rounded px-2 py-1 tn-surface tn-text"
                            style={{ borderColor: "var(--tn-border)" }}
                        >
                            {Object.entries(sortLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs tn-text-sub">기간</span>
                        <select
                            value={period}
                            onChange={(e) => { setPeriod(e.target.value as PeriodOption); setPage(1); }}
                            className="text-sm border tn-border rounded px-2 py-1 tn-surface tn-text"
                            style={{ borderColor: "var(--tn-border)" }}
                        >
                            {Object.entries(periodLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-xs tn-text-muted">
                        총 {total}건
                    </div>
                </div>
            )}

            {/* 로딩 */}
            {loading && (
                <div className="flex justify-center py-20">
                    <div className="h-6 w-6 border-2 rounded-full animate-spin" style={{ borderColor: "var(--tn-border)", borderTopColor: "var(--tn-text)" }} />
                </div>
            )}

            {/* 빈 상태 */}
            {!loading && posts.length === 0 && (
                <div className="text-center py-20 tn-text-muted">
                    <p className="text-lg mb-1">게시글이 없습니다</p>
                    <p className="text-sm">첫 번째 글을 작성해보세요</p>
                </div>
            )}

            {/* 아코디언(FAQ) 뷰 */}
            {!loading && posts.length > 0 && layout === 'accordion' && (
                <div className="border tn-border rounded-lg overflow-hidden" style={{ borderColor: "var(--tn-border)" }}>
                    {posts.map((post) => (
                        <PostAccordion key={post.id} post={post} accentColor={accentColor} />
                    ))}
                </div>
            )}

            {/* 카드형 뷰 */}
            {!loading && posts.length > 0 && layout !== 'accordion' && viewMode === "card" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            accentColor={accentColor}
                            onClick={onPostClick}
                        />
                    ))}
                </div>
            )}

            {/* 리스트형 뷰 */}
            {!loading && posts.length > 0 && layout !== 'accordion' && viewMode === "list" && (
                <div className="border tn-border rounded-lg overflow-hidden" style={{ borderColor: "var(--tn-border)" }}>
                    {/* 리스트 헤더 */}
                    <div className="flex items-center gap-4 px-4 py-2 tn-bg-alt border-b tn-border text-xs tn-text-sub font-medium" style={{ borderColor: "var(--tn-border)" }}>
                        <div className="hidden md:block w-20">카테고리</div>
                        <div className="flex-1">제목</div>
                        <div className="hidden sm:block w-24 text-center">작성자</div>
                        <div className="w-20 text-center">날짜</div>
                        <div className="hidden lg:block w-28 text-right">조회/좋아요</div>
                    </div>
                    {posts.map((post) => (
                        <PostListItem
                            key={post.id}
                            post={post}
                            accentColor={accentColor}
                            onClick={onPostClick}
                        />
                    ))}
                </div>
            )}

            {/* 페이지네이션 */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-8">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded disabled:opacity-30 disabled:cursor-not-allowed tn-text"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (page <= 3) {
                            pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = page - 2 + i;
                        }
                        return (
                            <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`min-w-[44px] h-11 rounded text-sm transition-colors ${
                                    page === pageNum
                                        ? "text-white font-medium"
                                        : "tn-text-muted"
                                }`}
                                style={page === pageNum ? { backgroundColor: accentColor } : {}}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded disabled:opacity-30 disabled:cursor-not-allowed tn-text"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
