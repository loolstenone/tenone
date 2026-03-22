"use client";

import { Calendar, Users, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

const programs = [
    {
        title: "마케팅 실전 부트캠프",
        desc: "4주간의 집중 부트캠프를 통해 마케팅 전략 수립부터 실행까지 전 과정을 경험합니다. 실제 브랜드 과제를 기반으로 진행됩니다.",
        duration: "4주",
        target: "대학생 / 취준생",
        capacity: "40명",
        tags: ["전략", "실행", "팀 프로젝트"],
    },
    {
        title: "브랜딩 워크숍",
        desc: "브랜드 아이덴티티 개발부터 포지셔닝, 커뮤니케이션 전략까지. 브랜딩의 핵심을 2주간 집중적으로 학습합니다.",
        duration: "2주",
        target: "대학생",
        capacity: "30명",
        tags: ["브랜딩", "아이덴티티", "전략"],
    },
    {
        title: "SNS 마케팅 마스터클래스",
        desc: "Instagram, TikTok, YouTube 등 주요 소셜 미디어 플랫폼의 마케팅 전략과 콘텐츠 제작 기법을 학습합니다.",
        duration: "3주",
        target: "대학생 / 마케터",
        capacity: "35명",
        tags: ["SNS", "콘텐츠", "디지털"],
    },
    {
        title: "광고 크리에이티브 캠프",
        desc: "광고 기획부터 카피라이팅, 비주얼 디렉팅까지. 크리에이티브 역량을 키우는 집중 캠프입니다.",
        duration: "2주",
        target: "대학생",
        capacity: "25명",
        tags: ["광고", "크리에이티브", "카피"],
    },
    {
        title: "데이터 기반 마케팅",
        desc: "마케팅 데이터 분석의 기초부터 GA4, 퍼포먼스 마케팅 실습까지. 데이터 드리븐 마케팅 역량을 강화합니다.",
        duration: "3주",
        target: "대학생 / 주니어 마케터",
        capacity: "30명",
        tags: ["데이터", "분석", "퍼포먼스"],
    },
    {
        title: "리더십 & 팀 빌딩",
        desc: "MAD League 리더를 위한 특별 프로그램. 프로젝트 매니지먼트와 팀 리더십 스킬을 배웁니다.",
        duration: "1주",
        target: "MAD League 임원",
        capacity: "20명",
        tags: ["리더십", "매니지먼트", "팀워크"],
    },
];

export default function ProgramPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#212121] text-white py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[#D32F2F] font-bold text-sm tracking-widest uppercase mb-3 block">
                        Programs
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">프로그램</h1>
                    <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        MAD League가 제공하는 다양한 실전 프로그램을 통해 마케팅 전문가로 성장하세요.
                    </p>
                </div>
            </section>

            {/* Programs Grid */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {programs.map((prog) => (
                            <div
                                key={prog.title}
                                className="p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-[#D32F2F]/30 transition-all flex flex-col"
                            >
                                <h3 className="text-lg font-bold text-neutral-900 mb-3">{prog.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed mb-5 flex-1">
                                    {prog.desc}
                                </p>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>기간: {prog.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>대상: {prog.target} &middot; {prog.capacity}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {prog.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 bg-[#D32F2F]/5 text-[#D32F2F] text-[10px] font-medium rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">프로그램에 참여하고 싶으신가요?</h2>
                    <p className="text-neutral-500 mb-8">
                        MAD League에 가입하면 모든 프로그램에 참여할 수 있습니다.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#D32F2F] text-white font-semibold hover:bg-[#B71C1C] transition-colors rounded"
                    >
                        가입하기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
