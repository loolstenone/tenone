"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Eye, Search, LayoutGrid, List, ArrowUpRight } from "lucide-react";
import { featured, trends, categories, statusBadge } from "@/lib/mindle/trend-data";

export default function MindleTrendsPage() {
    const [selectedCat, setSelectedCat] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    const filtered = trends.filter(t => {
        const matchCat = selectedCat === "All" || t.category === selectedCat;
        const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="bg-[#0A0A0A]">
            <div className="mx-auto max-w-5xl px-6">
                {/* Featured Article */}
                <section className="py-8 border-b border-neutral-800/50">
                    <Link href={`/mindle/trends/${featured.id}`} className="grid grid-cols-1 lg:grid-cols-5 gap-6 group">
                        <div className="lg:col-span-3 h-56 sm:h-72 rounded-xl bg-gradient-to-br from-neutral-800/40 to-neutral-900 flex items-center justify-center">
                            <div className="text-center text-neutral-700">
                                <div className="text-4xl mb-1">📊</div>
                                <span className="text-xs">Featured</span>
                            </div>
                        </div>
                        <div className="lg:col-span-2 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusBadge[featured.status].color}`}>
                                    {statusBadge[featured.status].label}
                                </span>
                                <span className="text-[11px] text-neutral-500">{featured.category}</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-3 group-hover:text-[#F5C518] transition-colors">
                                {featured.title}
                            </h1>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-3">{featured.excerpt}</p>
                            <div className="flex items-center gap-4 text-[11px] text-neutral-500">
                                <span className="text-neutral-300 font-medium">{featured.author}</span>
                                <span>{featured.date}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readTime}</span>
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{featured.views.toLocaleString()}</span>
                            </div>
                        </div>
                    </Link>
                </section>

                {/* Filters */}
                <section className="py-5 border-b border-neutral-800/30 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex flex-wrap gap-1.5 flex-1">
                        {categories.map((cat) => (
                            <button key={cat} onClick={() => setSelectedCat(cat)}
                                className={`px-3 py-1 rounded text-[11px] font-semibold tracking-wide transition-colors ${
                                    selectedCat === cat
                                        ? "bg-white text-black"
                                        : "text-neutral-500 hover:text-white"
                                }`}>
                                {cat.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-[12px] text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600 w-40" />
                        </div>
                        <div className="flex border border-neutral-800 rounded overflow-hidden">
                            <button onClick={() => setViewMode("list")} className={`p-1.5 ${viewMode === "list" ? "bg-neutral-800 text-white" : "text-neutral-600"}`}>
                                <List className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setViewMode("grid")} className={`p-1.5 ${viewMode === "grid" ? "bg-neutral-800 text-white" : "text-neutral-600"}`}>
                                <LayoutGrid className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Articles */}
                <section className="py-6">
                    {viewMode === "list" ? (
                        <div className="divide-y divide-neutral-800/40">
                            {filtered.map((t) => (
                                <Link key={t.id} href={`/mindle/trends/${t.id}`}>
                                    <article className="group py-5 flex gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusBadge[t.status].color}`}>
                                                    {statusBadge[t.status].label}
                                                </span>
                                                <span className="text-[10px] text-neutral-600 font-medium">{t.category.toUpperCase()}</span>
                                                <span className="text-[10px] text-neutral-700">{t.date}</span>
                                            </div>
                                            <h3 className="text-white font-bold text-[15px] leading-snug mb-1.5 group-hover:text-[#F5C518] transition-colors">
                                                {t.title}
                                            </h3>
                                            <p className="text-neutral-500 text-[13px] line-clamp-1 mb-2">{t.excerpt}</p>
                                            <div className="flex items-center gap-3 text-[10px] text-neutral-600">
                                                <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{t.readTime}</span>
                                                <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{t.views.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block w-28 h-20 shrink-0 rounded-lg bg-neutral-900 border border-neutral-800/50 group-hover:border-[#F5C518]/20 transition-colors" />
                                    </article>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map((t) => (
                                <Link key={t.id} href={`/mindle/trends/${t.id}`}>
                                    <article className="group rounded-xl border border-neutral-800/50 bg-neutral-900/20 overflow-hidden hover:border-[#F5C518]/30 transition-all">
                                        <div className="h-36 bg-gradient-to-br from-neutral-800/30 to-neutral-900 flex items-center justify-center">
                                            <ArrowUpRight className="w-6 h-6 text-neutral-800 group-hover:text-[#F5C518]/30 transition-colors" />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusBadge[t.status].color}`}>
                                                    {statusBadge[t.status].label}
                                                </span>
                                                <span className="text-[10px] text-neutral-600">{t.category}</span>
                                            </div>
                                            <h3 className="text-white font-bold text-sm leading-snug mb-2 group-hover:text-[#F5C518] transition-colors line-clamp-2">{t.title}</h3>
                                            <p className="text-neutral-500 text-[12px] line-clamp-2 mb-2">{t.excerpt}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-neutral-600">
                                                <span>{t.date}</span>
                                                <span>{t.readTime}</span>
                                                <span>{t.views.toLocaleString()} views</span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}

                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-neutral-600">
                            <p className="text-sm">No trends match your filter.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
