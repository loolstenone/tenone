"use client";

import { Eye, ThumbsUp, MessageCircle, Lock } from "lucide-react";
import type { Post } from "@/types/board";

interface PostListItemProps {
    post: Post;
    accentColor?: string;
    onClick?: (post: Post) => void;
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
    if (days === 1) return "어제";
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function getAuthorName(post: Post): string {
    if (post.authorType === "guest") return post.guestNickname || "익명";
    return post.authorName || "관리자";
}

function getAuthorInitial(post: Post): string {
    const name = getAuthorName(post);
    return name.charAt(0).toUpperCase();
}

export default function PostListItem({ post, accentColor = "#171717", onClick }: PostListItemProps) {
    const isNew = Date.now() - new Date(post.createdAt).getTime() < 24 * 60 * 60 * 1000;

    return (
        <article
            onClick={() => onClick?.(post)}
            className="flex items-center gap-4 px-4 py-3 border-b transition-colors cursor-pointer group"
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
            <div className="hidden sm:flex items-center gap-1.5 w-28 shrink-0 text-xs tn-text-sub justify-center">
                {post.authorAvatar ? (
                    <img src={post.authorAvatar} alt="" className="w-4 h-4 rounded-full object-cover" loading="lazy" />
                ) : (
                    <span
                        className="flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold text-white"
                        style={{ backgroundColor: accentColor }}
                    >
                        {getAuthorInitial(post)}
                    </span>
                )}
                <span className="truncate">{getAuthorName(post)}</span>
            </div>

            {/* 날짜 */}
            <div className="w-20 shrink-0 text-xs tn-text-sub text-center">
                {formatRelativeDate(post.createdAt)}
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
