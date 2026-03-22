"use client";

import Link from "next/link";
import { Linkedin, Mail, ArrowRight } from "lucide-react";

const team = [
    {
        name: "천재원",
        role: "대표 / Founder",
        department: "경영",
        desc: "Ten:One Universe를 이끌며, 브랜드 생태계와 프로젝트 그룹을 통해 사회적 가치를 만들어갑니다.",
        initial: "천",
    },
    {
        name: "김전략",
        role: "전략 디렉터",
        department: "전략",
        desc: "시장 분석과 데이터 기반 전략 수립. 기업과 프로젝트의 방향을 설계합니다.",
        initial: "김",
    },
    {
        name: "이크리",
        role: "크리에이티브 디렉터",
        department: "크리에이티브",
        desc: "브랜딩, 디자인, 콘텐츠 제작을 총괄합니다. 창의적인 솔루션으로 문제를 해결합니다.",
        initial: "이",
    },
    {
        name: "박마케",
        role: "마케팅 매니저",
        department: "마케팅",
        desc: "디지털 마케팅 캠페인 기획 및 실행. 성과 측정과 최적화를 담당합니다.",
        initial: "박",
    },
    {
        name: "최교육",
        role: "교육 프로그램 매니저",
        department: "교육",
        desc: "ChangeUp 등 교육 프로그램을 설계하고 운영합니다. 기업가정신 교육 전문가입니다.",
        initial: "최",
    },
    {
        name: "정네트",
        role: "네트워킹 매니저",
        department: "네트워킹",
        desc: "얼라이언스 파트너 관리와 네트워킹 이벤트를 기획합니다. 비즈니스 기회를 연결합니다.",
        initial: "정",
    },
];

export default function YouInOnePeoplePage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#171717] text-white py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#E53935] font-bold text-sm tracking-widest uppercase mb-4">
                        People
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                        팀 소개
                    </h1>
                    <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mx-auto">
                        다양한 분야의 전문가들이 모여 문제를 해결합니다.
                        각자의 전문성으로 최고의 결과를 만들어냅니다.
                    </p>
                </div>
            </section>

            {/* Team Grid */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {team.map((member) => (
                            <div
                                key={member.name}
                                className="group p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-[#E53935]/30 transition-all"
                            >
                                {/* Avatar */}
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#171717] to-neutral-600 flex items-center justify-center mb-5">
                                    <span className="text-2xl font-bold text-white/70">{member.initial}</span>
                                </div>
                                <div className="mb-3">
                                    <h3 className="text-lg font-bold text-[#171717] group-hover:text-[#E53935] transition-colors">
                                        {member.name}
                                    </h3>
                                    <p className="text-sm text-[#E53935] font-medium">{member.role}</p>
                                    <p className="text-xs text-neutral-400 mt-0.5">{member.department}</p>
                                </div>
                                <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                                    {member.desc}
                                </p>
                                <div className="flex items-center gap-3">
                                    <button className="p-1.5 text-neutral-400 hover:text-[#E53935] transition-colors">
                                        <Mail className="h-4 w-4" />
                                    </button>
                                    <button className="p-1.5 text-neutral-400 hover:text-[#0077B5] transition-colors">
                                        <Linkedin className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join Us */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-[#171717] mb-4">함께 할 인재를 찾고 있습니다</h2>
                    <p className="text-neutral-500 mb-8 leading-relaxed">
                        문제 해결에 열정이 있는 전문가라면 YouInOne과 함께하세요.
                        프리랜서, 파트타이머, 프로젝트 기반 참여 모두 환영합니다.
                    </p>
                    <Link
                        href="/yi/contact"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#171717] text-white font-semibold hover:bg-[#E53935] transition-colors rounded"
                    >
                        합류 문의 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
