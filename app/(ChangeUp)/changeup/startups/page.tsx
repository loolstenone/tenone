"use client";

import Link from "next/link";
import { ExternalLink, TrendingUp, Users, Calendar, ArrowRight } from "lucide-react";

const startups = [
    {
        name: "에코박스",
        logo: "E",
        founder: "김서연",
        founderDetail: "고등학교 2학년 재학 중",
        desc: "AI 이미지 인식으로 재활용 분류를 자동화하는 모바일 앱. 카메라로 쓰레기를 찍으면 분리수거 방법을 알려줍니다.",
        category: "환경·AI",
        fundType: "Family Fund",
        raised: "500만원",
        stage: "MVP 완료",
        date: "2025.09",
        color: "#1AAD64",
    },
    {
        name: "스터디메이트",
        logo: "S",
        founder: "박준영",
        founderDetail: "대학교 2학년",
        desc: "AI 기반 1:1 튜터링 매칭 플랫폼. 학생의 학습 스타일을 분석해 최적의 튜터를 추천합니다.",
        category: "교육·AI",
        fundType: "Community Fund",
        raised: "1,200만원",
        stage: "베타 서비스",
        date: "2025.06",
        color: "#256EFF",
    },
    {
        name: "로컬잇",
        logo: "L",
        founder: "이하나",
        founderDetail: "대학교 3학년",
        desc: "동네 소상공인을 위한 AI 마케팅 도구. SNS 콘텐츠 자동 생성, 리뷰 분석, 고객 관리를 한 번에.",
        category: "마케팅·AI",
        fundType: "School Grant",
        raised: "800만원",
        stage: "정식 런칭",
        date: "2025.03",
        color: "#9333EA",
    },
    {
        name: "펫닥터",
        logo: "P",
        founder: "최민수",
        founderDetail: "고등학교 3학년",
        desc: "반려동물 증상을 AI로 사전 진단하고 가까운 동물병원을 추천하는 서비스.",
        category: "반려동물·AI",
        fundType: "Family Fund",
        raised: "200만원",
        stage: "프로토타입",
        date: "2026.01",
        color: "#F59E0B",
    },
    {
        name: "캠퍼스잇",
        logo: "C",
        founder: "정수아, 한지민",
        founderDetail: "대학교 1학년",
        desc: "대학 캠퍼스 내 음식 배달·공동구매 플랫폼. 학생 할인과 친환경 포장을 결합.",
        category: "푸드테크",
        fundType: "Community Fund",
        raised: "1,500만원",
        stage: "베타 서비스",
        date: "2025.11",
        color: "#EC4899",
    },
    {
        name: "스쿨톡",
        logo: "T",
        founder: "김도현",
        founderDetail: "고등학교 1학년",
        desc: "학교 공지사항, 시간표, 과제를 AI로 정리해서 알려주는 학생용 비서 앱.",
        category: "교육·생산성",
        fundType: "School Grant",
        raised: "150만원",
        stage: "MVP 개발 중",
        date: "2026.02",
        color: "#06B6D4",
    },
];

const stageColors: Record<string, string> = {
    "프로토타입": "bg-amber-50 text-amber-700",
    "MVP 개발 중": "bg-orange-50 text-orange-700",
    "MVP 완료": "bg-blue-50 text-blue-700",
    "베타 서비스": "bg-purple-50 text-purple-700",
    "정식 런칭": "bg-green-50 text-green-700",
};

export default function StartupsPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#0F1F2E] to-[#1a3a52] text-white py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black">스타트업</h1>
                    <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
                        ChangeUp에서 탄생한 청소년·대학생 스타트업들.
                        작은 아이디어에서 시작된 큰 변화를 만나보세요.
                    </p>
                </div>
            </section>

            {/* Startups Grid */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {startups.map((startup) => (
                            <div key={startup.name} className="border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-shadow group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black"
                                        style={{ background: `linear-gradient(135deg, ${startup.color}, ${startup.color}CC)` }}
                                    >
                                        {startup.logo}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold group-hover:text-[#1AAD64] transition-colors">{startup.name}</h3>
                                        <p className="text-xs text-neutral-500">{startup.founder} · {startup.founderDetail}</p>
                                    </div>
                                </div>

                                <p className="text-sm text-neutral-600 leading-relaxed mb-4">{startup.desc}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">{startup.category}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${stageColors[startup.stage] || "bg-neutral-100 text-neutral-600"}`}>
                                        {startup.stage}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm border-t border-neutral-100 pt-4">
                                    <div>
                                        <span className="text-neutral-400">{startup.fundType}</span>
                                        <span className="ml-2 font-bold" style={{ color: startup.color }}>{startup.raised}</span>
                                    </div>
                                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {startup.date}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-r from-[#1AAD64] to-[#256EFF] text-white py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-2xl sm:text-3xl font-black mb-4">다음은 당신의 차례입니다</h2>
                    <p className="text-white/80 mb-8">
                        아이디어가 있다면 ChangeUp이 창업까지의 여정을 함께합니다.
                    </p>
                    <Link
                        href="/changeup/programs"
                        className="inline-flex items-center gap-2 bg-white text-[#1AAD64] px-8 py-3 rounded-full font-bold hover:bg-neutral-100 transition-colors"
                    >
                        프로그램 신청하기 <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
