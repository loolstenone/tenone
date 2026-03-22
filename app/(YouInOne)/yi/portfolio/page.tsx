"use client";

import { useState } from "react";
import { useCms } from "@/lib/cms-context";
import { Search } from "lucide-react";

const categories = [
    { id: "all", name: "전체" },
    { id: "cat-yp1", name: "마케팅 컨설팅" },
    { id: "cat-yp2", name: "브랜딩" },
    { id: "cat-yp3", name: "콘텐츠 제작" },
    { id: "cat-yp4", name: "교육" },
];

export default function YouInOnePortfolioPage() {
    const { getPostsByBoard } = useCms();
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const allPosts = getPostsByBoard("board-yio-portfolio")
        .filter((p) => p.status === "published");

    const filtered = allPosts
        .filter((p) => activeCategory === "all" || p.categoryId === activeCategory)
        .filter(
            (p) =>
                !searchQuery ||
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.summary && p.summary.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    return (
        <div>
            {/* Hero */}
            <section className="bg-[#171717] text-white py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-[#E53935] font-bold text-sm tracking-widest uppercase mb-4">
                        Portfolio
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                        프로젝트 포트폴리오
                    </h1>
                    <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl mx-auto">
                        YouInOne이 기업, 기관, 사회와 함께 만들어온 프로젝트들입니다.
                    </p>
                </div>
            </section>

            {/* Filter & Grid */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                                        activeCategory === cat.id
                                            ? "bg-[#171717] text-white border-[#171717]"
                                            : "bg-white text-neutral-500 border-neutral-200 hover:border-[#171717]"
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="프로젝트 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#E53935] w-64"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    {filtered.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map((post) => (
                                <div
                                    key={post.id}
                                    className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#E53935]/30 transition-all"
                                >
                                    <div className="aspect-[16/10] bg-gradient-to-br from-[#171717] to-neutral-700 flex items-center justify-center relative">
                                        <span className="text-3xl font-bold text-white/10">YIO</span>
                                        {post.isRecommended && (
                                            <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#E53935] text-white text-[10px] font-bold rounded">
                                                추천
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-[#171717] mb-2 group-hover:text-[#E53935] transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 line-clamp-2 mb-3">{post.summary}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                {post.tags?.slice(0, 2).map((tag) => (
                                                    <span key={tag} className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-xs text-neutral-400">{post.publishedAt}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-neutral-400">해당 조건의 프로젝트가 없습니다.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
