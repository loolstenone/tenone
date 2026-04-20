"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    ArrowLeft, X, ImagePlus, Loader2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { currentLoginHref } from "@/lib/login-href";
import {
    getMyCreatorProfile, uploadWorkImage, createWork, updateCreatorProfile,
    type JakkaCreator,
} from "@/lib/supabase/jakka";

const categories = [
    "영상/모션", "그래픽 디자인", "브랜딩/편집", "UI/UX", "일러스트",
    "AI", "캐릭터 디자인", "제품/패키지", "포토그래피",
    "타이포그래피", "공예", "파인아트", "굿즈", "피규어", "소품/악세사리",
    "글/소설", "카피/광고",
];

interface ImageEntry {
    file: File;
    preview: string;
    uploaded?: string;
}

export default function UploadPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [creator, setCreator] = useState<JakkaCreator | null>(null);
    const [images, setImages] = useState<ImageEntry[]>([]);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [desc, setDesc] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [featured, setFeatured] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || !user) { router.push(currentLoginHref()); return; }
        getMyCreatorProfile(user.authId ?? user.id).then((c) => {
            if (!c) { router.push("/jakka/profile"); return; }
            setCreator(c);
        });
    }, [authLoading, isAuthenticated, user]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        const entries: ImageEntry[] = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...entries].slice(0, 10));
        e.target.value = "";
    }

    function removeImage(i: number) {
        setImages((prev) => {
            URL.revokeObjectURL(prev[i].preview);
            return prev.filter((_, idx) => idx !== i);
        });
    }

    function parsedTags(): string[] {
        return tagInput
            .split(",")
            .map((t) => t.trim().replace(/^#/, ""))
            .filter(Boolean)
            .slice(0, 5);
    }

    async function handleSubmit() {
        if (!user || !creator || submitting) return;
        const tags = parsedTags();
        if (!images.length || !title.trim() || !category) return;
        setSubmitting(true);
        setError(null);

        const uploadedUrls: string[] = [];
        for (const entry of images) {
            const url = await uploadWorkImage(user.authId ?? user.id, entry.file);
            if (!url) { setError("이미지 업로드에 실패했습니다."); setSubmitting(false); return; }
            uploadedUrls.push(url);
        }

        const work = await createWork({
            creatorId: creator.id,
            userId: user.authId ?? user.id,
            title: title.trim(),
            category,
            description: desc.trim() || undefined,
            images: uploadedUrls,
            tags,
            isFeatured: featured,
        });

        if (!work) { setError("작업 저장에 실패했습니다."); setSubmitting(false); return; }

        if (featured) {
            await updateCreatorProfile(user.authId ?? user.id, { featured_work_id: work.id });
        }

        setSubmitting(false);
        router.push("/jakka/profile");
    }

    const canSubmit = images.length > 0 && title.trim() && category;

    if (authLoading || !creator) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
            </div>
        );
    }

    const tags = parsedTags();

    return (
        <div className="min-h-screen bg-white pb-10">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-neutral-100 px-4 h-[52px] flex items-center justify-between">
                <Link href="/jakka/profile" className="flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    취소
                </Link>
                <span className="text-[14px] font-semibold">작업 올리기</span>
                <div className="w-10" />
            </div>

            {error && (
                <div className="mx-4 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-[13px] text-red-600">
                    {error}
                </div>
            )}

            <div className="max-w-[600px] mx-auto px-4 pt-6 space-y-6">

                {/* Image Upload */}
                <div>
                    <p className="text-[11px] font-mono text-neutral-600 tracking-widest uppercase mb-3">이미지</p>
                    <div className="flex gap-2 flex-wrap">
                        {images.map((entry, i) => (
                            <div key={i} className="relative w-[100px] h-[100px] bg-neutral-100 overflow-hidden rounded-sm group">
                                <Image src={entry.preview} alt="" fill className="object-cover" sizes="100px" />
                                <button
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3 text-white" />
                                </button>
                                {i === 0 && (
                                    <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded-sm">
                                        대표
                                    </span>
                                )}
                            </div>
                        ))}
                        {images.length < 10 && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-[100px] h-[100px] border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1.5 rounded-sm hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                            >
                                <ImagePlus className="h-5 w-5 text-neutral-500" />
                                <span className="text-[10px] text-neutral-500">추가</span>
                            </button>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <p className="text-[11px] text-neutral-600 mt-2">최대 10장 · 첫 번째 이미지가 대표 이미지입니다</p>
                </div>

                {/* Title */}
                <div>
                    <p className="text-[11px] font-mono text-neutral-600 tracking-widest uppercase mb-2">제목 *</p>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="작업 제목을 입력하세요"
                        maxLength={60}
                        className="w-full border border-neutral-300 px-3 py-2.5 text-[15px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1 text-right">{title.length}/60</p>
                </div>

                {/* Category */}
                <div>
                    <p className="text-[11px] font-mono text-neutral-600 tracking-widest uppercase mb-3">카테고리 *</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`px-3 py-1.5 text-[13px] border transition-colors ${
                                    category === c
                                        ? "border-neutral-900 bg-neutral-900 text-white"
                                        : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <p className="text-[11px] font-mono text-neutral-600 tracking-widest uppercase mb-2">작업 설명</p>
                    <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="어떤 작업인지, 어떤 의도로 만들었는지 자유롭게 적어주세요"
                        rows={4}
                        maxLength={500}
                        className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 transition-colors resize-none leading-relaxed"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1 text-right">{desc.length}/500</p>
                </div>

                {/* Tags */}
                <div>
                    <p className="text-[11px] font-mono text-neutral-600 tracking-widest uppercase mb-2">태그 (최대 5개)</p>
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="일러스트, 캐릭터, 귀여움"
                        className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                    {tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-2">
                            {tags.map((t) => (
                                <span key={t} className="text-[12px] text-neutral-500 bg-neutral-100 px-2 py-0.5">
                                    #{t}
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-[11px] text-neutral-600 mt-1.5">쉼표(,)로 구분해서 입력하세요</p>
                </div>

                {/* Featured toggle */}
                <div className="flex items-center justify-between py-3 border-t border-neutral-100">
                    <div>
                        <p className="text-[14px] font-medium">대표작으로 설정</p>
                        <p className="text-[12px] text-neutral-600">프로필 상단에 강조 표시됩니다</p>
                    </div>
                    <button
                        onClick={() => setFeatured(!featured)}
                        className={`w-11 h-6 rounded-full transition-colors relative ${featured ? "bg-neutral-900" : "bg-neutral-200"}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${featured ? "left-6" : "left-1"}`} />
                    </button>
                </div>

                {/* Submit button */}
                <button
                    disabled={!canSubmit || submitting}
                    onClick={handleSubmit}
                    className={`w-full py-3.5 text-[14px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                        canSubmit && !submitting
                            ? "bg-neutral-900 text-white hover:opacity-80"
                            : "bg-neutral-100 text-neutral-500 cursor-not-allowed"
                    }`}
                >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    올리기
                </button>

            </div>
        </div>
    );
}
