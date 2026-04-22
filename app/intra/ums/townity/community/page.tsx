"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Post { id: string; title: string; author_name: string | null; created_at: string; likes_count: number | null; comments_count: number | null; }

export default function TownityCommPage() {
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        createClient().from("posts")
            .select("id, title, author_name, created_at, likes_count, comments_count")
            .eq("brand_id", "townity")
            .order("created_at", { ascending: false })
            .limit(100)
            .then(({ data }) => { setPosts((data ?? []) as Post[]); setLoading(false); });
    }, []);

    const filtered = posts.filter(p => !search || p.title?.includes(search) || p.author_name?.includes(search));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">커뮤니티 관리</h1>
                    <p className="text-sm text-neutral-400 mt-0.5">Townity 게시글 · 커뮤니티 현황</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="제목, 작성자..."
                        className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg w-52 focus:outline-none focus:border-neutral-400" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">전체 게시글</p>
                    <p className="text-2xl font-bold">{posts.length}</p>
                </div>
                <div className="border border-neutral-200 rounded-lg p-4">
                    <p className="text-xs text-neutral-400 mb-1">검색 결과</p>
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
                        <thead><tr className="bg-neutral-50 text-left">{["제목","작성자","좋아요","댓글","작성일"].map(h => <th key={h} className="px-4 py-3 font-semibold text-neutral-500">{h}</th>)}</tr></thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium max-w-xs truncate">{p.title || "(제목 없음)"}</td>
                                    <td className="px-4 py-3 text-neutral-500">{p.author_name || "-"}</td>
                                    <td className="px-4 py-3 text-neutral-500">{p.likes_count ?? 0}</td>
                                    <td className="px-4 py-3 text-neutral-500">{p.comments_count ?? 0}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-400">{new Date(p.created_at).toLocaleDateString("ko-KR")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 text-xs text-neutral-400">총 {filtered.length}건</div>
                </div>
            )}
        </div>
    );
}
