"use client";

import { use, useState } from "react";
import Link from "next/link";
const BoardTypeInfo: Record<string, { label: string }> = {};
import { Search, Eye, MessageSquare, Pin, Lock } from "lucide-react";
import clsx from "clsx";

const statusBadge: Record<string, string> = {
    published: "text-green-700 bg-green-50",
    draft: "text-neutral-500 bg-neutral-100",
    scheduled: "text-blue-700 bg-blue-50",
    private: "text-amber-700 bg-amber-50",
};

const statusLabel: Record<string, string> = {
    published: "게시됨",
    draft: "임시저장",
    scheduled: "예약",
    private: "비공개",
};

export default function SiteContentPage({ params }: { params: Promise<{ siteId: string }> }) {
    const { siteId } = use(params);
    const site: any = null;
    const boards: any[] = [];
    const getPostsByBoard = (_id: string): any[] => [];

    const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // 전체 게시물 통합
    const allPosts = boards.flatMap(board =>
        getPostsByBoard(board.id).map(post => ({
            ...post,
            boardName: board.name,
            boardType: board.boardType,
        }))
    ).sort((a, b) => (b.publishedAt || b.createdAt || '').localeCompare(a.publishedAt || a.createdAt || ''));

    const filteredPosts = allPosts
        .filter(p => !selectedBoard || p.boardId === selectedBoard)
        .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.authorName?.toLowerCase().includes(search.toLowerCase()));

    const totalCount = allPosts.length;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold">전체 게시물</h2>
                <p className="text-sm text-neutral-500 mt-1">{site?.name}의 모든 콘텐츠를 관리합니다</p>
            </div>

            <div className="flex gap-6">
                {/* 좌측: 게시판 필터 */}
                <div className="w-[180px] shrink-0">
                    <div className="space-y-0.5">
                        <button
                            onClick={() => setSelectedBoard(null)}
                            className={clsx(
                                "w-full text-left px-3 py-2 text-sm rounded transition-colors",
                                !selectedBoard ? "bg-neutral-900 text-white font-medium" : "text-neutral-600 hover:bg-neutral-100"
                            )}
                        >
                            전체 게시물 <span className="text-xs opacity-60">{totalCount}</span>
                        </button>
                        {boards.map(b => {
                            const count = getPostsByBoard(b.id).length;
                            return (
                                <button
                                    key={b.id}
                                    onClick={() => setSelectedBoard(b.id)}
                                    className={clsx(
                                        "w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between",
                                        selectedBoard === b.id ? "bg-neutral-900 text-white font-medium" : "text-neutral-600 hover:bg-neutral-100"
                                    )}
                                >
                                    <span className="truncate">{b.name}</span>
                                    <span className={clsx("text-xs", selectedBoard === b.id ? "text-white/60" : "text-neutral-400")}>{count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 우측: 게시물 테이블 */}
                <div className="flex-1 min-w-0">
                    {/* 검색 */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="제목, 작성자로 검색"
                            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 focus:border-neutral-900 focus:outline-none bg-white"
                        />
                    </div>

                    <div className="text-xs text-neutral-400 mb-2">{filteredPosts.length}건</div>

                    {/* 테이블 */}
                    <div className="border border-neutral-200 bg-white">
                        {/* Header */}
                        <div className="flex items-center gap-4 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200 text-xs text-neutral-500 font-medium">
                            <span className="w-[80px]">위치</span>
                            <span className="flex-1">제목</span>
                            <span className="w-[70px]">작성자</span>
                            <span className="w-[70px] text-right">조회</span>
                            <span className="w-[60px]">상태</span>
                            <span className="w-[80px] text-right">작성일</span>
                        </div>

                        {filteredPosts.length > 0 ? (
                            filteredPosts.map(post => (
                                <Link
                                    key={post.id}
                                    href={`/intra/bums/sites/${siteId}/boards/${post.boardId}/new?postId=${post.id}`}
                                    className="flex items-center gap-4 px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors text-sm"
                                >
                                    <span className="w-[80px] text-xs text-neutral-400 truncate">{post.boardName}</span>
                                    <span className="flex-1 min-w-0 flex items-center gap-1.5">
                                        {post.isPinned && <Pin className="h-3 w-3 text-amber-500 shrink-0" />}
                                        {post.isSecret && <Lock className="h-3 w-3 text-neutral-400 shrink-0" />}
                                        <span className="truncate font-medium">{post.title}</span>
                                        {(post.commentCount ?? 0) > 0 && (
                                            <span className="text-xs text-blue-500 flex items-center gap-0.5 shrink-0">
                                                <MessageSquare className="h-3 w-3" />{post.commentCount}
                                            </span>
                                        )}
                                    </span>
                                    <span className="w-[70px] text-xs text-neutral-500 truncate">{post.authorName}</span>
                                    <span className="w-[70px] text-right text-xs text-neutral-400 flex items-center justify-end gap-1">
                                        <Eye className="h-3 w-3" />{post.viewCount ?? 0}
                                    </span>
                                    <span className={clsx("w-[60px] text-[11px] text-center px-1.5 py-0.5 rounded", statusBadge[post.status])}>
                                        {statusLabel[post.status]}
                                    </span>
                                    <span className="w-[80px] text-right text-xs text-neutral-400">
                                        {(post.publishedAt || post.createdAt || '').slice(5, 10)}
                                    </span>
                                </Link>
                            ))
                        ) : (
                            <div className="py-12 text-center text-sm text-neutral-400">게시물이 없습니다</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
