"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const programs = [
    {
        emoji: "💛",
        name: "공감대",
        prefix: "공감자",
        tagline: "우울하지 않습니다. 심각하지 않습니다.",
        intro: "가볍게 만나서 서로의 경험과 관심사를 나누고 더 나은 내일을 꿈꿀 수 있게 합니다.",
        question: "공부, 취업, 건강 그리고 세상의 무엇이든 우리의 [ 공감대 ]를 만들어 보면 어떨까요?",
        detail: "같은 고민, 같은 관심사를 가진 사람들 끼리 모여서 자신의 이야기를 털어 놓으면서 서로를 응원하고 지지해 주는 프로그램입니다.",
    },
    {
        emoji: "💡",
        name: "영감대",
        prefix: "영감자",
        tagline: "어렵지 않습니다. 복잡하지 않습니다.",
        intro: "자신이 직접 경험한 것 만큼 자신이 가장 잘 아는 것은 없습니다.",
        question: "내 경험과 인사이트를 다른 사람들과 나눠 [ 영감대 ]를 만들어 보면 어떨까요?",
        detail: "남들 앞에 설 수 있는 용기만 있다면 자신의 경험을 나눌 수만 있다면 많은 사람들 앞에서 자신이 보고 경험한 것들을 나누는 프로그램입니다.",
    },
    {
        emoji: "🌈",
        name: "오감대",
        prefix: "오감자",
        tagline: "다채롭습니다.",
        intro: "함께 공감하고 영감을 나눕니다. 일상 속에서 다양한 경험을 통해서 함께 느끼는 활동을 합니다.",
        question: "여행과 놀이를 통해 [ 오감대 ]를 만들어 보면 어떨까요?",
        detail: "우리는 일상 속에서 다양한 감각을 통해 세상을 느끼고 경험합니다. 시각, 청각, 후각, 미각, 촉각이라는 다섯 가지 감각은 우리의 삶을 더욱 풍요롭고 의미 있게 만들어줍니다.",
    },
];

export default function OgamjaPrograms() {
    return (
        <div>
            {/* Hero */}
            <section className="py-20 px-6 bg-gradient-to-b from-[#F5C518]/5 to-white">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">프로그램</h1>
                    <p className="text-lg text-neutral-500">
                        감자들이 함께 성장하는 세 가지 프로그램을 운영합니다.
                    </p>
                    <div className="w-16 h-1 bg-[#F5C518] mx-auto mt-6" />
                </div>
            </section>

            {/* 프로그램 소개 카드 */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl space-y-10">
                    {programs.map((prog) => (
                        <div
                            key={prog.name}
                            className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-[#F5C518] transition-colors"
                        >
                            {/* 상단 - 프로그램 요약 */}
                            <div className="p-8 bg-gradient-to-r from-[#F5C518]/5 to-transparent">
                                <div className="flex items-start gap-4">
                                    <span className="text-4xl shrink-0">{prog.emoji}</span>
                                    <div>
                                        <p className="text-sm text-[#D4A017] font-semibold mb-1">{prog.prefix}</p>
                                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">[ {prog.name} ]</h3>
                                        <p className="text-neutral-700">
                                            <strong>{prog.prefix}</strong>는 {prog.tagline}
                                        </p>
                                        <p className="text-neutral-600 mt-1">{prog.intro}</p>
                                        <p className="text-neutral-500 mt-2 italic">{prog.question}</p>
                                    </div>
                                </div>
                            </div>
                            {/* 하단 - 상세 설명 */}
                            <div className="px-8 pb-8 pt-4 border-t border-neutral-100">
                                <p className="text-neutral-500 text-sm leading-relaxed">{prog.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="mx-auto max-w-4xl text-center">
                    <span className="text-6xl block mb-4">🌱</span>
                    <h2 className="text-xl md:text-3xl font-bold mb-4">함께 자라는 감자밭</h2>
                    <p className="text-neutral-500 mb-8">
                        혼자 쓰는 글은 일기지만, 함께 나누면 이야기가 됩니다.<br />
                        공감자의 프로그램과 함께 성장해보세요.
                    </p>
                    <Link
                        href="/0g/writers"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#F5C518] text-neutral-900 font-semibold hover:bg-[#D4A017] transition-colors rounded-full"
                    >
                        필찐 지원하기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
