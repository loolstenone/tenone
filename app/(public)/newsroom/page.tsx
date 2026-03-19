"use client";

import { useState } from "react";
import { useCms } from "@/lib/cms-context";
import { CmsCategory } from "@/types/cms";
import { ExternalLink } from "lucide-react";

const categories: ('전체' | CmsCategory)[] = ['전체', 'Brand', 'Project', 'Event', 'Media'];

export default function NewsroomPage() {
    const { getPublishedByChannel } = useCms();
    const allNews = getPublishedByChannel('newsroom');
    const [filter, setFilter] = useState<'전체' | CmsCategory>('전체');

    const filtered = filter === '전체' ? allNews : allNews.filter(n => n.category === filter);
    const featured = filtered[0];
    const rest = filtered.slice(1);

    return (
        <div className="bg-white text-neutral-900">
            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">Newsroom</p>
                    <h1 className="text-4xl md:text-6xl font-light leading-tight"><span className="font-bold">소식</span></h1>
                    <p className="mt-6 text-lg text-neutral-500 max-w-2xl">Ten:One™ Universe의 새로운 소식과 활동을 전합니다.</p>
                </div>
            </section>

            {/* Filter */}
            <section className="px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setFilter(cat)}
                                className={`px-5 py-2 text-sm tracking-wide transition-colors ${
                                    filter === cat ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900'
                                }`}>{cat}</button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured */}
            {featured && (
                <section className="px-6 pb-16">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
                        <div className="aspect-[16/10] bg-neutral-100 flex items-center justify-center">
                            <p className="text-sm text-neutral-400">[{featured.image || '이미지'}]</p>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-500">{featured.category}</span>
                                <span className="text-xs text-neutral-400">{featured.date}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold leading-snug">{featured.title}</h2>
                            <p className="mt-4 text-neutral-500 leading-relaxed">{featured.summary}</p>
                            {featured.externalLink && (
                                <a href={featured.externalLink} target="_blank" rel="noopener noreferrer"
                                    className="mt-6 inline-flex items-center gap-2 text-sm text-neutral-900 hover:text-neutral-600 transition-colors">
                                    자세히 보기 <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            )}
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
                                <div className="aspect-[16/10] bg-neutral-100 mb-4 flex items-center justify-center">
                                    <p className="text-xs text-neutral-400">[{news.image || '이미지'}]</p>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500">{news.category}</span>
                                    <span className="text-xs text-neutral-400">{news.date}</span>
                                </div>
                                <h3 className="font-bold text-neutral-900 group-hover:underline leading-snug">{news.title}</h3>
                                <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{news.summary}</p>
                                {news.externalLink && (
                                    <a href={news.externalLink} target="_blank" rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-900 transition-colors">
                                        자세히 보기 <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </article>
                        ))}
                    </div>
                </section>
            )}

            {filtered.length === 0 && (
                <section className="px-6 pb-32">
                    <div className="max-w-7xl mx-auto text-center py-20">
                        <p className="text-neutral-400">아직 소식이 없습니다.</p>
                    </div>
                </section>
            )}
        </div>
    );
}
