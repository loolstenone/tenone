"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Trash2, Loader2, ArrowDownToLine, GripVertical, Clock, LayoutTemplate, Search, X, Maximize2, Pencil, PenLine, Eye, Star, Image as ImageIcon, Share2, Type, Sun, Cloud, CloudRain, CloudSnow, CloudFog, CloudDrizzle, CloudLightning, Thermometer, Sunrise, Sunset, Globe, MapPin, Users, CalendarDays, Target, NotebookPen, Heart } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PlannerDaily, PlannerTask } from "@/lib/myverse/types";
import { localDateStr } from "@/lib/myverse/types";
import { getLunarDate, HOLIDAYS } from "@/lib/myverse/holidays";
import { resolveTemplateContent, isSpecialTemplate, tplDataKey } from "@/lib/myverse/templates";
import { DAILY_RECOMMENDED, TOP_RECOMMENDED } from "@/lib/myverse/template-recommendations";
import { CalendarEntryEditor } from "./CalendarEntryEditor";
import { DailyMomentsAuto } from "./DailyMoments";
import { SnsPostComposer } from "./SnsPostComposer";
import { DailyEntryComposer } from "./DailyEntryComposer";
import { DailyHealthStats } from "./DailyHealthStats";
import { FocusModeOverlay } from "./FocusModeOverlay";
import { Camera as CameraIconForCard } from "lucide-react";

// 오늘의 한 장면 — SNS 포스팅 (사진·영상·자유 글) 전용 카드
function TodaySceneCard({ date, initialOpen }: { date: string; initialOpen?: boolean }) {
    const [open, setOpen] = useState(initialOpen ?? false);
    const [version, setVersion] = useState(0);
    const [pendingImage, setPendingImage] = useState<File | null>(null);

    useEffect(() => {
        if (!initialOpen) return;
        const dataUrl = sessionStorage.getItem("myverse-pending-capture");
        const mimeType = sessionStorage.getItem("myverse-pending-capture-type") ?? "image/jpeg";
        const fileName = sessionStorage.getItem("myverse-pending-capture-name") ?? "capture.jpg";
        if (!dataUrl) return;
        sessionStorage.removeItem("myverse-pending-capture");
        sessionStorage.removeItem("myverse-pending-capture-type");
        sessionStorage.removeItem("myverse-pending-capture-name");
        fetch(dataUrl)
            .then(r => r.blob())
            .then(blob => setPendingImage(new File([blob], fileName, { type: mimeType })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section className="bg-white myverse-dark:bg-[#1C1C1C] border border-neutral-200 myverse-dark:border-[#2A2A2A] rounded-xl mt-3 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 myverse-dark:border-[#2A2A2A]">
                <h2 className="text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                    <CameraIconForCard className="h-3.5 w-3.5" />
                    오늘의 한 장면
                </h2>
                <button
                    onClick={() => setOpen(o => !o)}
                    className="p-1 rounded text-neutral-400 hover:text-[#6366F1] hover:bg-[#6366F1]/5 transition-colors"
                    title="새 포스트 작성"
                >
                    <Plus className={`h-4 w-4 transition-transform ${open ? "rotate-45" : ""}`} />
                </button>
            </div>
            <DailyHealthStats date={date} version={version} />
            {open && (
                <div className="px-5 pt-4 pb-3 border-b border-neutral-100 myverse-dark:border-[#2A2A2A]">
                    <SnsPostComposer
                        date={date}
                        onClose={() => setOpen(false)}
                        onSaved={() => setVersion(v => v + 1)}
                        initialImage={pendingImage}
                    />
                </div>
            )}
            <div className="p-5" key={`m-${version}`}>
                <DailyMomentsAuto date={date} compact hideAdd hideBackup minimalEmpty />
            </div>
        </section>
    );
}
import { DailyProjectsCard } from "./DailyProjectsCard";
import { DailyPlacesCard } from "./DailyPlacesCard";
import { DailyRoutinesCard } from "./DailyRoutinesCard";
import { useSwipeNav } from "./useSwipeNav";
import { DailyMiniMonth } from "./DailyMiniMonth";
import { expandOccurrences, isVisible, KIND_COLORS, KIND_LABELS, type CalendarEntry, type CalendarKind } from "@/lib/myverse/calendar-rules";
import { renderFramework, type FrameworkData } from "./TemplatesView";
import { ExternalEventsBanner } from "./ExternalEventsBanner";
import { PlannersUtilityLinks } from "./PlannersUtilityLinks";
import { Track } from "@/lib/analytics";
import { HandNote, type HandNoteData } from "./HandNote";
import { ConfirmSheet } from "./ConfirmSheet";
import { CanvasStudio } from "./CanvasStudio";
import { CanvasPreview } from "./CanvasPreview";
import { VoiceRecordButton } from "./VoiceRecordButton";
import { createClient } from "@/lib/supabase/client";

// TaskStatus, TaskRowProps, TaskRow → DailyTaskRow.tsx
import {
    type TaskStatus, type TaskRowProps,
    TaskRow,
} from "./DailyTaskRow";
import { DailyKanban, TaskViewToggle } from "./DailyKanban";

// ExerciseBlock, HealthBlock, TrackingRowWithNote, TrackingRow → DailyTrackingBlocks.tsx로 이동
import { ExerciseBlock, HealthBlock, TrackingRowWithNote, TrackingRow } from "./DailyTrackingBlocks";
import type { ExerciseBlockProps, HealthBlockProps, TrackingRowWithNoteProps, TrackingRowProps } from "./DailyTrackingBlocks";

// UpcomingSchedule → UpcomingSchedule.tsx로 이동
import { UpcomingSchedule } from "./UpcomingSchedule";
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
// 확장 모달용 템플릿 그리드 에디터 — localStorage 동기화 + React state로 즉시 재렌더.
function TemplateGridEditor({
    dataKey,
    templateKey,
    templateLabel,
}: {
    dataKey: string;
    templateKey: string;
    templateLabel: string;
}) {
    const [data, setData] = useState<FrameworkData>(() => {
        if (typeof window === "undefined") return {};
        try { return JSON.parse(localStorage.getItem(dataKey) || "{}"); }
        catch { return {}; }
    });
    const onChange = useCallback((k: string, v: string) => {
        setData(prev => {
            const next = { ...prev, [k]: v };
            try { localStorage.setItem(dataKey, JSON.stringify(next)); } catch { /* ignore */ }
            return next;
        });
    }, [dataKey]);
    return <>{renderFramework(templateKey, templateLabel, data, onChange)}</>;
}

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
            {/* Body: 인라인 편집 X — 손글씨·캔버스·노트와 동일하게 미리보기 전용. 클릭 시 onExpand */}
            <div
                onClick={onExpand}
                className="relative h-48 overflow-hidden cursor-pointer group hover:bg-neutral-50/50 transition-colors"
            >
                {grid ? (
                    <div className="absolute inset-0 px-4 py-3 pointer-events-none [transform-origin:top_left]">
                        {grid}
                    </div>
                ) : note.content ? (
                    <div
                        className="absolute inset-0 px-4 py-3 text-xs text-neutral-700 leading-relaxed pointer-events-none
                            [&_h1]:text-sm [&_h1]:font-bold [&_h1]:mb-1
                            [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:mb-1
                            [&_h3]:text-xs [&_h3]:font-semibold
                            [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-1
                            [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-1 [&_li]:mb-0.5
                            [&_strong]:font-semibold"
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-xs text-neutral-400">
                        템플릿 비어 있음 — 클릭해 작성
                    </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Maximize2 className="h-3.5 w-3.5" /> 클릭해서 편집
                    </span>
                </div>
            </div>
        </section>
    );
}

// ── 코넬 rows 인라인 편집 — Daily/Project 공통 ──
export function CornellRowsInline({
    rows,
    summary,
    onChange,
    onCommit,
    sourceNoteId,
    onPromoted,
}: {
    rows: CornellRow[];
    summary: string;
    onChange: (rows: CornellRow[], summary: string) => void;
    onCommit: () => void;
    sourceNoteId?: string;
    onPromoted?: (taskId: string) => void;
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
    async function promoteToTask(row: CornellRow) {
        const text = (row.cue || row.note).trim();
        if (!text) return;
        try {
            const res = await fetch("/api/myverse/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: row.cue ? `${row.cue}${row.note ? `: ${row.note}` : ""}` : row.note,
                    source: "note",
                    source_note_id: sourceNoteId ?? null,
                    source_block_id: row.id,
                }),
            });
            if (res.ok) {
                const { task } = await res.json();
                onPromoted?.(task.id);
            }
        } catch (e) {
            console.error("[cornell promote to task]", e);
        }
    }

    return (
        <div className="px-4 py-3">
            {/* 컬럼 헤더 */}
            <div className="grid grid-cols-[min(140px,35%)_1fr_auto] gap-3 text-[10px] uppercase tracking-widest text-neutral-300 mb-1.5 px-1">
                <span>제목, 단서, 키워드</span>
                <span>노트</span>
                <span></span>
            </div>
            {rows.length === 0 ? (
                <p className="text-xs text-neutral-300 py-3 text-center italic">행이 없습니다 · 아래 + 행 추가</p>
            ) : (
                <div className="space-y-1">
                    {rows.map((r, ri) => (
                        <div key={r.id} className="group grid grid-cols-[min(140px,35%)_1fr_auto] gap-3 items-start">
                            <input
                                type="text"
                                value={r.cue}
                                onChange={(e) => updateRow(r.id, { cue: e.target.value })}
                                onBlur={onCommit}
                                placeholder="키워드"
                                data-cornell-cue={ri === 0 ? "first" : undefined}
                                className="text-sm text-[#6366F1] font-medium bg-transparent focus:outline-none placeholder:text-neutral-300 placeholder:italic placeholder:font-light py-1"
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
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => promoteToTask(r)}
                                    title="Task로 보내기 (오늘 할 일에 추가)"
                                    className="text-neutral-300 hover:text-[#6366F1] p-1"
                                >
                                    <span className="material-symbols-outlined text-[14px] leading-none" style={{ fontVariationSettings: "'FILL' 0" }}>
                                        playlist_add_check
                                    </span>
                                </button>
                                <button
                                    onClick={() => removeRow(r.id)}
                                    title="행 삭제"
                                    className="text-neutral-300 hover:text-red-500 p-1"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* 행 추가 */}
            <button
                onClick={addRow}
                className="w-full mt-2 py-1.5 text-[11px] italic font-light text-neutral-300 hover:text-[#6366F1] hover:not-italic border border-dashed border-neutral-200 hover:border-[#6366F1] rounded transition-colors"
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
                    placeholder="이 노트의 핵심 요약"
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
    /** 녹음 결과 텍스트를 이 노트에 append — content + 마지막 row.note */
    function appendTranscription(text: string) {
        const stamp = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
        const fragment = `[🎤 ${stamp}] ${text}`;
        const next = notesList.map(n => {
            if (n.id !== note.id) return n;
            const newContent = n.content ? `${n.content}\n${fragment}` : fragment;
            const rows = (n.rows && n.rows.length > 0) ? [...n.rows] : [{ id: 'r1', cue: '', note: '' }];
            const last = rows[rows.length - 1];
            rows[rows.length - 1] = {
                ...last,
                note: last.note ? `${last.note}\n${fragment}` : fragment,
            };
            return { ...n, content: newContent, rows };
        });
        setNotesList(next);
        save({ notes: serializeNotesFn(next) });
    }
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
                {note.type === 'handwriting' && <PenLine className="h-3.5 w-3.5 text-[#6366F1] shrink-0" />}
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
                {/* 음성 녹음 → 이 노트에 텍스트 append */}
                {note.type !== 'canvas' && (
                    <VoiceRecordButton
                        onTranscribed={appendTranscription}
                        label=""
                        className="w-6 h-6 rounded hover:bg-rose-50 flex items-center justify-center text-neutral-400 hover:text-rose-500 shrink-0"
                    />
                )}
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
                    className="relative h-48 overflow-hidden cursor-pointer group bg-neutral-50"
                >
                    {note.canvas_id ? (
                        <div className="pointer-events-none absolute inset-0">
                            <CanvasPreview canvasId={note.canvas_id} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-xs text-neutral-400 gap-1">
                            <ImageIcon className="h-6 w-6 text-neutral-300" />
                            자유 캔버스 — 클릭해서 그리기
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Maximize2 className="h-3.5 w-3.5" /> 클릭해서 편집
                        </span>
                    </div>
                </div>
            ) : (
                /* cornell — 미리보기 (편집은 모달) — 손글씨·캔버스와 동일 h-48 */
                <div onClick={onExpand} className="relative h-48 overflow-hidden cursor-pointer group hover:bg-neutral-50/50 transition-colors px-4 py-3">
                    {(note.rows && note.rows.length > 0 && note.rows.some(r => r.cue || r.note)) ? (
                        <div className="space-y-1.5">
                            {note.rows.map((r) => (
                                <div key={r.id} className="grid grid-cols-[140px_1fr] gap-3 text-sm">
                                    <span className="text-[#6366F1] font-medium truncate">{r.cue || <span className="text-neutral-300 italic">키워드</span>}</span>
                                    <span className="text-neutral-700 whitespace-pre-wrap line-clamp-2">{r.note || <span className="text-neutral-300 italic">노트</span>}</span>
                                </div>
                            ))}
                            {note.summary && (
                                <p className="pt-2 mt-2 border-t border-neutral-100 text-xs text-neutral-600 italic line-clamp-2">{note.summary}</p>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-xs text-neutral-400">내용 없음 — 클릭해 작성</div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <Maximize2 className="h-3.5 w-3.5" /> 클릭해서 편집
                        </span>
                    </div>
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

export function DailyView({ initialDate, autoCompose }: { initialDate: string; autoCompose?: boolean }) {
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
    const [noteShortcuts, setNoteShortcuts] = useState<string[]>([]);
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
    const offlineQueueKey = "myverse_offline_queue";
    // (인라인 Task 입력 제거 — 모달로 통합)
    // 활성 프로젝트 목록 (Task 태그용)
    const [activeProjects, setActiveProjects] = useState<Array<{ id: string; title: string; color: string | null }>>([]);
    const [carrying, setCarrying] = useState(false);
    const [taskView, setTaskView] = useState<'list' | 'kanban'>(() => {
        if (typeof window === 'undefined') return 'list';
        return (window.localStorage.getItem('myverse_task_view') as 'list' | 'kanban') || 'list';
    });
    function toggleTaskView() {
        setTaskView(v => {
            const next = v === 'list' ? 'kanban' : 'list';
            try { window.localStorage.setItem('myverse_task_view', next); } catch {}
            return next;
        });
    }
    const [moveTaskId, setMoveTaskId] = useState<string | null>(null);
    const [moveDate, setMoveDate] = useState<string>("");
    const [moveTime, setMoveTime] = useState<string>("");
    const [pendingInfo, setPendingInfo] = useState<{ count: number; days: number; oldest: string | null } | null>(null);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [pendingGroups, setPendingGroups] = useState<Array<{ date: string; tasks: Array<{ id: string; text: string; priority?: string | null; time?: string | null; status?: string; parent_id?: string | null }> }>>([]);
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
        try { return new Set(JSON.parse(localStorage.getItem("myverse_fav_templates") || "[]")); }
        catch { return new Set(); }
    });
    const [expandedNote, setExpandedNote] = useState<NoteItem | null>(null);
    const [expandedNotePage, setExpandedNotePage] = useState(0);
    const [allCornellPages, setAllCornellPages] = useState<{ rows: CornellRow[]; summary: string }[]>([]);
    const [allHandPages, setAllHandPages] = useState<HandNoteData[]>([]);
    const [imgFootprint, setImgFootprint] = useState(0);
    const [editingNoteIds, setEditingNoteIds] = useState<Set<string>>(new Set());
    const [confirmDeletePage, setConfirmDeletePage] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
    // 코넬 노트 컬럼 헤더 높이 측정 (이미지 푸트프린트 오프셋 보정)
    const cornellHeaderRef = useRef<HTMLDivElement>(null);
    // 노트 드래그 순서 변경
    const noteDragRef = useRef<{ dragIdx: number; overIdx: number } | null>(null);
    // 코넬 노트 — Enter 후 새 행 포커스 추적
    const cornellFocusPendingId = useRef<string | null>(null);
    // 초집중 모드
    const [focusModeOpen, setFocusModeOpen] = useState(false);
    const [focusTaskText, setFocusTaskText] = useState<string | undefined>(undefined);

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
                await navigator.share({ title: "마이버스", text: shareText });
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
        const home = localStorage.getItem("myverse_home_timezone");
        if (!home) {
            localStorage.setItem("myverse_home_timezone", current);
        } else if (home !== current) {
            setTzMismatch(current);
        }
    }, []);

    // 출퇴근 소요시간 — transport 카테고리 + activity가 정확히 "출근"/"퇴근"인 루틴만
    const [departId, setDepartId] = useState<string | null>(null);
    const [arriveId, setArriveId] = useState<string | null>(null);
    useEffect(() => {
        (async () => {
            try {
            const res = await fetch(`/api/myverse/routines?date=${date}`);
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
            } catch { /* silent */ }
        })();
    }, [date]);

    // 데일리 트래킹 사용자 설정 (Settings 에서 켠 항목만, 미설정 시 만족도 기본)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/myverse/settings');
                if (cancelled) return;
                if (res.ok) {
                    const d = await res.json();
                    setTrackingMetrics(
                        Array.isArray(d.user?.daily_tracking_metrics) && d.user.daily_tracking_metrics.length > 0
                            ? d.user.daily_tracking_metrics
                            : ["satisfaction"]
                    );
                    setNoteShortcuts(
                        Array.isArray(d.user?.daily_note_shortcuts)
                            ? d.user.daily_note_shortcuts
                            : []
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
            .channel(`myverse_daily:${memberId}:${date}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "myverse_daily",
                    filter: `member_id=eq.${memberId}`,
                },
                (payload: { new?: unknown }) => {
                    const row = payload.new as { date?: string; updated_at?: string } | undefined;
                    if (!row || row.date !== date) return;
                    // 내가 저장한 지 3초 이내면 무시 (자기 변경 반영 방지)
                    if (Date.now() - lastSaveTimeRef.current < 3000) return;
                    // 다른 기기 변경 → 최신 데이터 refetch
                    fetch(`/api/myverse/daily?date=${date}`)
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
                const res = await fetch(`/api/myverse/calendar?from=${date}&to=${date}`);
                if (cancelled || !res.ok) return;
                const d = await res.json();
                setCalEntries(d.entries ?? []);
            } catch { /* noop */ }
        })();
        return () => { cancelled = true; };
    }, [date]);

    function refetchCalendar() {
        fetch(`/api/myverse/calendar?from=${date}&to=${date}`)
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
                const res = await fetch("/api/myverse/templates");
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
                const res = await fetch(`/api/myverse/calendar?from=${from}&to=${to}`);
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
            const res = await fetch(`/api/myverse/projects`);
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
            const res = await fetch(`/api/myverse/daily/pending-count?date=${date}&days=60`);
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
            try {
            const res = await fetch(`/api/myverse/daily?date=${date}`);
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
            } catch { /* silent */ } finally {
                if (!cancelled) setLoading(false);
            }
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
                await fetch(`/api/myverse/daily`, {
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
            const res = await fetch(`/api/myverse/daily`, {
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
            const res = await fetch(`/api/myverse/daily/carry-over`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, days: 60 }),
            });
            if (res.ok) {
                const d = await res.json();
                if (d.carried > 0) {
                    const r2 = await fetch(`/api/myverse/daily?date=${date}`);
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
            const res = await fetch(`/api/myverse/daily/pending-tasks?date=${date}&days=60`);
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
            // 선택된 메인 태스크 + 그 서브태스크(미완만)를 함께 이월
            type ToImport = { id: string; text: string; priority?: string | null; time?: string | null; status?: string; parent_id?: string | null; source_date: string };
            const toImport: ToImport[] = [];
            const sourceUpdates: Map<string, Array<{ id: string; text: string; status: string }>> = new Map();

            for (const group of pendingGroups) {
                // 메인 (parent_id 없음) 중 선택된 것 + 그 서브 (미완만)
                const carryIds: string[] = [];
                for (const t of group.tasks) {
                    if (!t.parent_id && selectedPendingIds.has(t.id)) {
                        toImport.push({ ...t, source_date: group.date });
                        carryIds.push(t.id);
                    }
                }
                // 서브태스크 동반 — 메인이 선택된 경우, 그 메인의 서브 중 todo/hold 만 이월
                for (const t of group.tasks) {
                    if (t.parent_id && carryIds.includes(t.parent_id) && (t.status === "todo" || t.status === "hold" || !t.status)) {
                        toImport.push({ ...t, source_date: group.date });
                        carryIds.push(t.id);
                    }
                }
                if (carryIds.length > 0) {
                    sourceUpdates.set(group.date, carryIds.map(id => ({ id, status: 'carried' } as { id: string; text: string; status: string })));
                }
            }

            if (toImport.length === 0) { setShowPendingModal(false); return; }

            // 1. 오늘 tasks에 추가 — 부모/자식 관계 보존
            const idMap = new Map<string, string>();
            for (const t of toImport) {
                idMap.set(t.id, `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
            }
            const newTasks: PlannerTask[] = toImport.map(t => ({
                id: idMap.get(t.id)!,
                text: t.text,
                status: "todo" as const,
                time: null,
                project_id: null,
                priority: (t.priority as PlannerTask["priority"]) ?? null,
                memo: null,
                parent_id: t.parent_id ? (idMap.get(t.parent_id) ?? null) : null,
            }));
            const next = [...tasks, ...newTasks];
            setTasks(next);
            await save({ tasks: next });

            // 2. 원본 날짜에서 carried 처리 (각 날짜의 전체 tasks 불러와서 선택 항목만 carried)
            await Promise.all(
                Array.from(sourceUpdates.entries()).map(async ([srcDate, selectedIds]) => {
                    const r = await fetch(`/api/myverse/daily?date=${srcDate}`);
                    if (!r.ok) return;
                    const d = await r.json();
                    if (!d.daily?.tasks) return;
                    const idSet = new Set(selectedIds.map(s => s.id));
                    const updated = (d.daily.tasks as PlannerTask[]).map(t =>
                        idSet.has(t.id) ? { ...t, status: 'carried' } : t
                    );
                    await fetch(`/api/myverse/daily`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ date: srcDate, tasks: updated }),
                    });
                })
            );

            // 3. pendingInfo 리셋 (메인 기준)
            const remaining = pendingGroups.flatMap(g => g.tasks).filter(t => !t.parent_id && !selectedPendingIds.has(t.id)).length;
            if (remaining === 0) setPendingInfo({ count: 0, days: 0, oldest: null });
            else setPendingInfo(prev => prev ? { ...prev, count: remaining } : null);

            Track.carryOverPending({ count: toImport.length, days: sourceUpdates.size });
            setShowPendingModal(false);
        } finally {
            setCarrying(false);
        }
    }

    /** 미팅(calendar entry) 처리 결과 사이클 — task와 동일한 4단계 (변경은 CalendarEntryEditor) */
    async function cycleEntryStatus(entry: CalendarEntry) {
        const order = ['todo', 'done', 'hold', 'canceled'] as const;  // 미팅은 'canceled' (한 l)
        const cur = (entry.status === 'carried' || entry.status === 'moved' || !entry.status)
            ? 'todo'
            : (entry.status as typeof order[number]);
        const idx = order.indexOf(cur);
        const next = order[(idx + 1) % order.length];
        // 낙관적 업데이트
        setCalEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: next } : e));
        try {
            await fetch(`/api/myverse/calendar/${entry.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: next }),
            });
        } catch (e) {
            console.error('cycleEntryStatus failed', e);
        }
    }

    function cycleStatus(taskId: string) {
        // 사이클: 미완 → 완료 → 보류 → 취소 → 미완 (계속 순환)
        // 변경(이동)은 캘린더 아이콘으로만 트리거 — 사이클에 포함하지 않음(멈춤 방지)
        // (carried/moved 상태에서 클릭하면 todo로 리셋 후 순환 시작)
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const cur = (task.status === 'carried' || task.status === 'moved') ? 'todo' : (task.status as TaskStatus);
        const order: TaskStatus[] = ['todo', 'done', 'hold', 'cancelled'];
        const idx = order.indexOf(cur);
        const nextStatus = order[(idx + 1) % order.length];
        const next = tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t);
        setTasks(next);
        save({ tasks: next });
    }

    /** 작업을 다른 날짜·시간으로 변경
     *  · 원본: status='moved', moved_to=newDate (흔적 보존)
     *  · 대상: 새 task로 추가 (moved_from=현재 날짜, time=newTime|null)
     */
    async function moveTask(taskId: string, newDate: string, newTime?: string | null) {
        if (!newDate) return;
        const original = tasks.find(t => t.id === taskId);
        if (!original) return;
        const sameDay = newDate === date;
        const normalizedTime = newTime ? newTime.slice(0, 5) : null;
        // 1) 같은 날 + 시간만 변경: 기존 task의 time만 업데이트
        if (sameDay) {
            if ((original.time ?? null) === normalizedTime) return;
            const next = tasks.map(t => t.id === taskId ? { ...t, time: normalizedTime } : t);
            setTasks(next);
            save({ tasks: next });
            return;
        }
        // 2) 다른 날: 대상 daily 가져와서 새 task 추가
        try {
            const res = await fetch(`/api/myverse/daily?date=${newDate}`);
            const d = res.ok ? await res.json() : { daily: null };
            const targetTasks: PlannerTask[] = Array.isArray(d.daily?.tasks) ? d.daily.tasks : [];
            const newTask: PlannerTask = {
                ...original,
                id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                status: 'todo',
                time: normalizedTime,
                moved_from: date,
                moved_to: null,
            };
            await fetch(`/api/myverse/daily`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: newDate, tasks: [...targetTasks, newTask] }),
            });
        } catch (e) {
            console.error('moveTask target write failed', e);
            return;
        }
        // 3) 현재 daily 업데이트 (원본 표시 + moved_to 기록)
        const next = tasks.map(t =>
            t.id === taskId ? { ...t, status: 'moved' as TaskStatus, moved_to: newDate } : t
        );
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
                const res = await fetch("/api/myverse/templates");
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
            try { localStorage.setItem("myverse_fav_templates", JSON.stringify([...next])); } catch { /* ignore */ }
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
        router.replace(`/myverse/app/daily?date=${newDate}`);
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
                                    isToday ? "underline decoration-[#6366F1] decoration-2 underline-offset-[6px]" : ""
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
                                        localStorage.setItem("myverse_home_timezone", tzMismatch);
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

            {/* ── 오늘 한 장 — Quick Actions ───────────────────────────────── */}
            {!loading && (
                <div className="mb-5 mt-1 space-y-2">
                    {/* 1열: 주요 액션 */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* + 할 일 */}
                        <button
                            onClick={() => { setCalEditing(null); setCalEditorOpen(true); }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:border-[#6366F1] hover:text-[#6366F1] hover:bg-indigo-50 transition-colors shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="font-medium">할 일</span>
                        </button>
                        {/* 🎯 초집중 — 1급 primary CTA */}
                        <button
                            onClick={() => {
                                const first = tasks.find(t => t.status === 'todo');
                                setFocusTaskText(first?.text ?? undefined);
                                setFocusModeOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-xl text-sm text-white hover:opacity-90 active:scale-95 transition-all shadow-sm font-semibold"
                        >
                            <Target className="h-4 w-4" />
                            <span>초집중 시작</span>
                        </button>
                    </div>
                    {/* 2열: 노트 단축키 */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* 기본 노트 */}
                        <button
                            onClick={() => {
                                const idx = notesList.filter(n => n.type === 'cornell' || !n.type).length + 1;
                                const newNote: NoteItem = {
                                    id: `n_${Date.now()}`, type: 'cornell', title: `기본 노트 ${idx}`,
                                    cue: "", content: "", summary: "",
                                    rows: [{ id: 'r1', cue: '', note: '' }],
                                    handwriting: { strokes: [], width: 800, height: 480 },
                                };
                                const next = [...notesList, newNote];
                                setNotesList(next);
                                save({ notes: serializeNotes(next) });
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors shadow-sm"
                        >
                            <NotebookPen className="h-4 w-4" />
                            <span className="font-medium">기본 노트</span>
                        </button>
                        {/* 템플릿 */}
                        <button
                            onClick={openTemplatePicker}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-colors shadow-sm"
                        >
                            <LayoutTemplate className="h-4 w-4" />
                            <span className="font-medium">템플릿</span>
                        </button>
                        {/* 캔버스 */}
                        <button
                            onClick={async () => {
                                const idx = notesList.filter(n => n.type === 'canvas').length + 1;
                                const title = `캔버스 ${idx}`;
                                const res = await fetch("/api/myverse/canvases", {
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
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50 transition-colors shadow-sm"
                        >
                            <ImageIcon className="h-4 w-4" />
                            <span className="font-medium">캔버스</span>
                        </button>
                        {/* 음성 녹음 */}
                        <VoiceRecordButton
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
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
                        {/* 🙏 감사 3가지 — 사용자 설정에서 활성화 시 노출 */}
                        {noteShortcuts.includes("gratitude") && (
                            <button
                                onClick={() => {
                                    const idx = notesList.filter(n => n.type === 'cornell' || !n.type).length + 1;
                                    const newNote: NoteItem = {
                                        id: `n_${Date.now()}`, type: 'cornell',
                                        title: `감사 일기 ${idx}`, cue: "🙏 감사", content: "", summary: "",
                                        rows: [
                                            { id: 'g1', cue: '감사 1', note: '' },
                                            { id: 'g2', cue: '감사 2', note: '' },
                                            { id: 'g3', cue: '감사 3', note: '' },
                                        ],
                                        handwriting: { strokes: [], width: 800, height: 480 },
                                    };
                                    const next = [...notesList, newNote];
                                    setNotesList(next);
                                    save({ notes: serializeNotes(next) });
                                }}
                                title="오늘 감사한 것 3가지 기록"
                                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-colors shadow-sm font-medium"
                            >
                                <span>🙏</span>
                                <span>감사 3가지</span>
                            </button>
                        )}
                        {/* 💭 감정 일기 — 사용자 설정에서 활성화 시 노출 */}
                        {noteShortcuts.includes("emotion") && (
                            <button
                                onClick={() => {
                                    const idx = notesList.filter(n => n.type === 'cornell' || !n.type).length + 1;
                                    const newNote: NoteItem = {
                                        id: `n_${Date.now()}`, type: 'cornell',
                                        title: `감정 일기 ${idx}`, cue: "💭 감정", content: "", summary: "",
                                        rows: [
                                            { id: 'e1', cue: '오늘의 감정', note: '' },
                                            { id: 'e2', cue: '왜 그랬나',   note: '' },
                                            { id: 'e3', cue: '내일은',      note: '' },
                                        ],
                                        handwriting: { strokes: [], width: 800, height: 480 },
                                    };
                                    const next = [...notesList, newNote];
                                    setNotesList(next);
                                    save({ notes: serializeNotes(next) });
                                }}
                                title="오늘의 감정 · 이유 · 내일 다짐"
                                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:border-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-sm font-medium"
                            >
                                <Heart className="h-4 w-4" />
                                <span>감정 일기</span>
                            </button>
                        )}
                    </div>
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
                            // 하루 종일: 공휴일·절기는 헤더에 이미 표시되므로 일정&업무에서는 제외
                            // (개인 기념일·미팅의 하루 종일만 여기서 노출)
                            const allDayEntries: typeof todayOccurrences = [];
                            // 시간 있는 미팅
                            const timedMeetings = todayOccurrences
                                .filter(o => o.entry.kind === "meeting" && o.entry.start_time)
                                .map(o => ({ type: "meeting" as const, time: o.entry.start_time!, entry: o.entry }));
                            // 시간 없는 미팅 (하루 종일로 처리)
                            const untimedMeetings = todayOccurrences
                                .filter(o => o.entry.kind === "meeting" && !o.entry.start_time)
                                .map(o => ({ entry: o.entry }));
                            // 메인/서브 분리 — 리스트에는 메인만 노출, 서브는 메인 아래 렌더
                            const subtasksByParent = new Map<string, PlannerTask[]>();
                            for (const t of tasks) {
                                if (t.parent_id) {
                                    const arr = subtasksByParent.get(t.parent_id) ?? [];
                                    arr.push(t);
                                    subtasksByParent.set(t.parent_id, arr);
                                }
                            }
                            // 시간 있는 메인 태스크
                            const timedTasks = tasks
                                .filter(t => t.time && !t.parent_id)
                                .map(t => ({ type: "task" as const, time: t.time!, task: t }));
                            // 시간 없는 메인 태스크 (원래 순서 유지, 드래그용 index 포함)
                            const untimedTasks = tasks
                                .map((t, idx) => ({ task: t, idx }))
                                .filter(({ task }) => !task.time && !task.parent_id);

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
                                            <TaskViewToggle value={taskView} onChange={toggleTaskView} />
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
                                                title="일정·업무 추가 (상세 모달)"
                                                className="p-1.5 rounded text-neutral-300 hover:text-[#6366F1] hover:bg-neutral-100 transition-colors"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {taskView === 'kanban' && (
                                        <DailyKanban
                                            tasks={tasks}
                                            meetings={todayOccurrences.filter(o => o.entry.kind === "meeting").map(o => o.entry)}
                                            projects={activeProjects}
                                            onChangeStatus={(taskId, next) => {
                                                const updated = tasks.map(t => t.id === taskId ? { ...t, status: next } : t);
                                                setTasks(updated);
                                                save({ tasks: updated });
                                            }}
                                            onRemoveTask={removeTask}
                                            onOpenMeeting={(entry) => { setCalEditing(entry); setCalEditorOpen(true); }}
                                            onAddTask={() => { setCalEditing(null); setCalEditorOpen(true); }}
                                        />
                                    )}

                                    {taskView === 'list' && (<>
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
                                                const st = entry.status;
                                                const strike = st === 'done' || st === 'canceled' || st === 'moved';
                                                return (
                                                    <div
                                                        key={entry.id}
                                                        className="group flex items-start gap-2.5 px-1 py-1 rounded hover:bg-neutral-50"
                                                    >
                                                        <button
                                                            onClick={() => cycleEntryStatus(entry)}
                                                            title="클릭: 미완 → 완료 → 보류 → 취소 (반복)"
                                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] font-bold transition-colors shrink-0 mt-0.5 ${
                                                                st === 'done'      ? 'bg-[#6366F1] border-[#6366F1] text-white'
                                                                : st === 'hold'    ? 'bg-amber-200 border-amber-300 text-amber-800'
                                                                : st === 'canceled'? 'bg-neutral-300 border-neutral-300 text-white'
                                                                : st === 'moved'   ? 'bg-violet-500 border-violet-500 text-white'
                                                                : 'border-sky-300 hover:border-[#6366F1]'
                                                            }`}
                                                        >
                                                            {st === 'done' ? '✓' : st === 'hold' ? '⏸' : st === 'canceled' ? '✕' : st === 'moved' ? '→' : ''}
                                                        </button>
                                                        <button
                                                            onClick={() => { setCalEditing(entry); setCalEditorOpen(true); }}
                                                            className="flex-1 min-w-0 flex items-start gap-2.5 text-left"
                                                        >
                                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${c.dot}`} />
                                                            <div className="flex-1 min-w-0">
                                                                <span className={`text-xs ${strike ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}>{entry.title}</span>
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
                                                    </div>
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
                                                const st = item.entry.status;
                                                const strike = st === 'done' || st === 'canceled' || st === 'moved';
                                                return (
                                                    <div
                                                        key={`m-${item.entry.id}-${i}`}
                                                        className="group flex items-start gap-2.5 px-1 py-1.5 rounded hover:bg-neutral-50"
                                                    >
                                                        <button
                                                            onClick={() => cycleEntryStatus(item.entry)}
                                                            title="클릭: 미완 → 완료 → 보류 → 취소 (반복)"
                                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] font-bold transition-colors shrink-0 mt-0.5 ${
                                                                st === 'done'      ? 'bg-[#6366F1] border-[#6366F1] text-white'
                                                                : st === 'hold'    ? 'bg-amber-200 border-amber-300 text-amber-800'
                                                                : st === 'canceled'? 'bg-neutral-300 border-neutral-300 text-white'
                                                                : st === 'moved'   ? 'bg-violet-500 border-violet-500 text-white'
                                                                : `${c.ring} border-sky-300 hover:border-[#6366F1]`
                                                            }`}
                                                        >
                                                            {st === 'done' ? '✓' : st === 'hold' ? '⏸' : st === 'canceled' ? '✕' : st === 'moved' ? '→' : ''}
                                                        </button>
                                                        <button
                                                            onClick={() => { setCalEditing(item.entry); setCalEditorOpen(true); }}
                                                            className="flex-1 min-w-0 flex items-start gap-2.5 text-left"
                                                        >
                                                            <span className="shrink-0 text-[11px] font-mono text-neutral-400 w-[76px] mt-0.5">
                                                                {ampm} {t}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <span className={`text-xs ${strike ? 'text-neutral-400 line-through' : 'text-neutral-800'}`}>{item.entry.title}</span>
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
                                                    </div>
                                                );
                                            } else {
                                                // task with time
                                                const t = item.task;
                                                const timeStr = (t.time || "").slice(0, 5);
                                                const h = parseInt(timeStr.split(":")[0], 10);
                                                const ampm = h < 12 ? "오전" : "오후";
                                                const strike = t.status === "done" || t.status === "cancelled" || t.status === "moved";
                                                const subs = subtasksByParent.get(t.id) ?? [];
                                                return (
                                                    <div key={`t-${t.id}`}>
                                                    <div className="flex items-center gap-2.5 px-1 py-1.5 rounded hover:bg-neutral-50 group">
                                                        <button
                                                            onClick={() => cycleStatus(t.id)}
                                                            title="클릭: 미완 → 완료 → 보류 → 취소 (반복) · 변경은 우측 캘린더 아이콘"
                                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center text-[10px] font-bold transition-colors shrink-0 ${
                                                                t.status === "done"      ? "bg-[#6366F1] border-[#6366F1] text-white"
                                                                : t.status === "carried" ? "bg-amber-500 border-amber-500 text-white"
                                                                : t.status === "moved"   ? "bg-violet-500 border-violet-500 text-white"
                                                                : t.status === "hold"    ? "bg-amber-200 border-amber-300 text-amber-800"
                                                                : t.status === "cancelled" ? "bg-neutral-300 border-neutral-300 text-white"
                                                                : "border-neutral-300 hover:border-[#6366F1]"
                                                            }`}
                                                        >
                                                            {t.status === "done" ? "✓" : t.status === "carried" ? "→" : t.status === "moved" ? "→" : t.status === "hold" ? "⏸" : t.status === "cancelled" ? "✕" : ""}
                                                        </button>
                                                        <span className="shrink-0 text-[11px] font-mono text-neutral-400 w-[76px]">
                                                            {ampm} {timeStr}
                                                        </span>
                                                        <span className={`flex-1 text-xs ${strike ? "text-neutral-400 line-through" : "text-neutral-800"}`}>
                                                            {t.text}
                                                            {t.status === "moved" && t.moved_to && (
                                                                <span className="ml-2 text-[10px] text-violet-500 not-italic no-underline">→ {t.moved_to.slice(5)} 변경</span>
                                                            )}
                                                            {t.moved_from && t.status !== "moved" && (
                                                                <span className="ml-2 text-[10px] text-violet-400 no-underline">({t.moved_from.slice(5)} 변경)</span>
                                                            )}
                                                        </span>
                                                        <button
                                                            onClick={() => { setMoveTaskId(t.id); setMoveDate(date); setMoveTime(t.time?.slice(0,5) || ""); }}
                                                            title="다른 날짜로 변경"
                                                            className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-violet-500 transition-all"
                                                        >
                                                            <CalendarDays className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeTask(t.id)}
                                                            className="text-neutral-300 hover:text-rose-400 transition-colors"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    {subs.length > 0 && (
                                                        <div className="ml-7 mt-0.5 mb-1 pl-3 border-l-2 border-neutral-100 space-y-0.5">
                                                            {subs.map(s => <SubtaskRow key={s.id} task={s} onCycle={() => cycleStatus(s.id)} onRemove={() => removeTask(s.id)} />)}
                                                        </div>
                                                    )}
                                                    </div>
                                                );
                                            }
                                        })}

                                        {/* 구분선 (시간 항목 + 미완료 항목 모두 있을 때) */}
                                        {timedItems.length > 0 && untimedTasks.length > 0 && (
                                            <div className="border-t border-dashed border-neutral-100 my-2" />
                                        )}

                                        {/* 3. 시간 없는 메인 태스크 (드래그 가능) — 서브태스크는 들여쓰기 */}
                                        {untimedTasks.map(({ task: t, idx }) => {
                                            const subs = subtasksByParent.get(t.id) ?? [];
                                            return (
                                            <div key={t.id}>
                                            <TaskRow
                                                task={t}
                                                index={idx}
                                                isDragOver={dragOverIndex === idx}
                                                onCycle={() => cycleStatus(t.id)}
                                                onRemove={() => removeTask(t.id)}
                                                onTimeChange={(time) => updateTaskTime(t.id, time)}
                                                onProjectChange={(pid) => updateTaskProject(t.id, pid)}
                                                onMove={() => { setMoveTaskId(t.id); setMoveDate(date); setMoveTime(t.time?.slice(0,5) || ""); }}
                                                projects={activeProjects}
                                                onDragStart={() => onDragStart(idx)}
                                                onDragOver={(e) => onDragOver(e, idx)}
                                                onDrop={() => onDrop(idx)}
                                                onDragEnd={onDragEnd}
                                            />
                                            {subs.length > 0 && (
                                                <div className="ml-7 mt-0.5 mb-1 pl-3 border-l-2 border-neutral-100 space-y-0.5">
                                                    {subs.map(s => <SubtaskRow key={s.id} task={s} onCycle={() => cycleStatus(s.id)} onRemove={() => removeTask(s.id)} />)}
                                                </div>
                                            )}
                                            </div>
                                            );
                                        })}
                                    </div>
                                    </>)}

                                </section>
                            );
                        })()}

                        {/* ── 작업 변경(다른 날짜로) 모달 ── */}
                        {moveTaskId && (
                            <div className="fixed inset-0 z-[9200] flex items-center justify-center bg-black/40 px-4" onClick={() => setMoveTaskId(null)}>
                                <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <CalendarDays className="h-4 w-4 text-violet-500" />
                                        <h3 className="text-sm font-semibold text-neutral-900">다른 날짜로 변경</h3>
                                    </div>
                                    <p className="text-xs text-neutral-500 mb-3">
                                        선택한 작업의 날짜·시간을 변경합니다. 다른 날로 옮긴 경우 원본은 취소선과 「→ 변경」 표시로 흔적이 남고, 대상 날짜에 새 작업으로 등장합니다.
                                    </p>
                                    <div className="grid grid-cols-[1fr_auto] gap-2">
                                        <div>
                                            <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1">날짜</label>
                                            <input
                                                type="date"
                                                value={moveDate}
                                                onChange={(e) => setMoveDate(e.target.value)}
                                                className="w-full text-sm border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:border-violet-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1">시간 (선택)</label>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="time"
                                                    value={moveTime}
                                                    onChange={(e) => setMoveTime(e.target.value)}
                                                    className="text-sm border border-neutral-200 rounded px-3 py-2 focus:outline-none focus:border-violet-400 w-[120px]"
                                                />
                                                {moveTime && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setMoveTime("")}
                                                        className="text-neutral-400 hover:text-rose-500 text-xs px-1"
                                                        title="시간 지우기"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-4">
                                        <button
                                            onClick={() => setMoveTaskId(null)}
                                            className="text-xs px-3 py-1.5 text-neutral-500 hover:text-neutral-700"
                                        >
                                            취소
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (moveTaskId && moveDate) {
                                                    await moveTask(moveTaskId, moveDate, moveTime || null);
                                                }
                                                setMoveTaskId(null);
                                            }}
                                            disabled={!moveDate}
                                            className="text-xs px-3 py-1.5 bg-violet-500 text-white rounded hover:bg-violet-600 disabled:opacity-50"
                                        >
                                            변경
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* 4. 노트 — mobile: order-3 (향후 일정 다음), desktop: 좌측 컬럼 두번째 */}
                    <div className="order-3 md:order-none space-y-4 min-w-0">
                        {/* 노트 추가 — 일정&업무 바로 아래 (같은 col-span-2 컨테이너) */}

                        {/* 연구원 전용 — 연구노트 */}
                        {userRole === "researcher" && (
                            <div>
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
                                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-colors shadow-sm"
                                >
                                    <span className="text-sm leading-none">🔬</span>
                                    <span className="font-medium">연구노트</span>
                                </button>
                            </div>
                        )}

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

                        {/* 오늘의 한 장면 — SNS 포스팅 (사진·영상·자유 글) */}
                        <TodaySceneCard date={date} initialOpen={autoCompose} />

                        {/* 방문 장소 — 흔적 입력 (장소·시간·카테고리) */}
                        <section className="mt-3">
                            <DailyPlacesCard date={date} />
                        </section>

                        {/* 일과 기록 — 흔적 입력 (활동·시간·카테고리) */}
                        <section className="mt-3">
                            <DailyRoutinesCard date={date} />
                        </section>


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
                                        href="/myverse/app/settings#tracking"
                                        className="inline-flex items-center gap-1 text-[10px] text-neutral-400 hover:text-[#6366F1] transition-colors"
                                        title="트래킹 항목 수정"
                                    >
                                        <Pencil className="h-3 w-3" /> 수정
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {trackingMetrics.includes("energy") && (
                                        <TrackingRow
                                            label="에너지" hint="컨디션·체력"
                                            value={energy} activeColor="bg-[#6366F1]"
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


                    {/* 방문 장소·일과 기록은 좌측 "오늘의 한 장면" 카드에 통합됨 */}

                    </div>
                    {/* /우측 컬럼 wrapper */}

                </div>
            )}

            {/* 초집중 모드 오버레이 */}
            {focusModeOpen && (
                <FocusModeOverlay
                    taskText={focusTaskText}
                    onClose={() => setFocusModeOpen(false)}
                />
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
                    <div className="fixed inset-0 z-[9100] flex flex-col bg-white">
                        {/* pp-view: fixed 전체화면 → pp-view로 다크모드 토큰 적용 */}
                        <div className="pp-view bg-white w-full h-full flex flex-col overflow-hidden">
                            {/* Header — 모든 노트 타입 동일 레이아웃 */}
                            <div className="px-5 py-3 border-b border-neutral-200 flex items-center gap-3 bg-white shrink-0">
                                {/* 타입 배지 */}
                                <span className={`shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                                    isTpl    ? 'bg-violet-100 text-violet-600'
                                    : isCanvas ? 'bg-sky-100 text-sky-600'
                                    : isHand   ? 'bg-amber-100 text-amber-600'
                                    : 'bg-neutral-100 text-neutral-500'
                                }`}>
                                    {isTpl    && <LayoutTemplate className="h-3 w-3" />}
                                    {isCanvas && <ImageIcon className="h-3 w-3" />}
                                    {isTpl ? '템플릿' : isCanvas ? '캔버스' : isHand ? '손글씨' : '노트'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={expandedNote.title}
                                        onChange={(e) => setExpandedNote({ ...expandedNote, title: e.target.value })}
                                        onKeyDown={(e) => {
                                            // 제목에서 Enter → 코넬 첫 단서 입력란으로 커서 이동
                                            if (e.key === 'Enter' && !isHand && !isCanvas && !isTpl) {
                                                e.preventDefault();
                                                const first = document.querySelector<HTMLInputElement>('[data-cornell-cue="first"]');
                                                first?.focus();
                                            }
                                        }}
                                        placeholder={
                                            isTpl ? "이 템플릿으로 기록할 주제 한 줄"
                                            : isCanvas ? "예: 동선 스케치 / 와이어프레임"
                                            : isHand ? "예: 회의 메모 · 손글씨 정리"
                                            : "예: AI 마케팅 특강 — 강의 구성안"
                                        }
                                        className={`w-full text-base bg-transparent focus:outline-none placeholder:text-neutral-300 transition-all ${
                                            isAutoTitle
                                                ? 'italic font-light text-neutral-400'
                                                : 'font-semibold text-neutral-900'
                                        }`}
                                    />
                                </div>
                                <button
                                    onClick={() => setExpandedNote(null)}
                                    className="shrink-0 px-3 py-1.5 border border-neutral-200 text-neutral-500 rounded-lg text-sm hover:bg-neutral-50 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={() => saveAndClose()}
                                    className="shrink-0 px-3 py-1.5 bg-[#6366F1] text-white rounded-lg text-sm hover:bg-[#4F46E5] transition-colors font-medium"
                                >
                                    저장
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
                                        <button onClick={addHandPage} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs text-[#6366F1] hover:bg-[#6366F1]/10 transition-colors font-medium">
                                            <Plus className="h-3 w-3" /> 새 페이지
                                        </button>
                                    </div>
                                </div>
                            ) : isTpl && tplHasGrid && tplMeta ? (
                                <div className="flex-1 overflow-auto p-6 bg-violet-50/20">
                                    <TemplateGridEditor
                                        dataKey={dataKey}
                                        templateKey={tplMeta.key}
                                        templateLabel={tplMeta.label}
                                    />
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
                                                    className="w-full py-1.5 text-[11px] italic font-light text-neutral-300 hover:text-[#6366F1] hover:not-italic transition-colors"
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
                                                    placeholder="이 노트의 핵심 요약"
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
                                                    onClick={() => setConfirmDeletePage(true)}
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
                                                <button onClick={addCornellPage} className="flex items-center gap-1 text-xs text-[#6366F1] hover:text-[#4F46E5] transition-colors">
                                                    <Plus className="h-3 w-3" /> 새 페이지
                                                </button>
                                                <ConfirmSheet
                                                    open={confirmDeletePage}
                                                    message={`현재 페이지를 삭제할까요?\n${allCornellPages.length} 중 ${expandedNotePage + 1}페이지`}
                                                    onConfirm={() => { setConfirmDeletePage(false); deleteCornellPage(); }}
                                                    onCancel={() => setConfirmDeletePage(false)}
                                                />
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
                                    {/* 전체 선택/해제 — 메인 태스크 기준 (서브는 메인을 선택하면 함께 따라옴) */}
                                    {(() => {
                                        const mains = pendingGroups.flatMap(g => g.tasks).filter(t => !t.parent_id);
                                        return (
                                    <div className="px-5 py-3 bg-neutral-50 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="pending-select-all"
                                            checked={mains.length > 0 && selectedPendingIds.size === mains.length}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedPendingIds(new Set(mains.map(t => t.id)));
                                                } else {
                                                    setSelectedPendingIds(new Set());
                                                }
                                            }}
                                            className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        <label htmlFor="pending-select-all" className="text-xs text-neutral-600 cursor-pointer select-none">
                                            전체 선택 ({mains.length}건 · 서브 동반)
                                        </label>
                                        {selectedPendingIds.size > 0 && selectedPendingIds.size < mains.length && (
                                            <span className="text-xs text-amber-600 ml-auto">{selectedPendingIds.size}건 선택</span>
                                        )}
                                    </div>
                                        );
                                    })()}

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
                                                        const isSub = !!task.parent_id;
                                                        const subDone = isSub && (task.status === "done" || task.status === "cancelled");
                                                        // 서브태스크는 체크박스 비활성, 메인을 선택하면 함께 따라옴
                                                        return (
                                                            <li
                                                                key={task.id}
                                                                onClick={isSub ? undefined : () => {
                                                                    setSelectedPendingIds(prev => {
                                                                        const next = new Set(prev);
                                                                        if (next.has(task.id)) next.delete(task.id);
                                                                        else next.add(task.id);
                                                                        return next;
                                                                    });
                                                                }}
                                                                className={`flex items-center gap-3 px-5 py-2 transition-colors ${
                                                                    isSub
                                                                        ? "bg-neutral-50/60 pl-12 cursor-default"
                                                                        : `py-3 cursor-pointer hover:bg-neutral-50 ${checked ? '' : 'opacity-50'}`
                                                                }`}
                                                            >
                                                                {isSub ? (
                                                                    <span className={`shrink-0 w-3 h-3 rounded-sm border flex items-center justify-center text-[8px] font-bold ${
                                                                        task.status === "done" ? "bg-[#6366F1] border-[#6366F1] text-white"
                                                                        : task.status === "doing" ? "bg-amber-400 border-amber-400 text-white"
                                                                        : task.status === "cancelled" ? "bg-neutral-300 border-neutral-300 text-white"
                                                                        : "border-neutral-300"
                                                                    }`}>
                                                                        {task.status === "done" ? "✓" : task.status === "doing" ? "·" : task.status === "cancelled" ? "✕" : ""}
                                                                    </span>
                                                                ) : (
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
                                                                )}
                                                                <span className={`flex-1 leading-snug ${
                                                                    isSub
                                                                        ? `text-xs ${subDone ? "text-neutral-400 line-through" : "text-neutral-600"}`
                                                                        : "text-sm text-neutral-800"
                                                                }`}>
                                                                    {task.text}
                                                                </span>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    {task.time && (
                                                                        <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                                                                            <Clock className="h-2.5 w-2.5" />{task.time}
                                                                        </span>
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
                                        {c === "all" ? "전체" : c === "favs" ? "⭐ 즐겨찾기" : c === "recommended" ? "📈 추천" : c === "framework" ? "프레임워크" : c === "schedule" ? "스케줄" : "노트"}
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

// TaskRowProps, TaskRow → DailyTaskRow.tsx (imported above)

/** 서브 태스크 한 줄 — 메인 태스크 아래 들여쓰기 렌더 */
function SubtaskRow({ task, onCycle, onRemove }: { task: PlannerTask; onCycle: () => void; onRemove: () => void }) {
    const strike = task.status === "done" || task.status === "cancelled" || task.status === "moved";
    return (
        <div className="group flex items-center gap-2 py-0.5">
            <button
                onClick={onCycle}
                title="클릭: 미완 → 완료 → 보류 → 취소 (반복)"
                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center text-[9px] font-bold transition-colors shrink-0 ${
                    task.status === "done"     ? "bg-[#6366F1] border-[#6366F1] text-white"
                    : task.status === "doing"  ? "bg-amber-400 border-amber-400 text-white"
                    : task.status === "hold"   ? "bg-amber-200 border-amber-300 text-amber-800"
                    : task.status === "cancelled" ? "bg-neutral-300 border-neutral-300 text-white"
                    : "border-neutral-300 hover:border-[#6366F1]"
                }`}
            >
                {task.status === "done" ? "✓" : task.status === "doing" ? "·" : task.status === "hold" ? "⏸" : task.status === "cancelled" ? "✕" : ""}
            </button>
            {task.time && (
                <span className="shrink-0 text-[10px] font-mono text-neutral-400">{task.time.slice(0, 5)}</span>
            )}
            <span className={`flex-1 text-[11px] leading-snug ${strike ? "text-neutral-400 line-through" : "text-neutral-600"}`}>
                {task.text}
            </span>
            <button
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-rose-500 transition-opacity shrink-0"
            >
                <Trash2 className="h-2.5 w-2.5" />
            </button>
        </div>
    );
}

// ExerciseBlock, HealthBlock, TrackingRowWithNote, TrackingRow → DailyTrackingBlocks.tsx (imported above)
// UpcomingSchedule → UpcomingSchedule.tsx (imported above)

