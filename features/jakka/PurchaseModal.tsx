"use client";

import { useState } from "react";
import { X, Check, Minus, Plus } from "lucide-react";
import { createOrder, type JakkaProduct, type JakkaCreator } from "@/lib/supabase/jakka";
import type { User } from "@/types/auth";

type Product = JakkaProduct & { creator?: JakkaCreator };

interface Props {
    isOpen: boolean;
    onClose: () => void;
    product: Product;
    user: User;
}

export function PurchaseModal({ isOpen, onClose, product, user }: Props) {
    const [quantity, setQuantity] = useState(1);
    const [buyerName, setBuyerName] = useState(user.name ?? "");
    const [buyerPhone, setBuyerPhone] = useState("");
    const [buyerEmail] = useState(user.email ?? "");
    const [postcode, setPostcode] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const maxQty = product.stock ?? 99;
    const total = Number(product.price) * quantity;
    const totalLabel = `${total.toLocaleString()}원`;

    const physicalValid = !!(buyerName.trim() && buyerPhone.trim() && postcode.trim() && address1.trim());
    const canSubmit = !!(product.creator_id && physicalValid && !submitting);

    async function handleSubmit() {
        if (!product.creator_id) return;
        setSubmitting(true);
        setError(null);
        const res = await createOrder({
            productId: product.id,
            buyerId: user.id,
            creatorId: product.creator_id,
            quantity,
            unitPrice: Number(product.price),
            currency: product.currency,
            buyerName: buyerName.trim() || undefined,
            buyerPhone: buyerPhone.trim() || undefined,
            buyerEmail: buyerEmail || undefined,
            shippingPostcode: postcode.trim() || undefined,
            shippingAddress1: address1.trim() || undefined,
            shippingAddress2: address2.trim() || undefined,
            message: message.trim() || undefined,
        });
        setSubmitting(false);
        if (res) setDone(true);
        else setError("문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start md:items-center justify-center overflow-y-auto p-4">
            <div className="relative w-full max-w-lg bg-white">
                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 sticky top-0 bg-white">
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em]">구매 문의</p>
                    <button onClick={onClose} className="text-neutral-500 hover:text-neutral-900">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {done ? (
                    <div className="px-6 py-10 text-center">
                        <Check className="w-8 h-8 text-green-600 mx-auto mb-3" />
                        <p className="text-[14px] font-bold text-neutral-900 mb-2">문의가 접수되었습니다</p>
                        <p className="text-[12px] text-neutral-700 leading-relaxed">
                            작가가 확인 후 {buyerEmail || "가입 이메일"}로 연락드립니다.<br />
                            마이페이지 &gt; 주문 내역에서 진행 상황을 확인할 수 있어요.
                        </p>
                        <button onClick={onClose} className="mt-6 text-[12px] font-bold text-neutral-900 border border-neutral-900 px-4 py-2 hover:bg-neutral-900 hover:text-white transition-colors">
                            확인
                        </button>
                    </div>
                ) : (
                    <div className="px-5 py-4 space-y-4">
                        {/* 상품 요약 */}
                        <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                            {product.thumb_url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={product.thumb_url} alt="" className="w-14 h-14 object-cover bg-neutral-100" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-mono text-neutral-500">{product.creator?.handle}</p>
                                <p className="text-[13px] font-bold text-neutral-900 truncate">{product.title}</p>
                                <p className="text-[12px] text-neutral-700">
                                    {Number(product.price).toLocaleString()}원
                                </p>
                            </div>
                        </div>

                        {/* 수량 */}
                        {product.stock !== 1 && (
                            <div>
                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">수량</p>
                                <div className="inline-flex items-center border border-neutral-300">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:bg-neutral-100"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-10 text-center text-[13px] font-bold text-neutral-900 tabular-nums">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                                        className="w-8 h-8 flex items-center justify-center text-neutral-700 hover:bg-neutral-100"
                                        disabled={quantity >= maxQty}
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">받는 분</p>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={buyerName}
                                    onChange={(e) => setBuyerName(e.target.value)}
                                    placeholder="이름"
                                    className="text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                                />
                                <input
                                    type="tel"
                                    value={buyerPhone}
                                    onChange={(e) => setBuyerPhone(e.target.value)}
                                    placeholder="연락처"
                                    className="text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">배송지</p>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={postcode}
                                    onChange={(e) => setPostcode(e.target.value)}
                                    placeholder="우편번호"
                                    className="w-32 text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                                />
                                <input
                                    type="text"
                                    value={address1}
                                    onChange={(e) => setAddress1(e.target.value)}
                                    placeholder="기본 주소"
                                    className="w-full text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                                />
                                <input
                                    type="text"
                                    value={address2}
                                    onChange={(e) => setAddress2(e.target.value)}
                                    placeholder="상세 주소 (선택)"
                                    className="w-full text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900"
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">작가에게 메시지 (선택)</p>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                placeholder="포장·배송·의도 등 궁금한 점을 작성해주세요."
                                className="w-full text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900 resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                            <p className="text-[11px] text-neutral-500">결제 금액</p>
                            <p className="text-[16px] font-black text-neutral-900">{totalLabel}</p>
                        </div>

                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                            이 단계는 <span className="font-bold text-neutral-700">구매 문의 접수</span>입니다. 작가 확인 후 결제 안내가 이메일로 발송됩니다.
                        </p>

                        {error && <p className="text-[12px] text-red-600">{error}</p>}

                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="w-full py-3 text-[13px] font-bold bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "접수 중…" : "구매 문의 접수"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
