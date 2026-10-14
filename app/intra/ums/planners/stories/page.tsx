"use client";

import { useEffect, useState } from "react";
import { ExternalLink, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { brandSiteUrl } from "@/lib/domain-registry";
import { adminTitle } from "@/lib/brand-site-menus";

// 사이트 /planners/stories 와 1:1 — 통합 게시판 ums_posts (site planners · board stories). 삭제는 인트라 > 사이트 > 게시판
interface Post { id: string; title: string; author_name: string | null; status: string; category_id: string | null; view_count: number | null; comment_count: number | null; published_at: string | null; created_at: string }

export default function PlannersStoriesAdmin() {
    const [posts, setPosts] = useState<Post[] | null>(null);

    useEffect(() => {
        const sb = createClient();
        (async () => {
            const { data: site } = await sb.from("ums_sites").select("id").eq("slug", "planners").single();
            const { data: board } = site ? await sb.from("ums_boards").select("id").eq("site_id", site.id).eq("slug", "stories").single() : { data: null };
            if (!board) { setPosts([]); return; }
            const { data } = await sb.from("ums_posts")
                .select("id, title, author_name, status, category_id, view_count, comment_count, published_at, created_at")
                .eq("board_id", board.id).order("created_at", { ascending: false }).limit(300);
            setPosts((data ?? []) as Post[]);
        })();
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-lg font-bold">{adminTitle("/intra/ums/planners/stories", "이야기")}</h1>
                <p className="mt-0.5 text-sm text-neutral-400">사이트 /planners/stories — 회원 작성 · 삭제는 인트라 &gt; 사이트 관리 &gt; 게시판</p>
            </div>
            {!posts ? (
                <div className="border border-neutral-200 p-12 text-center text-sm text-neutral-400">불러오는 중...</div>
            ) : posts.length === 0 ? (
                <div className="border border-neutral-200 p-12 text-center">
                    <MessageCircle className="mx-auto mb-3 h-10 w-10 text-neutral-200" />
                    <p className="text-sm text-neutral-400">게시글이 없습니다</p>
                </div>
            ) : (
                <table className="w-full border border-neutral-200 text-sm">
                    <thead><tr className="bg-neutral-50 text-left">{["분류", "제목", "작성자", "상태", "조회", "댓글", "작성일"].map(h => <th key={h} className="px-4 py-3 font-semibold text-neutral-500">{h}</th>)}</tr></thead>
                    <tbody>
                        {posts.map(p => (
                            <tr key={p.id} className="border-t border-neutral-100">
                                <td className="px-4 py-3 text-xs text-neutral-500">{p.category_id ?? "-"}</td>
                                <td className="max-w-xs truncate px-4 py-3 font-medium">
                                    <a href={brandSiteUrl("planners", `/planners/stories/${p.id}`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">
                                        {p.title || "(제목 없음)"} <ExternalLink className="h-3 w-3 text-neutral-300" />
                                    </a>
                                </td>
                                <td className="px-4 py-3 text-neutral-500">{p.author_name || "-"}</td>
                                <td className="px-4 py-3 text-xs text-neutral-500">{p.status}</td>
                                <td className="px-4 py-3 text-neutral-500">{p.view_count ?? 0}</td>
                                <td className="px-4 py-3 text-neutral-500">{p.comment_count ?? 0}</td>
                                <td className="px-4 py-3 text-xs text-neutral-400">{new Date(p.published_at ?? p.created_at).toLocaleDateString("ko-KR")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
