"use client";

import Link from "next/link";
import { ArrowRight, Zap, Users, Palette, Film } from "lucide-react";

const benefits = [
    { icon: Palette, title: "AI 크리에이티브 실습", desc: "최신 AI 도구를 활용한 실전 콘텐츠 제작 경험" },
    { icon: Film, title: "작품 발표 기회", desc: "RooK 공식 채널을 통한 작품 공개 및 홍보" },
    { icon: Users, title: "크리에이터 네트워크", desc: "AI 크리에이터 커뮤니티와 협업 프로젝트" },
    { icon: Zap, title: "포트폴리오 구축", desc: "실제 프로젝트 참여를 통한 포트폴리오 완성" },
];

export default function RooKiePage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#282828] py-16 md:py-24 px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-[#00d255] text-sm font-medium tracking-widest mb-4">ROOKIE PROGRAM</p>
                    <h1 className="text-white text-2xl md:text-4xl lg:text-6xl font-bold mb-6">
                        I want You<br />For Rookie
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        RooKie는 루크와 함께 인공지능 연구를 하며 콘텐츠를 제작하는 신입 크리에이터입니다.
                        수시로 모집하고 있습니다. 많은 분들의 관심과 도전 부탁드립니다.
                    </p>
                    <div className="mt-8">
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#00d255] text-black font-bold text-lg hover:bg-[#00b347] transition-colors rounded"
                        >
                            지원하기
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 px-6 bg-white">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-12">RooKie가 되면</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {benefits.map((b) => (
                            <div key={b.title} className="flex gap-4 p-6 bg-neutral-50 rounded-lg">
                                <div className="shrink-0 w-12 h-12 bg-[#282828] rounded-lg flex items-center justify-center">
                                    <b.icon className="h-6 w-6 text-[#00d255]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{b.title}</h3>
                                    <p className="text-neutral-600 mt-1">{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-xl md:text-3xl font-bold text-center mb-12">지원 과정</h2>
                    <div className="space-y-6">
                        {["지원서 제출 (포트폴리오 첨부)", "AI 과제 테스트 (1주)", "면접 (온라인)", "합류 & 온보딩"].map((step, i) => (
                            <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-lg border border-neutral-200">
                                <span className="shrink-0 w-10 h-10 bg-[#282828] text-[#00d255] font-bold rounded-full flex items-center justify-center">
                                    {i + 1}
                                </span>
                                <p className="font-medium">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
