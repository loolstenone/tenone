"use client";

import Link from "next/link";

const categories = ["전체", "AI Art", "AI Film", "Music Video", "Classic Remake", "AI Idol"];

const works = [
    { id: 1, title: "최초의 AI do LUKI by RooK", category: "AI Idol", emoji: "🎤", desc: "AI 아이돌 LUKI 프로젝트" },
    { id: 2, title: "FEARLESS - 뮤직비디오", category: "Music Video", emoji: "🎬", desc: "AI 생성 뮤직비디오" },
    { id: 3, title: "까치호랑이", category: "AI Art", emoji: "🐯", desc: "한국 전통 민화 AI 재해석" },
    { id: 4, title: "조선의 바람", category: "AI Art", emoji: "⚔️", desc: "역사 시리즈 AI 아트" },
    { id: 5, title: "사이버펑크 서울", category: "AI Art", emoji: "🌃", desc: "미래 서울 AI 비주얼" },
    { id: 6, title: "진주 귀걸이를 한 소녀 - AI", category: "Classic Remake", emoji: "👩", desc: "고전 명화 AI 리메이크 시리즈" },
    { id: 7, title: "비열한 저잣거리", category: "AI Film", emoji: "🎞️", desc: "조선 시대 AI 단편 영화" },
    { id: 8, title: "니에프스의 창", category: "Classic Remake", emoji: "📸", desc: "최초의 사진 AI 리메이크" },
    { id: 9, title: "아프리카 전통 초상", category: "AI Art", emoji: "🌍", desc: "AI 초상화 시리즈" },
    { id: 10, title: "네온 도시의 사무라이", category: "AI Film", emoji: "⚡", desc: "사이버펑크 액션" },
];

export default function RooKWorksPage() {
    return (
        <div className="py-12 px-6">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-4xl font-bold mb-2">Works</h1>
                <p className="text-neutral-600 mb-8">루크가 작업한 제작물입니다. 밈에서 영화까지, 루크의 창작 영역에는 경계가 없습니다.</p>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-10">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className="px-4 py-2 text-sm rounded-full border border-neutral-300 hover:border-[#00d255] hover:text-[#00d255] transition-colors first:bg-[#282828] first:text-white first:border-[#282828]"
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Works Grid - Masonry style */}
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {works.map((work, i) => (
                        <div
                            key={work.id}
                            className="break-inside-avoid bg-neutral-900 rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-[#00d255] transition-all"
                        >
                            <div className={`flex items-center justify-center ${i % 3 === 0 ? 'h-80' : i % 3 === 1 ? 'h-56' : 'h-64'}`}>
                                <span className="text-7xl">{work.emoji}</span>
                            </div>
                            <div className="p-4">
                                <p className="text-white font-medium group-hover:text-[#00d255] transition-colors">{work.title}</p>
                                <p className="text-neutral-500 text-sm mt-1">{work.desc}</p>
                                <span className="inline-block mt-2 text-xs px-2 py-1 bg-neutral-800 text-neutral-400 rounded">{work.category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
