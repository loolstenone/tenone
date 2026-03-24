"use client";

import Link from "next/link";

const products = [
    { name: "2026 플래너'스 플래너 주간 (가로형)", price: "무료", tags: ["BEST", "MD"] },
    { name: "2026 플래너'스 플래너 연간 (가로형)", price: "무료", tags: ["BEST", "MD"] },
    { name: "2026 플래너'스 플래너 All in One", price: "무료", tags: ["BEST", "MD"] },
    { name: "마케터 데일리 체크리스트", price: "무료", tags: ["NEW"] },
    { name: "브랜드 전략 캔버스 템플릿", price: "무료", tags: ["MD"] },
    { name: "소셜미디어 콘텐츠 캘린더", price: "무료", tags: ["NEW", "MD"] },
];

const categories = ["전체", "플래너", "템플릿", "체크리스트", "가이드"];

export default function ShopPage() {
    return (
        <div>
            <section className="py-12 px-6">
                <div className="mx-auto max-w-5xl">
                    <h1 className="text-xl md:text-3xl font-bold text-neutral-900 mb-2">바닥 상회</h1>
                    <p className="text-neutral-500 text-sm mb-8">마케터를 위한 무료 템플릿과 툴</p>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map((cat, i) => (
                            <button
                                key={cat}
                                className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${i === 0
                                    ? "bg-neutral-900 text-white border-neutral-900"
                                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-900"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product, i) => (
                            <Link key={i} href="/bk/shop" className="block group">
                                <div className="aspect-[4/3] bg-neutral-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-neutral-200 transition-colors">
                                    <span className="text-5xl">🗓️</span>
                                </div>
                                <p className="text-sm font-medium text-neutral-800 group-hover:text-neutral-900">{product.name}</p>
                                <p className="text-sm text-blue-600 font-semibold mt-1">{product.price}</p>
                                <div className="flex gap-1 mt-2">
                                    {product.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className={`text-[10px] px-1.5 py-0.5 border rounded ${tag === "BEST" ? "border-red-500 text-red-500"
                                                : tag === "NEW" ? "border-blue-500 text-blue-500"
                                                    : "border-neutral-400 text-neutral-500"
                                                }`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
