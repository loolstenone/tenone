"use client";

import Link from "next/link";
import { Target, Eye, Heart, Zap, ArrowRight } from "lucide-react";

export default function YouInOneAboutPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#171717] text-white py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#E53935] font-bold text-sm tracking-widest uppercase mb-4">
                        About YouInOne
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                        문제 해결을 위한<br />
                        <span className="text-[#E53935]">프로젝트 그룹</span>
                    </h1>
                    <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mx-auto">
                        YouInOne(유인원)은 기업과 사회의 문제를 해결하기 위해 모인 프로젝트 그룹입니다.
                        아이디어와 전략을 결합하여 실질적인 변화를 만들어냅니다.
                    </p>
                </div>
            </section>

            {/* Story */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-[#171717] mb-4">우리의 이야기</h2>
                            <p className="text-neutral-600 leading-relaxed mb-4">
                                &ldquo;문제를 발견하면, 해결합니다.&rdquo;
                            </p>
                            <p className="text-neutral-500 leading-relaxed mb-4">
                                YouInOne은 마케팅, 브랜딩, 콘텐츠, 교육 분야의 전문가들이 모여 만든 프로젝트 그룹입니다.
                                대기업이 아닌 소규모 기업과 개인, 사회적 기업이 겪는 문제에 주목합니다.
                            </p>
                            <p className="text-neutral-500 leading-relaxed">
                                혼자서는 어렵지만 함께라면 가능하다는 신념 아래,
                                소규모 기업 연합 얼라이언스를 구축하여 서로의 강점을 나누고 시너지를 만들어갑니다.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-[#171717] to-neutral-700 rounded-xl aspect-square flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-5xl font-extrabold text-white/10">YIO</span>
                                <p className="text-neutral-500 text-sm mt-2">Since 2020</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-[#171717] mb-3">비전 & 미션</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-white border border-neutral-200 rounded-xl">
                            <div className="inline-flex p-3 rounded-lg mb-5 bg-[#E53935]/10 text-[#E53935]">
                                <Eye className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-[#171717] mb-3">Vision</h3>
                            <p className="text-neutral-500 leading-relaxed">
                                모든 기업과 개인이 자신만의 문제 해결 능력을 갖추고,
                                연대를 통해 더 큰 사회적 가치를 만들어가는 세상
                            </p>
                        </div>
                        <div className="p-8 bg-white border border-neutral-200 rounded-xl">
                            <div className="inline-flex p-3 rounded-lg mb-5 bg-[#171717]/10 text-[#171717]">
                                <Target className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold text-[#171717] mb-3">Mission</h3>
                            <p className="text-neutral-500 leading-relaxed">
                                아이디어와 전략으로 기업과 사회의 문제를 정의하고,
                                소규모 기업 얼라이언스를 통해 실행 가능한 솔루션을 제공합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold text-[#171717] mb-3">핵심 가치</h2>
                        <p className="text-neutral-500">YouInOne이 지켜나가는 원칙</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Zap,
                                title: "실행력",
                                desc: "아이디어에 그치지 않고, 실행까지 책임집니다.",
                            },
                            {
                                icon: Heart,
                                title: "공감",
                                desc: "문제의 본질을 이해하기 위해 현장의 목소리에 귀 기울입니다.",
                            },
                            {
                                icon: Target,
                                title: "전략적 사고",
                                desc: "데이터와 인사이트 기반의 전략으로 효과를 극대화합니다.",
                            },
                            {
                                icon: Eye,
                                title: "연대",
                                desc: "혼자가 아닌 함께. 얼라이언스를 통해 시너지를 만듭니다.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="p-6 border border-neutral-200 rounded-xl text-center hover:border-[#E53935]/30 transition-colors">
                                <div className="inline-flex p-3 rounded-full mb-4 bg-neutral-50 text-[#171717]">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-[#171717] mb-2">{item.title}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-[#171717] text-white text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">함께 문제를 해결할 준비가 되셨나요?</h2>
                    <p className="text-neutral-400 mb-8">
                        YouInOne 얼라이언스에 합류하거나, 프로젝트에 대해 문의해주세요.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/yi/alliance"
                            className="px-8 py-3 bg-[#E53935] text-white font-semibold hover:bg-[#C62828] transition-colors rounded inline-flex items-center gap-2"
                        >
                            얼라이언스 합류 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/yi/contact"
                            className="px-8 py-3 border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors rounded"
                        >
                            문의하기
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
