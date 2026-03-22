"use client";

import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

const works = [
    { id: 1, title: "최초의 AI do LUKI by RooK", category: "AI Idol", image: "🎤" },
    { id: 2, title: "FEARLESS - 뮤직비디오", category: "Music Video", image: "🎬" },
    { id: 3, title: "까치호랑이 - 한국 전통 AI 아트", category: "AI Art", image: "🎨" },
    { id: 4, title: "조선의 바람 - 역사 시리즈", category: "AI Art", image: "⚔️" },
    { id: 5, title: "사이버펑크 서울", category: "AI Art", image: "🌃" },
    { id: 6, title: "진주 귀걸이를 한 소녀 - AI 리메이크", category: "Classic Remake", image: "👩" },
    { id: 7, title: "비열한 저잣거리", category: "AI Film", image: "🎞️" },
    { id: 8, title: "니에프스의 창 - 최초의 사진 리메이크", category: "Classic Remake", image: "📸" },
];

const freeBoard = [
    { id: 1, title: "사이버펑크 느와르 액션", image: "🎬", views: 234 },
    { id: 2, title: "이소룡 피규어 AI 생성", image: "🥋", views: 189 },
    { id: 3, title: "오피스 액션 피규어", image: "💪", views: 156 },
];

const artists = [
    { id: 1, name: "미연", role: "Visual Artist", emoji: "👩‍🎨" },
    { id: 2, name: "하은", role: "Character Designer", emoji: "✏️" },
    { id: 3, name: "수아", role: "Fashion AI", emoji: "👗" },
    { id: 4, name: "지우", role: "Portrait Artist", emoji: "🖼️" },
    { id: 5, name: "다인", role: "K-Girl Group", emoji: "💃" },
    { id: 6, name: "세라", role: "Concept Artist", emoji: "🎭" },
    { id: 7, name: "유진", role: "Classical AI", emoji: "🎵" },
    { id: 8, name: "민서", role: "Digital Human", emoji: "🤖" },
    { id: 9, name: "하나", role: "Photo Artist", emoji: "📷" },
];

export default function RooKHome() {
    return (
        <div>
            {/* Hero Section - 다크 */}
            <section className="relative bg-[#282828] min-h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#282828]" />
                <div className="relative text-center px-6">
                    <p className="text-[#00d255] text-sm font-medium tracking-widest mb-4">AI CREATOR</p>
                    <h1 className="text-white text-5xl md:text-7xl font-bold tracking-tight mb-6">
                        Roo<span className="inline-block" style={{ transform: 'scaleX(-1)' }}>K</span>
                    </h1>
                    <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        밈에서 영화까지, 루크의 창작 영역에는 경계가 없습니다.<br />
                        하고 싶은 것이라면 무엇이든 도전합니다.
                    </p>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Link
                            href="/rk/works"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00d255] text-black font-semibold hover:bg-[#00b347] transition-colors rounded"
                        >
                            <Play className="h-4 w-4" />
                            비열한 저잣거리 스토리 보기
                        </Link>
                    </div>
                </div>
            </section>

            {/* Works Section */}
            <section className="py-20 px-6 bg-white">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-3xl font-bold mb-2">
                        Works
                        <span className="text-base font-normal text-neutral-500 ml-3">루크가 작업한 제작물입니다.</span>
                    </h2>
                    <p className="text-neutral-600 mb-10">
                        밈에서 영화까지, 루크의 창작 영역에는 경계가 없습니다. 하고 싶은 것이라면 무엇이든 도전합니다.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {works.map((work) => (
                            <Link
                                key={work.id}
                                href="/rk/works"
                                className="group relative aspect-square bg-neutral-900 rounded-lg overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-[#00d255] transition-all"
                            >
                                <span className="text-6xl">{work.image}</span>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <div>
                                        <p className="text-white text-sm font-medium">{work.title}</p>
                                        <p className="text-[#00d255] text-xs">{work.category}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Free Board Section */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-3xl font-bold mb-2">
                        Free board
                        <span className="text-base font-normal text-neutral-500 ml-3">누구나 작성할 수 있는 자랑게시판입니다.</span>
                    </h2>
                    <p className="text-neutral-600 mb-10">
                        성공작도 망작도 괜찮습니다. 공유를 통해 성장하고 웃기도 합니다.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {freeBoard.map((post) => (
                            <Link
                                key={post.id}
                                href="/rk/board"
                                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="aspect-video bg-neutral-900 flex items-center justify-center">
                                    <span className="text-5xl">{post.image}</span>
                                </div>
                                <div className="p-4">
                                    <p className="font-medium group-hover:text-[#00d255] transition-colors">{post.title}</p>
                                    <p className="text-sm text-neutral-500 mt-1">조회 {post.views}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Artist Section */}
            <section className="py-20 px-6 bg-white">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-3xl font-bold mb-2">
                        AI Artist
                        <span className="text-base font-normal text-neutral-500 ml-3">루크 소속 인공지능 모델들입니다.</span>
                    </h2>
                    <p className="text-neutral-600 mb-10">
                        당신의 브랜드와 콘텐츠를 위해서라면 최선을 다합니다.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {artists.map((artist) => (
                            <Link
                                key={artist.id}
                                href="/rk/artist"
                                className="group text-center"
                            >
                                <div className="aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center group-hover:ring-2 group-hover:ring-[#00d255] transition-all">
                                    <span className="text-5xl">{artist.emoji}</span>
                                </div>
                                <p className="mt-3 font-medium group-hover:text-[#00d255] transition-colors">{artist.name}</p>
                                <p className="text-sm text-neutral-500">{artist.role}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Rookie CTA */}
            <section className="py-20 px-6 bg-[#282828]">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-neutral-400 mb-4">
                        RooKie는 루크와 함께 인공지능 연구를 하며 콘텐츠를 제작하는 신입 크리에이터입니다.
                    </p>
                    <p className="text-neutral-400 mb-4">
                        수시로 모집하고 있습니다.
                    </p>
                    <p className="text-neutral-400 mb-8">
                        많은 분들의 관심과 도전 부탁드립니다.
                    </p>
                    <div className="flex items-center justify-center gap-6">
                        <div className="text-6xl">🎨</div>
                        <div className="text-left">
                            <p className="text-white text-3xl md:text-4xl font-bold italic mb-2">I want You</p>
                            <p className="text-white text-3xl md:text-4xl font-bold italic">For Rookie</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <Link
                            href="/rk/rookie"
                            className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-600 text-neutral-300 hover:border-[#00d255] hover:text-[#00d255] transition-colors rounded"
                        >
                            RooKie 확인하기
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
