"use client";

import { ExternalLink } from "lucide-react";

const portfolios = [
    {
        title: "스타트업 A사 SNS 마케팅 전략",
        team: "Team Alpha",
        gen: "4기",
        category: "소셜 마케팅",
        desc: "신생 뷰티 브랜드의 인스타그램 채널 론칭부터 3개월 간 팔로워 5,000명 달성까지의 전 과정",
        tags: ["인스타그램", "콘텐츠 전략", "뷰티"],
        image: null,
    },
    {
        title: "로컬 카페 브랜드 리뉴얼",
        team: "Team Brew",
        gen: "4기",
        category: "브랜딩",
        desc: "합정동 로컬 카페의 브랜드 아이덴티티 리뉴얼 및 오프라인 마케팅 캠페인 기획·실행",
        tags: ["브랜딩", "로컬", "오프라인"],
        image: null,
    },
    {
        title: "AI 활용 퍼포먼스 광고 최적화",
        team: "Team Neural",
        gen: "4기",
        category: "퍼포먼스",
        desc: "Meta Ads와 AI 카피라이팅 도구를 결합한 광고 A/B 테스트 자동화 및 ROAS 개선 프로젝트",
        tags: ["AI", "Meta Ads", "ROAS"],
        image: null,
    },
    {
        title: "대학생 타겟 앱 런칭 캠페인",
        team: "Team Launch",
        gen: "3기",
        category: "캠페인",
        desc: "교육 스타트업의 신규 앱 런칭을 위한 대학생 타겟 통합 마케팅 캠페인 전략 및 실행",
        tags: ["런칭", "통합 마케팅", "앱"],
        image: null,
    },
    {
        title: "ESG 캠페인 콘텐츠 제작",
        team: "Team Green",
        gen: "3기",
        category: "콘텐츠",
        desc: "중소기업의 ESG 활동을 대학생 시각에서 재해석한 숏폼 콘텐츠 시리즈 기획·제작",
        tags: ["ESG", "숏폼", "유튜브"],
        image: null,
    },
    {
        title: "데이터 기반 고객 세그먼트 분석",
        team: "Team Insight",
        gen: "3기",
        category: "데이터",
        desc: "이커머스 고객 데이터를 분석하여 세그먼트별 맞춤 마케팅 전략 제안",
        tags: ["데이터 분석", "세그먼트", "이커머스"],
        image: null,
    },
];

const categories = ["전체", "소셜 마케팅", "브랜딩", "퍼포먼스", "캠페인", "콘텐츠", "데이터"];

export default function MadLeapPortfolioPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-black text-white py-20 md:py-24">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">포트폴리오</h1>
                    <p className="text-neutral-400">매드립 리퍼들의 실전 프로젝트 결과물</p>
                </div>
            </section>

            {/* Filter */}
            <section className="border-b border-neutral-200 sticky top-16 bg-white z-30">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex items-center gap-2 py-4 overflow-x-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                                    cat === "전체"
                                        ? "bg-black text-white"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Portfolio Grid */}
            <section className="py-16 md:py-24">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolios.map((p) => (
                            <div key={p.title} className="group border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                                {/* Thumbnail placeholder */}
                                <div className="aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                                    <span className="text-3xl font-black text-neutral-300">
                                        {p.team}
                                    </span>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs px-2 py-0.5 bg-[#00B8FF]/10 text-[#00B8FF] rounded font-medium">
                                            {p.category}
                                        </span>
                                        <span className="text-xs text-neutral-400">{p.gen}</span>
                                    </div>
                                    <h3 className="font-bold mb-2 group-hover:text-[#00B8FF] transition-colors">
                                        {p.title}
                                    </h3>
                                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{p.desc}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {p.tags.map((tag) => (
                                            <span key={tag} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-neutral-50 py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-xl font-bold mb-3">나의 프로젝트를 추가하고 싶다면?</h2>
                    <p className="text-neutral-500 text-sm mb-6">매드립 리퍼라면 누구나 포트폴리오를 등록할 수 있습니다</p>
                    <button className="px-6 py-3 bg-[#00B8FF] text-white font-medium hover:bg-[#0090CC] transition-colors rounded inline-flex items-center gap-2">
                        포트폴리오 등록 <ExternalLink className="h-4 w-4" />
                    </button>
                </div>
            </section>
        </>
    );
}
