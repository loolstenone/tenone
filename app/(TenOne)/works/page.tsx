"use client";

import { useState } from "react";
import Link from "next/link";
import { useBums } from "@/lib/bums-context";
import { CmsCategory } from "@/types/bums";
import { ArrowRight, ExternalLink } from "lucide-react";

const categories: string[] = ['전체', 'AI', '브랜딩', '프로젝트', '네트워크', '교육', '콘텐츠'];

export default function WorksPage() {
    const { getPublishedByChannel, getPublishedByBoardSlug } = useBums();
    const dbData = getPublishedByBoardSlug('tenone', 'works');
    const legacyData = getPublishedByChannel('works');
    const allWorks = dbData.length > 0 ? dbData : legacyData;
    const [filter, setFilter] = useState('전체');

    const filtered = filter === '전체' ? allWorks : allWorks.filter(w => ((w as any).category || (w as any).categoryId || '') === filter);

    return (
        <div className="tn-surface tn-text">
            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">
                        Works
                    </p>
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-light leading-tight">
                        우리가 <span className="font-bold">해온 일들</span>
                    </h1>
                    <p className="mt-6 text-lg tn-text-sub max-w-2xl">
                        Ten:One™ Universe에서 발굴하고 연결하여 만들어낸 브랜드와 프로젝트들입니다.
                    </p>
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
                                }>
                                {cat}</button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Works Grid */}
            <section className="px-6 pb-32">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-6 md:gap-12">
                        {filtered.map(work => (
                            <article key={work.id} className="group">
                                {/* 이미지 영역 */}
                                <Link href={`/works/${work.id}`} className="block">
                                    <div className="aspect-[16/9] mb-6 flex items-center justify-center overflow-hidden group-hover:opacity-90 transition-opacity" style={{ backgroundColor: "var(--tn-surface)" }}>
                                        {work.image && (work.image.startsWith('http') || work.image.startsWith('data:')) ? (
                                            <img src={work.image} alt={work.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-4xl font-bold" style={{ color: "var(--tn-text-muted)" }}>
                                                    {((work as any).category || (work as any).categoryId || work.title || '').substring(0, 2)}
                                                </span>
                                                <span className="text-xs" style={{ color: "var(--tn-text-muted)" }}>{work.title}</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* 정보 */}
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs px-3 py-1 tn-text-sub" style={{ backgroundColor: "var(--tn-surface)" }}>{(work as any).category || (work as any).categoryId || ''}</span>
                                    <span className="text-xs tn-text-sub">{(() => { const d = ((work as any).date || (work as any).publishedAt || (work as any).createdAt || '').substring(0, 7); return d ? `${d.split('-')[0]}년 ${d.split('-')[1]}월` : ''; })()}</span>
                                </div>
                                <Link href={`/works/${work.id}`}>
                                    <h2 className="text-2xl font-bold group-hover:underline cursor-pointer">{work.title}</h2>
                                </Link>
                                <p className="text-sm tn-text-sub mt-3 leading-relaxed">{work.summary}</p>

                                {/* 태그 */}
                                {((work as any).tags || []).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {((work as any).tags || []).map((tag: string) => (
                                            <span key={tag} className="text-xs px-3 py-1 tn-bg-alt tn-text-sub border tn-border">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* 링크 */}
                                <div className="flex items-center gap-3 mt-4">
                                    <Link href={`/works/${work.id}`}
                                        className="inline-flex items-center gap-2 text-sm tn-text hover:text-neutral-600 transition-colors">
                                        자세히 보기 <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                    {((work as any).externalLink) && (
                                        <a href={(work as any).externalLink} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm tn-text-sub hover:tn-text transition-colors">
                                            외부 링크 <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20">
                            <p className="tn-text-sub">아직 등록된 Works가 없습니다.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="tn-card py-16 md:py-24 px-6" style={{ backgroundColor: "var(--tn-surface)", color: "var(--tn-text)" }}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-xl md:text-3xl font-light">
                            함께 만들어갈 <span className="font-bold">다음 프로젝트</span>
                        </h2>
                        <p className="mt-3 tn-text-sub">
                            당신의 문제를 해결할 인재를 연결해드립니다.
                        </p>
                    </div>
                    <a href="/contact" className="px-8 py-3.5 text-sm tracking-wide transition-colors flex items-center gap-2" style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                        프로젝트 의뢰 <ArrowRight className="h-4 w-4" />
                    </a>
                </div>
            </section>
        </div>
    );
}
