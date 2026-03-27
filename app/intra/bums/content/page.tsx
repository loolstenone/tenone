"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBumsFilter } from "../layout";
import { siteConfigs } from "@/lib/site-config";
import {
    FileText, Search, Plus, Eye, Pencil, Trash2, Calendar,
    LayoutGrid, List, MessageSquare, Heart, Pin,
} from "lucide-react";
import clsx from "clsx";

/* ── API 응답용 인터페이스 ── */
interface PostRow {
    id: string; site: string; board: string; title: string; content: string;
    excerpt: string; category: string; status: string; author_type: string;
    author_id: string | null; guest_nickname: string | null;
    represent_image: string; tags: string[];
    view_count: number; like_count: number; comment_count: number;
    is_pinned: boolean; created_at: string;
}

interface ConfigRow {
    id: string; site: string; slug: string; name: string;
    description: string; categories: string[];
}

type ViewMode = "list" | "card";

const statusBadge: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    published: "bg-emerald-50 text-emerald-700",
    hidden: "bg-amber-50 text-amber-600",
    deleted: "bg-red-50 text-red-500",
};
const statusLabel: Record<string, string> = {
    draft: "임시", published: "발행", hidden: "숨김", deleted: "삭제",
};

export default function ContentManagementPage() {
    const router = useRouter();
    const { selectedSiteId } = useBumsFilter();

    const [posts, setPosts] = useState<PostRow[]>([]);
    const [configs, setConfigs] = useState<ConfigRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [boardFilter, setBoardFilter] = useState("전체");
    const [statusFilter, setStatusFilter] = useState("전체");
    const [viewMode, setViewMode] = useState<ViewMode>("card");
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 24;

    /* ── 사이트명 헬퍼 ── */
    const siteName = (code: string) => {
        const cfg = siteConfigs[code as keyof typeof siteConfigs];
        return cfg?.name || code;
    };

    /* ── 게시판명 헬퍼 ── */
    const boardName = (site: string, slug: string) => {
        const cfg = configs.find(c => c.site === site && c.slug === slug);
        return cfg?.name || slug;
    };

    /* ── 데이터 로드 ── */
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // configs
            const configUrl = selectedSiteId === "all"
                ? "/api/board/configs"
                : `/api/board/configs?site=${selectedSiteId}`;
            const configRes = await fetch(configUrl);
            const configData = configRes.ok ? await configRes.json() : { configs: [] };
            setConfigs(configData.configs || []);

            // posts: 사이트별 fetch
            if (selectedSiteId === "all") {
                const sites = [...new Set((configData.configs || []).map((c: ConfigRow) => c.site))];
                const allPosts: PostRow[] = [];
                await Promise.all(
                    sites.map(async (site: unknown) => {
                        const res = await fetch(`/api/board/posts?site=${site as string}&limit=500`);
                        if (res.ok) {
                            const d = await res.json();
                            allPosts.push(...(d.posts || []));
                        }
                    })
                );
                setPosts(allPosts);
            } else {
                const postRes = await fetch(`/api/board/posts?site=${selectedSiteId}&limit=500`);
                const postData = postRes.ok ? await postRes.json() : { posts: [] };
                setPosts(postData.posts || []);
            }
        } catch { /* ignore */ }
        setLoading(false);
    }, [selectedSiteId]);

    useEffect(() => { loadData(); }, [loadData]);

    // BU 변경 시 필터 리셋
    useEffect(() => {
        setBoardFilter("전체");
        setStatusFilter("전체");
        setCurrentPage(1);
    }, [selectedSiteId]);

    /* ── 삭제 ── */
    const handleDelete = async (id: string) => {
        if (!confirm("삭제하시겠습니까?")) return;
        await fetch(`/api/board/posts/${id}`, { method: "DELETE" });
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    /* ── 필터링 ── */
    const filtered = posts.filter(p => {
        if (boardFilter !== "전체" && p.board !== boardFilter) return false;
        if (statusFilter !== "전체" && p.status !== statusFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!p.title.toLowerCase().includes(q) && !p.excerpt?.toLowerCase().includes(q)) return false;
        }
        return true;
    }).sort((a, b) => b.created_at.localeCompare(a.created_at));

    const totalPages = Math.ceil(filtered.length / postsPerPage);
    const pagePosts = filtered.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

    /* ── 통계 ── */
    const stats = {
        total: posts.length,
        published: posts.filter(p => p.status === "published").length,
        draft: posts.filter(p => p.status === "draft").length,
        hidden: posts.filter(p => p.status === "hidden").length,
    };

    /* ── 게시판 목록 (드롭다운용) ── */
    const boardOptions = configs;

    if (loading) {
        return <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">콘텐츠 관리</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        {selectedSiteId === "all" ? "전체 사이트" : siteName(selectedSiteId)}의 게시글을 통합 관리합니다.
                    </p>
                </div>
                <button onClick={() => router.push("/intra/bums/content?new=true")}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-sm bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 shadow-sm transition-all">
                    <Plus className="h-4 w-4" /> 새 글 작성
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: "전체", value: stats.total, color: "text-neutral-900" },
                    { label: "발행", value: stats.published, color: "text-emerald-600" },
                    { label: "임시저장", value: stats.draft, color: "text-neutral-500" },
                    { label: "숨김", value: stats.hidden, color: "text-amber-600" },
                ].map(s => (
                    <div key={s.label} className="bg-white border border-neutral-100 rounded-xl p-4">
                        <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
                        <p className={clsx("text-xl font-bold", s.color)}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="제목, 요약 검색..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-200 shadow-sm focus:border-neutral-400 focus:outline-none bg-white transition-all" />
                </div>
                <select value={boardFilter} onChange={e => { setBoardFilter(e.target.value); setCurrentPage(1); }}
                    className="rounded-lg border border-neutral-200 shadow-sm px-3.5 py-2.5 text-sm bg-white">
                    <option value="전체">전체 게시판</option>
                    {boardOptions.map(b => <option key={b.id} value={b.slug}>{b.name}</option>)}
                </select>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="rounded-lg border border-neutral-200 shadow-sm px-3.5 py-2.5 text-sm bg-white">
                    <option value="전체">전체 상태</option>
                    <option value="published">발행</option>
                    <option value="draft">임시</option>
                    <option value="hidden">숨김</option>
                </select>
                <div className="flex gap-1 ml-auto bg-neutral-100 rounded-lg p-0.5">
                    <button onClick={() => setViewMode("list")}
                        className={clsx("p-2 rounded-md transition-all", viewMode === "list" ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-400")}>
                        <List className="h-4 w-4" />
                    </button>
                    <button onClick={() => setViewMode("card")}
                        className={clsx("p-2 rounded-md transition-all", viewMode === "card" ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-400")}>
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* ── 리스트 뷰 ── */}
            {viewMode === "list" ? (
                <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-left bg-neutral-50/60">
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase">제목</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase">사이트</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase">게시판</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase">상태</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase">날짜</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase text-right">조회</th>
                                <th className="px-5 py-3.5 text-xs font-medium text-neutral-500 uppercase text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {pagePosts.map(post => (
                                <tr key={post.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            {post.is_pinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
                                            <span className="font-medium truncate max-w-[280px]">{post.title}</span>
                                            {post.comment_count > 0 && (
                                                <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                                                    <MessageSquare className="h-3 w-3" />{post.comment_count}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-500 text-xs">{siteName(post.site)}</td>
                                    <td className="px-5 py-3.5 text-neutral-500 text-xs">{boardName(post.site, post.board)}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={clsx("text-[10px] px-2.5 py-1 rounded-full font-medium", statusBadge[post.status])}>
                                            {statusLabel[post.status] || post.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-neutral-400 text-xs">{post.created_at?.substring(0, 10)}</td>
                                    <td className="px-5 py-3.5 text-neutral-400 text-right">{post.view_count.toLocaleString()}</td>
                                    <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => router.push(`/intra/bums/content?edit=${post.id}`)}
                                                className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all" title="수정">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button onClick={() => handleDelete(post.id)}
                                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="삭제">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="px-6 py-16 text-center text-neutral-400 text-sm">콘텐츠가 없습니다.</div>
                    )}
                </div>
            ) : (
                /* ── 카드 뷰 ── */
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {pagePosts.map(post => (
                        <div key={post.id} className="bg-white border border-neutral-100 rounded-xl hover:shadow-md hover:border-neutral-200 transition-all group overflow-hidden">
                            {/* 썸네일 */}
                            <div className="aspect-video bg-neutral-50 flex items-center justify-center relative">
                                {post.represent_image ? (
                                    <img src={post.represent_image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <FileText className="h-8 w-8 text-neutral-200" />
                                )}
                                {post.is_pinned && (
                                    <div className="absolute top-2 left-2">
                                        <Pin className="h-3.5 w-3.5 text-amber-500" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button onClick={() => router.push(`/intra/bums/content?edit=${post.id}`)}
                                        className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-neutral-500 hover:text-neutral-900 shadow-sm" title="수정">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(post.id)}
                                        className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-neutral-500 hover:text-red-600 shadow-sm" title="삭제">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium", statusBadge[post.status])}>
                                        {statusLabel[post.status] || post.status}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full">
                                        {boardName(post.site, post.board)}
                                    </span>
                                </div>
                                <h4 className="text-sm font-medium line-clamp-2 mb-1">{post.title}</h4>
                                {post.excerpt && <p className="text-xs text-neutral-400 line-clamp-2 mb-2">{post.excerpt}</p>}
                                <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-400">
                                    <div className="flex items-center gap-2">
                                        <span>{siteName(post.site)}</span>
                                        <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{post.created_at?.substring(0, 10)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{post.view_count}</span>
                                        {post.like_count > 0 && <span className="flex items-center gap-0.5"><Heart className="h-3 w-3" />{post.like_count}</span>}
                                        {post.comment_count > 0 && <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{post.comment_count}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 카드뷰 빈 상태 */}
            {viewMode === "card" && filtered.length === 0 && (
                <div className="bg-white border border-neutral-100 rounded-xl px-6 py-16 text-center text-neutral-400 text-sm">콘텐츠가 없습니다.</div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400">전체 {filtered.length}건 · {currentPage}/{totalPages}</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                            className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30">&larr;</button>
                        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(page => (
                            <button key={page} onClick={() => setCurrentPage(page)}
                                className={`px-2.5 py-1 text-xs rounded-lg ${currentPage === page ? "bg-neutral-900 text-white" : "border border-neutral-200 hover:bg-neutral-100"}`}>{page}</button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                            className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30">&rarr;</button>
                    </div>
                </div>
            )}
        </div>
    );
}
