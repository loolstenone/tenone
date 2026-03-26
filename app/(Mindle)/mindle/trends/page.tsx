"use client";

import { useState } from "react";
import { TrendingUp, Clock, Eye, Bookmark, Search, Filter } from "lucide-react";
import Link from "next/link";

const categories = ["전체", "AI/테크", "마케팅", "소비자", "비즈니스", "콘텐츠", "라이프스타일"];
const statusFilter = ["전체", "유행중", "유행 예감", "시그널"];

const statusBadge: Record<string, { label: string; color: string }> = {
    trending: { label: "유행중", color: "bg-[#F5C518] text-black" },
    rising: { label: "유행 예감", color: "bg-orange-500/20 text-orange-400" },
    signal: { label: "시그널", color: "bg-blue-500/20 text-blue-400" },
    fading: { label: "하락", color: "bg-neutral-700 text-neutral-400" },
};

const trends = [
    { id: "t1", title: "에이전트 AI가 바꾸는 일하는 방식 — 2026년의 새로운 생산성", excerpt: "단순 챗봇을 넘어 자율 작업 수행 AI 에이전트. 기업 도입 가속화 이유와 실무 변화.", category: "AI/테크", status: "trending", date: "2026.03.26", readTime: "8분", views: 3420 },
    { id: "t2", title: "숏폼 피로도와 '슬로우 콘텐츠'의 역습", excerpt: "틱톡/릴스 체류 시간 둔화 속 팟캐스트·롱폼 영상 재부상.", category: "콘텐츠", status: "rising", date: "2026.03.25", readTime: "6분", views: 2180 },
    { id: "t3", title: "하이퍼로컬 비즈니스의 글로벌 확장 공식", excerpt: "동네 맛집이 글로벌 브랜드가 되는 시대. 로컬→글로벌 성공 패턴 분석.", category: "비즈니스", status: "trending", date: "2026.03.24", readTime: "5분", views: 1890 },
    { id: "t4", title: "디지털 디톡스 = 새로운 럭셔리?", excerpt: "스크린에서 벗어나는 것이 고급 소비가 되는 역설. 관련 검색 트렌드 급상승.", category: "라이프스타일", status: "signal", date: "2026.03.23", readTime: "4분", views: 987 },
    { id: "t5", title: "Z세대 가치소비 심화, 브랜드가 대응하는 법", excerpt: "경험 중심·가치 소비 패턴이 전 세대로 확산. SNS+소비 지표 교차 분석.", category: "소비자", status: "trending", date: "2026.03.22", readTime: "7분", views: 2650 },
    { id: "t6", title: "공간 컴퓨팅, 대중화까지의 거리", excerpt: "디바이스 출시 러시 속 대중화 가능성 찬반 논쟁. 보급률·앱 생태계 분석.", category: "AI/테크", status: "signal", date: "2026.03.21", readTime: "9분", views: 1540 },
    { id: "t7", title: "마이크로 SaaS 창업 붐 — 1인 개발자의 시대", excerpt: "AI 기반 빠른 MVP로 니치 시장 공략. 인디해커 성공 사례 분석.", category: "비즈니스", status: "rising", date: "2026.03.20", readTime: "6분", views: 2100 },
    { id: "t8", title: "AI 카피라이팅의 한계와 인간+AI 협업 모델", excerpt: "초기 열풍 대비 품질 한계 인식 확산. 협업 모델로 전환 중.", category: "마케팅", status: "fading", date: "2026.03.19", readTime: "5분", views: 1230 },
    { id: "t9", title: "체험형 소비의 데이터 분석 — 이제 경험을 산다", excerpt: "소유보다 경험. 체험형 소비 트렌드 전 세대 확산 데이터.", category: "소비자", status: "rising", date: "2026.03.18", readTime: "6분", views: 1856 },
    { id: "t10", title: "크리에이터 이코노미 × 로컬 = 새로운 공식", excerpt: "지역 기반 크리에이터의 글로벌 팬덤 형성 사례.", category: "콘텐츠", status: "signal", date: "2026.03.17", readTime: "5분", views: 890 },
];

export default function MindleTrendsPage() {
    const [selectedCat, setSelectedCat] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = trends.filter(t => {
        const matchCat = selectedCat === "전체" || t.category === selectedCat;
        const matchSearch = !searchQuery || t.title.includes(searchQuery) || t.excerpt.includes(searchQuery);
        return matchCat && matchSearch;
    });

    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-16 sm:py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">트렌드</h1>
                    <p className="text-neutral-400 mb-8">AI가 포착한 시그널과 전문가의 해석을 결합한 트렌드 인사이트.</p>

                    {/* 검색 + 필터 */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input type="text" placeholder="트렌드 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F5C518]/50" />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map((cat) => (
                            <button key={cat} onClick={() => setSelectedCat(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCat === cat ? "bg-[#F5C518] text-black" : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* 트렌드 카드 그리드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {filtered.map((t) => (
                            <article key={t.id} className="group rounded-2xl border border-neutral-800 bg-neutral-900/30 overflow-hidden hover:border-[#F5C518]/30 transition-all duration-300">
                                <div className="h-40 bg-gradient-to-br from-neutral-800/30 to-neutral-900 flex items-center justify-center">
                                    <TrendingUp className="w-10 h-10 text-neutral-700/50" />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[t.status].color}`}>
                                            {statusBadge[t.status].label}
                                        </span>
                                        <span className="text-[10px] text-neutral-500">{t.category}</span>
                                    </div>
                                    <h3 className="text-white font-bold mb-2 group-hover:text-[#F5C518] transition-colors leading-snug">{t.title}</h3>
                                    <p className="text-neutral-400 text-sm line-clamp-2 mb-3">{t.excerpt}</p>
                                    <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                                        <span>{t.date}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{t.readTime}</span>
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{t.views.toLocaleString()}</span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
