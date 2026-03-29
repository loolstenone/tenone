"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, LayoutGrid, List, ChevronLeft, ChevronRight, SlidersHorizontal, GalleryHorizontalEnd, Newspaper } from "lucide-react";
import PostCard from "./PostCard";
import PostListItem from "./PostListItem";
import PostAccordion from "./PostAccordion";
import type { Post, PostListResponse, BoardConfig, SiteCode } from "@/types/board";

interface BoardListProps {
    site: SiteCode;
    board: string;
    boardConfig?: BoardConfig;
    accentColor?: string;
    layout?: 'default' | 'accordion';
    onPostClick?: (post: Post) => void;
}

type ViewMode = "list" | "card" | "gallery" | "magazine";
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

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

export default function BoardList({ site, board, boardConfig, accentColor = "#171717", layout = 'default', onPostClick }: BoardListProps) {
    const defaultView = boardConfig?.settings?.defaultView || "card";
    const defaultLimit = boardConfig?.settings?.postsPerPage || 12;

    const [posts, setPosts] = useState<Post[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
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

    const viewModes: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
        { mode: "list", icon: <List className="h-4 w-4" />, label: "리스트" },
        { mode: "card", icon: <LayoutGrid className="h-4 w-4" />, label: "카드" },
        { mode: "gallery", icon: <GalleryHorizontalEnd className="h-4 w-4" />, label: "갤러리" },
        { mode: "magazine", icon: <Newspaper className="h-4 w-4" />, label: "매거진" },
    ];

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
                        className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none bg-transparent tn-text"
                        style={{ borderColor: "var(--tn-border)" }}
                    />
                </form>

                <div className="flex items-center gap-2">
                    {/* 정렬 드롭다운 (항상 표시) */}
                    <select
                        value={sort}
                        onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
                        className="text-sm border rounded-lg px-2.5 py-2 bg-transparent tn-text min-w-[80px]"
                        style={{ borderColor: "var(--tn-border)" }}
                    >
                        {Object.entries(sortLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    {/* 필터 토글 */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-2.5 min-w-[44px] min-h-[44px] rounded-lg border transition-colors flex items-center justify-center"
                        style={{ borderColor: "var(--tn-border)", backgroundColor: showFilters ? "var(--tn-bg-alt)" : "transparent" }}
                    >
                        <SlidersHorizontal className="h-4 w-4 tn-text-muted" />
                    </button>

                    {/* 뷰 전환 (4모드) */}
                    <div className="flex border rounded-lg overflow-hidden" style={{ borderColor: "var(--tn-border)" }}>
                        {viewModes.map(({ mode, icon, label }) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                title={label}
                                className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors tn-text"
                                style={viewMode === mode ? { backgroundColor: "var(--tn-bg-alt)" } : {}}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 필터 패널 */}
            {showFilters && (
                <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg border" style={{ borderColor: "var(--tn-border)", backgroundColor: "var(--tn-bg-alt)" }}>
                    <div className="flex items-center gap-2">
                        <span className="text-xs tn-text-sub">기간</span>
                        <select
                            value={period}
                            onChange={(e) => { setPeriod(e.target.value as PeriodOption); setPage(1); }}
                            className="text-sm border rounded px-2 py-1 bg-transparent tn-text"
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
                <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--tn-border)" }}>
                    {posts.map((post) => (
                        <PostAccordion key={post.id} post={post} accentColor={accentColor} />
                    ))}
                </div>
            )}

            {/* 리스트형 뷰 */}
            {!loading && posts.length > 0 && layout !== 'accordion' && viewMode === "list" && (
                <div className="border rounded-lg overflow-hidden" style={{ borderColor: "var(--tn-border)" }}>
                    <div className="flex items-center gap-4 px-4 py-2 border-b text-xs tn-text-sub font-medium" style={{ borderColor: "var(--tn-border)", backgroundColor: "var(--tn-bg-alt)" }}>
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

            {/* 갤러리 뷰 (masonry-style image grid) */}
            {!loading && posts.length > 0 && layout !== 'accordion' && viewMode === "gallery" && (
                <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
                    {posts.map((post) => (
                        <article
                            key={post.id}
                            onClick={() => onPostClick?.(post)}
                            className="break-inside-avoid rounded-lg overflow-hidden border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                            style={{ borderColor: "var(--tn-border)" }}
                        >
                            {post.representImage ? (
                                <img
                                    src={post.representImage}
                                    alt={post.title}
                                    className="w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: "var(--tn-bg-alt)" }}>
                                    <span className="text-4xl font-bold" style={{ opacity: 0.06 }}>
                                        {post.title?.substring(0, 1)}
                                    </span>
                                </div>
                            )}
                            <div className="p-3">
                                <h3 className="text-sm font-medium tn-text line-clamp-2">{post.title}</h3>
                                <div className="flex items-center justify-between mt-2 text-xs tn-text-muted">
                                    <span>{formatRelativeDate(post.createdAt)}</span>
                                    <span className="flex items-center gap-1">
                                        &#9825; {post.likeCount}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* 매거진 뷰 (first post large, rest 2-column) */}
            {!loading && posts.length > 0 && layout !== 'accordion' && viewMode === "magazine" && (
                <div className="space-y-5">
                    {/* Featured (first post) */}
                    {posts[0] && (
                        <article
                            onClick={() => onPostClick?.(posts[0])}
                            className="relative rounded-lg overflow-hidden border cursor-pointer group transition-all duration-200 hover:shadow-lg"
                            style={{ borderColor: "var(--tn-border)" }}
                        >
                            <div className="aspect-[21/9] overflow-hidden" style={{ backgroundColor: "var(--tn-bg-alt)" }}>
                                {posts[0].representImage ? (
                                    <img
                                        src={posts[0].representImage}
                                        alt={posts[0].title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-6xl font-bold" style={{ opacity: 0.06 }}>
                                            {posts[0].title?.substring(0, 2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                {posts[0].category && (
                                    <span className="inline-block px-2 py-0.5 text-xs rounded-full text-white mb-2" style={{ backgroundColor: accentColor }}>
                                        {posts[0].category}
                                    </span>
                                )}
                                <h2 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                                    {posts[0].title}
                                </h2>
                                {posts[0].excerpt && (
                                    <p className="text-sm text-white/70 line-clamp-2 max-w-2xl">{posts[0].excerpt}</p>
                                )}
                                <div className="flex items-center gap-3 mt-3 text-xs text-white/60">
                                    <span>{posts[0].authorName || "관리자"}</span>
                                    <span>{formatRelativeDate(posts[0].createdAt)}</span>
                                </div>
                            </div>
                        </article>
                    )}

                    {/* Rest in 2-column grid */}
                    {posts.length > 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {posts.slice(1).map((post) => (
                                <article
                                    key={post.id}
                                    onClick={() => onPostClick?.(post)}
                                    className="flex gap-4 rounded-lg border p-3 cursor-pointer transition-all duration-200 hover:shadow-sm group"
                                    style={{ borderColor: "var(--tn-border)" }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--tn-bg-alt)"}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    {/* Thumbnail */}
                                    <div className="w-28 h-20 shrink-0 rounded overflow-hidden" style={{ backgroundColor: "var(--tn-bg-alt)" }}>
                                        {post.representImage ? (
                                            <img
                                                src={post.representImage}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-2xl font-bold" style={{ opacity: 0.06 }}>
                                                    {post.title?.substring(0, 1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {post.category && (
                                            <span className="text-[10px] tn-text-muted uppercase tracking-wider">{post.category}</span>
                                        )}
                                        <h3 className="text-sm font-medium tn-text line-clamp-2 mt-0.5">{post.title}</h3>
                                        <div className="flex items-center gap-2 mt-2 text-xs tn-text-muted">
                                            <span>{formatRelativeDate(post.createdAt)}</span>
                                            <span>&middot;</span>
                                            <span>&#9825; {post.likeCount}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
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
