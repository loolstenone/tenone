"use client";

import { useState, useEffect } from "react";
import { Search, Trash2, EyeOff, MessageSquare, Loader2, RefreshCw, ChevronDown } from "lucide-react";
import { PageHeader, Card } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Post {
  id: string;
  board: string;
  title: string;
  content: string;
  tags: string[] | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_hidden: boolean | null;
  created_at: string;
  member_id: string | null;
  display_name?: string;
}

const BOARD_LABEL: Record<string, { label: string; color: string }> = {
  chat:     { label: "수다", color: "bg-blue-50 text-blue-600" },
  review:   { label: "모임 후기", color: "bg-emerald-50 text-emerald-700" },
  proposal: { label: "모임 제안", color: "bg-violet-50 text-violet-700" },
};

export default function BadakPostsPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState("");
  const [boardFilter, setBoardFilter] = useState("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => { loadPosts(); }, [boardFilter, page]);

  async function loadPosts() {
    setLoading(true);
    try {
      const supabase = createClient();
      let q = supabase.from("badak_community_posts")
        .select("id, board, title, content, tags, likes_count, comments_count, views_count, is_hidden, created_at, member_id")
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (boardFilter !== "all") q = q.eq("board", boardFilter);
      const { data } = await q;
      setPosts((data ?? []) as Post[]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleHide(postId: string, hide: boolean) {
    setProcessingId(postId);
    try {
      const res = await fetch("/api/badak/community", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: postId, is_hidden: hide }),
      });
      if (res.ok) setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_hidden: hide } : p));
    } finally { setProcessingId(null); }
  }

  async function handleDelete(postId: string) {
    if (!confirm("게시글을 삭제하시겠습니까? 복구 불가능합니다.")) return;
    setProcessingId(postId);
    try {
      const res = await fetch(`/api/badak/community?id=${postId}`, { method: "DELETE" });
      if (res.ok) setPosts(prev => prev.filter(p => p.id !== postId));
    } finally { setProcessingId(null); }
  }

  const filtered = posts.filter(p => {
    const q = search.toLowerCase();
    return !q || p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader title="커뮤니티 관리" description="게시글 검토 · 숨김 · 삭제">
        <button onClick={() => loadPosts()} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600">
          <RefreshCw className="h-3.5 w-3.5" /> 새로고침
        </button>
      </PageHeader>

      <Card>
        {/* 필터 바 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="제목 또는 내용 검색"
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400" />
          </div>
          <select value={boardFilter} onChange={e => { setBoardFilter(e.target.value); setPage(0); }}
            className="text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none">
            <option value="all">전체 게시판</option>
            <option value="chat">수다</option>
            <option value="review">모임 후기</option>
            <option value="proposal">모임 제안</option>
          </select>
          <span className="text-xs text-neutral-400 ml-auto">{filtered.length}개</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-neutral-400 text-center py-12">게시글이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {filtered.map(post => {
              const bs = BOARD_LABEL[post.board] ?? { label: post.board, color: "bg-neutral-100 text-neutral-500" };
              const isExpanded = expandedId === post.id;
              return (
                <div key={post.id} className={`border rounded-lg overflow-hidden transition-colors ${post.is_hidden ? "border-neutral-100 bg-neutral-50 opacity-60" : "border-neutral-200 bg-white"}`}>
                  <div className="flex items-start gap-3 p-3">
                    <button onClick={() => setExpandedId(isExpanded ? null : post.id)}
                      className="mt-0.5 text-neutral-400 hover:text-neutral-600 shrink-0">
                      <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${bs.color}`}>{bs.label}</span>
                        <span className="text-sm font-medium text-neutral-800 truncate">{post.title}</span>
                        {post.is_hidden && <span className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">숨김</span>}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                        <span>👍 {post.likes_count ?? 0}</span>
                        <span><MessageSquare className="h-2.5 w-2.5 inline" /> {post.comments_count ?? 0}</span>
                        <span>조회 {post.views_count ?? 0}</span>
                        <span>{new Date(post.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        disabled={processingId === post.id}
                        onClick={() => handleHide(post.id, !post.is_hidden)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50 text-neutral-500">
                        <EyeOff className="h-3 w-3" />
                        {post.is_hidden ? "표시" : "숨김"}
                      </button>
                      <button
                        disabled={processingId === post.id}
                        onClick={() => handleDelete(post.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium border border-red-100 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50">
                        <Trash2 className="h-3 w-3" /> 삭제
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-10 pb-3 border-t border-neutral-100 pt-2">
                      <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line line-clamp-6">{post.content}</p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {post.tags.map(t => <span key={t} className="text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">#{t}</span>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-100">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="text-xs px-3 py-1.5 border border-neutral-200 rounded-lg disabled:opacity-30 hover:bg-neutral-50">
            ← 이전
          </button>
          <span className="text-xs text-neutral-400">{page + 1}페이지</span>
          <button disabled={posts.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}
            className="text-xs px-3 py-1.5 border border-neutral-200 rounded-lg disabled:opacity-30 hover:bg-neutral-50">
            다음 →
          </button>
        </div>
      </Card>
    </div>
  );
}
