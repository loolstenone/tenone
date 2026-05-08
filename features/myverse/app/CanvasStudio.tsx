"use client";

// PP Canvas Engine 기반 캔버스 스튜디오
//
// Phase 6: Excalidraw 제거 → PP Canvas 단독 엔진
// 데이터 저장: /api/myverse/canvases/:id (data.ppcanvas: CanvasDocument)

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
    ChevronLeft, Loader2, Trash2, Check,
} from "lucide-react";
import type { CanvasDocument } from "@/lib/canvas-engine";
import { ConfirmSheet } from "./ConfirmSheet";
import PpCanvas from "./PpCanvas";

// ─── 로딩 / 에러 UI ─────────────────────────────────────────────────────────

function StudioLoading() {
    return (
        <div className="flex items-center justify-center h-full text-neutral-400 text-sm gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> 캔버스 불러오는 중…
        </div>
    );
}

// ─── 메인 CanvasStudio ────────────────────────────────────────────────────────

export function CanvasStudio({ canvasId, embed = false }: { canvasId: string; embed?: boolean }) {
    const [title, setTitle]           = useState("새 캔버스");
    const [loading, setLoading]       = useState(true);
    const [saving, setSaving]         = useState(false);
    const [savedAt, setSavedAt]       = useState<Date | null>(null);
    const [notFound, setNotFound]     = useState(false);
    const [initialDoc, setInitialDoc] = useState<CanvasDocument | null>(null);
    const [titleDirty, setTitleDirty] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    // ─── 초기 로드 ─────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/myverse/canvases/${canvasId}`, { cache: "no-store" });
            if (cancelled) return;
            if (!res.ok) { setNotFound(true); setLoading(false); return; }
            const json = await res.json();
            const canvas = json.canvas;
            if (!canvas) { setNotFound(true); setLoading(false); return; }
            setTitle(canvas.title ?? "새 캔버스");
            if (canvas.data?.ppcanvas) {
                setInitialDoc(canvas.data.ppcanvas as CanvasDocument);
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [canvasId]);

    // ─── PP Canvas 저장 ────────────────────────────────────────────────────
    const handlePpSave = useCallback(async (doc: CanvasDocument) => {
        setSaving(true);
        try {
            await fetch(`/api/myverse/canvases/${canvasId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: { ppcanvas: doc } }),
            });
            setSavedAt(new Date());
        } finally {
            setSaving(false);
        }
    }, [canvasId]);

    // ─── 제목 저장 ─────────────────────────────────────────────────────────
    async function saveTitle(next: string) {
        const t = next.trim() || "새 캔버스";
        setTitle(t);
        setTitleDirty(false);
        await fetch(`/api/myverse/canvases/${canvasId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: t }),
        });
    }

    // ─── 삭제 ──────────────────────────────────────────────────────────────
    async function deleteCanvas() {
        await fetch(`/api/myverse/canvases/${canvasId}`, { method: "DELETE" });
        window.location.href = "/myverse/app/canvas";
    }

    // ─── 렌더 ──────────────────────────────────────────────────────────────
    const shellCls = embed
        ? "absolute inset-0 flex flex-col bg-neutral-50"
        : "fixed inset-0 flex flex-col bg-neutral-50 z-[9100]";

    if (loading) {
        return (
            <div className={`${shellCls} items-center justify-center text-neutral-400 text-sm gap-2`}>
                <StudioLoading />
            </div>
        );
    }
    if (notFound) {
        return (
            <div className={`${shellCls} items-center justify-center`}>
                <div className="text-center">
                    <p className="text-sm text-neutral-500 mb-3">캔버스를 찾을 수 없습니다.</p>
                    {!embed && (
                        <Link href="/myverse/app/canvas" className="text-sm text-[#6366F1] hover:underline">
                            목록으로
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            className={shellCls}
            style={embed ? undefined : { paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
            {/* 상단 헤더 — embed 모드에서는 숨김 */}
            {!embed && (
                <header className="flex items-center gap-2 px-4 py-2 bg-white border-b border-neutral-200 shrink-0 z-10">
                    <Link
                        href="/myverse/app/canvas"
                        className="text-neutral-400 hover:text-neutral-700 transition-colors shrink-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Link>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); setTitleDirty(true); }}
                        onBlur={(e) => { if (titleDirty) saveTitle(e.target.value); }}
                        className="flex-1 min-w-0 text-sm font-medium text-neutral-500 bg-transparent focus:outline-none focus:text-neutral-900 placeholder:text-neutral-300 transition-colors"
                        placeholder="캔버스 제목"
                    />

                    {/* 저장 상태 표시 */}
                    <div
                        className="shrink-0 flex items-center justify-center w-7 h-7"
                        title={
                            saving || titleDirty
                                ? "저장 중…"
                                : savedAt
                                    ? `저장됨 (${savedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })})`
                                    : ""
                        }
                    >
                        {saving || titleDirty ? (
                            <Loader2 className="h-3.5 w-3.5 text-neutral-400 animate-spin" />
                        ) : savedAt ? (
                            <Check className="h-3.5 w-3.5 text-[#6366F1]" />
                        ) : null}
                    </div>

                    <button
                        onClick={() => setConfirmDeleteOpen(true)}
                        className="text-neutral-300 hover:text-rose-500 transition-colors shrink-0"
                        title="캔버스 삭제"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </header>
            )}

            {/* 캔버스 영역 */}
            <div className="flex-1 min-h-0 relative pp-canvas">
                <PpCanvas
                    initialDoc={initialDoc ?? undefined}
                    onSave={handlePpSave}
                    className="absolute inset-0"
                />
            </div>

            <ConfirmSheet
                open={confirmDeleteOpen}
                message="이 캔버스를 영구 삭제할까요?"
                onConfirm={() => { setConfirmDeleteOpen(false); deleteCanvas(); }}
                onCancel={() => setConfirmDeleteOpen(false)}
            />
        </div>
    );
}
