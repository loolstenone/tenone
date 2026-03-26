"use client";

import { FileText, Calendar, Eye, ArrowRight, Download } from "lucide-react";

const reports = [
    { id: "r1", week: "March 2026, Week 4", title: "Agent AI Adoption Accelerates + Short-Form Fatigue Spreads", keywords: ["Agent AI", "Slow Content", "Experiential Spending", "Local Creators"], summary: "This week 'Agent AI' topped keyword rankings across all platforms. Multiple signals detected for declining short-form dwell time.", views: 1247, isLatest: true },
    { id: "r2", week: "March 2026, Week 3", title: "Gen Z Values Spending Deepens + AI Video Editing Surges", keywords: ["Gen Z Values", "AI Video Editing", "Hyperlocal", "Subscription Fatigue"], summary: "Gen Z values-based spending patterns confirmed across all platforms. AI video editing keywords up 340% week-over-week.", views: 2156, isLatest: false },
    { id: "r3", week: "March 2026, Week 2", title: "Spatial Computing Debate + Freelancer Market Shifts", keywords: ["Spatial Computing", "Freelancer Platforms", "AI Copywriting", "Micro-SaaS"], summary: "Active debate on spatial computing mass adoption. In freelancer markets, AI tool proficiency now directly impacts rates.", views: 1893, isLatest: false },
];

export default function MindleReportsPage() {
    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-16 sm:py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Weekly Reports</h1>
                    <p className="text-neutral-400 mb-8">Published every Monday. AI-analyzed, expert-curated weekly trend reports.</p>
                    <div className="space-y-5">
                        {reports.map((r) => (
                            <article key={r.id} className={`group p-7 rounded-2xl border transition-all ${r.isLatest ? "border-[#F5C518]/30 bg-[#F5C518]/5" : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <FileText className="w-4 h-4 text-[#F5C518]" />
                                    <span className="text-[#F5C518] text-xs font-medium">{r.week}</span>
                                    {r.isLatest && <span className="text-[10px] bg-[#F5C518] text-black px-2 py-0.5 rounded font-semibold">LATEST</span>}
                                </div>
                                <h2 className="text-white font-bold text-xl mb-3 group-hover:text-[#F5C518] transition-colors">{r.title}</h2>
                                <p className="text-neutral-400 text-sm mb-4">{r.summary}</p>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {r.keywords.map((kw) => (
                                        <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">#{kw}</span>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-neutral-500 flex items-center gap-1"><Eye className="w-3 h-3" />{r.views.toLocaleString()}</span>
                                    <button className="text-sm text-white hover:text-[#F5C518] transition-colors flex items-center gap-1">View Report <ArrowRight className="w-3.5 h-3.5" /></button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
