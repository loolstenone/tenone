"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    Sparkles, MessageCircle, Heart, ChevronLeft, Plus, Loader2,
    BookOpenCheck, Lightbulb, Coffee, ThumbsUp, LogIn,
} from "lucide-react";
const myverseLoginHref = (redirect: string) =>
    `/myverse/login${redirect && redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;
import { ConfirmSheet } from "./ConfirmSheet";

type Category = "review" | "case" | "suggestion" | "life";

const CATEGORIES: Array<{
    key: Category;
    label: string;
    desc: string;
    icon: typeof ThumbsUp;
    color: string;
    bg: string;
}> = [
    { key: "review",     label: "후기",   desc: "써보니 어땠는지",       icon: ThumbsUp,       color: "text-emerald-600", bg: "bg-emerald-50" },
    { key: "case",       label: "사례",   desc: "이렇게 활용했어요",     icon: BookOpenCheck,  color: "text-sky-600",     bg: "bg-sky-50" },
    { key: "suggestion", label: "제안",   desc: "이런 게 있으면 좋겠어요", icon: Lightbulb,    color: "text-amber-600",   bg: "bg-amber-50" },
    { key: "life",       label: "일상",   desc: "오늘의 한 컷",          icon: Coffee,         color: "text-rose-500",    bg: "bg-rose-50" },
];

interface Post {
    id: string;
    member_id: string;
    category: Category;
    title: string;
    content: string;
    image_urls: string[] | null;
    like_count: number;
    comment_count: number;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
    author_name: string;
    author_avatar: string | null;
    is_mine: boolean;
    i_liked: boolean;
}

interface Comment {
    id: string;
    member_id: string;
    content: string;
    created_at: string;
    author_name: string;
    author_avatar: string | null;
    is_mine: boolean;
}

export function CommunityView() {
    const pathname = usePathname() || "/myverse/community";
    const [posts, setPosts] = useState<Post[]>([]);
    const [filter, setFilter] = useState<Category | "all">("all");
    const [loading, setLoading] = useState(true);
    const [composerOpen, setComposerOpen] = useState(false);
    const [openPostId, setOpenPostId] = useState<string | null>(null);
    const [authenticated, setAuthenticated] = useState(false);

    async function load(cat: Category | "all" = filter) {
        setLoading(true);
        const url = cat === "all" ? "/api/myverse/community" : `/api/myverse/community?category=${cat}`;
        const res = await fetch(url);
        if (res.ok) {
            const d = await res.json();
            setPosts(d.posts || []);
            setAuthenticated(!!d.authenticated);
        }
        setLoading(false);
    }

    useEffect(() => { load(filter); }, [filter]);

    const filteredCount = useMemo(() => {
        const counts: Record<Category | "all", number> = { all: 0, review: 0, case: 0, suggestion: 0, life: 0 };
        counts.all = posts.length;
        posts.forEach((p) => { counts[p.category] = (counts[p.category] || 0) + 1; });
        return counts;
    }, [posts]);

    async function toggleLike(post: Post) {
        if (!authenticated) {
            window.location.href = myverseLoginHref(pathname);
            return;
        }
        const liked = post.i_liked;
        // optimistic
        setPosts((prev) => prev.map((p) =>
            p.id === post.id
                ? { ...p, i_liked: !liked, like_count: p.like_count + (liked ? -1 : 1) }
                : p
        ));
        await fetch(`/api/myverse/community/${post.id}/likes`, {
            method: liked ? "DELETE" : "POST",
        });
    }

    function startWrite() {
        if (!authenticated) {
            window.location.href = myverseLoginHref(pathname);
            return;
        }
        setComposerOpen(true);
    }

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            <header className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <Sparkles className="h-5 w-5 text-[#6366F1]" />
                    <h1 className="font-serif text-2xl md:text-3xl text-neutral-900">커뮤니티</h1>
                </div>
                {authenticated ? (
                    <button
                        onClick={startWrite}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg text-sm font-medium hover:bg-[#4F46E5] transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" /> 글쓰기
                    </button>
                ) : (
                    <Link
                        href={myverseLoginHref(pathname)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#6366F1] text-[#6366F1] rounded-lg text-sm font-medium hover:bg-[#6366F1]/5 transition-colors"
                    >
                        <LogIn className="h-3.5 w-3.5" /> 로그인하고 쓰기
                    </Link>
                )}
            </header>

            <p className="text-sm text-neutral-500 leading-relaxed mb-5">
                Myverse를 쓰는 사람들의 후기·사례·제안·일상을 나눠 보세요.
            </p>

            {/* Category filter chips */}
            <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                <button
                    onClick={() => setFilter("all")}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        filter === "all" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                >
                    전체 <span className="ml-1 opacity-70">{filteredCount.all}</span>
                </button>
                {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    const active = filter === c.key;
                    return (
                        <button
                            key={c.key}
                            onClick={() => setFilter(c.key)}
                            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                        >
                            <Icon className={`h-3 w-3 ${active ? "text-white" : c.color}`} />
                            {c.label}
                            <span className="opacity-70">{filteredCount[c.key]}</span>
                        </button>
                    );
                })}
            </div>

            {/* Feed */}
            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : posts.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-sm text-neutral-400 mb-3">아직 글이 없습니다.</p>
                    {authenticated ? (
                        <button
                            onClick={startWrite}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-sm font-medium hover:bg-[#4F46E5]"
                        >
                            <Plus className="h-4 w-4" /> 첫 글 쓰기
                        </button>
                    ) : (
                        <Link
                            href={myverseLoginHref(pathname)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#6366F1] text-[#6366F1] rounded-lg text-sm font-medium hover:bg-[#6366F1]/5"
                        >
                            <LogIn className="h-4 w-4" /> 로그인하고 쓰기
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map((p) => {
                        const cat = CATEGORIES.find((c) => c.key === p.category)!;
                        const Icon = cat.icon;
                        return (
                            <article
                                key={p.id}
                                onClick={() => setOpenPostId(p.id)}
                                className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-neutral-300 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start gap-3">
                                    <Avatar name={p.author_name} url={p.author_avatar} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-neutral-900">{p.author_name}</span>
                                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${cat.bg} ${cat.color}`}>
                                                <Icon className="h-2.5 w-2.5" />
                                                {cat.label}
                                            </span>
                                            <span className="text-[10px] text-neutral-400">{formatDate(p.created_at)}</span>
                                            {p.is_pinned && (
                                                <span className="text-[10px] text-amber-600 font-medium">📌 고정</span>
                                            )}
                                        </div>
                                        <h2 className="text-base font-semibold text-neutral-900 mb-1 leading-tight">{p.title}</h2>
                                        <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 whitespace-pre-wrap">{p.content}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleLike(p); }}
                                                className={`inline-flex items-center gap-1 hover:text-rose-500 transition-colors ${p.i_liked ? "text-rose-500" : ""}`}
                                            >
                                                <Heart className={`h-3.5 w-3.5 ${p.i_liked ? "fill-current" : ""}`} />
                                                {p.like_count}
                                            </button>
                                            <span className="inline-flex items-center gap-1">
                                                <MessageCircle className="h-3.5 w-3.5" />
                                                {p.comment_count}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {composerOpen && (
                <Composer
                    onClose={() => setComposerOpen(false)}
                    onCreated={() => { setComposerOpen(false); load(filter); }}
                />
            )}

            {openPostId && (
                <PostDetail
                    postId={openPostId}
                    onClose={() => setOpenPostId(null)}
                    onChanged={() => load(filter)}
                />
            )}
        </div>
    );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
    if (url) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={url} alt={name} className="h-9 w-9 rounded-full object-cover shrink-0" />;
    }
    return (
        <div className="h-9 w-9 rounded-full bg-[#6366F1]/10 flex items-center justify-center text-xs font-bold text-[#6366F1] shrink-0">
            {name[0]}
        </div>
    );
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const now = Date.now();
    const diff = (now - d.getTime()) / 1000;
    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
    return d.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
}

function Composer({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [category, setCategory] = useState<Category>("review");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);

    async function submit() {
        if (!title.trim() || !content.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/myverse/community", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category, title, content }),
            });
            if (!res.ok) {
                const e = await res.json().catch(() => ({}));
                alert(`등록 실패: ${e.error || res.status}`);
                setSaving(false);
                return;
            }
            onCreated();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start md:items-center justify-center p-0 md:p-6">
            <div className="bg-white rounded-b-2xl md:rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200">
                    <h2 className="text-sm font-semibold text-neutral-900">새 글</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 text-sm">취소</button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                        {CATEGORIES.map((c) => {
                            const Icon = c.icon;
                            const active = category === c.key;
                            return (
                                <button
                                    key={c.key}
                                    onClick={() => setCategory(c.key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        active
                                            ? `${c.bg} ${c.color} border-current`
                                            : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                                    }`}
                                >
                                    <Icon className={`h-3 w-3 ${active ? "" : c.color}`} />
                                    <span>{c.label}</span>
                                    <span className="text-[10px] opacity-70">· {c.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목"
                        maxLength={200}
                        className="w-full text-base font-semibold text-neutral-900 placeholder:text-neutral-300 focus:outline-none border-b border-neutral-200 pb-2"
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용을 자유롭게 적어 주세요. 다른 PP 사용자들에게 도움이 됩니다."
                        rows={10}
                        className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none resize-none leading-relaxed"
                    />
                </div>
                <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-neutral-200">
                    <button
                        onClick={submit}
                        disabled={saving || !title.trim() || !content.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#6366F1] text-white rounded-lg text-sm font-medium hover:bg-[#4F46E5] transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        등록
                    </button>
                </div>
            </div>
        </div>
    );
}

function PostDetail({ postId, onClose, onChanged }: { postId: string; onClose: () => void; onChanged: () => void }) {
    const pathname = usePathname() || "/myverse/community";
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState("");
    const [posting, setPosting] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    async function load() {
        setLoading(true);
        const res = await fetch(`/api/myverse/community/${postId}`);
        if (res.ok) {
            const d = await res.json();
            setPost(d.post);
            setComments(d.comments || []);
            setAuthenticated(!!d.authenticated);
        }
        setLoading(false);
    }
    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [postId]);

    async function submitComment() {
        if (!comment.trim()) return;
        setPosting(true);
        try {
            const res = await fetch(`/api/myverse/community/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: comment }),
            });
            if (res.ok) {
                setComment("");
                load();
                onChanged();
            }
        } finally {
            setPosting(false);
        }
    }

    async function toggleLike() {
        if (!post) return;
        if (!authenticated) {
            window.location.href = myverseLoginHref(pathname);
            return;
        }
        const liked = post.i_liked;
        setPost({ ...post, i_liked: !liked, like_count: post.like_count + (liked ? -1 : 1) });
        await fetch(`/api/myverse/community/${postId}/likes`, { method: liked ? "DELETE" : "POST" });
        onChanged();
    }

    async function deletePost() {
        if (!post?.is_mine) return;
        const res = await fetch(`/api/myverse/community/${postId}`, { method: "DELETE" });
        if (res.ok) { onChanged(); onClose(); }
    }

    const cat = post && CATEGORIES.find((c) => c.key === post.category);
    const Icon = cat?.icon ?? Sparkles;

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col md:bg-black/40 md:p-6 md:items-center md:justify-center">
            <div className="bg-white md:rounded-2xl w-full md:max-w-2xl flex-1 md:flex-none md:max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
                    <button onClick={onClose} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
                        <ChevronLeft className="h-4 w-4" /> 목록
                    </button>
                    {post?.is_mine && (
                        <button onClick={() => setConfirmDelete(true)} className="text-xs text-red-500 hover:underline">삭제</button>
                    )}
                </header>

                {loading || !post ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-neutral-400">로딩 중…</div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <div className="flex items-center gap-2 mb-3">
                            {cat && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cat.bg} ${cat.color}`}>
                                    <Icon className="h-3 w-3" /> {cat.label}
                                </span>
                            )}
                            <span className="text-xs text-neutral-400">{formatDate(post.created_at)}</span>
                        </div>
                        <h1 className="font-serif text-2xl text-neutral-900 mb-3 leading-tight">{post.title}</h1>
                        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-neutral-100">
                            <Avatar name={post.author_name} url={post.author_avatar} />
                            <div>
                                <p className="text-sm font-medium text-neutral-900">{post.author_name}</p>
                            </div>
                        </div>
                        <div className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </div>

                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-neutral-100 text-sm">
                            <button
                                onClick={toggleLike}
                                className={`inline-flex items-center gap-1.5 transition-colors ${post.i_liked ? "text-rose-500" : "text-neutral-500 hover:text-rose-500"}`}
                            >
                                <Heart className={`h-4 w-4 ${post.i_liked ? "fill-current" : ""}`} />
                                좋아요 {post.like_count}
                            </button>
                            <span className="inline-flex items-center gap-1.5 text-neutral-500">
                                <MessageCircle className="h-4 w-4" />
                                댓글 {post.comment_count}
                            </span>
                        </div>

                        <div className="mt-6 space-y-3">
                            {comments.map((c) => (
                                <div key={c.id} className="flex items-start gap-2.5">
                                    <Avatar name={c.author_name} url={c.author_avatar} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-xs font-medium text-neutral-900">{c.author_name}</span>
                                            <span className="text-[10px] text-neutral-400">{formatDate(c.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-neutral-800 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t border-neutral-200 px-4 py-3 flex items-center gap-2">
                    {authenticated ? (
                        <>
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) submitComment(); }}
                                placeholder="댓글…"
                                className="flex-1 text-sm bg-neutral-50 rounded-full px-4 py-2 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border focus:border-neutral-200"
                            />
                            <button
                                onClick={submitComment}
                                disabled={posting || !comment.trim()}
                                className="px-4 py-2 bg-[#6366F1] text-white rounded-full text-sm font-medium hover:bg-[#4F46E5] disabled:opacity-50"
                            >
                                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : "등록"}
                            </button>
                        </>
                    ) : (
                        <Link
                            href={myverseLoginHref(pathname)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-[#6366F1] text-[#6366F1] rounded-full text-sm font-medium hover:bg-[#6366F1]/5"
                        >
                            <LogIn className="h-3.5 w-3.5" /> 로그인하고 댓글 달기
                        </Link>
                    )}
                </div>
            </div>
            <ConfirmSheet
                open={confirmDelete}
                message="이 글을 삭제할까요?"
                onConfirm={() => { setConfirmDelete(false); deletePost(); }}
                onCancel={() => setConfirmDelete(false)}
            />
        </div>
    );
}
