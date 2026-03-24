"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const writers = [
    { id: 1, name: "gamjamaster", role: "에디터", emoji: "🥔", bio: "공감자의 마스터 감자. 모든 감자를 사랑합니다.", posts: 3 },
    { id: 2, name: "GamjaJeon", role: "필찐", emoji: "🫓", bio: "시니컬한데 일상에 재미도 좀 넣으려고 하지만 사람들은 의아해 함", posts: 2 },
    { id: 3, name: "Glow Gamja", role: "필찐", emoji: "✨", bio: "뷰티와 라이프스타일, 반짝이는 감자의 일상.", posts: 1 },
];

export default function OgamjaWriters() {
    return (
        <div>
            {/* Hero */}
            <section className="py-20 px-6 bg-gradient-to-b from-[#F5C518]/5 to-white">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">필찐감자를 모집합니다</h1>
                    <p className="text-lg text-neutral-500">
                        우량 감자도, 불량 감자도 괜찮습니다.
                    </p>
                    <div className="w-16 h-1 bg-[#F5C518] mx-auto mt-6" />
                </div>
            </section>

            {/* 자격 안내 */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-3xl">
                    <div className="bg-[#F5C518]/10 rounded-2xl p-10 text-center border border-[#F5C518]/20">
                        <span className="text-6xl block mb-6">🥔</span>
                        <p className="text-xl text-neutral-700 mb-4">
                            마케팅 전문가? IT 전문가? 블로그 전문가?
                        </p>
                        <p className="text-2xl font-bold text-neutral-900 mb-6">상관 없습니다.</p>
                        <p className="text-neutral-600">
                            소소한 자신의 이야기를 쓸 수 있으면 됩니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* 불량감자도 환영 */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold mb-4">불량감자도 오세요</h2>
                    <p className="text-neutral-500 mb-8">
                        아직 뭘 할지 모르는 감자도 함께 할 수 있는 것을 찾아 드립니다.<br />
                        공감자가 되기 위한 의지만 있다면 우선 연락을 주세요.
                    </p>
                </div>
            </section>

            {/* 현재 필찐 목록 */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-2xl font-bold text-center mb-10">현재 활동 중인 감자들</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {writers.map((writer) => (
                            <div
                                key={writer.id}
                                className="bg-white rounded-xl border border-neutral-200 p-6 text-center hover:border-[#F5C518] hover:shadow-md transition-all"
                            >
                                <span className="text-5xl block mb-4">{writer.emoji}</span>
                                <h3 className="font-bold text-neutral-900 text-lg">{writer.name}</h3>
                                <span className="inline-block text-xs px-2 py-0.5 bg-[#F5C518]/20 text-[#D4A017] rounded-full mt-1 mb-3">
                                    {writer.role}
                                </span>
                                <p className="text-sm text-neutral-500 mb-3">{writer.bio}</p>
                                <p className="text-xs text-neutral-400">{writer.posts}개의 글</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="mx-auto max-w-4xl text-center">
                    <span className="text-6xl block mb-4">✍️</span>
                    <h2 className="text-xl md:text-3xl font-bold mb-4">함께 쓰는 감자 이야기</h2>
                    <p className="text-neutral-500 mb-8">
                        글 잘 쓰는 사람보다, 진짜 이야기를 가진 사람을 찾습니다.<br />
                        감자처럼 소소해도 괜찮습니다. 당신의 이야기가 누군가의 위로가 됩니다.
                    </p>
                    <Link
                        href="/0g/about"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#F5C518] text-neutral-900 font-semibold hover:bg-[#D4A017] transition-colors rounded-full"
                    >
                        공감자 알아보기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
