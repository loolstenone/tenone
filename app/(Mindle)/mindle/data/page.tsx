"use client";

import { BarChart3, TrendingUp, TrendingDown, Search, Zap } from "lucide-react";

const keywords = [
    { rank: 1, keyword: "Agent AI", volume: 12400, change: "+340%", up: true, platforms: ["Kakao", "Community", "News"] },
    { rank: 2, keyword: "Slow Content", volume: 8200, change: "+180%", up: true, platforms: ["Community", "News"] },
    { rank: 3, keyword: "Hyperlocal", volume: 6800, change: "+120%", up: true, platforms: ["Kakao", "News"] },
    { rank: 4, keyword: "Digital Detox", volume: 5100, change: "+95%", up: true, platforms: ["Community"] },
    { rank: 5, keyword: "Micro-SaaS", volume: 4300, change: "+75%", up: true, platforms: ["Discord", "News"] },
    { rank: 6, keyword: "Experiential Spending", volume: 3900, change: "+60%", up: true, platforms: ["Kakao", "Community"] },
    { rank: 7, keyword: "Spatial Computing", volume: 3200, change: "+45%", up: true, platforms: ["News"] },
    { rank: 8, keyword: "Creator Economy", volume: 2800, change: "+30%", up: true, platforms: ["Community"] },
    { rank: 9, keyword: "Gen Z Values", volume: 2400, change: "+25%", up: true, platforms: ["Kakao", "News"] },
    { rank: 10, keyword: "AI Copywriting", volume: 2100, change: "-15%", up: false, platforms: ["Kakao"] },
];

const platformStats = [
    { name: "Kakao Open Chat", count: 847, pct: 60.8, color: "#F5C518" },
    { name: "Discord", count: 356, pct: 25.5, color: "#5865F2" },
    { name: "Web Communities", count: 124, pct: 8.9, color: "#00C853" },
    { name: "News / RSS", count: 67, pct: 4.8, color: "#FF6B6B" },
];

export default function MindleDataPage() {
    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-16 sm:py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-[#F5C518]" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">Data</h1>
                    </div>
                    <p className="text-neutral-400 mb-8">Cross-platform keyword analysis and real-time trend data</p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Keyword Rankings */}
                        <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
                            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-[#F5C518]" /> Keyword TOP 10
                            </h2>
                            <div className="space-y-2">
                                {keywords.map((kw) => (
                                    <div key={kw.rank} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-800/30 transition-colors">
                                        <span className={`w-6 text-center text-sm font-bold ${kw.rank <= 3 ? "text-[#F5C518]" : "text-neutral-500"}`}>{kw.rank}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-sm font-medium">{kw.keyword}</span>
                                                <div className="flex gap-1">
                                                    {kw.platforms.map(p => (
                                                        <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-500">{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-neutral-500 font-mono">{kw.volume.toLocaleString()}</span>
                                        <span className={`text-xs font-mono font-bold ${kw.up ? "text-green-400" : "text-red-400"}`}>
                                            {kw.up ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />} {kw.change}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Collection by Platform */}
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6">
                            <h2 className="text-white font-semibold mb-4">Collection by Platform</h2>
                            <div className="space-y-4">
                                {platformStats.map((p) => (
                                    <div key={p.name}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-neutral-300 text-sm">{p.name}</span>
                                            <span className="text-neutral-500 text-xs font-mono">{p.count}</span>
                                        </div>
                                        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-4 border-t border-neutral-800">
                                <h3 className="text-xs text-neutral-500 mb-3">Collected Today</h3>
                                <div className="text-3xl font-bold text-white">1,394<span className="text-sm text-neutral-500 font-normal ml-1">items</span></div>
                                <p className="text-xs text-neutral-500 mt-1">From 28 sources</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
