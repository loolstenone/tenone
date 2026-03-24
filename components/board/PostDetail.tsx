"use client";

import { useState } from "react";
import { ArrowLeft, Eye, ThumbsUp, Bookmark, Share2, ChevronUp, ChevronDown, Download, Calendar, User } from "lucide-react";
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

function getAuthorName(post: Post): string {
    if (post.authorType === "guest") return post.guestNickname || "익명";
    if (post.authorType === "agent") return "AI Agent";
    return post.authorName || "관리자";
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
    const [liked, setLiked] = useState(post.isLiked || false);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);
    const [shareToast, setShareToast] = useState(false);

    const handleLike = async () => {
        try {
            const res = await fetch("/api/board/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType: "post", targetId: post.id }),
            });
            if (res.ok) {
                setLiked(!liked);
                setLikeCount((c) => liked ? c - 1 : c + 1);
                onLike?.();
            }
        } catch { /* 비로그인 등 무시 */ }
    };

    const handleBookmark = async () => {
        try {
            const res = await fetch("/api/board/bookmark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: post.id }),
            });
            if (res.ok) {
                setBookmarked(!bookmarked);
                onBookmark?.();
            }
        } catch { /* 비로그인 등 무시 */ }
    };

    const handleShare = async () => {
        await navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* 뒤로가기 */}
            <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
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
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
                    {post.title}
                </h1>
                <div className="flex items-center justify-between text-sm text-neutral-500 pb-4 border-b border-neutral-200">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" /> {getAuthorName(post)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> {formatFullDate(post.createdAt)}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-400">
                        <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" /> {post.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5" /> {likeCount}
                        </span>
                    </div>
                </div>
            </header>

            {/* 본문 */}
            <article
                className="prose prose-neutral max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* 첨부파일 */}
            {post.attachments && post.attachments.length > 0 && (
                <div className="mb-8 p-4 bg-neutral-50 rounded-lg">
                    <h4 className="text-sm font-medium text-neutral-700 mb-3">첨부파일</h4>
                    <div className="space-y-2">
                        {post.attachments.map((file: Attachment) => (
                            <a
                                key={file.id}
                                href={file.filepath}
                                download={file.filename}
                                className="flex items-center justify-between p-2 bg-white rounded border border-neutral-200 hover:border-neutral-300 transition-colors group"
                            >
                                <div className="flex items-center gap-2 text-sm min-w-0">
                                    <Download className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 shrink-0" />
                                    <span className="truncate">{file.filename}</span>
                                    <span className="text-neutral-400 text-xs shrink-0">
                                        ({formatFileSize(file.filesize)})
                                    </span>
                                </div>
                                <span className="text-xs text-neutral-400 shrink-0 ml-2">
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
                            className="px-3 py-1 text-sm bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 cursor-pointer transition-colors"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex items-center justify-center gap-3 py-6 border-t border-b border-neutral-200 mb-8">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors ${
                        liked
                            ? "text-white border-transparent"
                            : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                    }`}
                    style={liked ? { backgroundColor: accentColor } : {}}
                >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm font-medium">{likeCount}</span>
                </button>
                <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-colors ${
                        bookmarked
                            ? "text-amber-600 border-amber-300 bg-amber-50"
                            : "border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                    }`}
                >
                    <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
                    <span className="text-sm">북마크</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-300 text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">공유</span>
                </button>
            </div>

            {/* URL 복사 토스트 */}
            {shareToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg shadow-lg z-50">
                    URL이 복사되었습니다
                </div>
            )}

            {/* 이전/다음 글 */}
            <div className="border border-neutral-200 rounded-lg overflow-hidden mb-8">
                {nextPost && (
                    <button
                        onClick={() => onNavigate?.(nextPost.id)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-neutral-50 transition-colors border-b border-neutral-100"
                    >
                        <ChevronUp className="h-4 w-4 text-neutral-400 shrink-0" />
                        <span className="text-neutral-400 w-14 shrink-0">다음 글</span>
                        <span className="text-neutral-700 truncate text-left">{nextPost.title}</span>
                    </button>
                )}
                {prevPost && (
                    <button
                        onClick={() => onNavigate?.(prevPost.id)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-neutral-50 transition-colors"
                    >
                        <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                        <span className="text-neutral-400 w-14 shrink-0">이전 글</span>
                        <span className="text-neutral-700 truncate text-left">{prevPost.title}</span>
                    </button>
                )}
            </div>

            {/* 댓글 */}
            <CommentSection postId={post.id} accentColor={accentColor} />
        </div>
    );
}
