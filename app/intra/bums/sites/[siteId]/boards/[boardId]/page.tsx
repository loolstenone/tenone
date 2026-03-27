"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Post, BoardConfig } from "@/types/board";
import {
    ArrowLeft, Plus, Settings, Pin, Lock, Eye, MessageSquare,
    Star, ChevronDown, ChevronRight, Video, Image as ImageIcon,
    Pencil, Trash2, Search, CheckSquare, RefreshCw,
} from "lucide-react";

const statusBadge: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    published: "bg-emerald-100 text-emerald-700",
    scheduled: "bg-blue-100 text-blue-700",
    private: "bg-purple-100 text-purple-700",
};
const statusLabel: Record<string, string> = {
    draft: "임시",
    published: "발행",
    scheduled: "예약",
    private: "비공개",
};

export default function BoardPostListPage({ params }: { params: Promise<{ siteId: string; boardId: string }> }) {
    const { siteId, boardId } = use(params);
    const router = useRouter();

    const [posts, setPosts] = useState<Post[]>([]);
    const [boardConfig, setBoardConfig] = useState<BoardConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // 게시판 설정 로드
    useEffect(() => {
        fetch(`/api/board/configs?site=${siteId}&board=${boardId}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.configs?.length > 0) setBoardConfig(data.configs[0]);
            })
            .catch(() => {});
    }, [siteId, boardId]);

    // 게시글 로드
    const loadPosts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                site: siteId,
                board: boardId,
                page: String(page),
                limit: '20',
                sort: 'latest',
            });
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (search) params.set('search', search);

            const res = await fetch(`/api/board/posts?${params}`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts || []);
                setTotalPages(data.totalPages || 1);
                setTotal(data.total || 0);
            }
        } catch (err) {
            console.error('게시글 로딩 실패:', err);
        } finally {
            setLoading(false);
        }
    }, [siteId, boardId, page, statusFilter, search]);

    useEffect(() => { loadPosts(); }, [loadPosts]);

    // 삭제
    const handleDelete = async (postId: string) => {
        if (!confirm('이 게시글을 삭제하시겠습니까?')) return;
        const res = await fetch(`/api/board/posts/${postId}`, { method: 'DELETE' });
        if (res.ok) loadPosts();
    };

    // 일괄 삭제
    const handleBulkDelete = async () => {
        if (selected.size === 0) return;
        if (!confirm(`선택한 ${selected.size}개 게시글을 삭제하시겠습니까?`)) return;
        await Promise.all([...selected].map(id => fetch(`/api/board/posts/${id}`, { method: 'DELETE' })));
        setSelected(new Set());
        loadPosts();
    };

    // 상태 변경
    const handleStatusChange = async (postId: string, newStatus: string) => {
        await fetch(`/api/board/posts/${postId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        loadPosts();
    };

    const toggleAll = () => {
        if (selected.size === posts.length) setSelected(new Set());
        else setSelected(new Set(posts.map(p => p.id)));
    };

    const toggleOne = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const filteredPosts = posts;
    const boardName = boardConfig?.name || boardId;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button onClick={() => router.push(`/intra/bums/sites/${siteId}`)}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 mb-4 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> {siteId}
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{boardName}</h2>
                        <p className="text-xs text-neutral-400 mt-1">총 {total}개 게시글</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadPosts}
                            className="flex items-center gap-2 border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 transition-colors">
                            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> 새로고침
                        </button>
                        <Link href={`/intra/bums/sites/${siteId}/boards/${boardId}/settings`}
                            className="flex items-center gap-2 border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 transition-colors">
                            <Settings className="h-3.5 w-3.5" /> 설정
                        </Link>
                        <Link href={`/intra/bums/sites/${siteId}/boards/${boardId}/new`}
                            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-800 transition-colors">
                            <Plus className="h-4 w-4" /> 글쓰기
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="제목, 작성자 검색..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-white" />
                </div>
                <div className="flex gap-1">
                    {['all', 'published', 'draft'].map(s => (
                        <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-3 py-1.5 text-xs border transition-colors ${statusFilter === s ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                            {s === 'all' ? '전체' : statusLabel[s] || s}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-neutral-400">{total}건</span>
            </div>

            {/* Bulk actions */}
            {selected.size > 0 && (
                <div className="flex items-center gap-3 px-2 py-2 bg-neutral-50 border border-neutral-200 rounded">
                    <span className="text-sm text-neutral-600 font-medium">{selected.size}개 선택</span>
                    <button onClick={handleBulkDelete}
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition-colors">
                        <Trash2 className="h-3 w-3" /> 일괄 삭제
                    </button>
                </div>
            )}

            {/* Posts Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20 text-neutral-400">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" /> 로딩 중...
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="border border-neutral-200 bg-white px-6 py-12 text-center text-neutral-400 text-sm">
                    게시글이 없습니다.
                </div>
            ) : (
                <div className="border border-neutral-200 bg-white overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-100 text-left">
                                <th className="px-3 py-3 w-10">
                                    <input type="checkbox" checked={selected.size === filteredPosts.length && filteredPosts.length > 0}
                                        onChange={toggleAll} className="rounded" />
                                </th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">제목</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">카테고리</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden sm:table-cell">날짜</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">상태</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right hidden sm:table-cell">조회</th>
                                <th className="px-4 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right w-24">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredPosts.map(post => (
                                <tr key={post.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-3 py-3">
                                        <input type="checkbox" checked={selected.has(post.id)}
                                            onChange={() => toggleOne(post.id)} className="rounded" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {post.isPinned && <Pin className="h-3 w-3 text-red-500 shrink-0" />}
                                            <span className="font-medium truncate max-w-[300px]">{post.title}</span>
                                            {post.commentCount > 0 && (
                                                <span className="text-xs text-neutral-400 flex items-center gap-0.5">
                                                    <MessageSquare className="h-3 w-3" />{post.commentCount}
                                                </span>
                                            )}
                                        </div>
                                        {post.excerpt && (
                                            <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-[300px]">{post.excerpt}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-neutral-500 text-xs hidden md:table-cell">{post.category || '-'}</td>
                                    <td className="px-4 py-3 text-neutral-400 text-xs hidden sm:table-cell">
                                        {new Date(post.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={post.status}
                                            onChange={e => handleStatusChange(post.id, e.target.value)}
                                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium border-none cursor-pointer ${statusBadge[post.status] || 'bg-neutral-100'}`}
                                        >
                                            <option value="published">발행</option>
                                            <option value="draft">임시</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-neutral-400 text-right text-xs hidden sm:table-cell">
                                        <span className="flex items-center justify-end gap-1">
                                            <Eye className="h-3 w-3" />{post.viewCount}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleDelete(post.id)}
                                                title="삭제"
                                                className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="px-3 py-1.5 text-sm border border-neutral-200 disabled:opacity-30 hover:bg-neutral-50 transition-colors">
                        이전
                    </button>
                    <span className="text-sm text-neutral-500">{page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="px-3 py-1.5 text-sm border border-neutral-200 disabled:opacity-30 hover:bg-neutral-50 transition-colors">
                        다음
                    </button>
                </div>
            )}
        </div>
    );
}
