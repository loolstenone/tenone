"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { Upload, X, Loader2, Image as ImageIcon, ArrowLeft } from "lucide-react";
import {
    uploadWorkImage,
    createMyWork,
    getCreatorByUserId,
    type MontzCreator,
} from "@/lib/supabase/montz";

const CATEGORIES = ["화보", "런웨이", "광고", "드라마", "영화", "뮤지컬", "기타"] as const;

export default function MontzUploadPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    const [creator, setCreator] = useState<MontzCreator | null | undefined>(undefined);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<string>("화보");
    const [tags, setTags] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 크리에이터 프로필 존재 여부 확인
    useEffect(() => {
        if (!user?.id) return;
        getCreatorByUserId(user.id).then(setCreator);
    }, [user?.id]);

    // 파일 미리보기 URL 생성/정리
    useEffect(() => {
        const urls = files.map((f) => URL.createObjectURL(f));
        setPreviews(urls);
        return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
    }, [files]);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950">
            <Loader2 className="h-6 w-6 animate-spin text-[#c8a97e]" />
        </div>
    );
    if (!isAuthenticated) return (
        <div className="min-h-screen bg-neutral-950">
            <LoginModal isOpen={true} onClose={() => {}} accentColor="#c8a97e" />
        </div>
    );

    // 크리에이터 프로필 없으면 안내
    if (creator === null) {
        return (
            <div className="min-h-screen bg-neutral-950 pt-24 px-6">
                <div className="max-w-md mx-auto text-center mt-20">
                    <p className="text-[#c8a97e] text-[12px] tracking-[0.2em] uppercase mb-3">UPLOAD</p>
                    <h1 className="text-[24px] font-bold text-white mb-4">크리에이터 프로필이 필요합니다</h1>
                    <p className="text-[14px] text-neutral-400 mb-8 leading-relaxed">
                        작품을 업로드하려면 먼저 모델·배우 프로필을 등록해야 합니다.
                    </p>
                    <Link href="/montz/profile"
                        className="inline-block bg-[#c8a97e] text-neutral-900 font-bold text-[14px] px-6 py-3 hover:bg-[#d4b88c] transition-colors">
                        프로필 등록하러 가기 →
                    </Link>
                </div>
            </div>
        );
    }

    if (creator === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950">
                <Loader2 className="h-6 w-6 animate-spin text-[#c8a97e]" />
            </div>
        );
    }

    const handleFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;
        const valid = Array.from(newFiles).filter((f) =>
            ["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size <= 10 * 1024 * 1024
        );
        if (valid.length !== newFiles.length) {
            setError("일부 파일이 형식(jpg·png·webp) 또는 크기(10MB)를 초과합니다.");
        }
        setFiles((prev) => [...prev, ...valid].slice(0, 5));
    };

    const removeFile = (idx: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!title.trim()) { setError("제목을 입력하세요."); return; }
        if (files.length === 0) { setError("이미지를 1장 이상 업로드하세요."); return; }
        if (!user?.id) return;

        setSubmitting(true);
        try {
            // 1) Storage 병렬 업로드
            const urls = await Promise.all(files.map((f) => uploadWorkImage(user.id, f)));

            // 2) 작품 INSERT
            const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
            await createMyWork(user.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                category,
                images: urls,
                tags: tagArr,
            });

            // 3) 본인 포트폴리오로 이동
            router.push(`/montz/${creator.handle}`);
        } catch (e) {
            setError(e instanceof Error ? e.message : "업로드 중 오류가 발생했습니다.");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 pt-20 pb-16">
            <div className="max-w-2xl mx-auto px-5">
                {/* 헤더 */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => router.back()}
                        className="h-9 w-9 flex items-center justify-center text-neutral-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <p className="text-[#c8a97e] text-[11px] tracking-[0.2em] uppercase">UPLOAD</p>
                        <h1 className="text-[22px] font-bold text-white">작품 업로드</h1>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* 이미지 업로드 */}
                    <div>
                        <label className="text-[12px] font-bold text-neutral-300 uppercase tracking-wider mb-2 block">
                            이미지 ({files.length}/5) <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {previews.map((url, i) => (
                                <div key={i} className="relative aspect-square bg-neutral-900 overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt={`업로드 ${i + 1}`} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeFile(i)}
                                        className="absolute top-1 right-1 h-6 w-6 bg-black/70 text-white flex items-center justify-center hover:bg-black">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {files.length < 5 && (
                                <button type="button" onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square border border-dashed border-neutral-700 hover:border-[#c8a97e] hover:bg-neutral-900/50 transition-colors flex flex-col items-center justify-center gap-1.5 text-neutral-500 hover:text-[#c8a97e]">
                                    <ImageIcon size={20} />
                                    <span className="text-[10px] font-bold">추가</span>
                                </button>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple
                            className="hidden" onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
                        <p className="text-[11px] text-neutral-500 mt-2">JPG·PNG·WebP, 각 10MB 이하, 최대 5장</p>
                    </div>

                    {/* 제목 */}
                    <div>
                        <label className="text-[12px] font-bold text-neutral-300 uppercase tracking-wider mb-2 block">
                            제목 <span className="text-red-400">*</span>
                        </label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                            maxLength={80} placeholder="예: 봄 화보 / OO 브랜드 캠페인"
                            className="w-full bg-neutral-900 border border-neutral-800 text-white px-3.5 py-3 text-[15px] focus:outline-none focus:border-[#c8a97e] placeholder:text-neutral-600" />
                    </div>

                    {/* 카테고리 */}
                    <div>
                        <label className="text-[12px] font-bold text-neutral-300 uppercase tracking-wider mb-2 block">
                            카테고리
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                            {CATEGORIES.map((c) => (
                                <button key={c} type="button" onClick={() => setCategory(c)}
                                    className={`text-[12px] font-bold px-3 py-1.5 border transition-colors ${
                                        category === c
                                            ? "border-[#c8a97e] bg-[#c8a97e] text-neutral-900"
                                            : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
                                    }`}>
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 설명 */}
                    <div>
                        <label className="text-[12px] font-bold text-neutral-300 uppercase tracking-wider mb-2 block">
                            설명 (선택)
                        </label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                            maxLength={600} rows={4} placeholder="작품에 대한 짧은 설명을 적어주세요."
                            className="w-full bg-neutral-900 border border-neutral-800 text-white px-3.5 py-3 text-[14px] focus:outline-none focus:border-[#c8a97e] placeholder:text-neutral-600 resize-none" />
                    </div>

                    {/* 태그 */}
                    <div>
                        <label className="text-[12px] font-bold text-neutral-300 uppercase tracking-wider mb-2 block">
                            태그 (선택)
                        </label>
                        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                            maxLength={120} placeholder="쉼표로 구분 (예: 봄, 화보, 코디네이션)"
                            className="w-full bg-neutral-900 border border-neutral-800 text-white px-3.5 py-3 text-[14px] focus:outline-none focus:border-[#c8a97e] placeholder:text-neutral-600" />
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-500/30 text-red-300 text-[13px] px-4 py-3">
                            {error}
                        </div>
                    )}

                    {/* 제출 */}
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={() => router.back()} disabled={submitting}
                            className="flex-1 border border-neutral-700 text-neutral-300 text-[14px] font-bold py-3 hover:bg-neutral-900 disabled:opacity-40 transition-colors">
                            취소
                        </button>
                        <button type="submit" disabled={submitting || files.length === 0 || !title.trim()}
                            className="flex-1 bg-[#c8a97e] text-neutral-900 text-[14px] font-bold py-3 hover:bg-[#d4b88c] disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                            {submitting ? (<><Loader2 size={16} className="animate-spin" /> 업로드 중...</>) : (<><Upload size={16} /> 등록하기</>)}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
