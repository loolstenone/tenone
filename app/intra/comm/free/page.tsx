"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Plus, MessageSquare, ChevronRight, X, Loader2 } from "lucide-react";
import clsx from "clsx";
import * as townityDb from "@/lib/supabase/townity";

type AudienceType = '전체' | 'Staff' | 'Partner 이상' | 'Crew 이상' | 'Admin Only';
const audienceOptions: AudienceType[] = ['전체', 'Staff', 'Partner 이상', 'Crew 이상', 'Admin Only'];

interface FreePost {
    id: string;
    title: string;
    content: string;
    author_id: string;
    author?: { name: string; avatar_initials?: string } | null;
    visibility?: string;
    created_at: string;
    board: string;
}

export default function FreeBoardPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<FreePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedPost, setSelectedPost] = useState<FreePost | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [editorTitle, setEditorTitle] = useState('');
    const [editorBody, setEditorBody] = useState('');
    const [editorAudience, setEditorAudience] = useState<AudienceType>('전체');

    const loadPosts = useCallback(async () => {
        try {
            setLoading(true);
            const { posts: data } = await townityDb.fetchPosts({ board: 'free', limit: 50 });
            setPosts(data as FreePost[]);
        } catch (err) {
            console.error('[FreeBoardPage] 게시글 로드 실패:', err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const sorted = [...posts].sort((a, b) =>
        (b.created_at || '').localeCompare(a.created_at || '')
    );

    const handleSubmit = async () => {
        if (!editorTitle.trim() || !editorBody.trim() || !user?.id) return;
        try {
            setSubmitting(true);
            await townityDb.createPost({
                board: 'free',
                title: editorTitle,
                content: editorBody,
                author_id: user.id,
                visibility: editorAudience,
            });
            setEditorTitle(''); setEditorBody(''); setEditorAudience('전체');
            setShowEditor(false);
            await loadPosts();
        } catch (err) {
            console.error('[FreeBoardPage] 글 작성 실패:', err);
            alert('글 작성에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0];
    };

    const getAuthorName = (post: FreePost) => {
        return post.author?.name || '알 수 없음';
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">자유게시판</h1>
                    <p className="text-sm text-neutral-500 mt-1">자유롭게 소통하는 공간</p>
                </div>
                <button onClick={() => setShowEditor(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm rounded-xl hover:bg-neutral-800 transition-colors">
                    <Plus className="h-4 w-4" /> 글쓰기
                </button>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                    <span className="ml-2 text-sm text-neutral-400">게시글을 불러오는 중...</span>
                </div>
            ) : sorted.length === 0 ? (
                <div className="text-center py-20 text-sm text-neutral-400">
                    아직 게시글이 없습니다. 첫 글을 작성해 보세요!
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                    {sorted.map((post, idx) => (
                        <button key={post.id} onClick={() => setSelectedPost(post)}
                            className={clsx(
                                "w-full text-left px-5 py-4 hover:bg-neutral-50 transition-colors flex items-center gap-4",
                                idx !== sorted.length - 1 && "border-b border-neutral-100"
                            )}>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate mb-1">{post.title}</p>
                                <div className="flex items-center gap-3 text-xs text-neutral-400">
                                    <span>{getAuthorName(post)}</span>
                                    <span>{formatDate(post.created_at)}</span>
                                    {post.visibility && post.visibility !== '전체' && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-500">
                                            {post.visibility}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-neutral-300 shrink-0" />
                        </button>
                    ))}
                </div>
            )}

            {/* Detail modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 flex items-start justify-between shrink-0">
                            <div>
                                <p className="text-xs text-neutral-400 mb-2">{formatDate(selectedPost.created_at)}</p>
                                <h2 className="text-xl font-bold">{selectedPost.title}</h2>
                                <p className="text-xs text-neutral-400 mt-1">{getAuthorName(selectedPost)}</p>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg shadow-xl rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold">글쓰기</h2>
                            <button onClick={() => setShowEditor(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">제목</label>
                                <input value={editorTitle} onChange={e => setEditorTitle(e.target.value)}
                                    className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
                                    placeholder="제목을 입력하세요" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">공개 대상</label>
                                <div className="flex gap-2 flex-wrap">
                                    {audienceOptions.map(a => (
                                        <button key={a} onClick={() => setEditorAudience(a)}
                                            className={clsx("px-3 py-1.5 text-xs border rounded-lg transition-colors",
                                                editorAudience === a ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"
                                            )}>{a}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">내용</label>
                                <textarea value={editorBody} onChange={e => setEditorBody(e.target.value)}
                                    className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none resize-none"
                                    rows={8} placeholder="내용을 입력하세요" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
                            <button onClick={() => setShowEditor(false)}
                                className="px-5 py-2.5 text-sm text-neutral-500 hover:text-neutral-900">취소</button>
                            <button onClick={handleSubmit} disabled={submitting}
                                className="px-5 py-2.5 bg-neutral-900 text-white text-sm rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                등록
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
