"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Search, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { brandSiteUrl } from "@/lib/domain-registry";
import { adminTitle } from "@/lib/brand-site-menus";

// RooK 글 = 통합 게시판 ums_posts (site = rook). 게시판: works·artist(직원 작성) · freeboard(회원)
interface Post {
    id: string; slug: string | null; title: string; author_name: string | null; status: string;
    category_id: string | null; view_count: number | null; comment_count: number | null;
    published_at: string | null; created_at: string;
    ums_boards: { slug: string; name: string } | null;
}

/** 사이트 글 주소 — works·artist는 slug(없으면 id), freeboard는 id (app/(RooK)/rook/{board}/[slug|id]) */
function postPath(p: Post): string | null {
    const board = p.ums_boards?.slug;
    if (board === "freeboard") return `/rook/freeboard/${p.id}`;
    if (board === "works" || board === "artist") return `/rook/${board}/${p.slug ?? p.id}`;
    return null;
}

const BOARD_TITLES: Record<string, { title: string; desc: string }> = {
    works: { title: adminTitle("/intra/ums/rook/works", "Works"), desc: "사이트 /rook/works — 직원 작성 (사이트 목록·상세의 직원 글쓰기·수정 버튼)" },
    artist: { title: adminTitle("/intra/ums/rook/artist", "Artist"), desc: "사이트 /rook/artist — 직원 작성 (사이트 목록·상세의 직원 글쓰기·수정 버튼)" },
    freeboard: { title: adminTitle("/intra/ums/rook/freeboard", "Free board"), desc: "사이트 /rook/freeboard — 회원 작성" },
};

/** fixedBoard 지정 시 해당 게시판만 (인트라 메뉴 = 사이트 메뉴 1:1, lib/brand-site-menus.ts) */
export function RookPostsAdmin({ fixedBoard }: { fixedBoard?: string }) {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [search, setSearch] = useState("");
    const [board, setBoard] = useState(fixedBoard ?? "all");

    useEffect(() => {
        const sb = createClient();
        (async () => {
            const { data: site } = await sb.from("ums_sites").select("id").eq("slug", "rook").single();
            if (!site) { setLoading(false); return; }
            const { data } = await sb.from("ums_posts")
                .select("id, slug, title, author_name, status, category_id, view_count, comment_count, published_at, created_at, ums_boards(slug, name)")
                .eq("site_id", site.id)
                .order("created_at", { ascending: false })
                .limit(300);
            setPosts((data ?? []) as unknown as Post[]);
            setLoading(false);
        })();
    }, []);

    const boardNames = Array.from(new Map(posts.filter(p => p.ums_boards).map(p => [p.ums_boards!.slug, p.ums_boards!.name])).entries());
    const filtered = posts
        .filter(p => board === "all" || p.ums_boards?.slug === board)
        .filter(p => !search || p.title?.includes(search) || p.author_name?.includes(search));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">{fixedBoard ? BOARD_TITLES[fixedBoard]?.title ?? fixedBoard : "전체 게시글"}</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">{fixedBoard ? BOARD_TITLES[fixedBoard]?.desc : "RooK Works · Artist · Free board"} · 삭제는 인트라 &gt; 사이트 관리 &gt; 게시판</p>
                </div>
                <div className="flex items-center gap-2">
                    {!fixedBoard && <select value={board} onChange={e => setBoard(e.target.value)}
                        className="py-2 px-3 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400">
                        <option value="all">전체 게시판</option>
                        {boardNames.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
                    </select>}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="제목, 작성자..."
                            className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-52 focus:outline-none focus:border-neutral-400" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">전체 게시글</p>
                    <p className="text-2xl font-bold">{posts.length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">표시 중</p>
                    <p className="text-2xl font-bold">{filtered.length}</p>
                </div>
            </div>

            {loading ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : filtered.length === 0 ? (
                <div className="border border-neutral-200 rounded-lg p-12 text-center">
                    <MessageCircle className="h-10 w-10 text-neutral-200 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400">{search ? "검색 결과 없음" : "게시글이 없습니다"}</p>
                </div>
            ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-neutral-50 text-left">{["게시판", "카테고리", "제목", "작성자", "상태", "조회", "댓글", "발행일"].map(h => <th key={h} className="px-4 py-3 font-semibold text-neutral-500">{h}</th>)}</tr></thead>
                        <tbody>
                            {filtered.map(p => {
                                const path = postPath(p);
                                return (
                                    <tr key={p.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                        <td className="px-4 py-3 text-xs text-neutral-500">{p.ums_boards?.name ?? "-"}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{p.category_id ?? "-"}</td>
                                        <td className="px-4 py-3 font-medium max-w-xs truncate">
                                            {path ? (
                                                <a href={brandSiteUrl("rook", path)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                                                    {p.title || "(제목 없음)"} <ExternalLink className="h-3 w-3 text-neutral-300" />
                                                </a>
                                            ) : (p.title || "(제목 없음)")}
                                        </td>
                                        <td className="px-4 py-3 text-neutral-500">{p.author_name || "-"}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-500">{p.status}</td>
                                        <td className="px-4 py-3 text-neutral-500">{p.view_count ?? 0}</td>
                                        <td className="px-4 py-3 text-neutral-500">{p.comment_count ?? 0}</td>
                                        <td className="px-4 py-3 text-xs text-neutral-400">{new Date(p.published_at ?? p.created_at).toLocaleDateString("ko-KR")}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">총 {filtered.length}건</div>
                </div>
            )}
        </div>
    );
}
