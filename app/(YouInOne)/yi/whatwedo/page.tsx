"use client";

import Link from "next/link";
import { Megaphone, Palette, Film, GraduationCap, Handshake, ArrowRight } from "lucide-react";

const services = [
    {
        icon: Megaphone,
        title: "마케팅 컨설팅",
        desc: "소규모 기업과 스타트업을 위한 마케팅 전략 수립. 시장 분석, 타겟 설정, 채널 전략까지 실행 가능한 플랜을 제공합니다.",
        tags: ["시장 분석", "전략 수립", "채널 기획"],
    },
    {
        icon: Film,
        title: "콘텐츠 제작",
        desc: "영상, SNS, 매거진 등 다양한 형태의 콘텐츠를 기획하고 제작합니다. 브랜드 메시지를 효과적으로 전달합니다.",
        tags: ["영상 제작", "SNS 콘텐츠", "카피라이팅"],
    },
    {
        icon: Palette,
        title: "브랜딩",
        desc: "브랜드 아이덴티티 구축부터 리브랜딩까지. 경쟁력 있는 브랜드를 만들기 위한 전략적 브랜딩 서비스를 제공합니다.",
        tags: ["BI 개발", "네이밍", "브랜드 전략"],
    },
    {
        icon: GraduationCap,
        title: "교육 프로그램",
        desc: "기업가정신 교육, 마케팅 실전 워크숍 등 실무 중심의 교육 프로그램을 설계하고 운영합니다.",
        tags: ["기업가정신", "워크숍", "실전 교육"],
    },
    {
        icon: Handshake,
        title: "네트워킹",
        desc: "업계 전문가와 기업을 연결합니다. 프로젝트 매칭, 네트워킹 이벤트, 커뮤니티 운영을 통해 비즈니스 기회를 만듭니다.",
        tags: ["프로젝트 매칭", "이벤트", "커뮤니티"],
    },
];

export default function YouInOneWhatWeDoPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#171717] text-white py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#E53935] font-bold text-sm tracking-widest uppercase mb-4">
                        What We Do
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                        우리가 하는 일
                    </h1>
                    <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mx-auto">
                        마케팅 컨설팅, 콘텐츠 제작, 브랜딩, 교육, 네트워킹.
                        기업과 사회의 문제를 해결하기 위한 다섯 가지 핵심 사업 영역입니다.
                    </p>
                </div>
            </section>

            {/* Services */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="space-y-8">
                        {services.map((service, idx) => (
                            <div
                                key={service.title}
                                className={`flex flex-col md:flex-row items-stretch gap-0 border border-neutral-200 rounded-xl overflow-hidden hover:border-[#E53935]/30 transition-colors ${
                                    idx % 2 === 1 ? "md:flex-row-reverse" : ""
                                }`}
                            >
                                {/* Visual */}
                                <div className="md:w-2/5 bg-gradient-to-br from-[#171717] to-neutral-800 flex items-center justify-center py-16 md:py-0">
                                    <service.icon className="h-16 w-16 text-white/20" />
                                </div>
                                {/* Content */}
                                <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                                    <span className="text-[#E53935] text-xs font-bold tracking-widest uppercase mb-2">
                                        0{idx + 1}
                                    </span>
                                    <h3 className="text-2xl font-bold text-[#171717] mb-3">{service.title}</h3>
                                    <p className="text-neutral-500 leading-relaxed mb-4">{service.desc}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {service.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full"
                                            >
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

            {/* Process */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-[#171717] mb-3">프로젝트 진행 프로세스</h2>
                        <p className="text-neutral-500">문제 발견부터 해결까지, 체계적으로 진행합니다</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { step: "01", title: "문제 정의", desc: "현장 조사와 인터뷰를 통해 문제의 본질을 파악합니다." },
                            { step: "02", title: "전략 수립", desc: "데이터 분석과 인사이트를 기반으로 솔루션 전략을 수립합니다." },
                            { step: "03", title: "실행", desc: "얼라이언스 파트너와 함께 프로젝트를 실행합니다." },
                            { step: "04", title: "성과 측정", desc: "KPI 기반 성과를 측정하고, 개선점을 도출합니다." },
                        ].map((item) => (
                            <div key={item.step} className="p-6 bg-white border border-neutral-200 rounded-xl text-center">
                                <span className="text-3xl font-extrabold text-[#E53935]/20">{item.step}</span>
                                <h3 className="font-bold text-[#171717] mt-3 mb-2">{item.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-[#171717] text-white text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">프로젝트가 필요하신가요?</h2>
                    <p className="text-neutral-400 mb-8">
                        문제를 알려주세요. 최적의 솔루션을 제안해 드리겠습니다.
                    </p>
                    <Link
                        href="/yi/contact"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#E53935] text-white font-semibold hover:bg-[#C62828] transition-colors rounded"
                    >
                        프로젝트 문의 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
