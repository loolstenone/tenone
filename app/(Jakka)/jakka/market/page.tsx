"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/features/jakka/PageHeader";

const CATEGORIES = ["전체", "원화", "프린트", "굿즈", "피규어", "포스터", "사진", "NFT"];

interface Product {
    id: string;
    creator: { name: string; handle: string };
    title: string;
    category: string;
    thumb: string;
    price: number;
    limited: boolean;
    stock: number | null;
}

const mockProducts: Product[] = [
    {
        id: "1",
        creator: { name: "김지은", handle: "@jieun.k" },
        title: "감성 수채화 원화 — 봄의 끝",
        category: "원화",
        thumb: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop",
        price: 320000,
        limited: true,
        stock: 1,
    },
    {
        id: "2",
        creator: { name: "이수아", handle: "@sua.lee" },
        title: "캐릭터 아크릴 키링 세트 (3종)",
        category: "굿즈",
        thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop",
        price: 18000,
        limited: false,
        stock: 43,
    },
    {
        id: "3",
        creator: { name: "강태양", handle: "@taeyang.k" },
        title: "한정판 레진 피규어 — Void #001",
        category: "피규어",
        thumb: "https://images.unsplash.com/photo-1608889175638-9322300c46e8?w=600&h=600&fit=crop",
        price: 145000,
        limited: true,
        stock: 5,
    },
    {
        id: "4",
        creator: { name: "박민준", handle: "@minjun.p" },
        title: "도시 야경 파인아트 프린트 (A2)",
        category: "프린트",
        thumb: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&h=600&fit=crop",
        price: 56000,
        limited: false,
        stock: 20,
    },
    {
        id: "5",
        creator: { name: "정유나", handle: "@yuna.j" },
        title: "타이포그래피 포스터 — 서울 2025",
        category: "포스터",
        thumb: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop",
        price: 28000,
        limited: false,
        stock: 50,
    },
    {
        id: "6",
        creator: { name: "최현우", handle: "@hyunwoo.c" },
        title: "인물 흑백 필름 사진 원본 프린트",
        category: "사진",
        thumb: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop",
        price: 85000,
        limited: true,
        stock: 3,
    },
    {
        id: "7",
        creator: { name: "이수아", handle: "@sua.lee" },
        title: "미니 에코백 — 봄꽃 일러스트",
        category: "굿즈",
        thumb: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600&h=600&fit=crop",
        price: 22000,
        limited: false,
        stock: 30,
    },
    {
        id: "8",
        creator: { name: "강태양", handle: "@taeyang.k" },
        title: "제네레이티브 아트 NFT — Drift #12",
        category: "NFT",
        thumb: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=600&h=600&fit=crop",
        price: 0.08,
        limited: true,
        stock: null,
    },
];

function ProductCard({ product }: { product: Product }) {
    const isNFT = product.category === "NFT";
    const priceLabel = isNFT ? `${product.price} ETH` : `${product.price.toLocaleString()}원`;

    return (
        <Link href={`/jakka/market/${product.id}`} className="group block">
            <div className="relative overflow-hidden bg-neutral-100 aspect-square mb-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={product.thumb}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.limited && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5">
                        LIMITED
                    </span>
                )}
                {product.stock !== null && product.stock <= 5 && (
                    <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-white bg-black/60 px-1.5 py-0.5">
                        {product.stock}개 남음
                    </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2.5">
                        <ShoppingCart className="w-4 h-4 text-neutral-900" />
                    </div>
                </div>
            </div>

            <p className="text-[11px] text-neutral-500 font-mono mb-0.5">{product.creator.handle}</p>
            <p className="text-[13px] font-bold text-neutral-900 leading-snug mb-1.5 line-clamp-2">{product.title}</p>
            <p className="text-[14px] font-black text-neutral-900">{priceLabel}</p>
        </Link>
    );
}

export default function MarketPage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("전체");

    const filtered = mockProducts.filter((p) => {
        const matchCat = category === "전체" || p.category === category;
        const matchSearch = !search || p.title.includes(search) || p.creator.name.includes(search);
        return matchCat && matchSearch;
    });

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                eyebrow="Market"
                title="마켓"
                subtitle="작가의 작품·굿즈·피규어를 직접 구매하세요."
            />

            <div className="max-w-4xl mx-auto px-5 py-8">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="작품명, 작가 이름 검색"
                    className="w-full border border-neutral-300 pl-8 pr-3 py-2 text-[13px] placeholder:text-neutral-500 focus:outline-none focus:border-neutral-500"
                />
            </div>

            <div className="flex gap-1.5 flex-wrap pb-5 mb-6 border-b border-neutral-200">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`text-[11px] px-2.5 py-1 border transition-colors ${
                            category === cat
                                ? "border-neutral-900 bg-neutral-900 text-white"
                                : "border-neutral-300 text-neutral-500 hover:border-neutral-400"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="py-20 text-center text-[13px] text-neutral-600">상품이 없습니다.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filtered.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}
