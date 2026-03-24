"use client";

import { useState } from "react";
import Link from "next/link";
import { useBums } from "@/lib/bums-context";
import { CmsCategory } from "@/types/bums";
import { ExternalLink, ArrowRight } from "lucide-react";

const categories: ('전체' | CmsCategory)[] = ['전체', '브랜드', '프로젝트', '네트워크', '교육', '콘텐츠', '공지'];

export default function NewsroomPage() {
    const { getPublishedByChannel, getPublishedByBoardSlug } = useBums();
    const dbData = getPublishedByBoardSlug('tenone', 'newsroom');
    const legacyData = getPublishedByChannel('newsroom');
    const allNews = dbData.length > 0 ? dbData : legacyData;
    const [filter, setFilter] = useState<'전체' | CmsCategory>('전체');

    const filtered = filter === '전체' ? allNews : allNews.filter(n => ((n as any).category || (n as any).categoryId || '') === filter);
    const featured = filtered[0];
    const rest = filtered.slice(1);

    return (
        <div className="tn-surface tn-text">
            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Newsroom</p>
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-light leading-tight"><span className="font-bold">소식</span></h1>
                    <p className="mt-6 text-lg tn-text-sub max-w-2xl">Ten:One™ Universe의 새로운 소식과 활동을 전합니다.</p>
                </div>
            </section>

            {/* Filter */}
            <section className="px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setFilter(cat)}
                                className="px-5 py-2 text-sm tracking-wide transition-colors"
                                style={filter === cat
                                    ? { backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }
                                    : { backgroundColor: "var(--tn-surface)", color: "var(--tn-text-sub)" }
                                }>{cat}</button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured */}
            {featured && (
                <section className="px-6 pb-16">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
                        <div className="aspect-[16/10] bg-neutral-100 flex items-center justify-center overflow-hidden">
                            {featured.image && (featured.image.startsWith('http') || featured.image.startsWith('data:')) ? (
                                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
                            ) : (
                                <p className="text-sm tn-text-sub">[{featured.image || '이미지'}]</p>
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs px-3 py-1 tn-text-sub" style={{ backgroundColor: "var(--tn-surface)" }}>{(featured as any).category || (featured as any).categoryId || ''}</span>
                                <span className="text-xs tn-text-sub">{(featured as any).date || (featured as any).publishedAt || (featured as any).createdAt || ''}</span>
                            </div>
                            <Link href={`/newsroom/${featured.id}`}>
                                <h2 className="text-2xl md:text-3xl font-bold leading-snug hover:underline">{featured.title}</h2>
                            </Link>
                            <p className="mt-4 tn-text-sub leading-relaxed">{featured.summary}</p>
                            <div className="flex items-center gap-4 mt-6">
                                <Link href={`/newsroom/${featured.id}`}
                                    className="inline-flex items-center gap-2 text-sm tn-text hover:text-neutral-600 transition-colors">
                                    자세히 보기 <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                                {(featured as any).externalLink && (
                                    <a href={(featured as any).externalLink} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm tn-text-sub hover:tn-text transition-colors">
                                        외부 링크 <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Grid */}
            {rest.length > 0 && (
                <section className="px-6 pb-32">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rest.map(news => (
                            <article key={news.id} className="group">
                                <Link href={`/newsroom/${news.id}`} className="block">
                                    <div className="aspect-[16/10] bg-neutral-100 mb-4 flex items-center justify-center overflow-hidden group-hover:opacity-90 transition-opacity">
                                        {news.image && (news.image.startsWith('http') || news.image.startsWith('data:')) ? (
                                            <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <p className="text-xs tn-text-sub">[{news.image || '이미지'}]</p>
                                        )}
                                    </div>
                                </Link>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs px-2 py-0.5 tn-text-sub" style={{ backgroundColor: "var(--tn-surface)" }}>{(news as any).category || (news as any).categoryId || ''}</span>
                                    <span className="text-xs tn-text-sub">{(news as any).date || (news as any).publishedAt || (news as any).createdAt || ''}</span>
                                </div>
                                <Link href={`/newsroom/${news.id}`}>
                                    <h3 className="font-bold tn-text group-hover:underline leading-snug">{news.title}</h3>
                                </Link>
                                <p className="text-sm tn-text-sub mt-2 line-clamp-2">{news.summary}</p>
                                <div className="flex items-center gap-3 mt-3">
                                    <Link href={`/newsroom/${news.id}`}
                                        className="inline-flex items-center gap-1.5 text-xs tn-text hover:text-neutral-600 transition-colors">
                                        자세히 보기 <ArrowRight className="h-3 w-3" />
                                    </Link>
                                    {(news as any).externalLink && (
                                        <a href={(news as any).externalLink} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs tn-text-sub hover:tn-text transition-colors">
                                            외부 링크 <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {filtered.length === 0 && (
                <section className="px-6 pb-32">
                    <div className="max-w-7xl mx-auto text-center py-20">
                        <p className="tn-text-sub">아직 소식이 없습니다.</p>
                    </div>
                </section>
            )}
        </div>
    );
}
