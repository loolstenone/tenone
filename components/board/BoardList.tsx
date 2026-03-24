"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, LayoutGrid, List, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import PostCard from "./PostCard";
import PostListItem from "./PostListItem";
import type { Post, PostListResponse, BoardConfig, PostListParams, SiteCode } from "@/types/board";

interface BoardListProps {
    site: SiteCode;
    board: string;
    boardConfig?: BoardConfig;
    accentColor?: string;
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

export default function BoardList({ site, board, boardConfig, accentColor = "#171717", onPostClick }: BoardListProps) {
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
                <div className="flex items-center gap-1 border-b border-neutral-200 mb-4 overflow-x-auto">
                    <button
                        onClick={() => handleCategoryChange("")}
                        className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                            category === ""
                                ? "font-semibold border-current"
                                : "text-neutral-500 border-transparent hover:text-neutral-700"
                        }`}
                        style={category === "" ? { color: accentColor } : {}}
                    >
                        전체
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryChange(cat)}
                            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors ${
                                category === cat
                                    ? "font-semibold border-current"
                                    : "text-neutral-500 border-transparent hover:text-neutral-700"
                            }`}
                            style={category === cat ? { color: accentColor } : {}}
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="검색..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400"
                    />
                </form>

                <div className="flex items-center gap-2">
                    {/* 필터 토글 */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg border transition-colors ${
                            showFilters ? "border-neutral-400 bg-neutral-50" : "border-neutral-200 hover:bg-neutral-50"
                        }`}
                    >
                        <SlidersHorizontal className="h-4 w-4 text-neutral-600" />
                    </button>

                    {/* 뷰 전환 */}
                    <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode("card")}
                            className={`p-2 transition-colors ${
                                viewMode === "card" ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"
                            }`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 transition-colors ${
                                viewMode === "list" ? "bg-neutral-900 text-white" : "hover:bg-neutral-50"
                            }`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 필터 패널 */}
            {showFilters && (
                <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">정렬</span>
                        <select
                            value={sort}
                            onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
                            className="text-sm border border-neutral-200 rounded px-2 py-1 bg-white"
                        >
                            {Object.entries(sortLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">기간</span>
                        <select
                            value={period}
                            onChange={(e) => { setPeriod(e.target.value as PeriodOption); setPage(1); }}
                            className="text-sm border border-neutral-200 rounded px-2 py-1 bg-white"
                        >
                            {Object.entries(periodLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="text-xs text-neutral-400">
                        총 {total}건
                    </div>
                </div>
            )}

            {/* 로딩 */}
            {loading && (
                <div className="flex justify-center py-20">
                    <div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
                </div>
            )}

            {/* 빈 상태 */}
            {!loading && posts.length === 0 && (
                <div className="text-center py-20 text-neutral-400">
                    <p className="text-lg mb-1">게시글이 없습니다</p>
                    <p className="text-sm">첫 번째 글을 작성해보세요</p>
                </div>
            )}

            {/* 카드형 뷰 */}
            {!loading && posts.length > 0 && viewMode === "card" && (
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
            {!loading && posts.length > 0 && viewMode === "list" && (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    {/* 리스트 헤더 */}
                    <div className="flex items-center gap-4 px-4 py-2 bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-500 font-medium">
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
                        className="p-2 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
                                className={`min-w-[36px] h-9 rounded text-sm transition-colors ${
                                    page === pageNum
                                        ? "text-white font-medium"
                                        : "hover:bg-neutral-100 text-neutral-600"
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
                        className="p-2 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
