"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Heart, User } from "lucide-react";
import { useParams } from "next/navigation";
import {
    getCreatorByHandle, getPostBySlug, isPostLiked, togglePostLike,
    type JakkaCreator, type JakkaPost,
} from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";

export default function PostDetailPage() {
    const params = useParams();
    const rawHandle = params.handle as string;
    const slug = params.slug as string;
    const handle = rawHandle.startsWith("%40") ? rawHandle.replace("%40", "@") : rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;

    const { user } = useAuth();
    const [creator, setCreator] = useState<JakkaCreator | null>(null);
    const [post, setPost] = useState<JakkaPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    useEffect(() => { load(); }, [handle, slug]);

    async function load() {
        setLoading(true);
        try {
            const c = await getCreatorByHandle(handle);
            if (!c) { setLoading(false); return; }
            const p = await getPostBySlug(c.id, slug);
            setCreator(c);
            setPost(p);
            if (p) {
                setLikeCount(p.likes_count);
                if (user) {
                    const uid = user.authId ?? user.id;
                    setLiked(await isPostLiked(uid, p.id));
                }
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleLike() {
        if (!user || !post) return;
        const uid = user.authId ?? user.id;
        const now = await togglePostLike(uid, post.id);
        setLiked(now);
        setLikeCount((c) => c + (now ? 1 : -1));
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
            </div>
        );
    }

    if (!post || !creator) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <p className="text-[15px] text-neutral-500">존재하지 않는 스토리입니다.</p>
                <Link href={`/jakka/${encodeURIComponent(handle)}`} className="text-[13px] text-neutral-600 underline">작가 페이지로</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Back */}
            <div className="px-4 pt-5 pb-3">
                <Link
                    href={`/jakka/${encodeURIComponent(creator.handle)}`}
                    className="inline-flex items-center gap-1.5 text-[12px] text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                    <ArrowLeft className="h-3 w-3" />
                    {creator.display_name}
                </Link>
            </div>

            <article className="max-w-2xl mx-auto px-5 pb-20">
                {/* 카테고리 */}
                {post.category && (
                    <p className="text-[11px] font-mono text-neutral-600 uppercase tracking-wider mb-3">
                        {post.category}
                    </p>
                )}

                {/* 제목 */}
                <h1 className="text-[28px] font-black tracking-tight leading-tight mb-3">
                    {post.title}
                </h1>

                {/* 부제 */}
                {post.subtitle && (
                    <p className="text-[16px] text-neutral-500 leading-relaxed mb-6">
                        {post.subtitle}
                    </p>
                )}

                {/* 작가 + 메타 */}
                <div className="flex items-center gap-3 py-4 border-y border-neutral-100 mb-6">
                    <div className="w-9 h-9 rounded-full bg-neutral-100 overflow-hidden shrink-0">
                        {creator.featured_work?.images?.[0] ? (
                            <Image src={creator.featured_work.images[0]} alt={creator.display_name} width={36} height={36} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="h-4 w-4 text-neutral-500" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold">{creator.display_name}</p>
                        <p className="text-[11px] text-neutral-600">
                            {new Date(post.created_at).toLocaleDateString("ko-KR")} · {post.read_minutes}분 읽기
                        </p>
                    </div>
                </div>

                {/* 커버 이미지 */}
                {post.cover_image && (
                    <div className="relative w-full mb-6 bg-neutral-100">
                        <Image
                            src={post.cover_image}
                            alt={post.title}
                            width={1200}
                            height={800}
                            className="w-full h-auto object-cover"
                            sizes="(max-width: 768px) 100vw, 672px"
                        />
                    </div>
                )}

                {/* 본문 */}
                <div className="text-[16px] leading-[1.8] text-neutral-800 whitespace-pre-wrap">
                    {post.body}
                </div>

                {/* 태그 */}
                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-8 pt-6 border-t border-neutral-100">
                        {post.tags.map((t) => (
                            <span key={t} className="text-[12px] text-neutral-600">#{t}</span>
                        ))}
                    </div>
                )}

                {/* 좋아요 */}
                {user && (
                    <div className="mt-8 flex items-center justify-center">
                        <button
                            onClick={handleLike}
                            className="flex items-center gap-2 px-6 py-2.5 border border-neutral-300 hover:border-neutral-900 transition-colors"
                        >
                            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 stroke-red-500" : "stroke-neutral-900"}`} />
                            <span className="text-[13px] font-bold">{likeCount}</span>
                        </button>
                    </div>
                )}
            </article>
        </div>
    );
}
