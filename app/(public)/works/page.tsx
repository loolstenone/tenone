"use client";

import { useState } from "react";
import { brands } from "@/lib/data";
import { ArrowRight, ExternalLink } from "lucide-react";

const categories = ['All', 'Community', 'Project Group', 'AI Idol', 'AI Creator', 'Fashion', 'Character', 'Startup'];

export default function WorksPage() {
    const [category, setCategory] = useState('All');
    const workBrands = brands.filter(b => b.id !== 'tenone');
    const filtered = category === 'All' ? workBrands : workBrands.filter(b => b.category === category);

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
                            <button key={cat} onClick={() => setCategory(cat)}
                                className={`px-5 py-2 text-sm tracking-wide transition-colors ${
                                    category === cat
                                        ? 'bg-neutral-900 text-white'
                                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900'
                                }`}>
                                {cat === 'All' ? '전체' : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Brand Grid */}
            <section className="px-6 pb-32">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                        {filtered.map(brand => (
                            <div key={brand.id} className="group">
                                {/* 이미지 영역 */}
                                <div className="aspect-[16/9] bg-neutral-100 mb-6 flex items-center justify-center overflow-hidden">
                                    <div className="text-center">
                                        <span className="text-4xl font-bold text-neutral-200">{brand.name.slice(0, 2)}</span>
                                        <p className="text-xs text-neutral-300 mt-2">[{brand.name} 대표 이미지]</p>
                                    </div>
                                </div>

                                {/* 정보 */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs text-neutral-400 tracking-wide">{brand.category}</p>
                                        <h2 className="text-2xl font-bold mt-1">{brand.name}</h2>
                                    </div>
                                    <span className={`text-xs px-3 py-1 ${
                                        brand.status === 'Active' ? 'bg-neutral-900 text-white' :
                                        brand.status === 'Development' ? 'bg-neutral-200 text-neutral-600' :
                                        'bg-neutral-100 text-neutral-400'
                                    }`}>
                                        {brand.status}
                                    </span>
                                </div>

                                {brand.tagline && (
                                    <p className="text-sm text-neutral-500 mt-3 italic">&ldquo;{brand.tagline}&rdquo;</p>
                                )}

                                <p className="text-sm text-neutral-500 mt-3 leading-relaxed">{brand.description}</p>

                                {/* 태그 */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {brand.tags.map(tag => (
                                        <span key={tag} className="text-xs px-3 py-1 bg-neutral-50 text-neutral-400 border border-neutral-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* 링크 */}
                                {brand.websiteUrl && (
                                    <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer"
                                        className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-900 hover:text-neutral-600 transition-colors group/link">
                                        Visit <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
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
