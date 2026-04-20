"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import {
    getMyCreatorProfile, createShowcase, generateSlug, uploadWorkImage,
    getCreatorByHandle, addShowcaseArtists,
    type JakkaCreator,
} from "@/lib/supabase/jakka";
import { useAuth } from "@/lib/auth-context";

export default function NewShowcasePage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [creator, setCreator] = useState<JakkaCreator | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("");
    const [coverImage, setCoverImage] = useState("");
    const [coverPosition, setCoverPosition] = useState(50); // object-position-y %
    // 참여 작가 핸들 (대표자 제외 최대 10명)
    const [artistHandles, setArtistHandles] = useState<string[]>(["", "", ""]);
    const [publishMode, setPublishMode] = useState<'immediate' | 'scheduled'>('immediate');
    const [approver1, setApprover1] = useState("");
    const [approver2, setApprover2] = useState("");
    const [approver3, setApprover3] = useState("");

    useEffect(() => {
        if (authLoading) return;
        if (!user) { router.replace("/jakka"); return; }
        (async () => {
            const uid = user.authId ?? user.id;
            const c = await getMyCreatorProfile(uid);
            if (!c) { router.replace("/jakka/profile"); return; }
            setCreator(c);
            setLoading(false);
        })();
    }, [user, authLoading, router]);

    async function handleCoverUpload(file: File) {
        if (!user) return;
        const uid = user.authId ?? user.id;
        setUploading(true);
        const url = await uploadWorkImage(uid, file);
        if (url) setCoverImage(url);
        else alert("이미지 업로드에 실패했습니다.");
        setUploading(false);
    }

    async function handleSubmit() {
        if (!creator || !user) return;
        if (!title.trim() || !description.trim() || !startDate || !endDate) {
            alert("필수 항목을 모두 입력하세요.");
            return;
        }
        const emails = [approver1, approver2, approver3].map((e) => e.trim().toLowerCase());
        if (emails.some((e) => !e || !e.includes("@"))) {
            alert("자까 작가 3명의 이메일을 올바르게 입력하세요.");
            return;
        }
        if (new Set(emails).size !== 3) {
            alert("승인자 이메일은 서로 달라야 합니다.");
            return;
        }
        setSaving(true);
        try {
            const uid = user.authId ?? user.id;
            const result = await createShowcase({
                organizerId: creator.id,
                userId: uid,
                slug: generateSlug(title),
                title: title.trim(),
                subtitle: subtitle.trim() || undefined,
                description: description.trim(),
                coverImage: coverImage.trim() || undefined,
                category: category.trim() || undefined,
                location: location.trim() || undefined,
                startDate,
                endDate,
                startTime: startTime || undefined,
                endTime: endTime || undefined,
                approverEmails: [emails[0], emails[1], emails[2]],
                publishMode,
            });
            if (!result) {
                alert("신청 실패. slug 중복 또는 권한을 확인하세요.");
                setSaving(false);
                return;
            }

            // 참여 작가 등록 (대표자 + 핸들 입력한 작가들)
            const artistRows: { creatorId: string; role: 'organizer' | 'participant' }[] = [
                { creatorId: creator.id, role: 'organizer' },
            ];
            for (const handle of artistHandles) {
                const h = handle.trim();
                if (!h) continue;
                const found = await getCreatorByHandle(h);
                if (found && found.id !== creator.id) {
                    artistRows.push({ creatorId: found.id, role: 'participant' });
                }
            }
            await addShowcaseArtists(result.showcase.id, artistRows);

            // 승인 메일 자동 발송
            const approvalData = result.approvals.map((a) => ({ email: a.approver_email, token: a.token }));
            await fetch("/api/jakka/showcase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    approvals: approvalData,
                    showcaseTitle: title.trim(),
                    organizerName: creator.display_name,
                }),
            });

            alert("신청 완료! 3명에게 승인 요청 메일을 발송했습니다.");
            router.push(`/jakka/showcase/${result.showcase.slug}`);
        } catch (e) {
            console.error(e);
            alert("오류가 발생했습니다.");
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
            <div className="sticky top-0 z-10 bg-white border-b border-neutral-300 px-4 py-3 flex items-center justify-between">
                <Link href="/jakka/showcase" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-700 hover:text-neutral-900">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    취소
                </Link>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-1.5 text-[12px] font-bold bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                >
                    {saving ? "신청 중..." : "신청"}
                </button>
            </div>

            <main className="max-w-xl mx-auto px-5 py-10 space-y-7">
                <div>
                    <p className="text-[10px] font-mono text-neutral-600 tracking-[0.2em] uppercase mb-2">Showcase</p>
                    <h1 className="text-[24px] font-black tracking-tight leading-tight mb-2 text-neutral-900">쇼케이스 신청</h1>
                    <p className="text-[13px] text-neutral-700 leading-relaxed">
                        함께 하는 3명의 이메일 승인을 받으면 쇼케이스 공개가 가능합니다. (승인 절차를 위해 Jakka 가입자 기준)
                    </p>
                </div>

                <Field label="전시회 명" required>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="예: 20XX년 OO대학교 졸업 전시 〈졸부전〉" />
                </Field>

                <Field label="부제">
                    <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputCls} placeholder="전시회 한 줄 설명" />
                </Field>

                <Field label="유형">
                    <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="졸업전시 / 동호회 / 취미 / 기타" className={inputCls} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="시작일" required>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="종료일" required>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="오픈 시각">
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="종료 시각">
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
                    </Field>
                </div>

                <Field label="장소">
                    <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="예: OO대학교 현대 미술관" />
                </Field>

                <Field label="커버 이미지">
                    <div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }}
                        />
                        {coverImage ? (
                            <div className="space-y-2">
                                <div className="relative aspect-[16/9] bg-neutral-100 border border-neutral-300 overflow-hidden">
                                    <Image
                                        src={coverImage}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        style={{ objectPosition: `50% ${coverPosition}%` }}
                                        sizes="560px"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setCoverImage("")}
                                        className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-neutral-900 text-[11px] font-bold px-3 py-1.5"
                                    >
                                        교체
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[11px] text-neutral-500 shrink-0">위치 조정</span>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={coverPosition}
                                        onChange={(e) => setCoverPosition(Number(e.target.value))}
                                        className="flex-1 accent-neutral-900"
                                    />
                                    <span className="text-[11px] text-neutral-400 w-8 text-right">{coverPosition}%</span>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="w-full aspect-[16/9] bg-neutral-50 hover:bg-neutral-100 border border-dashed border-neutral-300 hover:border-neutral-500 flex flex-col items-center justify-center gap-2 text-neutral-700 transition-colors disabled:opacity-50"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="text-[12px]">업로드 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5" />
                                        <span className="text-[13px] font-semibold">이미지 선택</span>
                                        <span className="text-[11px] text-neutral-600">16:9 비율 권장</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </Field>

                <Field label="소개" required>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={7}
                        placeholder="전시회 컨셉, 참여 작가, 관람 포인트 등을 자유롭게 적어주세요."
                        className={`${inputCls} resize-none leading-relaxed`}
                    />
                </Field>

                {/* 작품 공개 방식 */}
                <div className="pt-6 border-t border-neutral-300">
                    <p className="text-[14px] font-bold text-neutral-900 mb-1">작품 공개 방식</p>
                    <p className="text-[12px] text-neutral-700 mb-4 leading-relaxed">
                        승인 완료 후 작품을 언제 공개할지 선택하세요.
                    </p>
                    <div className="space-y-2">
                        <label className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${publishMode === 'immediate' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}>
                            <input
                                type="radio"
                                name="publishMode"
                                value="immediate"
                                checked={publishMode === 'immediate'}
                                onChange={() => setPublishMode('immediate')}
                                className="mt-0.5 accent-neutral-900 shrink-0"
                            />
                            <div>
                                <p className="text-[13px] font-bold text-neutral-900">바로 공개</p>
                                <p className="text-[11px] text-neutral-600 mt-0.5">승인 완료 즉시 작품이 공개됩니다.</p>
                            </div>
                        </label>
                        <label className={`flex items-start gap-3 p-3.5 border cursor-pointer transition-colors ${publishMode === 'scheduled' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}>
                            <input
                                type="radio"
                                name="publishMode"
                                value="scheduled"
                                checked={publishMode === 'scheduled'}
                                onChange={() => setPublishMode('scheduled')}
                                className="mt-0.5 accent-neutral-900 shrink-0"
                            />
                            <div>
                                <p className="text-[13px] font-bold text-neutral-900">전시 일정에 맞춰 공개</p>
                                <p className="text-[11px] text-neutral-600 mt-0.5">전시 시작일 전까지 Coming Soon으로 표시됩니다. 타이틀·포스터·일정·장소는 미리 공개됩니다.</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* 참여 작가 */}
                <div className="pt-6 border-t border-neutral-300">
                    <p className="text-[14px] font-bold text-neutral-900 mb-1">참여 작가</p>
                    <p className="text-[12px] text-neutral-600 mb-4 leading-relaxed">
                        함께 전시하는 작가들의 핸들을 입력하세요. (예: @lools) 입력하지 않아도 신청 가능합니다.
                    </p>
                    <div className="space-y-2">
                        {artistHandles.map((h, i) => (
                            <input
                                key={i}
                                value={h}
                                onChange={(e) => {
                                    const next = [...artistHandles];
                                    next[i] = e.target.value;
                                    setArtistHandles(next);
                                }}
                                placeholder={`@handle${i + 1}`}
                                className={inputCls}
                            />
                        ))}
                    </div>
                    {artistHandles.length < 10 && (
                        <button
                            type="button"
                            onClick={() => setArtistHandles([...artistHandles, ""])}
                            className="mt-2 text-[12px] font-bold text-neutral-500 hover:text-neutral-900"
                        >
                            + 작가 추가
                        </button>
                    )}
                </div>

                <div className="pt-6 border-t border-neutral-300">
                    <p className="text-[14px] font-bold text-neutral-900 mb-1">승인 요청</p>
                    <p className="text-[12px] text-neutral-700 mb-4 leading-relaxed">
                        함께 준비하고 있는 3명의 이메일을 입력하세요. 3명 모두 승인이 필요합니다.
                    </p>
                    <div className="space-y-2">
                        <input value={approver1} onChange={(e) => setApprover1(e.target.value)} placeholder="approver1@example.com" className={inputCls} type="email" />
                        <input value={approver2} onChange={(e) => setApprover2(e.target.value)} placeholder="approver2@example.com" className={inputCls} type="email" />
                        <input value={approver3} onChange={(e) => setApprover3(e.target.value)} placeholder="approver3@example.com" className={inputCls} type="email" />
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full py-3.5 text-[14px] font-bold bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                >
                    {saving ? "신청 중..." : "쇼케이스 신청"}
                </button>
            </main>
        </div>
    );
}

const inputCls = "w-full px-3.5 py-2.5 text-[14px] text-neutral-900 placeholder:text-neutral-500 bg-white border border-neutral-300 focus:border-neutral-900 outline-none transition-colors";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[12px] font-bold text-neutral-900 mb-2">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );
}
