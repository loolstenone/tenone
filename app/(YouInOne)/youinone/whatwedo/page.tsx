"use client";

import Link from "next/link";
import { Compass, Users, Building2, GraduationCap, Lightbulb, PartyPopper, Briefcase, Megaphone, Palette, ArrowRight } from "lucide-react";

const services = [
    { icon: Compass, title: "인사이트 투어링", desc: "여행지에서 영감을 얻고 새로운 시각으로 문제를 바라봅니다. 일상에서 벗어나 창의적 발상의 전환을 경험합니다." },
    { icon: Users, title: "프로젝트 멤버십", desc: "학생과 현업 전문가를 매칭하여 실전 프로젝트를 진행합니다. 학생은 경험을, 현업인은 새로운 아이디어를 얻습니다." },
    { icon: Building2, title: "유인원 얼라이언스", desc: "소규모 기업들이 연합하여 서로의 강점을 활용하는 네트워크. 혼자서는 어려운 프로젝트도 함께라면 가능합니다." },
    { icon: GraduationCap, title: "진화 학교 (Evolution School)", desc: "실전 중심의 아카데미. 이론이 아닌 실제 프로젝트를 통해 배우고 성장합니다." },
    { icon: Lightbulb, title: "선제안 프로젝트 (Pre-Posal)", desc: "사회 문제를 발견하고 먼저 해결책을 제안합니다. 의뢰를 기다리지 않고 능동적으로 프로젝트를 시작합니다." },
    { icon: PartyPopper, title: "D.A.M 네트워킹 파티", desc: "Draft Assembly Meeting. 마케팅·광고 분야 학생들과 현업 인사담당자를 연결하는 네트워킹 이벤트." },
    { icon: Briefcase, title: "비즈니스 & 마케팅", desc: "기업의 비즈니스 전략 수립과 마케팅 기획을 지원합니다. 시장 분석부터 실행까지." },
    { icon: Megaphone, title: "광고 & 캠페인", desc: "사회적 메시지를 담은 광고 캠페인을 기획하고 제작합니다. 광고제 출품 및 수상 경력." },
    { icon: Palette, title: "디자인", desc: "브랜드 아이덴티티, 그래픽 디자인, 영상 콘텐츠 등 비주얼 커뮤니케이션을 담당합니다." },
];

const howWeWork = [
    { num: "01", title: "본질에 다가가는 질문", desc: "왜? 라는 질문으로 문제의 핵심에 접근합니다." },
    { num: "02", title: "빛나는 아이디어", desc: "다양한 관점에서 창의적인 해결책을 찾습니다." },
    { num: "03", title: "빠른 실행", desc: "아이디어를 현실로 바꾸는 데 주저하지 않습니다." },
];

export default function YouInOneWhatWeDoPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#171717] py-16 md:py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#E53935] text-sm font-medium tracking-widest mb-4">WHAT WE DO</p>
                    <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold mb-6">
                        Showcase Our Item
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        관심 있는 모든 일들을 프로젝트로 진행합니다
                    </p>
                </div>
            </section>

            {/* Services */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((s) => (
                            <div
                                key={s.title}
                                className="group p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-[#E53935]/30 transition-all"
                            >
                                <div className="inline-flex p-3 rounded-lg mb-4 bg-neutral-50 text-[#171717] group-hover:bg-[#E53935]/10 group-hover:text-[#E53935] transition-colors">
                                    <s.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-[#E53935] transition-colors">{s.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How We Work */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-12">How We Work</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {howWeWork.map((h) => (
                            <div key={h.num} className="text-center">
                                <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-[#171717] text-[#E53935] font-bold text-xl mb-4">
                                    {h.num}
                                </span>
                                <h3 className="text-lg font-bold mb-2">{h.title}</h3>
                                <p className="text-sm text-neutral-500">{h.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-[#171717] text-center">
                <h2 className="text-2xl font-bold text-white mb-4">프로젝트를 함께 하고 싶다면</h2>
                <p className="text-neutral-400 mb-8">당신의 고민을 이야기해 주세요.</p>
                <Link
                    href="/youinone/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#E53935] text-white font-medium hover:bg-[#C62828] transition-colors rounded"
                >
                    문의하기 <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    );
}
