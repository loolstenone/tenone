"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const members = [
    { name: "Eric", role: "Copy Writer", emoji: "✍️", desc: "카피라이터. 브랜드의 이야기를 만듭니다." },
    { name: "Leo", role: "Planner", emoji: "📋", desc: "기획자. 아이디어를 전략으로 바꿉니다." },
    { name: "Cheonil", role: "Planner", emoji: "💡", desc: "기획자. 문제의 본질을 파고듭니다." },
    { name: "Winie", role: "Art Director", emoji: "🎨", desc: "아트디렉터. 시각으로 메시지를 전달합니다." },
    { name: "Lily", role: "Art Director", emoji: "🖌️", desc: "아트디렉터. 디자인에 감정을 담습니다." },
    { name: "Alexander", role: "Copy Writer", emoji: "📝", desc: "카피라이터. 한 줄로 세상을 바꿉니다." },
];

const alliance = [
    { name: "aMuten", role: "Creative Director", location: "제주", emoji: "🌊", desc: "제주에서 크리에이티브 디렉팅과 영상 제작을 담당합니다." },
    { name: "Patrick", role: "Creative Director", location: "부산", emoji: "🏙️", desc: "부산에서 광고 캠페인과 크리에이티브 작업을 진행합니다." },
];

export default function YouInOnePeoplePage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#171717] py-16 md:py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#E53935] text-sm font-medium tracking-widest mb-4">PEOPLE</p>
                    <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-bold mb-6">
                        유인원의 사람들
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        학생부터 30년차 현업 전문가까지, 다양한 배경의 사람들이 모여<br />
                        하나의 프로젝트를 만들어갑니다.
                    </p>
                </div>
            </section>

            {/* Members */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold mb-2">Members</h2>
                    <p className="text-neutral-500 mb-10">프로젝트 멤버스</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {members.map((m) => (
                            <div
                                key={m.name}
                                className="group p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-[#E53935]/30 transition-all text-center"
                            >
                                <div className="w-20 h-20 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                                    <span className="text-xl md:text-3xl">{m.emoji}</span>
                                </div>
                                <h3 className="text-lg font-bold group-hover:text-[#E53935] transition-colors">{m.name}</h3>
                                <p className="text-sm text-[#E53935] font-medium mt-1">{m.role}</p>
                                <p className="text-sm text-neutral-500 mt-3">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Alliance */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold mb-2">Alliance</h2>
                    <p className="text-neutral-500 mb-10">얼라이언스 파트너</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {alliance.map((a) => (
                            <div
                                key={a.name}
                                className="group p-6 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-[#E53935]/30 transition-all"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">{a.emoji}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold group-hover:text-[#E53935] transition-colors">{a.name}</h3>
                                        <p className="text-sm text-[#E53935] font-medium">{a.role}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-500">{a.desc}</p>
                                <span className="inline-block mt-3 text-xs px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                                    📍 {a.location}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 bg-[#171717] text-center">
                <h2 className="text-2xl font-bold text-white mb-4">함께할 사람을 찾습니다</h2>
                <p className="text-neutral-400 mb-8">멤버십 또는 얼라이언스로 유인원과 함께하세요.</p>
                <Link
                    href="/youinone/alliance"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#E53935] text-white font-medium hover:bg-[#C62828] transition-colors rounded"
                >
                    참여하기 <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    );
}
