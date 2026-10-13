"use client";

import { useState, useMemo } from "react";
import { Award, Filter } from "lucide-react";

export type Portfolio = {
    id: string;
    title: string;
    team: string;
    gen: string;
    gen_num: number;
    category: string;
    client: string;
    description: string;
    tags: string[];
    award: string | null;
    gradient: string;
};

const ALL = "전체";

export default function PortfolioGrid({ items }: { items: Portfolio[] }) {
    const [selectedCat, setSelectedCat] = useState(ALL);
    const [selectedGen, setSelectedGen] = useState(ALL);

    const categories = useMemo(() => {
        const set = new Set(items.map(i => i.category));
        return [ALL, ...Array.from(set)];
    }, [items]);

    const generations = useMemo(() => {
        const seen = new Map<string, number>();
        for (const i of items) seen.set(i.gen, i.gen_num);
        const list = Array.from(seen.entries()).sort((a, b) => b[1] - a[1]).map(([g]) => g);
        return [ALL, ...list];
    }, [items]);

    const filtered = items.filter(p => {
        const catMatch = selectedCat === ALL || p.category === selectedCat;
        const genMatch = selectedGen === ALL || p.gen === selectedGen;
        return catMatch && genMatch;
    });

    return (
        <>
            {/* Filter */}
            <section className="border-b border-neutral-200 sticky top-16 bg-white z-30 shadow-sm">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex items-center gap-6 py-4">
                        <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
                            <Filter className="h-4 w-4 text-neutral-400 shrink-0" />
                            {generations.map(gen => (
                                <button
                                    key={gen}
                                    onClick={() => setSelectedGen(gen)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${selectedGen === gen ? "bg-[#1a1a2e] text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
                                >
                                    {gen}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-6 bg-neutral-200 shrink-0" />

                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCat(cat)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${selectedCat === cat ? "bg-[#4361ee] text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Results count */}
            <section className="pt-6 pb-2">
                <div className="mx-auto max-w-5xl px-6">
                    <p className="text-sm text-neutral-400">
                        {filtered.length}개 프로젝트
                        {selectedGen !== ALL && ` · ${selectedGen}`}
                        {selectedCat !== ALL && ` · ${selectedCat}`}
                    </p>
                </div>
            </section>

            {/* Grid */}
            <section className="py-8 pb-16 md:pb-24">
                <div className="mx-auto max-w-5xl px-6">
                    {filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-neutral-400 text-lg">해당 조건에 맞는 프로젝트가 없습니다</p>
                            <button
                                onClick={() => { setSelectedCat(ALL); setSelectedGen(ALL); }}
                                className="mt-4 text-sm text-[#4361ee] hover:underline"
                            >
                                필터 초기화
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map(p => (
                                <div key={p.id} className="group border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#4361ee]/20 transition-all">
                                    <div className={`aspect-video bg-gradient-to-br ${p.gradient} relative flex items-center justify-center overflow-hidden`}>
                                        <div className="text-center z-10">
                                            <span className="text-white/90 text-xl md:text-2xl font-black drop-shadow-sm">{p.team}</span>
                                            <p className="text-white/60 text-xs mt-1">{p.client}</p>
                                        </div>
                                        {p.award && (
                                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-[10px] font-bold">
                                                <Award className="h-3 w-3" />
                                                {p.award}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] px-2 py-0.5 bg-[#4361ee]/10 text-[#4361ee] rounded font-medium">{p.category}</span>
                                            <span className="text-[10px] px-2 py-0.5 bg-[#1a1a2e]/10 text-[#1a1a2e] rounded font-medium">{p.gen}</span>
                                            <span className="text-[10px] text-neutral-400 ml-auto">{p.client}</span>
                                        </div>
                                        <h3 className="font-bold text-[15px] mb-2 group-hover:text-[#4361ee] transition-colors line-clamp-2">{p.title}</h3>
                                        <p className="text-neutral-500 text-sm mb-4 line-clamp-2">{p.description}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {p.tags.map(tag => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
