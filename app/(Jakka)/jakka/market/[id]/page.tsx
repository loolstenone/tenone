"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShoppingCart, Package, AlertCircle } from "lucide-react";
import { getProductById, type JakkaProduct, type JakkaCreator } from "@/lib/supabase/jakka";

type Product = JakkaProduct & { creator: JakkaCreator };

export default function MarketProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (!id) return;
        getProductById(id).then((data) => {
            setProduct(data);
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-4xl mx-auto px-5 py-8 animate-pulse">
                    <div className="h-4 bg-neutral-100 w-24 mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="aspect-square bg-neutral-100" />
                        <div className="space-y-4">
                            <div className="h-3 bg-neutral-100 w-1/3" />
                            <div className="h-7 bg-neutral-100 w-4/5" />
                            <div className="h-8 bg-neutral-100 w-1/3" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
                    <p className="text-[14px] text-neutral-700 mb-4">상품을 찾을 수 없습니다.</p>
                    <Link href="/jakka/market" className="text-[12px] text-neutral-900 underline underline-offset-2">
                        마켓으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    const isNFT = product.category === "NFT";
    const priceLabel = isNFT ? `${product.price} ETH` : `${Number(product.price).toLocaleString()}원`;
    const isSoldOut = product.status === "sold_out" || (product.stock !== null && product.stock === 0);
    const allImages = [product.thumb_url, ...product.images].filter(Boolean) as string[];

    return (
        <div className="min-h-screen bg-white">
            {/* 상단 네비 */}
            <div className="border-b border-neutral-200 px-5 py-3">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1 text-[12px] text-neutral-700 hover:text-neutral-900 transition-colors"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    마켓
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-5 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* 이미지 섹션 */}
                    <div>
                        <div className="relative aspect-square bg-neutral-100 overflow-hidden mb-3">
                            {allImages.length > 0 ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={allImages[selectedImage]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-12 h-12 text-neutral-300" />
                                </div>
                            )}
                            {product.is_limited && (
                                <span className="absolute top-3 left-3 text-[10px] font-bold bg-neutral-900 text-white px-2 py-0.5">
                                    LIMITED
                                </span>
                            )}
                            {isSoldOut && (
                                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                    <span className="text-[13px] font-bold text-neutral-900 border border-neutral-900 px-3 py-1">
                                        SOLD OUT
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 썸네일 스트립 */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto scrollbar-none">
                                {allImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors ${
                                            selectedImage === i ? "border-neutral-900" : "border-transparent"
                                        }`}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 정보 섹션 */}
                    <div>
                        {/* 작가 */}
                        <Link
                            href={`/jakka/${product.creator?.handle?.replace('@', '') ?? ''}`}
                            className="inline-flex items-center gap-2 mb-4 group"
                        >
                            <p className="text-[11px] font-mono text-neutral-500 group-hover:text-neutral-900 transition-colors">
                                {product.creator?.handle ?? ""}
                            </p>
                        </Link>

                        {/* 카테고리 */}
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">
                            {product.category}
                        </p>

                        {/* 제목 */}
                        <h1 className="text-[22px] font-black text-neutral-900 leading-tight mb-4">
                            {product.title}
                        </h1>

                        {/* 가격 */}
                        <p className={`text-[26px] font-black mb-2 ${isSoldOut ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                            {priceLabel}
                        </p>

                        {/* 재고 */}
                        {product.stock !== null && !isSoldOut && (
                            <p className="text-[12px] text-neutral-700 mb-5">
                                잔여 수량 {product.stock}개
                                {product.is_limited && <span className="ml-1.5 text-neutral-500">(한정판)</span>}
                            </p>
                        )}
                        {product.is_limited && product.stock === null && !isSoldOut && (
                            <p className="text-[12px] text-neutral-700 mb-5">한정판</p>
                        )}

                        {/* 구매 버튼 */}
                        <button
                            disabled={isSoldOut}
                            className={`w-full flex items-center justify-center gap-2 py-3 text-[13px] font-bold transition-colors mb-6 ${
                                isSoldOut
                                    ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                    : "bg-neutral-900 text-white hover:bg-neutral-700"
                            }`}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {isSoldOut ? "품절" : "구매 문의"}
                        </button>

                        {/* 구분선 */}
                        <div className="border-t border-neutral-100 pt-5">
                            {/* 설명 */}
                            {product.description && (
                                <div className="mb-5">
                                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">작품 설명</p>
                                    <p className="text-[14px] text-neutral-900 leading-relaxed whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            )}

                            {/* 판매 정보 */}
                            <div className="space-y-2.5">
                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">판매 정보</p>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-neutral-500">카테고리</span>
                                    <span className="text-neutral-900">{product.category}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-neutral-500">결제 수단</span>
                                    <span className="text-neutral-900">{product.currency === "ETH" ? "ETH (암호화폐)" : "원화 (KRW)"}</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-neutral-500">판매 수량</span>
                                    <span className="text-neutral-900">{product.sold_count}개 판매됨</span>
                                </div>
                                {product.is_limited && (
                                    <div className="flex justify-between text-[12px]">
                                        <span className="text-neutral-500">에디션</span>
                                        <span className="text-neutral-900 font-bold">한정판</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 작가 정보 */}
                {product.creator && (
                    <div className="mt-12 pt-8 border-t border-neutral-200">
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-4">작가 소개</p>
                        <Link
                            href={`/jakka/${product.creator.handle?.replace('@', '') ?? ''}`}
                            className="flex items-center gap-3 group"
                        >
                            <div className="w-10 h-10 bg-neutral-200 flex items-center justify-center shrink-0">
                                <span className="text-[13px] font-bold text-neutral-700">
                                    {product.creator.display_name?.charAt(0) ?? "A"}
                                </span>
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-neutral-900 group-hover:underline underline-offset-2">
                                    {product.creator.display_name}
                                </p>
                                <p className="text-[11px] font-mono text-neutral-500">{product.creator.handle}</p>
                            </div>
                        </Link>
                        {product.creator.statement && (
                            <p className="mt-3 text-[13px] text-neutral-700 leading-relaxed line-clamp-3">
                                {product.creator.statement}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
