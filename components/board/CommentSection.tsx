"use client";

import { useState, useEffect, useCallback } from "react";
import { ThumbsUp, CornerDownRight, Trash2, MoreHorizontal } from "lucide-react";
import type { Comment } from "@/types/board";

interface CommentSectionProps {
    postId: string;
    accentColor?: string;
}

interface CommentItemProps {
    comment: Comment;
    accentColor: string;
    isReply?: boolean;
    onReply?: (commentId: string) => void;
    onDelete?: (commentId: string) => void;
    onLike?: (commentId: string) => void;
}

function formatDate(dateStr: string): string {
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

function getAuthorName(comment: Comment): string {
    if (comment.authorType === "guest") return comment.guestNickname || "익명";
    return comment.authorName || "회원";
}

function CommentItem({ comment, accentColor, isReply, onReply, onDelete, onLike }: CommentItemProps) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className={`${isReply ? "ml-8 md:ml-12" : ""}`}>
            <div className={`py-4 ${!isReply ? "border-b tn-border" : ""}`} style={!isReply ? { borderColor: "var(--tn-border)" } : {}}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 mb-2">
                        {isReply && <CornerDownRight className="h-3 w-3 tn-text-muted" />}
                        <span className="text-sm font-medium tn-text">
                            {getAuthorName(comment)}
                        </span>
                        <span className="text-xs tn-text-muted">
                            {formatDate(comment.createdAt)}
                        </span>
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 tn-text-muted"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-1 py-1 tn-surface border tn-border rounded-lg shadow-lg z-10 min-w-[100px]"
                                style={{ borderColor: "var(--tn-border)" }}
                            >
                                <button
                                    onClick={() => { onDelete?.(comment.id); setShowMenu(false); }}
                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="h-3 w-3" /> 삭제
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-sm tn-text-sub whitespace-pre-wrap">{comment.content}</p>

                <div className="flex items-center gap-3 mt-2">
                    <button
                        onClick={() => onLike?.(comment.id)}
                        className="flex items-center gap-1 text-xs tn-text-muted"
                    >
                        <ThumbsUp className={`h-3 w-3 ${comment.isLiked ? "fill-current" : ""}`}
                            style={comment.isLiked ? { color: accentColor } : {}}
                        />
                        {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
                    </button>
                    {!isReply && (
                        <button
                            onClick={() => onReply?.(comment.id)}
                            className="text-xs tn-text-muted"
                        >
                            답글
                        </button>
                    )}
                </div>
            </div>

            {/* 대댓글 */}
            {comment.replies && comment.replies.length > 0 && (
                <div>
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            accentColor={accentColor}
                            isReply
                            onDelete={onDelete}
                            onLike={onLike}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CommentSection({ postId, accentColor = "#171717" }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [guestNickname, setGuestNickname] = useState("");
    const [guestPassword, setGuestPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // TODO: 실제 인증 상태 체크
    const isLoggedIn = false;

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/board/comments?postId=${postId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments || []);
            }
        } catch (err) {
            console.error("댓글 로딩 실패:", err);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        if (!isLoggedIn && (!guestNickname.trim() || !guestPassword.trim())) return;

        setSubmitting(true);
        try {
            const body: Record<string, string> = {
                postId,
                content: content.trim(),
            };
            if (replyTo) body.parentId = replyTo;
            if (!isLoggedIn) {
                body.guestNickname = guestNickname.trim();
                body.guestPassword = guestPassword.trim();
            }

            const res = await fetch("/api/board/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setContent("");
                setReplyTo(null);
                fetchComments();
            }
        } catch (err) {
            console.error("댓글 작성 실패:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = (commentId: string) => {
        setReplyTo(commentId);
        // 포커스를 입력폼으로
        document.getElementById("comment-input")?.focus();
    };

    const handleLike = async (commentId: string) => {
        try {
            await fetch("/api/board/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType: "comment", targetId: commentId }),
            });
            fetchComments();
        } catch { /* ignore */ }
    };

    const replyTarget = replyTo
        ? comments.find((c) => c.id === replyTo)
        : null;

    return (
        <section>
            <h3 className="text-lg font-semibold tn-text mb-4">
                댓글 <span className="text-sm font-normal tn-text-muted">{comments.length}</span>
            </h3>

            {/* 댓글 작성 */}
            <form onSubmit={handleSubmit} className="mb-6">
                {replyTo && (
                    <div className="flex items-center gap-2 mb-2 text-sm tn-text-sub">
                        <CornerDownRight className="h-3 w-3" />
                        <span>{replyTarget ? getAuthorName(replyTarget) : ""}에게 답글 작성 중</span>
                        <button
                            type="button"
                            onClick={() => setReplyTo(null)}
                            className="text-xs tn-text-muted underline"
                        >
                            취소
                        </button>
                    </div>
                )}

                {/* 비회원 정보 입력 */}
                {!isLoggedIn && (
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={guestNickname}
                            onChange={(e) => setGuestNickname(e.target.value)}
                            placeholder="닉네임"
                            className="flex-1 px-3 py-2 text-sm border tn-border rounded-lg focus:outline-none bg-transparent tn-text"
                            style={{ borderColor: "var(--tn-border)" }}
                            maxLength={20}
                        />
                        <input
                            type="password"
                            value={guestPassword}
                            onChange={(e) => setGuestPassword(e.target.value)}
                            placeholder="비밀번호"
                            className="flex-1 px-3 py-2 text-sm border tn-border rounded-lg focus:outline-none bg-transparent tn-text"
                            style={{ borderColor: "var(--tn-border)" }}
                            maxLength={20}
                        />
                    </div>
                )}

                <div className="flex gap-2">
                    <textarea
                        id="comment-input"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="댓글을 작성하세요..."
                        rows={3}
                        className="flex-1 px-3 py-2 text-sm border tn-border rounded-lg resize-none focus:outline-none bg-transparent tn-text"
                        style={{ borderColor: "var(--tn-border)" }}
                    />
                    <button
                        type="submit"
                        disabled={submitting || !content.trim()}
                        className="self-end px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50"
                        style={{ backgroundColor: accentColor }}
                    >
                        {submitting ? "..." : "등록"}
                    </button>
                </div>
            </form>

            {/* 댓글 목록 */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="h-5 w-5 border-2 rounded-full animate-spin" style={{ borderColor: "var(--tn-border)", borderTopColor: "var(--tn-text)" }} />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-center py-8 text-sm tn-text-muted">
                    첫 번째 댓글을 남겨보세요
                </p>
            ) : (
                <div>
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            accentColor={accentColor}
                            onReply={handleReply}
                            onDelete={() => {/* TODO: 삭제 모달 */}}
                            onLike={handleLike}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
