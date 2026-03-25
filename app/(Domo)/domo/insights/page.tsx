"use client";

import { useState } from "react";
import Link from "next/link";

const categories = ["전체", "인터뷰", "트렌드", "투자", "브랜딩", "사회공헌", "건강", "라이프"];

const articles = [
    { title: "은퇴 후 5년, 성공적인 2막을 연 CEO들의 공통점", category: "인터뷰", date: "2026.03.20", excerpt: "40년 가까이 기업을 이끌다 은퇴한 후, 완전히 다른 분야에서 성공적인 2막을 시작한 CEO들. 그들에게는 공통된 특징이 있었습니다." },
    { title: "2026 시니어 창업 트렌드: AI와 헬스케어가 이끈다", category: "트렌드", date: "2026.03.18", excerpt: "시니어 세대의 창업이 빠르게 증가하고 있습니다. 특히 AI 기반 서비스와 헬스케어 분야에서 시니어 창업가들의 활약이 두드러집니다." },
    { title: "자산 포트폴리오 리밸런싱, 지금이 적기인 이유", category: "투자", date: "2026.03.15", excerpt: "금리 인하 사이클이 시작되면서, 은퇴 자산 포트폴리오의 리밸런싱이 필요한 시점입니다. 전문가들의 조언을 정리했습니다." },
    { title: "시니어 비즈니스맨을 위한 퍼스널 브랜딩 전략", category: "브랜딩", date: "2026.03.12", excerpt: "30년의 경험을 가진 당신, 그 경험을 브랜드로 만들어보세요. 시니어 전문가를 위한 퍼스널 브랜딩 가이드." },
    { title: "정년 후 사회공헌, 경험을 나누는 멘토링 프로그램", category: "사회공헌", date: "2026.03.10", excerpt: "은퇴 후 사회에 기여하는 가장 의미 있는 방법 중 하나인 멘토링. 시니어 전문가들이 참여할 수 있는 프로그램을 소개합니다." },
    { title: "60대 건강관리 체크리스트: 전문의가 말하는 필수 검진", category: "건강", date: "2026.03.08", excerpt: "은퇴 후 가장 중요한 자산은 건강입니다. 60대에 반드시 챙겨야 할 건강 검진 항목과 생활 습관을 정리했습니다." },
    { title: "골프로 맺어지는 비즈니스: 시니어 골프 네트워킹", category: "라이프", date: "2026.03.05", excerpt: "골프장에서 시작되는 인연이 비즈니스로 이어집니다. Domo 멤버들의 골프 네트워킹 이야기." },
    { title: "스타트업에 투자하는 시니어들: 엔젤 투자의 세계", category: "투자", date: "2026.03.03", excerpt: "경험과 자본을 갖춘 시니어 엔젤 투자자들이 늘고 있습니다. 스타트업 투자의 기본과 주의할 점을 알아봅니다." },
];

export default function DomoInsights() {
    const [activeCategory, setActiveCategory] = useState("전체");

    const filtered = activeCategory === "전체" ? articles : articles.filter((a) => a.category === activeCategory);

    return (
        <div>
            {/* Hero */}
            <section className="py-24 px-6 bg-gradient-to-br from-[#2D1B2E] to-[#1E1220] text-white">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">인사이트</h1>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                        경험에서 우러나온 비즈니스 지혜.<br />
                        시니어 비즈니스맨을 위한 깊이 있는 콘텐츠.
                    </p>
                </div>
            </section>

            {/* 카테고리 필터 */}
            <section className="py-8 px-6 border-b border-neutral-200">
                <div className="mx-auto max-w-5xl flex items-center gap-2 flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 text-sm rounded-full transition-colors ${activeCategory === cat
                                ? "bg-[#7F1146] text-white"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* 글 목록 */}
            <section className="py-12 px-6">
                <div className="mx-auto max-w-5xl space-y-0">
                    {filtered.map((article, i) => (
                        <Link key={i} href="/domo/insights" className="block py-6 border-b border-neutral-200 group">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[10px] font-semibold text-[#7F1146] bg-[#7F1146]/10 px-2 py-0.5 rounded">{article.category}</span>
                                <span className="text-xs text-neutral-400">{article.date}</span>
                            </div>
                            <h3 className="font-bold text-lg text-neutral-900 group-hover:text-[#7F1146] transition-colors mb-2">
                                {article.title}
                            </h3>
                            <p className="text-sm text-neutral-600 line-clamp-2">{article.excerpt}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
