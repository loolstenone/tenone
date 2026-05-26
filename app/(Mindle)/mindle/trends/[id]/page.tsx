// Mindle 트렌드 상세 (Server Component) — Phase 0
// DB fetch + view_count atomic 증가 + 관련 트렌드 자동 추천

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Bookmark, Share2, ChevronRight, Tag, ThumbsUp, MessageCircle, ExternalLink } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import {
    fetchTrendById,
    fetchPublishedTrends,
    categoryLabel,
    getTrendStatus,
} from "@/lib/mindle/trend-data";
import TrustLabel from "@/features/mindle/TrustLabel";

export const revalidate = 60;

const statusBadge: Record<string, { label: string; color: string }> = {
    trending: { label: "급상승", color: "bg-[#F5C518] text-black" },
    rising: { label: "상승", color: "bg-orange-500/20 text-orange-300" },
    signal: { label: "시그널", color: "bg-blue-500/20 text-blue-300" },
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const article = await fetchTrendById(id);
    if (!article) return { title: "트렌드 — Mindle" };
    return {
        title: `${article.title} — Mindle`,
        description: article.summary,
        openGraph: {
            title: article.title,
            description: article.summary,
            type: "article",
            publishedTime: article.published_at ?? article.created_at,
        },
    };
}

export default async function TrendDetailPage({ params }: PageProps) {
    const { id } = await params;
    const article = await fetchTrendById(id);

    if (!article) notFound();

    const status = getTrendStatus(article.relevance_score);
    const badge = statusBadge[status];

    // 관련 트렌드 — 같은 카테고리 최근 3건 (자기 자신 제외)
    const relatedPool = await fetchPublishedTrends({ category: article.category, limit: 4 });
    const related = relatedPool.filter(r => r.id !== article.id).slice(0, 3);

    const date = (article.published_at ?? article.created_at).slice(0, 10);
    const fullContent = article.full_content ?? article.summary;

    return (
        <div className="bg-[#0A0A0A] min-h-screen">
            <div className="mx-auto max-w-3xl px-6 py-10">
                {/* Back */}
                <Link
                    href="/mindle/trends"
                    className="inline-flex items-center gap-1.5 text-neutral-500 text-sm mb-8 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> 트렌드
                </Link>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.color}`}>
                            {badge.label}
                        </span>
                        <span className="text-[11px] text-neutral-500">{categoryLabel(article.category)}</span>
                        <span className="text-[11px] text-neutral-600">관련성 {Math.round(article.relevance_score * 100)}%</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">
                        {article.title}
                    </h1>
                    <p className="text-neutral-400 text-base leading-relaxed mb-5">{article.summary}</p>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 text-[11px] text-neutral-500">
                            <span className="text-neutral-300 font-medium">{article.agent_name}</span>
                            <span>{date}</span>
                            {article.view_count > 0 && (
                                <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {article.view_count.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg border border-neutral-800 text-neutral-500 hover:text-[#F5C518] hover:border-[#F5C518]/30 transition-colors" title="저장">
                                <Bookmark className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 transition-colors" title="공유">
                                <Share2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* TrustLabel — 모든 카드 상단/하단 SSOT */}
                <div className="mb-6">
                    <TrustLabel
                        sources={article.source_names}
                        sourceUrls={article.source_urls}
                        analyzedAt={article.created_at}
                        relevance={article.relevance_score}
                        agentName={article.agent_name}
                        accentClass="text-neutral-500"
                    />
                </div>

                {/* Tags */}
                {article.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                        <Tag className="w-3 h-3 text-neutral-600" />
                        {article.tags.map(tag => (
                            <span
                                key={tag}
                                className="text-[10px] px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="border-t border-neutral-800/50 mb-8" />

                {/* Content */}
                <article className="prose prose-invert prose-sm max-w-none mb-12">
                    {fullContent.split("\n\n").map((para, i) => {
                        if (para.startsWith("## ")) {
                            return (
                                <h2 key={i} className="text-lg font-bold text-white mt-8 mb-3">
                                    {para.replace("## ", "")}
                                </h2>
                            );
                        }
                        if (/^[\d]+\.\s/.test(para) || para.startsWith("- ")) {
                            return (
                                <div key={i} className="my-3">
                                    {para.split("\n").map((line, j) => (
                                        <p
                                            key={j}
                                            className="text-neutral-300 text-sm leading-relaxed mb-1.5"
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(
                                                    line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                                                ),
                                            }}
                                        />
                                    ))}
                                </div>
                            );
                        }
                        return (
                            <p
                                key={i}
                                className="text-neutral-300 text-sm leading-relaxed mb-4"
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                                    ),
                                }}
                            />
                        );
                    })}
                </article>

                {/* 출처 원문 링크 (상세에서는 명시적으로 한 번 더) */}
                {article.source_urls.length > 0 && (
                    <section className="mb-10 p-5 rounded-xl bg-neutral-900/40 border border-neutral-800/50">
                        <h3 className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">원문 출처</h3>
                        <ul className="space-y-2">
                            {article.source_urls.map((url, i) => (
                                <li key={url}>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-sm text-neutral-300 hover:text-[#F5C518] transition-colors"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>{article.source_names[i] ?? url}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Reaction Bar — 정직 라벨: 아직 기록 안 됨 */}
                <div className="flex items-center justify-between py-4 px-5 bg-neutral-900/50 border border-neutral-800/50 rounded-xl mb-10">
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 text-neutral-400 hover:text-[#F5C518] transition-colors text-sm" disabled title="🚧 Phase 1 도입 예정">
                            <ThumbsUp className="w-4 h-4" /> 유용해요
                        </button>
                        <button className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-sm" disabled title="🚧 Phase 1 도입 예정">
                            <MessageCircle className="w-4 h-4" /> 의견
                        </button>
                    </div>
                    <span className="text-[10px] text-neutral-600">🚧 반응 기능 Phase 1 예정</span>
                </div>

                {/* Related */}
                {related.length > 0 && (
                    <section className="border-t border-neutral-800/50 pt-8">
                        <h3 className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-5">관련 트렌드</h3>
                        <div className="space-y-4">
                            {related.map(r => {
                                const rs = getTrendStatus(r.relevance_score);
                                const rb = statusBadge[rs];
                                return (
                                    <Link
                                        key={r.id}
                                        href={`/mindle/trends/${r.id}`}
                                        className="group flex items-center justify-between py-3 border-b border-neutral-800/30 hover:border-[#F5C518]/20 transition-colors"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${rb.color}`}>
                                                    {rb.label}
                                                </span>
                                                <span className="text-[10px] text-neutral-600">{r.created_at.slice(0, 10)}</span>
                                            </div>
                                            <h4 className="text-white text-sm font-medium group-hover:text-[#F5C518] transition-colors truncate">
                                                {r.title}
                                            </h4>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-neutral-700 shrink-0 ml-3 group-hover:text-[#F5C518] transition-colors" />
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
