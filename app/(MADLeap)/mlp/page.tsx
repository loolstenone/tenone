"use client";

import Link from "next/link";
import { ArrowRight, Expand, Link2, Footprints, BarChart3, Lightbulb } from "lucide-react";

const values = [
    {
        icon: Expand,
        title: "확장하다",
        desc: "매드립은 기존 광고 동아리의 '광고', '크리에이티브'에 집중하는 틀에서 벗어나, 마케팅, 커뮤니케이션, 데이터로 까지 확장합니다.",
    },
    {
        icon: Link2,
        title: "연결하다",
        desc: "매드립은 국내 여러 광고 동아리들과 지속적으로 관계를 구축하고 있으며 현업 선배님들과 소통하며 프로젝트를 진행합니다.",
    },
    {
        icon: Footprints,
        title: "발로 뛰다",
        desc: "매드립은 주어진 과제에 만족하지 않습니다. 직접 발로 뛰며 현장의 소리를 듣고, 실질적인 결과물을 만들어냅니다.",
    },
    {
        icon: BarChart3,
        title: "결과로 말하다",
        desc: "매드립은 큰 혁신을 불러올 잠재력을 개발하고 실전 프로젝트를 통해 증명합니다. 과정도 중요하지만, 결과로 말합니다.",
    },
    {
        icon: Lightbulb,
        title: "세상을 기획하는 기획자가 되다",
        desc: "우리가 말하는 기획은 AE, AP가 아닙니다. 기획은 일이 되게끔 하는 일입니다. 나의 생각을 세상에 꺼내 놓고 스스로 결과를 만드는 멋있는 일입니다.",
    },
];

const activities = [
    { title: "스터디", desc: "마케팅·광고·데이터 분야별 스터디 그룹 운영" },
    { title: "프로젝트", desc: "실전 클라이언트 프로젝트 수행 및 포트폴리오 구축" },
    { title: "네트워킹", desc: "현업 멘토 연결 및 타 동아리 교류 세션" },
    { title: "경쟁 PT", desc: "팀 단위 기획·전략 경쟁 프레젠테이션 대회" },
];

export default function MadLeapHome() {
    return (
        <>
            {/* ── Hero ── */}
            <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />
                {/* Decorative photo grid background */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute inset-0 bg-[url('/brands/madleap/hero-bg.jpg')] bg-cover bg-center" />
                </div>

                <div className="relative z-10 text-center px-6">
                    {/* Logo */}
                    <div className="mb-6">
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight">
                            M<span className="relative">A</span>D
                        </h1>
                        <div className="flex items-center justify-center gap-4 -mt-2">
                            <div className="h-px w-16 bg-white/60" />
                            <span className="text-xl md:text-3xl font-light text-white tracking-[0.3em]">
                                L E A P
                            </span>
                            <div className="h-px w-16 bg-white/60" />
                        </div>
                    </div>

                    <p className="text-lg md:text-xl text-white/90 font-medium mt-8">
                        실전 프로젝트 대학생 연합동아리
                    </p>
                    <p className="text-sm text-white/60 mt-2">
                        수도권 마케팅 · 광고 · 창업
                    </p>

                    <div className="mt-10 flex items-center justify-center gap-4">
                        <Link
                            href="/mlp/about"
                            className="px-6 py-3 border border-white/80 text-white text-sm font-medium hover:bg-white hover:text-black transition-all rounded"
                        >
                            더 알아보기
                        </Link>
                        <Link
                            href="/signup"
                            className="px-6 py-3 bg-[#00B8FF] text-white text-sm font-medium hover:bg-[#0090CC] transition-all rounded"
                        >
                            지원하기
                        </Link>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                    </div>
                </div>
            </section>

            {/* ── About Preview ── */}
            <section className="bg-black text-white py-16 md:py-24 md:py-32">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-10">About.</h2>
                    <div className="space-y-6 text-base md:text-lg leading-relaxed text-neutral-300">
                        <p className="text-[#00B8FF] font-semibold text-lg md:text-xl">
                            우리의 시작은 기웃거림이었습니다.
                        </p>
                        <p>
                            &ldquo;마케팅을 더 잘하고 싶다&rdquo;는 마음 하나로 모인 대학생들.
                            교실 안에서는 배울 수 없는 것들을 찾아<br />
                            현업의 선배님들에게 닿았습니다.
                        </p>
                        <p>
                            선배님들은 우리의 손을 잡아 주었고,<br />
                            함께 마케팅&광고 동아리계의 새로운 패러다임을 만들었습니다.
                        </p>
                        <p className="text-[#00B8FF] font-semibold text-lg md:text-xl">
                            그래서 매드립은 한 번 더 도약을 했습니다.<br />
                            누구 보다 인공지능을 잘 활용하고,<br />
                            실전 프로젝트를 하는 조직이 되기로
                        </p>
                    </div>
                    <Link
                        href="/mlp/about"
                        className="inline-flex items-center gap-2 mt-10 px-6 py-3 border border-white/40 text-white text-sm font-medium hover:bg-white hover:text-black transition-all rounded"
                    >
                        더 알아보기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* ── Activities ── */}
            <section className="relative bg-black text-white py-16 md:py-24 md:py-32 overflow-hidden">
                {/* Particle-style bg */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900/50 to-black" />
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" />
                    <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-300" />
                    <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-700" />
                    <div className="absolute top-2/3 right-1/4 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-500" />
                </div>

                <div className="relative z-10 mx-auto max-w-5xl px-6">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            우리들의 미친 도약
                        </h2>
                        <p className="text-xl md:text-2xl font-bold text-[#00B8FF]">
                            미치지 않으면, 미치지 못한다.
                        </p>
                    </div>

                    <div className="text-center mb-10 md:mb-16">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2">Activities.</h3>
                        <p className="text-neutral-400 text-sm md:text-base max-w-2xl mx-auto">
                            매드립은 역량강화와 조직 운영을 위한 체계적인 구성을 갖추었습니다.<br />
                            매드립은 대학생들과 현업 선배님들이 멘토가 되어 함께 만들어 갑니다.<br />
                            매드립은 디지털과 AI시대의 앞이 되게끔 하는 기획자를 지향합니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {activities.map((act) => (
                            <div
                                key={act.title}
                                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                            >
                                <h4 className="text-white font-bold text-lg mb-2">{act.title}</h4>
                                <p className="text-neutral-400 text-sm">{act.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 5대 운영 가치 ── */}
            <section className="bg-white py-16 md:py-24 md:py-32">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="mb-10 md:mb-16">
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold">MADLeap</h2>
                        <p className="text-xl md:text-2xl font-semibold text-neutral-600 mt-1">5대 운영 가치</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {values.map((v) => (
                            <div key={v.title} className="flex gap-4">
                                <div className="shrink-0 mt-1">
                                    <v.icon className="h-6 w-6 text-[#00B8FF]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-2">{v.title}</h3>
                                    <p className="text-neutral-600 text-sm leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="bg-[#00B8FF] py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        매드립과 함께 도약하세요
                    </h2>
                    <p className="text-white/80 mb-8">
                        수도권 대학생이라면 누구나 지원할 수 있습니다
                    </p>
                    <Link
                        href="/signup"
                        className="inline-block px-8 py-3 bg-white text-[#00B8FF] font-bold hover:bg-neutral-100 transition-colors rounded"
                    >
                        지원하기
                    </Link>
                </div>
            </section>
        </>
    );
}
