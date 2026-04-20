"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Plus } from "lucide-react";
import { PageHeader } from "@/features/jakka/PageHeader";
import { getProducts, getMyCreatorProfile, type JakkaProduct, type JakkaCreator, type ProductCategory } from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";

const CATEGORIES = ["전체", "원화", "프린트", "굿즈", "피규어", "포스터", "사진", "기타"];

function ProductCard({ product }: { product: JakkaProduct & { creator: JakkaCreator } }) {
    const priceLabel = `${product.price.toLocaleString()}원`;
    const isSoldOut = product.status === "sold_out" || (product.stock !== null && product.stock === 0);

    return (
        <Link href={`/jakka/market/${product.id}`} className="group block">
            <div className="relative overflow-hidden bg-neutral-100 aspect-square mb-2.5">
                {product.thumb_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={product.thumb_url}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                        <span className="text-[11px] text-neutral-500">이미지 없음</span>
                    </div>
                )}
                {product.is_limited && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5">
                        LIMITED
                    </span>
                )}
                {isSoldOut && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-[12px] font-bold text-neutral-900 border border-neutral-900 px-2 py-0.5">SOLD OUT</span>
                    </div>
                )}
                {!isSoldOut && product.stock !== null && product.stock <= 5 && (
                    <span className="absolute bottom-2 right-2 text-[10px] font-semibold text-white bg-black/60 px-1.5 py-0.5">
                        {product.stock}개 남음
                    </span>
                )}
                {!isSoldOut && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2.5">
                            <ShoppingCart className="w-4 h-4 text-neutral-900" />
                        </div>
                    </div>
                )}
            </div>

            <p className="text-[11px] text-neutral-500 font-mono mb-0.5">{product.creator?.handle ?? ""}</p>
            <p className="text-[13px] font-bold text-neutral-900 leading-snug mb-1.5 line-clamp-2">{product.title}</p>
            <p className={`text-[14px] font-black ${isSoldOut ? "text-neutral-400 line-through" : "text-neutral-900"}`}>{priceLabel}</p>
        </Link>
    );
}

function SkeletonCard() {
    return (
        <div className="animate-pulse">
            <div className="aspect-square bg-neutral-100 mb-2.5" />
            <div className="h-2.5 bg-neutral-100 w-1/3 mb-1.5" />
            <div className="h-3 bg-neutral-100 w-4/5 mb-1" />
            <div className="h-3 bg-neutral-100 w-2/5" />
        </div>
    );
}

export default function MarketPage() {
    const { user, isAuthenticated } = useAuth();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("전체");
    const [products, setProducts] = useState<(JakkaProduct & { creator: JakkaCreator })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreator, setIsCreator] = useState(false);
    const [sellerStatus, setSellerStatus] = useState<string>("none");

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        getMyCreatorProfile(user.authId ?? user.id).then((c) => {
            setIsCreator(!!c);
            setSellerStatus(c?.seller_status ?? "none");
        });
    }, [isAuthenticated, user]);

    useEffect(() => {
        setLoading(true);
        getProducts({
            category: category as ProductCategory | "전체",
            search: search || undefined,
            limit: 40,
        }).then((data) => {
            setProducts(data);
            setLoading(false);
        });
    }, [category, search]);

    return (
        <div className="min-h-screen bg-white">
            <PageHeader
                eyebrow="Market"
                title="마켓"
                subtitle="작가의 작품·굿즈·피규어를 직접 구매하세요."
                action={isCreator ? (
                    sellerStatus === "approved" ? (
                        <Link
                            href="/jakka/market/upload"
                            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-neutral-900 border border-neutral-900 px-3 py-2 hover:bg-neutral-900 hover:text-white transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            상품 등록
                        </Link>
                    ) : (
                        <Link
                            href="/jakka/market/apply"
                            className="inline-flex items-center gap-1.5 text-[12px] font-bold text-neutral-900 border border-neutral-900 px-3 py-2 hover:bg-neutral-900 hover:text-white transition-colors"
                        >
                            {sellerStatus === "pending" ? "심사 진행 중" : "입점 신청"}
                        </Link>
                    )
                ) : undefined}
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

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-[13px] text-neutral-700 mb-2">등록된 상품이 없습니다.</p>
                        <p className="text-[12px] text-neutral-500">크리에이터라면 마켓에 작품을 등록해보세요.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
