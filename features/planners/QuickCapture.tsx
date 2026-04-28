"use client";

// 빠른 캡처 — 우하단 floating + 버튼
// 어디서든 task / 노트 / 캔버스를 즉시 추가
// Phase 1: task·노트는 오늘 daily에 추가, 캔버스는 새로 만들고 진입
// Phase 2: 자연어 파싱 ("내일 3시 미팅") 추가 예정

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ListTodo, FileText, Pen, Loader2 } from "lucide-react";

const HIDDEN_PATHS = [
    "/planners/app/canvas/", // 캔버스 에디터에서는 숨김
    "/planners/onboarding",
    "/planners/purchase",
];

export function QuickCapture() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"menu" | "task" | "note">("menu");
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [pathname, setPathname] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // pathname 추적 (페이지 이동 감지)
    useEffect(() => {
        if (typeof window === "undefined") return;
        setPathname(window.location.pathname);
        const onChange = () => setPathname(window.location.pathname);
        window.addEventListener("popstate", onChange);
        // Next.js router는 popstate 이외의 변경도 있어 polling 보완
        const id = setInterval(onChange, 600);
        return () => {
            window.removeEventListener("popstate", onChange);
            clearInterval(id);
        };
    }, []);

    // 모드 전환 시 포커스
    useEffect(() => {
        if (!open) return;
        if (mode === "task") setTimeout(() => inputRef.current?.focus(), 50);
        if (mode === "note") setTimeout(() => textareaRef.current?.focus(), 50);
    }, [open, mode]);

    // 닫힐 때 초기화
    useEffect(() => {
        if (!open) {
            setMode("menu");
            setText("");
        }
    }, [open]);

    // ESC 키로 닫기
    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                e.stopPropagation();
                if (mode !== "menu") setMode("menu");
                else setOpen(false);
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, mode]);

    // 보이는 페이지 판단 — 캔버스 에디터·온보딩·결제는 숨김
    const visible = pathname && !HIDDEN_PATHS.some(p => pathname.startsWith(p));
    if (!visible) return null;

    function todayStr() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    async function submitTask() {
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            // Daily 페이지의 tasks 배열에 append
            const date = todayStr();
            const getRes = await fetch(`/api/planners/daily?date=${date}`, { cache: "no-store" });
            const cur = getRes.ok ? await getRes.json() : { daily: { tasks: [] } };
            const tasks = Array.isArray(cur.daily?.tasks) ? cur.daily.tasks : [];
            tasks.push({ text: text.trim(), status: "todo" });
            const res = await fetch(`/api/planners/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, tasks }),
            });
            if (res.ok) {
                setText("");
                setOpen(false);
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function submitNote() {
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            // Daily 페이지의 note 필드에 append (개행 + 새 텍스트)
            const date = todayStr();
            const getRes = await fetch(`/api/planners/daily?date=${date}`, { cache: "no-store" });
            const cur = getRes.ok ? await getRes.json() : { daily: { notes: "" } };
            const prev = (cur.daily?.notes ?? "") as string;
            const next = prev ? `${prev}\n\n${text.trim()}` : text.trim();
            const res = await fetch(`/api/planners/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, notes: next }),
            });
            if (res.ok) {
                setText("");
                setOpen(false);
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function createCanvasAndOpen() {
        setSubmitting(true);
        try {
            const res = await fetch("/api/planners/canvases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "새 캔버스", data: {} }),
            });
            if (res.ok) {
                const d = await res.json();
                router.push(`/planners/app/canvas/${d.canvas.id}`);
                setOpen(false);
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            {/* 토글 버튼 — 우하단 (BetaFeedbackButton과 겹치지 않도록 좌측 살짝) */}
            <button
                onClick={() => setOpen(o => !o)}
                title="빠른 캡처"
                aria-label="빠른 캡처"
                className={`fixed bottom-5 right-5 z-[7900] w-12 h-12 rounded-full shadow-lg transition-all flex items-center justify-center ${
                    open
                        ? "bg-neutral-900 text-white"
                        : "bg-[#0F766E] text-white hover:bg-[#0d5e56] hover:scale-105"
                }`}
            >
                {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>

            {/* 패널 */}
            {open && (
                <div className="fixed bottom-20 right-5 z-[7900] w-72 bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
                    {mode === "menu" && (
                        <div className="p-2">
                            <button
                                onClick={() => setMode("task")}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                            >
                                <ListTodo className="h-4 w-4 text-[#0F766E]" />
                                <span className="flex-1">할 일</span>
                                <span className="text-[10px] text-neutral-400">오늘에 추가</span>
                            </button>
                            <button
                                onClick={() => setMode("note")}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                            >
                                <FileText className="h-4 w-4 text-amber-600" />
                                <span className="flex-1">노트</span>
                                <span className="text-[10px] text-neutral-400">오늘에 추가</span>
                            </button>
                            <button
                                onClick={createCanvasAndOpen}
                                disabled={submitting}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin text-[#0F766E]" /> : <Pen className="h-4 w-4 text-purple-600" />}
                                <span className="flex-1">캔버스</span>
                                <span className="text-[10px] text-neutral-400">새로 만들기</span>
                            </button>
                        </div>
                    )}

                    {mode === "task" && (
                        <div className="p-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                                <ListTodo className="h-3.5 w-3.5" />
                                오늘 할 일 추가
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") submitTask(); }}
                                placeholder="할 일 한 줄"
                                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#0F766E]"
                            />
                            <div className="flex items-center gap-2 justify-end">
                                <button onClick={() => setMode("menu")} className="text-xs text-neutral-400 hover:text-neutral-700 px-2">취소</button>
                                <button
                                    onClick={submitTask}
                                    disabled={submitting || !text.trim()}
                                    className="px-3 py-1.5 text-xs bg-[#0F766E] text-white rounded-lg hover:bg-[#0d5e56] disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "추가"}
                                </button>
                            </div>
                        </div>
                    )}

                    {mode === "note" && (
                        <div className="p-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                                <FileText className="h-3.5 w-3.5" />
                                오늘 노트에 추가
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitNote();
                                }}
                                placeholder="떠오른 생각… (Cmd+Enter 저장)"
                                rows={4}
                                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#0F766E] resize-none"
                            />
                            <div className="flex items-center gap-2 justify-end">
                                <button onClick={() => setMode("menu")} className="text-xs text-neutral-400 hover:text-neutral-700 px-2">취소</button>
                                <button
                                    onClick={submitNote}
                                    disabled={submitting || !text.trim()}
                                    className="px-3 py-1.5 text-xs bg-[#0F766E] text-white rounded-lg hover:bg-[#0d5e56] disabled:opacity-50"
                                >
                                    {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "저장"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
