"use client";

import { Star, TrendingUp, Eye, Handshake } from "lucide-react";
import Link from "next/link";

const phases = [
    {
        icon: Eye,
        title: "발굴 (Discovery)",
        desc: "경쟁 PT, 프로그램 활동에서 잠재력 있는 인재를 선별합니다.",
        details: ["경쟁 PT 우수 팀원 추천", "프로그램 참여도 분석", "리더십 역량 평가"],
    },
    {
        icon: Star,
        title: "선발 (Selection)",
        desc: "HeRo 후보자를 면밀히 검토하고 HeRo 멤버로 선발합니다.",
        details: ["포트폴리오 심사", "인터뷰 진행", "HeRo 멤버 최종 선발"],
    },
    {
        icon: TrendingUp,
        title: "성장 (Growth)",
        desc: "멘토링, 프로젝트 참여 등을 통해 전문 역량을 강화합니다.",
        details: ["현업 멘토 1:1 매칭", "실전 프로젝트 참여", "전문 스킬 교육"],
    },
    {
        icon: Handshake,
        title: "연결 (Connect)",
        desc: "산업계와 연결하여 커리어 기회를 제공합니다.",
        details: ["파트너 기업 인턴십", "업계 네트워킹 이벤트", "취업 연계 프로그램"],
    },
];

export default function HeroPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#212121] text-white py-16 md:py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[#D32F2F] font-bold text-sm tracking-widest uppercase mb-3 block">
                        HeRo Program
                    </span>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-6">히어로</h1>
                    <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        <span className="text-[#D32F2F] font-bold">He</span>lp &amp; <span className="text-[#D32F2F] font-bold">Ro</span>le Model
                        &mdash; 인재 발굴과 성장을 지원하는 MAD League의 핵심 인재 프로그램입니다.
                    </p>
                </div>
            </section>

            {/* HeRo란? */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6">HeRo 프로그램이란?</h2>
                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                        <p>
                            HeRo는 MAD League에서 뛰어난 역량을 보여준 인재를 발굴하고,
                            체계적인 멘토링과 프로젝트 기회를 통해 마케팅 전문가로 성장시키는 프로그램입니다.
                        </p>
                        <p>
                            경쟁 PT와 다양한 프로그램 활동에서 두각을 나타낸 멤버를 선발하여,
                            현업 마케터 멘토링, 실전 프로젝트 참여, 파트너 기업 인턴십 연계 등
                            커리어 성장을 위한 다양한 기회를 제공합니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* 프로그램 과정 */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-12 text-center">프로그램 과정</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {phases.map((phase, i) => (
                            <div key={phase.title} className="bg-white p-6 rounded-xl border border-neutral-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-[#D32F2F]/10 text-[#D32F2F] flex items-center justify-center">
                                        <phase.icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-xs font-bold text-[#D32F2F]">Phase {i + 1}</span>
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">{phase.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed mb-4">{phase.desc}</p>
                                <ul className="space-y-1.5">
                                    {phase.details.map((d) => (
                                        <li key={d} className="text-xs text-neutral-400 flex items-start gap-2">
                                            <span className="w-1 h-1 rounded-full bg-[#D32F2F] mt-1.5 shrink-0" />
                                            {d}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HeRo 혜택 */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">HeRo 멤버 혜택</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { title: "현업 멘토 매칭", desc: "광고/마케팅 업계 현직자 1:1 멘토링" },
                            { title: "실전 프로젝트", desc: "파트너 기업의 실제 마케팅 프로젝트 참여" },
                            { title: "인턴십 연계", desc: "우수 멤버 파트너 기업 인턴십 기회 제공" },
                            { title: "네트워킹", desc: "업계 전문가 및 HeRo 동문 네트워크" },
                        ].map((benefit) => (
                            <div key={benefit.title} className="p-5 border border-neutral-200 rounded-lg">
                                <h3 className="font-bold text-neutral-900 mb-1">{benefit.title}</h3>
                                <p className="text-sm text-neutral-500">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-[#212121] text-white text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">HeRo가 되고 싶다면?</h2>
                    <p className="text-neutral-400 mb-8">
                        먼저 MAD League에 합류하고, 경쟁 PT와 프로그램에 적극 참여하세요.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-block px-10 py-3 bg-[#D32F2F] text-white font-semibold hover:bg-[#B71C1C] transition-colors rounded"
                    >
                        MAD League 가입하기
                    </Link>
                </div>
            </section>
        </div>
    );
}
