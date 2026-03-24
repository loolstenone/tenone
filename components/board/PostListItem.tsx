"use client";

import { Eye, ThumbsUp, MessageCircle } from "lucide-react";
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
            className="flex items-center gap-4 px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer group"
        >
            {/* 카테고리 */}
            <div className="hidden md:block w-20 shrink-0">
                {post.category && (
                    <span className="text-xs text-neutral-500">{post.category}</span>
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
                    <h3 className="text-sm font-medium text-neutral-900 truncate group-hover:opacity-70 transition-opacity">
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
                    {post.representImage && (
                        <span className="text-neutral-300 text-xs">📷</span>
                    )}
                </div>
            </div>

            {/* 작성자 */}
            <div className="hidden sm:block w-24 shrink-0 text-xs text-neutral-500 text-center truncate">
                {getAuthorName(post)}
            </div>

            {/* 날짜 */}
            <div className="w-20 shrink-0 text-xs text-neutral-400 text-center">
                {formatDate(post.createdAt)}
            </div>

            {/* 통계 */}
            <div className="hidden lg:flex items-center gap-3 w-28 shrink-0 text-xs text-neutral-400 justify-end">
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
