"use client";

import { useCms } from "@/lib/cms-context";
import { Users, Search, Lightbulb, Presentation } from "lucide-react";

const steps = [
    { icon: Users, title: "팀 구성", desc: "전국 각지의 대학생들이 팀을 이루어 경쟁에 참가합니다." },
    { icon: Search, title: "과제 분석", desc: "실제 기업의 마케팅 과제를 분석하고 시장을 조사합니다." },
    { icon: Lightbulb, title: "전략 수립", desc: "차별화된 마케팅 전략과 크리에이티브를 기획합니다." },
    { icon: Presentation, title: "PT 발표", desc: "경쟁 프레젠테이션을 통해 최고의 전략을 겨룹니다." },
];

export default function PtPage() {
    const { getPostsByBoard } = useCms();

    const galleryPosts = getPostsByBoard("board-mad-gallery")
        .filter((p) => p.status === "published")
        .slice(0, 6);

    return (
        <div>
            {/* Hero */}
            <section className="bg-[#212121] text-white py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[#D32F2F] font-bold text-sm tracking-widest uppercase mb-3 block">
                        Competition PT
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">경쟁 PT</h1>
                    <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        실제 기업의 마케팅 과제를 바탕으로 팀 단위 경쟁 프레젠테이션을 진행합니다.
                        실전과 동일한 환경에서 마케팅 역량을 극대화하세요.
                    </p>
                </div>
            </section>

            {/* 경쟁 PT란? */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-6">경쟁 PT란?</h2>
                    <div className="space-y-4 text-neutral-600 leading-relaxed">
                        <p>
                            경쟁 PT는 MAD League의 핵심 프로그램입니다. 실제 기업이 제시하는 마케팅 과제를
                            바탕으로, 전국 각 대학의 마케팅 동아리들이 팀을 구성하여 경쟁합니다.
                        </p>
                        <p>
                            단순한 발표 대회가 아닌, 실전 마케팅 환경을 재현한 프로그램으로
                            시장 분석, 전략 수립, 크리에이티브 개발, 미디어 플랜 수립까지
                            마케팅의 전 과정을 경험할 수 있습니다.
                        </p>
                        <p>
                            현업 마케터와 광고인이 심사위원으로 참여하여 실질적인 피드백을 제공하며,
                            우수 팀에게는 인턴십 기회와 상금이 주어집니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* 진행 프로세스 */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-12 text-center">진행 프로세스</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, i) => (
                            <div key={step.title} className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D32F2F]/10 text-[#D32F2F] mb-4">
                                    <step.icon className="h-7 w-7" />
                                </div>
                                <div className="text-xs font-bold text-[#D32F2F] mb-2">STEP {i + 1}</div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">{step.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 역대 경쟁 PT 사례 */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-8">역대 경쟁 PT</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: "지평주조 100주년 마케팅", year: "2025", teams: 12, desc: "지평주조 100주년을 기념하는 브랜드 마케팅 전략 경쟁" },
                            { title: "스타트업 브랜딩 챌린지", year: "2024", teams: 8, desc: "신규 스타트업의 브랜드 아이덴티티 및 론칭 전략 수립" },
                            { title: "소셜 미디어 캠페인", year: "2024", teams: 10, desc: "Z세대 타겟 소셜 미디어 마케팅 캠페인 기획" },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 bg-[#D32F2F]/10 text-[#D32F2F] text-xs font-bold rounded">
                                        {item.year}
                                    </span>
                                    <span className="text-xs text-neutral-400">{item.teams}개 팀 참가</span>
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* CMS Gallery Posts */}
                    {galleryPosts.length > 0 && (
                        <div className="mt-12">
                            <h3 className="text-lg font-bold text-neutral-900 mb-4">경쟁 PT 현장</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {galleryPosts.map((post) => (
                                    <div key={post.id} className="aspect-[4/3] bg-neutral-100 rounded-lg overflow-hidden relative group">
                                        <div className="w-full h-full bg-gradient-to-br from-[#D32F2F]/10 to-neutral-200 flex items-center justify-center">
                                            <span className="text-3xl font-bold text-[#D32F2F]/20">MAD</span>
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                            <p className="text-white text-xs font-medium">{post.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
