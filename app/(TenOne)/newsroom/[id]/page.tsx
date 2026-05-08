"use client";

import { use, useState, useEffect } from "react";
import { ArrowLeft, Link2, Check, Calendar, Tag, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getBrandMeta } from "@/lib/brand-meta";
import DOMPurify from 'isomorphic-dompurify';

interface PostData {
    id: string;
    site: string;
    board: string;
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string[];
    represent_image: string;
    created_at: string;
    view_count: number;
    like_count: number;
    comment_count: number;
    author_name: string | null;
    author_type: string;
}

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch(`/api/board/posts/${id}`)
            .then(r => r.json())
            .then(d => setPost(d.post || d || null))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="tn-surface tn-text min-h-screen pt-32 px-6">
                <div className="max-w-3xl mx-auto flex justify-center py-20">
                    <div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="tn-surface tn-text min-h-screen pt-32 px-6">
                <div className="max-w-3xl mx-auto text-center py-20">
                    <p className="tn-text-sub mb-6">존재하지 않는 게시글입니다.</p>
                    <Link href="/newsroom" className="text-sm tn-text hover:underline inline-flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Newsroom으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    const rawDate = (post.created_at || '').substring(0, 10);
    const isExternal = post.site && post.site !== 'tenone';
    const brandMeta = getBrandMeta(post.site || 'tenone');
    const originUrl = isExternal ? `${brandMeta.boardPath}` : null;

    return (
        <div className="tn-surface tn-text">
            <article className="pt-28 pb-32 px-6">
                <div className="max-w-3xl mx-auto">
                    <Link href="/newsroom" className="inline-flex items-center gap-2 text-sm tn-text-sub hover:tn-text transition-colors mb-8">
                        <ArrowLeft className="h-4 w-4" /> Newsroom
                    </Link>

                    {/* 브랜드 배지 + 메타 */}
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${brandMeta.bgColor} ${brandMeta.textColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${brandMeta.dotColor}`} />
                            {brandMeta.name}
                        </span>
                        {post.category && (
                            <span className="text-xs px-3 py-1 tn-text-sub" style={{ backgroundColor: "var(--tn-surface)" }}>
                                {post.category}
                            </span>
                        )}
                        {rawDate && (
                            <span className="flex items-center gap-1 text-xs tn-text-sub">
                                <Calendar className="h-3 w-3" /> {rawDate}
                            </span>
                        )}
                    </div>

                    <h1 className="text-xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
                    <p className="text-lg tn-text-sub leading-relaxed mb-8">{post.excerpt}</p>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-3 mb-10 pb-8 border-b tn-border flex-wrap">
                        <button onClick={handleCopyUrl}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs border tn-border tn-text-sub hover:tn-text hover:border-neutral-400 transition-colors">
                            {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> 복사됨</> : <><Link2 className="h-3.5 w-3.5" /> URL 복사</>}
                        </button>
                        {isExternal && originUrl && (
                            <Link href={originUrl}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs border tn-border tn-text-sub hover:tn-text hover:border-neutral-400 transition-colors">
                                <ExternalLink className="h-3.5 w-3.5" />
                                {brandMeta.name} 사이트에서 보기
                            </Link>
                        )}
                    </div>

                    {post.represent_image && (
                        <div className="aspect-[16/9] tn-bg-alt mb-10 overflow-hidden">
                            <img src={post.represent_image} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                    )}

                    {post.content ? (
                        <div className="prose prose-neutral prose-invert max-w-none leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
                    ) : (
                        <div className="py-12 text-center border border-dashed tn-border">
                            <p className="text-sm tn-text-sub">상세 내용이 아직 작성되지 않았습니다.</p>
                        </div>
                    )}

                    {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t tn-border">
                            <Tag className="h-3.5 w-3.5 tn-text-muted mt-0.5" />
                            {post.tags.map((tag: string) => (
                                <span key={tag} className="text-xs px-3 py-1 tn-bg-alt tn-text-sub border tn-border">#{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* 외부 브랜드 안내 박스 */}
                    {isExternal && originUrl && (
                        <div className="mt-10 p-6 rounded-lg border tn-border" style={{ backgroundColor: 'var(--tn-surface)' }}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`w-2 h-2 rounded-full ${brandMeta.dotColor}`} />
                                <span className="text-sm font-medium">{brandMeta.name}</span>
                            </div>
                            <p className="text-xs tn-text-sub mb-3">
                                이 게시글은 {brandMeta.name}에서 작성되었습니다.
                                해당 사이트에서 더 많은 콘텐츠를 확인하세요.
                            </p>
                            <Link href={originUrl}
                                className={`inline-flex items-center gap-2 text-xs font-medium ${brandMeta.textColor} hover:underline`}>
                                {brandMeta.name} 방문하기 <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                    )}

                    <div className="mt-16 pt-8 border-t tn-border">
                        <Link href="/newsroom" className="inline-flex items-center gap-2 text-sm tn-text-sub hover:tn-text transition-colors">
                            <ArrowLeft className="h-4 w-4" /> 목록으로
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
