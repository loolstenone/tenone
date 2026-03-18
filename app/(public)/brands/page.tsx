"use client";

import { useState } from "react";
import { brands } from "@/lib/data";
import { ExternalLink, Filter } from "lucide-react";

const categories = ['All', 'Corporate', 'Community', 'Project Group', 'Startup', 'AI Idol', 'AI Creator', 'Fashion', 'Character'];

const statusColor: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-400',
    Development: 'bg-amber-500/10 text-amber-400',
    Hiatus: 'bg-zinc-800 text-zinc-400',
};

export default function BrandsPage() {
    const [category, setCategory] = useState('All');
    const filtered = category === 'All' ? brands : brands.filter(b => b.category === category);

    return (
        <div className="space-y-12">
            <section className="pt-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white">Brands</h1>
                <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
                    Ten:One™ Universe를 구성하는 브랜드 포트폴리오
                </p>
            </section>

            <div className="flex flex-wrap justify-center gap-2">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                            category === cat ? 'bg-indigo-600 text-white' : 'border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                        }`}>
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(brand => (
                    <div key={brand.id} className="group rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 hover:border-indigo-500/50 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-14 w-14 rounded-xl bg-zinc-800 flex items-center justify-center text-lg font-bold text-white">
                                {brand.name.slice(0, 2)}
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[brand.status]}`}>
                                {brand.status}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-white">{brand.name}</h3>
                        <p className="text-xs text-indigo-400 mt-1">{brand.category}</p>
                        {brand.domain && <p className="text-sm text-zinc-500 mt-1">{brand.domain}</p>}

                        {brand.tagline && (
                            <p className="text-sm text-zinc-400 mt-3 italic">&ldquo;{brand.tagline}&rdquo;</p>
                        )}

                        <p className="text-sm text-zinc-500 mt-3">{brand.description}</p>

                        <div className="flex flex-wrap gap-1.5 mt-4">
                            {brand.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{tag}</span>
                            ))}
                        </div>

                        {brand.websiteUrl && (
                            <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                Visit Website <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
