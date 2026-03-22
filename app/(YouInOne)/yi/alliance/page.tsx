"use client";

import Link from "next/link";
import { Users, Shield, Zap, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

const alliancePartners = [
    { name: "ChangeUp", field: "교육/기업가정신", desc: "기업가정신 교육 프로그램 운영" },
    { name: "크리에이티브 랩", field: "콘텐츠 제작", desc: "영상 및 디지털 콘텐츠 제작 스튜디오" },
    { name: "브랜드 스튜디오 M", field: "브랜딩", desc: "BI/CI 개발 및 브랜드 컨설팅" },
    { name: "소셜 임팩트", field: "사회적 기업", desc: "사회적 가치 기반 프로젝트 기획" },
    { name: "데이터 브릿지", field: "데이터 분석", desc: "마케팅 데이터 분석 및 인사이트 도출" },
    { name: "로컬 크리에이터즈", field: "지역 활성화", desc: "지역 기반 콘텐츠 및 커뮤니티 운영" },
];

const benefits = [
    {
        icon: Users,
        title: "공동 프로젝트 참여",
        desc: "개별 기업으로는 수주하기 어려운 대형 프로젝트에 공동으로 참여할 수 있습니다.",
    },
    {
        icon: Shield,
        title: "전문 역량 공유",
        desc: "마케팅, 브랜딩, 콘텐츠, 교육 등 서로의 전문 역량을 활용하여 시너지를 극대화합니다.",
    },
    {
        icon: Zap,
        title: "네트워킹 기회",
        desc: "정기 밋업, 워크숍, 네트워킹 이벤트를 통해 업계 인사이트와 비즈니스 기회를 얻습니다.",
    },
    {
        icon: TrendingUp,
        title: "성장 지원",
        desc: "경영 컨설팅, 마케팅 지원, 교육 등 소규모 기업의 성장을 위한 실질적 지원을 받습니다.",
    },
];

const joinSteps = [
    { step: "01", title: "문의 & 상담", desc: "얼라이언스 참여를 위한 초기 상담을 진행합니다." },
    { step: "02", title: "역량 매칭", desc: "기업의 전문 분야와 얼라이언스 내 역할을 매칭합니다." },
    { step: "03", title: "파트너십 체결", desc: "파트너십 계약 체결 후 정식 얼라이언스 멤버로 합류합니다." },
    { step: "04", title: "프로젝트 참여", desc: "공동 프로젝트와 네트워킹 활동에 참여합니다." },
];

export default function YouInOneAlliancePage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#171717] text-white py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#E53935] font-bold text-sm tracking-widest uppercase mb-4">
                        Members &amp; Alliance
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                        소규모 기업 연합<br />
                        <span className="text-[#E53935]">얼라이언스</span>
                    </h1>
                    <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mx-auto">
                        혼자서는 어렵지만 함께라면 가능합니다.
                        YouInOne 얼라이언스는 소규모 기업들이 연대하여 더 큰 프로젝트에 참여하고,
                        서로의 전문성을 나누는 기업 연합입니다.
                    </p>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-[#171717] mb-3">얼라이언스 혜택</h2>
                        <p className="text-neutral-500">파트너로 합류하면 얻을 수 있는 것들</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {benefits.map((item) => (
                            <div
                                key={item.title}
                                className="flex gap-5 p-6 bg-white border border-neutral-200 rounded-xl hover:border-[#E53935]/30 transition-colors"
                            >
                                <div className="shrink-0 p-3 bg-[#E53935]/10 rounded-lg text-[#E53935] h-fit">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#171717] mb-2">{item.title}</h3>
                                    <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Alliance Partners */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-[#171717] mb-3">참여 기업</h2>
                        <p className="text-neutral-500">YouInOne 얼라이언스에 함께하는 기업들</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {alliancePartners.map((partner) => (
                            <div
                                key={partner.name}
                                className="p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-md hover:border-[#E53935]/30 transition-all"
                            >
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#171717] to-neutral-600 flex items-center justify-center mb-4">
                                    <span className="text-lg font-bold text-white/70">{partner.name[0]}</span>
                                </div>
                                <h3 className="font-bold text-[#171717] mb-1">{partner.name}</h3>
                                <p className="text-xs text-[#E53935] font-medium mb-2">{partner.field}</p>
                                <p className="text-sm text-neutral-500">{partner.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join Process */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-[#171717] mb-3">가입 프로세스</h2>
                        <p className="text-neutral-500">얼라이언스 파트너로 합류하는 방법</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {joinSteps.map((item, idx) => (
                            <div key={item.step} className="relative p-6 bg-white border border-neutral-200 rounded-xl text-center">
                                <span className="text-3xl font-extrabold text-[#E53935]/20">{item.step}</span>
                                <h3 className="font-bold text-[#171717] mt-3 mb-2">{item.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                                {idx < joinSteps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 text-neutral-300">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Requirements */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-[#171717] mb-8 text-center">참여 자격</h2>
                    <div className="space-y-4">
                        {[
                            "마케팅, 브랜딩, 콘텐츠, 교육, 데이터 분석 등 관련 분야의 전문성을 보유한 기업 또는 개인",
                            "소규모 기업(직원 50인 이하) 또는 프리랜서/1인 기업",
                            "협업과 연대를 통한 성장에 공감하는 기업 문화",
                            "최소 1개 이상의 공동 프로젝트에 참여 의향이 있는 기업",
                        ].map((req, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-white border border-neutral-200 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-[#E53935] shrink-0 mt-0.5" />
                                <p className="text-sm text-neutral-600">{req}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-[#171717] text-white text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4">
                        함께 성장할 파트너를<br />
                        기다리고 있습니다
                    </h2>
                    <p className="text-neutral-400 mb-8 leading-relaxed">
                        YouInOne 얼라이언스에 합류하여 더 큰 프로젝트에 참여하고,
                        전문가 네트워크와 함께 성장하세요.
                    </p>
                    <Link
                        href="/yi/contact"
                        className="inline-flex items-center gap-2 px-10 py-3 bg-[#E53935] text-white font-semibold hover:bg-[#C62828] transition-colors rounded"
                    >
                        얼라이언스 참여 문의 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
