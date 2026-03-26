"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, BarChart3, Zap, Globe, MessageSquare, Radio, Newspaper } from "lucide-react";

const periods = ["24H", "7D", "30D", "90D"];

const keywords = [
    { rank: 1, keyword: "Agent AI", volume: 12840, change: 340, status: "trending", category: "AI / Tech" },
    { rank: 2, keyword: "Slow Content", volume: 8920, change: 180, status: "rising", category: "Content" },
    { rank: 3, keyword: "Hyperlocal", volume: 7650, change: 120, status: "trending", category: "Business" },
    { rank: 4, keyword: "Digital Detox", volume: 6430, change: 95, status: "rising", category: "Lifestyle" },
    { rank: 5, keyword: "Micro SaaS", volume: 5870, change: 75, status: "rising", category: "Business" },
    { rank: 6, keyword: "Gen Z Values", volume: 5210, change: 62, status: "trending", category: "Consumer" },
    { rank: 7, keyword: "Spatial Computing", volume: 4890, change: 45, status: "signal", category: "AI / Tech" },
    { rank: 8, keyword: "AI UGC", volume: 4320, change: 38, status: "signal", category: "Marketing" },
    { rank: 9, keyword: "Voice Commerce", volume: 3760, change: -12, status: "fading", category: "Business" },
    { rank: 10, keyword: "Creator Local", volume: 3210, change: 28, status: "signal", category: "Content" },
    { rank: 11, keyword: "Subscription Fatigue", volume: 2980, change: 15, status: "rising", category: "Consumer" },
    { rank: 12, keyword: "Trust Economy", volume: 2540, change: 52, status: "signal", category: "Marketing" },
    { rank: 13, keyword: "Experience Economy", volume: 2310, change: -5, status: "fading", category: "Consumer" },
    { rank: 14, keyword: "Super Bundle", volume: 1980, change: 88, status: "rising", category: "Business" },
    { rank: 15, keyword: "AI Verification", volume: 1760, change: 110, status: "signal", category: "AI / Tech" },
];

const platforms = [
    { name: "Web / Communities", icon: Globe, collected: 3240, active: true },
    { name: "Kakao Open Chat", icon: MessageSquare, collected: 1856, active: true },
    { name: "Discord", icon: Radio, collected: 2410, active: true },
    { name: "News / RSS", icon: Newspaper, collected: 4120, active: true },
];

const statusColor: Record<string, string> = {
    trending: "text-[#F5C518]",
    rising: "text-orange-400",
    signal: "text-blue-400",
    fading: "text-neutral-500",
};

const statusBg: Record<string, string> = {
    trending: "bg-[#F5C518]/10",
    rising: "bg-orange-500/10",
    signal: "bg-blue-500/10",
    fading: "bg-neutral-800/50",
};

export default function MindleDataPage() {
    const [period, setPeriod] = useState("7D");

    const totalCollected = platforms.reduce((s, p) => s + p.collected, 0);

    return (
        <div className="bg-[#0A0A0A]">
            <div className="mx-auto max-w-5xl px-6">
                {/* Header */}
                <section className="py-8 border-b border-neutral-800/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Data</h1>
                            <p className="text-neutral-500 text-sm">Real-time keyword tracking across multiple platforms.</p>
                        </div>
                        <div className="flex border border-neutral-800 rounded-lg overflow-hidden">
                            {periods.map(p => (
                                <button key={p} onClick={() => setPeriod(p)}
                                    className={`px-3 py-1.5 text-[11px] font-semibold transition-colors ${period === p ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Cards */}
                <section className="py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-neutral-800/30">
                    <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-4">
                        <div className="text-[10px] text-neutral-500 font-semibold tracking-wider mb-1">KEYWORDS TRACKED</div>
                        <div className="text-2xl font-bold text-white">{keywords.length}</div>
                    </div>
                    <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-4">
                        <div className="text-[10px] text-neutral-500 font-semibold tracking-wider mb-1">TOTAL MENTIONS</div>
                        <div className="text-2xl font-bold text-white">{totalCollected.toLocaleString()}</div>
                    </div>
                    <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-4">
                        <div className="text-[10px] text-neutral-500 font-semibold tracking-wider mb-1">TRENDING</div>
                        <div className="text-2xl font-bold text-[#F5C518]">{keywords.filter(k => k.status === "trending").length}</div>
                    </div>
                    <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-4">
                        <div className="text-[10px] text-neutral-500 font-semibold tracking-wider mb-1">PLATFORMS</div>
                        <div className="text-2xl font-bold text-white">{platforms.length}</div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
                    {/* Keyword Table — Left 2/3 */}
                    <div className="lg:col-span-2">
                        <h2 className="text-xs font-bold text-neutral-500 tracking-wider mb-4">KEYWORD RANKING — {period}</h2>
                        <div className="border border-neutral-800/50 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-800/50 text-[10px] text-neutral-600 font-semibold tracking-wider">
                                        <th className="text-left py-2.5 px-4 w-10">#</th>
                                        <th className="text-left py-2.5 px-2">KEYWORD</th>
                                        <th className="text-left py-2.5 px-2 hidden sm:table-cell">CATEGORY</th>
                                        <th className="text-right py-2.5 px-2">VOLUME</th>
                                        <th className="text-right py-2.5 px-4">CHANGE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keywords.map((kw) => (
                                        <tr key={kw.rank} className="border-b border-neutral-800/20 hover:bg-neutral-900/50 transition-colors cursor-pointer group">
                                            <td className={`py-3 px-4 text-sm font-bold ${kw.rank <= 3 ? "text-[#F5C518]" : "text-neutral-600"}`}>{kw.rank}</td>
                                            <td className="py-3 px-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusBg[kw.status]} ${statusColor[kw.status]}`} style={{ boxShadow: `0 0 4px currentColor` }} />
                                                    <span className="text-white text-sm font-semibold group-hover:text-[#F5C518] transition-colors">{kw.keyword}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-[11px] text-neutral-600 hidden sm:table-cell">{kw.category}</td>
                                            <td className="py-3 px-2 text-right text-sm text-neutral-400 font-mono">{kw.volume.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-right">
                                                <span className={`inline-flex items-center gap-0.5 text-[12px] font-semibold ${kw.change > 0 ? "text-green-400" : kw.change < 0 ? "text-red-400" : "text-neutral-500"}`}>
                                                    {kw.change > 0 ? <TrendingUp className="w-3 h-3" /> : kw.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                                    {kw.change > 0 ? "+" : ""}{kw.change}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* Collection Sources */}
                        <div>
                            <h2 className="text-xs font-bold text-neutral-500 tracking-wider mb-4">COLLECTION SOURCES</h2>
                            <div className="space-y-3">
                                {platforms.map((p) => {
                                    const Icon = p.icon;
                                    const pct = Math.round((p.collected / totalCollected) * 100);
                                    return (
                                        <div key={p.name} className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-3.5 h-3.5 text-neutral-500" />
                                                    <span className="text-sm text-white font-medium">{p.name}</span>
                                                </div>
                                                <span className="text-[11px] text-neutral-400 font-mono">{p.collected.toLocaleString()}</span>
                                            </div>
                                            <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#F5C518]/60 rounded-full" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Hot Movers */}
                        <div>
                            <h2 className="text-xs font-bold text-neutral-500 tracking-wider mb-4">BIGGEST MOVERS</h2>
                            <div className="space-y-2">
                                {keywords.filter(k => k.change > 50).sort((a, b) => b.change - a.change).slice(0, 5).map(kw => (
                                    <div key={kw.keyword} className="flex items-center justify-between py-2 px-3 bg-neutral-900/30 rounded-lg border border-neutral-800/30">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-3 h-3 text-[#F5C518]" />
                                            <span className="text-sm text-white">{kw.keyword}</span>
                                        </div>
                                        <span className="text-sm font-bold text-green-400">+{kw.change}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
