"use client";

// 명령 팔레트 — Cmd+K (Mac) / Ctrl+K (Windows) 로 호출
// Phase 1: 라우트 점프 + 빠른 액션
// Phase 2: 자연어 입력 (예: "내일 3시 미팅") 자동 파싱·등록

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Search, ArrowRight, LayoutGrid, Sun, CalendarDays, CalendarRange, CalendarClock,
    Compass, FolderKanban, Pen, Users, FileText, Sparkles, LayoutTemplate,
    Settings as SettingsIcon, HelpCircle, Loader2, Keyboard, Mic, MicOff,
} from "lucide-react";

interface Command {
    id: string;
    label: string;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    section: "이동" | "만들기" | "도움말";
    keywords?: string;
    shortcut?: string;
    run: () => void | Promise<void>;
}

interface Props {
    open: boolean;
    onClose: () => void;
}

// AI 파싱 결과 액션 — /api/planners/ai/parse-input 응답
interface AiAction {
    tool: "create_task" | "create_event" | "create_note";
    input: Record<string, unknown>;
}

function todayStr(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function CommandPalette({ open, onClose }: Props) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const [creating, setCreating] = useState<string | null>(null);
    const [aiBusy, setAiBusy] = useState(false);
    const [aiResult, setAiResult] = useState<{ actions: AiAction[]; summary: string; rawText: string } | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const [listening, setListening] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<unknown>(null);

    // 열릴 때 포커스 + 쿼리·AI 결과 초기화
    useEffect(() => {
        if (open) {
            setQuery("");
            setActiveIndex(0);
            setAiResult(null);
            setAiError(null);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // 음성 입력 (Web Speech API · 한국어)
    const startListening = useCallback(() => {
        if (typeof window === "undefined") return;
        type SRConstructor = new () => {
            lang: string; continuous: boolean; interimResults: boolean;
            onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
            onerror: (e: unknown) => void;
            onend: () => void;
            start: () => void; stop: () => void;
        };
        const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
        const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
        if (!SR) { setAiError("이 브라우저는 음성 입력을 지원하지 않습니다."); return; }
        try {
            const rec = new SR();
            rec.lang = "ko-KR";
            rec.continuous = false;
            rec.interimResults = false;
            rec.onresult = (e) => {
                const text = e.results[0][0].transcript;
                setQuery(text);
                setListening(false);
                // 음성 입력은 자동으로 AI 파싱 시도
                setTimeout(() => {
                    if (text.trim().length >= 2) {
                        // askAi 직접 호출 대신 query 가 set 된 다음 tick 에서 처리
                        void fetch("/api/planners/ai/parse-input", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ text, today: todayStr() }),
                        }).then(r => r.json()).then(d => {
                            if (d?.actions?.length > 0) {
                                setAiResult({ actions: d.actions, summary: d.summary, rawText: text });
                            } else {
                                setAiError(d?.summary || "추출된 항목이 없습니다.");
                            }
                        }).catch(err => setAiError(err instanceof Error ? err.message : "AI 호출 실패"));
                    }
                }, 100);
            };
            rec.onerror = () => { setListening(false); };
            rec.onend   = () => { setListening(false); };
            rec.start();
            recognitionRef.current = rec;
            setListening(true);
            setAiError(null);
        } catch (e) {
            setAiError(e instanceof Error ? e.message : "음성 입력 오류");
            setListening(false);
        }
    }, []);

    const stopListening = useCallback(() => {
        const rec = recognitionRef.current as { stop?: () => void } | null;
        try { rec?.stop?.(); } catch { /* noop */ }
        setListening(false);
    }, []);

    // AI 자연어 파싱 호출
    const askAi = useCallback(async () => {
        const text = query.trim();
        if (!text || aiBusy) return;
        setAiBusy(true);
        setAiError(null);
        try {
            const res = await fetch("/api/planners/ai/parse-input", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, today: todayStr() }),
            });
            const d = await res.json();
            if (!res.ok) {
                setAiError(d?.error === "ai_disabled" ? "AI 키가 설정되지 않았습니다." : (d?.detail || "AI 호출 실패"));
                return;
            }
            if (!d.actions || d.actions.length === 0) {
                setAiError(d.summary || "추출된 항목이 없습니다.");
                return;
            }
            setAiResult({ actions: d.actions, summary: d.summary, rawText: text });
        } catch (e) {
            setAiError(e instanceof Error ? e.message : "AI 호출 실패");
        } finally {
            setAiBusy(false);
        }
    }, [query, aiBusy]);

    // AI 결과 등록 — 각 action 별로 적절한 API 호출
    const commitActions = useCallback(async () => {
        if (!aiResult) return;
        setAiBusy(true);
        try {
            for (const a of aiResult.actions) {
                if (a.tool === "create_task") {
                    const date = (a.input.date as string) || todayStr();
                    const text = a.input.text as string;
                    const time = (a.input.time as string | null) ?? null;
                    const priority = (a.input.priority as string | null) ?? null;
                    const r = await fetch(`/api/planners/daily?date=${date}`);
                    const cur = r.ok ? await r.json() : null;
                    const tasks = Array.isArray(cur?.daily?.tasks) ? cur.daily.tasks : [];
                    tasks.push({
                        id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                        text, status: "todo", time, priority,
                    });
                    await fetch(`/api/planners/daily`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ date, tasks }),
                    });
                } else if (a.tool === "create_event") {
                    await fetch(`/api/planners/calendar`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            entry_date: a.input.date,
                            kind: a.input.kind || "meeting",
                            title: a.input.title,
                            start_time: a.input.start_time ?? null,
                            end_time: a.input.end_time ?? null,
                            location: a.input.location ?? null,
                        }),
                    });
                } else if (a.tool === "create_note") {
                    const date = (a.input.date as string) || todayStr();
                    const content = a.input.content as string;
                    const r = await fetch(`/api/planners/daily?date=${date}`);
                    const cur = r.ok ? await r.json() : null;
                    const prev = (cur?.daily?.notes ?? "") as string;
                    const next = prev ? `${prev}\n\n${content}` : content;
                    await fetch(`/api/planners/daily`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ date, notes: next }),
                    });
                }
            }
            onClose();
        } finally {
            setAiBusy(false);
        }
    }, [aiResult, onClose]);

    const go = useCallback((path: string) => {
        router.push(path);
        onClose();
    }, [router, onClose]);

    const createCanvas = useCallback(async () => {
        setCreating("canvas");
        try {
            const res = await fetch("/api/planners/canvases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "새 캔버스", data: {} }),
            });
            if (res.ok) {
                const d = await res.json();
                router.push(`/planners/app/canvas/${d.canvas.id}`);
                onClose();
            }
        } finally {
            setCreating(null);
        }
    }, [router, onClose]);

    const commands: Command[] = useMemo(() => [
        // 이동
        { id: "go_index",     label: "인덱스",        icon: LayoutGrid,      section: "이동", shortcut: "I", keywords: "index 인덱스 홈", run: () => go("/planners/app/index") },
        { id: "go_today",     label: "일간",          icon: Sun,             section: "이동", shortcut: "T", keywords: "today daily 일간 오늘", run: () => go("/planners/app/today") },
        { id: "go_weekly",    label: "주간",          icon: CalendarDays,    section: "이동", shortcut: "W", keywords: "weekly 주간", run: () => go("/planners/app/weekly") },
        { id: "go_monthly",   label: "월간",          icon: CalendarRange,   section: "이동", shortcut: "M", keywords: "monthly 월간", run: () => go("/planners/app/monthly") },
        { id: "go_yearly",    label: "연간",          icon: CalendarClock,   section: "이동", shortcut: "Y", keywords: "yearly 연간", run: () => go("/planners/app/yearly") },
        { id: "go_projects",  label: "프로젝트",      icon: FolderKanban,    section: "이동", shortcut: "P", keywords: "projects 프로젝트", run: () => go("/planners/app/projects") },
        { id: "go_canvas",    label: "캔버스",        icon: Pen,             section: "이동",            keywords: "canvas 캔버스 그림 손글씨", run: () => go("/planners/app/canvas") },
        { id: "go_contacts",  label: "연락처",        icon: Users,           section: "이동", shortcut: "C", keywords: "contacts 연락처 사람", run: () => go("/planners/app/contacts") },
        { id: "go_identity",  label: "퍼스널",        icon: Compass,         section: "이동",            keywords: "personal identity pi 정체성 비전 퍼스널", run: () => go("/planners/app/personal") },
        { id: "go_templates", label: "템플릿",        icon: LayoutTemplate,  section: "이동",            keywords: "templates 템플릿", run: () => go("/planners/app/templates") },
        { id: "go_search",    label: "검색",          icon: Search,          section: "이동",            keywords: "search 검색 찾기", run: () => go("/planners/app/search") },
        { id: "go_tasks",     label: "할 일",         icon: FileText,        section: "이동",            keywords: "tasks 할일 todo", run: () => go("/planners/app/tasks") },
        { id: "go_settings",  label: "설정",          icon: SettingsIcon,    section: "이동",            keywords: "settings 설정", run: () => go("/planners/app/settings") },
        { id: "go_help",      label: "도움말",        icon: HelpCircle,      section: "이동",            keywords: "help 도움말 헬프", run: () => go("/planners/app/help") },

        // 만들기
        { id: "new_canvas",   label: "새 캔버스 만들기",   icon: Pen,           section: "만들기", keywords: "canvas new 새 캔버스 그림", run: createCanvas },
        { id: "new_project",  label: "새 프로젝트 만들기", icon: FolderKanban,  section: "만들기", keywords: "project new 새 프로젝트", run: () => go("/planners/app/projects?new=1") },
        { id: "new_contact",  label: "새 연락처 추가",    icon: Users,         section: "만들기", keywords: "contact new 새 연락처", run: () => go("/planners/app/contacts?new=1") },

        // 도움말
        { id: "shortcuts",    label: "단축키 보기",        icon: Keyboard,      section: "도움말", keywords: "shortcuts keyboard 단축키 키보드", run: () => { window.dispatchEvent(new CustomEvent("pp-show-shortcuts")); onClose(); } },
    ], [go, createCanvas, onClose]);

    // 필터링
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return commands;
        return commands.filter(c =>
            c.label.toLowerCase().includes(q) ||
            (c.keywords ?? "").toLowerCase().includes(q)
        );
    }, [commands, query]);

    // 섹션별 그룹
    const grouped = useMemo(() => {
        const g: Record<string, Command[]> = {};
        for (const c of filtered) (g[c.section] ??= []).push(c);
        return g;
    }, [filtered]);

    // 평탄화 (키보드 네비용)
    const flat = useMemo(() => filtered, [filtered]);

    // active scroll
    useEffect(() => {
        if (!listRef.current) return;
        const el = listRef.current.querySelector<HTMLElement>(`[data-cmd-idx="${activeIndex}"]`);
        el?.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);

    // 키 이벤트
    function onKeyDown(e: React.KeyboardEvent) {
        // ⌘↵ / Ctrl↵ — 자연어 AI 등록
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            if (query.trim().length >= 4) askAi();
            return;
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, flat.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const cmd = flat[activeIndex];
            if (cmd) cmd.run();
        } else if (e.key === "Escape") {
            e.preventDefault();
            if (aiResult) { setAiResult(null); return; }
            onClose();
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9000] flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 검색 입력 */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
                    {creating ? (
                        <Loader2 className="h-4 w-4 text-[#0F766E] animate-spin shrink-0" />
                    ) : (
                        <Search className="h-4 w-4 text-neutral-400 shrink-0" />
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                        onKeyDown={onKeyDown}
                        placeholder="이동·만들기·검색·자연어…"
                        className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-none"
                    />
                    <button
                        onClick={() => listening ? stopListening() : startListening()}
                        title={listening ? "녹음 중지" : "음성 입력 (한국어)"}
                        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            listening
                                ? "bg-rose-500 text-white animate-pulse"
                                : "text-neutral-400 hover:text-[#0F766E] hover:bg-[#0F766E]/10"
                        }`}
                    >
                        {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    </button>
                    <span className="text-[10px] text-neutral-400 shrink-0">ESC</span>
                </div>

                {/* AI 미리보기 — 파싱 결과 */}
                {aiResult && (
                    <div className="px-4 py-3 border-b border-[#0F766E]/20 bg-[#0F766E]/[0.04]">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-[#0F766E]" />
                            <span className="text-[11px] font-semibold text-[#0F766E] uppercase tracking-widest">AI 분석 결과</span>
                            <button onClick={() => { setAiResult(null); setAiError(null); }} className="ml-auto text-[10px] text-neutral-400 hover:text-neutral-700">취소</button>
                        </div>
                        <p className="text-[11px] text-neutral-500 mb-2">{aiResult.summary}</p>
                        <ul className="space-y-1 mb-3">
                            {aiResult.actions.map((a, i) => (
                                <li key={i} className="text-xs text-neutral-700 flex items-start gap-2">
                                    <span className="mt-0.5 inline-block w-12 shrink-0 text-[10px] font-mono text-[#0F766E] uppercase">
                                        {a.tool === "create_task" ? "할 일" : a.tool === "create_event" ? "일정" : "노트"}
                                    </span>
                                    <span className="flex-1">
                                        {a.tool === "create_task" && (
                                            <>
                                                {String(a.input.date)} {a.input.time ? `· ${a.input.time}` : ""} — {String(a.input.text)}
                                            </>
                                        )}
                                        {a.tool === "create_event" && (
                                            <>
                                                {String(a.input.date)} {a.input.start_time ? `· ${a.input.start_time}` : ""} — {String(a.input.title)}
                                                {a.input.location ? ` @ ${a.input.location}` : ""}
                                            </>
                                        )}
                                        {a.tool === "create_note" && (
                                            <>
                                                {String(a.input.date)} — {String(a.input.content).slice(0, 60)}{String(a.input.content).length > 60 ? "…" : ""}
                                            </>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={commitActions}
                            disabled={aiBusy}
                            className="w-full px-3 py-1.5 text-xs bg-[#0F766E] text-white rounded-lg hover:bg-[#0d5e56] disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                        >
                            {aiBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                            {aiBusy ? "등록 중…" : "전부 등록"}
                        </button>
                    </div>
                )}
                {aiError && (
                    <div className="px-4 py-2 border-b border-rose-200 bg-rose-50 text-[11px] text-rose-700">
                        ⚠ {aiError}
                    </div>
                )}

                {/* AI 자연어 입력 항목 — query 4자 이상이면 상단 노출 */}
                {!aiResult && query.trim().length >= 4 && (
                    <div className="px-2 pt-2">
                        <button
                            onClick={askAi}
                            disabled={aiBusy}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors bg-[#0F766E]/[0.04] hover:bg-[#0F766E]/10 border border-dashed border-[#0F766E]/30 disabled:opacity-50"
                        >
                            {aiBusy
                                ? <Loader2 className="h-4 w-4 text-[#0F766E] animate-spin shrink-0" />
                                : <Sparkles className="h-4 w-4 text-[#0F766E] shrink-0" />}
                            <span className="flex-1 text-sm text-neutral-700">
                                <span className="text-[#0F766E] font-semibold">AI: </span>
                                <span className="text-neutral-500">「{query.length > 32 ? query.slice(0, 32) + "…" : query}」</span> 자연어로 등록
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#0F766E]/30 text-[#0F766E]">⌘↵</span>
                        </button>
                    </div>
                )}

                {/* 결과 */}
                <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
                    {flat.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-neutral-400">결과 없음 — 위 AI 항목으로 자연어 등록 가능</div>
                    ) : (
                        Object.entries(grouped).map(([section, items]) => (
                            <div key={section} className="mb-1">
                                <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">{section}</p>
                                {items.map((c) => {
                                    const idx = flat.indexOf(c);
                                    const active = idx === activeIndex;
                                    const Icon = c.icon;
                                    return (
                                        <button
                                            key={c.id}
                                            data-cmd-idx={idx}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            onClick={() => c.run()}
                                            className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                                                active ? "bg-[#0F766E]/10 text-[#0F766E]" : "text-neutral-700 hover:bg-neutral-50"
                                            }`}
                                        >
                                            <Icon className={`h-4 w-4 shrink-0 ${active ? "text-[#0F766E]" : "text-neutral-400"}`} />
                                            <span className="flex-1 text-sm">{c.label}</span>
                                            {c.shortcut && (
                                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                                                    active ? "border-[#0F766E]/30 text-[#0F766E]" : "border-neutral-200 text-neutral-400"
                                                }`}>
                                                    {c.shortcut}
                                                </span>
                                            )}
                                            {active && <ArrowRight className="h-3 w-3 text-[#0F766E]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                {/* 푸터 */}
                <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex items-center gap-3 text-[10px] text-neutral-400">
                    <span><kbd className="font-mono">↑↓</kbd> 이동</span>
                    <span><kbd className="font-mono">↵</kbd> 선택</span>
                    <span><kbd className="font-mono">ESC</kbd> 닫기</span>
                    <span className="ml-auto"><kbd className="font-mono">⌘K</kbd> / <kbd className="font-mono">Ctrl+K</kbd></span>
                </div>
            </div>
        </div>
    );
}
