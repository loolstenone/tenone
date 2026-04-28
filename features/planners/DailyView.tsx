"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, Trash2, Loader2, ArrowDownToLine, GripVertical, Clock, LayoutTemplate, Search, X, Maximize2, Pencil, Eye, Star, Image as ImageIcon, Sparkles, MapPin, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PlannerDaily, PlannerTask } from "@/lib/planners/types";
import { getLunarDate, HOLIDAYS } from "@/lib/planners/holidays";
import { resolveTemplateContent, isSpecialTemplate, tplDataKey } from "@/lib/planners/templates";
import { CalendarEntryEditor } from "./CalendarEntryEditor";
import { DailyMomentsAuto } from "./DailyMoments";
import { DailyProjectsCard } from "./DailyProjectsCard";
import { useSwipeNav } from "./useSwipeNav";
import { DailyMiniMonth } from "./DailyMiniMonth";
import { expandOccurrences, isVisible, KIND_COLORS, KIND_LABELS, type CalendarEntry, type CalendarKind } from "@/lib/planners/calendar-rules";
import { renderFramework, type FrameworkData } from "./TemplatesView";
import { ExternalEventsBanner } from "./ExternalEventsBanner";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { Track } from "@/lib/analytics";
import { HandNote, type HandNoteData } from "./HandNote";

type TaskStatus = 'todo' | 'done' | 'carried' | 'cancelled';
type TaskPriority = '급중' | '급경' | '완중' | '완경';

const PRIORITY_META: Record<TaskPriority, { label: string; cls: string; dotCls: string }> = {
    '급중': { label: "급중", cls: "text-rose-600   bg-rose-50   border-rose-200",     dotCls: "bg-rose-500"    },
    '급경': { label: "급경", cls: "text-amber-600  bg-amber-50  border-amber-200",    dotCls: "bg-amber-500"   },
    '완중': { label: "완중", cls: "text-sky-600    bg-sky-50    border-sky-200",       dotCls: "bg-sky-500"     },
    '완경': { label: "완경", cls: "text-neutral-500 bg-neutral-100 border-neutral-200", dotCls: "bg-neutral-400" },
};
type CornellRow = { id: string; cue: string; note: string };
type NoteItem = { id: string; type?: 'cornell' | 'template' | 'handwriting' | 'canvas'; templateKey?: string; templateLabel?: string; canvas_id?: string; title: string; cue: string; content: string; summary: string; rows: CornellRow[]; handwriting?: HandNoteData };

export const RESULT_CATEGORIES = [
    { key: "summary",  label: "정리",     hint: "오늘을 정리하면" },
    { key: "quote",    label: "들은 말",   hint: "오늘 들은 말 한 마디" },
    { key: "idea",     label: "아이디어", hint: "떠오른 생각" },
    { key: "insight",  label: "인사이트", hint: "오늘의 깨달음" },
    { key: "emotion",  label: "감정",     hint: "오늘의 감정 한 줄" },
    { key: "learning", label: "배움",     hint: "오늘 배운 것" },
    { key: "scene",    label: "한 장면", hint: "사진·동영상으로 남기는 오늘의 한 장면" },
    { key: "free",     label: "자유",     hint: "자유로운 한 줄" },
] as const;

export function resultCategoryHint(key: string): string {
    return RESULT_CATEGORIES.find((c) => c.key === key)?.hint ?? "오늘 어떤 한 줄을 남기시겠어요?";
}

export function resultCategoryLabel(key: string | null | undefined): string {
    if (!key) return "";
    return RESULT_CATEGORIES.find((c) => c.key === key)?.label ?? "";
}

function makeDefaultCornellNote(): NoteItem {
    return {
        id: `n_default_${Date.now()}`,
        type: 'cornell',
        title: '기본 노트 1',
        cue: '',
        content: '',
        summary: '',
        rows: [{ id: 'r1', cue: '', note: '' }],
    };
}

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
        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {/* Header — 통일 패턴 (text-xs uppercase tracking-widest text-neutral-400) */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-neutral-200 bg-neutral-50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <LayoutTemplate className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                    <input
                        value={note.title}
                        onChange={(e) => {
                            const next = notesList.map(n => n.id === note.id ? { ...n, title: e.target.value } : n);
                            setNotesList(next);
                        }}
                        onBlur={() => save({ notes: serializeNotesFn(notesList) })}
                        placeholder={note.templateLabel || "템플릿"}
                        className="text-xs uppercase tracking-widest text-neutral-400 bg-transparent focus:outline-none w-full placeholder:text-neutral-300"
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
    const [satisfaction, setSatisfaction] = useState<number | null>(null);
    const [mood, setMood] = useState<number | null>(null);
    const [resultCategory, setResultCategory] = useState<string>("");
    const [exerciseType, setExerciseType] = useState("");
    const [exerciseMinutes, setExerciseMinutes] = useState<string>("");
    const [exerciseDistance, setExerciseDistance] = useState<string>("");
    const [exerciseNote, setExerciseNote] = useState("");
    const [bpSys, setBpSys] = useState<string>("");
    const [bpDia, setBpDia] = useState<string>("");
    const [bloodSugar, setBloodSugar] = useState<string>("");
    const [bodyWeight, setBodyWeight] = useState<string>("");
    const [bodyTemp, setBodyTemp] = useState<string>("");
    const [healthNote, setHealthNote] = useState("");
    const [study, setStudy] = useState<number | null>(null);
    const [studyNote, setStudyNote] = useState("");
    const [faith, setFaith] = useState<number | null>(null);
    const [faithNote, setFaithNote] = useState("");
    const [trackingMetrics, setTrackingMetrics] = useState<string[]>([]);
    const [calEntries, setCalEntries] = useState<CalendarEntry[]>([]);
    const [upcomingEntries, setUpcomingEntries] = useState<CalendarEntry[]>([]);
    const [calEditorOpen, setCalEditorOpen] = useState(false);
    const [calEditing, setCalEditing] = useState<Partial<CalendarEntry> | null>(null);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    // (인라인 Task 입력 제거 — 모달로 통합)
    // 활성 프로젝트 목록 (Task 태그용)
    const [activeProjects, setActiveProjects] = useState<Array<{ id: string; title: string; color: string | null }>>([]);
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
    const [gpsEnabled, setGpsEnabled] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("planners_gps_enabled") === "true";
    });
    const [gpsLocation, setGpsLocation] = useState<string>("");
    const [shareCopied, setShareCopied] = useState(false);
    // 노트 드래그 순서 변경
    const noteDragRef = useRef<{ dragIdx: number; overIdx: number } | null>(null);

    function toggleEditing(id: string) {
        setEditingNoteIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    async function toggleGps() {
        const next = !gpsEnabled;
        setGpsEnabled(next);
        if (typeof window !== "undefined") localStorage.setItem("planners_gps_enabled", String(next));
        if (!next) { setGpsLocation(""); return; }
        if (!navigator.geolocation) { setGpsLocation("위치 접근 불가"); return; }
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const r = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json&accept-language=ko`
                    );
                    if (r.ok) {
                        const d = await r.json();
                        const city = d.address?.city || d.address?.town || d.address?.county || "";
                        const district = d.address?.suburb || d.address?.neighbourhood || d.address?.village || "";
                        setGpsLocation([city, district].filter(Boolean).join(" ") || `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`);
                    }
                } catch { setGpsLocation(""); }
            },
            () => setGpsLocation("")
        );
    }

    async function shareResult() {
        const shareText = [
            date,
            gpsEnabled && gpsLocation ? `📍 ${gpsLocation}` : "",
            result?.trim(),
        ].filter(Boolean).join("\n");
        if (!shareText.includes("\n") && !result?.trim()) return;
        try {
            if (navigator.share) {
                await navigator.share({ title: "Planner's Planner", text: shareText });
            } else {
                await navigator.clipboard.writeText(shareText);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
            }
        } catch { /* user cancelled */ }
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

    // 데일리 트래킹 사용자 설정 (Settings 에서 켠 항목만, 미설정 시 만족도 기본)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/planners/settings');
                if (cancelled) return;
                if (res.ok) {
                    const d = await res.json();
                    setTrackingMetrics(
                        Array.isArray(d.user?.daily_tracking_metrics) && d.user.daily_tracking_metrics.length > 0
                            ? d.user.daily_tracking_metrics
                            : ["satisfaction"]
                    );
                } else {
                    setTrackingMetrics(["satisfaction"]);
                }
            } catch { setTrackingMetrics(["satisfaction"]); }
        })();
        return () => { cancelled = true; };
    }, []);

    // 캘린더 엔트리 (당일 + 반복 row 전체) — 날짜 변경 시 refetch
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/planners/calendar?from=${date}&to=${date}`);
                if (cancelled || !res.ok) return;
                const d = await res.json();
                setCalEntries(d.entries ?? []);
            } catch { /* noop */ }
        })();
        return () => { cancelled = true; };
    }, [date]);

    function refetchCalendar() {
        fetch(`/api/planners/calendar?from=${date}&to=${date}`)
            .then((r) => r.ok ? r.json() : null)
            .then((d) => { if (d?.entries) setCalEntries(d.entries); });
    }

    // 향후 4주 일정 (내일~28일 후, meeting·task 종류)
    useEffect(() => {
        let cancelled = false;
        const d = new Date(date + "T00:00:00");
        d.setDate(d.getDate() + 1);
        const from = d.toISOString().slice(0, 10);
        const d2 = new Date(date + "T00:00:00");
        d2.setDate(d2.getDate() + 28);
        const to = d2.toISOString().slice(0, 10);
        (async () => {
            try {
                const res = await fetch(`/api/planners/calendar?from=${from}&to=${to}`);
                if (cancelled || !res.ok) return;
                const j = await res.json();
                setUpcomingEntries(j.entries ?? []);
            } catch { /* noop */ }
        })();
        return () => { cancelled = true; };
    }, [date]);

    // 활성 프로젝트 목록 (Task 태그용)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await fetch(`/api/planners/projects`);
            if (cancelled || !res.ok) return;
            const d = await res.json();
            const all: Array<{ id: string; title: string; color: string | null; status: string }> = d.projects ?? [];
            setActiveProjects(all.filter(p => p.status === "active").map(p => ({ id: p.id, title: p.title, color: p.color })));
        })();
        return () => { cancelled = true; };
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
                                const type = (
                                    rawType === 'template' ? 'template'
                                    : rawType === 'handwriting' ? 'handwriting'
                                    : rawType === 'canvas' ? 'canvas'
                                    : 'cornell'
                                ) as 'cornell' | 'template' | 'handwriting' | 'canvas';
                                return {
                                    id: String(n.id),
                                    type,
                                    templateKey: typeof n.templateKey === 'string' ? n.templateKey : '',
                                    templateLabel: typeof n.templateLabel === 'string' ? n.templateLabel : undefined,
                                    canvas_id: typeof n.canvas_id === 'string' ? n.canvas_id : undefined,
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
                    // 기본: 코넬 노트 1개 자동 표시 (저장 안 되어 있으면 ephemeral)
                    setNotesList(parsed.length === 0 ? [makeDefaultCornellNote()] : parsed);
                    setEnergy(data.daily.energy_level);
                    setSatisfaction(data.daily.satisfaction_level ?? null);
                    setMood(data.daily.mood_level ?? null);
                    setExerciseType(data.daily.exercise_type ?? "");
                    setExerciseMinutes(data.daily.exercise_minutes != null ? String(data.daily.exercise_minutes) : "");
                    setExerciseDistance(data.daily.exercise_distance != null ? String(data.daily.exercise_distance) : "");
                    setExerciseNote(data.daily.exercise_note ?? "");
                    setBpSys(data.daily.bp_systolic != null ? String(data.daily.bp_systolic) : "");
                    setBpDia(data.daily.bp_diastolic != null ? String(data.daily.bp_diastolic) : "");
                    setBloodSugar(data.daily.blood_sugar != null ? String(data.daily.blood_sugar) : "");
                    setBodyWeight(data.daily.body_weight != null ? String(data.daily.body_weight) : "");
                    setBodyTemp(data.daily.body_temp != null ? String(data.daily.body_temp) : "");
                    setHealthNote(data.daily.health_note ?? "");
                    setStudy(data.daily.study_level ?? null);
                    setStudyNote(data.daily.study_note ?? "");
                    setFaith(data.daily.faith_level ?? null);
                    setFaithNote(data.daily.faith_note ?? "");
                    setResult(data.daily.daily_result || "");
                    setResultCategory(data.daily.daily_result_category ?? "");
                    if (data.daily.weather_temp != null && data.daily.weather_code != null) {
                        setWeather({ temp: data.daily.weather_temp, code: data.daily.weather_code });
                    }
                } else {
                    setTasks([]);
                    setNotesList([makeDefaultCornellNote()]);
                    setEnergy(null);
                    setSatisfaction(null);
                    setMood(null);
                    setExerciseType(""); setExerciseMinutes(""); setExerciseDistance(""); setExerciseNote("");
                    setBpSys(""); setBpDia(""); setBloodSugar(""); setBodyWeight(""); setBodyTemp(""); setHealthNote("");
                    setStudy(null); setStudyNote(""); setFaith(null); setFaithNote("");
                    setResult("");
                    setResultCategory("");
                }
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [date]);

    async function save(patch: Partial<PlannerDaily>) {
        setSaving(true);
        try {
            const res = await fetch(`/api/planners/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, ...patch }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                console.error("daily save failed", { patch: Object.keys(patch), err });
                setSaveError("저장 실패 — 잠시 후 다시 시도해 주세요.");
                setTimeout(() => setSaveError(null), 4000);
            }
        } catch (e) {
            console.error("daily save network error", e);
            setSaveError("네트워크 오류 — 연결을 확인해 주세요.");
            setTimeout(() => setSaveError(null), 4000);
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

    function updateTaskPriority(taskId: string, priority: PlannerTask["priority"]) {
        const next = tasks.map(t => t.id === taskId ? { ...t, priority } : t);
        setTasks(next);
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

    function updateTaskProject(taskId: string, projectId: string | null) {
        const next = tasks.map(t => t.id === taskId ? { ...t, project_id: projectId } : t);
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
            if (n.type === 'canvas') {
                return { id: n.id, type: n.type, canvas_id: n.canvas_id, title: n.title, cue: '', content: '', summary: '' };
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
        setExpandedNote(newNote);
        Track.templateInsert({ template_key: tpl.key, template_label: tpl.label, surface: "daily" });
    }

    function navigateDate(deltaDays: number) {
        const d = new Date(date + "T00:00:00");
        d.setDate(d.getDate() + deltaDays);
        const newDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        setDate(newDate);
        router.replace(`/planners/app/daily?date=${newDate}`);
    }

    // 스와이프 내비게이션 (모바일 터치)
    const swipeRef = useSwipeNav(
        () => navigateDate(1),   // 왼쪽 스와이프 → 다음 날
        () => navigateDate(-1),  // 오른쪽 스와이프 → 이전 날
    );

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
        <div ref={swipeRef} className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            {/* Header — 모바일은 세로 스택, 데스크톱은 가로 분리 */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <button
                            onClick={() => navigateDate(-1)}
                            className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <div className="flex items-center gap-2 min-w-0">
                            <h1 className="font-serif text-2xl md:text-3xl text-neutral-900 whitespace-nowrap">
                                {formattedDate}
                            </h1>
                            {isToday && (
                                <span className="px-2 py-0.5 bg-[#0F766E] text-white text-xs font-semibold rounded-full shrink-0">
                                    Today
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => navigateDate(1)}
                            className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
                        {weather && (
                            <span className="text-neutral-600">
                                {weatherEmoji(weather.code)} {weather.temp}°C
                            </span>
                        )}
                        <span>{weekday}</span>
                        {lunar && (
                            <span className="text-neutral-300">
                                음력 {lunar.isLeap ? "윤" : ""}{lunar.month}월 {lunar.day}일
                            </span>
                        )}
                        {HOLIDAYS[date] && (
                            <span className={`text-xs font-medium ${
                                HOLIDAYS[date].type === 'holiday' ? 'text-rose-400' :
                                HOLIDAYS[date].type === 'memorial' ? 'text-rose-300' :
                                HOLIDAYS[date].type === 'commemoration' ? 'text-amber-600' :
                                'text-emerald-500'
                            }`}>
                                · {HOLIDAYS[date].label}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <PlannersUtilityLinks />
                    {saving && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                </div>
            </div>

            {saveError && (
                <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
                    <span>{saveError}</span>
                    <button onClick={() => setSaveError(null)} className="ml-3 text-red-400 hover:text-red-600">✕</button>
                </div>
            )}

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">로딩 중…</div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Tasks (col 2) */}
                    <div className="md:col-span-2 space-y-4">
                        <ExternalEventsBanner date={date} />

                        {/* ── 통합 타임테이블 (일정 + 업무) ── */}
                        {(() => {
                            // 오늘 calEntries를 발생일 기준으로 펼침
                            const todayOccurrences = calEntries.flatMap(e =>
                                expandOccurrences(e, date, date).map(o => ({ ...o }))
                            );
                            // 하루 종일: 기념일·공휴일·절기
                            const allDayEntries = todayOccurrences.filter(o =>
                                o.entry.kind === "anniversary" || o.entry.kind === "public_holiday" || o.entry.kind === "solar_term"
                            );
                            // 시간 있는 미팅
                            const timedMeetings = todayOccurrences
                                .filter(o => o.entry.kind === "meeting" && o.entry.start_time)
                                .map(o => ({ type: "meeting" as const, time: o.entry.start_time!, entry: o.entry }));
                            // 시간 없는 미팅 (하루 종일로 처리)
                            const untimedMeetings = todayOccurrences
                                .filter(o => o.entry.kind === "meeting" && !o.entry.start_time)
                                .map(o => ({ entry: o.entry }));
                            // 시간 있는 태스크
                            const timedTasks = tasks
                                .filter(t => t.time)
                                .map(t => ({ type: "task" as const, time: t.time!, task: t }));
                            // 시간 없는 태스크 (원래 순서 유지, 드래그용 index 포함)
                            const untimedTasks = tasks
                                .map((t, idx) => ({ task: t, idx }))
                                .filter(({ task }) => !task.time);

                            // 시간 기반 항목 정렬
                            const timedItems = [...timedMeetings, ...timedTasks]
                                .sort((a, b) => a.time.localeCompare(b.time));

                            const isEmpty = allDayEntries.length === 0 && timedItems.length === 0
                                && untimedMeetings.length === 0 && untimedTasks.length === 0;

                            return (
                                <section className="bg-white border border-neutral-200 rounded-xl p-5">
                                    {/* 헤더 */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xs uppercase tracking-widest text-neutral-400">일정 & 업무</h2>
                                        <div className="flex items-center gap-2">
                                            {pendingInfo && pendingInfo.count > 0 && (
                                                <button
                                                    onClick={carryOverPending}
                                                    disabled={carrying}
                                                    title={pendingInfo.oldest
                                                        ? `${pendingInfo.oldest}부터 미완료 ${pendingInfo.count}건 이월`
                                                        : `미완료 ${pendingInfo.count}건 이월`}
                                                    className="flex items-center gap-1 text-[10px] px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 transition-colors disabled:opacity-50"
                                                >
                                                    {carrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowDownToLine className="h-3 w-3" />}
                                                    미완 {pendingInfo.count}건 이월
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setCalEditing(null); setCalEditorOpen(true); }}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-[#0F766E] hover:bg-[#0F766E]/10 border border-[#0F766E]/30"
                                            >
                                                <Plus className="h-3 w-3" /> 일정
                                            </button>
                                        </div>
                                    </div>

                                    {/* 1. 하루 종일 항목 */}
                                    {(allDayEntries.length > 0 || untimedMeetings.length > 0) && (
                                        <div className="mb-3 pb-3 border-b border-neutral-100 space-y-1">
                                            {allDayEntries.map(({ entry }) => {
                                                const c = KIND_COLORS[entry.kind];
                                                return (
                                                    <button
                                                        key={entry.id}
                                                        onClick={() => { setCalEditing(entry); setCalEditorOpen(true); }}
                                                        className="w-full flex items-center gap-2.5 px-1 py-1 rounded hover:bg-neutral-50 text-left"
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                                                        <span className="flex-1 text-sm text-neutral-800">{entry.title}</span>
                                                        <span className="text-[10px] text-neutral-400">하루 종일</span>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                                                            {KIND_LABELS[entry.kind]}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                            {untimedMeetings.map(({ entry }) => {
                                                const c = KIND_COLORS[entry.kind];
                                                return (
                                                    <button
                                                        key={entry.id}
                                                        onClick={() => { setCalEditing(entry); setCalEditorOpen(true); }}
                                                        className="w-full flex items-center gap-2.5 px-1 py-1 rounded hover:bg-neutral-50 text-left"
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                                                        <span className="flex-1 text-sm text-neutral-800">{entry.title}</span>
                                                        {entry.description && (
                                                            <span className="text-[11px] text-neutral-400 truncate max-w-[120px]">{entry.description}</span>
                                                        )}
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.bg} ${c.text}`}>미팅</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* 2. 시간 기반 항목 (미팅 + 시간 있는 태스크) */}
                                    <div className="space-y-0.5">
                                        {isEmpty && (
                                            <p className="text-sm text-neutral-300 italic py-2">일정이나 할 일을 추가해 보세요.</p>
                                        )}
                                        {timedItems.map((item, i) => {
                                            if (item.type === "meeting") {
                                                const c = KIND_COLORS["meeting"];
                                                const t = item.time.slice(0, 5);
                                                const h = parseInt(t.split(":")[0], 10);
                                                const ampm = h < 12 ? "오전" : "오후";
                                                return (
                                                    <button
                                                        key={`m-${item.entry.id}-${i}`}
                                                        onClick={() => { setCalEditing(item.entry); setCalEditorOpen(true); }}
                                                        className="w-full flex items-center gap-2.5 px-1 py-1.5 rounded hover:bg-neutral-50 text-left group"
                                                    >
                                                        <span className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center ${c.ring} border-sky-300`} />
                                                        <span className="shrink-0 text-[11px] font-mono text-neutral-400 w-[76px]">
                                                            {ampm} {t}
                                                        </span>
                                                        <span className="flex-1 text-sm text-neutral-800">{item.entry.title}</span>
                                                        {item.entry.description && (
                                                            <span className="text-[11px] text-neutral-400 truncate max-w-[130px] hidden sm:block">
                                                                {item.entry.description}
                                                            </span>
                                                        )}
                                                        <span className="text-[9px] text-sky-500 opacity-0 group-hover:opacity-60">미팅</span>
                                                    </button>
                                                );
                                            } else {
                                                // task with time
                                                const t = item.task;
                                                const timeStr = (t.time || "").slice(0, 5);
                                                const h = parseInt(timeStr.split(":")[0], 10);
                                                const ampm = h < 12 ? "오전" : "오후";
                                                const strike = t.status === "done" || t.status === "cancelled";
                                                const taskIdx = tasks.findIndex(x => x.id === t.id);
                                                return (
                                                    <div key={`t-${t.id}`} className="flex items-center gap-2.5 px-1 py-1.5 rounded hover:bg-neutral-50 group">
                                                        <button
                                                            onClick={() => cycleStatus(t.id)}
                                                            title="클릭: 미완 → 완료 → 이월 → 취소"
                                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] font-bold transition-colors shrink-0 ${
                                                                t.status === "done"      ? "bg-[#0F766E] border-[#0F766E] text-white"
                                                                : t.status === "carried" ? "bg-amber-500 border-amber-500 text-white"
                                                                : t.status === "cancelled" ? "bg-neutral-300 border-neutral-300 text-white"
                                                                : "border-neutral-300 hover:border-[#0F766E]"
                                                            }`}
                                                        >
                                                            {t.status === "done" ? "V" : t.status === "carried" ? "→" : t.status === "cancelled" ? "X" : ""}
                                                        </button>
                                                        <span className="shrink-0 text-[11px] font-mono text-neutral-400 w-[76px]">
                                                            {ampm} {timeStr}
                                                        </span>
                                                        {t.priority && PRIORITY_META[t.priority as TaskPriority] && (
                                                            <PriorityBadge
                                                                priority={t.priority as TaskPriority}
                                                                onClick={() => updateTaskPriority(t.id,
                                                                    QUADRANT_CYCLE[t.priority as TaskPriority]
                                                                )}
                                                            />
                                                        )}
                                                        <span className={`flex-1 text-sm ${strike ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                                                            {t.text}
                                                        </span>
                                                        <button
                                                            onClick={() => removeTask(t.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-rose-400 transition-colors"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                );
                                            }
                                        })}

                                        {/* 구분선 (시간 항목 + 미완료 항목 모두 있을 때) */}
                                        {timedItems.length > 0 && untimedTasks.length > 0 && (
                                            <div className="border-t border-dashed border-neutral-100 my-2" />
                                        )}

                                        {/* 3. 시간 없는 태스크 (드래그 가능) */}
                                        {untimedTasks.map(({ task: t, idx }) => (
                                            <TaskRow
                                                key={t.id}
                                                task={t}
                                                index={idx}
                                                isDragOver={dragOverIndex === idx}
                                                onCycle={() => cycleStatus(t.id)}
                                                onRemove={() => removeTask(t.id)}
                                                onTimeChange={(time) => updateTaskTime(t.id, time)}
                                                onPriorityChange={(p) => updateTaskPriority(t.id, p)}
                                                onProjectChange={(pid) => updateTaskProject(t.id, pid)}
                                                projects={activeProjects}
                                                onDragStart={() => onDragStart(idx)}
                                                onDragOver={(e) => onDragOver(e, idx)}
                                                onDrop={() => onDrop(idx)}
                                                onDragEnd={onDragEnd}
                                            />
                                        ))}
                                    </div>

                                    {/* 업무 추가는 + 버튼(CalendarEntryEditor 모달)으로 통합 */}
                                </section>
                            );
                        })()}

                        {/* 노트 추가 버튼 */}
                        <div className="grid grid-cols-4 gap-2">
                            <button
                                onClick={() => {
                                    const idx = notesList.filter(n => n.type === 'cornell').length + 1;
                                    const newNote: NoteItem = { id: `n_${Date.now()}`, type: 'cornell', title: `기본 노트 ${idx}`, cue: "", content: "", summary: "", rows: [{ id: 'r1', cue: '', note: '' }] };
                                    const next = [...notesList, newNote];
                                    setNotesList(next);
                                    save({ notes: serializeNotes(next) });
                                    setExpandedNote(newNote);
                                }}
                                className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                기본 노트
                            </button>
                            <button
                                onClick={() => {
                                    const idx = notesList.filter(n => n.type === 'handwriting').length + 1;
                                    const newNote: NoteItem = { id: `n_${Date.now()}`, type: 'handwriting', title: `손글씨 ${idx}`, cue: "", content: "", summary: "", rows: [], handwriting: { strokes: [], width: 600, height: 300 } };
                                    const next = [...notesList, newNote];
                                    setNotesList(next);
                                    save({ notes: serializeNotes(next) });
                                    setExpandedNote(newNote);
                                }}
                                title="Apple Pencil · S Pen · 마우스로 직접 쓰기"
                                className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                손글씨 노트
                            </button>
                            <button
                                onClick={openTemplatePicker}
                                className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-violet-400 hover:text-violet-600 transition-colors"
                            >
                                <LayoutTemplate className="h-3.5 w-3.5" />
                                템플릿
                            </button>
                            <button
                                onClick={async () => {
                                    const idx = notesList.filter(n => n.type === 'canvas').length + 1;
                                    const title = `캔버스 ${idx}`;
                                    const res = await fetch("/api/planners/canvases", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ title }),
                                    });
                                    if (res.ok) {
                                        const d = await res.json();
                                        const newNote: NoteItem = { id: `n_${Date.now()}`, type: 'canvas', canvas_id: d.canvas.id, title, cue: '', content: '', summary: '', rows: [] };
                                        const next = [...notesList, newNote];
                                        setNotesList(next);
                                        save({ notes: serializeNotes(next) });
                                        setExpandedNote(newNote);
                                    } else {
                                        setSaveError("캔버스 생성 실패 — 잠시 후 다시 시도해 주세요.");
                                        setTimeout(() => setSaveError(null), 4000);
                                    }
                                }}
                                title="자유 캔버스 — 그림·도형·텍스트"
                                className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-sky-400 hover:text-sky-600 transition-colors"
                            >
                                <ImageIcon className="h-3.5 w-3.5" />
                                캔버스
                            </button>
                        </div>

                        {/* Notes 목록 — 2열 카드 그리드, 클릭 시 확장 모달 */}
                        {notesList.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {notesList.map((note, noteIdx) => {
                                const previewText =
                                    note.type === 'handwriting' ? '손글씨 메모'
                                    : note.type === 'canvas' ? '자유 캔버스'
                                    : note.type === 'template' ? (note.content || note.templateLabel || '템플릿 노트')
                                    : (note.rows[0]?.note || note.summary || '');
                                return (
                                <div
                                    key={note.id}
                                    draggable
                                    onDragStart={() => { noteDragRef.current = { dragIdx: noteIdx, overIdx: noteIdx }; }}
                                    onDragOver={(e) => { e.preventDefault(); if (noteDragRef.current) noteDragRef.current.overIdx = noteIdx; }}
                                    onDrop={() => {
                                        if (!noteDragRef.current) return;
                                        const { dragIdx, overIdx } = noteDragRef.current;
                                        if (dragIdx === overIdx) return;
                                        const next = [...notesList];
                                        const [moved] = next.splice(dragIdx, 1);
                                        next.splice(overIdx, 0, moved);
                                        setNotesList(next);
                                        save({ notes: serializeNotes(next) });
                                        noteDragRef.current = null;
                                    }}
                                    onDragEnd={() => { noteDragRef.current = null; }}
                                    onClick={() => setExpandedNote(note)}
                                    className="group relative bg-white border border-neutral-200 rounded-xl p-3 cursor-pointer hover:border-neutral-300 hover:shadow-sm transition-all"
                                >
                                    {/* 상단: 타입 뱃지 + 삭제 */}
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">
                                            {note.type === 'handwriting' ? '손글씨' : note.type === 'template' ? '템플릿' : note.type === 'canvas' ? '캔버스' : '기본'}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const next = notesList.filter(n => n.id !== note.id);
                                                setNotesList(next);
                                                save({ notes: serializeNotes(next) });
                                            }}
                                            className="text-neutral-300 hover:text-red-400 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                    {/* 제목 */}
                                    <p className="text-xs font-medium text-neutral-800 truncate mb-1">{note.title || '제목 없음'}</p>
                                    {/* 미리보기 텍스트 */}
                                    <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">{previewText || '비어 있음'}</p>
                                    {/* 드래그 핸들 */}
                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity cursor-grab active:cursor-grabbing">
                                        <GripVertical className="h-3.5 w-3.5 text-neutral-400" />
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                        )}

                    </div>

                    {/* Right column — 달력 → 4주 일정 → 트래킹 → 프로젝트 → 오늘 → AI 정리 */}
                    <div className="space-y-4">
                        {/* 1. 당월 달력 */}
                        <DailyMiniMonth date={date} />

                        {/* 2. 향후 4주 일정·미팅 */}
                        <UpcomingSchedule date={date} entries={upcomingEntries} />

                        {/* 3. 트래킹 */}
                        {trackingMetrics.length > 0 && (
                            <section className="bg-white border border-neutral-200 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xs uppercase tracking-widest text-neutral-400">Daily Tracking</h2>
                                    <Link
                                        href="/planners/app/settings#tracking"
                                        className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-[#0F766E] transition-colors"
                                        title="트래킹 항목 수정"
                                    >
                                        <Pencil className="h-3 w-3" /> 수정
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {trackingMetrics.includes("energy") && (
                                        <TrackingRow
                                            label="에너지" hint="컨디션·체력"
                                            value={energy} activeColor="bg-[#0F766E]"
                                            onPick={(n) => { setEnergy(n); save({ energy_level: n }); }}
                                            onClear={() => { setEnergy(null); save({ energy_level: null }); }}
                                        />
                                    )}
                                    {trackingMetrics.includes("satisfaction") && (
                                        <TrackingRow
                                            label="만족도" hint="오늘 하루 만족"
                                            value={satisfaction} activeColor="bg-amber-500"
                                            onPick={(n) => { setSatisfaction(n); save({ satisfaction_level: n }); }}
                                            onClear={() => { setSatisfaction(null); save({ satisfaction_level: null }); }}
                                        />
                                    )}
                                    {trackingMetrics.includes("mood") && (
                                        <TrackingRow
                                            label="기분" hint="감정 상태"
                                            value={mood} activeColor="bg-rose-400"
                                            onPick={(n) => { setMood(n); save({ mood_level: n }); }}
                                            onClear={() => { setMood(null); save({ mood_level: null }); }}
                                        />
                                    )}
                                    {trackingMetrics.includes("study") && (
                                        <TrackingRowWithNote
                                            label="공부" hint="학습 집중도"
                                            value={study} activeColor="bg-sky-500"
                                            note={studyNote}
                                            placeholder="오늘 공부한 주제·범위"
                                            onPick={(n) => { setStudy(n); save({ study_level: n }); }}
                                            onClear={() => { setStudy(null); save({ study_level: null }); }}
                                            onNoteChange={setStudyNote}
                                            onNoteBlur={() => save({ study_note: studyNote || null })}
                                        />
                                    )}
                                    {trackingMetrics.includes("faith") && (
                                        <TrackingRowWithNote
                                            label="신앙" hint="영적 충만도"
                                            value={faith} activeColor="bg-violet-500"
                                            note={faithNote}
                                            placeholder="묵상·기도·예배 한 줄"
                                            onPick={(n) => { setFaith(n); save({ faith_level: n }); }}
                                            onClear={() => { setFaith(null); save({ faith_level: null }); }}
                                            onNoteChange={setFaithNote}
                                            onNoteBlur={() => save({ faith_note: faithNote || null })}
                                        />
                                    )}
                                    {trackingMetrics.includes("exercise") && (
                                        <ExerciseBlock
                                            type={exerciseType} minutes={exerciseMinutes} distance={exerciseDistance} note={exerciseNote}
                                            onChange={(p) => {
                                                if (p.type !== undefined) setExerciseType(p.type);
                                                if (p.minutes !== undefined) setExerciseMinutes(p.minutes);
                                                if (p.distance !== undefined) setExerciseDistance(p.distance);
                                                if (p.note !== undefined) setExerciseNote(p.note);
                                            }}
                                            onSave={() => save({
                                                exercise_type: exerciseType || null,
                                                exercise_minutes: exerciseMinutes ? parseInt(exerciseMinutes, 10) : null,
                                                exercise_distance: exerciseDistance ? parseFloat(exerciseDistance) : null,
                                                exercise_note: exerciseNote || null,
                                            })}
                                        />
                                    )}
                                    {trackingMetrics.includes("health") && (
                                        <HealthBlock
                                            sys={bpSys} dia={bpDia} sugar={bloodSugar} weight={bodyWeight} temp={bodyTemp} note={healthNote}
                                            onChange={(p) => {
                                                if (p.sys !== undefined) setBpSys(p.sys);
                                                if (p.dia !== undefined) setBpDia(p.dia);
                                                if (p.sugar !== undefined) setBloodSugar(p.sugar);
                                                if (p.weight !== undefined) setBodyWeight(p.weight);
                                                if (p.temp !== undefined) setBodyTemp(p.temp);
                                                if (p.note !== undefined) setHealthNote(p.note);
                                            }}
                                            onSave={() => save({
                                                bp_systolic: bpSys ? parseInt(bpSys, 10) : null,
                                                bp_diastolic: bpDia ? parseInt(bpDia, 10) : null,
                                                blood_sugar: bloodSugar ? parseInt(bloodSugar, 10) : null,
                                                body_weight: bodyWeight ? parseFloat(bodyWeight) : null,
                                                body_temp: bodyTemp ? parseFloat(bodyTemp) : null,
                                                health_note: healthNote || null,
                                            })}
                                        />
                                    )}
                                </div>
                            </section>
                        )}

                        {/* 4. 진행중인 프로젝트 */}
                        <DailyProjectsCard date={date} />

                        {/* 5. 오늘 — 한 줄 결과 */}
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xs uppercase tracking-widest text-neutral-400">오늘</h2>
                                <div className="flex items-center gap-0.5">
                                    <button
                                        onClick={toggleGps}
                                        title={gpsEnabled ? "GPS 끄기" : "GPS 켜기 (현재 위치 기록)"}
                                        className={`p-1.5 rounded transition-colors ${gpsEnabled ? "text-[#0F766E] bg-[#0F766E]/10" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"}`}
                                    >
                                        <MapPin className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={shareResult}
                                        title={shareCopied ? "복사됨!" : "공유하기"}
                                        className={`p-1.5 rounded transition-colors ${shareCopied ? "text-[#0F766E] bg-[#0F766E]/10" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"}`}
                                    >
                                        <Share2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                            {gpsEnabled && gpsLocation && (
                                <p className="text-[10px] text-[#0F766E]/70 flex items-center gap-1 mb-2">
                                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                                    {gpsLocation}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-1 mb-2.5">
                                {RESULT_CATEGORIES.map((c) => {
                                    const active = resultCategory === c.key;
                                    return (
                                        <button
                                            key={c.key}
                                            onClick={() => {
                                                const next = active ? "" : c.key;
                                                setResultCategory(next);
                                                save({ daily_result_category: next || null });
                                            }}
                                            className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                                                active
                                                    ? "bg-[#0F766E] text-white"
                                                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                                            }`}
                                            title={c.hint}
                                        >
                                            {c.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {resultCategory === "scene" ? (
                                <DailyMomentsAuto date={date} compact />
                            ) : (
                                <textarea
                                    value={result}
                                    onChange={(e) => setResult(e.target.value)}
                                    onBlur={() => save({ daily_result: result })}
                                    placeholder={resultCategoryHint(resultCategory)}
                                    rows={4}
                                    className="w-full text-sm text-neutral-900 placeholder:text-neutral-300 placeholder:italic focus:outline-none bg-transparent resize-none"
                                />
                            )}
                        </section>

                        {/* 6. AI 정리 — 오늘 하루 간략 요약 */}
                        <DailyAiSummary date={date} />
                    </div>
                </div>
            )}

            {/* Calendar Entry Editor Modal */}
            <CalendarEntryEditor
                open={calEditorOpen}
                onClose={() => { setCalEditorOpen(false); setCalEditing(null); }}
                onSaved={() => refetchCalendar()}
                onDeleted={() => refetchCalendar()}
                initial={calEditing ?? undefined}
                defaultDate={date}
                onTaskCreated={(t) => {
                    const newTask: PlannerTask = {
                        id: `t_${Date.now()}`,
                        text: t.text,
                        status: "todo",
                        time: t.time ?? null,
                        project_id: t.project_id ?? null,
                        priority: t.priority ?? null,
                        memo: t.memo ?? null,
                    };
                    const next = [...tasks, newTask];
                    setTasks(next);
                    save({ tasks: next });
                }}
                activeProjects={activeProjects}
            />

            {/* Note Expand Modal */}
            {expandedNote && (() => {
                const isTpl = expandedNote.type === 'template';
                const isHand = expandedNote.type === 'handwriting';
                const isCanvas = expandedNote.type === 'canvas';
                const tplMeta = isTpl ? { id: expandedNote.id, key: expandedNote.templateKey ?? '', label: expandedNote.title, body_md: expandedNote.content } : null;
                const tplHasGrid = tplMeta ? isSpecialTemplate(tplMeta) : false;
                const dataKey = tplMeta ? tplDataKey(expandedNote.id) : '';
                // 자동 생성 제목 여부 — 힌트 스타일(이탤릭·흐림) 적용
                const isAutoTitle = /^(기본 노트|손글씨|캔버스) \d+$/.test(expandedNote.title)
                    || (isTpl && expandedNote.title === (expandedNote.templateLabel ?? ''));
                function saveAndClose() {
                    const next = notesList.map(n => n.id === expandedNote!.id ? expandedNote! : n);
                    setNotesList(next);
                    save({ notes: serializeNotes(next) });
                    setExpandedNote(null);
                }
                return (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-[5vh_5vw]">
                        <div className={`bg-white rounded-xl w-full h-full flex flex-col shadow-2xl overflow-hidden ${isTpl ? 'border-t-4 border-violet-400' : isCanvas ? 'border-t-4 border-sky-400' : ''}`}>
                            {/* Header */}
                            <div className={`px-6 py-3 border-b border-neutral-200 flex items-center gap-3 ${isTpl ? 'bg-violet-50' : isCanvas ? 'bg-sky-50' : 'bg-neutral-50'}`}>
                                {isTpl && <LayoutTemplate className="h-4 w-4 text-violet-400 shrink-0" />}
                                {isCanvas && <ImageIcon className="h-4 w-4 text-sky-400 shrink-0" />}
                                <input
                                    type="text"
                                    value={expandedNote.title}
                                    onChange={(e) => setExpandedNote({ ...expandedNote, title: e.target.value })}
                                    placeholder="제목을 입력하세요"
                                    className={`flex-1 text-base bg-transparent focus:outline-none placeholder:text-neutral-300 transition-all ${
                                        isAutoTitle
                                            ? 'italic font-normal text-neutral-400'
                                            : isTpl ? 'font-semibold text-violet-700' : isCanvas ? 'font-semibold text-sky-700' : 'font-semibold text-neutral-900'
                                    }`}
                                />
                                <button
                                    onClick={() => saveAndClose()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors"
                                >
                                    저장 후 닫기
                                </button>
                            </div>
                            {/* Body */}
                            {isCanvas ? (
                                <iframe
                                    src={`/planners/app/canvas/${expandedNote.canvas_id}`}
                                    className="flex-1 w-full border-0"
                                    title={expandedNote.title}
                                />
                            ) : isHand ? (
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
                                    {/* Column headers — 행의 삭제 버튼(w-6)과 폭 정렬 */}
                                    <div className="flex border-b border-neutral-100 shrink-0">
                                        <div className="w-6 shrink-0" aria-hidden />
                                        <div className="w-[22%] shrink-0 border-l border-neutral-200 px-4 py-2">
                                            <p className="text-[9px] uppercase tracking-widest text-neutral-300 font-semibold">단서 · 키워드</p>
                                        </div>
                                        <div className="flex-1 border-l border-neutral-200 flex items-center justify-between px-4 py-2">
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
                    <div className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl flex flex-col h-[85vh] sm:h-[640px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
    onPriorityChange?: (p: PlannerTask["priority"]) => void;
    onProjectChange?: (projectId: string | null) => void;
    projects?: Array<{ id: string; title: string; color: string | null }>;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
    onDragEnd: () => void;
}

const QUADRANT_CYCLE: Record<TaskPriority, TaskPriority | null> = {
    '급중': '급경',
    '급경': '완중',
    '완중': '완경',
    '완경': null,
};

/** 우선순위 뱃지 — 클릭 시 사분면 순환 */
function PriorityBadge({ priority, onClick }: { priority: TaskPriority | null; onClick: () => void }) {
    if (!priority) return null;
    const m = PRIORITY_META[priority];
    return (
        <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors ${m.cls}`}
            title="클릭: 사분면 순환"
        >
            {m.label}
        </button>
    );
}

/** 우선순위 선택기 — 2×2 사분면 미니 피커 */
function PriorityPicker({ value, onChange }: { value: PlannerTask["priority"]; onChange: (p: PlannerTask["priority"]) => void }) {
    const quads: Array<{ q: TaskPriority; activeCls: string; borderCls: string }> = [
        { q: "급경", activeCls: "bg-amber-400 text-white",   borderCls: "border-b border-r border-neutral-200" },
        { q: "급중", activeCls: "bg-rose-500 text-white",    borderCls: "border-b border-neutral-200" },
        { q: "완경", activeCls: "bg-neutral-400 text-white", borderCls: "border-r border-neutral-200" },
        { q: "완중", activeCls: "bg-sky-500 text-white",     borderCls: "" },
    ];
    return (
        <div className="flex flex-col items-start gap-0.5 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 w-[100px]">
            <div className="grid grid-cols-2 w-full rounded overflow-hidden border border-neutral-200">
                {quads.map(({ q, activeCls, borderCls }) => (
                    <button
                        key={q}
                        type="button"
                        onClick={() => onChange(value === q ? null : q)}
                        className={`py-1.5 text-center text-[10px] font-bold transition-colors ${borderCls} ${
                            value === q ? activeCls : "bg-white hover:bg-neutral-50 text-neutral-500"
                        }`}
                    >
                        {q}
                    </button>
                ))}
            </div>
            {value && (
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="w-full text-[9px] text-neutral-400 hover:text-neutral-600 text-center pt-1"
                >
                    없음
                </button>
            )}
        </div>
    );
}

function TaskRow({ task, isDragOver, onCycle, onRemove, onTimeChange, onPriorityChange, onProjectChange, projects = [], onDragStart, onDragOver, onDrop, onDragEnd }: TaskRowProps) {
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
                <span className="inline-flex items-center gap-0.5 shrink-0">
                    <input
                        type="time"
                        defaultValue={task.time || ""}
                        autoFocus
                        onChange={(e) => onTimeChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape') {
                                onTimeChange((e.target as HTMLInputElement).value);
                                setEditingTime(false);
                            }
                        }}
                        className="text-xs w-[68px] border border-[#0F766E] rounded px-1 py-0.5 focus:outline-none"
                    />
                    {/* 모바일에서 확인 버튼 — onChange가 즉시 저장하므로 단순 닫기 역할 */}
                    <button
                        type="button"
                        onClick={() => setEditingTime(false)}
                        className="px-1.5 py-0.5 rounded bg-[#0F766E] text-white text-[10px] font-semibold hover:bg-[#0d5e56]"
                        title="확인"
                    >
                        확인
                    </button>
                    <button
                        type="button"
                        onClick={() => { onTimeChange(""); setEditingTime(false); }}
                        className="px-1 py-0.5 rounded text-neutral-400 hover:text-rose-500 text-[10px]"
                        title="시간 지우기"
                    >
                        ×
                    </button>
                </span>
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

            {/* 우선순위 뱃지 (있을 때만) */}
            {task.priority && PRIORITY_META[task.priority as TaskPriority] && (
                <PriorityBadge
                    priority={task.priority as TaskPriority}
                    onClick={() => onPriorityChange?.(
                        QUADRANT_CYCLE[task.priority as TaskPriority]
                    )}
                />
            )}
            {/* 우선순위 없을 때 — hover 시 빠른 설정 버튼 */}
            {!task.priority && onPriorityChange && (
                <button
                    type="button"
                    onClick={() => onPriorityChange("급중")}
                    className="opacity-0 group-hover:opacity-100 shrink-0 text-[10px] text-neutral-300 hover:text-neutral-500 border border-dashed border-neutral-200 rounded px-1 transition-all"
                    title="우선순위 설정"
                >
                    급중
                </button>
            )}

            {/* Task text */}
            <span className={`flex-1 text-sm ${strike ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                {task.text}
            </span>

            {/* Project tag (선택 가능) */}
            {projects.length > 0 && onProjectChange && (() => {
                const project = task.project_id ? projects.find(p => p.id === task.project_id) : null;
                return (
                    <select
                        value={task.project_id ?? ""}
                        onChange={(e) => onProjectChange(e.target.value || null)}
                        title={project ? `프로젝트: ${project.title}` : "프로젝트 태그"}
                        className={`shrink-0 text-[10px] max-w-[100px] focus:outline-none rounded px-1.5 py-0.5 border transition-colors ${
                            project
                                ? "bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/30"
                                : "text-neutral-300 border-transparent opacity-0 group-hover:opacity-100"
                        }`}
                        style={project?.color ? { color: project.color, borderColor: `${project.color}55`, backgroundColor: `${project.color}11` } : undefined}
                    >
                        <option value="">— 프로젝트 —</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                );
            })()}

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

interface ExerciseBlockProps {
    type: string; minutes: string; distance: string; note: string;
    onChange: (patch: { type?: string; minutes?: string; distance?: string; note?: string }) => void;
    onSave: () => void;
}

function ExerciseBlock({ type, minutes, distance, note, onChange, onSave }: ExerciseBlockProps) {
    const cls = "w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0F766E]";
    return (
        <div>
            <p className="text-xs font-semibold text-neutral-700 mb-2">운동 <span className="text-[10px] text-neutral-400 ml-1 font-normal">종류·시간·거리</span></p>
            <div className="grid grid-cols-2 gap-2">
                <input className={cls + " col-span-2"} placeholder="종류 (예: 러닝, 웨이트, 요가)" value={type} onChange={(e) => onChange({ type: e.target.value })} onBlur={onSave} />
                <input className={cls} placeholder="시간 (분)" value={minutes} onChange={(e) => onChange({ minutes: e.target.value.replace(/[^0-9]/g, "") })} onBlur={onSave} inputMode="numeric" />
                <input className={cls} placeholder="거리 (km)" value={distance} onChange={(e) => onChange({ distance: e.target.value.replace(/[^0-9.]/g, "") })} onBlur={onSave} inputMode="decimal" />
                <input className={cls + " col-span-2 text-xs"} placeholder="메모" value={note} onChange={(e) => onChange({ note: e.target.value })} onBlur={onSave} />
            </div>
        </div>
    );
}

interface HealthBlockProps {
    sys: string; dia: string; sugar: string; weight: string; temp: string; note: string;
    onChange: (patch: { sys?: string; dia?: string; sugar?: string; weight?: string; temp?: string; note?: string }) => void;
    onSave: () => void;
}

function HealthBlock({ sys, dia, sugar, weight, temp, note, onChange, onSave }: HealthBlockProps) {
    const cls = "w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0F766E]";
    const onlyNum = (v: string, dec = false) => v.replace(dec ? /[^0-9.]/g : /[^0-9]/g, "");
    return (
        <div>
            <p className="text-xs font-semibold text-neutral-700 mb-2">건강 <span className="text-[10px] text-neutral-400 ml-1 font-normal">혈압·혈당·체중·체온</span></p>
            <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <input className={cls} placeholder="수축기 (mmHg)" value={sys} onChange={(e) => onChange({ sys: onlyNum(e.target.value) })} onBlur={onSave} inputMode="numeric" />
                    <input className={cls} placeholder="이완기 (mmHg)" value={dia} onChange={(e) => onChange({ dia: onlyNum(e.target.value) })} onBlur={onSave} inputMode="numeric" />
                </div>
                <input className={cls} placeholder="혈당 (mg/dL)" value={sugar} onChange={(e) => onChange({ sugar: onlyNum(e.target.value) })} onBlur={onSave} inputMode="numeric" />
                <div className="grid grid-cols-2 gap-2">
                    <input className={cls} placeholder="체중 (kg)" value={weight} onChange={(e) => onChange({ weight: onlyNum(e.target.value, true) })} onBlur={onSave} inputMode="decimal" />
                    <input className={cls} placeholder="체온 (°C)" value={temp} onChange={(e) => onChange({ temp: onlyNum(e.target.value, true) })} onBlur={onSave} inputMode="decimal" />
                </div>
                <input className={cls + " text-xs"} placeholder="메모 (증상·복약 등)" value={note} onChange={(e) => onChange({ note: e.target.value })} onBlur={onSave} />
            </div>
        </div>
    );
}

interface TrackingRowWithNoteProps {
    label: string; hint: string; value: number | null; activeColor: string;
    note: string; placeholder: string;
    onPick: (n: number) => void;
    onClear: () => void;
    onNoteChange: (v: string) => void;
    onNoteBlur: () => void;
}

function TrackingRowWithNote(p: TrackingRowWithNoteProps) {
    return (
        <div>
            <TrackingRow
                label={p.label} hint={p.hint} value={p.value}
                activeColor={p.activeColor}
                onPick={p.onPick} onClear={p.onClear}
            />
            <input
                type="text"
                value={p.note}
                onChange={(e) => p.onNoteChange(e.target.value)}
                onBlur={p.onNoteBlur}
                placeholder={p.placeholder}
                className="w-full mt-1.5 text-xs border border-neutral-200 rounded px-2 py-1 placeholder:text-neutral-300 placeholder:italic focus:outline-none focus:border-[#0F766E]"
            />
        </div>
    );
}

interface TrackingRowProps {
    label: string;
    hint: string;
    value: number | null;
    activeColor: string;
    onPick: (n: number) => void;
    onClear: () => void;
}

function TrackingRow({ label, hint, value, activeColor, onPick, onClear }: TrackingRowProps) {
    return (
        <div>
            <div className="flex items-baseline justify-between mb-1.5">
                <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-neutral-700">{label}</span>
                    <span className="text-[10px] text-neutral-400">{hint}</span>
                </div>
                {value !== null && (
                    <button
                        onClick={onClear}
                        className="text-[10px] text-neutral-300 hover:text-rose-500 transition-colors"
                        title="해제"
                    >
                        해제
                    </button>
                )}
            </div>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        onClick={() => onPick(n)}
                        className={`flex-1 max-w-[40px] h-7 rounded text-xs font-medium transition-colors ${
                            value && n <= value
                                ? `${activeColor} text-white`
                                : "bg-neutral-100 text-neutral-400 hover:bg-neutral-200"
                        }`}
                    >
                        {n}
                    </button>
                ))}
            </div>
        </div>
    );
}

// 오늘 하루 AI 간략 정리 — 사용자가 "정리" 버튼 누르면 호출
function DailyAiSummary({ date }: { date: string }) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedAt, setGeneratedAt] = useState<string | null>(null);

    async function generate() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/planners/daily/ai-summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date }),
            });
            const d = await res.json();
            if (!res.ok) {
                setError(d.error === "ai_not_configured" ? "AI 키 미설정" : (d.message || "정리 실패"));
            } else {
                setSummary(d.summary);
                setGeneratedAt(d.generated_at);
            }
        } catch {
            setError("네트워크 오류");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs uppercase tracking-widest text-neutral-400">AI 정리</h2>
                <button
                    onClick={generate}
                    disabled={loading}
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-[#0F766E] disabled:opacity-50 transition-colors"
                >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    {summary ? "다시 정리" : "정리하기"}
                </button>
            </div>
            {error && <p className="text-xs text-rose-500">{error}</p>}
            {summary ? (
                <div className="space-y-1.5">
                    <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{summary}</p>
                    {generatedAt && (
                        <p className="text-[10px] text-neutral-400">
                            {new Date(generatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 생성
                        </p>
                    )}
                </div>
            ) : !error && !loading && (
                <p className="text-xs text-neutral-400 leading-relaxed">
                    오늘의 일정·태스크·트래킹·노트를 바탕으로 AI가 2~3문장으로 정리해 드립니다.
                </p>
            )}
        </section>
    );
}

// 향후 4주 일정 컴팩트 리스트
const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

function UpcomingSchedule({ date, entries }: { date: string; entries: CalendarEntry[] }) {
    const groups = useMemo(() => {
        const d1 = new Date(date + "T00:00:00"); d1.setDate(d1.getDate() + 1);
        const d2 = new Date(date + "T00:00:00"); d2.setDate(d2.getDate() + 28);
        const from = d1.toISOString().slice(0, 10);
        const to   = d2.toISOString().slice(0, 10);

        const kinds: CalendarKind[] = ["anniversary", "meeting"];
        const result: Record<string, Array<{ date: string; entry: CalendarEntry }>> = {
            anniversary: [], meeting: [],
        };

        entries.forEach((e) => {
            if (!kinds.includes(e.kind as CalendarKind)) return;
            expandOccurrences(e, from, to).forEach((o) => {
                result[e.kind].push({ date: o.date, entry: e });
            });
        });

        kinds.forEach(k => result[k].sort((a, b) => a.date.localeCompare(b.date)));
        return result;
    }, [date, entries]);

    const total = Object.values(groups).reduce((s, arr) => s + arr.length, 0);
    if (total === 0) return null;

    const today = new Date(date + "T00:00:00");

    function renderItem(o: { date: string; entry: CalendarEntry }, i: number) {
        const d = new Date(o.date + "T00:00:00");
        const days = Math.round((d.getTime() - today.getTime()) / 86400000);
        const mmdd = `${d.getMonth() + 1}/${d.getDate()}`;
        const dow  = DAY_KO[d.getDay()];
        const c = KIND_COLORS[o.entry.kind as CalendarKind];
        return (
            <li key={i} className="border-b border-neutral-50 last:border-0">
                <a
                    href={`/planners/app/daily?date=${o.date}`}
                    className="flex items-center gap-2 min-w-0 py-1 hover:bg-neutral-50 rounded transition-colors"
                >
                    <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${c.dot}`} />
                    <span className="shrink-0 w-10 text-[10px] text-neutral-500 font-mono tabular-nums">
                        {mmdd}<span className="text-neutral-300 ml-0.5">({dow})</span>
                    </span>
                    <span className="flex-1 truncate text-xs text-neutral-700">{o.entry.title}</span>
                    <span className="shrink-0 text-[9px] text-neutral-300 tabular-nums">D+{days}</span>
                </a>
            </li>
        );
    }

    const sections: Array<{ kind: CalendarKind; label: string }> = [
        { kind: "anniversary", label: "기념일" },
        { kind: "meeting",     label: "미팅" },
    ];

    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-4">
            <h2 className="text-xs uppercase tracking-widest text-neutral-400 mb-3">향후 4주</h2>
            <div className="space-y-3">
                {sections.map(({ kind, label }) => {
                    const items = groups[kind];
                    if (items.length === 0) return null;
                    const c = KIND_COLORS[kind];
                    return (
                        <div key={kind}>
                            <div className={`flex items-center gap-1.5 mb-1.5 px-1 py-0.5 rounded ${c.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                                <span className={`text-[10px] font-semibold uppercase tracking-wider ${c.text}`}>{label}</span>
                            </div>
                            <ul className="pl-1">
                                {items.map((o, i) => renderItem(o, i))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

