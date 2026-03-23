"use client";

import Link from "next/link";

const categories = ["전체", "마케팅", "광고", "브랜딩", "스타트업", "트렌드", "AI/테크"];

const articles = [
    { title: "챗GPT 겁대기만 씌운 K-스타트업들 현재 초비상 걸린 이유?", source: "s-valueup", category: "스타트업", date: "2026.03.20" },
    { title: "2026 서울시 자영업자 안심통장 신청 방법 및 조건은? (최대 1천만 원)", source: "s-valueup", category: "트렌드", date: "2026.03.18" },
    { title: "스타트업 경영권 방어, 벤처기업 특례 '복수의결권' 도입과 복수의결권주식 공시 방법은?", source: "s-valueup", category: "스타트업", date: "2026.03.15" },
    { title: "2026 중소·벤처기업 M&A (기업가치평가, 실사, PMI)", source: "s-valueup", category: "스타트업", date: "2026.03.12" },
    { title: "2025 스타트업이 알아야 할 기업공시, 상장(IPO) 전 체크리스트는 뭘까?", source: "s-valueup", category: "스타트업", date: "2026.03.10" },
    { title: "2026년 국세청 홈택스 종합소득세 환급금 신청 방법 (알바·프리랜서)", source: "s-valueup", category: "트렌드", date: "2026.03.08" },
    { title: "[국세청] 2026년 최초 시행 '투자조합 명세서' 제출 대상 및 기한은?", source: "s-valueup", category: "트렌드", date: "2026.03.05" },
    { title: "2026 인터넷서비스 트렌드 컨퍼런스(04.02 THU)_AI가 불러온 인터넷서비스 트렌드의 새로운 변화와 기회", source: "한국인터넷전문가협회", category: "AI/테크", date: "2026.03.03" },
    { title: "판교 스타트업캠퍼스, 예비·초기 창업자를 위한 무료 전문가 상담 안내", source: "판교 스타트업캠퍼스", category: "스타트업", date: "2026.03.01" },
];

export default function ContentsPage() {
    return (
        <div>
            {/* Header */}
            <section className="py-12 px-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-6">콘텐츠</h1>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map((cat, i) => (
                            <button
                                key={cat}
                                className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${i === 0
                                    ? "bg-neutral-900 text-white border-neutral-900"
                                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-900"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Articles */}
                    <div className="border-t border-neutral-900">
                        {articles.map((article, i) => (
                            <Link
                                key={i}
                                href="/bk/contents"
                                className="block py-5 border-b border-neutral-200 group hover:bg-neutral-50 px-2 -mx-2 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <span className="inline-block text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded mb-2">
                                            {article.category}
                                        </span>
                                        <h3 className="text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors mb-1">
                                            {article.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-neutral-400">
                                            <span>{article.source}</span>
                                            <span>{article.date}</span>
                                        </div>
                                    </div>
                                    <div className="w-20 h-16 bg-neutral-100 rounded flex-shrink-0 flex items-center justify-center">
                                        <span className="text-2xl">📄</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
