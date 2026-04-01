"use client";

import { useState } from "react";
import { historyEvents, brands } from "@/lib/data";

const years = [...new Set(historyEvents.map(e => e.year))].sort();

export default function HistoryPage() {
    const [yearFilter, setYearFilter] = useState('All');
    const filtered = yearFilter === 'All' ? historyEvents : historyEvents.filter(e => e.year === yearFilter);
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

    const getBrandName = (brandId?: string) => brandId ? brands.find(b => b.id === brandId)?.name : undefined;

    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--tn-bg)", color: "var(--tn-text)" }}>
            {/* Hero */}
            <section className="pt-16 pb-10 px-6 text-center">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] mb-3" style={{ color: "var(--tn-text-sub)" }}>HISTORY</p>
                    <h1 className="text-3xl md:text-4xl font-black mb-3">Universe Chronicle</h1>
                    <p className="text-sm max-w-2xl mx-auto" style={{ color: "var(--tn-text-sub)" }}>
                        유니버스 연대기 — Ten:One™이 걸어온 발자취
                    </p>
                </div>
            </section>

            {/* 연도 필터 */}
            <div className="px-6 pb-10">
                <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => setYearFilter('All')}
                        className="px-4 py-1.5 text-sm transition-colors border"
                        style={{
                            backgroundColor: yearFilter === 'All' ? "var(--tn-text)" : "transparent",
                            color: yearFilter === 'All' ? "var(--tn-bg)" : "var(--tn-text-sub)",
                            borderColor: yearFilter === 'All' ? "var(--tn-text)" : "var(--tn-border)",
                        }}>
                        All
                    </button>
                    {years.map(year => (
                        <button key={year} onClick={() => setYearFilter(year)}
                            className="px-4 py-1.5 text-sm transition-colors border"
                            style={{
                                backgroundColor: yearFilter === year ? "var(--tn-text)" : "transparent",
                                color: yearFilter === year ? "var(--tn-bg)" : "var(--tn-text-sub)",
                                borderColor: yearFilter === year ? "var(--tn-text)" : "var(--tn-border)",
                            }}>
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            {/* 타임라인 */}
            <section className="px-6 pb-24">
                <div className="max-w-3xl mx-auto">
                    <div className="relative border-l-2 ml-4 md:ml-8 space-y-8" style={{ borderColor: "var(--tn-border)" }}>
                        {sorted.map((event) => {
                            const brandName = getBrandName(event.brandId);
                            return (
                                <div key={event.id} className="relative pl-8 md:pl-12 group">
                                    {/* Dot */}
                                    <div
                                        className="absolute -left-[9px] top-1 h-4 w-4 border-2 transition-colors"
                                        style={{ borderColor: "var(--tn-text)", backgroundColor: "var(--tn-bg)" }}
                                    />

                                    {/* Date */}
                                    <p className="text-xs font-mono mb-1" style={{ color: "var(--tn-text-sub)" }}>{event.date}</p>

                                    {/* Card */}
                                    <div className="border p-5 transition-colors" style={{ borderColor: "var(--tn-border)", backgroundColor: "var(--tn-surface)" }}>
                                        <h3 className="text-base font-semibold">{event.title}</h3>
                                        <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--tn-text-sub)" }}>{event.description}</p>
                                        {brandName && (
                                            <span className="inline-block mt-3 text-xs px-2.5 py-0.5 border" style={{ borderColor: "var(--tn-border)", color: "var(--tn-text-sub)" }}>
                                                {brandName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
