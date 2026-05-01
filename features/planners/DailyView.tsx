"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Trash2, Loader2, ArrowDownToLine, GripVertical, Clock, LayoutTemplate, Search, X, Maximize2, Pencil, PenLine, Eye, Star, Image as ImageIcon, Share2, Type, Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudDrizzle, CloudLightning, Thermometer, Sunrise, Sunset, Globe, MapPin, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PlannerDaily, PlannerTask } from "@/lib/planners/types";
import { localDateStr } from "@/lib/planners/types";
import { getLunarDate, HOLIDAYS } from "@/lib/planners/holidays";
import { resolveTemplateContent, isSpecialTemplate, tplDataKey } from "@/lib/planners/templates";
import { DAILY_RECOMMENDED, TOP_RECOMMENDED } from "@/lib/planners/template-recommendations";
import { CalendarEntryEditor } from "./CalendarEntryEditor";
import { DailyMomentsAuto } from "./DailyMoments";
import { DailyProjectsCard } from "./DailyProjectsCard";
import { DailyPlacesCard } from "./DailyPlacesCard";
import { DailyRoutinesCard } from "./DailyRoutinesCard";
import { useSwipeNav } from "./useSwipeNav";
import { DailyMiniMonth } from "./DailyMiniMonth";
import { expandOccurrences, isVisible, KIND_COLORS, KIND_LABELS, type CalendarEntry, type CalendarKind } from "@/lib/planners/calendar-rules";
import { renderFramework, type FrameworkData } from "./TemplatesView";
import { ExternalEventsBanner } from "./ExternalEventsBanner";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { Track } from "@/lib/analytics";
import { HandNote, type HandNoteData } from "./HandNote";
import { ConfirmSheet } from "./ConfirmSheet";
import { CanvasStudio } from "./CanvasStudio";
import { VoiceRecordButton } from "./VoiceRecordButton";
import { createClient } from "@/lib/supabase/client";

type TaskStatus = 'todo' | 'done' | 'carried' | 'cancelled';
type TaskPriority = '급중' | '급경' | '완중' | '완경';

const PRIORITY_META: Record<TaskPriority, { label: string; cls: string; dotCls: string }> = {
    '급중': { label: "급중", cls: "text-rose-600   bg-rose-50   border-rose-200",     dotCls: "bg-rose-500"    },
    '급경': { label: "급경", cls: "text-amber-600  bg-amber-50  border-amber-200",    dotCls: "bg-amber-500"   },
    '완중': { label: "완중", cls: "text-sky-600    bg-sky-50    border-sky-200",       dotCls: "bg-sky-500"     },
    '완경': { label: "완경", cls: "text-neutral-500 bg-neutral-100 border-neutral-200", dotCls: "bg-neutral-400" },
};
export type CornellRow = { id: string; cue: string; note: string };
type NoteItem = {
    id: string;
    type?: 'cornell' | 'template' | 'handwriting' | 'canvas';
    handMode?: boolean;
    templateKey?: string;
    templateLabel?: string;
    canvas_id?: string;
    title: string; cue: string; content: string; summary: string; rows: CornellRow[];
    handwriting?: HandNoteData;
    _cornellPages?: { rows: CornellRow[]; summary: string }[];
};

export const RESULT_CATEGORIES = [
    { key: "summary",  label: "정리",     hint: "오늘을 정리하면" },
    { key: "quote",    label: "들은 말",   hint: "오늘 들은 말 한 마디" },
    { key: "idea",     label: "아이디어", hint: "떠오른 생각" },
    { key: "insight",  label: "인사이트", hint: "오늘의 깨달음" },
    { key: "emotion",  label: "감정",     hint: "오늘의 감정 한 줄" },
    { key: "learning", label: "배움",     hint: "오늘 배운 것" },
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
        title: '노트 1',
        cue: '',
        content: '',
        summary: '',
        rows: [{ id: 'r1', cue: '', note: '' }],
    };
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
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
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

    function move(dir: "up" | "down") {
        const idx = notesList.findIndex(n => n.id === note.id);
        const other = dir === "up" ? idx - 1 : idx + 1;
        if (idx < 0 || other < 0 || other >= notesList.length) return;
        const next = [...notesList];
        [next[idx], next[other]] = [next[other], next[idx]];
        setNotesList(next);
        save({ notes: serializeNotesFn(next) });
    }
    const idx = notesList.findIndex(n => n.id === note.id);
    const isFirst = idx === 0;
    const isLast = idx === notesList.length - 1;
    // 자동 제목 — 사용자가 입력 안 한 상태 (템플릿은 라벨 그대로면 자동 취급)
    const isAutoTitle = !note.title || note.title === note.templateLabel || /^(노트|손글씨|캔버스|템플릿) \d+$/.test(note.title);

    return (
        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {/* Header — DailyNoteCard와 동일 패턴 */}
            <div className="px-4 py-2 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2">
                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        onClick={() => move("up")}
                        disabled={isFirst}
                        title="위로"
                        className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center text-neutral-400 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => move("down")}
                        disabled={isLast}
                        title="아래로"
                        className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center text-neutral-400 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                </div>
                <LayoutTemplate className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                <input
                    value={note.title}
                    onChange={(e) => {
                        const next = notesList.map(n => n.id === note.id ? { ...n, title: e.target.value } : n);
                        setNotesList(next);
                    }}
                    onBlur={() => save({ notes: serializeNotesFn(notesList) })}
                    placeholder={note.templateLabel || "이 템플릿으로 기록할 주제 한 줄"}
                    className={`flex-1 text-sm bg-transparent focus:outline-none focus:text-neutral-900 placeholder:text-neutral-300 placeholder:italic transition-colors ${
                        isAutoTitle
                            ? "italic font-normal text-neutral-400"
                            : "font-medium text-neutral-700"
                    }`}
                />
                <button
                    onClick={onExpand}
                    title="크게 보기"
                    className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-700"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => setConfirmDeleteOpen(true)}
                    title="삭제"
                    className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-neutral-400 hover:text-red-500"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
            <ConfirmSheet
                open={confirmDeleteOpen}
                message={`"${note.title || '이 노트'}"를 삭제할까요?`}
                onConfirm={() => {
                    setConfirmDeleteOpen(false);
                    const next = notesList.filter(n => n.id !== note.id);
                    setNotesList(next);
                    save({ notes: serializeNotesFn(next) });
                }}
                onCancel={() => setConfirmDeleteOpen(false)}
            />
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

// ── 코넬 rows 인라인 편집 — Daily/Project 공통 ──
export function CornellRowsInline({
    rows,
    summary,
    onChange,
    onCommit,
}: {
    rows: CornellRow[];
    summary: string;
    onChange: (rows: CornellRow[], summary: string) => void;
    onCommit: () => void;
}) {
    function updateRow(id: string, patch: Partial<CornellRow>) {
        onChange(rows.map(r => r.id === id ? { ...r, ...patch } : r), summary);
    }
    function addRow() {
        const nextRow: CornellRow = { id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, cue: "", note: "" };
        onChange([...rows, nextRow], summary);
        onCommit();
    }
    function removeRow(id: string) {
        const next = rows.filter(r => r.id !== id);
        onChange(next.length > 0 ? next : [{ id: "r1", cue: "", note: "" }], summary);
        onCommit();
    }
    function setSummaryVal(v: string) {
        onChange(rows, v);
    }

    return (
        <div className="px-4 py-3">
            {/* 컬럼 헤더 */}
            <div className="grid grid-cols-[min(140px,35%)_1fr_auto] gap-3 text-[10px] uppercase tracking-widest text-neutral-300 mb-1.5 px-1">
                <span>단서 · 키워드</span>
                <span>노트</span>
                <span></span>
            </div>
            {rows.length === 0 ? (
                <p className="text-xs text-neutral-300 py-3 text-center italic">행이 없습니다 · 아래 + 행 추가</p>
            ) : (
                <div className="space-y-1">
                    {rows.map((r) => (
                        <div key={r.id} className="group grid grid-cols-[min(140px,35%)_1fr_auto] gap-3 items-start">
                            <input
                                type="text"
                                value={r.cue}
                                onChange={(e) => updateRow(r.id, { cue: e.target.value })}
                                onBlur={onCommit}
                                placeholder="키워드"
                                className="text-sm text-[#0F766E] font-medium bg-transparent focus:outline-none placeholder:text-neutral-300 placeholder:italic placeholder:font-light py-1"
                            />
                            <textarea
                                value={r.note}
                                onChange={(e) => updateRow(r.id, { note: e.target.value })}
                                onBlur={onCommit}
                                placeholder="이 키워드에 대한 노트"
                                rows={1}
                                className="text-sm text-neutral-800 bg-transparent focus:outline-none placeholder:text-neutral-300 placeholder:italic placeholder:font-light resize-none py-1 leading-relaxed"
                                onInput={(e) => {
                                    const t = e.currentTarget;
                                    t.style.height = "auto";
                                    t.style.height = `${t.scrollHeight}px`;
                                }}
                            />
                            <button
                                onClick={() => removeRow(r.id)}
                                title="행 삭제"
                                className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-red-500 transition-opacity p-1"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {/* 행 추가 */}
            <button
                onClick={addRow}
                className="w-full mt-2 py-1.5 text-[11px] italic font-light text-neutral-300 hover:text-[#0F766E] hover:not-italic border border-dashed border-neutral-200 hover:border-[#0F766E] rounded transition-colors"
            >
                + 행 추가
            </button>
            {/* 요약 */}
            <div className="mt-3 pt-3 border-t border-neutral-100">
                <p className="text-[10px] uppercase tracking-widest text-neutral-300 mb-1">요약</p>
                <textarea
                    value={summary}
                    onChange={(e) => setSummaryVal(e.target.value)}
                    onBlur={onCommit}
                    placeholder="이 노트의 핵심 한 줄"
                    rows={1}
                    className="w-full text-xs text-neutral-600 italic bg-transparent focus:outline-none placeholder:text-neutral-300 placeholder:italic placeholder:font-light resize-none leading-relaxed"
                    onInput={(e) => {
                        const t = e.currentTarget;
                        t.style.height = "auto";
                        t.style.height = `${t.scrollHeight}px`;
                    }}
                />
            </div>
        </div>
    );
}

// ── 코넬·손글씨·캔버스 노트 인라인 카드 (프로젝트 NoteCard와 같은 패턴) ──
function DailyNoteCard({
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
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    function updateTitle(v: string) {
        const next = notesList.map(n => n.id === note.id ? { ...n, title: v } : n);
        setNotesList(next);
    }
    function commitTitle() { save({ notes: serializeNotesFn(notesList) }); }
    function remove() {
        const next = notesList.filter(n => n.id !== note.id);
        setNotesList(next);
        save({ notes: serializeNotesFn(next) });
    }
    function move(dir: "up" | "down") {
        const idx = notesList.findIndex(n => n.id === note.id);
        const other = dir === "up" ? idx - 1 : idx + 1;
        if (idx < 0 || other < 0 || other >= notesList.length) return;
        const next = [...notesList];
        [next[idx], next[other]] = [next[other], next[idx]];
        setNotesList(next);
        save({ notes: serializeNotesFn(next) });
    }
    const idx = notesList.findIndex(n => n.id === note.id);
    const isFirst = idx === 0;
    const isLast = idx === notesList.length - 1;

    // 자동 제목인지 — "기본 노트 1", "손글씨 2" 같은 기본값
    const isAutoTitle = /^(기본 노트|노트|손글씨|캔버스) \d+$/.test(note.title);
    const placeholder =
        note.type === 'handwriting' ? "예: 회의 메모 · 손글씨 정리"
        : note.type === 'canvas' ? "예: 동선 스케치"
        : "예: AI 마케팅 특강 — 강의 구성안";

    return (
        <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-4 py-2 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2">
                {/* 위/아래 이동 — 프로젝트 NoteCard와 동일 패턴 */}
                <div className="flex items-center gap-0.5 shrink-0">
                    <button
                        onClick={() => move("up")}
                        disabled={isFirst}
                        title="위로"
                        className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center text-neutral-400 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => move("down")}
                        disabled={isLast}
                        title="아래로"
                        className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center text-neutral-400 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                </div>
                {note.type === 'handwriting' && <PenLine className="h-3.5 w-3.5 text-[#0F766E] shrink-0" />}
                {note.type === 'canvas' && <ImageIcon className="h-3.5 w-3.5 text-sky-500 shrink-0" />}
                <input
                    type="text"
                    value={note.title}
                    onChange={(e) => updateTitle(e.target.value)}
                    onBlur={commitTitle}
                    placeholder={placeholder}
                    className={`flex-1 min-w-0 text-sm bg-transparent focus:outline-none focus:text-neutral-900 placeholder:text-neutral-300 placeholder:italic transition-colors ${
                        isAutoTitle
                            ? "italic font-light text-neutral-400"
                            : "font-medium text-neutral-700"
                    }`}
                />
                <button
                    onClick={onExpand}
                    title="크게 보기"
                    className="w-6 h-6 rounded hover:bg-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-700"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={() => setConfirmDeleteOpen(true)}
                    title="삭제"
                    className="w-6 h-6 rounded hover:bg-red-50 flex items-center justify-center text-neutral-400 hover:text-red-500"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {note.type === 'handwriting' ? (
                <div
                    onClick={onExpand}
                    className="relative h-48 overflow-hidden cursor-pointer group"
                >
                    {note.handwriting ? (
                        <div className="pointer-events-none px-3 pt-2">
                            <HandNote value={note.handwriting} onChange={() => {}} height={180} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-xs text-neutral-300">손글씨 비어 있음 — 클릭해 시작</div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Maximize2 className="h-3.5 w-3.5" /> 클릭해서 편집
                        </span>
                    </div>
                </div>
            ) : note.type === 'canvas' ? (
                <div
                    onClick={onExpand}
                    className="px-4 py-8 text-center cursor-pointer hover:bg-neutral-50 transition-colors"
                >
                    <ImageIcon className="h-6 w-6 text-neutral-300 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500">자유 캔버스 — 클릭해서 그리기</p>
                </div>
            ) : (
                /* cornell — 미리보기 (편집은 모달) */
                <div onClick={onExpand} className="px-4 py-3 cursor-pointer hover:bg-neutral-50/50 transition-colors max-h-64 overflow-hidden relative">
                    {(note.rows && note.rows.length > 0 && note.rows.some(r => r.cue || r.note)) ? (
                        <div className="space-y-1.5">
                            {note.rows.map((r) => (
                                <div key={r.id} className="grid grid-cols-[140px_1fr] gap-3 text-sm">
                                    <span className="text-[#0F766E] font-medium truncate">{r.cue || <span className="text-neutral-300 italic">키워드</span>}</span>
                                    <span className="text-neutral-700 whitespace-pre-wrap line-clamp-2">{r.note || <span className="text-neutral-300 italic">노트</span>}</span>
                                </div>
                            ))}
                            {note.summary && (
                                <p className="pt-2 mt-2 border-t border-neutral-100 text-xs text-neutral-600 italic line-clamp-2">{note.summary}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-neutral-300 py-4 text-center italic">내용 없음 — 클릭해 작성</p>
                    )}
                </div>
            )}
            <ConfirmSheet
                open={confirmDeleteOpen}
                message={`"${note.title || '이 노트'}"를 삭제할까요?`}
                onConfirm={() => { setConfirmDeleteOpen(false); remove(); }}
                onCancel={() => setConfirmDeleteOpen(false)}
            />
        </section>
    );
}

export function DailyView({ initialDate }: { initialDate: string }) {
    const router = useRouter();
    const [date, setDate] = useState(initialDate);
    // URL ?date= 변경 시 state 동기화 (미니 캘린더·향후 일정 등에서 같은 페이지 내 날짜 점프)
    useEffect(() => { setDate(initialDate); }, [initialDate]);
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
    const [userRole, setUserRole] = useState<string | null>(null);
    const [calEntries, setCalEntries] = useState<CalendarEntry[]>([]);
    const [upcomingEntries, setUpcomingEntries] = useState<CalendarEntry[]>([]);
    const [calEditorOpen, setCalEditorOpen] = useState(false);
    const [calEditing, setCalEditing] = useState<Partial<CalendarEntry> | null>(null);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [memberId, setMemberId] = useState<string | null>(null);
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
    const [syncConflict, setSyncConflict] = useState(false);
    const lastSaveTimeRef = useRef<number>(0);
    const offlineQueueKey = "planners_offline_queue";
    // (인라인 Task 입력 제거 — 모달로 통합)
    // 활성 프로젝트 목록 (Task 태그용)
    const [activeProjects, setActiveProjects] = useState<Array<{ id: string; title: string; color: string | null }>>([]);
    const [carrying, setCarrying] = useState(false);
    const [pendingInfo, setPendingInfo] = useState<{ count: number; days: number; oldest: string | null } | null>(null);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pendingGroups, setPendingGroups] = useState<Array<{ date: string; tasks: Array<{ id: string; text: string; priority?: string | null; time?: string | null }> }>>([]);
    const [pendingLoading, setPendingLoading] = useState(false);
    const [selectedPendingIds, setSelectedPendingIds] = useState<Set<string>>(new Set());
    const [weather, setWeather] = useState<{ temp: number; code: number; sunrise?: string; sunset?: string } | null>(null);
    const [tzMismatch, setTzMismatch] = useState<string | null>(null); // 홈 타임존과 다를 때 현재 TZ
    const [commute, setCommute] = useState<{ depart: string | null; arrive: string | null; minutes: number | null } | null>(null);
    const [commuteOpen, setCommuteOpen] = useState(false);
    const [commuteDepart, setCommuteDepart] = useState("");
    const [commuteArrive, setCommuteArrive] = useState("");
    const [commuteSaving, setCommuteSaving] = useState(false);
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
    const [expandedNotePage, setExpandedNotePage] = useState(0);
    const [allCornellPages, setAllCornellPages] = useState<{ rows: CornellRow[]; summary: string }[]>([]);
    const [allHandPages, setAllHandPages] = useState<HandNoteData[]>([]);
    const [imgFootprint, setImgFootprint] = useState(0);
    const [editingNoteIds, setEditingNoteIds] = useState<Set<string>>(new Set());
    const [shareCopied, setShareCopied] = useState(false);
    // 코넬 노트 컬럼 헤더 높이 측정 (이미지 푸트프린트 오프셋 보정)
    const cornellHeaderRef = useRef<HTMLDivElement>(null);
    // 노트 드래그 순서 변경
    const noteDragRef = useRef<{ dragIdx: number; overIdx: number } | null>(null);
    // 코넬 노트 — Enter 후 새 행 포커스 추적
    const cornellFocusPendingId = useRef<string | null>(null);

    function toggleEditing(id: string) {
        setEditingNoteIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    async function shareResult() {
        const shareText = [
            date,
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
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=auto`
                );
                if (!res.ok) return;
                const d = await res.json();
                const temp = Math.round(d.current.temperature_2m);
                const code = d.current.weather_code;
                const sunrise = d.daily?.sunrise?.[0]?.slice(11, 16) ?? undefined;
                const sunset = d.daily?.sunset?.[0]?.slice(11, 16) ?? undefined;
                setWeather({ temp, code, sunrise, sunset });
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

    // 타임존 자동 감지 — 홈 타임존과 다르면 뱃지 표시
    useEffect(() => {
        const current = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const home = localStorage.getItem("planners_home_timezone");
        if (!home) {
            localStorage.setItem("planners_home_timezone", current);
        } else if (home !== current) {
            setTzMismatch(current);
        }
    }, []);

    // 출퇴근 소요시간 — transport 카테고리 + activity가 정확히 "출근"/"퇴근"인 루틴만
    const [departId, setDepartId] = useState<string | null>(null);
    const [arriveId, setArriveId] = useState<string | null>(null);
    useEffect(() => {
        (async () => {
            const res = await fetch(`/api/planners/routines?date=${date}`);
            if (!res.ok) return;
            const d = await res.json();
            const transport = (d.routines ?? []).filter((r: { category: string }) => r.category === "transport");
            const departItem = transport.find((r: { activity: string }) => r.activity === "출근");
            const arriveItem = transport.find((r: { activity: string }) => r.activity === "퇴근");
            setDepartId(departItem?.id ?? null);
            setArriveId(arriveItem?.id ?? null);
            const depart = departItem?.start_time?.slice(0, 5) ?? null;
            const arrive = arriveItem?.start_time?.slice(0, 5) ?? null;
            let minutes: number | null = null;
            if (depart && arrive) {
                const [dh, dm] = depart.split(":").map(Number);
                const [ah, am] = arrive.split(":").map(Number);
                minutes = (ah * 60 + am) - (dh * 60 + dm);
                if (minutes < 0) minutes = null;
            }
            setCommute({ depart, arrive, minutes });
            setCommuteDepart(depart ?? "");
            setCommuteArrive(arrive ?? "");
        })();
    }, [date]);

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
                    if (d.user?.user_role) setUserRole(d.user.user_role);
                    if (d.memberId) setMemberId(d.memberId);
                } else {
                    setTrackingMetrics(["satisfaction"]);
                }
            } catch { setTrackingMetrics(["satisfaction"]); }
        })();
        return () => { cancelled = true; };
    }, []);

    // 온라인/오프라인 감지 + 재연결 시 큐 플러시
    useEffect(() => {
        function handleOnline() {
            setIsOnline(true);
            flushOfflineQueue();
        }
        function handleOffline() { setIsOnline(false); }
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Supabase Realtime — 다른 기기 변경 감지 → 자동 refetch
    useEffect(() => {
        if (!memberId) return;
        const supabase = createClient();
        const channel = supabase
            .channel(`planners_daily:${memberId}:${date}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "planners_daily",
                    filter: `member_id=eq.${memberId}`,
                },
                (payload) => {
                    const row = payload.new as { date?: string; updated_at?: string } | undefined;
                    if (!row || row.date !== date) return;
                    // 내가 저장한 지 3초 이내면 무시 (자기 변경 반영 방지)
                    if (Date.now() - lastSaveTimeRef.current < 3000) return;
                    // 다른 기기 변경 → 최신 데이터 refetch
                    fetch(`/api/planners/daily?date=${date}`)
                        .then((r) => r.ok ? r.json() : null)
                        .then((data) => {
                            if (!data?.daily) return;
                            const d = data.daily;
                            setTasks(d.tasks || []);
                            setNotesList(
                                Array.isArray(d.notes_list) && d.notes_list.length > 0
                                    ? d.notes_list
                                    : [makeDefaultCornellNote()]
                            );
                            setEnergy(d.energy_level ?? null);
                            setSatisfaction(d.satisfaction_level ?? null);
                            setMood(d.mood ?? null);
                            setExerciseType(d.exercise_type ?? ""); setExerciseMinutes(d.exercise_minutes ?? "");
                            setExerciseDistance(d.exercise_distance ?? ""); setExerciseNote(d.exercise_note ?? "");
                            setBpSys(d.bp_systolic ?? ""); setBpDia(d.bp_diastolic ?? "");
                            setBloodSugar(d.blood_sugar ?? ""); setBodyWeight(d.body_weight ?? "");
                            setBodyTemp(d.body_temp ?? ""); setHealthNote(d.health_note ?? "");
                            setStudy(d.study_level ?? null); setStudyNote(d.study_note ?? "");
                            setFaith(d.faith_level ?? null); setFaithNote(d.faith_note ?? "");
                            setResult(d.daily_result || ""); setResultCategory(d.daily_result_category ?? "");
                            setSyncConflict(true);
                            setTimeout(() => setSyncConflict(false), 3000);
                        })
                        .catch(() => { /* silent */ });
                }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [date, memberId]);

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

    // 모달 열릴 때 페이지 파싱
    useEffect(() => {
        if (!expandedNote) { setExpandedNotePage(0); setAllCornellPages([]); setAllHandPages([]); setImgFootprint(0); return; }
        setExpandedNotePage(0);
        const isHandMode = expandedNote.type === 'handwriting'
            || (expandedNote.type !== 'template' && expandedNote.type !== 'canvas' && !!expandedNote.handMode);
        if (isHandMode) {
            const hw = expandedNote.handwriting as (HandNoteData & { _pages?: HandNoteData[] }) | undefined;
            const pages = hw?._pages ?? (hw ? [{ strokes: hw.strokes, width: hw.width, height: hw.height }] : [{ strokes: [], width: 800, height: 480 }]);
            setAllHandPages(pages);
            setAllCornellPages([]);
        } else if (expandedNote.type !== 'template' && expandedNote.type !== 'canvas') {
            let cornellPages: { rows: CornellRow[]; summary: string }[] = [];
            try {
                const raw = expandedNote.content;
                const parsed = raw ? JSON.parse(raw) : null;
                if (parsed?._cornell && Array.isArray(parsed._pages) && parsed._pages.length > 0) {
                    cornellPages = parsed._pages;
                } else {
                    cornellPages = [{ rows: expandedNote.rows, summary: expandedNote.summary }];
                }
            } catch { cornellPages = [{ rows: expandedNote.rows, summary: expandedNote.summary }]; }
            setAllCornellPages(cornellPages);
            // 코넬 노트에도 손글씨 레이어 페이지를 함께 로드 (페이지 수 동기화)
            const hw = expandedNote.handwriting as (HandNoteData & { _pages?: HandNoteData[] }) | undefined;
            if (hw?._pages && hw._pages.length > 0) {
                // 저장된 손글씨 페이지 수가 코넬 페이지 수와 다를 경우 맞춰줌
                const baseHands = hw._pages;
                const synced = cornellPages.map((_, i) => baseHands[i] ?? { strokes: [], width: 800, height: 480 });
                setAllHandPages(synced);
            } else if (hw) {
                const first: HandNoteData = { strokes: hw.strokes, width: hw.width, height: hw.height };
                const synced = cornellPages.map((_, i) => i === 0 ? first : { strokes: [], width: 800, height: 480 });
                setAllHandPages(synced);
                // 첫 페이지 손글씨를 expandedNote에 반영
                setExpandedNote(prev => prev ? { ...prev, handwriting: first } : prev);
            } else {
                setAllHandPages(cornellPages.map(() => ({ strokes: [], width: 800, height: 480 })));
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [expandedNote?.id]);

    // 추천 템플릿 칩 노출용 — 진입 시 템플릿 목록 사전 로드
    useEffect(() => {
        if (tplList.length > 0) return;
        (async () => {
            try {
                const res = await fetch("/api/planners/templates");
                if (res.ok) {
                    const d = await res.json();
                    setTplList(d.templates || []);
                }
            } catch { /* noop */ }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            setWeather(null);
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
                                    // Cornell+손글씨 공존: type 무관하게 handwriting 필드 복원
                                    handwriting: n.handwriting && typeof n.handwriting === 'object' ? n.handwriting as HandNoteData : undefined,
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
                    if (data.daily.updated_at) {
                        setLastSavedAt(new Date(data.daily.updated_at));
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

    async function flushOfflineQueue() {
        try {
            const raw = localStorage.getItem(offlineQueueKey);
            if (!raw) return;
            const queue: Array<{ date: string; patch: Partial<PlannerDaily> }> = JSON.parse(raw);
            if (!queue.length) return;
            localStorage.removeItem(offlineQueueKey);
            for (const item of queue) {
                await fetch(`/api/planners/daily`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: item.date, ...item.patch }),
                });
            }
        } catch { /* silent */ }
    }

    async function save(patch: Partial<PlannerDaily>) {
        if (!isOnline) {
            try {
                const raw = localStorage.getItem(offlineQueueKey);
                const queue = raw ? JSON.parse(raw) : [];
                // merge patches for same date
                const idx = queue.findIndex((q: { date: string }) => q.date === date);
                if (idx >= 0) queue[idx].patch = { ...queue[idx].patch, ...patch };
                else queue.push({ date, patch });
                localStorage.setItem(offlineQueueKey, JSON.stringify(queue));
                setSaveError("오프라인 — 재연결 시 자동 저장됩니다.");
                setTimeout(() => setSaveError(null), 3000);
            } catch { /* silent */ }
            return;
        }
        setSaving(true);
        lastSaveTimeRef.current = Date.now();
        try {
            const res = await fetch(`/api/planners/daily`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, ...patch }),
            });
            if (res.ok) {
                setLastSavedAt(new Date());
            } else {
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

    async function openPendingModal() {
        setShowPendingModal(true);
        setPendingLoading(true);
        setSelectedPendingIds(new Set());
        try {
            const res = await fetch(`/api/planners/daily/pending-tasks?date=${date}&days=60`);
            if (res.ok) {
                const d = await res.json();
                const groups = d.groups ?? [];
                setPendingGroups(groups);
                // 기본: 전체 선택
                const allIds = new Set<string>(groups.flatMap((g: { tasks: Array<{ id: string }> }) => g.tasks.map((t: { id: string }) => t.id)));
                setSelectedPendingIds(allIds);
            }
        } finally {
            setPendingLoading(false);
        }
    }

    async function importSelectedPending() {
        if (selectedPendingIds.size === 0) { setShowPendingModal(false); return; }
        setCarrying(true);
        try {
            // 선택된 태스크만 수집
            const toImport: Array<{ id: string; text: string; priority?: string | null; time?: string | null; source_date: string }> = [];
            const sourceUpdates: Map<string, Array<{ id: string; text: string; status: string; priority?: string | null; time?: string | null }>> = new Map();

            for (const group of pendingGroups) {
                for (const t of group.tasks) {
                    // 해당 date의 전체 tasks를 가져와야 carried 처리가 정확 — 여기선 간단하게 처리
                    if (selectedPendingIds.has(t.id)) {
                        toImport.push({ ...t, source_date: group.date });
                    }
                }
                // source_date별 변경할 task id 목록
                const selectedInGroup = group.tasks.filter(t => selectedPendingIds.has(t.id)).map(t => t.id);
                if (selectedInGroup.length > 0) {
                    sourceUpdates.set(group.date, selectedInGroup.map(id => ({ id, status: 'carried' } as { id: string; text: string; status: string })));
                }
            }

            if (toImport.length === 0) { setShowPendingModal(false); return; }

            // 1. 오늘 tasks에 추가
            const newTasks: PlannerTask[] = toImport.map(t => ({
                id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                text: t.text,
                status: "todo" as const,
                time: null,
                project_id: null,
                priority: (t.priority as PlannerTask["priority"]) ?? null,
                memo: null,
            }));
            const next = [...tasks, ...newTasks];
            setTasks(next);
            await save({ tasks: next });

            // 2. 원본 날짜에서 carried 처리 (각 날짜의 전체 tasks 불러와서 선택 항목만 carried)
            await Promise.all(
                Array.from(sourceUpdates.entries()).map(async ([srcDate, selectedIds]) => {
                    const r = await fetch(`/api/planners/daily?date=${srcDate}`);
                    if (!r.ok) return;
                    const d = await r.json();
                    if (!d.daily?.tasks) return;
                    const idSet = new Set(selectedIds.map(s => s.id));
                    const updated = (d.daily.tasks as PlannerTask[]).map(t =>
                        idSet.has(t.id) ? { ...t, status: 'carried' } : t
                    );
                    await fetch(`/api/planners/daily`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ date: srcDate, tasks: updated }),
                    });
                })
            );

            // 3. pendingInfo 리셋
            const remaining = pendingGroups.flatMap(g => g.tasks).filter(t => !selectedPendingIds.has(t.id)).length;
            if (remaining === 0) setPendingInfo({ count: 0, days: 0, oldest: null });
            else setPendingInfo(prev => prev ? { ...prev, count: remaining } : null);

            Track.carryOverPending({ count: toImport.length, days: sourceUpdates.size });
            setShowPendingModal(false);
        } finally {
            setCarrying(false);
        }
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
            // Cornell — 멀티페이지 지원
            const allPages = n._cornellPages ?? [{ rows: n.rows, summary: n.summary }];
            const page0 = allPages[0] ?? { rows: n.rows, summary: n.summary };
            const cornellContent = {
                _cornell: true,
                rows: page0.rows,
                summary: page0.summary,
                ...(allPages.length > 1 ? { _pages: allPages } : {}),
            };
            const cornellBase = { id: n.id, type: n.type ?? 'cornell', title: n.title, cue: '', content: JSON.stringify(cornellContent), summary: page0.summary };
            return n.handwriting ? { ...cornellBase, handwriting: n.handwriting } : cornellBase;
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
        // 인라인 추가 — 모달 자동 오픈 X (Project와 동일 동작)
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

    function WeatherIcon({ code, className }: { code: number; className?: string }) {
        const cls = className ?? "h-3.5 w-3.5";
        if (code === 0) return <Sun className={cls} />;
        if (code <= 2)  return <Cloud className={cls} />;
        if (code <= 3)  return <Cloud className={cls} />;
        if (code <= 48) return <CloudFog className={cls} />;
        if (code <= 57) return <CloudDrizzle className={cls} />;
        if (code <= 67) return <CloudRain className={cls} />;
        if (code <= 77) return <CloudSnow className={cls} />;
        if (code <= 82) return <CloudRain className={cls} />;
        if (code <= 86) return <CloudSnow className={cls} />;
        if (code <= 99) return <CloudLightning className={cls} />;
        return <Thermometer className={cls} />;
    }

    return (
        <div ref={swipeRef} className="pp-view max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12 overflow-x-hidden">
            {/* Header — 모바일은 세로 스택, 데스크톱은 가로 분리 */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 md:mb-8">
                <div className="min-w-0 flex items-start gap-2 md:gap-3">
                    <button
                        onClick={() => navigateDate(-1)}
                        className="mt-1 w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1
                                className={`font-serif text-2xl md:text-3xl text-neutral-900 whitespace-nowrap ${
                                    isToday ? "underline decoration-[#0F766E] decoration-2 underline-offset-[6px]" : ""
                                }`}
                                title={isToday ? "오늘" : undefined}
                            >
                                {formattedDate}
                            </h1>
                            <button
                                onClick={() => navigateDate(1)}
                                className="w-8 h-8 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="text-sm text-neutral-500 mt-1 flex items-center gap-2 flex-wrap">
                            {weather && (
                                <span className="inline-flex items-center gap-1 text-neutral-500">
                                    <WeatherIcon code={weather.code} />
                                    {weather.temp}°C
                                </span>
                            )}
                            {/* 일출/일몰은 시간 트래킹 페이지로 이동 */}
                            {tzMismatch && (
                                <button
                                    onClick={() => {
                                        localStorage.setItem("planners_home_timezone", tzMismatch);
                                        setTzMismatch(null);
                                    }}
                                    className="inline-flex items-center gap-1 text-amber-400 text-xs hover:text-amber-300 transition-colors"
                                    title={`현재 타임존: ${tzMismatch} — 클릭하면 홈으로 저장`}
                                >
                                    <Globe className="h-3 w-3" />
                                    {tzMismatch.split("/").pop()?.replace(/_/g, " ")}
                                </button>
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
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <PlannersUtilityLinks />
                    {!isOnline && (
                        <span className="text-xs text-amber-500 font-medium">오프라인</span>
                    )}
                    {syncConflict && (
                        <span className="text-xs text-sky-500 font-medium">다른 기기에서 동기화됨</span>
                    )}
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
                <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:items-start">
                  {/* 좌측 컬럼 (tasks + notes) — 모바일은 contents로 풀어 order 적용, 데스크톱은 flex */}
                  <div className="contents md:flex md:flex-col md:gap-6 md:col-span-2 md:col-start-1 md:row-start-1 min-w-0">
                    {/* 1. 일정 & 업무 */}
                    <div className="order-1 md:order-none space-y-4 min-w-0">
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
                                                    onClick={openPendingModal}
                                                    disabled={carrying}
                                                    title={pendingInfo.oldest
                                                        ? `${pendingInfo.oldest}부터 미완료 ${pendingInfo.count}건`
                                                        : `미완료 ${pendingInfo.count}건`}
                                                    className="flex items-center gap-1 text-[10px] px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100 transition-colors disabled:opacity-50"
                                                >
                                                    {carrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowDownToLine className="h-3 w-3" />}
                                                    미완 {pendingInfo.count}건
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setCalEditing(null); setCalEditorOpen(true); }}
                                                title="일정 추가"
                                                className="p-1.5 rounded text-neutral-300 hover:text-[#0F766E] hover:bg-neutral-100 transition-colors"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
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
                                                        <span className="flex-1 text-xs text-neutral-800">{entry.title}</span>
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
                                                        className="w-full flex items-start gap-2.5 px-1 py-1 rounded hover:bg-neutral-50 text-left"
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${c.dot}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-xs text-neutral-800">{entry.title}</span>
                                                            {(entry.location || entry.with_whom) && (
                                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                    {entry.location && (
                                                                        <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
                                                                            <MapPin className="h-2.5 w-2.5" />{entry.location}
                                                                        </span>
                                                                    )}
                                                                    {entry.with_whom && (
                                                                        <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
                                                                            <Users className="h-2.5 w-2.5" />{entry.with_whom}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${c.bg} ${c.text}`}>미팅</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* 2. 시간 기반 항목 (미팅 + 시간 있는 태스크) */}
                                    <div className="space-y-0.5">
                                        {isEmpty && (
                                            <p className="text-xs text-neutral-300 italic py-2">일정이나 할 일을 추가해 보세요.</p>
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
                                                        className="w-full flex items-start gap-2.5 px-1 py-1.5 rounded hover:bg-neutral-50 text-left group"
                                                    >
                                                        <span className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center mt-0.5 ${c.ring} border-sky-300`} />
                                                        <span className="shrink-0 text-[11px] font-mono text-neutral-400 w-[76px] mt-0.5">
                                                            {ampm} {t}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-xs text-neutral-800">{item.entry.title}</span>
                                                            {(item.entry.location || item.entry.with_whom) && (
                                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                    {item.entry.location && (
                                                                        <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
                                                                            <MapPin className="h-2.5 w-2.5" />{item.entry.location}
                                                                        </span>
                                                                    )}
                                                                    {item.entry.with_whom && (
                                                                        <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
                                                                            <Users className="h-2.5 w-2.5" />{item.entry.with_whom}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[9px] text-sky-500 opacity-40 group-hover:opacity-80 mt-0.5">미팅</span>
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
                                                        <span className={`flex-1 text-xs ${strike ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                                                            {t.text}
                                                        </span>
                                                        <button
                                                            onClick={() => removeTask(t.id)}
                                                            className="text-neutral-300 hover:text-rose-400 transition-colors"
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

                    </div>

                    {/* 4. 노트 — mobile: order-3 (향후 일정 다음), desktop: 좌측 컬럼 두번째 */}
                    <div className="order-3 md:order-none space-y-4 min-w-0">
                        {/* 노트 추가 — 일정&업무 바로 아래 (같은 col-span-2 컨테이너) */}

                        {/* 노트 추가 버튼 */}
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                            <button
                                onClick={() => {
                                    const idx = notesList.filter(n => n.type === 'cornell' || !n.type).length + 1;
                                    const newNote: NoteItem = {
                                        id: `n_${Date.now()}`, type: 'cornell', title: `기본 노트 ${idx}`,
                                        cue: "", content: "", summary: "",
                                        rows: [{ id: 'r1', cue: '', note: '' }],
                                        // 드로잉 레이어 기본 탑재 — 헤더 "손글씨" 토글로 언제든 사용
                                        handwriting: { strokes: [], width: 800, height: 480 },
                                    };
                                    const next = [...notesList, newNote];
                                    setNotesList(next);
                                    save({ notes: serializeNotes(next) });
                                }}
                                title="텍스트·코넬 노트 + 손글씨 레이어 포함"
                                className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                기본 노트
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
                            {/* 음성 녹음 → 텍스트 변환 후 새 노트 */}
                            <VoiceRecordButton
                                onTranscribed={(text) => {
                                    const idx = notesList.filter(n => n.type === 'cornell' || !n.type).length + 1;
                                    const newNote: NoteItem = {
                                        id: `n_${Date.now()}`,
                                        type: 'cornell',
                                        title: `음성 메모 ${idx}`,
                                        cue: "🎤 음성",
                                        content: text,
                                        summary: "",
                                        rows: [{ id: 'r1', cue: '🎤', note: text }],
                                        handwriting: { strokes: [], width: 800, height: 480 },
                                    };
                                    const next = [...notesList, newNote];
                                    setNotesList(next);
                                    save({ notes: serializeNotes(next) });
                                }}
                            />
                            {/* 연구원 전용 — 연구노트 */}
                            {userRole === "researcher" && (
                                <button
                                    onClick={() => {
                                        const idx = notesList.filter(n => n.type === 'cornell').length + 1;
                                        const researchCues = [
                                            { id: "cue_q",  cue: "🔬 연구 질문",  note: "" },
                                            { id: "cue_h",  cue: "💡 가설",       note: "" },
                                            { id: "cue_m",  cue: "📐 방법·도구",  note: "" },
                                            { id: "cue_o",  cue: "📊 관찰·데이터",note: "" },
                                            { id: "cue_i",  cue: "🧠 해석·인사이트", note: "" },
                                            { id: "cue_n",  cue: "➡️ 다음 스텝",  note: "" },
                                        ];
                                        const newNote: NoteItem = {
                                            id: `n_${Date.now()}`,
                                            type: "cornell",
                                            title: `연구노트 ${idx}`,
                                            cue: "",
                                            content: "",
                                            summary: "",
                                            rows: researchCues,
                                        };
                                        const next = [...notesList, newNote];
                                        setNotesList(next);
                                        save({ notes: serializeNotes(next) });
                                    }}
                                    title="연구노트 — 질문·가설·방법·관찰·해석·다음 스텝"
                                    className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-teal-200 rounded-lg text-xs text-teal-600 hover:border-teal-400 hover:bg-teal-50 transition-colors"
                                >
                                    <span className="text-sm leading-none">🔬</span>
                                    연구노트
                                </button>
                            )}
                        </div>

                        {/* Notes 목록 — 프로젝트와 동일 패턴: 전체 너비 인라인 렌더 */}
                        {notesList.length > 0 && (
                        <div className="space-y-3">
                            {notesList.map((note, noteIdx) => (
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
                                    className="group/note-drag relative"
                                >
                                    <div className="absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover/note-drag:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10">
                                        <GripVertical className="h-4 w-4 text-neutral-300" />
                                    </div>
                                    {note.type === 'template' ? (
                                        <TemplateNoteBlock
                                            note={note}
                                            notesList={notesList}
                                            setNotesList={setNotesList}
                                            save={save}
                                            serializeNotesFn={serializeNotes}
                                            onExpand={() => setExpandedNote(note)}
                                        />
                                    ) : (
                                        <DailyNoteCard
                                            note={note}
                                            notesList={notesList}
                                            setNotesList={setNotesList}
                                            save={save}
                                            serializeNotesFn={serializeNotes}
                                            onExpand={() => setExpandedNote(note)}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        )}

                    </div>

                    {/* ── 우측 컬럼 (col 3) — 모바일은 contents로 펼쳐 order 유지, 데스크톱은 flex col + row-span-2로 노트행도 커버 ── */}
                  </div>{/* /좌측 컬럼 */}

                  {/* 우측 컬럼 — 모바일은 contents로 풀어 order 적용, 데스크톱은 flex */}
                  <div className="contents md:flex md:flex-col md:gap-6 md:col-start-3 md:row-start-1">

                    {/* 달력 — tablet+ only */}
                    <div className="hidden md:block">
                        <DailyMiniMonth date={date} />
                    </div>

                    {/* 2. 향후 일정 & 업무 — mobile order 2 (일정&업무 바로 다음) */}
                    <div className="order-2 md:order-none">
                        <UpcomingSchedule date={date} />
                    </div>

                    {/* 4. 일간 기록 — mobile order 4 (노트 다음) */}
                    <div className="order-4 md:order-none">
                        {trackingMetrics.length > 0 && (
                            <section className="bg-white border border-neutral-200 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xs uppercase tracking-widest text-neutral-400">일간 기록</h2>
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

                    </div>

                    {/* 5. 프로젝트 — mobile order 5 */}
                    <div className="order-5 md:order-none">
                        <DailyProjectsCard date={date} />
                    </div>

                    {/* 6. 오늘 한 장면 — mobile order 6 */}
                    <div className="order-6 md:order-none">
                        <section className="bg-white border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xs uppercase tracking-widest text-neutral-400">오늘 한 장면</h2>
                                <button
                                    onClick={shareResult}
                                    title={shareCopied ? "복사됨!" : "공유하기"}
                                    className={`p-1.5 rounded transition-colors ${shareCopied ? "text-[#0F766E] bg-[#0F766E]/10" : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"}`}
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
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
                            <textarea
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                                onBlur={() => save({ daily_result: result })}
                                placeholder={resultCategoryHint(resultCategory)}
                                rows={4}
                                className="w-full text-sm text-neutral-900 placeholder:text-neutral-300 placeholder:italic focus:outline-none bg-transparent resize-none mb-3"
                            />
                            {/* 사진/동영상 첨부 — 같은 카드 안에서 한 장면 완성 */}
                            <div className="border-t border-neutral-100 pt-3">
                                <DailyMomentsAuto date={date} compact />
                            </div>
                        </section>
                    </div>

                    {/* 이동 기록 */}
                    <div className="order-7 md:order-none">
                        <DailyPlacesCard date={date} />
                    </div>

                    {/* 일과 기록 */}
                    <div className="order-8 md:order-none">
                        <DailyRoutinesCard date={date} />
                    </div>

                    </div>
                    {/* /우측 컬럼 wrapper */}

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
                const isCanvas = expandedNote.type === 'canvas';
                const tplMeta = isTpl ? { id: expandedNote.id, key: expandedNote.templateKey ?? '', label: expandedNote.title, body_md: expandedNote.content } : null;
                const tplHasGrid = tplMeta ? isSpecialTemplate(tplMeta) : false;
                const dataKey = tplMeta ? tplDataKey(expandedNote.id) : '';
                // 손글씨 모드: type이 handwriting이거나, cornell 노트에서 handMode=true 일 때
                const isHand = expandedNote.type === 'handwriting'
                    || (expandedNote.type !== 'template' && expandedNote.type !== 'canvas' && !!expandedNote.handMode);
                // 자동 생성 제목 여부 — 힌트 스타일(이탤릭·흐림) 적용
                const isAutoTitle = /^(기본 노트|노트|손글씨|캔버스|템플릿) \d+$/.test(expandedNote.title)
                    || (isTpl && expandedNote.title === (expandedNote.templateLabel ?? ''));
                function toggleHandwriting() {
                    if (isHand) {
                        // 손글씨 → 텍스트/코넬: type 변경 없이 handMode만 false
                        // strokes는 expandedNote.handwriting에 그대로 보존됨
                        setExpandedNote({ ...expandedNote!, handMode: false });
                    } else {
                        // 텍스트/코넬 → 손글씨: type 변경 없이 handMode만 true
                        // 기존 strokes가 없으면 빈 캔버스 초기화, rows는 그대로 보존
                        const hand = expandedNote!.handwriting ?? { strokes: [], width: 800, height: 480 };
                        setExpandedNote({ ...expandedNote!, handMode: true, handwriting: hand });
                    }
                }
                function saveAndClose() {
                    let noteToSave = { ...expandedNote! };
                    // 현재 페이지를 배열에 반영
                    const updatedCornellPages = allCornellPages.length > 0
                        ? allCornellPages.map((p, i) => i === expandedNotePage ? { rows: noteToSave.rows, summary: noteToSave.summary } : p)
                        : [];
                    const updatedHandPages = allHandPages.length > 0
                        ? allHandPages.map((p, i) => i === expandedNotePage ? (noteToSave.handwriting ?? p) : p)
                        : [];
                    // 코넬 멀티페이지 embed
                    if (updatedCornellPages.length > 1) {
                        noteToSave = { ...noteToSave, rows: updatedCornellPages[0].rows, summary: updatedCornellPages[0].summary, _cornellPages: updatedCornellPages };
                    }
                    // 손글씨 페이지 embed (코넬 노트에서도 항상 저장)
                    if (updatedHandPages.length > 1) {
                        noteToSave = { ...noteToSave, handwriting: { ...(updatedHandPages[0] ?? { strokes: [], width: 800, height: 480 }), _pages: updatedHandPages } as HandNoteData };
                    } else if (updatedHandPages.length === 1) {
                        noteToSave = { ...noteToSave, handwriting: updatedHandPages[0] };
                    }
                    const next = notesList.map(n => n.id === noteToSave.id ? noteToSave : n);
                    setNotesList(next);
                    save({ notes: serializeNotes(next) });
                    setExpandedNote(null);
                }
                function switchCornellPage(newIdx: number) {
                    if (newIdx < 0 || newIdx >= allCornellPages.length) return;
                    // 현재 코넬 페이지 저장
                    const updatedCornell = [...allCornellPages];
                    updatedCornell[expandedNotePage] = { rows: expandedNote!.rows, summary: expandedNote!.summary };
                    setAllCornellPages(updatedCornell);
                    // 현재 손글씨 페이지 저장
                    const updatedHand = [...allHandPages];
                    updatedHand[expandedNotePage] = expandedNote!.handwriting ?? { strokes: [], width: 800, height: 480 };
                    setAllHandPages(updatedHand);
                    // 대상 페이지 로드
                    const target = updatedCornell[newIdx];
                    const targetHand = updatedHand[newIdx] ?? { strokes: [], width: 800, height: 480 };
                    setExpandedNote({ ...expandedNote!, rows: target.rows, summary: target.summary, handwriting: targetHand });
                    setExpandedNotePage(newIdx);
                }
                function addCornellPage() {
                    const newCornell = { rows: [{ id: `r_${Date.now()}`, cue: '', note: '' }], summary: '' };
                    const updatedCornell = [...allCornellPages];
                    updatedCornell[expandedNotePage] = { rows: expandedNote!.rows, summary: expandedNote!.summary };
                    updatedCornell.push(newCornell);
                    setAllCornellPages(updatedCornell);
                    // 손글씨 페이지도 함께 추가
                    const newHand: HandNoteData = { strokes: [], width: 800, height: 480 };
                    const updatedHand = [...allHandPages];
                    updatedHand[expandedNotePage] = expandedNote!.handwriting ?? { strokes: [], width: 800, height: 480 };
                    updatedHand.push(newHand);
                    setAllHandPages(updatedHand);
                    setExpandedNote({ ...expandedNote!, rows: newCornell.rows, summary: '', handwriting: newHand });
                    setExpandedNotePage(updatedCornell.length - 1);
                }
                function deleteCornellPage() {
                    if (allCornellPages.length <= 1) return;
                    // 현재 페이지 포함해 저장
                    const updatedCornell = [...allCornellPages];
                    updatedCornell[expandedNotePage] = { rows: expandedNote!.rows, summary: expandedNote!.summary };
                    const updatedHand = [...allHandPages];
                    updatedHand[expandedNotePage] = expandedNote!.handwriting ?? { strokes: [], width: 800, height: 480 };
                    // 현재 페이지 제거
                    const newCornell = updatedCornell.filter((_, i) => i !== expandedNotePage);
                    const newHand = updatedHand.filter((_, i) => i !== expandedNotePage);
                    const newIdx = Math.min(expandedNotePage, newCornell.length - 1);
                    const target = newCornell[newIdx];
                    const targetHand = newHand[newIdx] ?? { strokes: [], width: 800, height: 480 };
                    setAllCornellPages(newCornell);
                    setAllHandPages(newHand);
                    setExpandedNote({ ...expandedNote!, rows: target.rows, summary: target.summary, handwriting: targetHand });
                    setExpandedNotePage(newIdx);
                }
                function switchHandPage(newIdx: number) {
                    if (newIdx < 0 || newIdx >= allHandPages.length) return;
                    const updatedPages = [...allHandPages];
                    updatedPages[expandedNotePage] = expandedNote!.handwriting ?? { strokes: [], width: 800, height: 480 };
                    setAllHandPages(updatedPages);
                    const target = updatedPages[newIdx];
                    setExpandedNote({ ...expandedNote!, handwriting: target });
                    setExpandedNotePage(newIdx);
                }
                function addHandPage() {
                    const newPage: HandNoteData = { strokes: [], width: 800, height: 480 };
                    const updatedPages = [...allHandPages];
                    updatedPages[expandedNotePage] = expandedNote!.handwriting ?? { strokes: [], width: 800, height: 480 };
                    updatedPages.push(newPage);
                    setAllHandPages(updatedPages);
                    setExpandedNote({ ...expandedNote!, handwriting: newPage });
                    setExpandedNotePage(updatedPages.length - 1);
                }
                return (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-[5vh_5vw]">
                        {/* pp-view: fixed 모달은 planners-app-shell 밖 → pp-view로 다크모드 토큰 적용 */}
                        <div className={`pp-view bg-white rounded-xl w-full h-full flex flex-col shadow-2xl overflow-hidden ${isTpl ? 'border-t-4 border-violet-400' : isCanvas ? 'border-t-4 border-sky-400' : ''}`}>
                            {/* Header */}
                            <div className={`px-6 py-3 border-b border-neutral-200 flex items-center gap-3 ${isTpl ? 'bg-violet-50' : isCanvas ? 'bg-sky-50' : 'bg-neutral-50'}`}>
                                {isTpl && <LayoutTemplate className="h-4 w-4 text-violet-400 shrink-0" />}
                                {isCanvas && <ImageIcon className="h-4 w-4 text-sky-500 shrink-0" />}
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={expandedNote.title}
                                        onChange={(e) => setExpandedNote({ ...expandedNote, title: e.target.value })}
                                        placeholder={
                                            isTpl ? "이 템플릿으로 기록할 주제 한 줄"
                                            : isCanvas ? "예: 동선 스케치 / 와이어프레임"
                                            : isHand ? "예: 회의 메모 · 손글씨 정리"
                                            : "예: AI 마케팅 특강 — 강의 구성안"
                                        }
                                        className={`w-full text-base bg-transparent focus:outline-none placeholder:text-neutral-300 transition-all ${
                                            isAutoTitle
                                                ? 'italic font-light text-neutral-400'
                                                : isTpl ? 'font-semibold text-violet-700' : isCanvas ? 'font-semibold text-sky-700' : 'font-semibold text-neutral-900'
                                        }`}
                                    />
                                </div>
                                {/* 헤더 손글씨 토글 제거 — HandNote 툴바 내부에서 그리기/텍스트 전환 */}
                                <button
                                    onClick={() => setExpandedNote(null)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 text-neutral-600 rounded-lg text-sm hover:bg-neutral-100 transition-colors"
                                >
                                    그냥 닫기
                                </button>
                                <button
                                    onClick={() => saveAndClose()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F766E] text-white rounded-lg text-sm hover:bg-[#0d5e56] transition-colors"
                                >
                                    저장 후 닫기
                                </button>
                            </div>
                            {/* Body */}
                            {isCanvas ? (
                                <div className="flex-1 min-h-0 relative overflow-hidden">
                                    <CanvasStudio canvasId={expandedNote.canvas_id!} embed />
                                </div>
                            ) : isHand ? (
                                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                                    <HandNote
                                        value={expandedNote.handwriting ?? null}
                                        onChange={(d) => setExpandedNote({ ...expandedNote, handwriting: d })}
                                        fillHeight
                                    />
                                    {/* 페이지 컨트롤 — 항상 표시 (페이지가 1개여도 추가 가능) */}
                                    <div className="shrink-0 border-t border-neutral-100 bg-neutral-50 px-4 py-2 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => switchHandPage(expandedNotePage - 1)} disabled={expandedNotePage <= 0}
                                                className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 text-neutral-500 transition-colors">
                                                <ChevronLeft className="h-3.5 w-3.5" />
                                            </button>
                                            <span className="text-xs text-neutral-500 tabular-nums font-medium">
                                                {expandedNotePage + 1} / {allHandPages.length}
                                            </span>
                                            <button onClick={() => switchHandPage(expandedNotePage + 1)} disabled={expandedNotePage >= allHandPages.length - 1}
                                                className="p-1 rounded hover:bg-neutral-200 disabled:opacity-30 text-neutral-500 transition-colors">
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <button onClick={addHandPage} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-[#0F766E] hover:bg-[#0F766E]/10 transition-colors font-medium">
                                            <Plus className="h-3 w-3" /> 새 페이지
                                        </button>
                                    </div>
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
                                    {/* HandNote가 코넬 노트를 children으로 감쌈: 툴바(펜·색상·그리기 토글) + 투명 SVG 오버레이 */}
                                    <HandNote
                                        value={expandedNote.handwriting ?? null}
                                        onChange={(d) => setExpandedNote({ ...expandedNote, handwriting: d })}
                                        fillHeight
                                        onImageFootprintChange={(px) => setImgFootprint(px)}
                                    >
                                        {/* 코넬 노트 본문 — HandNote children: 텍스트 모드 시 포인터 이벤트 활성 */}
                                        <div className="flex flex-col h-full overflow-hidden">
                                            {/* Column headers */}
                                            <div ref={cornellHeaderRef} className="flex border-b border-neutral-100 shrink-0">
                                                <div className="w-6 shrink-0" aria-hidden />
                                                <div className="w-[22%] shrink-0 border-l border-neutral-200 px-4 py-2">
                                                    <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">단서 · 키워드</p>
                                                </div>
                                                <div className="flex-1 border-l border-neutral-200 flex items-center justify-between px-4 py-2">
                                                    <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">노트</p>
                                                    <p className="text-[10px] text-neutral-400 hidden sm:block">
                                                        <kbd className="font-mono">Enter</kbd> 새 주제 &nbsp;·&nbsp; <kbd className="font-mono">Shift+Enter</kbd> 줄바꿈
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Rows — leading-8(32px) for proper Cornell notebook ruling */}
                                            <div
                                                className="flex-1 overflow-y-auto divide-y divide-neutral-100"
                                                style={imgFootprint > 0 ? { paddingTop: Math.max(0, imgFootprint - (cornellHeaderRef.current?.offsetHeight ?? 36)) } : undefined}
                                            >
                                                {(expandedNote.rows ?? []).map((row, rIdx) => (
                                                    <div key={row.id} className="flex group/row">
                                                        {/* Delete button */}
                                                        <button
                                                            onClick={() => {
                                                                if ((expandedNote.rows ?? []).length <= 1) return;
                                                                const rows = (expandedNote.rows ?? []).filter((_, i) => i !== rIdx);
                                                                setExpandedNote({ ...expandedNote, rows });
                                                            }}
                                                            className={`shrink-0 w-6 flex items-start justify-center pt-3 transition-colors text-neutral-300 hover:text-red-400 ${(expandedNote.rows ?? []).length <= 1 ? 'invisible' : ''}`}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                        {/* Cue cell */}
                                                        <div className="w-[22%] shrink-0 relative border-l border-neutral-200">
                                                            <div aria-hidden className="invisible whitespace-pre-wrap break-words text-sm px-4 py-3 leading-8 min-h-[32px]">{row.cue + '\n'}</div>
                                                            <textarea
                                                                value={row.cue}
                                                                onChange={(e) => {
                                                                    const rows = (expandedNote.rows ?? []).map((r, i) => i === rIdx ? { ...r, cue: e.target.value } : r);
                                                                    setExpandedNote({ ...expandedNote, rows });
                                                                }}
                                                                placeholder="키워드"
                                                                className="absolute inset-0 w-full h-full text-sm text-neutral-600 placeholder:text-neutral-300 placeholder:italic placeholder:font-light focus:outline-none bg-transparent resize-none px-4 py-3 leading-8"
                                                            />
                                                        </div>
                                                        {/* Note cell */}
                                                        <div className="flex-1 relative border-l border-neutral-200">
                                                            <div aria-hidden className="invisible whitespace-pre-wrap break-words text-sm px-4 py-3 leading-8 min-h-[32px]">{row.note + '\n'}</div>
                                                            <textarea
                                                                ref={(el) => {
                                                                    if (el && cornellFocusPendingId.current === row.id) {
                                                                        el.focus();
                                                                        cornellFocusPendingId.current = null;
                                                                    }
                                                                }}
                                                                value={row.note}
                                                                onChange={(e) => {
                                                                    const rows = (expandedNote.rows ?? []).map((r, i) => i === rIdx ? { ...r, note: e.target.value } : r);
                                                                    setExpandedNote({ ...expandedNote, rows });
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        const newRow: CornellRow = { id: `r_${Date.now()}`, cue: '', note: '' };
                                                                        cornellFocusPendingId.current = newRow.id;
                                                                        const rows = [...(expandedNote.rows ?? []).slice(0, rIdx + 1), newRow, ...(expandedNote.rows ?? []).slice(rIdx + 1)];
                                                                        setExpandedNote({ ...expandedNote, rows });
                                                                    }
                                                                }}
                                                                placeholder={rIdx === 0 ? "이 키워드에 대한 노트" : ""}
                                                                className="absolute inset-0 w-full h-full text-sm text-neutral-900 placeholder:text-neutral-300 placeholder:italic placeholder:font-light focus:outline-none bg-transparent resize-none px-4 py-3 leading-8"
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
                                                    className="w-full py-1.5 text-[11px] italic font-light text-neutral-300 hover:text-[#0F766E] hover:not-italic transition-colors"
                                                >
                                                    + 행 추가
                                                </button>
                                            </div>
                                            {/* Summary */}
                                            <div className="border-t border-neutral-200 shrink-0">
                                                <p className="px-4 pt-2 pb-0.5 text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">요약</p>
                                                <textarea
                                                    value={expandedNote.summary}
                                                    onChange={(e) => setExpandedNote({ ...expandedNote, summary: e.target.value })}
                                                    placeholder="이 노트의 핵심 한 줄"
                                                    rows={3}
                                                    className="w-full text-sm text-neutral-700 placeholder:text-neutral-300 placeholder:italic placeholder:font-light focus:outline-none bg-transparent resize-none px-4 py-2 pb-4 leading-8"
                                                />
                                            </div>
                                        </div>
                                    </HandNote>
                                    {/* 페이지 컨트롤 — 3열 그리드 (삭제 | ← 페이지 → | 새 페이지) */}
                                    <div className="shrink-0 border-t border-dashed border-neutral-200">
                                        <div className="grid grid-cols-3 items-center px-3 py-2">
                                            <div className="flex justify-start">
                                                <button
                                                    onClick={deleteCornellPage}
                                                    disabled={allCornellPages.length <= 1}
                                                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                    title="현재 페이지 삭제"
                                                >
                                                    <Trash2 className="h-3 w-3" /> 페이지 삭제
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => switchCornellPage(expandedNotePage - 1)} disabled={expandedNotePage <= 0}
                                                    className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 text-neutral-400 transition-colors">
                                                    <ChevronLeft className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="text-xs text-neutral-500 tabular-nums font-medium">{expandedNotePage + 1} / {allCornellPages.length || 1}</span>
                                                <button onClick={() => switchCornellPage(expandedNotePage + 1)} disabled={expandedNotePage >= (allCornellPages.length || 1) - 1}
                                                    className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 text-neutral-400 transition-colors">
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex justify-end">
                                                <button onClick={addCornellPage} className="flex items-center gap-1 text-xs text-[#0F766E] hover:text-[#0d5e56] transition-colors">
                                                    <Plus className="h-3 w-3" /> 새 페이지
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            {/* 미완 업무 불러오기 Modal */}
            {showPendingModal && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 px-0 sm:px-4" onClick={() => setShowPendingModal(false)}>
                    <div className="bg-white w-full sm:max-w-lg rounded-b-2xl sm:rounded-2xl flex flex-col h-[80vh] sm:h-auto sm:max-h-[640px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 shrink-0">
                            <div className="flex items-center gap-2">
                                <ArrowDownToLine className="h-4 w-4 text-amber-600" />
                                <span className="font-semibold text-sm text-neutral-900">미완 업무 불러오기</span>
                                {!pendingLoading && pendingGroups.length > 0 && (
                                    <span className="text-xs text-neutral-400">
                                        {pendingGroups.flatMap(g => g.tasks).length}건
                                    </span>
                                )}
                            </div>
                            <button onClick={() => setShowPendingModal(false)} className="text-xs text-neutral-400 hover:text-neutral-700">닫기</button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto">
                            {pendingLoading ? (
                                <div className="flex items-center justify-center py-12 text-neutral-400 gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">불러오는 중…</span>
                                </div>
                            ) : pendingGroups.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
                                    <p className="text-sm">미완료 업무가 없습니다.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100">
                                    {/* 전체 선택/해제 */}
                                    <div className="px-5 py-3 bg-neutral-50 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="pending-select-all"
                                            checked={selectedPendingIds.size === pendingGroups.flatMap(g => g.tasks).length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedPendingIds(new Set(pendingGroups.flatMap(g => g.tasks).map(t => t.id)));
                                                } else {
                                                    setSelectedPendingIds(new Set());
                                                }
                                            }}
                                            className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <label htmlFor="pending-select-all" className="text-xs text-neutral-600 cursor-pointer select-none">
                                            전체 선택 ({pendingGroups.flatMap(g => g.tasks).length}건)
                                        </label>
                                        {selectedPendingIds.size > 0 && selectedPendingIds.size < pendingGroups.flatMap(g => g.tasks).length && (
                                            <span className="text-xs text-amber-600 ml-auto">{selectedPendingIds.size}건 선택</span>
                                        )}
                                    </div>

                                    {/* 날짜별 그룹 */}
                                    {pendingGroups.map((group) => {
                                        const d = new Date(group.date + "T00:00:00");
                                        const today = new Date();
                                        const diffDays = Math.round((today.getTime() - d.getTime()) / 86400000);
                                        const dayLabel = diffDays === 1 ? "어제" : diffDays === 2 ? "그저께" : `${diffDays}일 전`;
                                        const mmdd = `${d.getMonth() + 1}/${d.getDate()}`;
                                        const DOW = ["일", "월", "화", "수", "목", "금", "토"];
                                        return (
                                            <div key={group.date}>
                                                <div className="px-5 py-2 bg-amber-50/60 border-b border-amber-100">
                                                    <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">
                                                        {mmdd} ({DOW[d.getDay()]}) · {dayLabel}
                                                    </span>
                                                </div>
                                                <ul className="divide-y divide-neutral-50">
                                                    {group.tasks.map((task) => {
                                                        const checked = selectedPendingIds.has(task.id);
                                                        const pMeta = task.priority ? PRIORITY_META[task.priority as TaskPriority] : null;
                                                        return (
                                                            <li
                                                                key={task.id}
                                                                onClick={() => {
                                                                    setSelectedPendingIds(prev => {
                                                                        const next = new Set(prev);
                                                                        if (next.has(task.id)) next.delete(task.id);
                                                                        else next.add(task.id);
                                                                        return next;
                                                                    });
                                                                }}
                                                                className={`flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-neutral-50 transition-colors ${checked ? '' : 'opacity-50'}`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={checked}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedPendingIds(prev => {
                                                                            const next = new Set(prev);
                                                                            if (next.has(task.id)) next.delete(task.id);
                                                                            else next.add(task.id);
                                                                            return next;
                                                                        });
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500 shrink-0"
                                                                />
                                                                <span className="flex-1 text-sm text-neutral-800 leading-snug">{task.text}</span>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    {task.time && (
                                                                        <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                                                                            <Clock className="h-2.5 w-2.5" />{task.time}
                                                                        </span>
                                                                    )}
                                                                    {pMeta && (
                                                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${pMeta.cls}`}>{pMeta.label}</span>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {!pendingLoading && pendingGroups.length > 0 && (
                            <div className="px-5 py-4 border-t border-neutral-200 flex items-center justify-between shrink-0 bg-white">
                                <span className="text-xs text-neutral-400">
                                    {selectedPendingIds.size === 0 ? '항목을 선택하세요' : `${selectedPendingIds.size}건 선택됨`}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowPendingModal(false)}
                                        className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={importSelectedPending}
                                        disabled={selectedPendingIds.size === 0 || carrying}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-40"
                                    >
                                        {carrying ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowDownToLine className="h-3 w-3" />}
                                        오늘로 가져오기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Template Picker Modal */}
            {showTemplatePicker && (
                <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 px-0 sm:px-4" onClick={() => setShowTemplatePicker(false)}>
                    <div className="pp-view bg-white w-full sm:max-w-xl rounded-b-2xl sm:rounded-2xl flex flex-col h-[85vh] sm:h-[640px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
                            <div className="flex flex-wrap gap-1">
                                {["all", "favs", "recommended", "framework", "schedule", "note"].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setTplCat(c)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                            tplCat === c
                                                ? c === "favs" ? "bg-amber-500 text-white"
                                                : c === "recommended" ? "bg-rose-500 text-white"
                                                : c === "framework" ? "bg-violet-600 text-white"
                                                : c === "schedule" ? "bg-teal-600 text-white"
                                                : c === "note" ? "bg-amber-500 text-white"
                                                : "bg-neutral-900 text-white"
                                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                        }`}
                                    >
                                        {c === "all" ? "전체" : c === "favs" ? "⭐ 즐겨찾기" : c === "recommended" ? "📈 추천" : c === "framework" ? "FrameWorkBook" : c === "schedule" ? "Schedule" : "Note"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 px-5 pb-5">
                            {/* 오늘 추천 — 검색·필터 없을 때만 노출 */}
                            {!tplLoading && tplCat === "all" && !tplQuery && (() => {
                                const recs = DAILY_RECOMMENDED
                                    .map(k => tplList.find(t => t.key === k))
                                    .filter((t): t is NonNullable<typeof t> => !!t)
                                    .slice(0, 6);
                                if (recs.length === 0) return null;
                                return (
                                    <div className="bg-violet-50/50 border border-violet-100 rounded-xl px-4 py-3 mt-2 mb-3">
                                        <p className="text-[10px] uppercase tracking-widest text-violet-600 mb-2">오늘 추천</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {recs.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => insertTemplate(t)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-violet-200 rounded-full text-xs text-violet-700 hover:bg-violet-100 hover:border-violet-400 transition-colors"
                                                >
                                                    <LayoutTemplate className="h-3 w-3" /> {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                            {tplLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                                </div>
                            ) : (() => {
                                const filtered = tplList.filter(t => {
                                    if (tplCat === "favs" && !tplFavs.has(t.id)) return false;
                                    if (tplCat === "recommended" && !TOP_RECOMMENDED.includes(t.key)) return false;
                                    if (tplCat !== "all" && tplCat !== "favs" && tplCat !== "recommended" && t.category !== tplCat) return false;
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
            className={`group flex flex-wrap items-center gap-x-2 gap-y-0.5 py-1.5 rounded transition-colors ${
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
                    <button
                        type="button"
                        onClick={() => setEditingTime(false)}
                        className="px-1.5 py-0.5 rounded bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#0d5e56]"
                        title="확인"
                    >
                        확인
                    </button>
                    <button
                        type="button"
                        onClick={() => { onTimeChange(""); setEditingTime(false); }}
                        className="px-1 py-0.5 rounded text-neutral-400 hover:text-rose-500 text-xs"
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
                    className="shrink-0 text-xs text-neutral-300 hover:text-neutral-500 border border-dashed border-neutral-200 rounded px-1 transition-all"
                    title="우선순위 설정"
                >
                    급중
                </button>
            )}

            {/* 모바일 스페이서 — project+delete를 우측으로 밀기 */}
            <span className="flex-1 sm:hidden" />

            {/* Project tag (선택 가능) */}
            {projects.length > 0 && onProjectChange && (() => {
                const project = task.project_id ? projects.find(p => p.id === task.project_id) : null;
                return (
                    <select
                        value={task.project_id ?? ""}
                        onChange={(e) => onProjectChange(e.target.value || null)}
                        title={project ? `프로젝트: ${project.title}` : "프로젝트 태그"}
                        className={`shrink-0 text-xs max-w-[100px] focus:outline-none rounded px-1.5 py-0.5 border transition-colors ${
                            project
                                ? "bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/30"
                                : "text-neutral-300 border-transparent opacity-40"
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
                className="text-neutral-300 hover:text-red-500 transition-opacity shrink-0"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </button>

            {/* Task text — 모바일 2번째 줄, 데스크톱 인라인 */}
            <span className={`basis-full sm:basis-auto sm:flex-1 sm:min-w-0 order-last sm:order-none pl-6 sm:pl-0 text-xs leading-snug ${strike ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                {task.text}
            </span>
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

// 향후 4주 일정 컴팩트 리스트
const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

interface UpcomingTask {
    id: string;
    text: string;
    status: string;
    project_id?: string | null;
    source?: string;
    time?: string | null;
}

function UpcomingSchedule({ date }: { date: string }) {
    const [offset, setOffset] = useState(0);
    const [entries, setEntries] = useState<CalendarEntry[]>([]);
    const [taskRows, setTaskRows] = useState<Array<{ date: string; tasks: UpcomingTask[] }>>([]);
    const [loading, setLoading] = useState(false);

    const { from, to } = useMemo(() => {
        const today = localDateStr(new Date());
        const d1 = new Date(today + "T00:00:00"); d1.setDate(d1.getDate() + 1 + offset);
        const d2 = new Date(today + "T00:00:00"); d2.setDate(d2.getDate() + 28 + offset);
        return { from: localDateStr(d1), to: localDateStr(d2) };
    }, [offset]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([
            fetch(`/api/planners/calendar?from=${from}&to=${to}`).then(r => r.ok ? r.json() : null),
            fetch(`/api/planners/daily/range?from=${from}&to=${to}`).then(r => r.ok ? r.json() : null),
        ])
            .then(([cal, daily]) => {
                if (cancelled) return;
                if (cal?.entries) setEntries(cal.entries);
                if (daily?.rows) {
                    const rows = (daily.rows as Array<{ date: string; tasks: unknown }>)
                        .map(r => ({ date: r.date, tasks: Array.isArray(r.tasks) ? (r.tasks as UpcomingTask[]) : [] }))
                        .filter(r => r.tasks.length > 0);
                    setTaskRows(rows);
                }
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [from, to]);

    // 캘린더 + 업무 통합 단일 리스트 (날짜 오름차순)
    const flatItems = useMemo(() => {
        type FlatItem =
            | { kind: CalendarKind; date: string; entry: CalendarEntry; task?: undefined }
            | { kind: "task";       date: string; task: UpcomingTask;   entry?: undefined };
        const out: FlatItem[] = [];

        // 캘린더 엔트리 (anniversary, meeting)
        const calKinds: CalendarKind[] = ["anniversary", "meeting"];
        entries.forEach((e) => {
            if (!calKinds.includes(e.kind as CalendarKind)) return;
            expandOccurrences(e, from, to).forEach((o) => {
                out.push({ kind: e.kind as CalendarKind, date: o.date, entry: e });
            });
        });

        // 업무 (취소·완료 제외)
        for (const row of taskRows) {
            for (const t of row.tasks) {
                if (!t || !t.text) continue;
                if (t.status === "cancelled" || t.status === "done") continue;
                out.push({ kind: "task", date: row.date, task: t });
            }
        }

        out.sort((a, b) => a.date.localeCompare(b.date));
        return out;
    }, [entries, taskRows, from, to]);

    const total = flatItems.length;
    // offset === 0 + 데이터 없음 → 카드 자체 숨김 (오늘 기준 향후 4주 무일정)
    // offset !== 0 + 데이터 없음 → 카드 유지 (과거·미래로 이동 중인 사용자)
    if (total === 0 && offset === 0) return null;

    const today = new Date(localDateStr(new Date()) + "T00:00:00");

    function renderFlatItem(o: typeof flatItems[number], i: number) {
        const d = new Date(o.date + "T00:00:00");
        const days = Math.round((d.getTime() - today.getTime()) / 86400000);
        const mmdd = `${d.getMonth() + 1}/${d.getDate()}`;
        const dow  = DAY_KO[d.getDay()];
        const dStr = days < 0 ? `D+${-days}` : days === 0 ? "D-Day" : `D-${days}`;

        if (o.kind === "task") {
            const isMs = o.task.source === "milestone";
            return (
                <li key={`task-${o.date}-${o.task.id}-${i}`}>
                    <a
                        href={`/planners/app/daily?date=${o.date}`}
                        className="flex items-center gap-2 min-w-0 py-1 hover:bg-neutral-50 rounded transition-colors"
                    >
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <span className="shrink-0 w-10 text-[10px] text-neutral-500 font-mono tabular-nums">
                            {mmdd}<span className="text-neutral-300 ml-0.5">({dow})</span>
                        </span>
                        <span className="flex-1 truncate text-xs text-neutral-700">{o.task.text}</span>
                        {isMs && <span className="shrink-0 text-[8px] uppercase tracking-wider px-1 py-px rounded bg-[#0F766E]/10 text-[#0F766E]">MS</span>}
                        <span className="shrink-0 text-[9px] tabular-nums text-neutral-300">{dStr}</span>
                    </a>
                </li>
            );
        }

        const c = KIND_COLORS[o.entry.kind as CalendarKind];
        return (
            <li key={`cal-${o.date}-${o.entry.id}-${i}`}>
                <a
                    href={`/planners/app/daily?date=${o.date}`}
                    className="flex items-center gap-2 min-w-0 py-1 hover:bg-neutral-50 rounded transition-colors"
                >
                    <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${c.dot}`} />
                    <span className="shrink-0 w-10 text-[10px] text-neutral-500 font-mono tabular-nums">
                        {mmdd}<span className="text-neutral-300 ml-0.5">({dow})</span>
                    </span>
                    <span className="flex-1 truncate text-xs text-neutral-700">{o.entry.title}</span>
                    <span className="shrink-0 text-[9px] tabular-nums text-neutral-300">{dStr}</span>
                </a>
            </li>
        );
    }

    return (
        <section className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="flex items-center gap-1 mb-3">
                <button
                    onClick={() => setOffset(o => o - 28)}
                    title="이전 4주"
                    className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <div className="flex-1 text-center">
                    <h2 className="text-xs font-medium text-neutral-600">
                        {offset < 0 ? "과거 일정 & 업무" : offset > 0 ? "다음 일정 & 업무" : "향후 일정 & 업무"}
                    </h2>
                    {offset !== 0 && (
                        <button
                            onClick={() => setOffset(0)}
                            className="text-[9px] text-neutral-400 hover:text-[#0F766E] transition-colors mt-0.5"
                        >
                            오늘로 ↺
                        </button>
                    )}
                </div>
                <button
                    onClick={() => setOffset(o => o + 28)}
                    title="다음 4주"
                    className="p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
            <div>
                {flatItems.length > 0 && (
                    <ul className="pl-1">
                        {flatItems.map((o, i) => renderFlatItem(o, i))}
                    </ul>
                )}
                {total === 0 && (
                    <div className="text-[11px] text-neutral-400 text-center py-6">
                        {loading ? "불러오는 중…" : `${from} ~ ${to} 일정 없음`}
                    </div>
                )}
                {total > 0 && (
                    <div className="flex items-center gap-3 pt-2 mt-1 border-t border-neutral-100">
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-rose-500" />
                            기념일
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-sky-500" />
                            미팅
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-teal-500" />
                            업무
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
}

