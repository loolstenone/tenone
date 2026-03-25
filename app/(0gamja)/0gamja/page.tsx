"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

const blogPosts = [
    { id: 1, title: "당신의 하루에", author: "GamjaJeon", category: "에세이", excerpt: "오늘 아침, 뿌연 하늘이 궁금해 창가로 다가가니 비가 온다. 창가에 맺힌 이슬방울 하나가 내 시선을 붙잡았다.", date: "2025.04.23", emoji: "🌅" },
    { id: 2, title: "겨울다운 겨울,", author: "gamjamaster", category: "에세이", excerpt: "겨울은 겨울다워야 한다. 코끝이 시리고 손끝이 차갑고, 입김이 뿌옇게 피어오르는 그런 겨울.", date: "2024.12.17", emoji: "❄️" },
    { id: 3, title: "트루먼 쇼 세상에 사는 루비 로드", author: "gamjamaster", category: "에세이", excerpt: "우리 모두는 자신만의 작은 트루먼 쇼를 살고 있다. 스마트폰 하나로 배우이자 감독이자 관객이 된 시대.", date: "2024.12.16", emoji: "🎬" },
    { id: 4, title: "로션 대신 연고를 발라보자!", author: "Glow Gamja", category: "뷰티", excerpt: "요즘은 약국에서 판매하는 제약 제품을 화장품으로 활용하는 트렌드가 뜨거운데, 윤감자도 한 번 도전해봤어요!", date: "2024.02.06", emoji: "✨" },
    { id: 5, title: "나는 감자 깎는 기계였다.", author: "GamjaJeon", category: "에세이", excerpt: "그리고 나는 감자 깎는 기계였다. 내 앞에 일했던 사람도, 그 앞에 일했던 사람도.", date: "2024.01.27", emoji: "🥔" },
    { id: 6, title: "감자 여러분 안녕!", author: "gamjamaster", category: "소개", excerpt: "공감자는 평범한 사람들의 일상에 공감하고 감자들의 성장에 영감을 불러 일으키는 young한 이야기들을 담아냅니다.", date: "2024.01.27", emoji: "👋" },
];

const featuredPosts = [
    { id: 1, title: "당신의 하루에", date: "04.23", emoji: "🌅" },
    { id: 2, title: "겨울다운 겨울,", date: "12.17", emoji: "❄️" },
    { id: 3, title: "트루먼 쇼 세상에 사는 루비 로드", date: "12.16", emoji: "🎬" },
    { id: 4, title: "나는 감자 깎는 기계였다.", date: "01.27", emoji: "🥔" },
];

const recommendedPosts = [
    { id: 1, title: "트루먼 쇼 세상에 사는 루비 로드", author: "gamjamaster", emoji: "🎬" },
    { id: 2, title: "로션 대신 연고를 발라보자!", author: "Glow Gamja", emoji: "✨" },
    { id: 3, title: "나는 감자 깎는 기계였다.", author: "GamjaJeon", emoji: "🥔" },
];

export default function OgamjaHome() {
    return (
        <div>
            {/* Hero Banner - 모집 공고 */}
            <section className="bg-gradient-to-r from-[#F5C518]/10 to-[#FFD54F]/10 border-b border-[#F5C518]/20">
                <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row items-center gap-8">
                    <div className="text-6xl md:text-8xl">🥔</div>
                    <div className="text-center md:text-left">
                        <p className="text-[#D4A017] text-sm font-semibold tracking-widest mb-2">공감자와 함께할 필찐 모집 중</p>
                        <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-3">
                            Feel 충만 <span className="text-[#F5C518]">찐</span>, 필찐을 모집합니다.
                        </h1>
                        <p className="text-neutral-600 mb-6">
                            감자처럼 소소하지만 따뜻한 이야기를 함께 나눌 필찐(필진)을 찾고 있습니다.
                        </p>
                        <Link
                            href="/0gamja/writers"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5C518] text-neutral-900 font-semibold hover:bg-[#D4A017] transition-colors rounded-full"
                        >
                            필찐 알아보기
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 주렁주렁 - 스크롤 티커 */}
            <section className="bg-[#F5C518] py-3 overflow-hidden">
                <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
                    <span className="text-sm font-bold text-neutral-900">🥔 주렁주렁</span>
                    {featuredPosts.concat(featuredPosts).map((post, i) => (
                        <span key={i} className="text-sm text-neutral-800 flex items-center gap-2">
                            <span>{post.emoji}</span>
                            <span className="font-medium">{post.title}</span>
                            <span className="text-neutral-600">{post.date}</span>
                        </span>
                    ))}
                </div>
            </section>

            {/* 메인 콘텐츠 */}
            <section className="py-12 px-6">
                <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-10">
                    {/* 블로그 포스트 그리드 */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href="/0gamja"
                                    className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-all hover:border-[#F5C518]"
                                >
                                    <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center">
                                        <span className="text-6xl group-hover:scale-110 transition-transform">{post.emoji}</span>
                                    </div>
                                    <div className="p-4">
                                        <span className="inline-block text-xs px-2 py-0.5 bg-[#F5C518]/20 text-[#D4A017] rounded-full mb-2">
                                            {post.category}
                                        </span>
                                        <h3 className="font-semibold text-neutral-900 group-hover:text-[#D4A017] transition-colors mb-1">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{post.excerpt}</p>
                                        <div className="flex items-center justify-between text-xs text-neutral-400">
                                            <span>by {post.author}</span>
                                            <span>{post.date}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 사이드바 */}
                    <aside className="w-full lg:w-72 shrink-0 space-y-8">
                        {/* 검색 */}
                        <div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="검색..."
                                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F5C518]/50"
                                />
                                <button className="px-4 py-2 bg-[#F5C518] text-neutral-900 rounded-lg text-sm font-medium hover:bg-[#D4A017] transition-colors">
                                    검색
                                </button>
                            </div>
                        </div>

                        {/* 최신 글 */}
                        <div>
                            <h3 className="font-semibold text-neutral-900 mb-3">최신 글</h3>
                            <div className="space-y-2">
                                {blogPosts.slice(0, 5).map((post) => (
                                    <Link
                                        key={post.id}
                                        href="/0gamja"
                                        className="flex items-center gap-2 text-sm text-neutral-600 hover:text-[#D4A017] transition-colors"
                                    >
                                        <ChevronRight className="h-3 w-3 text-[#F5C518]" />
                                        {post.title}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* 카테고리 */}
                        <div>
                            <h3 className="font-semibold text-neutral-900 mb-3">카테고리</h3>
                            <div className="space-y-1">
                                {["에세이", "뷰티", "소개", "미분류"].map((cat) => (
                                    <span
                                        key={cat}
                                        className="inline-block mr-2 mb-2 px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs hover:bg-[#F5C518]/20 hover:text-[#D4A017] transition-colors cursor-pointer"
                                    >
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            {/* 흘린 감자 주워드림 - 추천 */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-2xl font-bold mb-2">
                        🥔 흘린 감자 주워드림
                        <span className="text-base font-normal text-neutral-500 ml-3">놓치면 아쉬운 글 모음</span>
                    </h2>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendedPosts.map((post) => (
                            <Link
                                key={post.id}
                                href="/0gamja"
                                className="group flex items-center gap-4 bg-white rounded-xl p-4 border border-neutral-200 hover:border-[#F5C518] hover:shadow-md transition-all"
                            >
                                <span className="text-4xl shrink-0">{post.emoji}</span>
                                <div>
                                    <p className="font-medium text-neutral-900 group-hover:text-[#D4A017] transition-colors">{post.title}</p>
                                    <p className="text-sm text-neutral-500">by {post.author}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* marquee animation */}
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
        </div>
    );
}
