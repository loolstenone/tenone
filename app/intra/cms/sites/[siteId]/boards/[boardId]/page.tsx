"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useCms } from "@/lib/cms-context";
import { BoardTypeInfo } from "@/types/cms";
import type { CmsBoardPost } from "@/types/cms";
import {
    ArrowLeft, Plus, Settings, Pin, Lock, Eye, MessageSquare,
    Star, ChevronDown, ChevronRight, Video, Image as ImageIcon,
} from "lucide-react";
import clsx from "clsx";

const statusBadge: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    published: "bg-emerald-100 text-emerald-700",
    scheduled: "bg-blue-100 text-blue-700",
    private: "bg-purple-100 text-purple-700",
};
const statusLabel: Record<string, string> = {
    draft: "임시",
    published: "발행",
    scheduled: "예약",
    private: "비공개",
};

const boardTypeBadge: Record<string, string> = {
    general: "bg-neutral-100 text-neutral-600",
    notice: "bg-red-100 text-red-700",
    gallery: "bg-indigo-100 text-indigo-700",
    video: "bg-pink-100 text-pink-700",
    faq: "bg-amber-100 text-amber-700",
    qna: "bg-cyan-100 text-cyan-700",
    commerce: "bg-emerald-100 text-emerald-700",
    recruit: "bg-blue-100 text-blue-700",
    event: "bg-purple-100 text-purple-700",
};

function ListView({ posts }: { posts: CmsBoardPost[] }) {
    return (
        <div className="border border-neutral-200 bg-white overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-neutral-100 text-left">
                        <th className="px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider w-1/2">제목</th>
                        <th className="px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">작성자</th>
                        <th className="px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">날짜</th>
                        <th className="px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider">상태</th>
                        <th className="px-6 py-3 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">조회</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                    {posts.map(post => (
                        <tr key={post.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-6 py-3">
                                <div className="flex items-center gap-2">
                                    {post.isPinned && <Pin className="h-3 w-3 text-red-500 shrink-0" />}
                                    {post.isSecret && <Lock className="h-3 w-3 text-neutral-400 shrink-0" />}
                                    <span className="font-medium truncate">{post.title}</span>
                                    {post.isRecommended && <Star className="h-3 w-3 text-amber-500 shrink-0" />}
                                    {post.commentCount > 0 && (
                                        <span className="text-xs text-neutral-400 flex items-center gap-0.5">
                                            <MessageSquare className="h-3 w-3" />{post.commentCount}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-3 text-neutral-500">{post.authorName}</td>
                            <td className="px-6 py-3 text-neutral-400 text-xs">{post.publishedAt ?? post.createdAt}</td>
                            <td className="px-6 py-3">
                                <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium", statusBadge[post.status])}>
                                    {statusLabel[post.status]}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-neutral-400 text-right">{post.viewCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function CardView({ posts }: { posts: CmsBoardPost[] }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
                <div key={post.id} className="border border-neutral-200 bg-white hover:border-neutral-900 transition-all group">
                    {post.image && (
                        <div className="aspect-video bg-neutral-100 flex items-center justify-center text-neutral-300">
                            <ImageIcon className="h-8 w-8" />
                        </div>
                    )}
                    <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                            {post.isPinned && <Pin className="h-3 w-3 text-red-500" />}
                            <span className={clsx("text-[10px] px-1.5 py-0.5 rounded font-medium", statusBadge[post.status])}>
                                {statusLabel[post.status]}
                            </span>
                        </div>
                        <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
                        <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{post.summary}</p>
                        <div className="flex items-center justify-between mt-3 text-xs text-neutral-400">
                            <span>{post.publishedAt ?? post.createdAt}</span>
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.viewCount}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function GalleryView({ posts }: { posts: CmsBoardPost[] }) {
    return (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {posts.map(post => (
                <div key={post.id} className="relative aspect-square bg-neutral-100 border border-neutral-200 hover:border-neutral-900 transition-all group overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                        <ImageIcon className="h-10 w-10" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <p className="text-white text-xs font-medium line-clamp-2">{post.title}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function VideoView({ posts }: { posts: CmsBoardPost[] }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
                <div key={post.id} className="border border-neutral-200 bg-white hover:border-neutral-900 transition-all group">
                    <div className="relative aspect-video bg-neutral-900 flex items-center justify-center">
                        <Video className="h-10 w-10 text-neutral-500" />
                        {post.videoDuration && (
                            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                                {post.videoDuration}
                            </span>
                        )}
                    </div>
                    <div className="p-4">
                        <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
                        <div className="flex items-center justify-between mt-2 text-xs text-neutral-400">
                            <span>{post.authorName}</span>
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.viewCount}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function FaqQnaView({ posts }: { posts: CmsBoardPost[] }) {
    const [open, setOpen] = useState<Set<string>>(new Set());

    const toggle = (id: string) => {
        setOpen(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    return (
        <div className="border border-neutral-200 bg-white divide-y divide-neutral-100">
            {posts.map(post => (
                <div key={post.id}>
                    <button onClick={() => toggle(post.id)}
                        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-neutral-50 transition-colors">
                        {open.has(post.id)
                            ? <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
                            : <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
                        }
                        <span className="text-sm font-medium flex-1">Q. {post.title}</span>
                        {post.answerStatus && (
                            <span className={clsx(
                                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                                post.answerStatus === '완료' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            )}>
                                {post.answerStatus}
                            </span>
                        )}
                    </button>
                    {open.has(post.id) && (
                        <div className="px-6 pb-4 pl-13">
                            <div className="text-sm text-neutral-600 bg-neutral-50 p-4 rounded">
                                <span className="font-medium text-neutral-900">A. </span>
                                {post.answer || post.body || "답변이 아직 등록되지 않았습니다."}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function BoardPostListPage({ params }: { params: Promise<{ siteId: string; boardId: string }> }) {
    const { siteId, boardId } = use(params);
    const router = useRouter();
    const { getBoardById, getPostsByBoard, getSiteById } = useCms();

    const board = getBoardById(boardId);
    const site = getSiteById(siteId);
    const posts = getPostsByBoard(boardId);

    if (!board || !site) {
        return (
            <div className="flex items-center justify-center py-20 text-neutral-400">
                게시판을 찾을 수 없습니다
            </div>
        );
    }

    const isFaqQna = board.boardType === 'faq' || board.boardType === 'qna';

    const renderPosts = () => {
        if (posts.length === 0) {
            return (
                <div className="border border-neutral-200 bg-white px-6 py-12 text-center text-neutral-400 text-sm">
                    게시글이 없습니다. 새 글을 작성해보세요.
                </div>
            );
        }
        if (isFaqQna) return <FaqQnaView posts={posts} />;
        switch (board.skinType) {
            case 'card': return <CardView posts={posts} />;
            case 'gallery': return <GalleryView posts={posts} />;
            case 'video': return <VideoView posts={posts} />;
            default: return <ListView posts={posts} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <button onClick={() => router.push(`/intra/cms/sites/${siteId}`)}
                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-900 mb-4 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" /> {site.name}
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold">{board.name}</h2>
                            <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium", boardTypeBadge[board.boardType])}>
                                {BoardTypeInfo[board.boardType].label}
                            </span>
                        </div>
                        {board.description && (
                            <p className="mt-1 text-sm text-neutral-500">{board.description}</p>
                        )}
                        <p className="text-xs text-neutral-400 mt-1">총 {posts.length}개 게시글</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => router.push(`/intra/cms/sites/${siteId}/boards/${boardId}/settings`)}
                            className="flex items-center gap-2 border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50 transition-colors">
                            <Settings className="h-3.5 w-3.5" /> 설정
                        </button>
                        <button onClick={() => router.push(`/intra/cms/sites/${siteId}/boards/${boardId}/new`)}
                            className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-800 transition-colors">
                            <Plus className="h-4 w-4" /> 글쓰기
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts */}
            {renderPosts()}
        </div>
    );
}
