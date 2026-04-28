"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, Loader2, Trash2, Check } from "lucide-react";
import type { Editor, TLEditorSnapshot } from "tldraw";
// getSvgAsImage은 클라이언트 전용이라 dynamic import로 처리
import "tldraw/tldraw.css";

const Tldraw = dynamic(
    async () => (await import("tldraw")).Tldraw,
    { ssr: false, loading: () => <CanvasLoading /> },
);

function CanvasLoading() {
    return (
        <div className="flex items-center justify-center h-full text-neutral-400 text-sm gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> 캔버스 불러오는 중…
        </div>
    );
}

interface CanvasRow {
    id: string;
    title: string;
    data: TLEditorSnapshot | null;
}

export function CanvasEditor({ canvasId }: { canvasId: string }) {
    const [canvas, setCanvas] = useState<CanvasRow | null>(null);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<Date | null>(null);
    const editorRef = useRef<Editor | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const thumbDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    const saveData = useCallback(async (snapshot: TLEditorSnapshot) => {
        setSaving(true);
        try {
            await fetch(`/api/planners/canvases/${canvasId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: snapshot }),
            });
            setSavedAt(new Date());
        } finally {
            setSaving(false);
        }
    }, [canvasId]);

    const saveThumbnail = useCallback(async () => {
        const editor = editorRef.current;
        if (!editor) return;
        const allShapeIds = editor.getCurrentPageShapeIds();
        if (allShapeIds.size === 0) return;
        try {
            const result = await editor.getSvgString([...allShapeIds], { padding: 16 });
            if (!result) return;
            const { getSvgAsImage } = await import("tldraw");
            const blob = await getSvgAsImage(result.svg, {
                type: "jpeg",
                quality: 0.65,
                width: Math.round(result.width),
                height: Math.round(result.height),
                pixelRatio: 0.5,
            });
            if (!blob) return;
            const dataUrl: string = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
            await fetch(`/api/planners/canvases/${canvasId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ thumbnail_url: dataUrl }),
            });
        } catch {
            // 썸네일 오류는 무시
        }
    }, [canvasId]);

    const handleMount = useCallback((editor: Editor) => {
        editorRef.current = editor;

        if (canvas?.data) {
            import("tldraw").then(({ loadSnapshot }) => {
                try {
                    loadSnapshot(editor.store, canvas.data!);
                } catch {
                    // 기존 데이터 형식 불일치 시 빈 캔버스로 시작
                }
            });
        }

        const cleanupListen = editor.store.listen(
            () => {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                    import("tldraw").then(({ getSnapshot }) => {
                        const snapshot = getSnapshot(editor.store);
                        saveData(snapshot);
                    });
                }, 1500);

                if (thumbDebounceRef.current) clearTimeout(thumbDebounceRef.current);
                thumbDebounceRef.current = setTimeout(saveThumbnail, 5000);
            },
            { scope: "document" },
        );

        return () => {
            cleanupListen();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (thumbDebounceRef.current) clearTimeout(thumbDebounceRef.current);
        };
    }, [canvas, saveData, saveThumbnail]);

    const saveTitle = useCallback(async (next: string) => {
        if (!canvas || next === canvas.title) return;
        await fetch(`/api/planners/canvases/${canvasId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: next }),
        });
        setCanvas({ ...canvas, title: next });
    }, [canvasId, canvas]);

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
        <div className="h-screen flex flex-col">
            {/* Topbar */}
            <header className="flex items-center gap-3 px-4 py-2 bg-white border-b border-neutral-200 shrink-0 z-10">
                <Link href="/planners/app/canvas" className="text-neutral-400 hover:text-neutral-700">
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => saveTitle(title.trim() || "제목 없음")}
                    className="flex-1 text-sm font-medium text-neutral-500 bg-transparent focus:outline-none focus:text-neutral-900 placeholder:text-neutral-300 transition-colors"
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

            {/* tldraw — 풀 화면 */}
            <div className="flex-1 min-h-0">
                <Tldraw onMount={handleMount} />
            </div>
        </div>
    );
}
