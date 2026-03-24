"use client";

import { use } from "react";
import { useBums } from "@/lib/bums-context";
import { ArrowLeft, ExternalLink, Link2, Check, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { getPostById, getBoardPostById } = useBums();
    const post = getPostById(id) || getBoardPostById(id);
    const [copied, setCopied] = useState(false);

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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

    return (
        <div className="tn-surface tn-text">
            <article className="pt-28 pb-32 px-6">
                <div className="max-w-3xl mx-auto">
                    <Link href="/newsroom" className="inline-flex items-center gap-2 text-sm tn-text-sub hover:tn-text transition-colors mb-8">
                        <ArrowLeft className="h-4 w-4" /> Newsroom
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs px-3 py-1 bg-neutral-100 tn-text-sub">{(post as any).category || (post as any).categoryId || ''}</span>
                        <span className="flex items-center gap-1 text-xs tn-text-sub">
                            <Calendar className="h-3 w-3" /> {(post as any).date || (post as any).publishedAt || (post as any).createdAt || ''}
                        </span>
                    </div>

                    <h1 className="text-xl md:text-3xl lg:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
                    <p className="text-lg tn-text-sub leading-relaxed mb-8">{post.summary}</p>

                    <div className="flex items-center gap-3 mb-10 pb-8 border-b tn-border">
                        <button onClick={handleCopyUrl}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs border tn-border tn-text-sub hover:tn-text hover:border-neutral-400 transition-colors">
                            {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> 복사됨</> : <><Link2 className="h-3.5 w-3.5" /> URL 복사</>}
                        </button>
                        {(post as any).externalLink && (
                            <a href={(post as any).externalLink} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs border tn-border tn-text-sub hover:tn-text hover:border-neutral-400 transition-colors">
                                <ExternalLink className="h-3.5 w-3.5" /> 외부 링크
                            </a>
                        )}
                    </div>

                    {(post as any).image && (
                        <div className="aspect-[16/9] bg-neutral-100 mb-10 overflow-hidden">
                            {(post.image.startsWith('http') || post.image.startsWith('data:')) ? (
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-sm tn-text-muted">[{post.image}]</p>
                                </div>
                            )}
                        </div>
                    )}

                    {post.body ? (
                        <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed whitespace-pre-wrap">
                            {post.body}
                        </div>
                    ) : (
                        <div className="py-12 text-center border border-dashed tn-border">
                            <p className="text-sm tn-text-sub">상세 내용이 아직 작성되지 않았습니다.</p>
                        </div>
                    )}

                    {((post as any).tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t tn-border">
                            <Tag className="h-3.5 w-3.5 tn-text-muted mt-0.5" />
                            {((post as any).tags || []).map((tag: string) => (
                                <span key={tag} className="text-xs px-3 py-1 tn-bg-alt tn-text-sub border tn-border">
                                    {tag}
                                </span>
                            ))}
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
