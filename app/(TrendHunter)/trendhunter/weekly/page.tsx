"use client";

import { Calendar, TrendingUp, ArrowRight, Eye, Clock, BarChart3 } from "lucide-react";
import Link from "next/link";

const weeklyReports = [
    {
        id: "w12",
        week: "2026년 3월 4주차",
        date: "2026.03.24 ~ 03.28",
        title: "에이전트 AI 도입 가속 + 숏폼 피로도 확산",
        topKeywords: ["에이전트 AI", "슬로우 콘텐츠", "체험형 소비", "로컬 크리에이터", "디지털 디톡스"],
        summary: "이번 주 전 플랫폼에서 '에이전트 AI'가 1위 키워드로 등극. 카카오 오픈채팅에서는 실무 도입 사례가, 커뮤니티에서는 직무 대체 우려가 동시에 상승. 한편 숏폼 콘텐츠 체류 시간 감소 시그널이 다수 포착됨.",
        platformTemp: { kakao: "뜨거움", community: "관심", news: "보통" },
        views: 1247,
        isLatest: true,
    },
    {
        id: "w11",
        week: "2026년 3월 3주차",
        date: "2026.03.17 ~ 03.21",
        title: "Z세대 가치소비 심화 + AI 영상 편집 급부상",
        topKeywords: ["Z세대 가치소비", "AI 영상 편집", "하이퍼로컬", "구독 피로", "크리에이터 이코노미"],
        summary: "Z세대의 가치 기반 소비 패턴이 전 플랫폼에서 확인됨. AI 영상 편집 관련 키워드가 전주 대비 340% 증가. 로컬 크리에이터의 글로벌 확산 사례가 뉴스에서 다수 보도.",
        platformTemp: { kakao: "관심", community: "뜨거움", news: "뜨거움" },
        views: 2156,
        isLatest: false,
    },
    {
        id: "w10",
        week: "2026년 3월 2주차",
        date: "2026.03.10 ~ 03.14",
        title: "공간 컴퓨팅 대중화 논쟁 + 프리랜서 시장 변화",
        topKeywords: ["공간 컴퓨팅", "프리랜서 플랫폼", "AI 카피라이팅", "마이크로 SaaS", "브랜드 콜라보"],
        summary: "공간 컴퓨팅 디바이스 출시 러시 속에서 대중화 가능성에 대한 찬반 논쟁이 활발. 프리랜서 시장에서 AI 툴 활용 능력이 단가에 직결되는 추세 확인.",
        platformTemp: { kakao: "보통", community: "관심", news: "뜨거움" },
        views: 1893,
        isLatest: false,
    },
];

const tempColor: Record<string, string> = {
    "뜨거움": "text-red-400 bg-red-400/10",
    "관심": "text-yellow-400 bg-yellow-400/10",
    "보통": "text-neutral-400 bg-neutral-400/10",
};

export default function TrendHunterWeeklyPage() {
    return (
        <div className="bg-[#0A0A0A]">
            {/* Hero */}
            <section className="py-20 sm:py-28 px-6">
                <div className="mx-auto max-w-5xl">
                    <span className="text-[#E50000] text-xs font-mono tracking-widest">WEEKLY TREND REPORT</span>
                    <h1 className="text-3xl sm:text-5xl font-bold text-white mt-4 mb-4">주간 트렌드 리포트</h1>
                    <p className="text-neutral-400 text-lg max-w-2xl">
                        매주 월요일 발행. 전 플랫폼(카카오 오픈채팅·커뮤니티·뉴스·디스코드) 수집 데이터를
                        AI가 분석하고 전문가가 큐레이션한 위클리 리포트.
                    </p>
                </div>
            </section>

            {/* 리포트 목록 */}
            <section className="px-6 pb-24">
                <div className="mx-auto max-w-5xl space-y-6">
                    {weeklyReports.map((report) => (
                        <article
                            key={report.id}
                            className={`group p-8 rounded-2xl border transition-all duration-300 ${
                                report.isLatest
                                    ? "border-[#E50000]/30 bg-[#E50000]/5"
                                    : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"
                            }`}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-[#E50000] text-xs font-mono tracking-wider">{report.week}</span>
                                {report.isLatest && (
                                    <span className="text-[10px] font-mono bg-[#E50000] text-white px-2 py-0.5 rounded">LATEST</span>
                                )}
                                <span className="text-neutral-600 text-xs font-mono">{report.date}</span>
                            </div>

                            <h2 className="text-white font-bold text-xl mb-3 group-hover:text-[#FFB800] transition-colors">
                                {report.title}
                            </h2>

                            <p className="text-neutral-400 text-sm leading-relaxed mb-4">{report.summary}</p>

                            {/* 핫 키워드 */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {report.topKeywords.map((kw, i) => (
                                    <span
                                        key={kw}
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                            i === 0 ? "bg-[#E50000]/20 text-[#E50000]" : "bg-neutral-800 text-neutral-400"
                                        }`}
                                    >
                                        #{kw}
                                    </span>
                                ))}
                            </div>

                            {/* 플랫폼 온도 */}
                            <div className="flex items-center gap-4 mb-4">
                                {Object.entries(report.platformTemp).map(([platform, temp]) => (
                                    <div key={platform} className="flex items-center gap-1.5">
                                        <span className="text-neutral-500 text-[10px] font-mono">{platform}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${tempColor[temp]}`}>{temp}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1 text-xs text-neutral-500">
                                    <Eye className="w-3 h-3" /> {report.views.toLocaleString()}
                                </span>
                                <button className="inline-flex items-center gap-2 text-sm text-white hover:text-[#FFB800] transition-colors">
                                    리포트 보기 <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
