"use client";

import { Eye, ThumbsUp, MessageCircle, Lock } from "lucide-react";
import type { Post } from "@/types/board";

interface PostListItemProps {
    post: Post;
    accentColor?: string;
    onClick?: (post: Post) => void;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
        return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function getAuthorName(post: Post): string {
    if (post.authorType === "guest") return post.guestNickname || "익명";
    return post.authorName || "관리자";
}

export default function PostListItem({ post, accentColor = "#171717", onClick }: PostListItemProps) {
    const isNew = Date.now() - new Date(post.createdAt).getTime() < 24 * 60 * 60 * 1000;

    return (
        <article
            onClick={() => onClick?.(post)}
            className="flex items-center gap-4 px-4 py-3 border-b tn-border transition-colors cursor-pointer group"
            style={{ borderColor: "var(--tn-border)" }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--tn-bg-alt)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
            {/* 카테고리 */}
            <div className="hidden md:block w-20 shrink-0">
                {post.category && (
                    <span className="text-xs tn-text-muted">{post.category}</span>
                )}
            </div>

            {/* 제목 영역 */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {post.isPinned && (
                        <span
                            className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold text-white rounded"
                            style={{ backgroundColor: accentColor }}
                        >
                            공지
                        </span>
                    )}
                    {post.isSecret && (
                        <Lock className="h-3.5 w-3.5 shrink-0 tn-text-muted" />
                    )}
                    <h3 className="text-sm font-medium tn-text truncate transition-colors">
                        {post.title}
                    </h3>
                    {post.commentCount > 0 && (
                        <span className="text-xs font-medium" style={{ color: accentColor }}>
                            [{post.commentCount}]
                        </span>
                    )}
                    {isNew && (
                        <span className="shrink-0 px-1 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded leading-none">
                            N
                        </span>
                    )}
                </div>
            </div>

            {/* 작성자 */}
            <div className="hidden sm:block w-24 shrink-0 text-xs tn-text-sub text-center truncate">
                {getAuthorName(post)}
            </div>

            {/* 날짜 */}
            <div className="w-20 shrink-0 text-xs tn-text-sub text-center">
                {formatDate(post.createdAt)}
            </div>

            {/* 통계 */}
            <div className="hidden lg:flex items-center gap-3 w-28 shrink-0 text-xs tn-text-sub justify-end">
                <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {post.viewCount}
                </span>
                <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" /> {post.likeCount}
                </span>
            </div>
        </article>
    );
}
