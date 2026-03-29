"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Eye, ThumbsUp, Bookmark, Share2, ChevronUp, ChevronDown, Download, Calendar, User, Lock, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import CommentSection from "./CommentSection";
import type { Post, Attachment } from "@/types/board";

interface PostDetailProps {
    post: Post;
    accentColor?: string;
    prevPost?: { id: string; title: string } | null;
    nextPost?: { id: string; title: string } | null;
    onBack?: () => void;
    onNavigate?: (postId: string) => void;
    onLike?: () => void;
    onBookmark?: () => void;
}

function formatFullDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

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
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

function getAuthorName(post: Post): string {
    if (post.authorType === "guest") return post.guestNickname || "익명";
    if (post.authorType === "agent") return "AI Agent";
    return post.authorName || "관리자";
}

function getAuthorInitial(post: Post): string {
    const name = getAuthorName(post);
    return name.charAt(0).toUpperCase();
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default function PostDetail({
    post,
    accentColor = "#171717",
    prevPost,
    nextPost,
    onBack,
    onNavigate,
    onLike,
    onBookmark,
}: PostDetailProps) {
    const { user } = useAuth();
    const [liked, setLiked] = useState(post.isLiked || false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);
    const [shareToast, setShareToast] = useState(false);
    const [loginToast, setLoginToast] = useState(false);

    // Lightbox
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    // Related posts
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);

    // Fetch related posts
    useEffect(() => {
        if (post.category || post.board) {
            fetch(`/api/board/posts?site=${post.site}&board=${post.board}${post.category ? `&category=${post.category}` : ''}&limit=4&status=published`)
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    if (data?.posts) {
                        setRelatedPosts(data.posts.filter((p: Post) => p.id !== post.id).slice(0, 3));
                    }
                })
                .catch(() => {});
        }
    }, [post.id, post.site, post.board, post.category]);

    // Click handler for images in content -> lightbox
    useEffect(() => {
        const handleImageClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "IMG" && target.closest("[data-post-content]")) {
                e.preventDefault();
                setLightboxSrc((target as HTMLImageElement).src);
            }
        };
        document.addEventListener("click", handleImageClick);
        return () => document.removeEventListener("click", handleImageClick);
    }, []);

    const handleLike = async () => {
        if (!user) { setLoginToast(true); setTimeout(() => setLoginToast(false), 2000); return; }
        try {
            const res = await fetch("/api/board/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType: "post", targetId: post.id, userId: user.id }),
            });
            if (res.ok) {
                const data = await res.json();
                const newLiked = data.liked;
                setLiked(newLiked);
                setLikeCount(data.count ?? (newLiked ? likeCount + 1 : likeCount - 1));
                onLike?.();
            }
        } catch { /* ignore */ }
    };

    const handleBookmark = async () => {
        if (!user) { setLoginToast(true); setTimeout(() => setLoginToast(false), 2000); return; }
        try {
            const res = await fetch("/api/board/bookmark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: post.id, userId: user.id }),
            });
            if (res.ok) {
                const data = await res.json();
                setBookmarked(data.bookmarked);
                onBookmark?.();
            }
        } catch { /* ignore */ }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch {
            // fallback
            const input = document.createElement("input");
            input.value = window.location.href;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
        }
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* 뒤로가기 */}
            <button
                onClick={onBack}
                className="flex items-center gap-1 py-2 px-3 -ml-3 text-sm tn-text-sub hover:tn-text transition-colors mb-6"
            >
                <ArrowLeft className="h-4 w-4" /> 목록으로
            </button>

            {/* 헤더 */}
            <header className="mb-8">
                {post.category && (
                    <span
                        className="inline-block px-2.5 py-1 text-xs rounded-full text-white mb-3"
                        style={{ backgroundColor: accentColor }}
                    >
                        {post.category}
                    </span>
                )}
                <h1 className="text-2xl md:text-3xl font-bold tn-text mb-4 flex items-center gap-2">
                    {post.isSecret && <Lock className="h-5 w-5 tn-text-muted shrink-0" />}
                    {post.title}
                </h1>
                <div className="flex items-center justify-between flex-wrap gap-2 text-sm tn-text-sub pb-4 border-b tn-border">
                    <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-2">
                            {/* Author avatar */}
                            {post.authorAvatar ? (
                                <img src={post.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                            ) : (
                                <span
                                    className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {getAuthorInitial(post)}
                                </span>
                            )}
                            {getAuthorName(post)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span title={formatFullDate(post.createdAt)}>{formatRelativeDate(post.createdAt)}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-3 tn-text-muted">
                        <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" /> {post.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5" /> {likeCount}
                        </span>
                    </div>
                </div>
            </header>

            {/* 대표 이미지 (본문 상단) */}
            {post.representImage && !post.content?.includes(post.representImage) && (
                <div className="mb-8 -mx-4 sm:mx-0">
                    <img
                        src={post.representImage}
                        alt={post.title}
                        className="w-full max-h-[500px] object-cover sm:rounded-lg cursor-pointer transition-opacity hover:opacity-90"
                        onClick={() => setLightboxSrc(post.representImage)}
                    />
                </div>
            )}

            {/* 본문 */}
            <article
                data-post-content
                className="prose prose-neutral dark:prose-invert max-w-none mb-8
                    prose-img:w-full prose-img:rounded-lg prose-img:my-6 prose-img:cursor-pointer prose-img:transition-opacity hover:prose-img:opacity-90
                    prose-p:leading-relaxed prose-p:text-[15px]
                    prose-a:underline prose-a:underline-offset-2
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-blockquote:border-l-2 prose-blockquote:pl-4 prose-blockquote:italic
                    [&_img]:max-w-full [&_img]:h-auto"
                style={{ color: "var(--tn-text-sub)" }}
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* 첨부파일 */}
            {post.attachments && post.attachments.length > 0 && (
                <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: "var(--tn-bg-alt)" }}>
                    <h4 className="text-sm font-medium tn-text-sub mb-3">첨부파일</h4>
                    <div className="space-y-2">
                        {post.attachments.map((file: Attachment) => (
                            <a
                                key={file.id}
                                href={file.filepath}
                                download={file.filename}
                                className="flex items-center justify-between p-2 rounded border transition-colors group"
                                style={{ borderColor: "var(--tn-border)", backgroundColor: "var(--tn-surface)" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--tn-bg-alt)"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--tn-surface)"}
                            >
                                <div className="flex items-center gap-2 text-sm min-w-0">
                                    <Download className="h-4 w-4 tn-text-muted shrink-0" />
                                    <span className="truncate tn-text">{file.filename}</span>
                                    <span className="tn-text-muted text-xs shrink-0">
                                        ({formatFileSize(file.filesize)})
                                    </span>
                                </div>
                                <span className="text-xs tn-text-muted shrink-0 ml-2">
                                    {file.downloadCount}회
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* 태그 */}
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    {post.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-3 py-1 text-sm rounded-full cursor-pointer transition-colors"
                            style={{ backgroundColor: "var(--tn-bg-alt)", color: "var(--tn-text-sub)" }}
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex items-center justify-center gap-3 py-6 border-t border-b mb-8" style={{ borderColor: "var(--tn-border)" }}>
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-200 ${
                        liked
                            ? "text-white border-transparent scale-105"
                            : "tn-text-sub hover:scale-105"
                    }`}
                    style={liked
                        ? { backgroundColor: accentColor }
                        : { borderColor: "var(--tn-border)" }
                    }
                >
                    <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                    <span className="text-sm font-medium">{likeCount}</span>
                </button>
                <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-200 ${
                        bookmarked
                            ? "text-amber-600 border-amber-300 dark:border-amber-700 dark:text-amber-400"
                            : "tn-text-sub hover:scale-105"
                    }`}
                    style={bookmarked
                        ? { backgroundColor: "rgba(245,158,11,0.1)" }
                        : { borderColor: "var(--tn-border)" }
                    }
                >
                    <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                    <span className="text-sm">북마크</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full border tn-text-sub transition-all duration-200 hover:scale-105"
                    style={{ borderColor: "var(--tn-border)" }}
                >
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">공유</span>
                </button>
            </div>

            {/* 이전/다음 글 */}
            {(prevPost || nextPost) && (
                <div className="border rounded-lg overflow-hidden mb-8" style={{ borderColor: "var(--tn-border)" }}>
                    {nextPost && (
                        <button
                            onClick={() => onNavigate?.(nextPost.id)}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors border-b"
                            style={{ borderColor: "var(--tn-border)" }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--tn-bg-alt)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                            <ChevronUp className="h-4 w-4 tn-text-muted shrink-0" />
                            <span className="tn-text-muted w-14 shrink-0">다음 글</span>
                            <span className="tn-text-sub truncate text-left">{nextPost.title}</span>
                        </button>
                    )}
                    {prevPost && (
                        <button
                            onClick={() => onNavigate?.(prevPost.id)}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors"
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--tn-bg-alt)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                            <ChevronDown className="h-4 w-4 tn-text-muted shrink-0" />
                            <span className="tn-text-muted w-14 shrink-0">이전 글</span>
                            <span className="tn-text-sub truncate text-left">{prevPost.title}</span>
                        </button>
                    )}
                </div>
            )}

            {/* 관련 글 */}
            {relatedPosts.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-base font-semibold tn-text mb-4">관련 글</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {relatedPosts.map((rp) => (
                            <button
                                key={rp.id}
                                onClick={() => onNavigate?.(rp.id)}
                                className="text-left p-3 rounded-lg border transition-all duration-200 hover:shadow-sm"
                                style={{ borderColor: "var(--tn-border)" }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--tn-bg-alt)"}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                {rp.representImage && (
                                    <div className="aspect-[16/9] rounded overflow-hidden mb-2" style={{ backgroundColor: "var(--tn-bg-alt)" }}>
                                        <img src={rp.representImage} alt="" className="w-full h-full object-cover" loading="lazy" />
                                    </div>
                                )}
                                <h4 className="text-sm font-medium tn-text line-clamp-2">{rp.title}</h4>
                                <p className="text-xs tn-text-muted mt-1">{formatRelativeDate(rp.createdAt)}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 댓글 */}
            <CommentSection postId={post.id} accentColor={accentColor} />

            {/* Lightbox */}
            {lightboxSrc && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setLightboxSrc(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
                        onClick={() => setLightboxSrc(null)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <img
                        src={lightboxSrc}
                        alt=""
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}

            {/* 토스트 */}
            {shareToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 text-sm rounded-lg shadow-lg z-50 bg-neutral-800 text-white">
                    URL이 복사되었습니다
                </div>
            )}
            {loginToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 text-sm rounded-lg shadow-lg z-50 bg-neutral-800 text-white">
                    로그인이 필요합니다
                </div>
            )}
        </div>
    );
}
