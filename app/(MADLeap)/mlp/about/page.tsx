"use client";

import { Target, Zap, Users, TrendingUp, Sparkles } from "lucide-react";

const timeline = [
    { year: "2023", event: "MADLeap 창립 — 수도권 대학생 마케팅 연합동아리 출범" },
    { year: "2024", event: "1~2기 운영, 첫 경쟁 PT 대회 개최, 현업 멘토 네트워크 구축" },
    { year: "2025", event: "3~4기 운영, AI 활용 실전 프로젝트 도입, 매드립 프로젝트 최우수상" },
    { year: "2026", event: "5기 모집, 포트폴리오 플랫폼 런칭, 전국 확장 준비" },
];

const values = [
    { icon: Target, title: "M — Marketing", desc: "전략적 사고와 마케팅 역량을 키웁니다" },
    { icon: Zap, title: "A — Advertising", desc: "크리에이티브한 광고 기획을 실행합니다" },
    { icon: TrendingUp, title: "D — Digital", desc: "디지털과 AI 시대를 선도하는 기획자가 됩니다" },
];

const partners = [
    "Badak (바닥)", "MAD League (매드리그)", "Ten:One Universe",
];

export default function MadLeapAboutPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-black text-white py-24 md:py-32">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">매드립 소개</h1>
                    <p className="text-neutral-400 text-lg">
                        Marketing · Advertising · Digital — Leap!
                    </p>
                </div>
            </section>

            {/* Vision */}
            <section className="py-20 md:py-28">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">MAD의 의미</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((v) => (
                            <div key={v.title} className="text-center p-6 rounded-xl border border-neutral-200 hover:shadow-lg transition-shadow">
                                <v.icon className="h-10 w-10 text-[#00B8FF] mx-auto mb-4" />
                                <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                                <p className="text-neutral-600 text-sm">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="bg-neutral-50 py-20 md:py-28">
                <div className="mx-auto max-w-3xl px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">우리의 이야기</h2>
                    <div className="space-y-6 text-neutral-700 leading-relaxed">
                        <p>
                            매드립은 &ldquo;마케팅을 더 잘하고 싶다&rdquo;는 마음 하나로 모인 수도권 대학생들이 만든 연합동아리입니다.
                        </p>
                        <p>
                            교실 안의 이론만으로는 채울 수 없는 갈증을 느끼고, 현업의 선배님들을 찾아갔습니다.
                            선배님들은 우리의 손을 잡아 주었고, 함께 마케팅·광고 동아리계의 새로운 패러다임을 만들었습니다.
                        </p>
                        <p>
                            디지털과 인공지능이 모든 경계를 허물었고, 기업은 신입이 아닌 경력을 원하고 있습니다.
                            그래서 매드립은 한 번 더 도약을 했습니다 — 누구 보다 인공지능을 잘 활용하고, 실전 프로젝트를 하는 조직이 되기로.
                        </p>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20 md:py-28">
                <div className="mx-auto max-w-3xl px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">연혁</h2>
                    <div className="space-y-8">
                        {timeline.map((t) => (
                            <div key={t.year} className="flex gap-6">
                                <div className="shrink-0 w-16 text-right">
                                    <span className="text-[#00B8FF] font-bold text-lg">{t.year}</span>
                                </div>
                                <div className="relative pb-8 border-l-2 border-neutral-200 pl-6">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 bg-[#00B8FF] rounded-full border-2 border-white" />
                                    <p className="text-neutral-700">{t.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Organization */}
            <section className="bg-black text-white py-20 md:py-28">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">조직 구성</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                            <Users className="h-8 w-8 text-[#00B8FF] mx-auto mb-3" />
                            <h3 className="text-lg font-bold mb-2">운영진</h3>
                            <p className="text-neutral-400 text-sm">동아리 전반 운영 및 기획</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                            <Sparkles className="h-8 w-8 text-[#00B8FF] mx-auto mb-3" />
                            <h3 className="text-lg font-bold mb-2">리퍼 (Leaper)</h3>
                            <p className="text-neutral-400 text-sm">정규 기수 활동 멤버</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                            <TrendingUp className="h-8 w-8 text-[#00B8FF] mx-auto mb-3" />
                            <h3 className="text-lg font-bold mb-2">멘토</h3>
                            <p className="text-neutral-400 text-sm">현업 전문가 멘토링</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="py-20">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-10">파트너 & 네트워크</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        {partners.map((p) => (
                            <span key={p} className="px-5 py-2 bg-neutral-100 rounded-full text-sm font-medium text-neutral-700">
                                {p}
                            </span>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
