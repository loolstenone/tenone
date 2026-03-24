"use client";

import Link from "next/link";
import { Users, GraduationCap, Briefcase, Building2, ArrowRight, ExternalLink } from "lucide-react";

const memberTypes = [
    { icon: GraduationCap, title: "학생", desc: "실전 프로젝트 경험을 쌓고 싶은 대학생. 현업 전문가와 함께 실제 프로젝트를 진행하며 포트폴리오를 만듭니다." },
    { icon: Briefcase, title: "현업인", desc: "사이드 프로젝트를 통해 새로운 도전을 하고 싶은 직장인. 다양한 분야의 사람들과 협업하며 시야을 넓힙니다." },
    { icon: Users, title: "시니어", desc: "풍부한 경험을 바탕으로 새로운 도전을 원하는 시니어. 젊은 세대와 함께 사회 문제를 해결합니다." },
    { icon: Building2, title: "중소기업", desc: "새로운 사업 방법을 찾는 중소기업. 얼라이언스를 통해 서로의 강점을 활용하고 함께 성장합니다." },
];

const universebrands = [
    { name: "Badak.biz", desc: "네트워킹 커뮤니티" },
    { name: "MADLeague.net", desc: "대학 연합 마케팅 경쟁 플랫폼" },
    { name: "RooK.co.kr", desc: "AI 크리에이터" },
];

export default function YouInOneAlliancePage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#171717] py-16 md:py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#E53935] text-sm font-medium tracking-widest mb-4">MEMBERSHIP & ALLIANCE</p>
                    <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                        함께 하면<br />
                        <span className="text-[#E53935]">더 큰 가치</span>를 만듭니다
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        고령화, 인구감소, 지방소멸 등 다양한 문제가 산재한 이 시대,<br />
                        유인원은 함께 해결합니다.
                    </p>
                </div>
            </section>

            {/* Who Can Join */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-12">누가 참여할 수 있나요?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {memberTypes.map((m) => (
                            <div key={m.title} className="group p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-[#E53935]/30 transition-all">
                                <div className="inline-flex p-3 rounded-lg mb-4 bg-neutral-50 text-[#171717] group-hover:bg-[#E53935]/10 group-hover:text-[#E53935] transition-colors">
                                    <m.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-[#E53935] transition-colors">{m.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Membership vs Alliance */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Membership */}
                        <div className="p-8 bg-white rounded-xl border border-neutral-200">
                            <h3 className="text-2xl font-bold mb-4">프로젝트 멤버십</h3>
                            <p className="text-neutral-600 mb-6 leading-relaxed">
                                나이 제한 없이 누구나 참여 가능합니다.
                                지인 소개 또는 직접 지원을 통해 합류할 수 있습니다.
                            </p>
                            <ul className="space-y-3 text-sm text-neutral-600 mb-8">
                                <li className="flex gap-2">✓ 실전 프로젝트 참여</li>
                                <li className="flex gap-2">✓ 현업 전문가 멘토링</li>
                                <li className="flex gap-2">✓ 네트워킹 이벤트 참가</li>
                                <li className="flex gap-2">✓ 포트폴리오 구축 지원</li>
                            </ul>
                            <a
                                href="https://forms.gle/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#171717] text-white hover:bg-[#E53935] transition-colors rounded font-medium text-sm"
                            >
                                멤버십 신청 <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>

                        {/* Alliance */}
                        <div className="p-8 bg-white rounded-xl border border-neutral-200">
                            <h3 className="text-2xl font-bold mb-4">얼라이언스</h3>
                            <p className="text-neutral-600 mb-6 leading-relaxed">
                                소규모 기업들이 연합하여 서로의 강점을 활용하는 기업 네트워크입니다.
                                서울, 제주, 부산 등 전국 단위로 운영됩니다.
                            </p>
                            <ul className="space-y-3 text-sm text-neutral-600 mb-8">
                                <li className="flex gap-2">✓ 공동 프로젝트 수주</li>
                                <li className="flex gap-2">✓ 자원 공유 (인력, 장비, 공간)</li>
                                <li className="flex gap-2">✓ 비즈니스 네트워킹</li>
                                <li className="flex gap-2">✓ 브랜드 시너지</li>
                            </ul>
                            <a
                                href="https://forms.gle/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E53935] text-white hover:bg-[#C62828] transition-colors rounded font-medium text-sm"
                            >
                                얼라이언스 신청 <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Universe */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-8">YouInOne Universe</h2>
                    <p className="text-neutral-600 mb-10">유인원과 함께하는 브랜드들</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {universebrands.map((b) => (
                            <div key={b.name} className="p-4 bg-neutral-50 rounded-lg">
                                <p className="font-bold">{b.name}</p>
                                <p className="text-sm text-neutral-500 mt-1">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
