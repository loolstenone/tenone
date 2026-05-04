"use client";

// Quick Capture — 어디서든 + 버튼으로 호출하는 통합 입력 시트
// 4가지 모드: 사진·영상 / 음성 메모 / 글 / 위치 체크인
// 미디어는 EXIF 자동 추출 → 분류 엔진 → 9 영역 자동 라우팅

import { useEffect, useRef, useState } from "react";
import { Camera, Mic, FileText, MapPin, X, Loader2, Check } from "lucide-react";
import { extractExif } from "@/lib/myverse/capture/exif";
import { DOMAINS } from "@/lib/myverse/domains";
import type { DomainKey } from "@/lib/myverse/domains";

type Mode = "media" | "memo" | "voice" | "checkin" | null;

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved?: () => void;
}

interface IngestPreview {
    file: File;
    preview: string;
    domain: DomainKey;
    confidence: number;
    reason: string;
}

export function QuickCaptureSheet({ open, onClose, onSaved }: Props) {
    const [mode, setMode] = useState<Mode>(null);
    const [previews, setPreviews] = useState<IngestPreview[]>([]);
    const [memo, setMemo] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState<{ inserted: number; skipped: number } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            setMode(null);
            setPreviews([]);
            setMemo("");
            setSaved(null);
        }
    }, [open]);

    if (!open) return null;

    async function pickMedia() {
        setMode("media");
        setTimeout(() => fileRef.current?.click(), 50);
    }

    async function handleFiles(files: FileList | null) {
        if (!files || files.length === 0) return;
        const next: IngestPreview[] = [];
        for (const f of Array.from(files)) {
            const meta = await extractExif(f);
            // 클라이언트 사이드는 거점 정보 없음 — 서버 분류가 정확. 여기선 미리보기만.
            const domain: DomainKey = "daily";
            next.push({
                file: f,
                preview: URL.createObjectURL(f),
                domain,
                confidence: 0,
                reason: meta.geo_axis?.lat ? "GPS·EXIF 추출됨 (서버에서 거점 매칭)" : "메타 추출",
            });
        }
        setPreviews(prev => [...prev, ...next]);
    }

    async function commit() {
        if (previews.length === 0 && !memo.trim()) return;
        setSaving(true);
        try {
            // 1) 미디어 업로드 (각각)
            const uploaded: Array<{ url: string; type: "image" | "video"; file_size: number; meta: Awaited<ReturnType<typeof extractExif>> }> = [];
            for (const p of previews) {
                const meta = await extractExif(p.file);
                const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
                const date = meta.time_axis.date ?? today;
                const form = new FormData();
                form.append("file", p.file);
                form.append("date", date);
                const upRes = await fetch("/api/myverse/moments/upload", { method: "POST", body: form });
                if (!upRes.ok) continue;
                const up = await upRes.json();
                uploaded.push({
                    url: up.url,
                    type: up.media_type,
                    file_size: up.file_size,
                    meta,
                });
            }

            // 2) 배치 인제스트 (분류 엔진 호출)
            const items = uploaded.map(u => ({
                media_url: u.url,
                media_type: u.type,
                file_size: u.file_size,
                caption: memo.trim() || null,
                time_axis: u.meta.time_axis,
                geo_axis: u.meta.geo_axis,
                capture_mode: "active" as const,
            }));

            let result: { inserted: number; skipped: number } = { inserted: 0, skipped: 0 };
            if (items.length > 0) {
                const res = await fetch("/api/myverse/ingest/moments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items }),
                });
                if (res.ok) {
                    const j = await res.json();
                    result = { inserted: j.inserted ?? 0, skipped: j.skipped ?? 0 };
                }
            }

            // 3) 메모만 있는 경우 — daily 영역에 텍스트 모먼트로 (간소화: 일단 미지원, 모먼트는 미디어 동반 필수)
            // TODO: 메모 only는 myverse_daily_routines 또는 별도 quick_notes 테이블로

            setSaved(result);
            onSaved?.();
        } finally {
            setSaving(false);
        }
    }

    function removePreview(idx: number) {
        setPreviews(prev => {
            const next = [...prev];
            const [r] = next.splice(idx, 1);
            if (r) URL.revokeObjectURL(r.preview);
            return next;
        });
    }

    return (
        <div className="fixed inset-0 z-[9300] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4" onClick={onClose}>
            <div
                className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 sticky top-0 bg-white">
                    <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Quick Capture</h3>
                        <p className="text-[10px] text-neutral-500">자동 분류되어 9 영역에 저장됩니다</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* 저장 완료 화면 */}
                {saved && (
                    <div className="p-6 text-center">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 mb-3">
                            <Check className="h-6 w-6" />
                        </div>
                        <p className="text-sm text-neutral-800 mb-1">{saved.inserted}건 자동 분류·저장됨</p>
                        {saved.skipped > 0 && <p className="text-xs text-neutral-400">중복 {saved.skipped}건 건너뜀</p>}
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-1.5 text-sm bg-[#6366F1] text-white rounded-lg"
                        >
                            확인
                        </button>
                    </div>
                )}

                {!saved && mode === null && (
                    /* 모드 선택 */
                    <div className="grid grid-cols-2 gap-3 p-5">
                        <ModeButton icon={Camera}     label="사진·영상" onClick={pickMedia} />
                        <ModeButton icon={FileText}   label="글"        onClick={() => setMode("memo")} />
                        <ModeButton icon={Mic}        label="음성 메모"  onClick={() => alert("Phase 5에서 출시")} disabled />
                        <ModeButton icon={MapPin}     label="위치 체크인" onClick={() => alert("Phase 2-B에서 출시")} disabled />
                    </div>
                )}

                {!saved && mode === "media" && (
                    <div className="p-5 space-y-3">
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
                        />
                        {previews.length === 0 ? (
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="w-full py-8 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-400 hover:border-[#6366F1] hover:text-[#6366F1] transition-colors"
                            >
                                📷 사진/영상 선택 (여러 개 가능)
                            </button>
                        ) : (
                            <div className="grid grid-cols-3 gap-1.5">
                                {previews.map((p, i) => (
                                    <div key={i} className="relative aspect-square bg-neutral-100 rounded overflow-hidden group">
                                        {p.file.type.startsWith("image/") ? (
                                            <img src={p.preview} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <video src={p.preview} className="w-full h-full object-cover" />
                                        )}
                                        <button
                                            onClick={() => removePreview(i)}
                                            className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    className="aspect-square border border-dashed border-neutral-300 rounded text-neutral-400 hover:border-[#6366F1] hover:text-[#6366F1] flex items-center justify-center text-2xl"
                                >
                                    +
                                </button>
                            </div>
                        )}
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="한 줄 캡션 (선택) — 분류 정확도 높임"
                            rows={2}
                            className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 placeholder:text-neutral-300 focus:outline-none focus:border-[#6366F1] resize-none"
                        />
                        <div className="text-[10px] text-neutral-400">
                            EXIF에서 시간·위치를 자동 추출해 등록 거점 → 9 영역으로 분류합니다.
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button onClick={() => setMode(null)} className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-800">
                                뒤로
                            </button>
                            <button
                                onClick={commit}
                                disabled={previews.length === 0 || saving}
                                className="inline-flex items-center gap-1 px-4 py-1.5 text-sm bg-[#6366F1] text-white rounded-lg disabled:opacity-50"
                            >
                                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {saving ? "분류 중…" : `등록 (${previews.length}개)`}
                            </button>
                        </div>
                        {/* 9 영역 안내 */}
                        <div className="grid grid-cols-4 gap-1 pt-2 border-t border-neutral-100">
                            {Object.values(DOMAINS).slice(0, 8).map(d => (
                                <span key={d.key} className="flex items-center gap-1 text-[10px] text-neutral-400">
                                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color_hex }} />
                                    {d.label_ko}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {!saved && mode === "memo" && (
                    <div className="p-5 text-center text-sm text-neutral-500">
                        텍스트 메모는 Phase 2-B에서 출시 예정입니다.
                        <br />
                        지금은 사진/영상 + 캡션을 사용해주세요.
                        <button onClick={() => setMode(null)} className="mt-3 block mx-auto px-3 py-1.5 text-sm text-[#6366F1]">
                            뒤로
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ModeButton({ icon: Icon, label, onClick, disabled }: { icon: typeof Camera; label: string; onClick: () => void; disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex flex-col items-center gap-2 py-5 border border-neutral-200 rounded-lg hover:border-[#6366F1] hover:bg-[#6366F1]/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
            <Icon className="h-6 w-6 text-[#6366F1]" />
            <span className="text-xs text-neutral-700">{label}</span>
            {disabled && <span className="text-[9px] text-neutral-400">곧 출시</span>}
        </button>
    );
}
