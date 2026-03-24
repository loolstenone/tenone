"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Plus, Pin, ChevronRight, X, Calendar, Loader2 } from "lucide-react";
import clsx from "clsx";
import * as townityDb from "@/lib/supabase/townity";

type AudienceType = '전체' | 'Staff' | 'Partner 이상' | 'Crew 이상' | 'Admin Only';
const audienceOptions: AudienceType[] = ['전체', 'Staff', 'Partner 이상', 'Crew 이상', 'Admin Only'];
const audienceBadge: Record<AudienceType, string> = {
    '전체': 'bg-neutral-100 text-neutral-500',
    'Staff': 'bg-blue-50 text-blue-600',
    'Partner 이상': 'bg-amber-50 text-amber-600',
    'Crew 이상': 'bg-green-50 text-green-600',
    'Admin Only': 'bg-red-50 text-red-500',
};

interface NoticePost {
    id: string;
    title: string;
    content: string;
    author_id?: string;
    author?: { name: string; avatar_initials: string } | null;
    created_at: string;
    is_pinned?: boolean;
    notice_start?: string;
    notice_end?: string;
    badge?: string;
    visibility?: string;
}

function isNoticeActive(post: NoticePost): boolean {
    if (!post.notice_start && !post.notice_end) return true; // 기간 미설정 → 항상 노출
    const today = new Date().toISOString().split('T')[0];
    if (post.notice_start && today < post.notice_start) return false;
    if (post.notice_end && today > post.notice_end) return false;
    return true;
}

export default function NoticePage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<NoticePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<NoticePost | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [editorTitle, setEditorTitle] = useState('');
    const [editorBody, setEditorBody] = useState('');
    const [editorBadge, setEditorBadge] = useState('공지');
    const [editorNoticeStart, setEditorNoticeStart] = useState('');
    const [editorNoticeEnd, setEditorNoticeEnd] = useState('');
    const [editorAudience, setEditorAudience] = useState<AudienceType>('전체');

    const loadPosts = useCallback(async () => {
        try {
            const { posts: dbPosts } = await townityDb.fetchPosts({ board: 'notice', limit: 50 });
            if (dbPosts.length > 0) {
                setPosts(dbPosts as NoticePost[]);
            }
        } catch (err) {
            console.warn('[Townity] Failed to load notices:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadPosts(); }, [loadPosts]);

    const visiblePosts = posts.filter(isNoticeActive);
    const sorted = [...visiblePosts].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return (b.created_at || '').localeCompare(a.created_at || '');
    });

    const handleSubmit = async () => {
        if (!editorTitle.trim() || !editorBody.trim() || !user) return;
        if (!editorNoticeStart || !editorNoticeEnd) {
            alert('공지 기간을 설정해야 합니다.');
            return;
        }
        try {
            await townityDb.createPost({
                board: 'notice',
                title: editorTitle,
                content: editorBody,
                author_id: user.id,
                visibility: editorAudience === '전체' ? 'all' : editorAudience === 'Staff' ? 'staff' : 'all',
                badge: editorBadge,
                is_pinned: true,
                notice_start: editorNoticeStart,
                notice_end: editorNoticeEnd,
            });
            setEditorTitle(''); setEditorBody(''); setEditorNoticeStart(''); setEditorNoticeEnd(''); setEditorAudience('전체');
            setShowEditor(false);
            loadPosts(); // 새로고침
        } catch (err) {
            console.error('[Townity] Failed to create notice:', err);
            alert('등록에 실패했습니다.');
        }
    };

    const getAuthorName = (post: NoticePost) => {
        if (post.author && typeof post.author === 'object') return post.author.name;
        return '관리자';
    };

    const getDate = (post: NoticePost) => (post.created_at || '').substring(0, 10);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 text-neutral-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">공지사항</h1>
                    <p className="text-sm text-neutral-500 mt-1">사내 공지 및 안내</p>
                </div>
                <button onClick={() => setShowEditor(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 transition-all shadow-sm">
                    <Plus className="h-4 w-4" /> 공지 등록
                </button>
            </div>

            <div className="rounded-xl bg-white shadow-sm border border-neutral-100 divide-y divide-neutral-100 overflow-hidden">
                {sorted.map(post => (
                    <button key={post.id} onClick={() => setSelectedPost(post)}
                        className="w-full text-left px-5 py-4 hover:bg-neutral-50/50 transition-colors flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                {post.is_pinned && <Pin className="h-3 w-3 text-neutral-900" />}
                                {post.badge && (
                                    <span className="text-xs px-2 py-0.5 bg-neutral-900 text-white font-medium rounded">{post.badge}</span>
                                )}
                                <span className="text-sm font-medium text-neutral-900 truncate">{post.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                <span>{getAuthorName(post)}</span>
                                <span>{getDate(post)}</span>
                                {post.notice_start && post.notice_end && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {post.notice_start} ~ {post.notice_end}
                                    </span>
                                )}
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0" />
                    </button>
                ))}
                {sorted.length === 0 && (
                    <div className="px-5 py-16 text-center text-sm text-neutral-400">등록된 공지가 없습니다.</div>
                )}
            </div>

            {/* Detail modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 flex items-start justify-between shrink-0">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    {selectedPost.badge && (
                                        <span className="text-xs px-2 py-0.5 bg-neutral-900 text-white font-medium rounded">{selectedPost.badge}</span>
                                    )}
                                    <span className="text-xs text-neutral-400">{getDate(selectedPost)}</span>
                                </div>
                                <h2 className="text-xl font-bold tracking-tight">{selectedPost.title}</h2>
                                <p className="text-xs text-neutral-400 mt-1">{getAuthorName(selectedPost)}</p>
                                {selectedPost.notice_start && selectedPost.notice_end && (
                                    <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> 공지 기간: {selectedPost.notice_start} ~ {selectedPost.notice_end}
                                    </p>
                                )}
                            </div>
                            <button onClick={() => setSelectedPost(null)} className="text-neutral-400 hover:text-neutral-900 p-1">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                                {selectedPost.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Editor modal */}
            {showEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg shadow-2xl rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold tracking-tight">공지 등록</h2>
                            <button onClick={() => setShowEditor(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">분류</label>
                                <div className="flex gap-2">
                                    {['공지', '중요', 'HR', '교육', '일정'].map(b => (
                                        <button key={b} onClick={() => setEditorBadge(b)}
                                            className={clsx("px-3 py-1.5 text-xs rounded-lg border transition-all",
                                                editorBadge === b ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"
                                            )}>{b}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">공개 대상</label>
                                <div className="flex gap-2 flex-wrap">
                                    {audienceOptions.map(a => (
                                        <button key={a} onClick={() => setEditorAudience(a)}
                                            className={clsx("px-3 py-1.5 text-xs rounded-lg border transition-all",
                                                editorAudience === a ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"
                                            )}>{a}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">공지 기간 <span className="text-red-400">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="date" value={editorNoticeStart} onChange={e => setEditorNoticeStart(e.target.value)}
                                        className="rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
                                    <input type="date" value={editorNoticeEnd} onChange={e => setEditorNoticeEnd(e.target.value)}
                                        className="rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
                                </div>
                                <p className="text-xs text-neutral-400 mt-1">기간 내에만 노출됩니다.</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">제목</label>
                                <input value={editorTitle} onChange={e => setEditorTitle(e.target.value)}
                                    className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
                                    placeholder="공지 제목" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">내용</label>
                                <textarea value={editorBody} onChange={e => setEditorBody(e.target.value)}
                                    className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none resize-none"
                                    rows={6} placeholder="공지 내용" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
                            <button onClick={() => setShowEditor(false)}
                                className="px-5 py-2.5 text-sm rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all">취소</button>
                            <button onClick={handleSubmit}
                                className="px-5 py-2.5 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 transition-all shadow-sm">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
