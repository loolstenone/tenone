"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, Star } from "lucide-react";

const flashNews = [
    "2026 S/S 서울 패션위크 일정 공개",
    "파리 오트쿠튀르 하이라이트 — 메종 마르지엘라의 귀환",
    "뉴욕 패션위크 신진 디자이너 TOP 5",
    "런던 패션위크 — 지속가능 패션 트렌드",
];

const mainArticles = [
    { id: 1, title: "2026 S/S 서울 패션위크가 열린다", category: "서울", tag: "Main Story", excerpt: "DDP에서 펼쳐지는 2026 S/S 서울 패션위크. 올 시즌 주목할 디자이너와 컬렉션을 미리 살펴봅니다.", date: "2026.03.20", emoji: "🇰🇷" },
    { id: 2, title: "파리 오트쿠튀르 — 메종 마르지엘라의 새로운 시대", category: "파리", tag: "Editor's Pick", excerpt: "존 갈리아노 이후 메종 마르지엘라가 새 크리에이티브 디렉터와 함께 선보인 컬렉션.", date: "2026.03.18", emoji: "🇫🇷" },
    { id: 3, title: "뉴욕 패션위크 — 신진 디자이너가 주도하는 변화", category: "뉴욕", tag: "Trending", excerpt: "전통적인 빅 하우스 대신 신진 디자이너들이 뉴욕의 런웨이를 장악하고 있습니다.", date: "2026.03.15", emoji: "🇺🇸" },
];

const editorPicks = [
    { id: 1, title: "런던 패션위크 — 지속가능 패션의 중심", city: "런던", date: "2026.03.12" },
    { id: 2, title: "밀라노 — 이탈리안 크래프츠맨십의 부활", city: "밀라노", date: "2026.03.10" },
    { id: 3, title: "도쿄 패션위크 프리뷰", city: "월드", date: "2026.03.08" },
    { id: 4, title: "스트리트 런웨이 — 파리의 거리가 곧 런웨이", city: "파리", date: "2026.03.05" },
];

const trendingArticles = [
    { rank: 1, title: "서울 패션위크 일정 총정리", views: "12.4K" },
    { rank: 2, title: "파리 2026 S/S 하이라이트", views: "9.8K" },
    { rank: 3, title: "주목할 한국 디자이너 10인", views: "8.2K" },
    { rank: 4, title: "뉴욕 스트리트 패션 트렌드", views: "6.5K" },
    { rank: 5, title: "런던 지속가능 패션 브랜드", views: "5.1K" },
];

const popularArticles = [
    { id: 1, title: "모델 에이전시가 주목하는 뉴페이스", category: "모델", emoji: "👤" },
    { id: 2, title: "떠오르는 K-패션 브랜드 TOP 10", category: "브랜드", emoji: "🏷️" },
    { id: 3, title: "스트리트 런웨이 — 서울 가로수길", category: "스트리트", emoji: "📸" },
    { id: 4, title: "LA 패션위크 현장 스케치", category: "월드", emoji: "🌴" },
    { id: 5, title: "토론토 패션위크 프리뷰", category: "월드", emoji: "🍁" },
];

export default function FWNHome() {
    return (
        <div>
            {/* FLASH 뉴스 티커 */}
            <section className="bg-[#1a1a1a] border-b border-neutral-800 py-2 overflow-hidden">
                <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
                    <span className="flex items-center gap-2 text-sm font-bold text-[#00C853] shrink-0">
                        <span className="w-2 h-2 bg-[#00C853] rounded-full animate-pulse" />
                        FLASH
                    </span>
                    {flashNews.concat(flashNews).map((news, i) => (
                        <span key={i} className="text-sm text-neutral-300 shrink-0">
                            {news}
                            <span className="text-neutral-600 mx-4">|</span>
                        </span>
                    ))}
                </div>
            </section>

            {/* FWN 추천 기사 — 메인 히어로 */}
            <section className="py-10 px-6">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-sm font-semibold text-[#00C853] mb-6 flex items-center gap-2">
                        <Star className="h-4 w-4" /> FWN 추천 기사
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {mainArticles.map((article, i) => (
                            <Link
                                key={article.id}
                                href="/fw"
                                className={`group relative rounded-xl overflow-hidden ${
                                    i === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                                }`}
                            >
                                <div className={`bg-neutral-800 flex items-center justify-center ${
                                    i === 0 ? "aspect-[16/9]" : "aspect-[16/9]"
                                }`}>
                                    <span className={`${i === 0 ? "text-8xl" : "text-6xl"} group-hover:scale-110 transition-transform`}>
                                        {article.emoji}
                                    </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded">{article.tag}</span>
                                        <span className="text-xs px-2 py-0.5 bg-neutral-700 text-white rounded">{article.category}</span>
                                    </div>
                                    <h3 className={`font-bold text-white group-hover:text-[#00C853] transition-colors ${
                                        i === 0 ? "text-2xl lg:text-3xl" : "text-lg"
                                    }`}>
                                        {article.title}
                                    </h3>
                                    {i === 0 && <p className="text-neutral-300 text-sm mt-2 line-clamp-2">{article.excerpt}</p>}
                                    <p className="text-neutral-500 text-xs mt-2">{article.date}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 편집자 추천 + 트렌딩 */}
            <section className="py-10 px-6 bg-[#1a1a1a]">
                <div className="mx-auto max-w-7xl flex flex-col lg:flex-row gap-10">
                    {/* 편집자가 집은 기사 */}
                    <div className="flex-1">
                        <h2 className="text-sm font-semibold text-[#00C853] mb-6">편집자가 집은 기사</h2>
                        <div className="space-y-4">
                            {editorPicks.map((article) => (
                                <Link
                                    key={article.id}
                                    href="/fw"
                                    className="group flex items-center gap-4 bg-[#252525] rounded-lg p-4 hover:bg-[#2a2a2a] transition-colors"
                                >
                                    <div className="w-20 h-20 bg-neutral-700 rounded-lg flex items-center justify-center shrink-0">
                                        <span className="text-3xl">📰</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-red-400">{article.city}</span>
                                        <h3 className="font-medium text-white group-hover:text-[#00C853] transition-colors">
                                            {article.title}
                                        </h3>
                                        <p className="text-xs text-neutral-500 mt-1">{article.date}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* 요즘 패션계 */}
                    <div className="w-full lg:w-80 shrink-0">
                        <h2 className="text-sm font-semibold text-[#00C853] mb-6 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> 요즘 패션계
                        </h2>
                        <div className="space-y-3">
                            {trendingArticles.map((article) => (
                                <Link
                                    key={article.rank}
                                    href="/fw"
                                    className="group flex items-center gap-4 hover:bg-[#252525] rounded-lg p-3 transition-colors"
                                >
                                    <span className={`text-2xl font-bold shrink-0 w-8 text-center ${
                                        article.rank <= 3 ? "text-[#00C853]" : "text-neutral-600"
                                    }`}>
                                        {article.rank}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-white group-hover:text-[#00C853] transition-colors truncate">
                                            {article.title}
                                        </p>
                                    </div>
                                    <span className="text-xs text-neutral-500 shrink-0">{article.views}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 인기 기사 */}
            <section className="py-10 px-6">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-sm font-semibold text-[#00C853] mb-6">인기 기사</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {popularArticles.map((article) => (
                            <Link
                                key={article.id}
                                href="/fw"
                                className="group bg-[#1a1a1a] rounded-lg overflow-hidden hover:ring-1 hover:ring-[#00C853] transition-all"
                            >
                                <div className="aspect-[4/3] bg-neutral-800 flex items-center justify-center">
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{article.emoji}</span>
                                </div>
                                <div className="p-3">
                                    <span className="text-xs text-red-400">{article.category}</span>
                                    <h3 className="text-sm font-medium text-white group-hover:text-[#00C853] transition-colors mt-1 line-clamp-2">
                                        {article.title}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 기사 챙겨 드려요 */}
            <section className="py-10 px-6 bg-[#1a1a1a] border-t border-neutral-800">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-sm font-semibold text-[#00C853] mb-6">기사 챙겨 드려요</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {[...mainArticles, ...editorPicks.slice(0, 2)].map((article, i) => (
                            <Link
                                key={i}
                                href="/fw"
                                className="group bg-[#252525] rounded-lg p-4 min-w-[240px] shrink-0 hover:bg-[#2a2a2a] transition-colors"
                            >
                                <p className="text-sm font-medium text-white group-hover:text-[#00C853] transition-colors">
                                    {article.title}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-neutral-500">{article.date}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* marquee */}
            <style jsx>{`
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee { animation: marquee 25s linear infinite; }
            `}</style>
        </div>
    );
}
