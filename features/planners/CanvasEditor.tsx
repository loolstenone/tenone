"use client";

// Excalidraw 캔버스 에디터 — SSR 회피 + 자동 저장 + 제목 편집.

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, Loader2, Trash2, Check } from "lucide-react";
import "@excalidraw/excalidraw/index.css";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState } from "@excalidraw/excalidraw/types";

// 클라이언트 전용 — SSR 시점에 window 의존하므로 dynamic import 필수
const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    { ssr: false, loading: () => <CanvasLoading /> },
);

function CanvasLoading() {
    return (
        <div className="flex items-center justify-center h-full text-neutral-400 text-sm gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> 캔버스 불러오는 중…
        </div>
    );
}

interface CanvasData {
    elements: ExcalidrawElement[];
    appState?: Partial<AppState>;
}

interface CanvasRow {
    id: string;
    title: string;
    data: CanvasData;
}

export function CanvasEditor({ canvasId }: { canvasId: string }) {
    const [canvas, setCanvas] = useState<CanvasRow | null>(null);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<Date | null>(null);
    const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/planners/canvases/${canvasId}`, { cache: "no-store" });
            if (cancelled) return;
            if (res.ok) {
                const d = await res.json();
                setCanvas(d.canvas);
                setTitle(d.canvas?.title ?? "");
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [canvasId]);

    const saveData = useCallback(async (data: CanvasData) => {
        setSaving(true);
        try {
            await fetch(`/api/planners/canvases/${canvasId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data }),
            });
            setSavedAt(new Date());
        } finally {
            setSaving(false);
        }
    }, [canvasId]);

    const saveTitle = useCallback(async (next: string) => {
        if (!canvas || next === canvas.title) return;
        await fetch(`/api/planners/canvases/${canvasId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: next }),
        });
        setCanvas({ ...canvas, title: next });
    }, [canvasId, canvas]);

    function onChange(elements: readonly ExcalidrawElement[], appState: AppState) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            // appState 는 스크롤·커서·줌·뷰만 저장 (선택 등은 휘발)
            const slimAppState: Partial<AppState> = {
                viewBackgroundColor: appState.viewBackgroundColor,
                gridSize: appState.gridSize,
                zoom: appState.zoom,
                scrollX: appState.scrollX,
                scrollY: appState.scrollY,
                theme: appState.theme,
            };
            saveData({ elements: [...elements] as ExcalidrawElement[], appState: slimAppState });
        }, 1500);
    }

    async function deleteCanvas() {
        if (!confirm("이 캔버스를 영구 삭제할까요?")) return;
        await fetch(`/api/planners/canvases/${canvasId}`, { method: "DELETE" });
        window.location.href = "/planners/app/canvas";
    }

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-neutral-400 text-sm gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 캔버스 불러오는 중…
            </div>
        );
    }
    if (!canvas) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sm text-neutral-500 mb-3">캔버스를 찾을 수 없습니다.</p>
                    <Link href="/planners/app/canvas" className="text-sm text-[#0F766E] hover:underline">목록으로</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-neutral-50">
            {/* Topbar */}
            <header className="flex items-center gap-3 px-4 py-2 bg-white border-b border-neutral-200 shrink-0">
                <Link href="/planners/app/canvas" className="text-neutral-400 hover:text-neutral-700">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => saveTitle(title.trim() || "제목 없음")}
                    className="flex-1 text-sm font-semibold text-neutral-900 bg-transparent focus:outline-none placeholder:text-neutral-300"
                    placeholder="캔버스 제목"
                />
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                    {saving ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> 저장 중</>
                    ) : savedAt ? (
                        <><Check className="h-3 w-3 text-[#0F766E]" /> {savedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 저장됨</>
                    ) : null}
                </div>
                <button
                    onClick={deleteCanvas}
                    className="text-neutral-300 hover:text-rose-500 transition-colors"
                    title="캔버스 삭제"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </header>

            {/* Excalidraw — 풀 도구 활성화 (그림 그리기 본격 모드) */}
            <div className="flex-1 min-h-0">
                <Excalidraw
                    excalidrawAPI={(api) => { apiRef.current = api; }}
                    initialData={{
                        elements: canvas.data?.elements ?? [],
                        appState: {
                            ...(canvas.data?.appState ?? {}),
                            // 라이브러리 패널 기본 닫혀 있도록 (사용자가 열어서 사용)
                            openSidebar: undefined,
                        },
                        scrollToContent: true,
                    }}
                    onChange={onChange}
                    langCode="ko-KR"
                    handleKeyboardGlobally={true}
                    autoFocus
                    UIOptions={{
                        canvasActions: {
                            // 모든 캔버스 액션 노출
                            export: { saveFileToDisk: true },
                            saveAsImage: true,
                            loadScene: true,
                            saveToActiveFile: false,        // .excalidraw 파일 자동 저장 (내부 저장이 우선이므로 비활성)
                            toggleTheme: true,
                            clearCanvas: true,
                            changeViewBackgroundColor: true,
                        },
                        // 도형 라이브러리 활성화 — 미리 만든 도형 모음을 가져와 쓸 수 있게
                        tools: { image: true },
                        // 환영 화면 비활성 (개인 캔버스라 매번 보일 필요 없음)
                        welcomeScreen: false,
                    }}
                />
            </div>
        </div>
    );
}
