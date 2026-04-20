"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
    getMyCreatorProfile, createPost, generateSlug, getPostCategories,
    type JakkaCreator,
} from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";

export default function WriteStoryPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [creator, setCreator] = useState<JakkaCreator | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [existingCategories, setExistingCategories] = useState<string[]>([]);

    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [body, setBody] = useState("");
    const [category, setCategory] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [tagsInput, setTagsInput] = useState("");

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.replace("/jakka"); return; }
        (async () => {
            const uid = user.authId ?? user.id;
            const c = await getMyCreatorProfile(uid);
            if (!c) { router.replace("/jakka/profile"); return; }
            setCreator(c);
            const cats = await getPostCategories(c.id);
            setExistingCategories(cats);
            setLoading(false);
        })();
    }, [user, authLoading, router]);

    async function handlePublish(isPublished: boolean) {
        if (!creator || !user) return;
        if (!title.trim() || !body.trim()) {
            alert("제목과 본문은 필수입니다.");
            return;
        }
        setSaving(true);
        try {
            const uid = user.authId ?? user.id;
            const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
            const post = await createPost({
                creatorId: creator.id,
                userId: uid,
                slug: generateSlug(title),
                title: title.trim(),
                subtitle: subtitle.trim() || undefined,
                body: body.trim(),
                coverImage: coverImage.trim() || undefined,
                category: category.trim() || undefined,
                tags,
                isPublished,
            });
            if (!post) {
                alert("저장에 실패했습니다. slug 중복이거나 권한을 확인하세요.");
                setSaving(false);
                return;
            }
            router.push(`/jakka/${encodeURIComponent(creator.handle)}/post/${post.slug}`);
        } catch (e) {
            console.error(e);
            alert("저장 중 오류가 발생했습니다.");
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
                <Link
                    href={`/jakka/${encodeURIComponent(creator!.handle)}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    취소
                </Link>
                <div className="flex gap-2">
                    <button
                        onClick={() => handlePublish(false)}
                        disabled={saving}
                        className="px-3.5 py-1.5 text-[12px] font-bold border border-neutral-300 text-neutral-900 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
                    >
                        임시저장
                    </button>
                    <button
                        onClick={() => handlePublish(true)}
                        disabled={saving}
                        className="px-4 py-1.5 text-[12px] font-bold bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                    >
                        {saving ? "저장 중..." : "발행"}
                    </button>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-5 py-10">
                <div className="mb-4">
                    <input
                        list="existing-categories"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="카테고리 (예: 작업일기, 재료 연구)"
                        className="w-full text-[11px] font-mono text-neutral-700 uppercase tracking-[0.15em] placeholder:text-neutral-500 outline-none"
                    />
                    <datalist id="existing-categories">
                        {existingCategories.map((c) => <option key={c} value={c} />)}
                    </datalist>
                </div>

                <textarea
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목"
                    rows={2}
                    className="w-full text-[32px] font-black tracking-tight leading-tight text-neutral-900 mb-3 placeholder:text-neutral-400 outline-none resize-none"
                />

                <textarea
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="부제 (선택)"
                    rows={2}
                    className="w-full text-[17px] text-neutral-700 leading-relaxed mb-6 placeholder:text-neutral-500 outline-none resize-none"
                />

                <input
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="커버 이미지 URL (선택)"
                    className="w-full text-[13px] text-neutral-700 mb-8 pb-2 border-b border-neutral-200 placeholder:text-neutral-500 outline-none"
                />

                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="이야기를 시작하세요…"
                    rows={18}
                    className="w-full text-[17px] leading-[1.85] text-neutral-900 placeholder:text-neutral-500 outline-none resize-none"
                />

                <div className="mt-8 pt-6 border-t border-neutral-200">
                    <input
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        placeholder="태그 (쉼표로 구분)"
                        className="w-full text-[13px] text-neutral-700 placeholder:text-neutral-500 outline-none"
                    />
                </div>
            </main>
        </div>
    );
}
