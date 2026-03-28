"use client";

import { useState } from "react";
import { ExternalLink, Award, Filter } from "lucide-react";

/* ── Portfolio Data ── */

type Portfolio = {
    title: string;
    team: string;
    gen: string;
    genNum: number;
    category: string;
    desc: string;
    tags: string[];
    award?: string;
    client: string;
    gradient: string;
};

const portfolios: Portfolio[] = [
    // 4기
    {
        title: "지평주조 MZ세대 공략 마케팅 전략",
        team: "Team HOPS",
        gen: "4기",
        genNum: 4,
        category: "마케팅 전략",
        client: "지평주조",
        desc: "지평막걸리의 MZ세대 음용 빈도를 높이기 위한 통합 마케팅 전략. SNS 바이럴 + 팝업스토어 + 인플루언서 협업 제안.",
        tags: ["IMC", "주류마케팅", "MZ타겟"],
        award: "경쟁PT 대상",
        gradient: "from-amber-400 to-orange-500",
    },
    {
        title: "한국관광공사 MZ 관광 콘텐츠 캠페인",
        team: "Team Wander",
        gen: "4기",
        genNum: 4,
        category: "콘텐츠",
        client: "한국관광공사",
        desc: "2030 해외 관광객 유치를 위한 숏폼 콘텐츠 시리즈 기획·제작. 틱톡/릴스 기반 K-관광 콘텐츠 30편.",
        tags: ["관광마케팅", "숏폼", "글로벌"],
        gradient: "from-sky-400 to-blue-500",
    },
    {
        title: "올리브영 자체 브랜드 런칭 전략",
        team: "Team Glow",
        gen: "4기",
        genNum: 4,
        category: "브랜딩",
        client: "올리브영",
        desc: "올리브영 PB 스킨케어 라인 런칭 마케팅. 소비자 설문 200건 기반 포지셔닝 및 커뮤니케이션 전략 수립.",
        tags: ["뷰티", "PB", "브랜드 런칭"],
        award: "경쟁PT 우수상",
        gradient: "from-green-400 to-emerald-500",
    },
    {
        title: "AI 기반 퍼포먼스 광고 최적화",
        team: "Team Neural",
        gen: "4기",
        genNum: 4,
        category: "퍼포먼스",
        client: "스타트업 A사",
        desc: "Meta Ads + AI 카피라이팅 도구를 결합한 광고 A/B 테스트 자동화. ROAS 180% 개선 달성.",
        tags: ["AI", "Meta Ads", "ROAS"],
        gradient: "from-violet-400 to-purple-500",
    },
    // 3기
    {
        title: "스타벅스 코리아 로컬 브랜딩 캠페인",
        team: "Team Brew",
        gen: "3기",
        genNum: 3,
        category: "브랜딩",
        client: "스타벅스 코리아",
        desc: "전주·경주·강릉 등 지역 특화 매장의 로컬 브랜딩 전략 제안. 지역 문화 요소를 접목한 굿즈 기획.",
        tags: ["로컬", "브랜딩", "F&B"],
        award: "경쟁PT 최우수상",
        gradient: "from-emerald-400 to-teal-500",
    },
    {
        title: "무신사 스탠다드 대학생 앰배서더 프로그램",
        team: "Team STND",
        gen: "3기",
        genNum: 3,
        category: "캠페인",
        client: "무신사",
        desc: "무신사 스탠다드의 대학생 앰배서더 프로그램 기획. 캠퍼스별 룩북 콘텐츠 + UGC 캠페인 전략.",
        tags: ["패션", "UGC", "앰배서더"],
        gradient: "from-neutral-600 to-neutral-800",
    },
    {
        title: "당근마켓 동네 소상공인 광고 패키지",
        team: "Team Carrot",
        gen: "3기",
        genNum: 3,
        category: "마케팅 전략",
        client: "당근마켓",
        desc: "동네 소상공인을 위한 합리적 가격대의 하이퍼로컬 광고 패키지 기획. 단계별 요금제 + 성과 측정 대시보드 제안.",
        tags: ["하이퍼로컬", "소상공인", "광고상품"],
        award: "경쟁PT 우수상",
        gradient: "from-orange-400 to-red-400",
    },
    {
        title: "대학생 대상 금융 리터러시 콘텐츠",
        team: "Team Fin",
        gen: "3기",
        genNum: 3,
        category: "콘텐츠",
        client: "토스",
        desc: "토스 앱 내 대학생 금융 교육 콘텐츠 시리즈 기획. 웹툰 형식의 금융 지식 콘텐츠 12편 제작.",
        tags: ["핀테크", "콘텐츠", "웹툰"],
        gradient: "from-blue-500 to-indigo-500",
    },
    // 2기
    {
        title: "배달의민족 B마트 대학가 프로모션",
        team: "Team Bmin",
        gen: "2기",
        genNum: 2,
        category: "캠페인",
        client: "배달의민족",
        desc: "B마트의 대학가 침투율 확대를 위한 기숙사 타겟 프로모션 기획. 시험 기간 특별 패키지 제안.",
        tags: ["딜리버리", "프로모션", "대학생"],
        gradient: "from-cyan-400 to-blue-400",
    },
    {
        title: "소셜 커머스 데이터 기반 고객 세그먼트 분석",
        team: "Team Insight",
        gen: "2기",
        genNum: 2,
        category: "데이터",
        client: "쿠팡",
        desc: "이커머스 고객 구매 데이터 기반 세그먼트 분류 및 맞춤 CRM 전략 제안. Python 클러스터링 분석.",
        tags: ["데이터분석", "CRM", "이커머스"],
        gradient: "from-rose-400 to-pink-500",
    },
    // 1기
    {
        title: "로컬 카페 브랜드 리뉴얼 프로젝트",
        team: "Team Origin",
        gen: "1기",
        genNum: 1,
        category: "브랜딩",
        client: "합정동 로컬카페",
        desc: "합정동 로컬 카페의 브랜드 아이덴티티 리뉴얼. 로고, 메뉴판, 인테리어 가이드, 인스타그램 채널 기획.",
        tags: ["로컬", "BI", "카페"],
        gradient: "from-amber-300 to-yellow-400",
    },
    {
        title: "대학생 자기개발 앱 마케팅 전략",
        team: "Team Rise",
        gen: "1기",
        genNum: 1,
        category: "마케팅 전략",
        client: "에듀테크 스타트업",
        desc: "교육 스타트업의 자기개발 앱 대학생 타겟 GTM 전략. 캠퍼스 오프라인 이벤트 + 바이럴 콘텐츠.",
        tags: ["에듀테크", "GTM", "바이럴"],
        gradient: "from-lime-400 to-green-500",
    },
];

const categories = ["전체", "마케팅 전략", "브랜딩", "퍼포먼스", "캠페인", "콘텐츠", "데이터"];
const generations = ["전체", "4기", "3기", "2기", "1기"];

export default function MadLeapPortfolioPage() {
    const [selectedCat, setSelectedCat] = useState("전체");
    const [selectedGen, setSelectedGen] = useState("전체");

    const filtered = portfolios.filter((p) => {
        const catMatch = selectedCat === "전체" || p.category === selectedCat;
        const genMatch = selectedGen === "전체" || p.gen === selectedGen;
        return catMatch && genMatch;
    });

    const awardCount = portfolios.filter((p) => p.award).length;

    return (
        <>
            {/* Hero */}
            <section className="bg-[#1a1a2e] text-white py-20 md:py-24">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <p className="text-[#4361ee] text-sm font-semibold tracking-wider uppercase mb-3">Portfolio</p>
                    <h1 className="text-2xl md:text-4xl font-bold mb-4">매드립 리퍼들의 실전 프로젝트</h1>
                    <p className="text-neutral-400">1기부터 4기까지, 실제 브랜드와 함께한 결과물</p>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-8 mt-8">
                        <div className="text-center">
                            <div className="text-2xl font-black text-[#4361ee]">{portfolios.length}</div>
                            <div className="text-xs text-neutral-400">프로젝트</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-[#4361ee]">{awardCount}</div>
                            <div className="text-xs text-neutral-400">수상작</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-[#4361ee]">4</div>
                            <div className="text-xs text-neutral-400">기수</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter */}
            <section className="border-b border-neutral-200 sticky top-16 bg-white z-30 shadow-sm">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="flex items-center gap-6 py-4">
                        {/* Gen filter */}
                        <div className="flex items-center gap-1.5 overflow-x-auto shrink-0">
                            <Filter className="h-4 w-4 text-neutral-400 shrink-0" />
                            {generations.map((gen) => (
                                <button
                                    key={gen}
                                    onClick={() => setSelectedGen(gen)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                                        selectedGen === gen
                                            ? "bg-[#1a1a2e] text-white"
                                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                                >
                                    {gen}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-6 bg-neutral-200 shrink-0" />

                        {/* Category filter */}
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCat(cat)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                                        selectedCat === cat
                                            ? "bg-[#4361ee] text-white"
                                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Results count */}
            <section className="pt-6 pb-2">
                <div className="mx-auto max-w-5xl px-6">
                    <p className="text-sm text-neutral-400">
                        {filtered.length}개 프로젝트
                        {selectedGen !== "전체" && ` · ${selectedGen}`}
                        {selectedCat !== "전체" && ` · ${selectedCat}`}
                    </p>
                </div>
            </section>

            {/* Portfolio Grid */}
            <section className="py-8 pb-16 md:pb-24">
                <div className="mx-auto max-w-5xl px-6">
                    {filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-neutral-400 text-lg">해당 조건에 맞는 프로젝트가 없습니다</p>
                            <button
                                onClick={() => { setSelectedCat("전체"); setSelectedGen("전체"); }}
                                className="mt-4 text-sm text-[#4361ee] hover:underline"
                            >
                                필터 초기화
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((p) => (
                                <div key={p.title} className="group border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#4361ee]/20 transition-all">
                                    {/* Thumbnail */}
                                    <div className={`aspect-video bg-gradient-to-br ${p.gradient} relative flex items-center justify-center overflow-hidden`}>
                                        <div className="text-center z-10">
                                            <span className="text-white/90 text-xl md:text-2xl font-black drop-shadow-sm">
                                                {p.team}
                                            </span>
                                            <p className="text-white/60 text-xs mt-1">{p.client}</p>
                                        </div>
                                        {p.award && (
                                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-[10px] font-bold">
                                                <Award className="h-3 w-3" />
                                                {p.award}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] px-2 py-0.5 bg-[#4361ee]/10 text-[#4361ee] rounded font-medium">
                                                {p.category}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 bg-[#1a1a2e]/10 text-[#1a1a2e] rounded font-medium">
                                                {p.gen}
                                            </span>
                                            <span className="text-[10px] text-neutral-400 ml-auto">{p.client}</span>
                                        </div>
                                        <h3 className="font-bold text-[15px] mb-2 group-hover:text-[#4361ee] transition-colors line-clamp-2">
                                            {p.title}
                                        </h3>
                                        <p className="text-neutral-500 text-sm mb-4 line-clamp-2">{p.desc}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {p.tags.map((tag) => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-neutral-50 py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-xl font-bold mb-3">나의 프로젝트를 추가하고 싶다면?</h2>
                    <p className="text-neutral-500 text-sm mb-6">매드립 리퍼라면 누구나 포트폴리오를 등록할 수 있습니다</p>
                    <button className="px-6 py-3 bg-[#4361ee] text-white font-medium hover:bg-[#3451de] transition-colors rounded-lg inline-flex items-center gap-2">
                        포트폴리오 등록 <ExternalLink className="h-4 w-4" />
                    </button>
                </div>
            </section>
        </>
    );
}
