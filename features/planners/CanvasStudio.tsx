"use client";

// Excalidraw 기반 캔버스 스튜디오 — tldraw에서 마이그레이션 (라이선스 회피)
//
// 보존:
//  · 배경 템플릿 (blank / dots / grid / lines) — CSS 오버레이
//  · 자동 저장 (1.5s debounce) + 제목 편집 + 삭제(ConfirmSheet)
//  · embed 모드 vs standalone 셸 분기
//  · PNG 내보내기
//
// 변경:
//  · tldraw → @excalidraw/excalidraw
//  · DB 스키마: data.tldraw → data.excalidraw ({elements, appState, files})
//  · 기존 tldraw 데이터를 가진 캔버스는 빈 화면으로 시작 + "이전 형식" 안내 배너
//  · 펜 전용 모드는 제거 (Excalidraw 직접 동등물 없음 — touch-action으로 우회 가능하나 별도 작업)

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
    ChevronLeft, Loader2, Trash2, Check,
    Download, LayoutGrid, ChevronDown, AlertTriangle,
} from "lucide-react";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import { ConfirmSheet } from "./ConfirmSheet";
import { CanvasPenPalette } from "./CanvasPenPalette";

const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    { ssr: false, loading: () => <StudioLoading /> },
);

function StudioLoading() {
    return (
        <div className="flex items-center justify-center h-full text-neutral-400 text-sm gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> 캔버스 스튜디오 불러오는 중…
        </div>
    );
}

// ─── 배경 템플릿 ────────────────────────────────────────────────────────────

type BgTemplate = "blank" | "dots" | "grid" | "lines";

const BG_OPTIONS: { key: BgTemplate; label: string }[] = [
    { key: "blank", label: "없음" },
    { key: "dots",  label: "점 격자" },
    { key: "grid",  label: "모눈" },
    { key: "lines", label: "줄" },
];

function bgStyle(t: BgTemplate): React.CSSProperties {
    switch (t) {
        case "dots":
            return {
                backgroundImage: "radial-gradient(circle, #c4c4c4 1px, transparent 1px)",
                backgroundSize: "24px 24px",
            };
        case "grid":
            return {
                backgroundImage:
                    "linear-gradient(to right, #e0e0e0 1px, transparent 1px), linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)",
                backgroundSize: "24px 24px",
            };
        case "lines":
            return {
                backgroundImage: "linear-gradient(transparent 29px, #d4d4d4 29px, #d4d4d4 30px)",
                backgroundSize: "100% 30px",
            };
        default:
            return {};
    }
}

function BgSelector({
    value,
    onChange,
}: {
    value: BgTemplate;
    onChange: (t: BgTemplate) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const current = BG_OPTIONS.find((o) => o.key === value)!;

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open]);

    return (
        <div ref={ref} className="relative shrink-0">
            <button
                onClick={() => setOpen((p) => !p)}
                title="배경 템플릿"
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 transition-colors px-1.5 py-1 rounded hover:bg-neutral-100"
            >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{current.label}</span>
                <ChevronDown className="h-3 w-3" />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-[9999] py-1 min-w-[100px]">
                    {BG_OPTIONS.map((o) => (
                        <button
                            key={o.key}
                            onClick={() => { onChange(o.key); setOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-50 transition-colors ${
                                o.key === value ? "text-[#0F766E] font-semibold" : "text-neutral-700"
                            }`}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── DB 스키마 ──────────────────────────────────────────────────────────────

interface ExcalidrawSceneData {
    elements: readonly ExcalidrawElement[];
    appState?: Partial<AppState>;
    files?: BinaryFiles;
}

// ─── 메인 CanvasStudio ─────────────────────────────────────────────────────

export function CanvasStudio({ canvasId, embed = false }: { canvasId: string; embed?: boolean }) {
    const [title, setTitle]         = useState("새 캔버스");
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [savedAt, setSavedAt]     = useState<Date | null>(null);
    const [notFound, setNotFound]   = useState(false);
    const [initialScene, setInitialScene] = useState<ExcalidrawSceneData | null>(null);
    const [titleDirty, setTitleDirty] = useState(false);
    const [bgTemplate, setBgTemplate] = useState<BgTemplate>("blank");
    const [exporting, setExporting] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [legacyWarning, setLegacyWarning] = useState(false);

    const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bgTemplateRef = useRef<BgTemplate>("blank");

    bgTemplateRef.current = bgTemplate;

    // ── 초기 로드 ──────────────────────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/planners/canvases/${canvasId}`, { cache: "no-store" });
            if (cancelled) return;
            if (!res.ok) { setNotFound(true); setLoading(false); return; }
            const json = await res.json();
            const canvas = json.canvas;
            if (!canvas) { setNotFound(true); setLoading(false); return; }
            setTitle(canvas.title ?? "새 캔버스");
            if (canvas.data?.bgTemplate) setBgTemplate(canvas.data.bgTemplate as BgTemplate);
            // Excalidraw 데이터 우선 로드, 없으면 legacy tldraw 데이터 → 빈 화면 + 경고
            if (canvas.data?.excalidraw) {
                setInitialScene(canvas.data.excalidraw as ExcalidrawSceneData);
            } else if (canvas.data?.tldraw) {
                setLegacyWarning(true);
                setInitialScene({ elements: [], appState: { viewBackgroundColor: "transparent" } });
            } else {
                setInitialScene({ elements: [], appState: { viewBackgroundColor: "transparent" } });
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [canvasId]);

    // ── 캔버스 데이터 저장 ─────────────────────────────────────────────────
    const saveCanvas = useCallback(async () => {
        const api = apiRef.current;
        if (!api) return;
        const elements = api.getSceneElements();
        const appState = api.getAppState();
        const files = api.getFiles();
        // viewBackgroundColor·collaborators 등 노이즈 필드 제거 — 직렬화 가벼움 + DB 호환
        const cleanAppState: Partial<AppState> = {
            viewBackgroundColor: "transparent",
            gridSize: appState.gridSize,
            zoom: appState.zoom,
            scrollX: appState.scrollX,
            scrollY: appState.scrollY,
        };
        setSaving(true);
        try {
            await fetch(`/api/planners/canvases/${canvasId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: {
                        excalidraw: { elements, appState: cleanAppState, files },
                        bgTemplate: bgTemplateRef.current,
                    },
                }),
            });
            setSavedAt(new Date());
            if (legacyWarning) setLegacyWarning(false); // 새로 저장 → 경고 해제
        } finally {
            setSaving(false);
        }
    }, [canvasId, legacyWarning]);

    // ── Excalidraw onChange — 사용자 변경 디바운스 저장 ──────────────────────
    const onSceneChange = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { void saveCanvas(); }, 1500);
    }, [saveCanvas]);

    // bgTemplate 변경 시 즉시 저장
    const handleBgChange = useCallback((t: BgTemplate) => {
        setBgTemplate(t);
        bgTemplateRef.current = t;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => { void saveCanvas(); }, 800);
    }, [saveCanvas]);

    // ── PNG 내보내기 ────────────────────────────────────────────────────────
    const exportPng = useCallback(async () => {
        const api = apiRef.current;
        if (!api || exporting) return;
        const elements = api.getSceneElements();
        if (!elements.length) { alert("캔버스에 내용이 없습니다."); return; }
        setExporting(true);
        try {
            const { exportToBlob } = await import("@excalidraw/excalidraw");
            const blob = await exportToBlob({
                elements,
                appState: { ...api.getAppState(), exportBackground: bgTemplate !== "blank", exportWithDarkMode: false },
                files: api.getFiles(),
                mimeType: "image/png",
                quality: 0.92,
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${title || "canvas"}.png`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("export failed", e);
        } finally {
            setExporting(false);
        }
    }, [exporting, title, bgTemplate]);

    // ── 제목 저장 ──────────────────────────────────────────────────────────
    async function saveTitle(next: string) {
        const t = next.trim() || "새 캔버스";
        setTitle(t);
        setTitleDirty(false);
        await fetch(`/api/planners/canvases/${canvasId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: t }),
        });
    }

    // ── 삭제 ───────────────────────────────────────────────────────────────
    async function deleteCanvas() {
        await fetch(`/api/planners/canvases/${canvasId}`, { method: "DELETE" });
        window.location.href = "/planners/app/canvas";
    }

    // ── 로딩 / 에러 ────────────────────────────────────────────────────────
    const shellCls = embed
        ? "absolute inset-0 flex flex-col bg-neutral-50"
        : "fixed inset-0 flex flex-col bg-neutral-50 z-50";

    if (loading) {
        return (
            <div className={`${shellCls} items-center justify-center text-neutral-400 text-sm gap-2`}>
                <Loader2 className="h-4 w-4 animate-spin" /> 캔버스 스튜디오 불러오는 중…
            </div>
        );
    }
    if (notFound) {
        return (
            <div className={`${shellCls} items-center justify-center`}>
                <div className="text-center">
                    <p className="text-sm text-neutral-500 mb-3">캔버스를 찾을 수 없습니다.</p>
                    {!embed && <Link href="/planners/app/canvas" className="text-sm text-[#0F766E] hover:underline">목록으로</Link>}
                </div>
            </div>
        );
    }

    return (
        <div
            className={shellCls}
            style={embed ? undefined : { paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
            {/* 상단 바 — embed 모드에서는 숨김 */}
            {!embed && (
            <header className="flex items-center gap-2 px-4 py-2 bg-white border-b border-neutral-200 shrink-0 z-10">
                <Link href="/planners/app/canvas" className="text-neutral-400 hover:text-neutral-700 transition-colors shrink-0">
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

                <BgSelector value={bgTemplate} onChange={handleBgChange} />

                <button
                    onClick={exportPng}
                    disabled={exporting}
                    title="PNG로 내보내기"
                    className="shrink-0 flex items-center justify-center w-7 h-7 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                >
                    {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                </button>

                <div className="flex items-center gap-1 text-xs text-neutral-400 shrink-0">
                    {saving || titleDirty ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> 저장 중</>
                    ) : savedAt ? (
                        <><Check className="h-3 w-3 text-[#0F766E]" /> {savedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 저장됨</>
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

            {/* 레거시 데이터 경고 — tldraw 스냅샷이 있던 캔버스 */}
            {legacyWarning && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 shrink-0">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1">
                        이전 형식의 캔버스 데이터가 있어 빈 화면으로 시작합니다. 새로 작성하면 자동 저장됩니다.
                    </span>
                </div>
            )}

            {/* Excalidraw 캔버스 */}
            <div className="flex-1 min-h-0 relative pp-canvas">
                {/* 배경 템플릿 — Excalidraw 아래 z-0 */}
                {bgTemplate !== "blank" && (
                    <div className="absolute inset-0 pointer-events-none z-0" style={bgStyle(bgTemplate)} />
                )}
                <div className="absolute inset-0 z-10">
                    <Excalidraw
                        excalidrawAPI={(api) => { apiRef.current = api; }}
                        initialData={initialScene
                            ? { ...initialScene, appState: { ...initialScene.appState, viewBackgroundColor: "transparent" } }
                            : { elements: [], appState: { viewBackgroundColor: "transparent" } }}
                        onChange={onSceneChange}
                        langCode="ko-KR"
                        UIOptions={{
                            canvasActions: {
                                export: { saveFileToDisk: true },
                                saveAsImage: true,
                                loadScene: true,
                                saveToActiveFile: false,
                                toggleTheme: true,
                                clearCanvas: true,
                                changeViewBackgroundColor: false, // 배경은 우리 BgSelector가 전담
                            },
                            tools: { image: true },
                            welcomeScreen: false,
                        }}
                    />
                </div>
                {/* PP AI 펜 팔레트 — Excalidraw 위에 floating */}
                <CanvasPenPalette apiRef={apiRef} />
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
