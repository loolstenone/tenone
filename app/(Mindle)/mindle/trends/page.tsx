"use client";

import { useState } from "react";
import { TrendingUp, Clock, Eye, Bookmark, Search, Filter } from "lucide-react";
import Link from "next/link";

const categories = ["All", "AI/Tech", "Marketing", "Consumer", "Business", "Content", "Lifestyle"];
const statusFilter = ["All", "Trending", "Rising", "Signal"];

const statusBadge: Record<string, { label: string; color: string }> = {
    trending: { label: "Trending", color: "bg-[#F5C518] text-black" },
    rising: { label: "Rising", color: "bg-orange-500/20 text-orange-400" },
    signal: { label: "Signal", color: "bg-blue-500/20 text-blue-400" },
    fading: { label: "Fading", color: "bg-neutral-700 text-neutral-400" },
};

const trends = [
    { id: "t1", title: "How Agent AI Is Transforming the Way We Work — New Productivity in 2026", excerpt: "Beyond simple chatbots, autonomous AI agents are accelerating enterprise adoption and reshaping workflows.", category: "AI/Tech", status: "trending", date: "2026.03.26", readTime: "8 min", views: 3420 },
    { id: "t2", title: "Short-Form Fatigue and the Rise of 'Slow Content'", excerpt: "As TikTok/Reels dwell time slows, podcasts and long-form video are making a comeback.", category: "Content", status: "rising", date: "2026.03.25", readTime: "6 min", views: 2180 },
    { id: "t3", title: "The Hyperlocal Business Playbook for Global Expansion", excerpt: "When a neighborhood shop becomes a global brand. Analyzing local-to-global success patterns.", category: "Business", status: "trending", date: "2026.03.24", readTime: "5 min", views: 1890 },
    { id: "t4", title: "Digital Detox = The New Luxury?", excerpt: "The paradox of unplugging becoming premium consumption. Related search trends surging.", category: "Lifestyle", status: "signal", date: "2026.03.23", readTime: "4 min", views: 987 },
    { id: "t5", title: "Gen Z Values-Based Spending Deepens — How Brands Are Responding", excerpt: "Experience-first, values-driven spending patterns spreading across all generations. Cross-analysis of SNS + consumer data.", category: "Consumer", status: "trending", date: "2026.03.22", readTime: "7 min", views: 2650 },
    { id: "t6", title: "Spatial Computing: How Far From Mainstream?", excerpt: "A wave of new devices sparks debate on mass adoption. Penetration rates and app ecosystem analysis.", category: "AI/Tech", status: "signal", date: "2026.03.21", readTime: "9 min", views: 1540 },
    { id: "t7", title: "The Micro-SaaS Boom — The Age of Solo Developers", excerpt: "AI-powered rapid MVPs targeting niche markets. Indie hacker success stories analyzed.", category: "Business", status: "rising", date: "2026.03.20", readTime: "6 min", views: 2100 },
    { id: "t8", title: "AI Copywriting Limitations & the Human+AI Collaboration Model", excerpt: "Initial hype gives way to quality concerns. The shift toward collaborative models.", category: "Marketing", status: "fading", date: "2026.03.19", readTime: "5 min", views: 1230 },
    { id: "t9", title: "Experience-Based Consumption Data — We Now Buy Experiences", excerpt: "Experiences over ownership. Data on experiential spending expanding across all demographics.", category: "Consumer", status: "rising", date: "2026.03.18", readTime: "6 min", views: 1856 },
    { id: "t10", title: "Creator Economy x Local = A New Formula", excerpt: "How locally-rooted creators are building global fanbases.", category: "Content", status: "signal", date: "2026.03.17", readTime: "5 min", views: 890 },
];

export default function MindleTrendsPage() {
    const [selectedCat, setSelectedCat] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = trends.filter(t => {
        const matchCat = selectedCat === "All" || t.category === selectedCat;
        const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-16 sm:py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Trends</h1>
                    <p className="text-neutral-400 mb-8">Trend insights combining AI-detected signals with expert analysis.</p>

                    {/* Search + Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input type="text" placeholder="Search trends..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F5C518]/50" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map((cat) => (
                            <button key={cat} onClick={() => setSelectedCat(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === cat ? "bg-[#F5C518] text-black" : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Trend Card Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filtered.map((t) => (
                            <article key={t.id} className="group rounded-2xl border border-neutral-800 bg-neutral-900/30 overflow-hidden hover:border-[#F5C518]/30 transition-all duration-300">
                                <div className="h-40 bg-gradient-to-br from-neutral-800/30 to-neutral-900 flex items-center justify-center">
                                    <TrendingUp className="w-10 h-10 text-neutral-700/50" />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[t.status].color}`}>
                                            {statusBadge[t.status].label}
                                        </span>
                                        <span className="text-[10px] text-neutral-500">{t.category}</span>
                                    </div>
                                    <h3 className="text-white font-bold mb-2 group-hover:text-[#F5C518] transition-colors leading-snug">{t.title}</h3>
                                    <p className="text-neutral-400 text-sm line-clamp-2 mb-3">{t.excerpt}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                                        <span>{t.date}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.readTime}</span>
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{t.views.toLocaleString()}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
