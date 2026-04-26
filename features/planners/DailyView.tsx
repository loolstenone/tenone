"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, Trash2, Loader2, ArrowDownToLine, GripVertical, Clock, LayoutTemplate, Search, X, Maximize2, Pencil, Eye, Star } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PlannerDaily, PlannerTask } from "@/lib/planners/types";
import { getLunarDate, HOLIDAYS } from "@/lib/planners/holidays";
import { resolveTemplateContent, isSpecialTemplate, tplDataKey } from "@/lib/planners/templates";
import { renderFramework, type FrameworkData } from "./TemplatesView";
import { ThisWeekCard } from "./ThisWeekCard";
import { ExternalEventsBanner } from "./ExternalEventsBanner";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { Track } from "@/lib/analytics";
import { HandNote, type HandNoteData } from "./HandNote";

type TaskStatus = 'todo' | 'done' | 'carried' | 'cancelled';
type CornellRow = { id: string; cue: string; note: string };
type NoteItem = { id: string; type?: 'cornell' | 'template' | 'handwriting'; templateKey?: string; templateLabel?: string; title: string; cue: string; content: string; summary: string; rows: CornellRow[]; handwriting?: HandNoteData };

function localDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Template note block (interactive grid) ──────────────────────────
function TemplateNoteBlock({
    note,
    notesList,
    setNotesList,
    save,
    serializeNotesFn,
    onExpand,
}: {
    note: NoteItem;
    notesList: NoteItem[];
    setNotesList: (v: NoteItem[]) => void;
    save: (fields: Record<string, unknown>) => void;
    serializeNotesFn: (list: NoteItem[]) => string;
    onExpand: () => void;
}) {
    const dataKey = tplDataKey(note.id);
    const [fwData, setFwData] = useState<FrameworkData>(() => {
        if (typeof window === 'undefined') return {};
        try { return JSON.parse(localStorage.getItem(dataKey) || '{}'); }
        catch { return {}; }
    });

    const handleChange = useCallback((k: string, v: string) => {
        setFwData(prev => {
            const next = { ...prev, [k]: v };
            localStorage.setItem(dataKey, JSON.stringify(next));
            return next;
        });
    }, [dataKey]);

    // Determine if this template has an interactive grid
    const tplMeta = { id: note.id, key: note.templateKey ?? '', label: note.title, body_md: note.content };
    const hasGrid = isSpecialTemplate(tplMeta);
    const grid = hasGrid ? renderFramework(tplMeta.key, tplMeta.label, fwData, handleChange) : null;

    return (
        <section className="bg-white border border-violet-200 rounded-xl overflow-hidden">
            {/* Header — 타이틀 직접 편집 가능 */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-violet-100 bg-violet-50/60">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <LayoutTemplate className="h-4 w-4 text-violet-500 shrink-0" />
                    <input
                        value={note.title}
                        onChange={(e) => {
                            const next = notesList.map(n => n.id === note.id ? { ...n, title: e.target.value } : n);
                            setNotesList(next);
                        }}
                        onBlur={() => save({ notes: serializeNotesFn(notesList) })}
                        placeholder={note.templateLabel || "제목을 입력하세요"}
                        title="제목 입력 (예시: 템플릿 이름)"
                        className="text-sm font-semibold text-violet-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-violet-300 focus:bg-white rounded px-1.5 py-0.5 w-full placeholder:text-violet-400 placeholder:font-normal placeholder:italic hover:bg-violet-100/60 transition-colors cursor-text"
                    />
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                    <button
                        onClick={onExpand}
                        className="text-neutral-300 hover:text-violet-600 transition-colors"
                        title="크게 보기"
                    >
                        <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => {
                            const next = notesList.filter(n => n.id !== note.id);
                            setNotesList(next);
                            save({ notes: serializeNotesFn(next) });
                        }}
                        className="text-neutral-300 hover:text-red-400 transition-colors"
                        title="삭제"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
            {/* Body: interactive grid or markdown fallback */}
            {grid ? (
                <div className="px-4 py-3">{grid}</div>
            ) : (
                <div
                    className="px-4 py-3 text-sm text-neutral-900 leading-relaxed min-h-[8rem]
                        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3
                        [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3
                        [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2
                        [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
                        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5
                        [&_strong]:font-semibold
                        [&_table]:w-full [&_table]:border-collapse [&_table]:mb-3 [&_table]:text-xs
                        [&_th]:border [&_th]:border-neutral-200 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-neutral-50 [&_th]:font-semibold
                        [&_td]:border [&_td]:border-neutral-200 [&_td]:px-2 [&_td]:py-1
                        [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
                        [&_blockquote]:border-l-4 [&_blockquote]:border-violet-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-600"
                >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content || "*내용 없음*"}</ReactMarkdown>
                </div>
            )}
        </section>
    );
}

export function DailyView({ initialDate }: { initialDate: string }) {
    const router = useRouter();
    const [date, setDate] = useState(initialDate);
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [notesList, setNotesList] = useState<NoteItem[]>([]);
    const [energy, setEnergy] = useState<number | null>(null);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newTaskText, setNewTaskText] = useState("");
    const [newTaskTime, setNewTaskTime] = useState("");
    const [carrying, setCarrying] = useState(false);
    const [pendingInfo, setPendingInfo] = useState<{ count: number; days: number; oldest: string | null } | null>(null);
    const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [tplList, setTplList] = useState<Array<{ id: string; key: string; category: string; subcategory: string | null; label: string; description: string | null; body_md: string }>>([]);
    const [tplLoading, setTplLoading] = useState(false);
    const [tplQuery, setTplQuery] = useState("");
    const [tplCat, setTplCat] = useState("all");
    const [tplFavs, setTplFavs] = useState<Set<string>>(() => {
        if (typeof window === "undefined") return new Set();
        try { return new Set(JSON.parse(localStorage.getItem("planners_fav_templates") || "[]")); }
        catch { return new Set(); }
    });
    const [expandedNote, setExpandedNote] = useState<NoteItem | null>(null);
    const [editingNoteIds, setEditingNoteIds] = useState<Set<string>>(new Set());

    function toggleEditing(id: string) {
        setEditingNoteIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    // Drag-and-drop state
    const dragIndex = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Weather (today only)
    useEffect(() => {
        if (initialDate !== localDateStr(new Date())) return;
        async function fetchWeather(lat: number, lon: number) {
            try {
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
                );
                if (!res.ok) return;
                const d = await res.json();
                const temp = Math.round(d.current.temperature_2m);
                const code = d.current.weather_code;
                setWeather({ temp, code });
                save({ weather_temp: temp, weather_code: code });
            } catch { /* silent */ }
        }
        async function fallbackToIp() {
            try {
                const r = await fetch("https://ipapi.co/json/");
                if (!r.ok) return;
                const ip = await r.json();
                if (ip.latitude && ip.longitude) fetchWeather(ip.latitude, ip.longitude);
            } catch { /* silent */ }
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => fetchWeather(coords.latitude, coords.longitude),
                () => fallbackToIp()
            );
        } else {
            fallbackToIp();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 누적 미완료 카운트 (과거 60일)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await fetch(`/api/planners/daily/pending-count?date=${date}&days=60`);
            if (cancelled) return;
            if (res.ok) {
                const d = await res.json();
                setPendingInfo({ count: d.count ?? 0, days: d.days ?? 0, oldest: d.oldest ?? null });
            }
        })();
        return () => { cancelled = true; };
    }, [date]);

    // Load daily
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/planners/daily?date=${date}`);
            if (cancelled) return;
            if (res.ok) {
                const data = await res.json();
                if (data.daily) {
                    setTasks(data.daily.tasks || []);
                    // notes 컬럼: JSON 배열 or 구버전 plain string
                    const rawNotes = data.daily.notes;
                    const rawNotes2 = data.daily.notes_secondary;
                    function parseCornellRows(n: Record<string, string>): CornellRow[] {
                        try {
                            const c = JSON.parse(n.content || '{}');
                            if (c._cornell && Array.isArray(c.rows)) return c.rows;
                        } catch { /* fall through */ }
                        return [{ id: 'r1', cue: n.cue ?? '', note: n.content ?? '' }];
                    }
                    let parsed: NoteItem[] = [];
                    try {
                        const attempt = JSON.parse(rawNotes || "[]");
                        if (Array.isArray(attempt)) {
                            parsed = attempt.map((n: Record<string, unknown>) => {
                                const rawType = n.type as string | undefined;
                                const type = (rawType === 'template' ? 'template' : rawType === 'handwriting' ? 'handwriting' : 'cornell') as 'cornell' | 'template' | 'handwriting';
                                return {
                                    id: String(n.id),
                                    type,
                                    templateKey: typeof n.templateKey === 'string' ? n.templateKey : '',
                                    templateLabel: typeof n.templateLabel === 'string' ? n.templateLabel : undefined,
                                    title: typeof n.title === 'string' ? n.title : "",
                                    cue: typeof n.cue === 'string' ? n.cue : "",
                                    content: typeof n.content === 'string' ? n.content : "",
                                    summary: typeof n.summary === 'string' ? n.summary : "",
                                    rows: type === 'cornell' ? parseCornellRows(n as Record<string, string>) : [],
                                    handwriting: type === 'handwriting' && n.handwriting && typeof n.handwriting === 'object' ? n.handwriting as HandNoteData : undefined,
                                };
                            });
                        } else {
                            parsed = rawNotes ? [{ id: 'n1', type: 'cornell' as const, title: 'Note 1', cue: '', content: rawNotes, summary: '', rows: [{ id: 'r1', cue: '', note: rawNotes }] }] : [];
                        }
                    } catch {
                        parsed = rawNotes ? [{ id: 'n1', type: 'cornell' as const, title: 'Note 1', cue: '', content: rawNotes, summary: '', rows: [{ id: 'r1', cue: '', note: rawNotes }] }] : [];
                    }
                    if (rawNotes2 && !parsed.find(n => n.id === 'n2')) {
                        parsed.push({ id: 'n2', type: 'cornell', title: 'Note 2', cue: '', content: rawNotes2, summary: '', rows: [{ id: 'r1', cue: '', note: rawNotes2 }] });
                    }
                    setNotesList(parsed);
                    setEnergy(data.daily.energy_level);
                    setResult(data.daily.daily_result || "");
                    if (data.daily.weather_temp != null && data.daily.weather_code != null) {
                        setWeather({ temp: data.daily.weather_temp, code: data.daily.weather_code });
                    }
                } else {
                    setTasks([]);
                    setNotesList([]);
                    setEnergy(null);
                    setResult("");
                }
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [date]);

    async function save(patch: Partial<PlannerDaily>) {
        setSaving(true);
        try {
            await fetch(`/api/planners/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, ...patch }),
            });
        } finally {
            setSaving(false);
        }
    }

    async function carryOverPending() {
        setCarrying(true);
        try {
            const res = await fetch(`/api/planners/daily/carry-over`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, days: 60 }),
            });
            if (res.ok) {
                const d = await res.json();
                if (d.carried > 0) {
                    const r2 = await fetch(`/api/planners/daily?date=${date}`);
                    if (r2.ok) {
                        const data = await r2.json();
                        if (data.daily) setTasks(data.daily.tasks || []);
                    }
                    Track.carryOverPending({ count: d.carried, days: (d.from_days?.length ?? 0) });
                }
                setPendingInfo({ count: 0, days: 0, oldest: null });
            }
        } finally { setCarrying(false); }
    }

    function addTask() {
        if (!newTaskText.trim()) return;
        const newTask: PlannerTask = {
            id: `t_${Date.now()}`,
            text: newTaskText.trim(),
            status: 'todo',
            time: newTaskTime.trim() || null,
        };
        const next = [...tasks, newTask];
        setTasks(next);
        setNewTaskText("");
        setNewTaskTime("");
        save({ tasks: next });
    }

    function cycleStatus(taskId: string) {
        const order: TaskStatus[] = ['todo', 'done', 'carried', 'cancelled'];
        const next = tasks.map(t => {
            if (t.id !== taskId) return t;
            const idx = order.indexOf(t.status as TaskStatus);
            return { ...t, status: order[(idx + 1) % order.length] };
        });
        setTasks(next);
        save({ tasks: next });
    }

    function removeTask(taskId: string) {
        const next = tasks.filter(t => t.id !== taskId);
        setTasks(next);
        save({ tasks: next });
    }

    function updateTaskTime(taskId: string, time: string) {
        const next = tasks.map(t => t.id === taskId ? { ...t, time: time || null } : t);
        setTasks(next);
        save({ tasks: next });
    }

    // Drag-and-drop handlers
    function onDragStart(index: number) {
        dragIndex.current = index;
    }
    function onDragOver(e: React.DragEvent, index: number) {
        e.preventDefault();
        setDragOverIndex(index);
    }
    function onDrop(index: number) {
        const from = dragIndex.current;
        if (from === null || from === index) {
            dragIndex.current = null;
            setDragOverIndex(null);
            return;
        }
        const next = [...tasks];
        const [removed] = next.splice(from, 1);
        next.splice(index, 0, removed);
        setTasks(next);
        save({ tasks: next });
        dragIndex.current = null;
        setDragOverIndex(null);
    }
    function onDragEnd() {
        dragIndex.current = null;
        setDragOverIndex(null);
    }

    async function openTemplatePicker() {
        setShowTemplatePicker(true);
        setTplQuery("");
        setTplCat("all");
        if (tplList.length === 0) {
            setTplLoading(true);
            try {
                const res = await fetch("/api/planners/templates");
                if (res.ok) {
                    const d = await res.json();
                    setTplList(d.templates || []);
                }
            } finally {
                setTplLoading(false);
            }
        }
    }

    function toggleFav(id: string) {
        setTplFavs(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            try { localStorage.setItem("planners_fav_templates", JSON.stringify([...next])); } catch { /* ignore */ }
            return next;
        });
    }

    function serializeNotes(list: NoteItem[]): string {
        return JSON.stringify(list.map(n => {
            if (n.type === 'template') {
                return { id: n.id, type: n.type, templateKey: n.templateKey, templateLabel: n.templateLabel, title: n.title, cue: n.cue, content: n.content, summary: n.summary };
            }
            if (n.type === 'handwriting') {
                return { id: n.id, type: n.type, title: n.title, cue: '', content: '', summary: n.summary, handwriting: n.handwriting ?? { strokes: [], width: 600, height: 320 } };
            }
            return { id: n.id, type: n.type ?? 'cornell', title: n.title, cue: '', content: JSON.stringify({ _cornell: true, rows: n.rows }), summary: n.summary };
        }));
    }

    function insertTemplate(tpl: { id: string; key: string; label: string; body_md: string }) {
        const newNote: NoteItem = {
            id: `n_${Date.now()}`,
            type: 'template' as const,
            templateKey: tpl.key,
            templateLabel: tpl.label,
            title: "",
            cue: "",
            content: resolveTemplateContent(tpl),
            summary: "",
            rows: [],
        };
        const next = [...notesList, newNote];
        setNotesList(next);
        save({ notes: serializeNotes(next) });
        setShowTemplatePicker(false);
        Track.templateInsert({ template_key: tpl.key, template_label: tpl.label, surface: "daily" });
    }

    function navigateDate(deltaDays: number) {
        const d = new Date(date + "T00:00:00");
        d.setDate(d.getDate() + deltaDays);
        const newDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        setDate(newDate);
        router.replace(`/planners/app/daily?date=${newDate}`);
    }

    const weekday = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', { weekday: 'long' });
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const isToday = date === localDateStr(new Date());
    const lunar = getLunarDate(date);

    function weatherEmoji(code: number) {
        if (code === 0) return "☀️";
        if (code <= 2) return "🌤️";
        if (code <= 3) return "☁️";
        if (code <= 48) return "🌫️";
        if (code <= 57) return "🌧️";
        if (code <= 67) return "🌧️";
        if (code <= 77) return "❄️";
        if (code <= 82) return "🌦️";
        if (code <= 86) return "🌨️";
        if (code <= 99) return "⛈️";
        return "🌡️";
    }

    return (
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigateDate(-1)}
                            className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2">
                            <h1 className="font-serif text-3xl text-neutral-900">
                                {formattedDate}
                            </h1>
                            {isToday && (
                                <span className="px-2 py-0.5 bg-[#0F766E] text-white text-xs font-semibold rounded-full">
                                    Today
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => navigateDate(1)}
                            className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1 flex items-center gap-2">
                        {weather && (
                            <span className="text-neutral-600">
                                {weatherEmoji(weather.code)} {weather.temp}°C
                            </span>
                        )}
                        <span>{weekday}</span>
                        {HOLIDAYS[date] && (
                            <span className={`text-xs font-medium ${
                                HOLIDAYS[date].type === 'holiday' ? 'text-rose-400' :
                                HOLIDAYS[date].type === 'memorial' ? 'text-rose-300' :
                                'text-neutral-400'
                            }`}>
                                {HOLIDAYS[date].label}
                            </span>
                        )}
                        {lunar && (
                            <span className="text-neutral-300">
                                음력 {lunar.isLeap ? "윤" : ""}{lunar.month}월 {lunar.day}일
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <PlannersUtilityLinks />
                    {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                </div>
            </div>

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Tasks (col 2) */}
                    <div className="md:col-span-2 space-y-4">
                        <ExternalEventsBanner date={date} />
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xs text-neutral-400 flex items-center gap-1.5 flex-wrap">
                                    <span className="uppercase tracking-widest">Tasks</span>
                                    <span className="text-neutral-300 font-normal normal-case tracking-normal">
                                        ( · 미완 | <span className="font-mono">V</span> 완료 | <span className="font-mono">→</span> 이월 | <span className="font-mono">X</span> 취소 )
                                    </span>
                                </h2>
                                {pendingInfo && pendingInfo.count > 0 && (
                                    <button
                                        onClick={carryOverPending}
                                        disabled={carrying}
                                        title={pendingInfo.oldest
                                            ? `${pendingInfo.oldest} 부터 누적된 미완료 ${pendingInfo.count}건 (${pendingInfo.days}일) 을 오늘로 이월`
                                            : `누적 미완료 ${pendingInfo.count}건 이월`}
                                        className="flex items-center gap-1 text-[10px] px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 transition-colors disabled:opacity-50"
                                    >
                                        {carrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowDownToLine className="h-3 w-3" />}
                                        누적 미완료 {pendingInfo.count}건 이월
                                    </button>
                                )}
                            </div>

                            <div className="space-y-0.5">
                                {tasks.length === 0 && (
                                    <p className="text-sm text-neutral-400 py-2">오늘의 할 일을 추가해 보세요.</p>
                                )}
                                {tasks.map((t, index) => (
                                    <TaskRow
                                        key={t.id}
                                        task={t}
                                        index={index}
                                        isDragOver={dragOverIndex === index}
                                        onCycle={() => cycleStatus(t.id)}
                                        onRemove={() => removeTask(t.id)}
                                        onTimeChange={(time) => updateTaskTime(t.id, time)}
                                        onDragStart={() => onDragStart(index)}
                                        onDragOver={(e) => onDragOver(e, index)}
                                        onDrop={() => onDrop(index)}
                                        onDragEnd={onDragEnd}
                                    />
                                ))}
                            </div>

                            {/* Add task row */}
                            <div className="mt-3 pt-3 border-t border-neutral-100">
                                <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-neutral-400 shrink-0" />
                                    <input
                                        type="time"
                                        value={newTaskTime}
                                        onChange={(e) => setNewTaskTime(e.target.value)}
                                        className="text-xs text-neutral-500 w-[72px] focus:outline-none bg-transparent border border-neutral-200 rounded px-1 py-0.5"
                                    />
                                    <input
                                        type="text"
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
                                        placeholder="할 일 입력 후 Enter"
                                        className="flex-1 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent"
                                    />
                                </div>
                                <p className="text-[10px] text-neutral-400 mt-2">좌측 핸들로 순서 변경 · 클릭으로 상태 전환</p>
                            </div>
                        </section>

                        {/* Notes */}
                        {notesList.map((note) => note.type === 'template' ? (
                            /* Template block */
                            <TemplateNoteBlock
                                key={note.id}
                                note={note}
                                notesList={notesList}
                                setNotesList={setNotesList}
                                save={save}
                                serializeNotesFn={serializeNotes}
                                onExpand={() => setExpandedNote(note)}
                            />
                        ) : note.type === 'handwriting' ? (
                            /* Handwriting block */
                            <section key={note.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-neutral-200 bg-neutral-50">
                                    <input
                                        value={note.title}
                                        onChange={(e) => {
                                            const next = notesList.map(n => n.id === note.id ? { ...n, title: e.target.value } : n);
                                            setNotesList(next);
                                        }}
                                        onBlur={() => save({ notes: serializeNotes(notesList) })}
                                        placeholder="손글씨 노트 제목"
                                        className="text-xs font-semibold uppercase tracking-wider text-neutral-500 bg-transparent focus:outline-none w-full placeholder:text-neutral-300"
                                    />
                                    <div className="flex items-center gap-1 ml-2 shrink-0">
                                        <button
                                            onClick={() => setExpandedNote(note)}
                                            className="text-neutral-300 hover:text-neutral-600 transition-colors"
                                            title="크게 보기"
                                        >
                                            <Maximize2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const next = notesList.filter(n => n.id !== note.id);
                                                setNotesList(next);
                                                save({ notes: serializeNotes(next) });
                                            }}
                                            className="text-neutral-300 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <HandNote
                                        value={note.handwriting ?? null}
                                        onChange={(d) => {
                                            const next = notesList.map(n => n.id === note.id ? { ...n, handwriting: d } : n);
                                            setNotesList(next);
                                            save({ notes: serializeNotes(next) });
                                        }}
                                        height={300}
                                    />
                                </div>
                            </section>
                        ) : (
                            /* Cornell Note block */
                            <section key={note.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                                {/* Title row */}
                                <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-neutral-200 bg-neutral-50">
                                    <input
                                        value={note.title}
                                        onChange={(e) => {
                                            const next = notesList.map(n => n.id === note.id ? { ...n, title: e.target.value } : n);
                                            setNotesList(next);
                                        }}
                                        onBlur={() => save({ notes: serializeNotes(notesList) })}
                                        placeholder="제목"
                                        className="text-xs font-semibold uppercase tracking-wider text-neutral-500 bg-transparent focus:outline-none w-full placeholder:text-neutral-300"
                                    />
                                    <div className="flex items-center gap-1 ml-2 shrink-0">
                                        <button
                                            onClick={() => setExpandedNote(note)}
                                            className="text-neutral-300 hover:text-neutral-600 transition-colors"
                                        >
                                            <Maximize2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const next = notesList.filter(n => n.id !== note.id);
                                                setNotesList(next);
                                                save({ notes: serializeNotes(next) });
                                            }}
                                            className="text-neutral-300 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Cornell rows */}
                                <div className="divide-y divide-neutral-100">
                                    {note.rows.map((row, rIdx) => (
                                        <div key={row.id} className="flex group/row">
                                            {/* Delete button — always rendered, invisible when only 1 row */}
                                            <button
                                                onClick={() => {
                                                    if (note.rows.length <= 1) return;
                                                    const rows = note.rows.filter((_, i) => i !== rIdx);
                                                    const next = notesList.map(n => n.id === note.id ? { ...n, rows } : n);
                                                    setNotesList(next);
                                                    save({ notes: serializeNotes(next) });
                                                }}
                                                className={`shrink-0 w-6 flex items-start justify-center pt-2.5 transition-colors text-neutral-300 hover:text-red-400 ${note.rows.length <= 1 ? 'invisible' : ''}`}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                            {/* Cue cell */}
                                            <div className="w-[22%] shrink-0 relative border-l border-neutral-200">
                                                <div aria-hidden className="invisible whitespace-pre-wrap break-words text-xs px-3 py-2 leading-relaxed min-h-[2.5rem]">{row.cue + '\n'}</div>
                                                <textarea
                                                    value={row.cue}
                                                    onChange={(e) => {
                                                        const rows = note.rows.map((r, i) => i === rIdx ? { ...r, cue: e.target.value } : r);
                                                        const next = notesList.map(n => n.id === note.id ? { ...n, rows } : n);
                                                        setNotesList(next);
                                                    }}
                                                    onBlur={() => save({ notes: serializeNotes(notesList) })}
                                                    placeholder="키워드"
                                                    className="absolute inset-0 w-full h-full text-xs text-neutral-600 placeholder:text-neutral-300 focus:outline-none bg-transparent resize-none px-3 py-2 leading-relaxed"
                                                />
                                            </div>
                                            {/* Note cell */}
                                            <div className="flex-1 relative border-l border-neutral-200">
                                                <div aria-hidden className="invisible whitespace-pre-wrap break-words text-sm px-4 py-2 leading-relaxed min-h-[2.5rem]">{row.note + '\n'}</div>
                                                <textarea
                                                    value={row.note}
                                                    onChange={(e) => {
                                                        const rows = note.rows.map((r, i) => i === rIdx ? { ...r, note: e.target.value } : r);
                                                        const next = notesList.map(n => n.id === note.id ? { ...n, rows } : n);
                                                        setNotesList(next);
                                                    }}
                                                    onBlur={() => save({ notes: serializeNotes(notesList) })}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            const newRow: CornellRow = { id: `r_${Date.now()}`, cue: '', note: '' };
                                                            const rows = [...note.rows.slice(0, rIdx + 1), newRow, ...note.rows.slice(rIdx + 1)];
                                                            const next = notesList.map(n => n.id === note.id ? { ...n, rows } : n);
                                                            setNotesList(next);
                                                        } else if (e.key === 'Backspace' && row.note === '' && row.cue === '' && rIdx > 0) {
                                                            e.preventDefault();
                                                            const rows = note.rows.filter((_, i) => i !== rIdx);
                                                            const next = notesList.map(n => n.id === note.id ? { ...n, rows } : n);
                                                            setNotesList(next);
                                                            save({ notes: serializeNotes(next) });
                                                        }
                                                    }}
                                                    placeholder={rIdx === 0 ? "자유롭게 기록…" : ""}
                                                    className="absolute inset-0 w-full h-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none px-4 py-2 leading-relaxed"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Add row */}
                                <div className="border-t border-dashed border-neutral-200">
                                    <button
                                        onClick={() => {
                                            const rows = [...note.rows, { id: `r_${Date.now()}`, cue: '', note: '' }];
                                            const next = notesList.map(n => n.id === note.id ? { ...n, rows } : n);
                                            setNotesList(next);
                                        }}
                                        className="w-full py-1.5 text-[10px] text-neutral-300 hover:text-[#0F766E] transition-colors"
                                    >
                                        + 행 추가
                                    </button>
                                </div>

                                {/* Summary row */}
                                <div className="border-t border-neutral-200 bg-neutral-50/40">
                                    <p className="px-4 pt-2 pb-0.5 text-[9px] uppercase tracking-widest text-neutral-300 font-semibold">요약</p>
                                    <textarea
                                        value={note.summary}
                                        onChange={(e) => {
                                            const next = notesList.map(n => n.id === note.id ? { ...n, summary: e.target.value } : n);
                                            setNotesList(next);
                                        }}
                                        onBlur={() => save({ notes: serializeNotes(notesList) })}
                                        placeholder="핵심을 한두 줄로 요약…"
                                        rows={2}
                                        className="w-full text-xs text-neutral-700 placeholder:text-neutral-300 focus:outline-none bg-transparent resize-none px-4 py-1 pb-3 leading-relaxed"
                                    />
                                </div>
                            </section>
                        ))}

                        {/* Add note buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const next: NoteItem[] = [...notesList, { id: `n_${Date.now()}`, type: 'cornell', title: `Note ${notesList.length + 1}`, cue: "", content: "", summary: "", rows: [{ id: 'r1', cue: '', note: '' }] }];
                                    setNotesList(next);
                                    save({ notes: serializeNotes(next) });
                                }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 border border-dashed border-neutral-300 rounded-xl text-sm text-neutral-400 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                노트 추가
                            </button>
                            <button
                                onClick={() => {
                                    const next: NoteItem[] = [...notesList, { id: `n_${Date.now()}`, type: 'handwriting', title: `손글씨 ${notesList.length + 1}`, cue: "", content: "", summary: "", rows: [], handwriting: { strokes: [], width: 600, height: 300 } }];
                                    setNotesList(next);
                                    save({ notes: serializeNotes(next) });
                                }}
                                title="Apple Pencil · S Pen · 마우스로 직접 쓰기"
                                className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-neutral-300 rounded-xl text-sm text-neutral-400 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
                            >
                                <Pencil className="h-4 w-4" />
                                손글씨
                            </button>
                            <button
                                onClick={openTemplatePicker}
                                className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-neutral-300 rounded-xl text-sm text-neutral-400 hover:border-violet-400 hover:text-violet-600 transition-colors"
                            >
                                <LayoutTemplate className="h-4 w-4" />
                                템플릿
                            </button>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Energy</h2>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => {
                                            setEnergy(n);
                                            save({ energy_level: n });
                                        }}
                                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                                            energy && n <= energy
                                                ? "bg-[#0F766E] text-white"
                                                : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3">오늘의 한 줄 결과</h2>
                            <textarea
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                                onBlur={() => save({ daily_result: result })}
                                placeholder="오늘 어떤 성취가 있었나요?"
                                rows={4}
                                className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none"
                            />
                        </section>

                        <ThisWeekCard date={date} />
                    </div>
                </div>
            )}

            {/* Note Expand Modal */}
            {expandedNote && (() => {
                const isTpl = expandedNote.type === 'template';
                const isHand = expandedNote.type === 'handwriting';
                const tplMeta = isTpl ? { id: expandedNote.id, key: expandedNote.templateKey ?? '', label: expandedNote.title, body_md: expandedNote.content } : null;
                const tplHasGrid = tplMeta ? isSpecialTemplate(tplMeta) : false;
                const dataKey = tplMeta ? tplDataKey(expandedNote.id) : '';
                function saveAndClose() {
                    const next = notesList.map(n => n.id === expandedNote!.id ? expandedNote! : n);
                    setNotesList(next);
                    save({ notes: serializeNotes(next) });
                    setExpandedNote(null);
                }
                return (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-[5vh_5vw]">
                        <div className={`bg-white rounded-xl w-full h-full flex flex-col shadow-2xl overflow-hidden ${isTpl ? 'border-t-4 border-violet-400' : ''}`}>
                            {/* Header */}
                            <div className={`px-6 py-3 border-b border-neutral-200 flex items-center gap-3 ${isTpl ? 'bg-violet-50' : 'bg-neutral-50'}`}>
                                {isTpl && <LayoutTemplate className="h-4 w-4 text-violet-400 shrink-0" />}
                                <input
                                    type="text"
                                    value={expandedNote.title}
                                    onChange={(e) => setExpandedNote({ ...expandedNote, title: e.target.value })}
                                    placeholder="제목"
                                    className={`flex-1 text-base font-semibold bg-transparent focus:outline-none ${isTpl ? 'text-violet-700' : 'text-neutral-900'} placeholder:text-neutral-400`}
                                />
                                <button
                                    onClick={() => saveAndClose()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors"
                                >
                                    저장 후 닫기
                                </button>
                            </div>
                            {/* Body */}
                            {isHand ? (
                                <div className="flex-1 overflow-auto p-6 bg-neutral-50/30">
                                    <HandNote
                                        value={expandedNote.handwriting ?? null}
                                        onChange={(d) => setExpandedNote({ ...expandedNote, handwriting: d })}
                                        height={Math.max(600, expandedNote.handwriting?.height ?? 600)}
                                    />
                                </div>
                            ) : isTpl && tplHasGrid && tplMeta ? (
                                <div className="flex-1 overflow-auto p-6 bg-violet-50/20">
                                    {renderFramework(
                                        tplMeta.key,
                                        tplMeta.label,
                                        (() => {
                                            try { return JSON.parse(localStorage.getItem(dataKey) || '{}'); }
                                            catch { return {}; }
                                        })(),
                                        (k, v) => {
                                            const cur = (() => {
                                                try { return JSON.parse(localStorage.getItem(dataKey) || '{}'); }
                                                catch { return {}; }
                                            })();
                                            const next = { ...cur, [k]: v };
                                            localStorage.setItem(dataKey, JSON.stringify(next));
                                        }
                                    )}
                                </div>
                            ) : isTpl ? (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="px-6 py-2 border-b border-violet-100 bg-violet-50/40 flex items-center gap-2">
                                        <button
                                            onClick={() => toggleEditing(`modal_${expandedNote.id}`)}
                                            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 transition-colors"
                                        >
                                            {editingNoteIds.has(`modal_${expandedNote.id}`) ? (
                                                <><Eye className="h-3.5 w-3.5" /> 미리보기</>
                                            ) : (
                                                <><Pencil className="h-3.5 w-3.5" /> 편집</>
                                            )}
                                        </button>
                                    </div>
                                    {editingNoteIds.has(`modal_${expandedNote.id}`) ? (
                                        <div className="flex-1 p-6 overflow-auto">
                                            <textarea
                                                value={expandedNote.content}
                                                onChange={(e) => setExpandedNote({ ...expandedNote, content: e.target.value })}
                                                placeholder="내용을 입력하세요…"
                                                className="w-full h-full text-sm text-neutral-900 focus:outline-none bg-transparent resize-none font-mono leading-relaxed"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => toggleEditing(`modal_${expandedNote.id}`)}
                                            className="flex-1 p-6 overflow-auto text-sm text-neutral-900 leading-relaxed cursor-text
                                                [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3
                                                [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-3
                                                [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2
                                                [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
                                                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5
                                                [&_strong]:font-semibold
                                                [&_table]:w-full [&_table]:border-collapse [&_table]:mb-3 [&_table]:text-xs
                                                [&_th]:border [&_th]:border-neutral-200 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-neutral-50 [&_th]:font-semibold
                                                [&_td]:border [&_td]:border-neutral-200 [&_td]:px-2 [&_td]:py-1
                                                [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
                                                [&_blockquote]:border-l-4 [&_blockquote]:border-violet-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-neutral-600"
                                        >
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{expandedNote.content || "*내용 없음*"}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    {/* Column headers */}
                                    <div className="flex divide-x divide-neutral-200 border-b border-neutral-100 shrink-0">
                                        <p className="w-[22%] shrink-0 px-4 py-2 text-[9px] uppercase tracking-widest text-neutral-300 font-semibold">단서 · 키워드</p>
                                        <div className="flex-1 flex items-center justify-between px-4 py-2">
                                            <p className="text-[9px] uppercase tracking-widest text-neutral-300 font-semibold">노트</p>
                                            <p className="text-[9px] text-neutral-300 hidden sm:block">
                                                <kbd className="font-mono">Enter</kbd> 새 주제 &nbsp;·&nbsp; <kbd className="font-mono">Shift+Enter</kbd> 줄바꿈
                                            </p>
                                        </div>
                                    </div>
                                    {/* Rows */}
                                    <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
                                        {(expandedNote.rows ?? []).map((row, rIdx) => (
                                            <div key={row.id} className="flex group/row">
                                                {/* Delete button — always rendered, invisible when only 1 row */}
                                                <button
                                                    onClick={() => {
                                                        if ((expandedNote.rows ?? []).length <= 1) return;
                                                        const rows = (expandedNote.rows ?? []).filter((_, i) => i !== rIdx);
                                                        setExpandedNote({ ...expandedNote, rows });
                                                    }}
                                                    className={`shrink-0 w-6 flex items-start justify-center pt-3.5 transition-colors text-neutral-300 hover:text-red-400 ${(expandedNote.rows ?? []).length <= 1 ? 'invisible' : ''}`}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                                {/* Cue cell */}
                                                <div className="w-[22%] shrink-0 relative border-l border-neutral-200">
                                                    <div aria-hidden className="invisible whitespace-pre-wrap break-words text-sm px-4 py-3 leading-relaxed min-h-[3rem]">{row.cue + '\n'}</div>
                                                    <textarea
                                                        value={row.cue}
                                                        onChange={(e) => {
                                                            const rows = (expandedNote.rows ?? []).map((r, i) => i === rIdx ? { ...r, cue: e.target.value } : r);
                                                            setExpandedNote({ ...expandedNote, rows });
                                                        }}
                                                        placeholder="키워드"
                                                        className="absolute inset-0 w-full h-full text-sm text-neutral-600 placeholder:text-neutral-300 focus:outline-none bg-transparent resize-none px-4 py-3 leading-relaxed"
                                                    />
                                                </div>
                                                {/* Note cell */}
                                                <div className="flex-1 relative border-l border-neutral-200">
                                                    <div aria-hidden className="invisible whitespace-pre-wrap break-words text-sm px-4 py-3 leading-relaxed min-h-[3rem]">{row.note + '\n'}</div>
                                                    <textarea
                                                        value={row.note}
                                                        onChange={(e) => {
                                                            const rows = (expandedNote.rows ?? []).map((r, i) => i === rIdx ? { ...r, note: e.target.value } : r);
                                                            setExpandedNote({ ...expandedNote, rows });
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                const newRow: CornellRow = { id: `r_${Date.now()}`, cue: '', note: '' };
                                                                const rows = [...(expandedNote.rows ?? []).slice(0, rIdx + 1), newRow, ...(expandedNote.rows ?? []).slice(rIdx + 1)];
                                                                setExpandedNote({ ...expandedNote, rows });
                                                            }
                                                        }}
                                                        placeholder={rIdx === 0 ? "자유롭게 기록…" : ""}
                                                        className="absolute inset-0 w-full h-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none bg-transparent resize-none px-4 py-3 leading-relaxed"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Add row */}
                                    <div className="border-t border-dashed border-neutral-200 shrink-0">
                                        <button
                                            onClick={() => {
                                                const rows = [...(expandedNote.rows ?? []), { id: `r_${Date.now()}`, cue: '', note: '' }];
                                                setExpandedNote({ ...expandedNote, rows });
                                            }}
                                            className="w-full py-1.5 text-[10px] text-neutral-300 hover:text-[#0F766E] transition-colors"
                                        >
                                            + 행 추가
                                        </button>
                                    </div>
                                    {/* Summary */}
                                    <div className="border-t border-neutral-200 bg-neutral-50/40 shrink-0">
                                        <p className="px-4 pt-2 pb-0.5 text-[9px] uppercase tracking-widest text-neutral-300 font-semibold">요약</p>
                                        <textarea
                                            value={expandedNote.summary}
                                            onChange={(e) => setExpandedNote({ ...expandedNote, summary: e.target.value })}
                                            placeholder="핵심을 한두 줄로 요약…"
                                            rows={3}
                                            className="w-full text-sm text-neutral-700 placeholder:text-neutral-300 focus:outline-none bg-transparent resize-none px-4 py-2 pb-4 leading-relaxed"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* Template Picker Modal */}
            {showTemplatePicker && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4" onClick={() => setShowTemplatePicker(false)}>
                    <div className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[80vh] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 shrink-0">
                            <div className="flex items-center gap-2">
                                <LayoutTemplate className="h-4 w-4 text-violet-600" />
                                <span className="font-semibold text-sm text-neutral-900">템플릿으로 노트 추가</span>
                            </div>
                            <button onClick={() => setShowTemplatePicker(false)} className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors">닫기</button>
                        </div>

                        {/* Search + Filter */}
                        <div className="px-5 pt-3 pb-2 shrink-0 space-y-2">
                            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2">
                                <Search className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                <input
                                    value={tplQuery}
                                    onChange={(e) => setTplQuery(e.target.value)}
                                    placeholder="템플릿 검색…"
                                    autoFocus
                                    className="flex-1 text-sm bg-transparent focus:outline-none text-neutral-900 placeholder:text-neutral-400"
                                />
                            </div>
                            <div className="flex gap-1 overflow-x-auto">
                                {["all", "favs", "framework", "schedule", "note"].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setTplCat(c)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                            tplCat === c
                                                ? c === "favs" ? "bg-amber-500 text-white"
                                                : c === "framework" ? "bg-violet-600 text-white"
                                                : c === "schedule" ? "bg-teal-600 text-white"
                                                : c === "note" ? "bg-amber-500 text-white"
                                                : "bg-neutral-900 text-white"
                                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                        }`}
                                    >
                                        {c === "all" ? "전체" : c === "favs" ? "⭐ 즐겨찾기" : c === "framework" ? "FrameWorkBook" : c === "schedule" ? "Schedule" : "Note"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 px-5 pb-5">
                            {tplLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                                </div>
                            ) : (() => {
                                const filtered = tplList.filter(t => {
                                    if (tplCat === "favs" && !tplFavs.has(t.id)) return false;
                                    if (tplCat !== "all" && tplCat !== "favs" && t.category !== tplCat) return false;
                                    if (tplQuery) {
                                        const q = tplQuery.toLowerCase();
                                        return t.label.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);
                                    }
                                    return true;
                                });
                                if (filtered.length === 0) return (
                                    <p className="text-sm text-neutral-400 text-center py-8">
                                        {tplCat === "favs" ? "즐겨찾기한 템플릿이 없습니다" : "템플릿이 없습니다"}
                                    </p>
                                );
                                return (
                                    <div className="space-y-1.5 mt-1">
                                        {filtered.map(tpl => {
                                            const barColor = tpl.category === "framework" ? "bg-violet-500" : tpl.category === "schedule" ? "bg-teal-500" : "bg-amber-400";
                                            const isFav = tplFavs.has(tpl.id);
                                            return (
                                                <div key={tpl.id} className="flex items-stretch gap-0">
                                                    <button
                                                        onClick={() => insertTemplate(tpl)}
                                                        className="flex-1 text-left flex items-start gap-3 p-3 rounded-l-xl border border-r-0 border-neutral-200 hover:border-violet-300 hover:bg-violet-50/40 transition-colors group"
                                                    >
                                                        <div className={`w-1 self-stretch rounded-full shrink-0 ${barColor}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-neutral-900 group-hover:text-violet-700 transition-colors">
                                                                {tpl.label}
                                                            </p>
                                                            {tpl.description && (
                                                                <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{tpl.description}</p>
                                                            )}
                                                            {tpl.subcategory && (
                                                                <span className="inline-block mt-1 text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                                                                    {tpl.subcategory}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Plus className="h-4 w-4 text-neutral-300 group-hover:text-violet-500 shrink-0 mt-0.5 transition-colors" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleFav(tpl.id)}
                                                        className={`px-3 border border-neutral-200 rounded-r-xl transition-colors ${
                                                            isFav ? "bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100" : "text-neutral-300 hover:text-amber-400 hover:bg-amber-50"
                                                        }`}
                                                        title={isFav ? "즐겨찾기 해제" : "즐겨찾기"}
                                                    >
                                                        <Star className={`h-3.5 w-3.5 ${isFav ? "fill-amber-400" : ""}`} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface TaskRowProps {
    task: PlannerTask;
    index: number;
    isDragOver: boolean;
    onCycle: () => void;
    onRemove: () => void;
    onTimeChange: (time: string) => void;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    onDragEnd: () => void;
}

function TaskRow({ task, isDragOver, onCycle, onRemove, onTimeChange, onDragStart, onDragOver, onDrop, onDragEnd }: TaskRowProps) {
    const [editingTime, setEditingTime] = useState(false);
    const strike = task.status === 'done' || task.status === 'cancelled';

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            className={`group flex items-center gap-2 py-1.5 rounded transition-colors ${
                isDragOver ? "bg-neutral-50 border-t-2 border-[#0F766E]" : ""
            }`}
        >
            {/* Drag handle */}
            <button className="cursor-grab text-neutral-300 hover:text-neutral-500 shrink-0 touch-none">
                <GripVertical className="h-3.5 w-3.5" />
            </button>

            {/* Status button */}
            <button
                onClick={onCycle}
                title="클릭: 미완 → 완료 → 이월 → 취소"
                className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                    task.status === 'done'
                        ? "bg-[#0F766E] border-[#0F766E] text-white"
                        : task.status === 'carried'
                        ? "bg-amber-500 border-amber-500 text-white"
                        : task.status === 'cancelled'
                        ? "bg-neutral-300 border-neutral-300 text-white"
                        : "border-neutral-300 text-neutral-300 hover:border-[#0F766E] hover:text-[#0F766E]"
                }`}
            >
                {task.status === 'done' ? 'V' : task.status === 'carried' ? '→' : task.status === 'cancelled' ? 'X' : '·'}
            </button>

            {/* Time badge */}
            {editingTime ? (
                <input
                    type="time"
                    defaultValue={task.time || ""}
                    autoFocus
                    onBlur={(e) => {
                        onTimeChange(e.target.value);
                        setEditingTime(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                            onTimeChange((e.target as HTMLInputElement).value);
                            setEditingTime(false);
                        }
                    }}
                    className="text-xs w-[68px] border border-[#0F766E] rounded px-1 py-0.5 focus:outline-none"
                />
            ) : (
                <button
                    onClick={() => setEditingTime(true)}
                    className={`text-xs shrink-0 px-1.5 py-0.5 rounded transition-colors ${
                        task.time
                            ? "text-[#0F766E] bg-[#0F766E]/10 hover:bg-[#0F766E]/20"
                            : "text-neutral-300 hover:text-neutral-400"
                    }`}
                    title="시간 설정"
                >
                    {task.time ? task.time.slice(0, 5) : <Clock className="h-3 w-3" />}
                </button>
            )}

            {/* Task text */}
            <span className={`flex-1 text-sm ${strike ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                {task.text}
            </span>

            {/* Remove */}
            <button
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-500 transition-opacity shrink-0"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
