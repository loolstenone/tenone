"use client";

import { Eye, ThumbsUp, MessageCircle } from "lucide-react";
import type { Post } from "@/types/board";

interface PostCardProps {
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
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function getAuthorName(post: Post): string {
    if (post.authorType === "guest") return post.guestNickname || "익명";
    return post.authorName || "관리자";
}

export default function PostCard({ post, accentColor = "#171717", onClick }: PostCardProps) {
    const isNew = Date.now() - new Date(post.createdAt).getTime() < 24 * 60 * 60 * 1000;

    return (
        <article
            onClick={() => onClick?.(post)}
            className="group relative bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
        >
            {/* 대표 이미지 */}
            {post.representImage ? (
                <div className="aspect-video bg-neutral-100 overflow-hidden">
                    <img
                        src={post.representImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            ) : (
                <div className="aspect-video bg-neutral-50 flex items-center justify-center">
                    <span className="text-neutral-300 text-sm">No Image</span>
                </div>
            )}

            {/* 콘텐츠 */}
            <div className="p-4">
                <div className="flex items-start gap-2 mb-2">
                    {post.category && (
                        <span
                            className="shrink-0 px-2 py-0.5 text-xs rounded-full text-white"
                            style={{ backgroundColor: accentColor }}
                        >
                            {post.category}
                        </span>
                    )}
                    {isNew && (
                        <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded">
                            NEW
                        </span>
                    )}
                </div>

                <h3 className="font-medium text-neutral-900 line-clamp-2 group-hover:opacity-70 transition-opacity">
                    {post.title}
                    {post.commentCount > 0 && (
                        <span className="ml-1 text-sm" style={{ color: accentColor }}>
                            [{post.commentCount}]
                        </span>
                    )}
                </h3>

                {post.excerpt && (
                    <p className="mt-1.5 text-sm text-neutral-500 line-clamp-2">{post.excerpt}</p>
                )}

                <div className="flex items-center justify-between mt-3 text-xs text-neutral-400">
                    <span>{getAuthorName(post)} · {formatDate(post.createdAt)}</span>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {post.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" /> {post.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" /> {post.commentCount}
                        </span>
                    </div>
                </div>
            </div>

            {post.isPinned && (
                <div
                    className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold text-white rounded"
                    style={{ backgroundColor: accentColor }}
                >
                    공지
                </div>
            )}
        </article>
    );
}
