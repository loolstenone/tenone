"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, Clock, Eye, Flame, ChevronRight } from "lucide-react";

const insightCopies = [
    "Bloom insights from signals.",
    "Trends begin in data.",
    "First to catch the signal of change.",
    "Finding the story behind the numbers.",
    "Tomorrow's opportunity lives in today's signal.",
    "Eyes that read invisible currents.",
    "What data says, humans interpret.",
    "We don't track trends — we create them.",
    "From signal to insight, insight to action.",
    "Every change has a pattern.",
    "The era of evidence over intuition.",
    "Measuring the half-life of trends.",
    "The gap between what consumers say and do.",
    "Today's micro becomes tomorrow's mega.",
    "Platforms change, fundamentals don't.",
    "Read fast, interpret deep.",
    "AI finds it, humans give it meaning.",
    "Trends are discovered, not predicted.",
    "Delivering the temperature of the field in data.",
    "Connecting the unconnected dots.",
    "Separating signal from noise.",
    "Seeing one step ahead is strategy.",
    "Data literacy is the new competitive edge.",
    "Consumers speak through behavior, not words.",
    "Trend sensitivity is business sensitivity.",
    "Fear change and change consumes you.",
    "Great questions make great insights.",
    "Those who ride the wave vs. those who make it.",
    "Every fad has a reason.",
    "Small movements become big waves.",
];

const statusBadge: Record<string, { label: string; color: string }> = {
    trending: { label: "Trending", color: "bg-[#F5C518] text-black" },
    rising: { label: "Rising", color: "bg-orange-500/20 text-orange-400" },
    signal: { label: "Signal", color: "bg-blue-500/20 text-blue-400" },
    fading: { label: "Fading", color: "bg-neutral-700 text-neutral-400" },
};

const headline = {
    title: "How Agent AI Is Reshaping the Way We Work — The New Productivity of 2026",
    excerpt: "Beyond simple chatbots, autonomous agent AIs are now executing tasks independently. We analyze why enterprise adoption is accelerating and how real workflows are transforming.",
    category: "AI / Tech",
    status: "trending",
    date: "Mar 26, 2026",
    readTime: "8 min",
    views: 3420,
};

const sideArticles = [
    { id: "s1", title: "Short-Form Fatigue and the Rise of 'Slow Content'", category: "Content", status: "rising", date: "Mar 25" },
    { id: "s2", title: "The Hyperlocal Business Playbook for Global Expansion", category: "Business", status: "trending", date: "Mar 24" },
    { id: "s3", title: "Digital Detox = The New Luxury?", category: "Lifestyle", status: "signal", date: "Mar 23" },
    { id: "s4", title: "Gen Z Value-Driven Spending — How Brands Are Adapting", category: "Consumer", status: "trending", date: "Mar 22" },
];

const latestArticles = [
    { id: "l1", title: "Spatial Computing: How Far Until Mainstream?", category: "AI / Tech", status: "signal", date: "Mar 21", readTime: "9 min" },
    { id: "l2", title: "The Micro-SaaS Boom — Era of the Solo Developer", category: "Business", status: "rising", date: "Mar 20", readTime: "6 min" },
    { id: "l3", title: "AI Copywriting's Limits and the Human+AI Collaboration Model", category: "Marketing", status: "fading", date: "Mar 19", readTime: "5 min" },
    { id: "l4", title: "Experience Economy — Data Analysis of Experiential Consumption", category: "Consumer", status: "rising", date: "Mar 18", readTime: "6 min" },
    { id: "l5", title: "Creator Economy × Local = A New Formula", category: "Content", status: "signal", date: "Mar 17", readTime: "5 min" },
    { id: "l6", title: "Subscription Fatigue: The Return of Bundling Strategies", category: "Business", status: "rising", date: "Mar 16", readTime: "4 min" },
];

const hotKeywords = [
    { rank: 1, keyword: "Agent AI", change: "+340%" },
    { rank: 2, keyword: "Slow Content", change: "+180%" },
    { rank: 3, keyword: "Hyperlocal", change: "+120%" },
    { rank: 4, keyword: "Digital Detox", change: "+95%" },
    { rank: 5, keyword: "Micro SaaS", change: "+75%" },
];

export default function MindleHomePage() {
    const [copy, setCopy] = useState(insightCopies[0]);

    useEffect(() => {
        setCopy(insightCopies[Math.floor(Math.random() * insightCopies.length)]);
        const interval = setInterval(() => {
            setCopy(insightCopies[Math.floor(Math.random() * insightCopies.length)]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#0A0A0A]">
            {/* HERO */}
            <section className="pt-10 pb-8 px-6 border-b border-neutral-800/50">
                <div className="mx-auto max-w-5xl text-center">
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-3">
                        <span className="text-[#F5C518]">Mindle</span> <span className="text-white">Whole See</span>
                    </h1>
                    <p className="text-neutral-400 text-sm sm:text-base transition-opacity duration-1000">
                        {copy}
                    </p>
                </div>
            </section>

            {/* HOT KEYWORDS */}
            <section className="px-6 py-3 border-b border-neutral-800/30 bg-neutral-900/30">
                <div className="mx-auto max-w-5xl flex items-center gap-4 overflow-x-auto scrollbar-hide">
                    <Flame className="w-3.5 h-3.5 text-[#F5C518] shrink-0" />
                    {hotKeywords.map((kw) => (
                        <Link key={kw.rank} href="/mindle/data" className="shrink-0 flex items-center gap-1.5 text-sm hover:text-[#F5C518] transition-colors">
                            <span className={`font-bold ${kw.rank <= 3 ? "text-[#F5C518]" : "text-neutral-500"}`}>{kw.rank}</span>
                            <span className="text-white">{kw.keyword}</span>
                            <span className="text-[10px] text-green-400 font-mono">{kw.change}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* MAIN — NEWSPAPER LAYOUT */}
            <section className="px-6 py-8">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <article className="lg:col-span-2 group">
                            <div className="h-64 sm:h-80 rounded-xl bg-gradient-to-br from-neutral-800/50 to-neutral-900 flex items-center justify-center mb-4">
                                <TrendingUp className="w-16 h-16 text-neutral-700/30" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[headline.status].color}`}>
                                    {statusBadge[headline.status].label}
                                </span>
                                <span className="text-[11px] text-neutral-500">{headline.category}</span>
                                <span className="text-[11px] text-neutral-600">{headline.date}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-[#F5C518] transition-colors cursor-pointer">
                                {headline.title}
                            </h2>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-3">{headline.excerpt}</p>
                            <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{headline.readTime}</span>
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{headline.views.toLocaleString()}</span>
                            </div>
                        </article>

                        <div className="space-y-4 lg:border-l lg:border-neutral-800/50 lg:pl-6">
                            <h3 className="text-xs font-semibold text-neutral-500 tracking-wider">TODAY&apos;S PICKS</h3>
                            {sideArticles.map((a) => (
                                <article key={a.id} className="group pb-4 border-b border-neutral-800/30 last:border-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${statusBadge[a.status].color}`}>
                                            {statusBadge[a.status].label}
                                        </span>
                                        <span className="text-[10px] text-neutral-600">{a.category}</span>
                                    </div>
                                    <h4 className="text-white text-sm font-semibold leading-snug group-hover:text-[#F5C518] transition-colors cursor-pointer">
                                        {a.title}
                                    </h4>
                                    <span className="text-[10px] text-neutral-600 mt-1 block">{a.date}</span>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* LATEST */}
            <section className="px-6 py-8 border-t border-neutral-800/50">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-white">Latest</h3>
                        <Link href="/mindle/trends" className="text-sm text-neutral-400 hover:text-[#F5C518] transition-colors flex items-center gap-1">
                            View All <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {latestArticles.map((a) => (
                            <article key={a.id} className="group flex items-start gap-3 py-3 border-b border-neutral-800/30">
                                <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded mt-0.5 ${statusBadge[a.status].color}`}>
                                    {statusBadge[a.status].label}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-white text-sm font-medium group-hover:text-[#F5C518] transition-colors cursor-pointer leading-snug">
                                        {a.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-600">
                                        <span>{a.category}</span>
                                        <span>{a.date}</span>
                                        <span>{a.readTime}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* NEWSLETTER */}
            <section className="px-6 py-12 border-t border-neutral-800/50">
                <div className="mx-auto max-w-2xl text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Weekly Trend Briefing, Every Tuesday</h3>
                    <p className="text-neutral-500 text-sm mb-5">AI-analyzed trend reports delivered to your inbox.</p>
                    <div className="flex gap-2 max-w-sm mx-auto">
                        <input type="email" placeholder="email@example.com" className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#F5C518]/50" />
                        <button className="px-5 py-2 bg-[#F5C518] text-black font-semibold rounded-full text-sm hover:bg-[#E5B616] transition-colors">Subscribe</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
