"use client";

import { Eye, ThumbsUp, MessageCircle, Lock } from "lucide-react";
import type { Post } from "@/types/board";

interface PostCardProps {
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
    if (days < 30) return `${Math.floor(days / 7)}주 전`;
    return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function getAuthorName(post: Post): string {
    if (post.authorType === "guest") return post.guestNickname || "익명";
    return post.authorName || "관리자";
}

function getAuthorInitial(post: Post): string {
    const name = getAuthorName(post);
    return name.charAt(0).toUpperCase();
}

export default function PostCard({ post, accentColor = "#171717", onClick }: PostCardProps) {
    const isNew = Date.now() - new Date(post.createdAt).getTime() < 24 * 60 * 60 * 1000;

    return (
        <article
            onClick={() => onClick?.(post)}
            className="group relative border rounded-lg overflow-hidden transition-all duration-200 cursor-pointer
                hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5"
            style={{ borderColor: "var(--tn-border)", backgroundColor: "var(--tn-surface)" }}
        >
            {/* 대표 이미지 */}
            {post.representImage ? (
                <div className="aspect-[3/2] overflow-hidden" style={{ backgroundColor: "var(--tn-bg-alt)" }}>
                    <img
                        src={post.representImage}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundColor: "var(--tn-bg-alt)" }}
                    />
                </div>
            ) : (
                <div className="aspect-[3/2] flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                    style={{ backgroundColor: "var(--tn-bg-alt)" }}>
                    <span className="text-3xl font-bold opacity-[0.06] absolute"
                        style={{ fontSize: "6rem" }}>
                        {post.title?.substring(0, 1)}
                    </span>
                    <span className="text-xs tracking-wider uppercase tn-text-muted">{post.category}</span>
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

                <h3 className="font-medium tn-text line-clamp-2 transition-colors leading-snug">
                    {post.title}
                    {post.commentCount > 0 && (
                        <span className="ml-1 text-sm" style={{ color: accentColor }}>
                            [{post.commentCount}]
                        </span>
                    )}
                </h3>

                {post.excerpt && (
                    <p className="mt-1.5 text-sm tn-text-muted line-clamp-2">{post.excerpt}</p>
                )}

                <div className="flex items-center justify-between mt-3 text-xs tn-text-sub">
                    <div className="flex items-center gap-2">
                        {/* Author avatar */}
                        {post.authorAvatar ? (
                            <img src={post.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" loading="lazy" />
                        ) : (
                            <span
                                className="flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold text-white"
                                style={{ backgroundColor: accentColor }}
                            >
                                {getAuthorInitial(post)}
                            </span>
                        )}
                        <span>{getAuthorName(post)}</span>
                        <span className="tn-text-muted">&middot;</span>
                        <span className="tn-text-muted">{formatRelativeDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 tn-text-muted">
                        <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {post.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" /> {post.likeCount}
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
            {post.isSecret && (
                <div className="absolute top-2 left-2 p-1 bg-black/50 text-white rounded">
                    <Lock className="h-3.5 w-3.5" />
                </div>
            )}
        </article>
    );
}
