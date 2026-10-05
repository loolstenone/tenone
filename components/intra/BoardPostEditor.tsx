"use client";

/**
 * 인트라 게시글 작성·수정 (공통)
 * ?id={postId} 이면 수정, 아니면 새 글. fixedSite/fixedBoard 지정 시 해당 게시판 고정 (브랜드 메뉴용)
 * 저장은 /api/board/posts (직원 세션 — 관리자 작성 게시판 포함 전 게시판)
 */
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PostEditor from "@/components/board/PostEditor";
import { PageHeader } from "@/components/intra/IntraUI";
import { siteConfigs } from "@/lib/site-config";
import { writerLabel, type IntraBoardConfig } from "@/lib/intra-board";
import type { BoardConfig, CreatePostInput, Post, UpdatePostInput } from "@/types/board";

interface Props {
    listPath: string;
    fixedSite?: string;
    fixedBoard?: string;
}

export function BoardPostEditor(props: Props) {
    return (
        <Suspense fallback={<Spinner />}>
            <ContentEditor {...props} />
        </Suspense>
    );
}

function Spinner() {
    return <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>;
}

function ContentEditor({ listPath: LIST_PATH, fixedSite, fixedBoard }: Props) {
    const router = useRouter();
    const params = useSearchParams();
    const postId = params.get("id");

    const [configs, setConfigs] = useState<IntraBoardConfig[]>([]);
    const [post, setPost] = useState<Post | null>(null);
    const [site, setSite] = useState(fixedSite ?? params.get("site") ?? "");
    const [board, setBoard] = useState(fixedBoard ?? params.get("board") ?? "");
    const locked = !!postId || !!fixedBoard;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const cfgRes = await fetch("/api/board/configs");
                if (!cfgRes.ok) throw new Error("게시판 목록을 불러오지 못했습니다.");
                setConfigs((await cfgRes.json()).configs ?? []);
                if (postId) {
                    const res = await fetch(`/api/board/posts/${postId}`);
                    if (!res.ok) throw new Error("글을 찾을 수 없습니다.");
                    const p = await res.json() as Post;
                    setPost(p);
                    setSite(p.site);
                    setBoard(p.board);
                }
            } catch (e) {
                setError(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
            }
            setLoading(false);
        })();
    }, [postId]);

    const sites = useMemo(() => Array.from(new Set(configs.map(c => c.site))).sort(), [configs]);
    const siteBoards = configs.filter(c => c.site === site);
    const config = configs.find(c => c.site === site && c.slug === board);
    const siteName = (code: string) => siteConfigs[code as keyof typeof siteConfigs]?.name || code;

    const handleSubmit = async (data: CreatePostInput | UpdatePostInput) => {
        const res = postId
            ? await fetch(`/api/board/posts/${postId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
            })
            : await fetch("/api/board/posts", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
            });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || "저장에 실패했습니다.");
        }
        router.push(LIST_PATH);
    };

    if (loading) return <Spinner />;

    return (
        <div className="space-y-6">
            <PageHeader title={postId ? "글 수정" : "새 글 작성"} description="사이트 게시판 콘텐츠 작성 (직원 권한)">
                <button onClick={() => router.push(LIST_PATH)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-neutral-500 hover:text-neutral-900">
                    <ArrowLeft className="h-4 w-4" /> 목록
                </button>
            </PageHeader>

            {error && <div className="rounded-lg bg-red-50 text-red-600 text-sm px-4 py-3">{error}</div>}

            <div className="flex items-center gap-3 flex-wrap">
                <select value={site} disabled={locked}
                    onChange={e => { setSite(e.target.value); setBoard(""); }}
                    className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm bg-white disabled:bg-neutral-50">
                    <option value="">사이트 선택</option>
                    {sites.map(s => <option key={s} value={s}>{siteName(s)}</option>)}
                </select>
                <select value={board} disabled={locked || !site}
                    onChange={e => setBoard(e.target.value)}
                    className="rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm bg-white disabled:bg-neutral-50">
                    <option value="">게시판 선택</option>
                    {siteBoards.map(c => <option key={c.id} value={c.slug}>{c.name} ({writerLabel(c)})</option>)}
                </select>
                {config && (
                    <span className="text-xs text-neutral-400">
                        {writerLabel(config)} · {config.visibility === "public" ? "공개" : "직원 전용"}
                    </span>
                )}
            </div>

            {config ? (
                <div className="bg-white border border-neutral-100 rounded-xl p-6">
                    <PostEditor
                        key={`${site}/${board}/${postId ?? "new"}`}
                        config={config as unknown as BoardConfig}
                        post={post}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push(LIST_PATH)}
                    />
                </div>
            ) : (
                !error && <div className="px-6 py-16 text-center text-neutral-400 text-sm">사이트와 게시판을 선택하세요.</div>
            )}
        </div>
    );
}
