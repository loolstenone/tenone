"use client";

import { useCallback, useContext, createContext, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
    ChevronLeft, Loader2, Trash2, Check,
    Download, LayoutGrid, ChevronDown,
} from "lucide-react";
import type { Editor, TLEditorSnapshot } from "tldraw";
import "tldraw/tldraw.css";
import { ConfirmSheet } from "./ConfirmSheet";

const Tldraw = dynamic(
    async () => (await import("tldraw")).Tldraw,
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

const BG_OPTIONS: { key: BgTemplate; label: string; preview: string }[] = [
    { key: "blank", label: "없음",   preview: "bg-white" },
    { key: "dots",  label: "점 격자", preview: "bg-white" },
    { key: "grid",  label: "모눈",   preview: "bg-white" },
    { key: "lines", label: "줄",     preview: "bg-white" },
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

// ─── tldraw Background 슬롯 (CSS 오버레이 대신 내부에서 렌더) ────────────────

const BgCtx = createContext<BgTemplate>("blank");

function TlBackground() {
    const t = useContext(BgCtx);
    if (t === "blank") return null;
    return <div className="absolute inset-0 pointer-events-none" style={bgStyle(t)} />;
}

// components 객체 안정 참조 — Background 교체 + 우리 헤더와 겹치는 tldraw 기본 UI 숨김
// MenuPanel(좌상단 메인메뉴)·PageMenu·SharePanel(우상단)은 우리 헤더가 대체하므로 제거
const TL_COMPONENTS = {
    Background: TlBackground,
    MenuPanel: null,
    PageMenu: null,
    SharePanel: null,
    NavigationPanel: null,
    DebugPanel: null,
    DebugMenu: null,
    HelpMenu: null,
};

// ─── 메인 CanvasStudio ─────────────────────────────────────────────────────

export function CanvasStudio({ canvasId, embed = false }: { canvasId: string; embed?: boolean }) {
    const [title, setTitle]         = useState("새 캔버스");
    const [loading, setLoading]     = useState(true);
    const [saving, setSaving]       = useState(false);
    const [savedAt, setSavedAt]     = useState<Date | null>(null);
    const [notFound, setNotFound]   = useState(false);
    const [snapshot, setSnapshot]   = useState<TLEditorSnapshot | null>(null);
    const [titleDirty, setTitleDirty] = useState(false);
    const [editor, setEditor]       = useState<Editor | null>(null);
    const [bgTemplate, setBgTemplate] = useState<BgTemplate>("blank");
    const [exporting, setExporting] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // bgTemplate을 ref로도 유지 → saveCanvas 클로저에서 최신값 참조
    const bgTemplateRef = useRef<BgTemplate>("blank");
    // snapshot을 ref로 유지 → handleMount 클로저에서 참조 (deps에서 제거해 참조 안정화)
    const snapshotRef = useRef<TLEditorSnapshot | null>(null);

    // ── tldraw 마운트 타이밍 제어 ──────────────────────────────────────────────
    // 문제: tldraw가 0×0 컨테이너에 마운트되면 내부 div가 display:none으로 고정됨
    //   - loading=true 중에는 ref가 null → 기존 useEffect([embed])가 무효
    //   - embed 모달뿐 아니라 standalone(fixed inset-0)도 flex settle 전에 마운트될 수 있음
    // 해결: loading 완료 후 ResizeObserver로 실제 크기 확인 → tlReady=true 시점에 마운트
    const tlContainerRef = useRef<HTMLDivElement>(null);
    const [tlReady, setTlReady] = useState(false); // 항상 false로 시작, ResizeObserver가 트리거
    useEffect(() => {
        if (loading) return; // 데이터 로드 완료 후에만 실행 (이전에는 ref가 null이었음)
        const el = tlContainerRef.current;
        if (!el) return;
        let done = false;
        const activate = () => {
            if (done) return;
            if (el.offsetWidth > 0 && el.offsetHeight > 0) {
                done = true;
                setTlReady(true);
                ro.disconnect();
            }
        };
        const ro = new ResizeObserver(activate);
        ro.observe(el);
        activate(); // 이미 크기 있으면 즉시 트리거
        return () => ro.disconnect();
    }, [loading]); // loading이 false가 될 때 실행

    // ── 펜 전용 모드 (글로벌 pp-pen-mode 이벤트 수신) ────────────────────────
    const editorRef = useRef<Editor | null>(null);
    useEffect(() => {
        // 초기값: localStorage 참조
        const initial = localStorage.getItem("pp-pen-mode") === "1";
        if (editorRef.current) editorRef.current.updateInstanceState({ isPenMode: initial });

        const handler = (e: Event) => {
            const enabled = (e as CustomEvent<{ enabled: boolean }>).detail.enabled;
            if (editorRef.current) editorRef.current.updateInstanceState({ isPenMode: enabled });
        };
        window.addEventListener("pp-pen-mode", handler);
        return () => window.removeEventListener("pp-pen-mode", handler);
    }, []);
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
            if (canvas.data?.tldraw) {
                setSnapshot(canvas.data.tldraw as TLEditorSnapshot);
                snapshotRef.current = canvas.data.tldraw as TLEditorSnapshot;
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [canvasId]);

    // ── 캔버스 데이터 저장 ─────────────────────────────────────────────────
    const saveCanvas = useCallback(async (ed: Editor) => {
        const snap = ed.getSnapshot();
        setSaving(true);
        try {
            await fetch(`/api/planners/canvases/${canvasId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: { tldraw: snap, bgTemplate: bgTemplateRef.current } }),
            });
            setSavedAt(new Date());
        } finally {
            setSaving(false);
        }
    }, [canvasId]);

    // bgTemplate 변경 즉시 저장
    const handleBgChange = useCallback((t: BgTemplate) => {
        setBgTemplate(t);
        bgTemplateRef.current = t;
        if (editor) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => saveCanvas(editor), 800);
        }
    }, [editor, saveCanvas]);

    // ── tldraw 마운트 콜백 ─────────────────────────────────────────────────
    // snapshot은 <Tldraw snapshot={...}> prop으로 전달 → onMount에서 loadSnapshot 제거
    // loadSnapshot을 onMount 안에서 호출하면 tldraw가 컨테이너 크기를 0으로 재감지하는 버그 발생
    const handleMount = useCallback((ed: Editor) => {
        setEditor(ed);
        editorRef.current = ed;
        const penMode = localStorage.getItem("pp-pen-mode") === "1";
        // snapshot prop이 내부적으로 로드된 뒤 gridMode·penMode 적용 (rAF로 타이밍 보장)
        requestAnimationFrame(() => {
            if (!editorRef.current) return;
            editorRef.current.updateInstanceState({ isPenMode: penMode, isGridMode: false });
        });
        const unsub = ed.store.listen(
            () => {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => saveCanvas(ed), 1500);
            },
            { scope: "document", source: "user" },
        );
        return unsub;
    }, [saveCanvas]);

    // ── PNG 내보내기 ────────────────────────────────────────────────────────
    const exportPng = useCallback(async () => {
        if (!editor || exporting) return;
        setExporting(true);
        try {
            const tldraw = await import("tldraw");
            const shapes = editor.getCurrentPageShapes();
            if (!shapes.length) { alert("캔버스에 내용이 없습니다."); return; }
            const result = await editor.getSvgString(shapes);
            if (!result) return;
            const blob = await tldraw.getSvgAsImage(result.svg, {
                type: "png",
                width: result.width,
                height: result.height,
                pixelRatio: 2,
            });
            if (!blob) return;
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
    }, [editor, exporting, title]);

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
    // embed: 모달 안에 직접 렌더 → absolute inset-0 (부모가 relative)
    // standalone: fixed inset-0 z-50 로 AppLayout 전체 덮음
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
        <div className={shellCls}
            style={embed ? undefined : { paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
            {/* 상단 바 — embed 모드에서는 숨김 (DailyView/ProjectNotesTab 모달 헤더가 대신 처리) */}
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

                {/* 배경 템플릿 선택 */}
                <BgSelector value={bgTemplate} onChange={handleBgChange} />

                {/* PNG 내보내기 */}
                <button
                    onClick={exportPng}
                    disabled={exporting}
                    title="PNG로 내보내기"
                    className="shrink-0 flex items-center justify-center w-7 h-7 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                >
                    {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                </button>

                {/* 저장 상태 */}
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
            )} {/* !embed 헤더 끝 */}

            {/* tldraw 무한 캔버스 */}
            {/* absolute inset-0 래퍼: flex-1 자식에서 height:100% 미작동 문제 방지 */}
            {/* snapshot prop: loadSnapshot을 onMount에서 호출하면 tldraw가 0×0으로 재감지 → blank 버그 */}
            <div ref={tlContainerRef} className="flex-1 min-h-0 relative">
                <div className="absolute inset-0">
                    {tlReady ? (
                        <BgCtx.Provider value={bgTemplate}>
                            <Tldraw
                                snapshot={snapshot ?? undefined}
                                onMount={handleMount}
                                components={TL_COMPONENTS}
                            />
                        </BgCtx.Provider>
                    ) : (
                        <div className="flex items-center justify-center h-full text-neutral-400 text-sm gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> 캔버스 준비 중…
                        </div>
                    )}
                </div>
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
