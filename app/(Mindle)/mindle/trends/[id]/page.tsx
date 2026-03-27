"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, Bookmark, Share2, ChevronRight } from "lucide-react";
import { findArticle, statusBadge, trends } from "@/lib/mindle/trend-data";

export default function TrendDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const article = findArticle(id);

    if (!article) {
        return (
            <div className="bg-[#0A0A0A] min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-neutral-400 mb-4">Article not found</p>
                    <Link href="/mindle/trends" className="text-[#F5C518] text-sm hover:underline">Back to Trends</Link>
                </div>
            </div>
        );
    }

    const badge = statusBadge[article.status];
    const related = trends.filter(t => t.id !== article.id && t.category === article.category).slice(0, 3);

    return (
        <div className="bg-[#0A0A0A]">
            <div className="mx-auto max-w-3xl px-6 py-10">
                {/* Back */}
                <button onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-neutral-500 text-sm mb-8 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Trends
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.color}`}>{badge.label}</span>
                        <span className="text-[11px] text-neutral-500">{article.category}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">
                        {article.title}
                    </h1>
                    <p className="text-neutral-400 text-base leading-relaxed mb-5">{article.excerpt}</p>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-[11px] text-neutral-500">
                            {article.author && <span className="text-neutral-300 font-medium">{article.author}</span>}
                            <span>{article.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg border border-neutral-800 text-neutral-500 hover:text-[#F5C518] hover:border-[#F5C518]/30 transition-colors" title="Bookmark">
                                <Bookmark className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors" title="Share">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-neutral-800/50 mb-8" />

                {/* Content */}
                <article className="prose prose-invert prose-sm max-w-none mb-16">
                    {(article.content || article.excerpt).split('\n\n').map((para, i) => {
                        if (para.startsWith('## ')) {
                            return <h2 key={i} className="text-lg font-bold text-white mt-8 mb-3">{para.replace('## ', '')}</h2>;
                        }
                        if (para.startsWith('1. ') || para.startsWith('2. ') || para.startsWith('3. ')) {
                            return (
                                <div key={i} className="my-3">
                                    {para.split('\n').map((line, j) => (
                                        <p key={j} className="text-neutral-300 text-sm leading-relaxed mb-1.5"
                                           dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                                    ))}
                                </div>
                            );
                        }
                        return <p key={i} className="text-neutral-300 text-sm leading-relaxed mb-4"
                                  dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />;
                    })}
                </article>

                {/* Related */}
                {related.length > 0 && (
                    <section className="border-t border-neutral-800/50 pt-8">
                        <h3 className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-5">Related Trends</h3>
                        <div className="space-y-4">
                            {related.map(r => (
                                <Link key={r.id} href={`/mindle/trends/${r.id}`}
                                    className="group flex items-center justify-between py-3 border-b border-neutral-800/30 hover:border-[#F5C518]/20 transition-colors">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${statusBadge[r.status].color}`}>{statusBadge[r.status].label}</span>
                                            <span className="text-[10px] text-neutral-600">{r.date}</span>
                                        </div>
                                        <h4 className="text-white text-sm font-medium group-hover:text-[#F5C518] transition-colors truncate">{r.title}</h4>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-neutral-700 shrink-0 ml-3 group-hover:text-[#F5C518] transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
