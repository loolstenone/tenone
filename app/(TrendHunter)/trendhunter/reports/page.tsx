"use client";

import { useState } from "react";
import { FileText, TrendingUp, Calendar, Tag, ArrowRight, Search, Filter, Clock, Eye, Download } from "lucide-react";
import Link from "next/link";

const categories = ["전체", "산업 분석", "소비자 트렌드", "기술 트렌드", "마케팅", "라이프스타일"];

const reports = [
    {
        id: "r1",
        title: "2026 상반기 AI 산업 트렌드 리포트",
        category: "기술 트렌드",
        date: "2026.03",
        summary: "생성형 AI의 엔터프라이즈 도입 가속화, 에이전트 AI 등장, 멀티모달 AI의 실용화 등 2026년 상반기 핵심 AI 트렌드를 분석합니다.",
        tags: ["AI", "생성형 AI", "에이전트", "엔터프라이즈"],
        views: 1247,
        isPremium: true,
        isNew: true,
    },
    {
        id: "r2",
        title: "Z세대 소비 패턴 변화와 브랜드 전략",
        category: "소비자 트렌드",
        date: "2026.02",
        summary: "경험 중심 소비, 가치 소비, 디지털 네이티브 쇼핑 행태 등 Z세대의 소비 패턴 변화를 데이터로 분석하고 브랜드 대응 전략을 제시합니다.",
        tags: ["Z세대", "소비 트렌드", "브랜드 전략", "MZ"],
        views: 983,
        isPremium: false,
        isNew: true,
    },
    {
        id: "r3",
        title: "숏폼 콘텐츠 마케팅 효과 분석 2026",
        category: "마케팅",
        date: "2026.02",
        summary: "틱톡, 릴스, 쇼츠 등 숏폼 플랫폼별 마케팅 ROI 비교 분석. 업종별 최적 콘텐츠 전략과 성과 데이터를 공개합니다.",
        tags: ["숏폼", "틱톡", "릴스", "콘텐츠 마케팅"],
        views: 2156,
        isPremium: true,
        isNew: false,
    },
    {
        id: "r4",
        title: "로컬 크리에이터 이코노미의 부상",
        category: "라이프스타일",
        date: "2026.01",
        summary: "지역 기반 크리에이터의 성장, 로컬 브랜드와의 협업, 지역 커뮤니티 콘텐츠의 글로벌 확산 사례를 분석합니다.",
        tags: ["로컬", "크리에이터", "커뮤니티", "콘텐츠"],
        views: 756,
        isPremium: false,
        isNew: false,
    },
    {
        id: "r5",
        title: "2025 연간 글로벌 산업 트렌드 총정리",
        category: "산업 분석",
        date: "2025.12",
        summary: "2025년 한 해를 관통한 글로벌 산업 트렌드를 10개 핵심 키워드로 정리. 산업별 Winners & Losers 분석 포함.",
        tags: ["연간 리포트", "글로벌", "산업 분석", "키워드"],
        views: 3421,
        isPremium: true,
        isNew: false,
    },
    {
        id: "r6",
        title: "헬스케어 × AI 융합 트렌드",
        category: "기술 트렌드",
        date: "2025.11",
        summary: "AI 진단, 디지털 치료제, 원격의료의 진화. 헬스케어 산업에서 AI가 만들어가는 새로운 가치와 비즈니스 모델을 분석합니다.",
        tags: ["헬스케어", "AI", "디지털 치료제", "원격의료"],
        views: 1893,
        isPremium: false,
        isNew: false,
    },
];

export default function TrendHunterReportsPage() {
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = reports.filter((r) => {
        const matchCat = selectedCategory === "전체" || r.category === selectedCategory;
        const matchSearch = !searchQuery || r.title.includes(searchQuery) || r.tags.some(t => t.includes(searchQuery));
        return matchCat && matchSearch;
    });

    return (
        <div className="bg-[#0A0A0A]">
            {/* Hero */}
            <section className="py-20 sm:py-28 px-6">
                <div className="mx-auto max-w-5xl">
                    <span className="text-[#00FF88] text-xs font-mono tracking-widest">TREND REPORTS</span>
                    <h1 className="text-3xl sm:text-5xl font-bold text-white mt-4 mb-4">트렌드 리포트</h1>
                    <p className="text-neutral-400 text-lg max-w-2xl">
                        AI가 분석하고 전문가가 큐레이션한 산업별 트렌드 리포트.
                        데이터 기반의 인사이트로 비즈니스 의사결정을 지원합니다.
                    </p>
                </div>
            </section>

            {/* 필터 + 검색 */}
            <section className="px-6 pb-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                type="text"
                                placeholder="리포트 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00FF88]/50"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors ${
                                    selectedCategory === cat
                                        ? "bg-[#00FF88] text-black"
                                        : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-[#00FF88]/30"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 리포트 목록 */}
            <section className="px-6 pb-24">
                <div className="mx-auto max-w-5xl">
                    <div className="space-y-4">
                        {filtered.map((report) => (
                            <article
                                key={report.id}
                                className="group p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/30 transition-all duration-300"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[#00FF88] text-[10px] font-mono tracking-wider bg-[#00FF88]/10 px-2 py-0.5 rounded">
                                                {report.category}
                                            </span>
                                            {report.isNew && (
                                                <span className="text-[10px] font-mono tracking-wider bg-red-500/20 text-red-400 px-2 py-0.5 rounded">NEW</span>
                                            )}
                                            {report.isPremium && (
                                                <span className="text-[10px] font-mono tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">PREMIUM</span>
                                            )}
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#00FF88] transition-colors">
                                            {report.title}
                                        </h3>
                                        <p className="text-neutral-400 text-sm leading-relaxed mb-3">{report.summary}</p>
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {report.tags.map((tag) => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-500 font-mono">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {report.date}</span>
                                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {report.views.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="sm:flex-shrink-0">
                                        <button className="inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-700 rounded-lg text-sm text-white hover:border-[#00FF88]/50 hover:text-[#00FF88] transition-colors">
                                            읽기 <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <div className="text-center py-16">
                            <FileText className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                            <p className="text-neutral-500">검색 결과가 없습니다.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
