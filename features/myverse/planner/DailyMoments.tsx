"use client";

// 오늘의 한 장면 — 이미지/동영상 업로드 + 5W1H 메타
// 사진을 추가하면 클라이언트가 Supabase Storage(myverse-moments)에 직접 업로드.

import { useEffect, useRef, useState } from "react";
import { Camera, Upload, X, Loader2, Trash2, Pencil, Archive } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ConfirmSheet } from "./ConfirmSheet";

interface Moment {
    id: string;
    date: string;
    media_type: "image" | "video" | "text";
    body?: string | null;
    visibility?: "public" | "private" | null;
    media_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    happened_at: string | null;
    with_whom: string | null;
    location: string | null;
    activity: string | null;
    width: number | null;
    height: number | null;
    duration_sec: number | null;
    created_at: string;
}

interface Props {
    date: string;       // YYYY-MM-DD
    memberId?: string;  // members.id (Storage 폴더 prefix)
    /** "한 줄" 카드 안에 임베드될 때 — 헤더/타이틀 생략, 폼만 노출 */
    compact?: boolean;
    /** 헤더 "추가"·"백업" 버튼 숨김 (외부 통합 composer 사용 시) */
    hideAdd?: boolean;
    hideBackup?: boolean;
    /** 빈 상태일 때 큰 dashed 박스 대신 한 줄 안내만 (외부 composer 사용 시) */
    minimalEmpty?: boolean;
}

export function DailyMoments({ date, memberId, compact = false, hideAdd = false, hideBackup = false, minimalEmpty = false }: Props) {
    const [moments, setMoments] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Moment>>({});
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ imported: number; skipped: number; total: number } | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const zipRef = useRef<HTMLInputElement | null>(null);

    async function load() {
        setLoading(true);
        const res = await fetch(`/api/myverse/moments?date=${date}`);
        if (res.ok) {
            const d = await res.json();
            setMoments(d.moments ?? []);
        }
        setLoading(false);
    }
    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [date]);

    async function uploadFile(file: File) {
        setUploading(true);
        try {
            // 1) 서버 사이드 업로드 — admin 클라이언트로 Storage RLS 우회
            const form = new FormData();
            form.append("file", file);
            form.append("date", date);
            const upRes = await fetch("/api/myverse/moments/upload", { method: "POST", body: form });
            if (!upRes.ok) {
                const err = await upRes.json().catch(() => ({}));
                alert(`업로드 실패: ${err.error || err.message || upRes.status}`);
                return;
            }
            const upData = await upRes.json();

            // 2) DB row 생성 — caption 자동 일자
            const body: Record<string, unknown> = {
                date,
                media_type: upData.media_type,
                media_url: upData.url,
                file_size: upData.file_size,
                caption: date,
                happened_at: new Date().toISOString(),
            };
            // 이미지 차원 미리 측정 (선택)
            if (upData.media_type === "image") {
                try {
                    const dims = await readImageDimensions(file);
                    body.width = dims.width;
                    body.height = dims.height;
                } catch { /* ignore */ }
            }
            const res = await fetch("/api/myverse/moments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(`저장 실패: ${err.error || res.status}`);
                return;
            }
            await load();
        } finally {
            setUploading(false);
        }
    }

    function onPick() {
        fileRef.current?.click();
    }

    function onPickZip() {
        zipRef.current?.click();
    }

    async function importZip(file: File) {
        setImporting(true);
        setImportResult(null);
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch("/api/myverse/moments/import-meta", { method: "POST", body: form });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(`백업 가져오기 실패: ${json.error || res.status}${json.hint ? "\n" + json.hint : ""}`);
                return;
            }
            setImportResult({ imported: json.imported ?? 0, skipped: json.skipped ?? 0, total: json.total ?? 0 });
            await load();
        } catch (e) {
            alert(`백업 가져오기 오류: ${(e as Error).message}`);
        } finally {
            setImporting(false);
        }
    }

    async function deleteMoment(id: string) {
        await fetch(`/api/myverse/moments/${id}`, { method: "DELETE" });
        load();
    }

    async function saveEdit() {
        if (!editingId) return;
        await fetch(`/api/myverse/moments/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editForm),
        });
        setEditingId(null);
        load();
    }

    const Container = compact ? "div" : "section";
    return (
        <Container className={compact ? "" : "bg-white border border-neutral-200 rounded-xl p-5"}>
            {!compact && (
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                        <Camera className="h-3.5 w-3.5" />
                        오늘의 한 장면
                    </h2>
                    <div className="flex items-center gap-1">
                        {!hideBackup && (
                            <button
                                onClick={onPickZip}
                                disabled={importing || uploading}
                                title="Instagram / Facebook 백업 ZIP 가져오기"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-neutral-500 hover:text-[#6366F1] hover:bg-[#6366F1]/5 disabled:opacity-50"
                            >
                                {importing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Archive className="h-3 w-3" />}
                                {importing ? "가져오는 중…" : "백업"}
                            </button>
                        )}
                        {!hideAdd && (
                            <button
                                onClick={onPick}
                                disabled={uploading}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#6366F1] hover:bg-[#6366F1]/10 disabled:opacity-50"
                            >
                                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                {uploading ? "업로드 중…" : "추가"}
                            </button>
                        )}
                    </div>
                </div>
            )}
            {importResult && (
                <div className="mb-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-700 flex items-center justify-between">
                    <span>가져옴 {importResult.imported}건 · 건너뜀 {importResult.skipped}건 · 총 {importResult.total}건</span>
                    <button onClick={() => setImportResult(null)} className="p-0.5 hover:bg-emerald-100 rounded">
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}
            <input
                ref={zipRef}
                type="file"
                accept=".zip,application/zip"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importZip(file);
                    e.target.value = "";
                }}
                className="hidden"
            />
            <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadFile(file);
                    e.target.value = "";
                }}
                className="hidden"
            />

            {loading ? (
                <div className="text-sm text-neutral-300 italic py-2">로딩 중…</div>
            ) : moments.length === 0 ? (
                minimalEmpty ? (
                    <p className="text-[11px] text-neutral-300 italic py-1">아직 등록된 사진이 없습니다</p>
                ) : (
                    <button
                        onClick={onPick}
                        disabled={uploading}
                        className="w-full py-6 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-400 hover:border-[#6366F1] hover:text-[#6366F1] transition-colors disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : "📷 사진 또는 동영상 추가"}
                    </button>
                )
            ) : compact ? (
                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-1.5">
                        {moments.map((m) => (
                            <MomentCard
                                key={m.id}
                                m={m}
                                onEdit={() => { setEditingId(m.id); setEditForm({ caption: m.caption, with_whom: m.with_whom, location: m.location, activity: m.activity, happened_at: m.happened_at }); }}
                                onDelete={() => setConfirmDeleteId(m.id)}
                            />
                        ))}
                    </div>
                    <button
                        onClick={onPick}
                        disabled={uploading}
                        className="w-full py-2 border border-dashed border-neutral-300 rounded text-[11px] text-neutral-400 hover:border-[#6366F1] hover:text-[#6366F1] disabled:opacity-50"
                    >
                        {uploading ? "업로드 중…" : "+ 한 장면 더 추가"}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {moments.map((m) => (
                        <MomentCard
                            key={m.id}
                            m={m}
                            onEdit={() => { setEditingId(m.id); setEditForm({ caption: m.caption, with_whom: m.with_whom, location: m.location, activity: m.activity, happened_at: m.happened_at }); }}
                            onDelete={() => setConfirmDeleteId(m.id)}
                        />
                    ))}
                </div>
            )}

            <ConfirmSheet
                open={!!confirmDeleteId}
                message="이 장면을 삭제할까요?"
                onConfirm={() => { const id = confirmDeleteId!; setConfirmDeleteId(null); deleteMoment(id); }}
                onCancel={() => setConfirmDeleteId(null)}
            />

            {/* 편집 모달 */}
            {editingId && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-start sm:items-center justify-center p-0 sm:p-4" onClick={() => setEditingId(null)}>
                    <div className="bg-white w-full sm:max-w-md rounded-b-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-neutral-900">한 장면 메모</h3>
                            <button onClick={() => setEditingId(null)} className="text-neutral-400">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <Field label="한 줄" placeholder="이 순간을 한 줄로…">
                                <textarea
                                    value={editForm.caption ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                                    rows={2}
                                    className="w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#6366F1] resize-none placeholder:text-neutral-300 placeholder:italic"
                                    placeholder="이 순간을 한 줄로 적어 보세요"
                                />
                            </Field>
                            <Field label="일시">
                                <input
                                    type="datetime-local"
                                    value={editForm.happened_at ? editForm.happened_at.slice(0, 16) : ""}
                                    onChange={(e) => setEditForm({ ...editForm, happened_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                    className="w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#6366F1]"
                                />
                            </Field>
                            <Field label="누구와">
                                <input
                                    type="text"
                                    value={editForm.with_whom ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, with_whom: e.target.value })}
                                    placeholder="예: 가족, 동료, 혼자"
                                    className="w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#6366F1] placeholder:text-neutral-300 placeholder:italic"
                                />
                            </Field>
                            <Field label="어디서">
                                <input
                                    type="text"
                                    value={editForm.location ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                    placeholder="예: 한강공원, 카페, 사무실"
                                    className="w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#6366F1] placeholder:text-neutral-300 placeholder:italic"
                                />
                            </Field>
                            <Field label="무엇을">
                                <input
                                    type="text"
                                    value={editForm.activity ?? ""}
                                    onChange={(e) => setEditForm({ ...editForm, activity: e.target.value })}
                                    placeholder="예: 산책, 회의, 휴식"
                                    className="w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#6366F1] placeholder:text-neutral-300 placeholder:italic"
                                />
                            </Field>
                        </div>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900">취소</button>
                            <button onClick={saveEdit} className="px-4 py-1.5 bg-[#6366F1] text-white text-sm rounded hover:bg-[#4F46E5]">저장</button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    );
}

function MomentCard({ m, onEdit, onDelete }: { m: Moment; onEdit: () => void; onDelete: () => void }) {
    const meta = [m.with_whom, m.location, m.activity].filter(Boolean).join(" · ");
    const isPublic = m.visibility === "public";
    return (
        <div className="group relative rounded-lg overflow-hidden bg-neutral-100">
            {m.media_type === "text" ? (
                <div className="aspect-square px-3.5 pt-8 pb-7 flex flex-col bg-gradient-to-br from-violet-50 via-white to-indigo-50 myverse-dark:from-violet-500/15 myverse-dark:via-neutral-900 myverse-dark:to-indigo-500/15">
                    <p className="text-[12px] text-neutral-900 myverse-dark:text-neutral-50 font-medium leading-relaxed line-clamp-[7] whitespace-pre-wrap">{m.body || m.caption || "..."}</p>
                    {meta && <p className="text-[10px] text-neutral-500 myverse-dark:text-neutral-300 mt-auto pt-1.5 line-clamp-1">{meta}</p>}
                </div>
            ) : (
                <div className="aspect-square">
                    {m.media_type === "image" ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={m.media_url ?? ""} alt={m.caption || ""} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                        <video src={m.media_url ?? ""} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    )}
                </div>
            )}
            <div className={`absolute inset-0 ${m.media_type === "text" ? "bg-black/0 group-hover:bg-black/5" : "bg-gradient-to-t from-black/60 via-transparent to-transparent"} opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between`}>
                <div className="flex items-center justify-end gap-1">
                    <button onClick={onEdit} className="p-1 bg-white/90 text-neutral-700 rounded text-[11px]" title="편집">
                        <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={onDelete} className="p-1 bg-white/90 text-rose-500 rounded text-[11px]" title="삭제">
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
                {m.media_type !== "text" && (m.caption || meta) && (
                    <div className="text-white">
                        {m.caption && <p className="text-[11px] leading-tight line-clamp-2">{m.caption}</p>}
                        {meta && <p className="text-[10px] text-white/80 mt-0.5 line-clamp-1">{meta}</p>}
                    </div>
                )}
            </div>
            {/* 좌상단 — 타입 배지 */}
            {m.media_type === "video" && (
                <span className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[9px] font-medium px-1.5 py-0.5 rounded">VIDEO</span>
            )}
            {m.media_type === "text" && (
                <span className="absolute top-1.5 left-1.5 bg-violet-500/95 text-white text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded">POST</span>
            )}
            {/* 좌하단 — 공개 칩 (hover 액션과 충돌 회피) */}
            {isPublic && (
                <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-0.5 bg-emerald-500/95 text-white text-[9px] font-medium px-1.5 py-0.5 rounded" title="피드 공개">
                    🌐 공개
                </span>
            )}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode; placeholder?: string }) {
    return (
        <label className="block">
            <span className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{label}</span>
            {children}
        </label>
    );
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
            URL.revokeObjectURL(url);
        };
        img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
        img.src = url;
    });
}

// useAuth 사용 wrapper — DailyView 에서 props 없이 쓸 수 있도록
export function DailyMomentsAuto({
    date, compact, hideAdd, hideBackup, minimalEmpty,
}: {
    date: string;
    compact?: boolean;
    hideAdd?: boolean;
    hideBackup?: boolean;
    minimalEmpty?: boolean;
}) {
    const { user } = useAuth();
    return (
        <DailyMoments
            date={date}
            memberId={user?.id}
            compact={compact}
            hideAdd={hideAdd}
            hideBackup={hideBackup}
            minimalEmpty={minimalEmpty}
        />
    );
}
