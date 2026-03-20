"use client";

import { use } from "react";
import { useCms } from "@/lib/cms-context";
import { ArrowLeft, ExternalLink, Link2, Check, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { getPostById } = useCms();
    const post = getPostById(id);
    const [copied, setCopied] = useState(false);

    const handleCopyUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!post) {
        return (
            <div className="bg-white text-neutral-900 min-h-screen pt-32 px-6">
                <div className="max-w-3xl mx-auto text-center py-20">
                    <p className="text-neutral-400 mb-6">존재하지 않는 게시글입니다.</p>
                    <Link href="/works" className="text-sm text-neutral-900 hover:underline inline-flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Works로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white text-neutral-900">
            <article className="pt-28 pb-32 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Back */}
                    <Link href="/works" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-900 transition-colors mb-8">
                        <ArrowLeft className="h-4 w-4" /> Works
                    </Link>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-500">{post.category}</span>
                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                            <Calendar className="h-3 w-3" /> {post.date}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
                    <p className="text-lg text-neutral-500 leading-relaxed mb-8">{post.summary}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mb-10 pb-8 border-b border-neutral-100">
                        <button onClick={handleCopyUrl}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
                            {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> 복사됨</> : <><Link2 className="h-3.5 w-3.5" /> URL 복사</>}
                        </button>
                        {post.externalLink && (
                            <a href={post.externalLink} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 transition-colors">
                                <ExternalLink className="h-3.5 w-3.5" /> 외부 링크
                            </a>
                        )}
                    </div>

                    {/* Image */}
                    {post.image && (
                        <div className="aspect-[16/9] bg-neutral-100 mb-10 overflow-hidden">
                            {(post.image.startsWith('http') || post.image.startsWith('data:')) ? (
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-sm text-neutral-300">[{post.image}]</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Body */}
                    {post.body ? (
                        <div className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed whitespace-pre-wrap">
                            {post.body}
                        </div>
                    ) : (
                        <div className="py-12 text-center border border-dashed border-neutral-200">
                            <p className="text-sm text-neutral-400">상세 내용이 아직 작성되지 않았습니다.</p>
                        </div>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-neutral-100">
                            <Tag className="h-3.5 w-3.5 text-neutral-300 mt-0.5" />
                            {post.tags.map(tag => (
                                <span key={tag} className="text-xs px-3 py-1 bg-neutral-50 text-neutral-400 border border-neutral-100">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Back to list */}
                    <div className="mt-16 pt-8 border-t border-neutral-100">
                        <Link href="/works" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-900 transition-colors">
                            <ArrowLeft className="h-4 w-4" /> 목록으로
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
