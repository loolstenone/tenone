"use client";

import Link from "next/link";
import { GraduationCap, Rocket, Lightbulb, Brain, Calendar, Clock, Users, ChevronRight, ArrowRight, CheckCircle2 } from "lucide-react";

const programs = [
    {
        id: "highschool-camp",
        icon: GraduationCap,
        title: "고등학생 창업 캠프",
        subtitle: "방학 집중 2주 프로그램",
        target: "고등학생 (1~3학년)",
        duration: "2주 (월~금, 오전 10시~오후 5시)",
        schedule: "하계: 7월 / 동계: 1월",
        capacity: "팀당 4명, 최대 10팀",
        color: "#1AAD64",
        features: [
            "AI 도구 (ChatGPT, Cursor, Canva AI) 실습",
            "아이디어 발굴 → 비즈니스 모델 캔버스 설계",
            "프로토타입 제작 및 사용자 테스트",
            "데모데이 발표 & 가족 투자 피칭",
            "수료증 및 생활기록부 기재 지원",
        ],
        price: "참가비 무료 (지역사회 후원)",
    },
    {
        id: "college-bootcamp",
        icon: Rocket,
        title: "대학생 스타트업 부트캠프",
        subtitle: "12주 실전 창업 프로그램",
        target: "대학생 및 휴학생",
        duration: "12주 (매주 토요일 종일)",
        schedule: "상반기: 3월 / 하반기: 9월",
        capacity: "팀당 3~5명, 최대 8팀",
        color: "#256EFF",
        features: [
            "팀 빌딩 & 공동 창업자 매칭",
            "MVP(최소 기능 제품) 개발 실습",
            "고객 인터뷰 & 시장 검증",
            "AI 기반 마케팅·영업 자동화 전략",
            "투자자 앞 피칭 & 데모데이",
            "우수 팀 시드 투자 연계",
        ],
        price: "참가비 10만원 (보증금, 수료 시 환급)",
    },
    {
        id: "ai-workshop",
        icon: Brain,
        title: "AI 비즈니스 워크숍",
        subtitle: "주말 1일 집중 워크숍",
        target: "고등학생·대학생 누구나",
        duration: "1일 (오전 10시~오후 6시)",
        schedule: "매월 셋째 주 토요일",
        capacity: "최대 30명",
        color: "#9333EA",
        features: [
            "AI 에이전트 만들기 (no-code/low-code)",
            "ChatGPT API 활용 수익 모델 설계",
            "AI 자동화 도구로 1인 창업 실습",
            "실제 수익화 사례 분석",
            "네트워킹 세션",
        ],
        price: "참가비 3만원",
    },
    {
        id: "idea-lab",
        icon: Lightbulb,
        title: "아이디어 랩",
        subtitle: "온라인 상시 프로그램",
        target: "아이디어가 있는 누구나",
        duration: "상시 운영 (온라인)",
        schedule: "24/7 접속 가능",
        capacity: "제한 없음",
        color: "#F59E0B",
        features: [
            "AI 아이디어 검증 도구 무료 이용",
            "멘토 1:1 온라인 상담 (월 1회)",
            "창업 아이디어 게시판 & 피드백",
            "팀 빌딩 매칭 시스템",
            "온라인 커뮤니티 참여",
        ],
        price: "완전 무료",
    },
];

export default function ProgramsPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#0F1F2E] to-[#1a3a52] text-white py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black">프로그램</h1>
                    <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
                        AI 시대에 맞는 창업 교육. 고등학생부터 대학생까지,
                        단계별 프로그램으로 아이디어를 현실로 만듭니다.
                    </p>
                </div>
            </section>

            {/* Programs */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
                    {programs.map((prog, idx) => (
                        <div key={prog.id} className="border border-neutral-200 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-8 sm:p-10" style={{ borderTop: `4px solid ${prog.color}` }}>
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Left */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${prog.color}15` }}>
                                                <prog.icon className="w-6 h-6" style={{ color: prog.color }} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold">{prog.title}</h2>
                                                <p className="text-sm text-neutral-500">{prog.subtitle}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-6">
                                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                <Users className="w-4 h-4 text-neutral-400" />
                                                {prog.target}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                <Clock className="w-4 h-4 text-neutral-400" />
                                                {prog.duration}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                <Calendar className="w-4 h-4 text-neutral-400" />
                                                {prog.schedule}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                                                <Users className="w-4 h-4 text-neutral-400" />
                                                {prog.capacity}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right */}
                                    <div className="lg:w-96">
                                        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">커리큘럼</h3>
                                        <ul className="space-y-2">
                                            {prog.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: prog.color }} />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-6 flex items-center justify-between">
                                            <span className="text-sm font-bold" style={{ color: prog.color }}>{prog.price}</span>
                                            <Link
                                                href="/changeup/community"
                                                className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
                                                style={{ color: prog.color }}
                                            >
                                                신청하기 <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-neutral-50 py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">어떤 프로그램이 맞을지 모르겠다면?</h2>
                    <p className="text-neutral-500 mb-8">상담을 신청하세요. 당신에게 딱 맞는 프로그램을 추천해 드립니다.</p>
                    <Link
                        href="/changeup/about"
                        className="inline-flex items-center gap-2 bg-[#1AAD64] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#148F52] transition-colors"
                    >
                        무료 상담 신청 <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
