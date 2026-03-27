"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PenSquare } from "lucide-react";
import BoardList from "./BoardList";
import PostDetail from "./PostDetail";
import PostEditor from "./PostEditor";
import type { Post, BoardConfig, SiteCode, CreatePostInput, UpdatePostInput } from "@/types/board";

interface BoardPageProps {
    site: SiteCode;
    board: string;
    title?: string;
    description?: string;
    accentColor?: string;
    showWriteButton?: boolean;
    isGuest?: boolean;
}

type Mode = "list" | "detail" | "write" | "edit";

export default function BoardPage(props: BoardPageProps) {
    return (
        <Suspense fallback={<div className="min-h-[50vh]" />}>
            <BoardPageInner {...props} />
        </Suspense>
    );
}

function BoardPageInner({
    site,
    board,
    title,
    description,
    accentColor = "#171717",
    showWriteButton = true,
    isGuest = false,
}: BoardPageProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [boardConfig, setBoardConfig] = useState<BoardConfig | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [mode, setMode] = useState<Mode>("list");
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // URL에서 postId 읽어서 자동 로드
    useEffect(() => {
        const postId = searchParams.get('postId');
        if (postId && mode === 'list') {
            loadPost(postId);
        }
    }, [searchParams]);

    // 게시판 설정 로드 (캐시 활용)
    useEffect(() => {
        const cacheKey = `board_config_${site}_${board}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            try { setBoardConfig(JSON.parse(cached)); } catch {}
        }
        fetch(`/api/board/configs?site=${site}&board=${board}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.configs?.length > 0) {
                    setBoardConfig(data.configs[0]);
                    sessionStorage.setItem(cacheKey, JSON.stringify(data.configs[0]));
                }
            })
            .catch(() => {});
    }, [site, board]);

    // 게시글 상세 로드
    const loadPost = useCallback(async (postId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/board/posts/${postId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedPost(data.post || data);
                setMode("detail");
                // URL 업데이트 (고유 URL)
                window.history.pushState(null, '', `${pathname}?postId=${postId}`);
            }
        } catch (err) {
            console.error("게시글 로딩 실패:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 좋아요
    const handleLike = useCallback(async () => {
        if (!selectedPost) return;
        try {
            const res = await fetch("/api/board/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType: "post", targetId: selectedPost.id }),
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedPost(prev => prev ? {
                    ...prev,
                    isLiked: data.liked,
                    likeCount: data.liked ? prev.likeCount + 1 : prev.likeCount - 1,
                } : null);
            }
        } catch { /* ignore */ }
    }, [selectedPost]);

    // 북마크
    const handleBookmark = useCallback(async () => {
        if (!selectedPost) return;
        try {
            const res = await fetch("/api/board/bookmark", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: selectedPost.id }),
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedPost(prev => prev ? {
                    ...prev,
                    isBookmarked: data.bookmarked,
                    bookmarkCount: data.bookmarked ? prev.bookmarkCount + 1 : prev.bookmarkCount - 1,
                } : null);
            }
        } catch { /* ignore */ }
    }, [selectedPost]);

    // 글 작성
    const handleCreate = useCallback(async (data: CreatePostInput | UpdatePostInput) => {
        const res = await fetch("/api/board/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("저장 실패");
        setMode("list");
        setRefreshKey(k => k + 1);
    }, []);

    // 글 수정
    const handleUpdate = useCallback(async (data: CreatePostInput | UpdatePostInput) => {
        if (!selectedPost) return;
        const res = await fetch(`/api/board/posts/${selectedPost.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("수정 실패");
        setMode("list");
        setSelectedPost(null);
        setRefreshKey(k => k + 1);
    }, [selectedPost]);

    const displayTitle = title || boardConfig?.name || "게시판";
    const displayDesc = description || boardConfig?.description || "";

    const defaultConfig: BoardConfig = boardConfig || {
        id: "", site, slug: board, name: displayTitle, description: displayDesc,
        categories: [], settings: { defaultView: "card", postsPerPage: 12, pagination: "page", allowGuestPost: false, allowGuestComment: true, requireApproval: false, useRepresentImage: true },
        sortOrder: 0, createdAt: "", updatedAt: "",
    };

    // 글쓰기 모드
    if (mode === "write") {
        return (
            <div className="py-8 px-4 md:px-6">
                <div className="mx-auto max-w-7xl">
                    <PostEditor
                        config={defaultConfig}
                        onSubmit={handleCreate}
                        onCancel={() => setMode("list")}
                        isGuest={isGuest}
                    />
                </div>
            </div>
        );
    }

    // 수정 모드
    if (mode === "edit" && selectedPost) {
        return (
            <div className="py-8 px-4 md:px-6">
                <div className="mx-auto max-w-7xl">
                    <PostEditor
                        config={defaultConfig}
                        post={selectedPost}
                        onSubmit={handleUpdate}
                        onCancel={() => { setMode("detail"); }}
                    />
                </div>
            </div>
        );
    }

    // 상세 보기
    if (mode === "detail" && selectedPost) {
        return (
            <div className="py-8 px-4 md:px-6">
                <div className="mx-auto max-w-7xl">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <PostDetail
                            post={selectedPost}
                            accentColor={accentColor}
                            onBack={() => { setMode("list"); setSelectedPost(null); window.history.pushState(null, '', pathname); }}
                            onNavigate={loadPost}
                            onLike={handleLike}
                            onBookmark={handleBookmark}
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
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{displayTitle}</h1>
                        {displayDesc && <p className="mt-1 text-sm text-neutral-400">{displayDesc}</p>}
                    </div>
                    {showWriteButton && (
                        <button
                            onClick={() => setMode("write")}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: accentColor }}
                        >
                            <PenSquare className="h-4 w-4" />
                            글쓰기
                        </button>
                    )}
                </div>
                <BoardList
                    key={refreshKey}
                    site={site}
                    board={board}
                    boardConfig={boardConfig || undefined}
                    accentColor={accentColor}
                    onPostClick={(post) => loadPost(post.id)}
                />
            </div>
        </div>
    );
}
