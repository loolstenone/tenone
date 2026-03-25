"use client";

import { useState } from "react";
import { brands } from "@/lib/data";
import { ExternalLink } from "lucide-react";

const categories = ['All', 'Corporate', 'Community', 'Project Group', 'Startup', 'AI Idol', 'AI Creator', 'Fashion', 'Character', 'Content'];

const statusColor: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
    Development: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    Hiatus: 'bg-neutral-100 text-neutral-500 dark:bg-zinc-800 dark:text-zinc-400',
};

export default function BrandsPage() {
    const [category, setCategory] = useState('All');
    const filtered = category === 'All' ? brands : brands.filter(b => b.category === category);

    return (
        <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
            <div className="pt-8">
                <p className="text-xs tracking-widest text-neutral-400 uppercase mb-2">Brand Portfolio</p>
                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">Brands</h1>
                <p className="text-neutral-500">Ten:One™ Universe를 구성하는 {brands.length}개 브랜드 포트폴리오</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            category === cat
                                ? 'bg-neutral-900 text-white dark:bg-indigo-600'
                                : 'border border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-white dark:hover:border-zinc-500'
                        }`}>
                        {cat}
                    </button>
                ))}
            </div>

            <p className="text-sm text-neutral-400">{filtered.length}개 브랜드</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(brand => (
                    <div key={brand.id} className="group rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-5 hover:border-neutral-400 dark:hover:border-indigo-500/50 transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div className="h-11 w-11 rounded-lg bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-neutral-900 dark:text-white">
                                {brand.name.slice(0, 2)}
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[brand.status] || statusColor.Hiatus}`}>
                                {brand.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{brand.name}</h3>
                        <p className="text-xs text-blue-600 dark:text-indigo-400 mt-0.5">{brand.category}</p>
                        {brand.domain && <p className="text-xs text-neutral-400 mt-0.5">{brand.domain}</p>}

                        {brand.tagline && (
                            <p className="text-sm text-neutral-500 dark:text-zinc-400 mt-2 italic">&ldquo;{brand.tagline}&rdquo;</p>
                        )}

                        <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{brand.description}</p>

                        <div className="flex flex-wrap gap-1 mt-3">
                            {brand.tags.slice(0, 4).map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-zinc-800 text-neutral-500 dark:text-zinc-400">{tag}</span>
                            ))}
                        </div>

                        {brand.websiteUrl && (
                            <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-indigo-400 hover:underline">
                                Visit <ExternalLink className="h-3 w-3" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
