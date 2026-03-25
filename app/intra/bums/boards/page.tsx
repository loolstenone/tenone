"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Settings, FileText, Users, Search, Pencil, Trash2, Plus, Eye, X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface BoardConfig {
    id: string; site: string; slug: string; name: string; description: string;
    categories: string[]; settings: Record<string, unknown>; sort_order: number;
}

interface PostRow {
    id: string; site: string; board: string; title: string; content: string;
    excerpt: string; category: string; status: string; author_type: string;
    author_id: string | null; guest_nickname: string | null;
    view_count: number; like_count: number; comment_count: number;
    is_pinned: boolean; created_at: string; tags: string[];
}

const tabs = [
    { id: "settings", label: "게시판 설정", icon: Settings },
    { id: "posts", label: "게시글 목록", icon: FileText },
    { id: "authors", label: "작성자 관리", icon: Users },
] as const;
type TabId = typeof tabs[number]["id"];

const statusBadge: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500", published: "bg-emerald-50 text-emerald-700",
    hidden: "bg-amber-50 text-amber-600", deleted: "bg-red-50 text-red-500",
};
const statusLabel: Record<string, string> = {
    draft: "임시", published: "발행", hidden: "숨김", deleted: "삭제",
};

export default function BoardsManagementPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabId>("posts");
    const [configs, setConfigs] = useState<BoardConfig[]>([]);
    const [posts, setPosts] = useState<PostRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [siteFilter, setSiteFilter] = useState("전체");
    const [boardFilter, setBoardFilter] = useState("전체");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [viewingPost, setViewingPost] = useState<PostRow | null>(null);
    const postsPerPage = 20;

    // 데이터 로드
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [configRes, postRes] = await Promise.all([
                fetch('/api/board/configs'),
                fetch('/api/board/posts?limit=500&status=published'),
            ]);
            if (configRes.ok) { const d = await configRes.json(); setConfigs(d.configs || []); }
            if (postRes.ok) { const d = await postRes.json(); setPosts(d.posts || []); }
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // 삭제
    const handleDelete = async (id: string) => {
        if (!confirm('삭제하시겠습니까?')) return;
        await fetch(`/api/board/posts/${id}`, { method: 'DELETE' });
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    const handleBulkDelete = async () => {
        if (!confirm(`${selectedIds.size}건을 삭제하시겠습니까?`)) return;
        await Promise.all(Array.from(selectedIds).map(id => fetch(`/api/board/posts/${id}`, { method: 'DELETE' })));
        setPosts(prev => prev.filter(p => !selectedIds.has(p.id)));
        setSelectedIds(new Set());
    };

    // 필터
    const sites = [...new Set(configs.map(c => c.site))];
    const filteredConfigs = configs.filter(c => siteFilter === "전체" || c.site === siteFilter);
    const filteredPosts = posts.filter(p => {
        if (siteFilter !== "전체" && p.site !== siteFilter) return false;
        if (boardFilter !== "전체" && p.board !== boardFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            if (!p.title.toLowerCase().includes(q)) return false;
        }
        return true;
    }).sort((a, b) => b.created_at.localeCompare(a.created_at));

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const pagePosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

    // 작성자 집계
    const authorMap = new Map<string, { name: string; count: number; sites: Set<string> }>();
    posts.forEach(p => {
        if (siteFilter !== "전체" && p.site !== siteFilter) return;
        const key = p.author_id || p.guest_nickname || 'unknown';
        const name = p.guest_nickname || (p.author_type === 'admin' ? '관리자' : p.author_type === 'agent' ? 'AI Agent' : '회원');
        const existing = authorMap.get(key);
        if (existing) { existing.count++; existing.sites.add(p.site); }
        else authorMap.set(key, { name, count: 1, sites: new Set([p.site]) });
    });

    if (loading) {
        return <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">게시판 관리</h1>
                <p className="text-sm text-neutral-500 mt-1">전체 사이트의 게시판, 게시글, 작성자를 통합 관리합니다.</p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1.5 bg-neutral-100 rounded-xl p-1 w-fit">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                        className={clsx("flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                            activeTab === tab.id ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-600")}>
                        <tab.icon className="h-4 w-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="검색..." className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:border-neutral-400 focus:outline-none bg-white" />
                </div>
                <select value={siteFilter} onChange={e => { setSiteFilter(e.target.value); setBoardFilter("전체"); setCurrentPage(1); }}
                    className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm bg-white">
                    <option value="전체">전체 사이트</option>
                    {sites.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {activeTab === "posts" && (
                    <select value={boardFilter} onChange={e => { setBoardFilter(e.target.value); setCurrentPage(1); }}
                        className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm bg-white">
                        <option value="전체">전체 게시판</option>
                        {filteredConfigs.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                )}
            </div>

            {/* 게시판 설정 탭 */}
            {activeTab === "settings" && (
                <div className="rounded-xl bg-white shadow-sm border border-neutral-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-neutral-100 bg-neutral-50/60">
                            <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">게시판명</th>
                            <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">사이트</th>
                            <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">slug</th>
                            <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">카테고리</th>
                            <th className="px-5 py-3.5 text-right text-xs font-medium text-neutral-500 uppercase">게시글</th>
                        </tr></thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredConfigs.map(c => (
                                <tr key={c.id} className="hover:bg-neutral-50/50">
                                    <td className="px-5 py-3.5 font-medium">{c.name}</td>
                                    <td className="px-5 py-3.5 text-neutral-500 text-xs">{c.site}</td>
                                    <td className="px-5 py-3.5 text-neutral-400 text-xs font-mono">{c.slug}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex gap-1 flex-wrap">
                                            {c.categories?.slice(0, 4).map(cat => (
                                                <span key={cat} className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full">{cat}</span>
                                            ))}
                                            {(c.categories?.length || 0) > 4 && <span className="text-[10px] text-neutral-400">+{c.categories.length - 4}</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-right text-neutral-500">{posts.filter(p => p.site === c.site && p.board === c.slug).length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredConfigs.length === 0 && <div className="px-6 py-16 text-center text-neutral-400 text-sm">게시판이 없습니다.</div>}
                </div>
            )}

            {/* 게시글 목록 탭 */}
            {activeTab === "posts" && (
                <>
                    <div className="flex items-center justify-between">
                        {selectedIds.size > 0 ? (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-neutral-500">{selectedIds.size}건 선택</span>
                                <button onClick={handleBulkDelete} className="px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100">일괄 삭제</button>
                                <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900">선택 해제</button>
                            </div>
                        ) : <div />}
                        <button onClick={() => router.push('/intra/bums/content')}
                            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 shadow-sm">
                            <Plus className="h-4 w-4" /> 새 글 작성
                        </button>
                    </div>

                    <div className="rounded-xl bg-white shadow-sm border border-neutral-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-neutral-100 bg-neutral-50/60">
                                <th className="px-3 py-3.5 w-10">
                                    <input type="checkbox"
                                        checked={pagePosts.length > 0 && pagePosts.every(p => selectedIds.has(p.id))}
                                        onChange={e => {
                                            setSelectedIds(prev => {
                                                const next = new Set(prev);
                                                pagePosts.forEach(p => e.target.checked ? next.add(p.id) : next.delete(p.id));
                                                return next;
                                            });
                                        }} className="rounded" />
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">제목</th>
                                <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">사이트</th>
                                <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">게시판</th>
                                <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">상태</th>
                                <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">날짜</th>
                                <th className="px-5 py-3.5 text-right text-xs font-medium text-neutral-500 uppercase">조회</th>
                                <th className="px-5 py-3.5 text-center text-xs font-medium text-neutral-500 uppercase">수정</th>
                                <th className="px-5 py-3.5 text-center text-xs font-medium text-neutral-500 uppercase">삭제</th>
                            </tr></thead>
                            <tbody className="divide-y divide-neutral-100">
                                {pagePosts.map(post => (
                                    <tr key={post.id} className="hover:bg-neutral-50/50">
                                        <td className="px-3 py-3.5">
                                            <input type="checkbox" checked={selectedIds.has(post.id)}
                                                onChange={e => setSelectedIds(prev => {
                                                    const next = new Set(prev);
                                                    e.target.checked ? next.add(post.id) : next.delete(post.id);
                                                    return next;
                                                })} className="rounded" />
                                        </td>
                                        <td className="px-5 py-3.5 font-medium truncate max-w-[280px]">
                                            <button onClick={() => setViewingPost(post)} className="hover:underline text-left">{post.title}</button>
                                        </td>
                                        <td className="px-5 py-3.5 text-neutral-500 text-xs">{post.site}</td>
                                        <td className="px-5 py-3.5 text-neutral-500 text-xs">{post.board}</td>
                                        <td className="px-5 py-3.5">
                                            <span className={clsx("text-[10px] px-2.5 py-1 rounded-full font-medium", statusBadge[post.status])}>{statusLabel[post.status] || post.status}</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-neutral-400 text-xs">{post.created_at?.substring(0, 10)}</td>
                                        <td className="px-5 py-3.5 text-neutral-400 text-right">{post.view_count}</td>
                                        <td className="px-5 py-3.5 text-center">
                                            <button onClick={() => router.push(`/intra/bums/content?edit=${post.id}`)}
                                                className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg" title="수정"><Pencil className="h-3.5 w-3.5" /></button>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <button onClick={() => handleDelete(post.id)}
                                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="삭제"><Trash2 className="h-3.5 w-3.5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredPosts.length === 0 && <div className="px-6 py-16 text-center text-neutral-400 text-sm">게시글이 없습니다.</div>}
                        {totalPages > 1 && (
                            <div className="px-5 py-3.5 border-t border-neutral-100 bg-neutral-50/40 flex items-center justify-between">
                                <span className="text-xs text-neutral-400">전체 {filteredPosts.length}건 · {currentPage}/{totalPages}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                                        className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30">←</button>
                                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(page => (
                                        <button key={page} onClick={() => setCurrentPage(page)}
                                            className={`px-2.5 py-1 text-xs rounded-lg ${currentPage === page ? 'bg-neutral-900 text-white' : 'border border-neutral-200 hover:bg-neutral-100'}`}>{page}</button>
                                    ))}
                                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                        className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 hover:bg-neutral-100 disabled:opacity-30">→</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 게시글 보기 모달 */}
                    {viewingPost && (
                        <>
                            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" onClick={() => setViewingPost(null)} />
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                                    <div className="p-6 border-b border-neutral-100 flex items-start justify-between shrink-0">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={clsx("text-[10px] px-2.5 py-1 rounded-full font-medium", statusBadge[viewingPost.status])}>{statusLabel[viewingPost.status]}</span>
                                                <span className="text-xs text-neutral-400">{viewingPost.created_at?.substring(0, 10)}</span>
                                                <span className="text-xs text-neutral-400">· 조회 {viewingPost.view_count}</span>
                                            </div>
                                            <h2 className="text-xl font-bold">{viewingPost.title}</h2>
                                            <p className="text-xs text-neutral-400 mt-1">{viewingPost.site} · {viewingPost.board}</p>
                                        </div>
                                        <button onClick={() => setViewingPost(null)} className="p-1 text-neutral-400 hover:text-neutral-900"><X className="h-5 w-5" /></button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-6">
                                        {viewingPost.excerpt && <p className="text-sm text-neutral-500 mb-4 italic">{viewingPost.excerpt}</p>}
                                        <div className="text-sm text-neutral-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: viewingPost.content || '(본문 없음)' }} />
                                    </div>
                                    <div className="p-4 border-t border-neutral-100 flex justify-end gap-2">
                                        <button onClick={() => { setViewingPost(null); router.push(`/intra/bums/content?edit=${viewingPost.id}`); }}
                                            className="px-4 py-2 text-sm rounded-lg bg-neutral-900 text-white hover:bg-neutral-800">수정</button>
                                        <button onClick={() => setViewingPost(null)} className="px-4 py-2 text-sm rounded-lg text-neutral-500 hover:bg-neutral-100">닫기</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* 작성자 관리 탭 */}
            {activeTab === "authors" && (
                <div className="rounded-xl bg-white shadow-sm border border-neutral-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-neutral-100 bg-neutral-50/60">
                            <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">작성자</th>
                            <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">게시글 수</th>
                            <th className="px-5 py-3.5 text-left text-xs font-medium text-neutral-500 uppercase">활동 사이트</th>
                        </tr></thead>
                        <tbody className="divide-y divide-neutral-100">
                            {Array.from(authorMap.entries()).sort((a, b) => b[1].count - a[1].count).map(([id, info]) => (
                                <tr key={id} className="hover:bg-neutral-50/50">
                                    <td className="px-5 py-3.5 font-medium">{info.name}</td>
                                    <td className="px-5 py-3.5 text-neutral-500">{info.count}건</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex gap-1.5 flex-wrap">
                                            {Array.from(info.sites).map(s => <span key={s} className="text-[10px] px-2.5 py-1 bg-neutral-100 text-neutral-600 rounded-full">{s}</span>)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {authorMap.size === 0 && <div className="px-6 py-16 text-center text-neutral-400 text-sm">작성자가 없습니다.</div>}
                </div>
            )}
        </div>
    );
}
