"use client";

import Link from "next/link";
import { Users, Building2, Target, Heart, Shield, TrendingUp, ArrowRight, CheckCircle2, HandCoins, School, Home } from "lucide-react";

const investTypes = [
    {
        icon: Home,
        title: "Family Fund",
        subtitle: "부모 투자",
        desc: "자녀의 창업 아이디어에 부모님이 직접 투자합니다. 용돈이 아닌 '투자'로 경제 교육과 창업 경험을 동시에 제공합니다.",
        color: "#1AAD64",
        minAmount: "50만원",
        maxAmount: "300만원",
        features: [
            "자녀 아이디어 검증 보고서 제공",
            "월 1회 부모-자녀 경영 회의",
            "전문 멘토 배정",
            "데모데이 초청 & 투자 성과 리포트",
            "세금 혜택 안내 (청소년 창업 지원금)",
        ],
        howItWorks: [
            "자녀가 아이디어 제출",
            "ChangeUp 멘토 검증 & 피드백",
            "부모님께 투자 제안서 전달",
            "Family Fund 계약 체결",
            "월별 마일스톤 체크 & 리포트",
        ],
    },
    {
        icon: School,
        title: "School Grant",
        subtitle: "학교 지원",
        desc: "학교 내 창업 동아리·교과 연계 프로그램을 통해 학생들의 창업 활동을 공식적으로 지원합니다.",
        color: "#256EFF",
        minAmount: "100만원",
        maxAmount: "500만원",
        features: [
            "교내 창업 동아리 운영 지원",
            "창업 교육 커리큘럼 제공 (교사 연수 포함)",
            "교내 창업 대회 기획·운영",
            "생활기록부 창업 활동 기재 가이드",
            "우수 팀 지역 대회 연계",
        ],
        howItWorks: [
            "학교 담당 교사 신청",
            "ChangeUp 프로그램 설계 미팅",
            "학교 MOU 체결",
            "지원금 집행 & 프로그램 운영",
            "학기말 성과 보고서 제출",
        ],
    },
    {
        icon: Building2,
        title: "Community Fund",
        subtitle: "지역사회 투자",
        desc: "지역 기업, 자영업자, 로컬 단체가 청소년 스타트업에 투자합니다. 지역 경제를 살리는 선순환 투자 모델입니다.",
        color: "#9333EA",
        minAmount: "300만원",
        maxAmount: "2,000만원",
        features: [
            "지역 청소년 스타트업 포트폴리오 매칭",
            "투자 기업 브랜딩 & CSR 리포트",
            "데모데이 심사위원 참여",
            "스타트업 제품·서비스 우선 이용권",
            "세액 공제 & 사회적 가치 인증",
        ],
        howItWorks: [
            "투자 의향서 접수",
            "지역 스타트업 포트폴리오 제공",
            "투자 대상 선정 & 미팅",
            "투자 계약 체결 (ChangeUp 중개)",
            "분기별 성과 리포트 & 네트워킹",
        ],
    },
];

const whyInvest = [
    {
        icon: Heart,
        title: "교육적 가치",
        desc: "단순한 기부가 아닌, 실전 경험을 통한 교육 투자입니다.",
    },
    {
        icon: Shield,
        title: "안전한 구조",
        desc: "ChangeUp이 중개·관리하며, 투명한 자금 운용 보고서를 제공합니다.",
    },
    {
        icon: TrendingUp,
        title: "성장 가능성",
        desc: "실제 수익을 창출하는 스타트업으로 발전할 수 있습니다.",
    },
    {
        icon: Users,
        title: "네트워크 효과",
        desc: "투자자, 멘토, 학생이 연결되는 지역 창업 생태계를 만듭니다.",
    },
];

export default function InvestPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#0F1F2E] to-[#1a3a52] text-white py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm mb-6">
                        <HandCoins className="w-4 h-4 text-[#1AAD64]" />
                        <span>세상에서 가장 따뜻한 투자</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black">투자 프로그램</h1>
                    <p className="mt-4 text-lg text-neutral-300 max-w-2xl">
                        부모, 학교, 지역사회가 청소년의 꿈에 투자합니다.
                        가장 작은 금액이 가장 큰 변화를 만듭니다.
                    </p>
                </div>
            </section>

            {/* Why Invest */}
            <section className="py-16 bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-center mb-10">왜 청소년 창업에 투자할까요?</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {whyInvest.map((item) => (
                            <div key={item.title} className="bg-white rounded-2xl p-6 text-center border border-neutral-200">
                                <div className="w-12 h-12 rounded-full bg-[#1AAD64]/10 flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="w-6 h-6 text-[#1AAD64]" />
                                </div>
                                <h3 className="font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-neutral-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Investment Types */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
                    {investTypes.map((type, idx) => (
                        <div key={type.title} className="border border-neutral-200 rounded-3xl overflow-hidden" style={{ borderTop: `4px solid ${type.color}` }}>
                            <div className="p-8 sm:p-10">
                                <div className="flex flex-col lg:flex-row gap-10">
                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${type.color}15` }}>
                                                <type.icon className="w-6 h-6" style={{ color: type.color }} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold">{type.title}</h2>
                                                <p className="text-sm text-neutral-500">{type.subtitle}</p>
                                            </div>
                                        </div>
                                        <p className="text-neutral-600 leading-relaxed mb-6">{type.desc}</p>
                                        <div className="flex items-center gap-6 mb-6">
                                            <div>
                                                <div className="text-xs text-neutral-400">최소 투자금</div>
                                                <div className="text-lg font-bold" style={{ color: type.color }}>{type.minAmount}</div>
                                            </div>
                                            <div className="text-neutral-300">~</div>
                                            <div>
                                                <div className="text-xs text-neutral-400">최대 투자금</div>
                                                <div className="text-lg font-bold" style={{ color: type.color }}>{type.maxAmount}</div>
                                            </div>
                                        </div>

                                        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">투자자 혜택</h3>
                                        <ul className="space-y-2">
                                            {type.features.map((f) => (
                                                <li key={f} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: type.color }} />
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* How it works */}
                                    <div className="lg:w-80">
                                        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">진행 과정</h3>
                                        <div className="space-y-4">
                                            {type.howItWorks.map((step, i) => (
                                                <div key={step} className="flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: type.color }}>
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-sm pt-1">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <Link
                                            href="/changeup/community"
                                            className="mt-6 w-full inline-flex items-center justify-center gap-2 text-white px-6 py-3 rounded-full font-semibold transition-colors text-sm"
                                            style={{ backgroundColor: type.color }}
                                        >
                                            투자 신청하기 <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ-like CTA */}
            <section className="bg-[#0F1F2E] text-white py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">투자가 처음이신가요?</h2>
                    <p className="text-neutral-400 mb-8">
                        걱정하지 마세요. ChangeUp이 처음부터 끝까지 함께합니다.
                        무료 상담으로 시작해 보세요.
                    </p>
                    <Link
                        href="/changeup/about"
                        className="inline-flex items-center gap-2 bg-[#1AAD64] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#148F52] transition-colors"
                    >
                        상담 신청하기 <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
