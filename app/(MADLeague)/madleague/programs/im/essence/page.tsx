"use client";

import Link from "next/link";
import { Flame, Compass, ArrowLeft, Sparkles, Triangle } from "lucide-react";

export default function EssencePage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#212121] text-white py-16 md:py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <Link
                        href="/madleague/idea-movement"
                        className="inline-flex items-center gap-2 text-violet-400 text-sm hover:text-violet-300 transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Idea Movement
                    </Link>
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Essence
                        </span>
                    </h1>
                    <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        본질은 그것이 그것으로서 있기 위해
                        <br />
                        없어서는 안 되는 것
                    </p>
                </div>
            </section>

            {/* What is Essence */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-amber-500" />
                        </div>
                        <span className="text-amber-500 font-bold text-sm tracking-widest uppercase">
                            What is Essence
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
                        <div>
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 mb-6 leading-tight">
                                <span className="text-amber-500">본질</span>이란
                                <br />
                                무엇인가
                            </h2>
                            <div className="space-y-4 text-neutral-600 text-lg leading-relaxed">
                                <p>
                                    본질은 그것이 그것으로서 있기 위해 없어서는
                                    안 되는 것이다.
                                </p>
                                <p>
                                    인간과 삼각형의 차이는 단순한 형체의 차이가
                                    아니다. 더 근본적인 &apos;무엇&apos;이
                                    존재한다. 본체이자 정의(定義)인 본질은,
                                    현대의 실존과는 대립되는 개념이다.
                                </p>
                                <p>
                                    우리는 표면적인 것에 집착하기 쉽다. 하지만
                                    진정한 변화는 본질을 꿰뚫어 볼 때 시작된다.
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl flex items-center justify-center border border-amber-100">
                                <div className="text-center space-y-6">
                                    <Triangle className="h-24 w-24 text-amber-300 mx-auto" />
                                    <div>
                                        <p className="text-amber-600 font-bold text-lg">
                                            본체 = 정의(定義)
                                        </p>
                                        <p className="text-neutral-400 text-sm mt-1">
                                            그것이 그것이게 하는 것
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quest for Essence */}
            <section className="py-24 px-6 bg-neutral-950 text-white">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <Compass className="h-6 w-6 text-orange-400" />
                        </div>
                        <span className="text-orange-400 font-bold text-sm tracking-widest uppercase">
                            Quest for Essence
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="aspect-square bg-gradient-to-br from-orange-500/20 to-transparent rounded-3xl flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <Flame className="h-20 w-20 text-orange-500/40 mx-auto" />
                                    <p className="text-orange-400 font-bold text-lg">
                                        왜 불이 생기는가?
                                    </p>
                                    <p className="text-neutral-500 text-sm">
                                        표면적 &ldquo;왜&rdquo;를 넘어
                                        <br />
                                        궁극의 이유를 탐구한다
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-6 leading-tight">
                                불을 찾아 떠나는
                                <br />
                                <span className="text-orange-400">모험</span>
                            </h2>
                            <div className="space-y-4 text-neutral-400 text-lg leading-relaxed">
                                <p>
                                    석기 시대의 원시인을 떠올려 보자. 그는
                                    생존을 위해 불이 필요했다. 추위를 이기고,
                                    음식을 익히고, 맹수를 쫓기 위해.
                                </p>
                                <p>
                                    하지만 여기서 멈추지 않는다. 실용적
                                    필요성을 넘어 &ldquo;왜 불이 생기는가&rdquo;라는
                                    근본적인 질문을 던진다.
                                </p>
                                <p className="text-neutral-300 font-medium">
                                    이것이 바로 본질을 향한 여정이다.
                                    <br />
                                    표면적인 &ldquo;왜&rdquo;를 넘어, 궁극의
                                    이유를 탐구하는 것.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Connection */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-xl md:text-3xl font-extrabold text-neutral-900 mb-6">
                        Idea Movement의 본질
                    </h2>
                    <p className="text-neutral-500 text-lg leading-relaxed max-w-2xl mx-auto mb-14">
                        본질을 이해하면 문제의 핵심이 보이고, 핵심이 보이면
                        아이디어가 명확해진다. 그리고 명확한 아이디어만이
                        세상을 바꿀 수 있다.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                        {["본질을 꿰뚫어 본다", "문제를 정의한다", "아이디어를 실행한다", "세상을 바꾼다"].map(
                            (step, i) => (
                                <div key={step} className="flex items-center gap-4">
                                    <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                                        <p className="text-sm font-bold text-neutral-800">
                                            {step}
                                        </p>
                                    </div>
                                    {i < 3 && (
                                        <span className="hidden md:block text-amber-300 font-bold text-xl">
                                            &rarr;
                                        </span>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold mb-4">
                        본질에 집중하라
                    </h2>
                    <p className="text-white/80 text-lg mb-10">
                        아이디어의 본질을 찾고, 실행으로 세상을 바꾸세요
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/madleague/idea-movement"
                            className="px-8 py-3 bg-white text-amber-600 font-semibold hover:bg-neutral-100 transition-colors rounded"
                        >
                            Idea Movement
                        </Link>
                        <Link
                            href="/signup"
                            className="px-8 py-3 border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors rounded"
                        >
                            MAD League 합류하기
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
