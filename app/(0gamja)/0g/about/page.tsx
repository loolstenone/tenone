"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const gamjaTypes = [
    { emoji: "💛", name: "공감자", tagline: "0gamja는 당신의 이야기에 귀를 기울입니다.", desc: "당신의 경험은 공감을 불러일으키고, 마음을 움직이는 힘이 됩니다. 우리는 서로의 이야기에서 위로를 찾고, 공감의 끈을 통해 연결됩니다." },
    { emoji: "💡", name: "영감자", tagline: "0gamja는 당신이 세상에 빛을 발할 수 있는 장입니다.", desc: "당신의 창의성은 여기서 영감의 씨앗이 되어, 다른 이의 삶에 새로운 시각을 선물합니다. 우리는 서로의 생각을 나누며, 상상력의 샘을 끊임없이 솟아나게 합니다." },
    { emoji: "😲", name: "Oh 감자", tagline: "일상의 작은 행복에 감사할 줄 알고 나눌 줄 아는 사람들입니다.", desc: "행복은 강도(强度) 보다는 빈도(頻度)가 더 중요 하다고 합니다." },
    { emoji: "🌱", name: "Young감자", tagline: "젊음의 패기와 열정을 기리는 공간입니다.", desc: "나이는 숫자에 불과하고, 젊음은 마음가짐을 의미합니다. 우리는 새롭고 신선한 아이디어로 세상을 바라보며, 늘 젊게, 늘 새롭게 생각합니다." },
    { emoji: "🥔", name: "生감자", tagline: "아무것도 없는 0에서 시작해서 무한대로.", desc: "인생과 꿈을 펼치고 싶은 사람들의 이야기를 들어주고 서로의 관심사를 응원으로 함께 살아납니다." },
];

const members = [
    { name: "yomigamja", role: "귀여움 담당", emoji: "🐹" },
    { name: "glowgamja", role: "뷰티 담당", emoji: "✨" },
    { name: "idolgamja", role: "아이돌 담당", emoji: "🎤" },
    { name: "gamjajeon", role: "바닥담당", emoji: "🫓", bio: "시니컬한데 일상에 재미도 좀 넣으려고 하지만 사람들은 의아해 함" },
];

export default function OgamjaAbout() {
    return (
        <div>
            {/* Hero */}
            <section className="py-20 px-6 bg-gradient-to-b from-[#F5C518]/5 to-white">
                <div className="mx-auto max-w-4xl text-center">
                    <span className="text-5xl md:text-7xl block mb-6">🥔</span>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">0gamja는 당신의 이야기 입니다.</h1>
                    <p className="text-xl text-neutral-500">하찮고 소중한 감자들의 공감 이야기</p>
                    <div className="w-16 h-1 bg-[#F5C518] mx-auto mt-6" />
                </div>
            </section>

            {/* 슬로건 */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-3xl text-center space-y-3">
                    <p className="text-lg text-neutral-700"><strong>공감, 영감을 주며, Oh! 하는 감탄을 주는</strong></p>
                    <p className="text-lg text-neutral-700"><strong>Young하게 생각하는</strong> 우리 감자들의 이야기</p>
                    <p className="text-lg text-neutral-700"><strong>일상의 이야기로 함께 生감자가 되어 보세요</strong></p>
                    <div className="pt-6 space-y-2 text-neutral-500">
                        <p>둥글둥글 소박한 진짜 일상의 이야기</p>
                        <p>투박하지만 우리가 바라보는 세상</p>
                        <p>바로 당신의 이야기입니다.</p>
                        <p className="font-semibold text-neutral-700 pt-2">같이 시작하실까요?</p>
                    </div>
                </div>
            </section>

            {/* 감자 유형 */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="mx-auto max-w-5xl space-y-8">
                    {gamjaTypes.map((g) => (
                        <div key={g.name} className="bg-white rounded-xl border border-neutral-200 p-8 hover:border-[#F5C518] transition-colors">
                            <div className="flex items-start gap-4">
                                <span className="text-4xl shrink-0">{g.emoji}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900 mb-1">
                                        우리는 &lsquo;{g.name}&rsquo;입니다. <span className="text-[#D4A017] text-sm font-normal">0gamja</span>
                                    </h3>
                                    <p className="text-neutral-600 mb-2">{g.tagline}</p>
                                    <p className="text-sm text-neutral-500">{g.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 감자 밭 멤버 */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-center mb-10">🥔 감자 밭에 감자들을 소개합니다.</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {members.map((m) => (
                            <div key={m.name} className="text-center bg-white rounded-xl border border-neutral-200 p-6 hover:border-[#F5C518] transition-colors">
                                <span className="text-5xl block mb-3">{m.emoji}</span>
                                <p className="font-bold text-neutral-900">{m.name}</p>
                                <p className="text-sm text-[#D4A017] mb-2">{m.role}</p>
                                {m.bio && <p className="text-xs text-neutral-400">{m.bio}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-xl md:text-3xl font-bold mb-4">새로운 감자를 기다립니다.</h2>
                    <p className="text-neutral-500 mb-2">에세이, 소설, 시놉시스, 트렌드, 일기, 요약 정리 어떤 형태도 좋습니다.</p>
                    <p className="text-neutral-500 mb-8">자신 만의 방법으로 세상과 소통하고 자신의 생각을 사람들에게 공유하고 싶은 사람들을 기다리고 있습니다.</p>
                    <Link
                        href="/0g/writers"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#F5C518] text-neutral-900 font-semibold hover:bg-[#D4A017] transition-colors rounded-full"
                    >
                        필찐 알아보기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
