"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShoppingCart, Package, AlertCircle, Heart, Share2, Check, Link2, X, Eye, Bell, BellOff, Lock, Trash2, MessageCircle } from "lucide-react";
import {
    getProductById,
    isProductLiked,
    toggleProductLike,
    incrementProductView,
    isNotifyRegistered,
    toggleNotifyRegistration,
    getRelatedProductsByCreator,
    getRelatedProductsByCategory,
    getProductQnas,
    createProductQuestion,
    answerProductQuestion,
    deleteProductQuestion,
    type JakkaProduct,
    type JakkaCreator,
    type ProductQna,
} from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { PurchaseModal } from "@/features/jakka/PurchaseModal";

type Product = JakkaProduct & { creator: JakkaCreator };

export default function MarketProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [viewCount, setViewCount] = useState(0);
    const [likeBusy, setLikeBusy] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [relatedByCreator, setRelatedByCreator] = useState<JakkaProduct[]>([]);
    const [relatedByCategory, setRelatedByCategory] = useState<(JakkaProduct & { creator: JakkaCreator })[]>([]);
    const [notifyRegistered, setNotifyRegistered] = useState(false);
    const [notifyBusy, setNotifyBusy] = useState(false);
    const [qnas, setQnas] = useState<ProductQna[]>([]);
    const [qnaInput, setQnaInput] = useState("");
    const [qnaPrivate, setQnaPrivate] = useState(false);
    const [qnaSubmitting, setQnaSubmitting] = useState(false);
    const [answerDraft, setAnswerDraft] = useState<Record<string, string>>({});
    const [answeringId, setAnsweringId] = useState<string | null>(null);
    const [purchaseOpen, setPurchaseOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        getProductById(id).then((data) => {
            setProduct(data);
            setLikesCount(data?.likes_count ?? 0);
            setViewCount(data?.view_count ?? 0);
            setLoading(false);
            if (data) {
                getRelatedProductsByCreator(data.creator_id, data.id, 4).then(setRelatedByCreator);
                getRelatedProductsByCategory(data.category, data.creator_id, 4).then(setRelatedByCategory);
                incrementProductView(data.id).then((v) => { if (typeof v === 'number') setViewCount(v); });
            }
        });
    }, [id]);

    useEffect(() => {
        if (!id || !user?.id) { setLiked(false); setNotifyRegistered(false); return; }
        isProductLiked(id, user.id).then(setLiked);
        isNotifyRegistered(id, user.id).then(setNotifyRegistered);
    }, [id, user?.id]);

    useEffect(() => {
        if (!id) return;
        getProductQnas(id).then(setQnas);
    }, [id, user?.id]);

    const isCreatorOwner = !!(product && user?.id && product.creator?.user_id === user.id);

    async function handleSubmitQuestion() {
        if (!product) return;
        if (!isAuthenticated || !user?.id) { setLoginOpen(true); return; }
        const q = qnaInput.trim();
        if (!q || qnaSubmitting) return;
        setQnaSubmitting(true);
        const created = await createProductQuestion(product.id, user.id, q, qnaPrivate);
        if (created) {
            setQnaInput("");
            setQnaPrivate(false);
            const refreshed = await getProductQnas(product.id);
            setQnas(refreshed);
        }
        setQnaSubmitting(false);
    }

    async function handleAnswer(qnaId: string) {
        if (!product) return;
        const a = (answerDraft[qnaId] ?? "").trim();
        if (!a || answeringId) return;
        setAnsweringId(qnaId);
        const ok = await answerProductQuestion(qnaId, a);
        if (ok) {
            setAnswerDraft((d) => { const n = { ...d }; delete n[qnaId]; return n; });
            const refreshed = await getProductQnas(product.id);
            setQnas(refreshed);
        }
        setAnsweringId(null);
    }

    async function handleDeleteQna(qnaId: string) {
        if (!product) return;
        if (!confirm("이 질문을 삭제할까요?")) return;
        const ok = await deleteProductQuestion(qnaId);
        if (ok) setQnas((prev) => prev.filter((q) => q.id !== qnaId));
    }

    async function handleToggleNotify() {
        if (!product) return;
        if (!isAuthenticated || !user?.id) { setLoginOpen(true); return; }
        if (notifyBusy) return;
        setNotifyBusy(true);
        const next = !notifyRegistered;
        setNotifyRegistered(next);
        const res = await toggleNotifyRegistration(product.id, user.id, user.email);
        if (!res) setNotifyRegistered(!next);
        else setNotifyRegistered(res.registered);
        setNotifyBusy(false);
    }

    async function handleToggleLike() {
        if (!product) return;
        if (!isAuthenticated || !user?.id) { setLoginOpen(true); return; }
        if (likeBusy) return;
        setLikeBusy(true);
        // 낙관적 업데이트
        const next = !liked;
        setLiked(next);
        setLikesCount((c) => c + (next ? 1 : -1));
        const res = await toggleProductLike(product.id, user.id);
        if (!res) {
            // 실패 시 롤백
            setLiked(!next);
            setLikesCount((c) => c + (next ? -1 : 1));
        } else {
            setLiked(res.liked);
        }
        setLikeBusy(false);
    }

    async function handleShare(channel: "copy" | "native" | "x" | "threads") {
        if (!product) return;
        const url = typeof window !== "undefined" ? window.location.href : "";
        const title = `${product.title} · JAKKA`;
        if (channel === "copy") {
            try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
            return;
        }
        if (channel === "native" && typeof navigator !== "undefined" && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
            try { await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({ title, url }); } catch {}
            return;
        }
        if (channel === "x") {
            window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank");
            return;
        }
        if (channel === "threads") {
            window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(title + " " + url)}`, "_blank");
            return;
        }
    }

    const hasNativeShare = typeof navigator !== "undefined" && typeof (navigator as Navigator & { share?: unknown }).share === "function";

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

    const priceLabel = `${Number(product.price).toLocaleString()}원`;
    const isSoldOut = product.status === "sold_out" || (product.stock !== null && product.stock === 0);
    const allImages = [product.thumb_url, ...product.images].filter(Boolean) as string[];

    return (
        <div className="min-h-screen bg-white">
            {/* 상단 네비 */}
            <div className="border-b border-neutral-200 px-5 py-3 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1 text-[12px] text-neutral-700 hover:text-neutral-900 transition-colors"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    마켓
                </button>
                <div className="flex items-center gap-1">
                    <span
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-neutral-500"
                        title="조회수"
                    >
                        <Eye className="w-4 h-4" />
                        <span className="tabular-nums">{viewCount.toLocaleString()}</span>
                    </span>
                    <button
                        onClick={handleToggleLike}
                        disabled={likeBusy}
                        aria-pressed={liked}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-neutral-700 hover:text-neutral-900 transition-colors disabled:opacity-60"
                        title={liked ? "찜 해제" : "찜하기"}
                    >
                        <Heart
                            className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
                        />
                        <span className="tabular-nums min-w-[1ch]">{likesCount}</span>
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShareOpen((v) => !v)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[12px] text-neutral-700 hover:text-neutral-900 transition-colors"
                            title="공유"
                        >
                            <Share2 className="w-4 h-4" />
                            <span className="hidden sm:inline">공유</span>
                        </button>
                        {shareOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShareOpen(false)}
                                />
                                <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-white border border-neutral-200 shadow-lg">
                                    <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100">
                                        <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em]">공유</span>
                                        <button onClick={() => setShareOpen(false)} className="text-neutral-500 hover:text-neutral-900">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => { handleShare("copy"); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-900 hover:bg-neutral-50"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Link2 className="w-3.5 h-3.5" />}
                                        {copied ? "복사됨" : "링크 복사"}
                                    </button>
                                    {hasNativeShare && (
                                        <button
                                            onClick={() => { handleShare("native"); setShareOpen(false); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-900 hover:bg-neutral-50"
                                        >
                                            <Share2 className="w-3.5 h-3.5" />
                                            다른 앱으로…
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { handleShare("x"); setShareOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-900 hover:bg-neutral-50"
                                    >
                                        <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">𝕏</span>
                                        X(트위터)
                                    </button>
                                    <button
                                        onClick={() => { handleShare("threads"); setShareOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-neutral-900 hover:bg-neutral-50"
                                    >
                                        <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">@</span>
                                        Threads
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor="#171717" />
            {user && product && (
                <PurchaseModal
                    isOpen={purchaseOpen}
                    onClose={() => setPurchaseOpen(false)}
                    product={product}
                    user={user}
                />
            )}

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

                        {/* 구매 / 입고 알림 */}
                        {isSoldOut ? (
                            <button
                                onClick={handleToggleNotify}
                                disabled={notifyBusy}
                                className={`w-full flex items-center justify-center gap-2 py-3 text-[13px] font-bold transition-colors mb-2 border ${
                                    notifyRegistered
                                        ? "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-700"
                                        : "bg-white text-neutral-900 border-neutral-900 hover:bg-neutral-900 hover:text-white"
                                } disabled:opacity-60`}
                            >
                                {notifyRegistered ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                {notifyRegistered ? "입고 알림 해제" : "입고 시 알림 받기"}
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    if (!isAuthenticated || !user?.id) { setLoginOpen(true); return; }
                                    setPurchaseOpen(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3 text-[13px] font-bold bg-neutral-900 text-white hover:bg-neutral-700 transition-colors mb-2"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                구매 문의
                            </button>
                        )}
                        {isSoldOut && (
                            <p className="text-[11px] text-neutral-500 mb-6">
                                {notifyRegistered
                                    ? `${user?.email ?? "가입 이메일"}로 입고 소식을 보내드립니다.`
                                    : "재입고 또는 신규 에디션 공개 시 가장 먼저 알려드려요."}
                            </p>
                        )}
                        {!isSoldOut && <div className="mb-4" />}

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

                            {/* 작품 스펙 */}
                            {(product.dimensions || product.material || product.production_year || product.edition_total || product.is_signed || product.has_certificate) && (
                                <div className="space-y-2.5 mb-5">
                                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">작품 스펙</p>
                                    {product.dimensions && (
                                        <div className="flex justify-between text-[12px]">
                                            <span className="text-neutral-500">크기</span>
                                            <span className="text-neutral-900">{product.dimensions}</span>
                                        </div>
                                    )}
                                    {product.material && (
                                        <div className="flex justify-between text-[12px]">
                                            <span className="text-neutral-500">재료·기법</span>
                                            <span className="text-neutral-900">{product.material}</span>
                                        </div>
                                    )}
                                    {product.production_year && (
                                        <div className="flex justify-between text-[12px]">
                                            <span className="text-neutral-500">제작연도</span>
                                            <span className="text-neutral-900">{product.production_year}</span>
                                        </div>
                                    )}
                                    {product.edition_total && (
                                        <div className="flex justify-between text-[12px]">
                                            <span className="text-neutral-500">에디션</span>
                                            <span className="text-neutral-900 font-bold">
                                                {product.edition_number ? `${product.edition_number} / ${product.edition_total}` : `${product.edition_total}점 에디션`}
                                            </span>
                                        </div>
                                    )}
                                    {product.is_signed && (
                                        <div className="flex justify-between text-[12px]">
                                            <span className="text-neutral-500">작가 서명</span>
                                            <span className="text-neutral-900">포함</span>
                                        </div>
                                    )}
                                    {product.has_certificate && (
                                        <div className="flex justify-between text-[12px]">
                                            <span className="text-neutral-500">보증서</span>
                                            <span className="text-neutral-900">포함</span>
                                        </div>
                                    )}
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
                                    <span className="text-neutral-900">원화 (KRW)</span>
                                </div>
                                <div className="flex justify-between text-[12px]">
                                    <span className="text-neutral-500">판매 수량</span>
                                    <span className="text-neutral-900">{product.sold_count}개 판매됨</span>
                                </div>
                                {product.is_limited && !product.edition_total && (
                                    <div className="flex justify-between text-[12px]">
                                        <span className="text-neutral-500">에디션</span>
                                        <span className="text-neutral-900 font-bold">한정판</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 같은 작가 관련 작품 */}
                {relatedByCreator.length > 0 && product.creator && (
                    <section className="mt-12 pt-8 border-t border-neutral-200">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em]">
                                {product.creator.display_name}의 다른 작품
                            </p>
                            <Link
                                href={`/jakka/${product.creator.handle?.replace('@', '') ?? ''}`}
                                className="text-[12px] text-neutral-700 hover:text-neutral-900 underline underline-offset-2"
                            >
                                전체 보기
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedByCreator.map((p) => (
                                <RelatedCard key={p.id} product={p} creatorHandle={product.creator?.handle} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 동일 카테고리 다른 작가 작품 */}
                {relatedByCategory.length > 0 && (
                    <section className="mt-10 pt-8 border-t border-neutral-100">
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-4">
                            같은 카테고리 · {product.category}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedByCategory.map((p) => (
                                <RelatedCard key={p.id} product={p} creatorHandle={p.creator?.handle} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Q&A */}
                <section className="mt-12 pt-8 border-t border-neutral-200">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageCircle className="w-4 h-4 text-neutral-900" />
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em]">
                            문의 · Q&A
                        </p>
                        <span className="text-[11px] text-neutral-500">({qnas.length})</span>
                    </div>

                    {/* 작성 폼 */}
                    <div className="border border-neutral-200 p-3 mb-4">
                        <textarea
                            value={qnaInput}
                            onChange={(e) => setQnaInput(e.target.value)}
                            placeholder={isAuthenticated ? "작품에 대한 궁금한 점을 물어보세요." : "로그인 후 문의를 남길 수 있어요."}
                            disabled={!isAuthenticated}
                            rows={3}
                            className="w-full text-[13px] text-neutral-900 bg-transparent resize-none focus:outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
                        />
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                            <label className="flex items-center gap-1.5 text-[11px] text-neutral-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={qnaPrivate}
                                    onChange={(e) => setQnaPrivate(e.target.checked)}
                                    disabled={!isAuthenticated}
                                    className="w-3 h-3"
                                />
                                <Lock className="w-3 h-3" />
                                비공개 (작가만 열람)
                            </label>
                            <button
                                onClick={handleSubmitQuestion}
                                disabled={!qnaInput.trim() || qnaSubmitting}
                                className="text-[12px] font-bold text-neutral-900 border border-neutral-900 px-3 py-1.5 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {qnaSubmitting ? "등록 중…" : "문의 등록"}
                            </button>
                        </div>
                    </div>

                    {/* 목록 */}
                    {qnas.length === 0 ? (
                        <p className="text-[12px] text-neutral-500 text-center py-6">
                            아직 등록된 문의가 없습니다.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {qnas.map((q) => {
                                const isMine = q.asker_id === user?.id;
                                const canAnswer = isCreatorOwner && !q.answered_at;
                                return (
                                    <div key={q.id} className="border border-neutral-200 p-3">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[11px] font-bold text-neutral-900">Q.</span>
                                                <span className="text-[11px] font-mono text-neutral-500">
                                                    {q.asker_handle ? `@${q.asker_handle}` : q.asker_name ?? "익명"}
                                                </span>
                                                {q.is_private && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-100 px-1.5 py-0.5">
                                                        <Lock className="w-2.5 h-2.5" />
                                                        비공개
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-neutral-500">
                                                    {q.created_at.substring(0, 10)}
                                                </span>
                                            </div>
                                            {(isMine || isCreatorOwner) && (
                                                <button
                                                    onClick={() => handleDeleteQna(q.id)}
                                                    className="text-neutral-400 hover:text-red-600"
                                                    title="삭제"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[13px] text-neutral-900 whitespace-pre-line mb-2">{q.question}</p>

                                        {q.answer ? (
                                            <div className="mt-3 pt-3 border-t border-neutral-100 bg-neutral-50 -mx-3 -mb-3 px-3 pb-3">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className="text-[11px] font-bold text-neutral-900">A.</span>
                                                    <span className="text-[11px] font-mono text-neutral-500">
                                                        {product.creator?.handle ?? ""}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-500">
                                                        {q.answered_at?.substring(0, 10)}
                                                    </span>
                                                </div>
                                                <p className="text-[13px] text-neutral-900 whitespace-pre-line">{q.answer}</p>
                                            </div>
                                        ) : canAnswer ? (
                                            <div className="mt-3 pt-3 border-t border-neutral-100">
                                                <textarea
                                                    value={answerDraft[q.id] ?? ""}
                                                    onChange={(e) => setAnswerDraft((d) => ({ ...d, [q.id]: e.target.value }))}
                                                    placeholder="답변을 작성하세요."
                                                    rows={2}
                                                    className="w-full text-[13px] text-neutral-900 bg-transparent resize-none focus:outline-none placeholder:text-neutral-400 border border-neutral-200 p-2"
                                                />
                                                <div className="flex justify-end mt-2">
                                                    <button
                                                        onClick={() => handleAnswer(q.id)}
                                                        disabled={!(answerDraft[q.id] ?? "").trim() || answeringId === q.id}
                                                        className="text-[11px] font-bold text-neutral-900 border border-neutral-900 px-2.5 py-1 hover:bg-neutral-900 hover:text-white transition-colors disabled:opacity-50"
                                                    >
                                                        {answeringId === q.id ? "등록 중…" : "답변 등록"}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-neutral-500 mt-2">답변 대기 중</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

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

function RelatedCard({ product, creatorHandle }: { product: JakkaProduct; creatorHandle?: string }) {
    const priceLabel = `${Number(product.price).toLocaleString()}원`;
    const isSoldOut = product.status === "sold_out" || (product.stock !== null && product.stock === 0);
    return (
        <Link href={`/jakka/market/${product.id}`} className="group block">
            <div className="relative aspect-square bg-neutral-100 overflow-hidden mb-2">
                {product.thumb_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={product.thumb_url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-neutral-300" />
                    </div>
                )}
                {product.is_limited && (
                    <span className="absolute top-2 left-2 text-[9px] font-bold bg-neutral-900 text-white px-1.5 py-0.5">
                        LIMITED
                    </span>
                )}
                {isSoldOut && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-neutral-900 border border-neutral-900 px-2 py-0.5">
                            SOLD OUT
                        </span>
                    </div>
                )}
            </div>
            {creatorHandle && (
                <p className="text-[10px] font-mono text-neutral-500 mb-0.5">{creatorHandle}</p>
            )}
            <p className="text-[13px] font-bold text-neutral-900 leading-snug line-clamp-2 mb-1">
                {product.title}
            </p>
            <p className={`text-[13px] font-black ${isSoldOut ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                {priceLabel}
            </p>
        </Link>
    );
}
