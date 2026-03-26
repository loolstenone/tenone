"use client";

import { useState } from "react";
import { Link2, ExternalLink, Star } from "lucide-react";

const categories = ["전체", "마케팅", "AI/테크", "디자인", "비즈니스", "콘텐츠", "커리어"];

const references = [
    { id: "1", title: "2026 마케팅 트렌드 완전 분석", domain: "think.google", category: "마케팅", shared: 47, date: "03.25" },
    { id: "2", title: "Claude로 마케팅 자동화 실전 가이드", domain: "anthropic.com", category: "AI/테크", shared: 35, date: "03.24" },
    { id: "3", title: "브랜드 아이덴티티 디자인 시스템 구축법", domain: "medium.com", category: "디자인", shared: 28, date: "03.23" },
    { id: "4", title: "마이크로 SaaS로 월 500만원 만드는 법", domain: "disquiet.io", category: "비즈니스", shared: 63, date: "03.22" },
    { id: "5", title: "숏폼 vs 롱폼: 2026년 콘텐츠 전략", domain: "hubspot.com", category: "콘텐츠", shared: 41, date: "03.21" },
    { id: "6", title: "에이전트 AI 시대, 마케터의 커리어 전략", domain: "linkedin.com", category: "커리어", shared: 52, date: "03.20" },
];

export default function MindleReferencesPage() {
    const [cat, setCat] = useState("전체");
    const filtered = cat === "전체" ? references : references.filter(r => r.category === cat);

    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-16 sm:py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">레퍼런스</h1>
                    <p className="text-neutral-400 mb-8">커뮤니티에서 가장 많이 공유된 업계 필독 콘텐츠.</p>
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
