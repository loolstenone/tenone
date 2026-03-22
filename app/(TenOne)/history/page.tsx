"use client";

import { useState } from "react";
import { historyEvents, brands } from "@/lib/data";
import { Clock } from "lucide-react";

const years = [...new Set(historyEvents.map(e => e.year))].sort();

export default function HistoryPage() {
    const [yearFilter, setYearFilter] = useState('All');
    const filtered = yearFilter === 'All' ? historyEvents : historyEvents.filter(e => e.year === yearFilter);
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

    const getBrandName = (brandId?: string) => brandId ? brands.find(b => b.id === brandId)?.name : undefined;

    return (
        <div className="space-y-12">
            <section className="pt-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white">History</h1>
                <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
                    Universe&apos;s Chronicle — 유니버스 연대기
                </p>
            </section>

            <div className="flex justify-center gap-2">
                <button onClick={() => setYearFilter('All')}
                    className={`px-4 py-1.5 rounded-full text-sm transition-colors ${yearFilter === 'All' ? 'bg-indigo-600 text-white' : 'border border-zinc-700 text-zinc-400 hover:text-white'}`}>
                    All
                </button>
                {years.map(year => (
                    <button key={year} onClick={() => setYearFilter(year)}
                        className={`px-4 py-1.5 rounded-full text-sm transition-colors ${yearFilter === year ? 'bg-indigo-600 text-white' : 'border border-zinc-700 text-zinc-400 hover:text-white'}`}>
                        {year}
                    </button>
                ))}
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="relative border-l-2 border-zinc-800 ml-4 md:ml-8 space-y-8">
                    {sorted.map((event) => {
                        const brandName = getBrandName(event.brandId);
                        return (
                            <div key={event.id} className="relative pl-8 md:pl-12 group">
                                {/* Dot */}
                                <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-indigo-500 bg-black group-hover:bg-indigo-500 transition-colors" />

                                {/* Date */}
                                <p className="text-xs font-mono text-indigo-400 mb-1">{event.date}</p>

                                {/* Card */}
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-600 transition-colors">
                                    <h3 className="text-base font-semibold text-white">{event.title}</h3>
                                    <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{event.description}</p>
                                    {brandName && (
                                        <span className="inline-block mt-3 text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                                            {brandName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
