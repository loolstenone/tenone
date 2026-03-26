"use client";

import { useState } from "react";
import { Link2, ExternalLink, Star, Clock, Tag } from "lucide-react";

const categories = ["전체", "마케팅", "AI/테크", "디자인", "비즈니스", "콘텐츠", "커리어"];

const references = [
    {
        id: "ref1",
        title: "2026 마케팅 트렌드 완전 분석",
        url: "https://example.com/marketing-2026",
        domain: "think.google",
        category: "마케팅",
        sharedCount: 47,
        platforms: ["카카오 레퍼런스창고", "네이버카페"],
        desc: "구글 Think with Google의 2026년 마케팅 트렌드 리포트. 검색 행태 변화, AI 활용 광고, 개인화 전략.",
        savedAt: "2026.03.25",
    },
    {
        id: "ref2",
        title: "Claude로 마케팅 자동화 실전 가이드",
        url: "https://example.com/claude-marketing",
        domain: "anthropic.com",
        category: "AI/테크",
        sharedCount: 35,
        platforms: ["카카오 RooK", "디스코드"],
        desc: "Claude API를 활용한 마케팅 워크플로우 자동화 실전 튜토리얼. 코드 예시 포함.",
        savedAt: "2026.03.24",
    },
    {
        id: "ref3",
        title: "브랜드 아이덴티티 디자인 시스템 구축법",
        url: "https://example.com/brand-design",
        domain: "medium.com",
        category: "디자인",
        sharedCount: 28,
        platforms: ["카카오 자료공유"],
        desc: "스타트업부터 대기업까지 활용 가능한 브랜드 디자인 시스템 구축 프레임워크.",
        savedAt: "2026.03.23",
    },
    {
        id: "ref4",
        title: "마이크로 SaaS로 월 500만원 만드는 법",
        url: "https://example.com/micro-saas",
        domain: "disquiet.io",
        category: "비즈니스",
        sharedCount: 63,
        platforms: ["카카오 프리랜서방", "커뮤니티"],
        desc: "1인 개발자의 마이크로 SaaS 창업기. 아이디어 발굴부터 수익화까지 과정 공개.",
        savedAt: "2026.03.22",
    },
    {
        id: "ref5",
        title: "숏폼 vs 롱폼: 2026년 콘텐츠 전략",
        url: "https://example.com/content-strategy",
        domain: "hubspot.com",
        category: "콘텐츠",
        sharedCount: 41,
        platforms: ["카카오 디마방", "뉴스"],
        desc: "플랫폼별 콘텐츠 길이 최적화 데이터. 숏폼 피로도와 롱폼 부활 현상 분석.",
        savedAt: "2026.03.21",
    },
    {
        id: "ref6",
        title: "에이전트 AI 시대, 마케터의 커리어 전략",
        url: "https://example.com/career-ai",
        domain: "linkedin.com",
        category: "커리어",
        sharedCount: 52,
        platforms: ["카카오 팀장리더방", "블라인드"],
        desc: "AI 에이전트가 실무를 대체하는 시대, 마케터가 갖춰야 할 역량과 커리어 방향.",
        savedAt: "2026.03.20",
    },
];

export default function TrendHunterReferencesPage() {
    const [selectedCat, setSelectedCat] = useState("전체");

    const filtered = selectedCat === "전체" ? references : references.filter(r => r.category === selectedCat);

    return (
        <div className="bg-[#0A0A0A]">
            {/* Hero */}
            <section className="py-20 sm:py-28 px-6">
                <div className="mx-auto max-w-5xl">
                    <span className="text-[#8BC34A] text-xs font-mono tracking-widest">CURATED REFERENCES</span>
                    <h1 className="text-3xl sm:text-5xl font-bold text-white mt-4 mb-4">레퍼런스 큐레이션</h1>
                    <p className="text-neutral-400 text-lg max-w-2xl">
                        카카오 오픈채팅·커뮤니티·뉴스레터에서 공유된 URL을 자동 수집하고,
                        AI가 분류·정리한 업계 필독 레퍼런스.
                    </p>
                </div>
            </section>

            {/* 카테고리 필터 */}
            <section className="px-6 pb-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCat(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors ${
                                    selectedCat === cat
                                        ? "bg-[#8BC34A] text-black"
                                        : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-[#8BC34A]/30"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 레퍼런스 목록 */}
            <section className="px-6 pb-24">
                <div className="mx-auto max-w-5xl space-y-4">
                    {filtered.map((ref) => (
                        <article
                            key={ref.id}
                            className="group p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#8BC34A]/30 transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                                    <Link2 className="w-5 h-5 text-[#8BC34A]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[#8BC34A] text-[10px] font-mono bg-[#8BC34A]/10 px-2 py-0.5 rounded">{ref.category}</span>
                                        <span className="text-neutral-600 text-[10px] font-mono">{ref.domain}</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-1 group-hover:text-[#8BC34A] transition-colors">
                                        {ref.title}
                                    </h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed mb-3">{ref.desc}</p>
                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-[#FFB800]" /> {ref.sharedCount}회 공유
                                        </span>
                                        <span className="flex items-center gap-1">{ref.platforms.join(", ")}</span>
                                        <span>{ref.savedAt}</span>
                                    </div>
                                </div>
                                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1 px-4 py-2 border border-neutral-700 rounded-lg text-sm text-white hover:border-[#8BC34A]/50 hover:text-[#8BC34A] transition-colors whitespace-nowrap">
                                    열기 <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
