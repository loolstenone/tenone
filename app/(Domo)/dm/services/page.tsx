"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, FileText, TrendingUp, CalendarDays, Globe, PenTool, Building2, Plane } from "lucide-react";

const serviceCategories = [
    {
        title: "준비서 서비스",
        subtitle: "경영인 맞춤 비서 서비스",
        desc: "바쁜 일상 속에서 비즈니스 활동에만 집중할 수 있도록, 경험 많은 준비서(準秘書)가 지원합니다.",
        items: [
            { icon: CalendarDays, name: "일정 관리", desc: "미팅·모임·여행 일정 통합 관리 및 리마인드" },
            { icon: Building2, name: "미팅 어레인지", desc: "비즈니스 미팅 장소 섭외, 참석자 조율, 자료 준비" },
            { icon: Plane, name: "여행·골프 예약", desc: "국내외 여행 플래닝, 골프장 예약, 동행 모집" },
            { icon: Globe, name: "정보 리서치", desc: "관심 분야 시장 동향, 경쟁사 분석, 뉴스 큐레이션" },
        ],
    },
    {
        title: "기획 & 컨설팅",
        subtitle: "새로운 도전을 구체화하는 기획 지원",
        desc: "아이디어에서 실행까지. 사업 기획, 브랜드 전략, 마케팅 플랜 등 전문 기획 서비스를 제공합니다.",
        items: [
            { icon: FileText, name: "사업 기획서 작성", desc: "사업 계획서, 투자 제안서, IR 자료 등 전문 기획 문서 작성" },
            { icon: PenTool, name: "브랜드 전략", desc: "브랜드 네이밍, 아이덴티티, 포지셔닝 전략 수립" },
            { icon: Briefcase, name: "마케팅 플랜", desc: "타깃 분석, 채널 전략, 예산 배분 등 마케팅 실행 계획" },
            { icon: Globe, name: "시장 조사", desc: "산업 트렌드, 경쟁 환경, 고객 니즈 분석 리포트" },
        ],
    },
    {
        title: "투자 자문",
        subtitle: "자산을 지키고 키우는 투자 파트너",
        desc: "은퇴 후 자산관리부터 신규 투자까지. 검증된 전문가 네트워크를 통한 투자 자문을 연결합니다.",
        items: [
            { icon: TrendingUp, name: "포트폴리오 자문", desc: "현재 자산 진단 및 포트폴리오 리밸런싱 제안" },
            { icon: Building2, name: "부동산 투자", desc: "상업용 부동산, 재개발, 경매 등 부동산 투자 자문" },
            { icon: Globe, name: "스타트업 투자", desc: "유망 스타트업 발굴 및 엔젤 투자 연결" },
            { icon: FileText, name: "세무·법률 연계", desc: "세무사, 변호사 등 전문가 네트워크 연결" },
        ],
    },
];

const pricingPlans = [
    { name: "Basic", price: "월 30만원", features: ["네트워킹 이벤트 참여", "월간 인사이트 레터", "멤버 디렉토리 접근", "온라인 커뮤니티"] },
    { name: "Premium", price: "월 100만원", features: ["Basic 전체 포함", "준비서 서비스 (월 20시간)", "기획 컨설팅 (월 1회)", "프리미엄 이벤트 우선 초대"], highlight: true },
    { name: "Executive", price: "별도 상담", features: ["Premium 전체 포함", "전담 준비서 배정", "투자 자문 연결", "1:1 맞춤 서비스"] },
];

export default function DomoServices() {
    return (
        <div>
            {/* Hero */}
            <section className="py-24 px-6 bg-gradient-to-br from-[#2D1B2E] to-[#1E1220] text-white">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">서비스</h1>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto">
                        준비서 서비스, 기획 컨설팅, 투자 자문까지.<br />
                        인생 2회차에 필요한 모든 비즈니스 지원.
                    </p>
                </div>
            </section>

            {/* 서비스 카테고리 */}
            {serviceCategories.map((cat, ci) => (
                <section key={ci} className={`py-20 px-6 ${ci % 2 === 1 ? "bg-neutral-50" : ""}`}>
                    <div className="mx-auto max-w-5xl">
                        <h2 className="text-xl md:text-3xl font-bold text-neutral-900 mb-1">{cat.title}</h2>
                        <p className="text-sm text-[#7F1146] font-medium mb-2">{cat.subtitle}</p>
                        <p className="text-neutral-500 mb-10 max-w-2xl">{cat.desc}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {cat.items.map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-neutral-200 bg-white">
                                    <div className="w-10 h-10 shrink-0 bg-[#7F1146]/10 rounded-lg flex items-center justify-center">
                                        <item.icon className="h-5 w-5 text-[#7F1146]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 text-sm mb-1">{item.name}</h3>
                                        <p className="text-xs text-neutral-600 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            {/* 구분선 */}
            <div className="mx-auto max-w-5xl border-t border-neutral-200" />

            {/* 요금제 */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-xl md:text-3xl font-bold text-neutral-900 mb-2 text-center">멤버십 플랜</h2>
                    <p className="text-neutral-500 text-center mb-12">나에게 맞는 멤버십을 선택하세요</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pricingPlans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`rounded-xl p-8 ${plan.highlight
                                    ? "bg-[#2D1B2E] text-white ring-2 ring-[#7F1146] scale-105"
                                    : "border border-neutral-200 bg-white"
                                    }`}
                            >
                                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? "text-white" : "text-neutral-900"}`}>{plan.name}</h3>
                                <p className={`text-2xl font-black mb-6 ${plan.highlight ? "text-[#C88DA0]" : "text-[#7F1146]"}`}>{plan.price}</p>
                                <ul className="space-y-3">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className={`text-sm flex items-center gap-2 ${plan.highlight ? "text-white/80" : "text-neutral-600"}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${plan.highlight ? "bg-[#C88DA0]" : "bg-[#7F1146]"}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-[#2D1B2E] text-white text-center">
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4">서비스에 대해 더 알고 싶으신가요?</h2>
                    <p className="text-white/60 mb-6">카카오톡이나 이메일로 편하게 문의해주세요.</p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <a
                            href="https://open.kakao.com/me/tenone"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#7F1146] hover:bg-[#A3194F] text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            카카오톡 문의 <ArrowRight className="h-4 w-4" />
                        </a>
                        <Link
                            href="/dm/about"
                            className="border border-white/30 hover:border-white/60 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                        >
                            Domo 알아보기
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
