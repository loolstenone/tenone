"use client";

import { FileText, Calendar, ChevronRight, Lock } from "lucide-react";

const reports = [
    {
        id: "r1", week: "Week 13", date: "Mar 24–30, 2026", status: "latest",
        title: "Agent AI Enters the Enterprise — Workflows Will Never Be the Same",
        summary: "This week's dominant signal: autonomous AI agents are no longer demos—they're shipping in production. Meanwhile, Gen Z's value-driven consumption deepens, and spatial computing sees its first killer app.",
        keywords: ["Agent AI", "Gen Z Values", "Spatial Computing", "Slow Content"],
        sections: 5, readTime: "12 min",
    },
    {
        id: "r2", week: "Week 12", date: "Mar 17–23, 2026", status: "published",
        title: "The Hyperlocal Paradox — Think Local, Scale Global",
        summary: "Hyperlocal brands are outperforming global chains in customer loyalty metrics. Digital detox emerges as a premium lifestyle category. Micro-SaaS founders hit $1M ARR faster than ever.",
        keywords: ["Hyperlocal", "Digital Detox", "Micro-SaaS", "Creator Economy"],
        sections: 5, readTime: "11 min",
    },
    {
        id: "r3", week: "Week 11", date: "Mar 10–16, 2026", status: "published",
        title: "Subscription Fatigue Hits Critical Mass",
        summary: "Consumers are canceling subscriptions at record rates. Platforms respond with super-bundles. AI copywriting faces an authenticity reckoning.",
        keywords: ["Subscription Fatigue", "AI Copywriting", "Experience Economy", "Bundling"],
        sections: 4, readTime: "10 min",
    },
    {
        id: "r4", week: "Week 10", date: "Mar 3–9, 2026", status: "published",
        title: "The Trust Gap — AI Content Meets Consumer Skepticism",
        summary: "As AI-generated UGC floods platforms, consumer trust metrics decline. Brands investing in verification see 3x engagement lift.",
        keywords: ["AI UGC", "Trust Economy", "Voice Commerce", "Verification"],
        sections: 5, readTime: "13 min",
    },
    {
        id: "r5", week: "Week 9", date: "Feb 24–Mar 2, 2026", status: "locked",
        title: "Premium Report: Q1 Mega-Trend Synthesis",
        summary: "Deep-dive analysis combining 8 weeks of signals into actionable strategic insights. Exclusive forecasts for Q2 2026.",
        keywords: ["Q1 Synthesis", "Forecasting", "Strategy"],
        sections: 8, readTime: "25 min",
    },
];

export default function MindleReportsPage() {
    return (
        <div className="bg-[#0A0A0A]">
            <div className="mx-auto max-w-5xl px-6">
                <section className="py-8 border-b border-neutral-800/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Weekly Reports</h1>
                            <p className="text-neutral-500 text-sm">AI-synthesized trend analysis delivered every Monday.</p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-500 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
                            <Calendar className="w-3 h-3" /> Every Monday 9AM
                        </div>
                    </div>
                </section>

                <section className="py-6">
                    <div className="divide-y divide-neutral-800/40">
                        {reports.map((r) => (
                            <article key={r.id} className="group py-6 cursor-pointer">
                                <div className="flex items-start gap-5">
                                    <div className="hidden sm:flex flex-col items-center shrink-0 w-16 pt-1">
                                        <span className={`text-[10px] font-bold tracking-wider ${r.status === "latest" ? "text-[#F5C518]" : r.status === "locked" ? "text-neutral-600" : "text-neutral-500"}`}>{r.week.toUpperCase()}</span>
                                        <span className="text-[10px] text-neutral-700 mt-0.5">{r.date.split(",")[0]}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            {r.status === "latest" && <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#F5C518] text-black">LATEST</span>}
                                            {r.status === "locked" && <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-500 flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> PREMIUM</span>}
                                        </div>
                                        <h2 className={`text-lg font-bold leading-snug mb-2 transition-colors ${r.status === "locked" ? "text-neutral-500" : "text-white group-hover:text-[#F5C518]"}`}>{r.title}</h2>
                                        <p className="text-neutral-500 text-[13px] leading-relaxed mb-3 line-clamp-2">{r.summary}</p>
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            {r.keywords.map(kw => (
                                                <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">{kw}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] text-neutral-600">
                                            <span className="flex items-center gap-1"><FileText className="w-2.5 h-2.5" />{r.sections} sections</span>
                                            <span>{r.readTime}</span>
                                            {r.status !== "locked" && <span className="flex items-center gap-1 text-neutral-500 group-hover:text-[#F5C518] transition-colors">Read <ChevronRight className="w-2.5 h-2.5" /></span>}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
