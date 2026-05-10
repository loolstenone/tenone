"use client";

// SNS 포스트 컴포저 — "오늘의 한 장면" 자유 형태 작성기.
// 텍스트만 / 이미지·영상+텍스트 모두 지원. 피드 노출 토글 + 게시 후 SNS 공유.

import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, X, Loader2, Globe, Lock, Send, Share2, MapPin, Clock, Users, Tag, ChevronDown } from "lucide-react";

// places 카테고리 — 기존 DailyEntryComposer와 동일 (meal/exercise는 향후 분석 트리거)
const CATEGORIES = [
    { key: "general",  label: "일반"   },
    { key: "work",     label: "업무"   },
    { key: "meal",     label: "식사"   },
    { key: "exercise", label: "운동"   },
    { key: "leisure",  label: "여가"   },
    { key: "study",    label: "공부"   },
    { key: "home",     label: "집"     },
    { key: "shopping", label: "쇼핑"   },
    { key: "medical",  label: "의료"   },
    { key: "social",   label: "모임"   },
];

interface MediaItem {
    file: File;
    preview: string;
    kind: "image" | "video";
}

interface Props {
    date: string;
    onClose: () => void;
    onSaved: (post: { id: string; visibility: "public" | "private"; body: string | null; caption: string | null; media_url: string | null; media_type: "text" | "image" | "video" }) => void;
    initialImage?: File | null;
}

export function SnsPostComposer({ date, onClose, onSaved, initialImage }: Props) {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [text, setText] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private">("private");
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const textRef = useRef<HTMLTextAreaElement>(null);

    // 메타 — 추가 정보 (장소·시간·함께·카테고리)
    const [showMeta, setShowMeta] = useState(false);
    const [location, setLocation] = useState("");
    const [withWhom, setWithWhom] = useState("");
    const [time, setTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [category, setCategory] = useState("general");
    const hasAnyMeta = !!(location || withWhom || time || endTime || category !== "general");

    useEffect(() => {
        if (initialImage) addMediaFile(initialImage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        textRef.current?.focus();
    }, []);

    function addMediaFile(file: File) {
        const kind: "image" | "video" = file.type.startsWith("video/") ? "video" : "image";
        const preview = URL.createObjectURL(file);
        setMedia(prev => [...prev, { file, preview, kind }]);
    }

    function removeMedia(idx: number) {
        setMedia(prev => {
            const next = [...prev];
            URL.revokeObjectURL(next[idx].preview);
            next.splice(idx, 1);
            return next;
        });
    }

    async function uploadMedia(item: MediaItem): Promise<{ media_url: string; thumbnail_url: string | null; width: number | null; height: number | null; duration_sec: number | null; file_size: number }> {
        const fd = new FormData();
        fd.append("file", item.file);
        fd.append("date", date);
        fd.append("media_type", item.kind);
        const r = await fetch("/api/myverse/moments/upload", { method: "POST", body: fd });
        if (!r.ok) throw new Error(`업로드 실패 (${r.status})`);
        return r.json();
    }

    async function publish() {
        const trimmed = text.trim();
        if (!trimmed && media.length === 0) {
            setError("내용 또는 미디어가 필요해요.");
            return;
        }
        setPosting(true);
        setError(null);
        try {
            const happened_at = time ? `${date}T${time}:00` : null;
            const metaCommon = {
                date,
                visibility,
                location: location || null,
                with_whom: withWhom || null,
                activity: trimmed ? trimmed.slice(0, 200) : (location || null),
                happened_at,
            };

            // 텍스트만
            if (media.length === 0) {
                const r = await fetch("/api/myverse/moments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...metaCommon,
                        media_type: "text",
                        body: trimmed,
                        caption: trimmed.slice(0, 200),
                    }),
                });
                if (!r.ok) throw new Error(`저장 실패 (${r.status})`);
                const d = await r.json();
                onSaved({ id: d.moment.id, visibility, body: trimmed, caption: null, media_url: null, media_type: "text" });
            } else {
                const first = media[0];
                const upFirst = await uploadMedia(first);
                const r = await fetch("/api/myverse/moments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...metaCommon,
                        media_type: first.kind,
                        media_url: upFirst.media_url,
                        thumbnail_url: upFirst.thumbnail_url,
                        body: trimmed || null,
                        caption: trimmed ? trimmed.slice(0, 200) : null,
                        width: upFirst.width, height: upFirst.height,
                        duration_sec: upFirst.duration_sec, file_size: upFirst.file_size,
                    }),
                });
                if (!r.ok) throw new Error(`저장 실패 (${r.status})`);
                const d = await r.json();
                onSaved({ id: d.moment.id, visibility, body: trimmed || null, caption: null, media_url: upFirst.media_url, media_type: first.kind });

                for (let i = 1; i < media.length; i++) {
                    const m = media[i];
                    const up = await uploadMedia(m);
                    await fetch("/api/myverse/moments", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...metaCommon,
                            media_type: m.kind, media_url: up.media_url, thumbnail_url: up.thumbnail_url,
                            width: up.width, height: up.height, duration_sec: up.duration_sec, file_size: up.file_size,
                        }),
                    });
                }
            }

            // 장소명이 있으면 places로도 미러 저장 (방문 장소 카드 + 흔적에 즉시 반영)
            if (location.trim()) {
                try {
                    const dur = (time && endTime) ? Math.max(0, Math.round((new Date(`${date}T${endTime}:00`).getTime() - new Date(`${date}T${time}:00`).getTime()) / 60000)) : null;
                    await fetch("/api/myverse/places", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            date,
                            place_name: location.trim(),
                            visited_at: time ? `${date}T${time}:00` : null,
                            category: ["work","meal","exercise","leisure","home","shopping","medical","social"].includes(category) ? category : "general",
                            duration_min: dur,
                            note: trimmed || null,
                        }),
                    });
                } catch { /* places 미러 실패는 무시 */ }
            }
            // 카테고리만 지정 + 장소 없는 경우 → routines로 미러 (시간/카테고리 활동 기록)
            else if (category !== "general" || time) {
                try {
                    await fetch("/api/myverse/routines", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            date,
                            activity: trimmed.slice(0, 100) || category,
                            category,
                            start_time: time || null,
                            end_time: endTime || null,
                            note: trimmed.length > 100 ? trimmed : null,
                        }),
                    });
                } catch { /* routines 미러 실패는 무시 */ }
            }

            media.forEach(m => URL.revokeObjectURL(m.preview));
            setMedia([]);
            setText("");
            setLocation(""); setWithWhom(""); setTime(""); setEndTime(""); setCategory("general");
            onClose();
        } catch (e) {
            setError((e as Error).message || "저장에 실패했어요.");
        } finally {
            setPosting(false);
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">새 포스트</span>
                <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* 본문 — 자유 작성 */}
            <textarea
                ref={textRef}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="오늘 떠오른 생각, 발견한 인사이트, 재밌게 읽은 글… 자유롭게 적어보세요."
                rows={3}
                className="w-full text-sm bg-transparent border-0 focus:outline-none placeholder:text-neutral-400 leading-relaxed resize-none myverse-dark:text-neutral-100"
                onInput={e => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = `${Math.min(t.scrollHeight, 480)}px`;
                }}
            />

            {/* 미디어 미리보기 */}
            {media.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {media.map((m, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 group">
                            {m.kind === "image" ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={m.preview} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <video src={m.preview} className="w-full h-full object-cover" muted />
                            )}
                            <button
                                onClick={() => removeMedia(i)}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={e => {
                    const files = Array.from(e.target.files ?? []);
                    files.forEach(f => addMediaFile(f));
                    e.target.value = "";
                }}
                className="hidden"
            />

            {/* 메타 입력 (펼침) — 장소·시간·함께·카테고리 */}
            {showMeta && (
                <div className="space-y-2 p-3 rounded-lg bg-neutral-50 myverse-dark:bg-white/5 border border-neutral-200 myverse-dark:border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-white myverse-dark:bg-white/5 border border-neutral-200 myverse-dark:border-white/10">
                            <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <input
                                type="text"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                placeholder="장소 (선택)"
                                className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none placeholder:text-neutral-300 myverse-dark:text-neutral-100"
                            />
                        </label>
                        <label className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-white myverse-dark:bg-white/5 border border-neutral-200 myverse-dark:border-white/10">
                            <Users className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <input
                                type="text"
                                value={withWhom}
                                onChange={e => setWithWhom(e.target.value)}
                                placeholder="함께한 사람 (선택)"
                                className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none placeholder:text-neutral-300 myverse-dark:text-neutral-100"
                            />
                        </label>
                        <label className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-white myverse-dark:bg-white/5 border border-neutral-200 myverse-dark:border-white/10">
                            <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <input
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none myverse-dark:text-neutral-100"
                            />
                            <span className="text-[10px] text-neutral-300">~</span>
                            <input
                                type="time"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none myverse-dark:text-neutral-100"
                            />
                        </label>
                        <label className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-white myverse-dark:bg-white/5 border border-neutral-200 myverse-dark:border-white/10">
                            <Tag className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none myverse-dark:text-neutral-100"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.key} value={c.key}>{c.label}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                        장소를 적으면 <span className="font-semibold">방문 장소</span> 카드에, 카테고리·시간을 적으면 <span className="font-semibold">일과 기록</span>에도 같이 반영돼요.
                    </p>
                </div>
            )}

            {/* 도구 바 */}
            <div className="flex items-center gap-1 pt-2 border-t border-neutral-100 myverse-dark:border-white/10">
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-neutral-500 hover:text-[#6366F1] hover:bg-[#6366F1]/5 transition-colors"
                    title="사진/영상 추가"
                >
                    <ImageIcon className="h-3.5 w-3.5" />
                    사진/영상
                </button>
                <button
                    type="button"
                    onClick={() => setShowMeta(s => !s)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
                        showMeta || hasAnyMeta
                            ? "text-[#6366F1] bg-[#6366F1]/5"
                            : "text-neutral-500 hover:text-[#6366F1] hover:bg-[#6366F1]/5"
                    }`}
                    title="장소·시간·카테고리 추가"
                >
                    <MapPin className="h-3.5 w-3.5" />
                    상세
                    <ChevronDown className={`h-3 w-3 transition-transform ${showMeta ? "rotate-180" : ""}`} />
                </button>
                <button
                    type="button"
                    onClick={() => setVisibility(v => v === "public" ? "private" : "public")}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
                        visibility === "public"
                            ? "text-emerald-600 bg-emerald-50 myverse-dark:bg-emerald-500/10"
                            : "text-neutral-500 hover:bg-neutral-100 myverse-dark:hover:bg-white/5"
                    }`}
                    title={visibility === "public" ? "피드에 공개" : "비공개"}
                >
                    {visibility === "public" ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    {visibility === "public" ? "피드 공개" : "비공개"}
                </button>
                <button
                    type="button"
                    onClick={publish}
                    disabled={posting || (!text.trim() && media.length === 0)}
                    className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-[#6366F1] text-white hover:bg-[#4F46E5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    {posting ? "게시 중…" : "게시"}
                </button>
            </div>

            {error && <p className="text-[11px] text-rose-500">{error}</p>}
        </div>
    );
}

// SNS 공유 헬퍼 — Web Share API + clipboard fallback
export async function sharePost(opts: { title?: string; text?: string; url?: string }): Promise<"shared" | "copied" | "failed"> {
    const url = opts.url ?? (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (data: unknown) => Promise<void> }).share) {
        try {
            await (navigator as Navigator & { share: (data: unknown) => Promise<void> }).share({ title: opts.title, text: opts.text, url });
            return "shared";
        } catch { /* user canceled or failed */ }
    }
    try {
        const txt = [opts.text, url].filter(Boolean).join("\n\n");
        await navigator.clipboard.writeText(txt);
        return "copied";
    } catch {
        return "failed";
    }
}

export function ShareButton({ title, text, url, className }: { title?: string; text?: string; url?: string; className?: string }) {
    const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");
    async function go() {
        const r = await sharePost({ title, text, url });
        if (r === "copied") {
            setStatus("copied");
            setTimeout(() => setStatus("idle"), 1800);
        } else if (r === "shared") {
            setStatus("shared");
            setTimeout(() => setStatus("idle"), 1200);
        }
    }
    return (
        <button
            onClick={go}
            className={className ?? "inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-neutral-500 hover:text-[#6366F1] hover:bg-[#6366F1]/5 transition-colors"}
            title={status === "copied" ? "링크 복사됨" : "공유"}
        >
            <Share2 className="h-3.5 w-3.5" />
            {status === "copied" ? "복사됨" : status === "shared" ? "공유됨" : "공유"}
        </button>
    );
}
