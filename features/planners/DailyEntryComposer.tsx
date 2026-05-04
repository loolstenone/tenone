"use client";

// 통합 입력기 — 사진/동영상 + 장소 + 시간 + 글을 한 번에 등록
// "오늘의 한 장면" 카드 헤더의 "+" 단일 버튼이 이 composer를 토글한다.
//
// 저장 동작 (입력된 필드만 처리):
//   - 미디어 있음 → /api/myverse/moments/upload + POST /moments
//   - 장소명 있음 → POST /places (서버가 routines로 자동 미러)
//   - 장소명 없고 활동만 있음 → POST /routines (서버가 places로 자동 미러)

import { useEffect, useRef, useState } from "react";
import { Camera, Video, X, Loader2, MapPin, Clock } from "lucide-react";
import type { ActivityBase } from "@/lib/myverse/types";
import exifr from "exifr";

const PLACE_CATEGORIES = [
    { key: "general",  label: "일반"   },
    { key: "work",     label: "업무"   },
    { key: "meal",     label: "식사"   },
    { key: "exercise", label: "운동"   },
    { key: "leisure",  label: "여가"   },
    { key: "home",     label: "집"     },
    { key: "shopping", label: "쇼핑"   },
    { key: "medical", label: "의료"    },
    { key: "social",   label: "모임"   },
];

interface MediaItem {
    file: File;
    preview: string;          // ObjectURL
    kind: "image" | "video";
}

interface Props {
    date: string;             // YYYY-MM-DD
    onClose: () => void;
    onSaved: () => void;      // 저장 완료 시 부모가 데이터 reload
    initialImage?: File | null;
}

export function DailyEntryComposer({ date, onClose, onSaved, initialImage }: Props) {
    const [bases, setBases] = useState<ActivityBase[]>([]);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [placeName, setPlaceName] = useState("");
    const [time, setTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [category, setCategory] = useState("general");
    const [text, setText] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const textRef = useRef<HTMLTextAreaElement>(null);

    // 카메라 버튼에서 넘어온 이미지 사전 로드 + EXIF 메타 추출
    useEffect(() => {
        if (!initialImage) return;
        setMedia([{
            file: initialImage,
            preview: URL.createObjectURL(initialImage),
            kind: "image",
        }]);
        (async () => {
            try {
                const exif = await exifr.parse(initialImage, {
                    pick: ["DateTimeOriginal", "GPSLatitude", "GPSLongitude"],
                });
                if (!exif) return;
                // 촬영 시각 → HH:MM
                if (exif.DateTimeOriginal instanceof Date) {
                    const h = String(exif.DateTimeOriginal.getHours()).padStart(2, "0");
                    const m = String(exif.DateTimeOriginal.getMinutes()).padStart(2, "0");
                    setTime(`${h}:${m}`);
                }
                // GPS → Nominatim 역지오코딩
                if (exif.GPSLatitude != null && exif.GPSLongitude != null) {
                    const lat = exif.GPSLatitude;
                    const lon = exif.GPSLongitude;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ko`,
                        { headers: { "User-Agent": "myverse-app" } }
                    );
                    if (res.ok) {
                        const geo = await res.json();
                        const addr = geo.address ?? {};
                        const name =
                            addr.amenity ??
                            addr.shop ??
                            addr.building ??
                            addr.road ??
                            addr.neighbourhood ??
                            addr.suburb ??
                            addr.city_district ??
                            addr.city ??
                            geo.display_name?.split(",")[0] ?? "";
                        if (name) setPlaceName(name);
                    }
                }
            } catch { /* EXIF 없는 사진이면 무시 */ }
        })();
    }, [initialImage]);

    // 거점 로드 — 빠른 선택 칩
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/myverse/settings");
                if (!res.ok) return;
                const json = await res.json();
                const arr = (json.user?.activity_bases ?? []) as ActivityBase[];
                if (Array.isArray(arr)) setBases(arr);
            } catch { /* silent */ }
        })();
        setTimeout(() => textRef.current?.focus(), 100);
    }, []);

    function pickFiles(files: FileList | null) {
        if (!files || files.length === 0) return;
        const next: MediaItem[] = [];
        for (const f of Array.from(files)) {
            if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) continue;
            next.push({
                file: f,
                preview: URL.createObjectURL(f),
                kind: f.type.startsWith("video/") ? "video" : "image",
            });
        }
        setMedia(prev => [...prev, ...next]);
    }

    function removeMedia(idx: number) {
        setMedia(prev => {
            const arr = [...prev];
            const [removed] = arr.splice(idx, 1);
            if (removed) URL.revokeObjectURL(removed.preview);
            return arr;
        });
    }

    function durationMin(): number | null {
        if (!time || !endTime) return null;
        const [sh, sm] = time.split(":").map(Number);
        const [eh, em] = endTime.split(":").map(Number);
        const d = (eh * 60 + em) - (sh * 60 + sm);
        return d > 0 ? d : null;
    }

    async function save() {
        // 빈 입력 체크 — 미디어, 장소명, 활동/글 중 하나라도 있어야
        if (media.length === 0 && !placeName.trim() && !text.trim()) {
            setError("사진·장소·내용 중 최소 하나는 입력해주세요");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            // 1) 장소가 있으면 places 등록 (routines는 서버에서 자동 미러)
            if (placeName.trim()) {
                const res = await fetch("/api/myverse/places", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date,
                        place_name: placeName.trim(),
                        visited_at: time || null,
                        category,
                        duration_min: durationMin(),
                        note: text.trim() || null,
                    }),
                });
                if (!res.ok) throw new Error("장소 저장 실패");
            } else if (text.trim() && time) {
                // 장소명 없이 활동·시간만 있으면 routines 직접 등록 (places로 자동 미러)
                await fetch("/api/myverse/routines", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date,
                        activity: text.trim().slice(0, 100),
                        start_time: time,
                        end_time: endTime || null,
                        category,
                        note: null,
                    }),
                });
            }

            // 2) 미디어 업로드 + moments 등록
            const happenedAt = time
                ? new Date(`${date}T${time}:00+09:00`).toISOString()
                : new Date().toISOString();
            for (const m of media) {
                const form = new FormData();
                form.append("file", m.file);
                form.append("date", date);
                const upRes = await fetch("/api/myverse/moments/upload", { method: "POST", body: form });
                if (!upRes.ok) continue;
                const up = await upRes.json();
                await fetch("/api/myverse/moments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date,
                        media_type: up.media_type,
                        media_url: up.url,
                        file_size: up.file_size,
                        caption: text.trim() || null,
                        happened_at: happenedAt,
                        location: placeName.trim() || null,
                        activity: null,
                    }),
                });
            }

            onSaved();
            onClose();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="bg-neutral-50 planners-dark:bg-[#1A1A1A] rounded-lg p-4 space-y-3 border border-neutral-200 planners-dark:border-[#2A2A2A]">
            {/* 미디어 영역 */}
            {media.length > 0 && (
                <div className="grid grid-cols-4 gap-1.5">
                    {media.map((m, i) => (
                        <div key={i} className="relative aspect-square bg-neutral-200 planners-dark:bg-[#2A2A2A] rounded overflow-hidden group">
                            {m.kind === "image" ? (
                                <img src={m.preview} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <video src={m.preview} className="w-full h-full object-cover" />
                            )}
                            <button
                                type="button"
                                onClick={() => removeMedia(i)}
                                className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => { pickFiles(e.target.files); e.target.value = ""; }}
                />
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 hover:text-[#0F766E] hover:bg-white planners-dark:hover:bg-[#252525] rounded transition-colors"
                >
                    <Camera className="h-3.5 w-3.5" /> 사진
                </button>
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-neutral-500 hover:text-[#0F766E] hover:bg-white planners-dark:hover:bg-[#252525] rounded transition-colors"
                >
                    <Video className="h-3.5 w-3.5" /> 동영상
                </button>
                <span className="text-[10px] text-neutral-300 ml-auto">{media.length > 0 && `${media.length}개 첨부됨`}</span>
            </div>

            {/* 본문 — 글 (캡션 + 활동 메모 겸용) */}
            <textarea
                ref={textRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="오늘 있었던 일, 첨부한 사진·영상에 대해 한 줄 적어보세요…"
                rows={3}
                className="w-full text-sm bg-transparent text-neutral-800 planners-dark:text-neutral-100 placeholder:text-neutral-300 placeholder:italic focus:outline-none resize-none border-b border-neutral-200 planners-dark:border-[#2A2A2A] pb-2"
            />

            {/* 장소 — 거점 칩 + 직접 입력 */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                    <input
                        type="text"
                        value={placeName}
                        onChange={(e) => setPlaceName(e.target.value)}
                        placeholder="장소 (예: 사무실, 카페, 공원)"
                        className="flex-1 text-xs bg-transparent focus:outline-none text-neutral-700 planners-dark:text-neutral-200 placeholder:text-neutral-300 border-b border-neutral-200 planners-dark:border-[#2A2A2A] pb-1"
                    />
                </div>
                {bases.length > 0 && (
                    <div className="flex flex-wrap gap-1 pl-5">
                        {bases.map(b => (
                            <button
                                key={b.id}
                                type="button"
                                onClick={() => setPlaceName(b.name)}
                                className="px-2 py-0.5 text-[10px] rounded-full bg-neutral-200 planners-dark:bg-[#2A2A2A] text-neutral-600 planners-dark:text-neutral-300 hover:bg-[#0F766E]/10 hover:text-[#0F766E] transition-colors"
                            >
                                {b.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 시간 + 카테고리 */}
            <div className="flex flex-wrap items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    step={1800}
                    className="text-xs bg-white planners-dark:bg-[#111] border border-neutral-200 planners-dark:border-[#2A2A2A] rounded px-2 py-0.5 text-neutral-700 planners-dark:text-neutral-200 focus:outline-none focus:border-[#0F766E]"
                />
                <span className="text-[10px] text-neutral-300">~</span>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    step={1800}
                    className="text-xs bg-white planners-dark:bg-[#111] border border-neutral-200 planners-dark:border-[#2A2A2A] rounded px-2 py-0.5 text-neutral-700 planners-dark:text-neutral-200 focus:outline-none focus:border-[#0F766E]"
                />
            </div>
            <div className="flex flex-wrap gap-1">
                {PLACE_CATEGORIES.map(c => (
                    <button
                        key={c.key}
                        type="button"
                        onClick={() => setCategory(c.key)}
                        className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                            category === c.key
                                ? "bg-[#0F766E] text-white"
                                : "bg-neutral-200 planners-dark:bg-[#2A2A2A] text-neutral-500 hover:bg-neutral-300"
                        }`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {error && <p className="text-[11px] text-rose-500">{error}</p>}

            {/* 액션 — 작은 버튼 */}
            <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-2.5 py-1 text-xs text-neutral-500 hover:text-neutral-800 planners-dark:hover:text-neutral-200 transition-colors"
                >
                    취소
                </button>
                <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-[#0F766E] text-white rounded hover:bg-[#0d5e56] disabled:opacity-50 transition-colors"
                >
                    {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                    {saving ? "등록 중…" : "등록"}
                </button>
            </div>
        </div>
    );
}
