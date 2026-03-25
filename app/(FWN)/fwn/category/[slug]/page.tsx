"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

const categoryMap: Record<string, { name: string; emoji: string; desc: string }> = {
    seoul: { name: "서울", emoji: "🇰🇷", desc: "서울 패션위크와 K-패션 트렌드" },
    paris: { name: "파리", emoji: "🇫🇷", desc: "파리 패션위크와 오트쿠튀르" },
    newyork: { name: "뉴욕", emoji: "🇺🇸", desc: "뉴욕 패션위크와 아메리칸 스타일" },
    london: { name: "런던", emoji: "🇬🇧", desc: "런던 패션위크와 브리티시 패션" },
    milan: { name: "밀라노", emoji: "🇮🇹", desc: "밀라노 패션위크와 이탈리안 크래프츠맨십" },
    world: { name: "월드", emoji: "🌍", desc: "전 세계 패션위크 소식" },
    models: { name: "모델", emoji: "👤", desc: "패션 모델 뉴스와 뉴페이스" },
    brands: { name: "브랜드", emoji: "🏷️", desc: "주목할 패션 브랜드 소식" },
    street: { name: "스트리트 런웨이", emoji: "📸", desc: "거리가 곧 런웨이 — 스트리트 패션" },
};

const sampleArticles = [
    { id: 1, title: "2026 시즌 하이라이트 — 주목할 컬렉션", date: "2026.03.20" },
    { id: 2, title: "런웨이 백스테이지 — 메이크업 트렌드", date: "2026.03.18" },
    { id: 3, title: "스타일링 포인트 — 이번 시즌 키 아이템", date: "2026.03.15" },
    { id: 4, title: "디자이너 인터뷰 — 컬렉션의 영감", date: "2026.03.12" },
    { id: 5, title: "프론트로 셀러브리티 스냅", date: "2026.03.10" },
    { id: 6, title: "패션위크 일정 및 가이드", date: "2026.03.08" },
];

export default function FWNCategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const cat = categoryMap[slug] || { name: slug, emoji: "📰", desc: "" };

    return (
        <div>
            {/* Hero */}
            <section className="py-16 px-6 border-b border-neutral-800">
                <div className="mx-auto max-w-7xl text-center">
                    <span className="text-6xl block mb-4">{cat.emoji}</span>
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{cat.name}</h1>
                    <p className="text-neutral-400">{cat.desc}</p>
                </div>
            </section>

            {/* 기사 목록 */}
            <section className="py-10 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sampleArticles.map((article) => (
                            <Link
                                key={article.id}
                                href="/fwn"
                                className="group bg-[#1a1a1a] rounded-lg overflow-hidden hover:ring-1 hover:ring-[#00C853] transition-all"
                            >
                                <div className="aspect-[16/9] bg-neutral-800 flex items-center justify-center">
                                    <span className="text-4xl">{cat.emoji}</span>
                                </div>
                                <div className="p-4">
                                    <span className="text-xs text-red-400">{cat.name}</span>
                                    <h3 className="font-medium text-white group-hover:text-[#00C853] transition-colors mt-1">
                                        {article.title}
                                    </h3>
                                    <p className="text-xs text-neutral-500 mt-2">{article.date}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
