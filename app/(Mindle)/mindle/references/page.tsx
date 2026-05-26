"use client";

import { useState } from "react";
import { ExternalLink, Star, Bookmark, Globe, Newspaper, Radio, Pen } from "lucide-react";

const categories = ["전체", "뉴스레터", "미디어", "도구", "커뮤니티", "리서치"];
const categoryMap: Record<string, string> = {
    "전체": "All",
    "뉴스레터": "Newsletter",
    "미디어": "Media",
    "도구": "Tool",
    "커뮤니티": "Community",
    "리서치": "Research",
};

const references = [
    { id: "r1", name: "TrendHunter", url: "trendhunter.com", desc: "World's largest trend platform. AI-powered innovation and consumer insights.", category: "Media", featured: true, tags: ["AI", "Innovation"] },
    { id: "r2", name: "Careet", url: "careet.net", desc: "Korean Gen MZ insight media. Covers youth culture, consumption, and brand trends.", category: "Media", featured: true, tags: ["Gen Z", "Korea"] },
    { id: "r3", name: "WGSN", url: "wgsn.com", desc: "Global trend forecasting. Industry-leading color, material, and consumer forecasts.", category: "Research", featured: false, tags: ["Forecasting", "Fashion"] },
    { id: "r4", name: "Morning Brew", url: "morningbrew.com", desc: "Daily business newsletter read by 4M+ professionals. Sharp, concise business news.", category: "Newsletter", featured: true, tags: ["Business", "Daily"] },
    { id: "r5", name: "Exploding Topics", url: "explodingtopics.com", desc: "Surface rapidly growing topics before they go mainstream. Data-driven trend discovery.", category: "Tool", featured: false, tags: ["Data", "Keywords"] },
    { id: "r6", name: "The Hustle", url: "thehustle.co", desc: "Tech and business trends for entrepreneurs. Irreverent voice, serious insights.", category: "Newsletter", featured: false, tags: ["Startup", "Tech"] },
    { id: "r7", name: "Some Trend", url: "some.co.kr", desc: "Korean social media trend analysis. Real-time keyword and sentiment tracking.", category: "Tool", featured: true, tags: ["Social", "Korea"] },
    { id: "r8", name: "CB Insights", url: "cbinsights.com", desc: "Tech market intelligence. Venture capital, startup, and industry analysis.", category: "Research", featured: false, tags: ["VC", "Startup"] },
    { id: "r9", name: "Product Hunt", url: "producthunt.com", desc: "Discover the best new products daily. Early signal for tech and consumer trends.", category: "Community", featured: false, tags: ["Product", "Launch"] },
    { id: "r10", name: "Trend Monitor", url: "trendmonitor.co.kr", desc: "Korean consumer research platform. Survey-based trend analysis since 1998.", category: "Research", featured: false, tags: ["Consumer", "Korea"] },
    { id: "r11", name: "Dense Discovery", url: "densediscovery.com", desc: "Weekly newsletter on design, tech, sustainability, and culture. Thoughtful curation.", category: "Newsletter", featured: false, tags: ["Design", "Culture"] },
    { id: "r12", name: "Indie Hackers", url: "indiehackers.com", desc: "Community for bootstrapped founders sharing revenue, strategies, and lessons.", category: "Community", featured: false, tags: ["Indie", "SaaS"] },
];

const catIcons: Record<string, React.ElementType> = {
    Newsletter: Pen,
    Media: Newspaper,
    Tool: Star,
    Community: Radio,
    Research: Globe,
};

export default function MindleReferencesPage() {
    const [selectedCat, setSelectedCat] = useState("전체");

    const filtered = selectedCat === "전체" ? references : references.filter(r => r.category === categoryMap[selectedCat]);
    const featuredRefs = references.filter(r => r.featured);

    return (
        <div className="bg-[#0A0A0A]">
            <div className="mx-auto max-w-5xl px-6">
                {/* Header */}
                <section className="py-8 border-b border-neutral-800/50">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">레퍼런스</h1>
                    <p className="text-neutral-500 text-sm">트렌드 인텔리전스를 위해 추적하고 추천하는 엄선된 소스.</p>
                    <p className="mt-2 text-[11px] inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                        📚 Mindle 편집팀이 직접 검증한 외부 리소스 큐레이션 (자동 분석 결과 아님)
                    </p>
                </section>

                {/* Featured */}
                <section className="py-6 border-b border-neutral-800/30">
                    <h2 className="text-xs font-bold text-neutral-500 tracking-wider mb-4">에디터 픽</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {featuredRefs.map(r => (
                            <a key={r.id} href={`https://${r.url}`} target="_blank" rel="noopener noreferrer"
                                className="group bg-neutral-900/30 border border-neutral-800/50 rounded-xl p-4 hover:border-[#F5C518]/30 transition-all">
                                <div className="flex items-center gap-2 mb-2">
                                    <Bookmark className="w-3 h-3 text-[#F5C518]" />
                                    <span className="text-white font-bold text-sm group-hover:text-[#F5C518] transition-colors">{r.name}</span>
                                </div>
                                <p className="text-neutral-500 text-[11px] leading-relaxed line-clamp-2 mb-2">{r.desc}</p>
                                <span className="text-[10px] text-neutral-600 flex items-center gap-1">
                                    {r.url} <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Filters */}
                <section className="py-5 border-b border-neutral-800/30">
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCat(cat)}
                                className={`px-3 py-1 rounded text-[11px] font-semibold tracking-wide transition-colors ${
                                    selectedCat === cat ? "bg-white text-black" : "text-neutral-500 hover:text-white"
                                }`}>
                                {cat.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </section>

                {/* All References */}
                <section className="py-6">
                    <div className="divide-y divide-neutral-800/30">
                        {filtered.map(r => {
                            const CatIcon = catIcons[r.category] || Globe;
                            return (
                                <a key={r.id} href={`https://${r.url}`} target="_blank" rel="noopener noreferrer"
                                    className="group flex items-start gap-4 py-4 cursor-pointer">
                                    <div className="w-9 h-9 shrink-0 rounded-lg bg-neutral-900 border border-neutral-800/50 flex items-center justify-center group-hover:border-[#F5C518]/30 transition-colors">
                                        <CatIcon className="w-4 h-4 text-neutral-600 group-hover:text-[#F5C518] transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-white font-bold text-sm group-hover:text-[#F5C518] transition-colors">{r.name}</span>
                                            <span className="text-[10px] text-neutral-700">{Object.entries(categoryMap).find(([,v])=>v===r.category)?.[0] || r.category}</span>
                                            {r.featured && <Star className="w-2.5 h-2.5 text-[#F5C518]" />}
                                        </div>
                                        <p className="text-neutral-500 text-[12px] leading-relaxed mb-1.5 line-clamp-1">{r.desc}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-neutral-600 flex items-center gap-1">{r.url} <ExternalLink className="w-2.5 h-2.5" /></span>
                                            {r.tags.map(tag => (
                                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800/50 text-neutral-500">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
