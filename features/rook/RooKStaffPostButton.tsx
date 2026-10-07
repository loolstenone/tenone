"use client";

/**
 * RooK Works·Artist 직원 전용 글쓰기·수정 — 통합 게시판 에디터(PostEditor) 재사용
 * - 버튼 노출은 화면용 (useAuth().isStaff). 실제 권한은 /api/board/posts 서버 검사(write_permission=admin → 직원만)
 * - 목록·상세는 ISR(10분) — 저장 직후 router.refresh()로 다시 그리지만, 다른 방문자에게는 최대 10분 뒤 반영
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PenLine, Pencil, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { PostEditor } from "@/components/board";
import type { BoardConfig, CreatePostInput, Post, UpdatePostInput } from "@/types/board";
import type { RookBoard } from "@/lib/supabase/rook";

interface Props {
    board: RookBoard;
    /** 있으면 수정, 없으면 새 글 */
    postId?: string;
}

export function RooKStaffPostButton({ board, postId }: Props) {
    const { isStaff } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [config, setConfig] = useState<BoardConfig | null>(null);
    const [post, setPost] = useState<Post | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isStaff) return null;

    const start = async () => {
        setError(null);
        try {
            const [cfgRes, postRes] = await Promise.all([
                fetch(`/api/board/configs?site=rook&board=${board}`),
                postId ? fetch(`/api/board/posts/${postId}`) : Promise.resolve(null),
            ]);
            const cfg = cfgRes.ok ? (await cfgRes.json())?.configs?.[0] : null;
            if (!cfg) throw new Error("게시판 설정을 불러오지 못했습니다.");
            if (postRes) {
                if (!postRes.ok) throw new Error("글을 불러오지 못했습니다.");
                const d = await postRes.json();
                setPost(d.post || d);
            }
            setConfig(cfg);
            setOpen(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "열기 실패");
        }
    };

    const submit = async (data: CreatePostInput | UpdatePostInput) => {
        const res = await fetch(postId ? `/api/board/posts/${postId}` : "/api/board/posts", {
            method: postId ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            throw new Error(res.status === 413 ? "글 용량이 너무 큽니다. 이미지 수나 크기를 줄여 주세요." : (await res.json().catch(() => ({}))).error || "저장 실패");
        }
        setOpen(false);
        router.refresh();
    };

    return (
        <>
            <button type="button" onClick={start}
                className="inline-flex items-center gap-1.5 border border-black px-3 py-1.5 text-[12px] font-bold hover:bg-black hover:text-white transition-colors">
                {postId ? <><Pencil size={13} /> 수정 (직원)</> : <><PenLine size={13} /> 글쓰기 (직원)</>}
            </button>
            {error && <span className="ml-2 text-[12px] text-red-600">{error}</span>}

            {open && config && (
                <div className="fixed inset-0 z-[9000] overflow-y-auto bg-white">
                    <div className="mx-auto max-w-5xl px-4 py-6">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-[14px] font-bold">{config.name} · {postId ? "글 수정" : "새 글"}</p>
                            <button type="button" onClick={() => setOpen(false)} aria-label="닫기" className="p-2 hover:bg-black/5">
                                <X size={18} />
                            </button>
                        </div>
                        <PostEditor config={config} post={post} onSubmit={submit} onCancel={() => setOpen(false)} />
                        <p className="mt-4 text-[12px] text-black/50">저장 후 다른 방문자 화면에는 최대 10분 뒤 반영됩니다.</p>
                    </div>
                </div>
            )}
        </>
    );
}
