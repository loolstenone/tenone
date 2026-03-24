"use client";

import { useState, useEffect, useCallback } from "react";
import { PenSquare } from "lucide-react";
import BoardList from "./BoardList";
import PostDetail from "./PostDetail";
import type { Post, BoardConfig, SiteCode } from "@/types/board";

interface BoardPageProps {
    site: SiteCode;
    board: string;
    title?: string;
    description?: string;
    accentColor?: string;
    showWriteButton?: boolean;
    onWrite?: () => void;
}

export default function BoardPage({
    site,
    board,
    title,
    description,
    accentColor = "#171717",
    showWriteButton = true,
    onWrite,
}: BoardPageProps) {
    const [boardConfig, setBoardConfig] = useState<BoardConfig | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // 게시판 설정 로드
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/board/configs?site=${site}&board=${board}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.configs && data.configs.length > 0) {
                        setBoardConfig(data.configs[0]);
                    }
                }
            } catch { /* ignore */ }
        })();
    }, [site, board]);

    // 게시글 상세 로드
    const loadPost = useCallback(async (postId: string) => {
        setDetailLoading(true);
        try {
            const res = await fetch(`/api/board/posts/${postId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedPost(data.post);
            }
        } catch (err) {
            console.error("게시글 로딩 실패:", err);
        } finally {
            setDetailLoading(false);
        }
    }, []);

    const handlePostClick = (post: Post) => {
        loadPost(post.id);
    };

    const handleBack = () => {
        setSelectedPost(null);
    };

    const handleNavigate = (postId: string) => {
        loadPost(postId);
    };

    const displayTitle = title || boardConfig?.name || "게시판";
    const displayDesc = description || boardConfig?.description || "";

    // 상세 보기
    if (selectedPost) {
        return (
            <div className="py-8 px-4 md:px-6">
                <div className="mx-auto max-w-7xl">
                    {detailLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <PostDetail
                            post={selectedPost}
                            accentColor={accentColor}
                            onBack={handleBack}
                            onNavigate={handleNavigate}
                        />
                    )}
                </div>
            </div>
        );
    }

    // 목록 보기
    return (
        <div className="py-8 px-4 md:px-6">
            <div className="mx-auto max-w-7xl">
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                            {displayTitle}
                        </h1>
                        {displayDesc && (
                            <p className="mt-1 text-sm text-neutral-500">{displayDesc}</p>
                        )}
                    </div>
                    {showWriteButton && (
                        <button
                            onClick={onWrite}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: accentColor }}
                        >
                            <PenSquare className="h-4 w-4" />
                            글쓰기
                        </button>
                    )}
                </div>

                {/* 게시글 목록 */}
                <BoardList
                    site={site}
                    board={board}
                    boardConfig={boardConfig || undefined}
                    accentColor={accentColor}
                    onPostClick={handlePostClick}
                />
            </div>
        </div>
    );
}
