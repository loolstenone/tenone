"use client";

import { useState } from "react";
import { brands } from "@/lib/data";
import { ExternalLink } from "lucide-react";

const categories = ['All', 'Corporate', 'Community', 'Project Group', 'Startup', 'AI Idol', 'AI Creator', 'Fashion', 'Character', 'Content'];

const statusColor: Record<string, string> = {
    Active: 'bg-emerald-500/10 text-emerald-400',
    Development: 'bg-amber-500/10 text-amber-400',
    Hiatus: 'bg-neutral-800 text-neutral-500',
};

export default function BrandsPage() {
    const [category, setCategory] = useState('All');
    const filtered = category === 'All' ? brands : brands.filter(b => b.category === category);

    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--tn-bg)", color: "var(--tn-text)" }}>
            <div className="mx-auto max-w-5xl px-6 pt-24 pb-16 space-y-8">
                <div>
                    <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "var(--tn-text-sub)" }}>Brand Portfolio</p>
                    <h1 className="text-3xl font-light tracking-tight mb-2">Brands</h1>
                    <p className="text-sm" style={{ color: "var(--tn-text-sub)" }}>Ten:One&trade; Universe를 구성하는 {brands.length}개 브랜드</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)}
                            className="px-3 py-1.5 text-xs tracking-wide transition-all"
                            style={{
                                backgroundColor: category === cat ? "var(--tn-accent)" : "transparent",
                                color: category === cat ? "var(--tn-bg)" : "var(--tn-text-sub)",
                                border: category === cat ? "none" : "1px solid var(--tn-border)",
                            }}>
                            {cat}
                        </button>
                    ))}
                </div>

                <p className="text-xs" style={{ color: "var(--tn-text-sub)" }}>{filtered.length}개 브랜드</p>

                <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3" style={{ backgroundColor: "var(--tn-border)" }}>
                    {filtered.map(brand => (
                        <div key={brand.id} className="group p-5 transition-all hover:opacity-100 opacity-80" style={{ backgroundColor: "var(--tn-bg)" }}>
                            <div className="flex items-start justify-between mb-3">
                                <div className="h-10 w-10 flex items-center justify-center text-xs font-medium border" style={{ borderColor: "var(--tn-border)" }}>
                                    {brand.name.slice(0, 2)}
                                </div>
                                <span className={`text-[9px] px-2 py-0.5 ${statusColor[brand.status] || statusColor.Hiatus}`}>
                                    {brand.status}
                                </span>
                            </div>

                            <h3 className="text-sm font-medium">{brand.name}</h3>
                            <p className="text-[10px] mt-0.5" style={{ color: "var(--tn-text-sub)" }}>{brand.category}</p>
                            {brand.domain && <p className="text-[10px] mt-0.5" style={{ color: "var(--tn-text-muted)" }}>{brand.domain}</p>}

                            {brand.tagline && (
                                <p className="text-xs mt-2 italic" style={{ color: "var(--tn-text-sub)" }}>&ldquo;{brand.tagline}&rdquo;</p>
                            )}

                            <p className="text-xs mt-2 line-clamp-2" style={{ color: "var(--tn-text-muted)" }}>{brand.description}</p>

                            <div className="flex flex-wrap gap-1 mt-3">
                                {brand.tags.slice(0, 4).map(tag => (
                                    <span key={tag} className="text-[8px] px-1.5 py-0.5 border" style={{ borderColor: "var(--tn-border)", color: "var(--tn-text-sub)" }}>{tag}</span>
                                ))}
                            </div>

                            {brand.websiteUrl && (
                                <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center gap-1 text-xs hover:opacity-70 transition" style={{ color: "var(--tn-text-sub)" }}>
                                    Visit <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
