"use client";

import { useState } from "react";
import { Clock, Eye, Search, LayoutGrid, List, ArrowUpRight } from "lucide-react";

const categories = ["All", "AI / Tech", "Marketing", "Consumer", "Business", "Content", "Lifestyle"];

const statusBadge: Record<string, { label: string; color: string }> = {
    trending: { label: "TRENDING", color: "bg-[#F5C518] text-black" },
    rising: { label: "RISING", color: "bg-orange-500/20 text-orange-400" },
    signal: { label: "SIGNAL", color: "bg-blue-500/20 text-blue-400" },
    fading: { label: "FADING", color: "bg-neutral-700 text-neutral-400" },
};

const featured = {
    id: "f1",
    title: "How Agent AI Is Reshaping the Way We Work — The New Productivity of 2026",
    excerpt: "Beyond simple chatbots, autonomous agent AIs are now executing tasks independently. We analyze why enterprise adoption is accelerating and how real workflows are transforming across industries from finance to creative production.",
    category: "AI / Tech",
    status: "trending",
    date: "Mar 26, 2026",
    readTime: "8 min",
    views: 3420,
    author: "Mindle AI",
};

const trends = [
    { id: "t2", title: "Short-Form Fatigue and the Rise of 'Slow Content'", excerpt: "As TikTok/Reels dwell time slows, podcasts and long-form video are making a comeback.", category: "Content", status: "rising", date: "Mar 25", readTime: "6 min", views: 2180 },
    { id: "t3", title: "The Hyperlocal Business Playbook for Global Expansion", excerpt: "When a neighborhood shop becomes a global brand. Analyzing local-to-global success patterns.", category: "Business", status: "trending", date: "Mar 24", readTime: "5 min", views: 1890 },
    { id: "t4", title: "Digital Detox = The New Luxury?", excerpt: "The paradox of unplugging becoming premium consumption.", category: "Lifestyle", status: "signal", date: "Mar 23", readTime: "4 min", views: 987 },
    { id: "t5", title: "Gen Z Values-Based Spending — How Brands Adapt", excerpt: "Experience-first, values-driven spending patterns spreading across all generations.", category: "Consumer", status: "trending", date: "Mar 22", readTime: "7 min", views: 2650 },
    { id: "t6", title: "Spatial Computing: How Far From Mainstream?", excerpt: "A wave of new devices sparks debate on mass adoption. Penetration and app ecosystem analysis.", category: "AI / Tech", status: "signal", date: "Mar 21", readTime: "9 min", views: 1540 },
    { id: "t7", title: "The Micro-SaaS Boom — Era of the Solo Developer", excerpt: "AI-powered rapid MVPs targeting niche markets. Indie hacker success stories analyzed.", category: "Business", status: "rising", date: "Mar 20", readTime: "6 min", views: 2100 },
    { id: "t8", title: "AI Copywriting's Limits & Human+AI Collaboration", excerpt: "Initial hype gives way to quality concerns. The shift toward collaborative models.", category: "Marketing", status: "fading", date: "Mar 19", readTime: "5 min", views: 1230 },
    { id: "t9", title: "Experience Economy — We Now Buy Experiences", excerpt: "Experiences over ownership. Experiential spending data expanding across all demographics.", category: "Consumer", status: "rising", date: "Mar 18", readTime: "6 min", views: 1856 },
    { id: "t10", title: "Creator Economy × Local = A New Formula", excerpt: "How locally-rooted creators are building global fanbases through authenticity.", category: "Content", status: "signal", date: "Mar 17", readTime: "5 min", views: 890 },
    { id: "t11", title: "Subscription Fatigue: The Return of Bundling", excerpt: "Consumers hit subscription limits. Platforms respond with super-bundles and flexible tiers.", category: "Business", status: "rising", date: "Mar 16", readTime: "4 min", views: 1340 },
    { id: "t12", title: "AI-Generated UGC: Authenticity Crisis", excerpt: "When AI creates user content, trust collapses. Platforms scramble for verification.", category: "Marketing", status: "signal", date: "Mar 15", readTime: "7 min", views: 1678 },
];

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
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
                            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-3 hover:text-[#F5C518] transition-colors cursor-pointer">
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
                    </div>
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
                                <article key={t.id} className="group py-5 flex gap-4 cursor-pointer">
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
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filtered.map((t) => (
                                <article key={t.id} className="group rounded-xl border border-neutral-800/50 bg-neutral-900/20 overflow-hidden hover:border-[#F5C518]/30 transition-all cursor-pointer">
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
