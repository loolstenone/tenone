'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { MessageCircle, Send, EyeOff, Trash2, Lock, ChevronDown, ChevronUp } from 'lucide-react';

interface Comment {
    id: string;
    body: string;
    is_hidden: boolean;
    created_at: string;
    author: {
        id: string;
        name: string;
        handle?: string;
        avatar_url?: string;
    } | null;
}

interface ProfileCommentsProps {
    targetMemberId: string;
    targetHandle?: string;
    isOwner?: boolean;
}

export function ProfileComments({ targetMemberId, targetHandle, isOwner = false }: ProfileCommentsProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [body, setBody] = useState('');
    const [isHidden, setIsHidden] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const COLLAPSE_LINES = 3;
    const LINE_HEIGHT = 22; // px (text-sm leading-relaxed ≈ 1.625 * 14px)
    const COLLAPSE_HEIGHT = COLLAPSE_LINES * LINE_HEIGHT;

    function toggleExpand(id: string) {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    const loadComments = useCallback(async () => {
        const supabase = createClient();
        const { data } = await supabase
            .from('profile_comments')
            .select(`
                id, body, is_hidden, created_at,
                author:author_member_id (id, name, handle, avatar_url)
            `)
            .eq('target_member_id', targetMemberId)
            .order('created_at', { ascending: false });

        setComments((data || []) as Comment[]);
        setLoading(false);
    }, [targetMemberId]);

    useEffect(() => { loadComments(); }, [loadComments]);

    async function submitComment() {
        if (!body.trim() || !user) return;
        setSubmitting(true);
        setError('');
        try {
            const supabase = createClient();
            const { error: err } = await supabase.from('profile_comments').insert({
                target_member_id: targetMemberId,
                author_member_id: user.id,
                body: body.trim(),
                is_hidden: isHidden,
            });
            if (err) { setError('작성에 실패했습니다.'); return; }
            setBody('');
            setIsHidden(false);
            await loadComments();
        } finally {
            setSubmitting(false);
        }
    }

    async function hideComment(id: string) {
        const supabase = createClient();
        await supabase.from('profile_comments').update({ is_hidden: true }).eq('id', id);
        setComments(cs => cs.map(c => c.id === id ? { ...c, is_hidden: true } : c));
    }

    async function deleteComment(id: string) {
        const supabase = createClient();
        await supabase.from('profile_comments').delete().eq('id', id);
        setComments(cs => cs.filter(c => c.id !== id));
    }

    const initials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const canHide   = (c: Comment) => isOwner && !c.is_hidden;
    const canDelete = (c: Comment) => user && c.author?.id === user.id;

    return (
        <div className="rounded-2xl border tn-border tn-surface p-6">
            <h2 className="text-xs font-semibold tn-text-sub flex items-center gap-2 mb-5">
                <MessageCircle className="h-3.5 w-3.5" />
                방명록 <span className="font-normal">({comments.filter(c => !c.is_hidden).length})</span>
            </h2>

            {/* 작성 폼 (로그인 사용자) */}
            {user ? (
                <div className="mb-6">
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        maxLength={500}
                        rows={3}
                        placeholder={`@${targetHandle || '이 사람'}에게 메시지를 남겨보세요.`}
                        className="w-full text-sm tn-text bg-transparent border tn-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none placeholder:tn-text-sub"
                    />
                    <div className="flex items-center justify-between mt-2 gap-2">
                        <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => setIsHidden(v => !v)}>
                            <button type="button" role="switch" aria-checked={isHidden}
                                onClick={e => { e.stopPropagation(); setIsHidden(v => !v); }}
                                className={`relative w-9 h-5 rounded-full transition-all shrink-0 focus:outline-none ${isHidden ? 'bg-blue-600' : 'bg-neutral-500/40'}`}>
                                <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${isHidden ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                            <span className={`text-[11px] flex items-center gap-1 transition-colors ${isHidden ? 'text-blue-400' : 'tn-text-sub'}`}>
                                <Lock className="h-2.5 w-2.5" /> 비밀 댓글
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] tn-text-sub">{body.length}/500</span>
                            <button
                                onClick={submitComment}
                                disabled={!body.trim() || submitting}
                                className="flex items-center gap-1.5 text-xs font-medium text-white bg-neutral-900 px-3 py-1.5 rounded-lg hover:bg-neutral-700 disabled:opacity-40 transition-colors cursor-pointer">
                                <Send className="h-3 w-3" />
                                {submitting ? '작성 중...' : '남기기'}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                </div>
            ) : (
                <div className="mb-6 p-4 rounded-xl border border-dashed tn-border text-center">
                    <p className="text-xs tn-text-sub">로그인하면 방명록을 남길 수 있습니다.</p>
                </div>
            )}

            {/* 댓글 목록 */}
            {loading ? (
                <div className="flex justify-center py-6">
                    <div className="h-5 w-5 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-sm tn-text-sub text-center py-6">아직 방명록이 없습니다.</p>
            ) : (
                <div className="space-y-4">
                    {comments.map(c => (
                        <div key={c.id} className={`flex gap-3 group ${c.is_hidden ? 'opacity-50' : ''}`}>
                            {/* 아바타 */}
                            <div className="shrink-0">
                                {c.author?.avatar_url ? (
                                    <Image src={c.author.avatar_url} alt={c.author.name || ''} width={32} height={32}
                                        className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-bold text-neutral-600">
                                        {c.author ? initials(c.author.name) : '?'}
                                    </div>
                                )}
                            </div>
                            {/* 본문 */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-semibold tn-text">
                                        {c.author?.name || '탈퇴한 사용자'}
                                    </span>
                                    {c.author?.handle && (
                                        <span className="text-[10px] tn-text-sub">@{c.author.handle}</span>
                                    )}
                                    {c.is_hidden && (
                                        <span className="inline-flex items-center gap-0.5 text-[10px] tn-text-sub">
                                            <EyeOff className="h-2.5 w-2.5" /> 숨김
                                        </span>
                                    )}
                                    <span className="text-[10px] tn-text-sub ml-auto">
                                        {new Date(c.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                {(() => {
                                    const isExpanded = expandedIds.has(c.id);
                                    // 줄 수 추정: 줄바꿈 포함 80자 기준
                                    const estimatedLines = c.body.split('\n').reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / 40)), 0);
                                    const needsCollapse = estimatedLines > COLLAPSE_LINES;
                                    return (
                                        <>
                                            <p className="text-sm tn-text leading-relaxed whitespace-pre-wrap break-words overflow-hidden transition-all"
                                                style={{ maxHeight: needsCollapse && !isExpanded ? `${COLLAPSE_HEIGHT}px` : 'none' }}>
                                                {c.body}
                                            </p>
                                            {needsCollapse && (
                                                <button onClick={() => toggleExpand(c.id)}
                                                    className="mt-1 text-[11px] tn-text-sub hover:tn-text flex items-center gap-0.5 transition-colors cursor-pointer">
                                                    {isExpanded
                                                        ? <><ChevronUp className="h-3 w-3" /> 접기</>
                                                        : <><ChevronDown className="h-3 w-3" /> 더 보기</>}
                                                </button>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                            {/* 액션 버튼 */}
                            <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
                                {canHide(c) && (
                                    <button onClick={() => hideComment(c.id)} title="숨기기"
                                        className="p-1 rounded hover:bg-neutral-100 tn-text-sub transition-colors cursor-pointer">
                                        <EyeOff className="h-3 w-3" />
                                    </button>
                                )}
                                {canDelete(c) && (
                                    <button onClick={() => deleteComment(c.id)} title="삭제"
                                        className="p-1 rounded hover:bg-red-50 text-red-400 transition-colors cursor-pointer">
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
