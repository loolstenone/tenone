"use client";

import { useState } from "react";
import { Link2, ExternalLink, Star } from "lucide-react";

const categories = ["All", "Marketing", "AI/Tech", "Design", "Business", "Content", "Career"];

const references = [
    { id: "1", title: "2026 Marketing Trends — Complete Analysis", domain: "think.google", category: "Marketing", shared: 47, date: "03.25" },
    { id: "2", title: "Claude for Marketing Automation — A Practical Guide", domain: "anthropic.com", category: "AI/Tech", shared: 35, date: "03.24" },
    { id: "3", title: "Building a Brand Identity Design System", domain: "medium.com", category: "Design", shared: 28, date: "03.23" },
    { id: "4", title: "How to Earn $5K/mo with Micro-SaaS", domain: "disquiet.io", category: "Business", shared: 63, date: "03.22" },
    { id: "5", title: "Short-Form vs Long-Form: 2026 Content Strategy", domain: "hubspot.com", category: "Content", shared: 41, date: "03.21" },
    { id: "6", title: "Career Strategy for Marketers in the Agent AI Era", domain: "linkedin.com", category: "Career", shared: 52, date: "03.20" },
];

export default function MindleReferencesPage() {
    const [cat, setCat] = useState("All");
    const filtered = cat === "All" ? references : references.filter(r => r.category === cat);

    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-16 sm:py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">References</h1>
                    <p className="text-neutral-400 mb-8">The most-shared must-read industry content from the community.</p>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map((c) => (
                            <button key={c} onClick={() => setCat(c)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${cat === c ? "bg-[#F5C518] text-black" : "bg-neutral-900 text-neutral-400 border border-neutral-800"}`}>
                                {c}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {filtered.map((r) => (
                            <article key={r.id} className="group flex items-center gap-4 p-4 rounded-xl border border-neutral-800/50 bg-neutral-900/20 hover:border-[#F5C518]/20 transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                                    <Link2 className="w-4 h-4 text-[#F5C518]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white text-sm font-medium group-hover:text-[#F5C518] transition-colors truncate">{r.title}</h3>
                                    <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1">
                                        <span>{r.domain}</span>
                                        <span>{r.category}</span>
                                        <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-[#F5C518]" />{r.shared}</span>
                                        <span>{r.date}</span>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-[#F5C518] transition-colors shrink-0" />
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
