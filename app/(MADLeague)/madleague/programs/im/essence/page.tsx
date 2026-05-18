import Link from "next/link";
import { Flame, Compass, Triangle, ArrowLeft, ArrowRight } from "lucide-react";

export const metadata = { title: 'Essence — Idea Movement', description: '본질이란 무엇인가 — MADLeague Idea Movement' };

export default function EssencePage() {
    return (
        <div className="bg-[var(--mad-black,#000)] text-white">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-neutral-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.12),transparent_60%)]" aria-hidden />
                <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
                    <Link
                        href="/madleague/programs/im"
                        className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-500 hover:text-white transition mb-8"
                    >
                        <ArrowLeft className="h-3 w-3" /> IDEA MOVEMENT
                    </Link>
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25]">ESSENCE</div>
                    <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight leading-tight">본질</h1>
                    <p className="mt-8 max-w-2xl text-xl text-neutral-300 leading-relaxed">
                        본질은 그것이 그것으로서 있기 위해<br />
                        없어서는 안 되는 것
                    </p>
                </div>
            </section>

            {/* What is Essence */}
            <section className="mx-auto max-w-7xl px-6 py-20">
                <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-4">WHAT IS ESSENCE</div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div>
                        <h2 className="text-4xl font-black tracking-tight mb-8">
                            본질이란<br />무엇인가
                        </h2>
                        <div className="space-y-5 text-neutral-400 text-lg leading-relaxed">
                            <p>본질은 그것이 그것으로서 있기 위해 없어서는 안 되는 것이다.</p>
                            <p>
                                인간과 삼각형의 차이는 단순한 형체의 차이가 아니다.
                                더 근본적인 '무엇'이 존재한다. 본체이자 정의(定義)인 본질은,
                                현대의 실존과는 대립되는 개념이다.
                            </p>
                            <p>우리는 표면적인 것에 집착하기 쉽다. 하지만 진정한 변화는 본질을 꿰뚫어 볼 때 시작된다.</p>
                        </div>
                    </div>

                    <div className="bg-neutral-950 border border-neutral-900 p-12 flex flex-col items-center justify-center aspect-square">
                        <Triangle className="h-20 w-20 text-[#EC1D25]/40 mb-8" />
                        <div className="text-center">
                            <p className="text-xl font-black text-white">본체 = 정의(定義)</p>
                            <p className="text-sm text-neutral-500 mt-2">그것이 그것이게 하는 것</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quest for Essence */}
            <section className="border-t border-neutral-900 py-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-4">QUEST FOR ESSENCE</div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-4xl font-black tracking-tight mb-8">
                                불을 찾아 떠나는<br />모험
                            </h2>
                            <div className="space-y-5 text-neutral-400 text-lg leading-relaxed">
                                <p>
                                    석기 시대의 원시인을 떠올려 보자. 그는 생존을 위해 불이 필요했다.
                                    추위를 이기고, 음식을 익히고, 맹수를 쫓기 위해.
                                </p>
                                <p>
                                    하지만 여기서 멈추지 않는다. 실용적 필요성을 넘어
                                    "왜 불이 생기는가"라는 근본적인 질문을 던진다.
                                </p>
                                <p className="text-neutral-300 font-bold">
                                    이것이 바로 본질을 향한 여정이다.<br />
                                    표면적인 "왜"를 넘어, 궁극의 이유를 탐구하는 것.
                                </p>
                            </div>
                        </div>

                        <div className="bg-neutral-950 border border-neutral-900 p-12 flex flex-col items-center justify-center aspect-square">
                            <Flame className="h-20 w-20 text-[#EC1D25]/40 mb-8" />
                            <div className="text-center">
                                <p className="text-xl font-black text-white">왜 불이 생기는가?</p>
                                <p className="text-sm text-neutral-500 mt-2">
                                    표면적 "왜"를 넘어<br />궁극의 이유를 탐구한다
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Connection */}
            <section className="border-t border-neutral-900 py-20">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-4">IDEA MOVEMENT의 본질</div>
                    <h2 className="text-4xl font-black tracking-tight mb-8">
                        본질 → 아이디어 → 변화
                    </h2>
                    <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mb-12">
                        본질을 이해하면 문제의 핵심이 보이고, 핵심이 보이면
                        아이디어가 명확해진다. 그리고 명확한 아이디어만이 세상을 바꿀 수 있다.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { icon: Compass, step: '01', title: '본질을 꿰뚫어 본다', desc: '표면 너머의 근본 이유를 탐구한다.' },
                            { icon: Triangle, step: '02', title: '문제를 정의한다', desc: '핵심을 포착해 진짜 질문을 세운다.' },
                            { icon: Flame, step: '03', title: '아이디어를 실행한다', desc: '명확한 아이디어로 구체적 방안을 만든다.' },
                            { icon: ArrowRight, step: '04', title: '세상을 바꾼다', desc: '실행이 쌓여 현실을 변화시킨다.' },
                        ].map((item) => (
                            <div key={item.step} className="bg-neutral-950 border border-neutral-900 p-8">
                                <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-6">{item.step}</div>
                                <item.icon className="h-8 w-8 text-neutral-600 mb-4" />
                                <h3 className="font-black text-white mb-2">{item.title}</h3>
                                <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#EC1D25]">
                <div className="mx-auto max-w-7xl px-6 py-24 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <div className="text-sm font-bold tracking-widest text-white/70 mb-3">APPLY</div>
                        <div className="text-3xl sm:text-4xl font-black text-white">본질에 집중하라</div>
                        <p className="mt-3 text-white/80">아이디어의 본질을 찾고, 실행으로 세상을 바꾸세요.</p>
                    </div>
                    <Link href="/madleague/apply" className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-10 py-5 text-lg transition">
                        지원하기 <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
