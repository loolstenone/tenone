"use client";

import { useState } from "react";
import { TrendingUp, Clock, Eye, ArrowRight, Bookmark, MessageSquare, Flame } from "lucide-react";

const tags = ["전체", "AI", "마케팅", "소비자", "기술", "라이프스타일", "비즈니스"];

const insights = [
    {
        id: "i1",
        title: "에이전트 AI가 바꾸는 일하는 방식 — 2026년의 새로운 생산성",
        excerpt: "단순 챗봇을 넘어 자율적으로 작업을 수행하는 에이전트 AI. 기업들이 도입을 서두르는 이유와, 실제 업무 프로세스가 어떻게 변하고 있는지 데이터로 살펴봅니다.",
        category: "AI",
        date: "2026.03.24",
        readTime: "8분",
        views: 2340,
        comments: 12,
        isFeatured: true,
    },
    {
        id: "i2",
        title: "이제 경험을 사는 시대 — 체험형 소비의 데이터 분석",
        excerpt: "소유보다 경험을 중시하는 소비 패턴이 전 세대로 확산되고 있습니다. SNS 데이터와 소비 지표를 교차 분석한 체험형 소비의 현재.",
        category: "소비자",
        date: "2026.03.20",
        readTime: "6분",
        views: 1856,
        comments: 8,
        isFeatured: false,
    },
    {
        id: "i3",
        title: "숏폼 피로도와 '슬로우 콘텐츠'의 역습",
        excerpt: "숏폼 콘텐츠의 성장세가 둔화되는 가운데, 긴 형식의 '슬로우 콘텐츠'가 다시 주목받고 있습니다. 플랫폼별 체류 시간 데이터가 말해주는 것.",
        category: "마케팅",
        date: "2026.03.15",
        readTime: "7분",
        views: 3210,
        comments: 24,
        isFeatured: true,
    },
    {
        id: "i4",
        title: "하이퍼로컬 비즈니스가 글로벌로 가는 법",
        excerpt: "동네 맛집이 글로벌 브랜드가 되고, 로컬 크리에이터가 해외 팬덤을 형성하는 시대. '로컬 → 글로벌' 성공 공식을 분석합니다.",
        category: "비즈니스",
        date: "2026.03.10",
        readTime: "5분",
        views: 1432,
        comments: 6,
        isFeatured: false,
    },
    {
        id: "i5",
        title: "디지털 디톡스 = 새로운 럭셔리?",
        excerpt: "스크린에서 벗어나는 것이 고급 소비가 되는 역설. 디지털 디톡스 관련 서비스와 상품의 검색 트렌드가 급상승하고 있습니다.",
        category: "라이프스타일",
        date: "2026.03.05",
        readTime: "4분",
        views: 987,
        comments: 15,
        isFeatured: false,
    },
    {
        id: "i6",
        title: "공간 컴퓨팅, 과연 메인스트림이 될 수 있을까",
        excerpt: "Apple Vision Pro 이후 공간 컴퓨팅 디바이스 출시가 이어지고 있지만, 대중화까지의 거리는 여전합니다. 보급률, 앱 생태계, 사용자 행태 데이터를 분석합니다.",
        category: "기술",
        date: "2026.02.28",
        readTime: "9분",
        views: 2678,
        comments: 31,
        isFeatured: false,
    },
];

export default function TrendHunterInsightsPage() {
    const [selectedTag, setSelectedTag] = useState("전체");

    const filtered = selectedTag === "전체" ? insights : insights.filter(i => i.category === selectedTag);
    const featured = insights.filter(i => i.isFeatured);

    return (
        <div className="bg-[#0A0A0A]">
            {/* Hero */}
            <section className="py-20 sm:py-28 px-6">
                <div className="mx-auto max-w-5xl">
                    <span className="text-[#00FF88] text-xs font-mono tracking-widest">TREND INSIGHTS</span>
                    <h1 className="text-3xl sm:text-5xl font-bold text-white mt-4 mb-4">트렌드 인사이트</h1>
                    <p className="text-neutral-400 text-lg max-w-2xl">
                        AI가 포착한 시그널과 전문가의 해석을 결합한 트렌드 인사이트.
                        빠르게 읽고, 깊이 이해하세요.
                    </p>
                </div>
            </section>

            {/* Featured */}
            {featured.length > 0 && (
                <section className="px-6 pb-12">
                    <div className="mx-auto max-w-5xl">
                        <div className="flex items-center gap-2 mb-6">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-mono text-neutral-400">Featured</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {featured.map((item) => (
                                <article key={item.id} className="group p-6 rounded-xl border border-[#00FF88]/20 bg-[#00FF88]/5 hover:bg-[#00FF88]/10 transition-colors">
                                    <span className="text-[#00FF88] text-[10px] font-mono tracking-wider">{item.category}</span>
                                    <h3 className="text-white font-bold text-lg mt-2 mb-3 group-hover:text-[#00FF88] transition-colors leading-snug">
                                        {item.title}
                                    </h3>
                                    <p className="text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-2">{item.excerpt}</p>
                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.readTime}</span>
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.views.toLocaleString()}</span>
                                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {item.comments}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 태그 필터 */}
            <section className="px-6 pb-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors ${
                                    selectedTag === tag
                                        ? "bg-[#00FF88] text-black"
                                        : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-[#00FF88]/30"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 인사이트 목록 */}
            <section className="px-6 pb-24">
                <div className="mx-auto max-w-5xl">
                    <div className="space-y-4">
                        {filtered.map((item) => (
                            <article
                                key={item.id}
                                className="group p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/30 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[#00FF88] text-[10px] font-mono tracking-wider bg-[#00FF88]/10 px-2 py-0.5 rounded">
                                                {item.category}
                                            </span>
                                            <span className="text-neutral-600 text-[10px] font-mono">{item.date}</span>
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#00FF88] transition-colors leading-snug">
                                            {item.title}
                                        </h3>
                                        <p className="text-neutral-400 text-sm leading-relaxed mb-3 line-clamp-2">{item.excerpt}</p>
                                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.readTime}</span>
                                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.views.toLocaleString()}</span>
                                            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {item.comments}</span>
                                        </div>
                                    </div>
                                    <button className="hidden sm:flex items-center gap-1 px-4 py-2 border border-neutral-700 rounded-lg text-sm text-white hover:border-[#00FF88]/50 hover:text-[#00FF88] transition-colors whitespace-nowrap">
                                        읽기 <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
