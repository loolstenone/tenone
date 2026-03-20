"use client";

import { useState } from "react";
import Link from "next/link";
import { useCms } from "@/lib/cms-context";
import { CmsCategory } from "@/types/cms";
import { ArrowRight, ExternalLink } from "lucide-react";

const categories: ('전체' | CmsCategory)[] = ['전체', '브랜드', '프로젝트', '네트워크', '교육', '콘텐츠', '공지'];

export default function WorksPage() {
    const { getPublishedByChannel } = useCms();
    const allWorks = getPublishedByChannel('works');
    const [filter, setFilter] = useState<'전체' | CmsCategory>('전체');

    const filtered = filter === '전체' ? allWorks : allWorks.filter(w => w.category === filter);

    return (
        <div className="bg-white text-neutral-900">
            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                        Works
                    </p>
                    <h1 className="text-4xl md:text-6xl font-light leading-tight">
                        우리가 <span className="font-bold">해온 일들</span>
                    </h1>
                    <p className="mt-6 text-lg text-neutral-500 max-w-2xl">
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
                                className={`px-5 py-2 text-sm tracking-wide transition-colors ${
                                    filter === cat
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900'
                                }`}>
                                {cat}</button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Works Grid */}
            <section className="px-6 pb-32">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {filtered.map(work => (
                            <article key={work.id} className="group">
                                {/* 이미지 영역 */}
                                <Link href={`/works/${work.id}`} className="block">
                                    <div className="aspect-[16/9] bg-neutral-100 mb-6 flex items-center justify-center overflow-hidden group-hover:opacity-90 transition-opacity">
                                        {work.image && (work.image.startsWith('http') || work.image.startsWith('data:')) ? (
                                            <img src={work.image} alt={work.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <p className="text-sm text-neutral-300 text-center px-8">[{work.image || '이미지'}]</p>
                                        )}
                                    </div>
                                </Link>

                                {/* 정보 */}
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-500">{work.category}</span>
                                    <span className="text-xs text-neutral-400">{work.date}</span>
                                </div>
                                <Link href={`/works/${work.id}`}>
                                    <h2 className="text-2xl font-bold group-hover:underline cursor-pointer">{work.title}</h2>
                                </Link>
                                <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{work.summary}</p>

                                {/* 태그 */}
                                {work.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {work.tags.map(tag => (
                                            <span key={tag} className="text-xs px-3 py-1 bg-neutral-50 text-neutral-400 border border-neutral-100">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* 링크 */}
                                <div className="flex items-center gap-3 mt-4">
                                    <Link href={`/works/${work.id}`}
                                        className="inline-flex items-center gap-2 text-sm text-neutral-900 hover:text-neutral-600 transition-colors">
                                        자세히 보기 <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                    {work.externalLink && (
                                        <a href={work.externalLink} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-900 transition-colors">
                                            외부 링크 <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-neutral-400">아직 등록된 Works가 없습니다.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-neutral-900 text-white py-24 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-3xl font-light">
                            함께 만들어갈 <span className="font-bold">다음 프로젝트</span>
                        </h2>
                        <p className="mt-3 text-neutral-400">
                            당신의 문제를 해결할 인재를 연결해드립니다.
                        </p>
                    </div>
                    <a href="/contact" className="px-8 py-3.5 bg-white text-neutral-900 text-sm tracking-wide hover:bg-neutral-100 transition-colors flex items-center gap-2">
                        프로젝트 의뢰 <ArrowRight className="h-4 w-4" />
                    </a>
                </div>
            </section>
        </div>
    );
}
