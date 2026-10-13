"use client";

import { PageHero } from "@/features/hero/PageHero";
import Link from "next/link";
import {
    Target,
    Eye,
    Heart,
    ArrowRight,
    Calendar,
} from "lucide-react";

const visionItems = [
    {
        icon: Eye,
        title: "비전",
        desc: "누구나 자기 재능을 알고, 계획을 세워 성장할 수 있는 세상",
    },
    {
        icon: Target,
        title: "미션",
        desc: "숨은 인재를 찾고, 사람마다 맞는 성장 계획을 함께 세웁니다",
    },
    {
        icon: Heart,
        title: "핵심 가치",
        desc: "발견, 성장, 연결, 솔직함",
    },
];

const milestones = [
    { year: "2024", events: ["HeRo 프로젝트 기획 시작", "HIT 진단 도구 개발"] },
    { year: "2025", events: ["HeRo 플랫폼 베타 런칭", "멘토단 1기 구성", "커리어 로드맵 프로그램 시작", "퍼스널 브랜딩 서비스 오픈"] },
    { year: "2026", events: ["HeRo 정식 런칭 (hero.ne.kr)", "이력서 AI 컨설팅 도입", "멘토단 2기 확대"] },
];

const partners = [
    { name: "Ten:One™ Universe", desc: "HeRo를 운영하는 브랜드 그룹", type: "운영" },
    { name: "MADLeague", desc: "대학 연합 마케팅 경쟁 프로그램", type: "협업" },
    { name: "YouInOne", desc: "프로젝트 그룹", type: "협업" },
    { name: "SmarComm.", desc: "AI 마케팅 커뮤니케이션", type: "협업" },
];

// 숫자 섹션(HIT 진단·멘토 매칭·성공 사례·파트너 대학)은 실제 숫자가 생기면 DB 집계로 다시 넣는다 — 빈 숫자 안내 직접 표시 금지(§1.1), 2026-10-10 제거

export default function AboutPage() {
    return (
        <div>
            {/* Hero */}
            <PageHero
                align="center"
                label="HeRo 소개"
                title={<>사람이 크도록 돕고<br />맞는 일을 찾게 돕는 인재 기획사</>}
                desc="HeRo(Human enhancement & Recruit Optimization)는 한 사람 한 사람이 계획을 세워 성장하고, 자기 역량을 가장 잘 쓸 수 있는 회사와 일을 스스로 찾아가도록 돕습니다. 연예 기획사가 아티스트를 발굴하고 키우는 것처럼요."
            />

            {/* Vision / Mission / Values */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {visionItems.map((item) => (
                            <div key={item.title} className="border border-neutral-200 rounded-xl p-6 text-center">
                                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-neutral-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* History / Timeline */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-xl md:text-3xl font-bold mb-3">연혁</h2>
                        <p className="text-neutral-500">HeRo가 걸어온 길</p>
                    </div>
                    <div className="max-w-2xl mx-auto">
                        <div className="relative pl-8 border-l-2 border-amber-200 space-y-10">
                            {milestones.map((m) => (
                                <div key={m.year} className="relative">
                                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100" />
                                    <div className="ml-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="h-4 w-4 text-amber-500" />
                                            <h3 className="text-lg font-bold">{m.year}</h3>
                                        </div>
                                        <ul className="space-y-2">
                                            {m.events.map((event) => (
                                                <li key={event} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                                                    <span className="text-sm text-neutral-600">{event}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-xl md:text-3xl font-bold mb-3">파트너</h2>
                        <p className="text-neutral-500">Ten:One™ Universe의 여러 브랜드와 함께합니다</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {partners.map((partner) => (
                            <div key={partner.name} className="bg-white border border-neutral-200 rounded-xl p-5 text-center">
                                <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium">
                                    {partner.type}
                                </span>
                                <h3 className="text-base font-bold mt-3 mb-1">{partner.name}</h3>
                                <p className="text-xs text-neutral-500">{partner.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-amber-500">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-3">HeRo에 합류하세요</h2>
                    <p className="text-amber-100 mb-8">나에게 맞는 일을 찾는 첫걸음, HIT 검사부터 시작해 보세요</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/hero/hit"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-amber-600 font-bold hover:bg-amber-50 transition-colors rounded-lg"
                        >
                            HIT 진단 시작 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white font-bold hover:bg-amber-600 transition-colors rounded-lg"
                        >
                            회원가입
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
