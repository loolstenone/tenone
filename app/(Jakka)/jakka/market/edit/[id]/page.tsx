"use client";

import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ImagePlus, X, Loader2, Package } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { currentLoginHref } from "@/lib/login-href";
import {
    getProductById,
    getMyCreatorProfile,
    updateProduct,
    uploadWorkImage,
    type JakkaCreator,
    type ProductCategory,
    type JakkaProduct,
} from "@/lib/supabase/jakka";

const CATEGORIES: ProductCategory[] = ["원화", "프린트", "굿즈", "피규어", "포스터", "사진", "NFT"];

interface ImageEntry {
    file?: File;
    preview: string;
    uploaded?: string;
}

export default function MarketEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [creator, setCreator] = useState<JakkaCreator | null>(null);
    const [product, setProduct] = useState<JakkaProduct | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    const [images, setImages] = useState<ImageEntry[]>([]);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<ProductCategory | "">("");
    const [desc, setDesc] = useState("");
    const [price, setPrice] = useState("");
    const [currency, setCurrency] = useState<"KRW" | "ETH">("KRW");
    const [isLimited, setIsLimited] = useState(false);
    const [stock, setStock] = useState("");
    const [status, setStatus] = useState<"active" | "sold_out" | "hidden">("active");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || !user) { router.push(currentLoginHref()); return; }

        Promise.all([
            getMyCreatorProfile(user.authId ?? user.id),
            getProductById(id),
        ]).then(([c, p]) => {
            if (!c) { router.push("/jakka/profile"); return; }
            if (!p) { router.push("/jakka/market"); return; }
            if (p.creator_id !== c.id) { router.push("/jakka/market"); return; }

            setCreator(c);
            setProduct(p);
            setTitle(p.title);
            setCategory(p.category as ProductCategory);
            setDesc(p.description ?? "");
            setPrice(String(p.price));
            setCurrency(p.currency as "KRW" | "ETH");
            setIsLimited(p.is_limited);
            setStock(p.stock != null ? String(p.stock) : "");
            setStatus(p.status as "active" | "sold_out" | "hidden");

            const existing: ImageEntry[] = [];
            if (p.thumb_url) existing.push({ preview: p.thumb_url, uploaded: p.thumb_url });
            for (const url of p.images ?? []) {
                existing.push({ preview: url, uploaded: url });
            }
            setImages(existing);
            setPageLoading(false);
        });
    }, [authLoading, isAuthenticated, user, id, router]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const entries: ImageEntry[] = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...entries].slice(0, 6));
        e.target.value = "";
    }

    function removeImage(idx: number) {
        setImages((prev) => prev.filter((_, i) => i !== idx));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!creator || !product || !category || !title.trim() || !price) return;
        const parsedPrice = parseFloat(price.replace(/,/g, ""));
        if (isNaN(parsedPrice) || parsedPrice <= 0) { setError("올바른 가격을 입력해주세요."); return; }

        setSubmitting(true);
        setError(null);

        const uploadedUrls: string[] = [];
        for (const img of images) {
            if (img.uploaded) {
                uploadedUrls.push(img.uploaded);
                continue;
            }
            const url = await uploadWorkImage(creator.user_id, img.file!);
            if (!url) { setError("이미지 업로드 실패. 다시 시도해주세요."); setSubmitting(false); return; }
            uploadedUrls.push(url);
        }

        const thumbUrl = uploadedUrls[0] ?? null;
        const extraImages = uploadedUrls.slice(1);

        const ok = await updateProduct(product.id, {
            title: title.trim(),
            description: desc.trim() || undefined,
            category: category as ProductCategory,
            price: parsedPrice,
            thumb_url: thumbUrl ?? undefined,
            images: extraImages,
            is_limited: isLimited,
            stock: isLimited && stock ? parseInt(stock) : undefined,
            status,
        });

        if (!ok) { setError("수정에 실패했습니다. 다시 시도해주세요."); setSubmitting(false); return; }
        router.push(`/jakka/market/${product.id}`);
    }

    if (authLoading || pageLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
            </div>
        );
    }

    const isValid = title.trim() && category && price && parseFloat(price.replace(/,/g, "")) > 0;

    return (
        <div className="min-h-screen bg-white">
            <div className="border-b border-neutral-200 px-5 py-3 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-1 text-[12px] text-neutral-700 hover:text-neutral-900 transition-colors"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    마켓
                </button>
                <p className="text-[12px] font-bold text-neutral-900">상품 수정</p>
                <div className="w-14" />
            </div>

            <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-5 py-8 space-y-7">

                {/* 이미지 */}
                <div>
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-3">상품 이미지</p>
                    <div className="flex gap-2 flex-wrap">
                        {images.map((img, i) => (
                            <div key={i} className="relative w-20 h-20 shrink-0 overflow-hidden bg-neutral-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                {i === 0 && (
                                    <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold bg-neutral-900/70 text-white py-0.5">
                                        대표
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1 right-1 w-4 h-4 bg-neutral-900/70 flex items-center justify-center"
                                >
                                    <X className="w-2.5 h-2.5 text-white" />
                                </button>
                            </div>
                        ))}
                        {images.length < 6 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-20 h-20 shrink-0 border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 hover:border-neutral-500 transition-colors"
                            >
                                <ImagePlus className="w-5 h-5 text-neutral-400" />
                                <span className="text-[9px] text-neutral-400">추가</span>
                            </button>
                        )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                    <p className="mt-2 text-[11px] text-neutral-500">첫 번째 이미지가 대표 이미지. 최대 6장.</p>
                </div>

                {/* 판매 상태 */}
                <div>
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">판매 상태</p>
                    <div className="flex gap-1.5">
                        {([
                            { value: "active", label: "판매 중" },
                            { value: "sold_out", label: "품절" },
                            { value: "hidden", label: "숨김" },
                        ] as const).map((s) => (
                            <button
                                key={s.value}
                                type="button"
                                onClick={() => setStatus(s.value)}
                                className={`text-[11px] px-2.5 py-1 border font-bold transition-colors ${
                                    status === s.value
                                        ? "border-neutral-900 bg-neutral-900 text-white"
                                        : "border-neutral-300 text-neutral-500 hover:border-neutral-400"
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 카테고리 */}
                <div>
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">카테고리 <span className="text-red-500">*</span></p>
                    <div className="flex gap-1.5 flex-wrap">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setCategory(cat)}
                                className={`text-[11px] px-2.5 py-1 border font-bold transition-colors ${
                                    category === cat
                                        ? "border-neutral-900 bg-neutral-900 text-white"
                                        : "border-neutral-300 text-neutral-500 hover:border-neutral-400"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 제목 */}
                <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">
                        상품명 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="상품 제목을 입력하세요"
                        maxLength={80}
                        className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-700"
                    />
                </div>

                {/* 가격 */}
                <div>
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">
                        가격 <span className="text-red-500">*</span>
                    </p>
                    <div className="flex gap-2">
                        <div className="flex border border-neutral-300 overflow-hidden">
                            {(["KRW", "ETH"] as const).map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCurrency(c)}
                                    className={`text-[11px] font-bold px-3 py-2.5 transition-colors ${
                                        currency === c
                                            ? "bg-neutral-900 text-white"
                                            : "text-neutral-500 hover:text-neutral-900"
                                    }`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder={currency === "KRW" ? "예: 150000" : "예: 0.05"}
                            className="flex-1 border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-700"
                        />
                    </div>
                    {price && !isNaN(parseFloat(price.replace(/,/g, ""))) && currency === "KRW" && (
                        <p className="mt-1 text-[11px] text-neutral-700">
                            {Number(price.replace(/,/g, "")).toLocaleString()}원
                        </p>
                    )}
                </div>

                {/* 설명 */}
                <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">작품 설명</label>
                    <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="작품에 대한 설명, 소재, 크기 등을 적어주세요."
                        rows={5}
                        className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-700 resize-none"
                    />
                </div>

                {/* 한정판 */}
                <div>
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-3">에디션 설정</p>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div
                            onClick={() => setIsLimited((v) => !v)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${isLimited ? "bg-neutral-900" : "bg-neutral-200"}`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${isLimited ? "translate-x-4" : "translate-x-0.5"}`} />
                        </div>
                        <span className="text-[13px] text-neutral-900">한정판 (LIMITED)</span>
                    </label>
                    {isLimited && (
                        <div className="mt-3">
                            <label className="block text-[11px] text-neutral-700 mb-1.5">판매 수량 (비워두면 무제한 한정)</label>
                            <input
                                type="number"
                                min="1"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="예: 10"
                                className="w-32 border border-neutral-300 px-3 py-2 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-700"
                            />
                        </div>
                    )}
                </div>

                {error && (
                    <p className="text-[12px] text-red-600 border border-red-200 bg-red-50 px-3 py-2">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={!isValid || submitting}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 text-[13px] font-bold transition-colors ${
                        !isValid || submitting
                            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                            : "bg-neutral-900 text-white hover:bg-neutral-700"
                    }`}
                >
                    {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
                    ) : (
                        <><Package className="w-4 h-4" /> 수정 완료</>
                    )}
                </button>
            </form>
        </div>
    );
}
