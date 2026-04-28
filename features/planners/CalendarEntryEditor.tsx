"use client";

// 통합 캘린더 엔트리 편집기 — Daily/Weekly/Monthly/Yearly 모두 같은 모달 사용
// 신규/수정 모두 처리. is_system=true 엔트리는 편집 불가.

import { useEffect, useState, useMemo, useRef } from "react";
import { Loader2, X, Trash2, ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react";
import type { CalendarEntry, CalendarKind, RecurrenceUnit } from "@/lib/planners/calendar-rules";
import { KIND_LABELS, KIND_COLORS } from "@/lib/planners/calendar-rules";
import type { TaskQuadrant } from "@/lib/planners/types";
import {
    getLunarDate, lunarToSolar, getLunarMonths, getLunarMonthDays,
    LUNAR_YEARS, LUNAR_YEARS_ANNIVERSARY,
} from "@/lib/planners/holidays";

type EditableEntry = Omit<CalendarEntry, "id" | "member_id" | "is_system" | "created_at" | "updated_at"> & {
    id?: string;
    is_system?: boolean;
};

const EDITABLE_KINDS: CalendarKind[] = ["meeting", "anniversary"];

// ── 시간 선택 컴포넌트 ─────────────────────────────────────────────────────
// input type="time" 은 모바일에서 OS 네이티브 원형 시계를 띄워 OK버튼이 가려지는 문제가 있음.
// select 드롭다운으로 대체.
const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function TimeSelect({
    value, onChange, disabled,
}: {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
}) {
    const [h, m] = value ? value.split(":") : ["", ""];
    const selectCls = "text-sm border border-neutral-200 rounded px-1.5 py-1.5 focus:outline-none focus:border-[#0F766E] bg-white disabled:opacity-50 disabled:cursor-not-allowed";
    return (
        <div className="flex items-center gap-1">
            <select
                value={h ?? ""}
                onChange={(e) => onChange(e.target.value ? `${e.target.value}:${m || "00"}` : "")}
                disabled={disabled}
                className={selectCls}
            >
                <option value="">시</option>
                {HOURS.map(hh => <option key={hh} value={hh}>{hh}</option>)}
            </select>
            <span className="text-xs text-neutral-400">:</span>
            <select
                value={m ?? ""}
                onChange={(e) => onChange(h ? `${h}:${e.target.value}` : "")}
                disabled={disabled || !h}
                className={selectCls}
            >
                {MINUTES.map(mm => <option key={mm} value={mm}>{mm}</option>)}
            </select>
        </div>
    );
}

const RECURRENCE_OPTIONS: Array<{ value: RecurrenceUnit; label: string; allowedKinds: CalendarKind[] }> = [
    { value: "none",    label: "반복 없음", allowedKinds: ["meeting", "anniversary"] },
    { value: "weekly",  label: "매주",      allowedKinds: ["meeting"] },
    { value: "monthly", label: "매월",      allowedKinds: ["meeting", "anniversary"] },
    { value: "yearly",  label: "매년",      allowedKinds: ["anniversary"] },
];

type ModalTab = CalendarKind | "task";

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: (entry: CalendarEntry) => void;
    onDeleted?: (id: string) => void;
    /** 수정 모드면 기존 엔트리, 신규면 부분 초기값 */
    initial?: Partial<EditableEntry>;
    /** 기본 시작일 — 신규 생성 시 (YYYY-MM-DD) */
    defaultDate?: string;
    /** 업무(Task) 추가 콜백 */
    onTaskCreated?: (task: { text: string; time?: string | null; project_id?: string | null; priority?: TaskQuadrant | null; memo?: string | null }) => void;
    /** 업무 프로젝트 목록 */
    activeProjects?: Array<{ id: string; title: string; color: string | null }>;
}

export function CalendarEntryEditor({ open, onClose, onSaved, onDeleted, initial, defaultDate, onTaskCreated, activeProjects = [] }: Props) {
    const [tab, setTab] = useState<ModalTab>("meeting");
    const kind = tab === "task" ? "meeting" : tab as CalendarKind; // calendar form 내부용
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(defaultDate || todayStr());
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [recurrence, setRecurrence] = useState<RecurrenceUnit>("none");
    const [recurrenceUntil, setRecurrenceUntil] = useState("");
    const [saving, setSaving] = useState(false);
    const [kbOffset, setKbOffset] = useState(0);  // 모바일 키보드 오프셋

    // 업무 탭 전용 상태
    const [taskText, setTaskText] = useState("");
    const [taskTime, setTaskTime] = useState("");
    const [taskProjectId, setTaskProjectId] = useState("");
    const [taskPriority, setTaskPriority] = useState<TaskQuadrant | null>(null);
    const [taskMemo, setTaskMemo] = useState("");
    // 미팅 탭 전용 상태
    const [withWhom, setWithWhom] = useState("");
    const [location, setLocation] = useState("");

    // 모바일 키보드 올라올 때 바텀시트 위로 밀어올리기
    useEffect(() => {
        if (!open || typeof window === "undefined" || !window.visualViewport) return;
        const vv = window.visualViewport!;
        function onResize() {
            // visualViewport.offsetTop 이 키보드 높이만큼 증가
            const offset = window.innerHeight - vv.height - vv.offsetTop;
            setKbOffset(Math.max(0, offset));
        }
        vv.addEventListener("resize", onResize);
        vv.addEventListener("scroll", onResize);
        return () => {
            vv.removeEventListener("resize", onResize);
            vv.removeEventListener("scroll", onResize);
        };
    }, [open]);

    // 날짜 입력 모드 토글
    const [isLunar, setIsLunar] = useState(false);
    const [lunarPickerOpen, setLunarPickerOpen] = useState(false);
    // 음력 상태 (startDate와 항상 동기화)
    const [lunarYear, setLunarYear] = useState(new Date().getFullYear());
    const [lunarMonth, setLunarMonth] = useState(1);
    const [lunarMonthLeap, setLunarMonthLeap] = useState(false);
    const [lunarDay, setLunarDay] = useState(1);

    const isEdit = !!initial?.id;
    const isReadOnly = !!initial?.is_system;

    useEffect(() => {
        if (!open) return;
        setTab(initial?.kind ? (initial.kind as CalendarKind) : (onTaskCreated ? "task" : "meeting"));
        setTaskText(""); setTaskTime(""); setTaskProjectId(""); setTaskMemo(""); setTaskPriority(null);
        setWithWhom(initial?.with_whom || ""); setLocation(initial?.location || "");
        setTitle(initial?.title || "");
        setDescription(initial?.description || "");
        const sd = initial?.start_date || defaultDate || todayStr();
        setStartDate(sd);
        setStartTime(initial?.start_time || "");
        setEndTime(initial?.end_time || "");
        setRecurrence(initial?.recurrence || "none");
        setRecurrenceUntil(initial?.recurrence_until || "");
        setIsLunar(false);
        syncLunarFromSolar(sd);
    }, [open, initial, defaultDate]); // eslint-disable-line react-hooks/exhaustive-deps

    function syncLunarFromSolar(solar: string) {
        const lunar = getLunarDate(solar);
        if (lunar) {
            setLunarYear(lunar.year);
            setLunarMonth(lunar.month);
            setLunarMonthLeap(lunar.isLeap);
            setLunarDay(lunar.day);
        }
    }

    // 테이블 범위 밖이면 1~12월 기본 목록
    const lunarMonths = useMemo(() => {
        const m = getLunarMonths(lunarYear);
        return m.length > 0 ? m : Array.from({ length: 12 }, (_, i) => ({ month: i + 1, isLeap: false }));
    }, [lunarYear]);
    const lunarDayCount = useMemo(
        () => getLunarMonthDays(lunarYear, lunarMonth, lunarMonthLeap),
        [lunarYear, lunarMonth, lunarMonthLeap]
    );

    // 음력 변경 → 양력 업데이트
    function applyLunar(y: number, m: number, d: number, leap: boolean) {
        const solar = lunarToSolar(y, m, Math.min(d, getLunarMonthDays(y, m, leap)), leap);
        if (solar) setStartDate(solar);
    }

    // kind 가 바뀌면 허용되지 않는 recurrence 는 'none' 으로 리셋
    useEffect(() => {
        const allowed = RECURRENCE_OPTIONS.find((o) => o.value === recurrence)?.allowedKinds ?? [];
        if (!allowed.includes(kind)) setRecurrence("none");
    }, [kind, recurrence]);

    if (!open) return null;

    async function submit() {
        if (!title.trim() || isReadOnly) return;
        setSaving(true);
        try {
            const payload = {
                kind, title, description,
                start_date: startDate,
                start_time: kind === "anniversary" ? null : (startTime || null),
                end_time:   kind === "anniversary" ? null : (endTime || null),
                recurrence,
                recurrence_until: recurrenceUntil || null,
                status: null,
                with_whom: kind === "meeting" ? (withWhom.trim() || null) : null,
                location:  kind === "meeting" ? (location.trim() || null) : null,
            };
            const url = isEdit ? `/api/planners/calendar/${initial!.id}` : "/api/planners/calendar";
            const method = isEdit ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                alert(`저장 실패: ${err.error || res.status}`);
                setSaving(false);
                return;
            }
            const d = await res.json();
            if (isEdit) {
                onSaved({ ...(initial as CalendarEntry), ...payload, id: initial!.id! });
            } else if (d.entry) {
                onSaved(d.entry);
            }
            onClose();
        } finally {
            setSaving(false);
        }
    }

    async function remove() {
        if (!isEdit || !initial?.id) return;
        if (!confirm("이 일정을 삭제할까요?")) return;
        const res = await fetch(`/api/planners/calendar/${initial.id}`, { method: "DELETE" });
        if (res.ok) {
            onDeleted?.(initial.id);
            onClose();
        }
    }

    const allowedRecurrences = RECURRENCE_OPTIONS.filter((o) => o.allowedKinds.includes(kind));

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4" onClick={onClose}>
            <div
                className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col h-[85vh] sm:h-[600px] shadow-2xl transition-transform duration-150"
                style={{ transform: `translateY(-${kbOffset}px)` }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 shrink-0">
                    <h2 className="text-sm font-semibold text-neutral-900">
                        {isReadOnly ? "일정 보기" : isEdit ? "일정 수정" : "새 일정"}
                    </h2>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {/* Kind selector — 시스템 엔트리는 라벨만 노출 */}
                    {isReadOnly ? (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${KIND_COLORS[kind].bg} ${KIND_COLORS[kind].text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${KIND_COLORS[kind].dot}`} />
                            {KIND_LABELS[kind]} <span className="opacity-60">· 시스템</span>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-1.5">
                            {/* 업무 탭 — 항상 첫 번째 */}
                            {onTaskCreated && (
                                <button
                                    type="button"
                                    onClick={() => setTab("task")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                        tab === "task"
                                            ? "bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/40"
                                            : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                                    }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] shrink-0" />
                                    업무
                                </button>
                            )}
                            {EDITABLE_KINDS.map((k) => {
                                const active = tab === k;
                                const c = KIND_COLORS[k];
                                return (
                                    <button
                                        key={k}
                                        type="button"
                                        onClick={() => setTab(k)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                            active ? `${c.bg} ${c.text} border-current` : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                                        {KIND_LABELS[k]}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* ── 업무 탭 폼 ── */}
                    {tab === "task" && (
                        <div className="space-y-4 py-1">
                            {/* 할 일 */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">할 일</label>
                                <input
                                    type="text"
                                    value={taskText}
                                    onChange={(e) => setTaskText(e.target.value)}
                                    placeholder="업무 내용을 입력하세요"
                                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20"
                                    autoFocus
                                />
                            </div>

                            {/* 시간 — 사분면보다 먼저 */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">시간 (선택)</label>
                                <input
                                    type="time"
                                    value={taskTime}
                                    onChange={(e) => setTaskTime(e.target.value)}
                                    className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#0F766E] bg-white"
                                />
                            </div>

                            {/* 경중완급 사분면 — 단색 */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-2">경중완급 (선택)</label>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[9px] text-neutral-300">급</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-neutral-300 w-4 text-right">경</span>
                                        <div className="grid grid-cols-2 rounded-lg overflow-hidden border border-neutral-200 w-[180px]">
                                            {([
                                                { q: "급경" as TaskQuadrant, sub: "긴급·쉬운", bCls: "border-b border-r border-neutral-200" },
                                                { q: "급중" as TaskQuadrant, sub: "긴급·중요", bCls: "border-b border-neutral-200" },
                                                { q: "완경" as TaskQuadrant, sub: "여유·쉬운", bCls: "border-r border-neutral-200" },
                                                { q: "완중" as TaskQuadrant, sub: "여유·중요", bCls: "" },
                                            ] as const).map(({ q, sub, bCls }) => (
                                                <button
                                                    key={q}
                                                    type="button"
                                                    onClick={() => setTaskPriority(taskPriority === q ? null : q)}
                                                    className={`py-2.5 text-center transition-colors ${bCls} ${
                                                        taskPriority === q
                                                            ? "bg-neutral-900 text-white"
                                                            : "bg-white hover:bg-neutral-50 text-neutral-600"
                                                    }`}
                                                >
                                                    <div className="text-xs font-semibold leading-none">{q}</div>
                                                    <div className="text-[9px] mt-0.5 opacity-50">{sub}</div>
                                                </button>
                                            ))}
                                        </div>
                                        <span className="text-[9px] text-neutral-300 w-4">중</span>
                                    </div>
                                    <span className="text-[9px] text-neutral-300">완</span>
                                </div>
                            </div>

                            {/* 프로젝트 */}
                            {activeProjects.length > 0 && (
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">프로젝트 (선택)</label>
                                    <select
                                        value={taskProjectId}
                                        onChange={(e) => setTaskProjectId(e.target.value)}
                                        className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#0F766E] bg-white"
                                    >
                                        <option value="">프로젝트 없음</option>
                                        {activeProjects.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* 메모 */}
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">메모 (선택)</label>
                                <textarea
                                    value={taskMemo}
                                    onChange={(e) => setTaskMemo(e.target.value)}
                                    placeholder="추가 메모"
                                    rows={2}
                                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#0F766E] resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* ── 캘린더 엔트리 폼 (미팅·기념일) ── */}
                    {tab !== "task" && <><div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isReadOnly}
                            placeholder={kindPlaceholder(kind)}
                            className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20 disabled:bg-neutral-50 disabled:text-neutral-500"
                        />
                    </div>

                    {/* 미팅 전용: 누구와 + 장소 */}
                    {kind === "meeting" && !isReadOnly && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">
                                    <Users className="h-3 w-3" /> 누구와 (선택)
                                </label>
                                <input
                                    type="text"
                                    value={withWhom}
                                    onChange={(e) => setWithWhom(e.target.value)}
                                    placeholder="예: 홍길동, 팀장"
                                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#0F766E]"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">
                                    <MapPin className="h-3 w-3" /> 장소 (선택)
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="예: 2층 회의실"
                                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#0F766E]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Date — 양력/음력 토글 입력 */}
                    <div className="space-y-2">
                        {/* 모드 토글 */}
                        {!isReadOnly && (
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setIsLunar(false)}
                                    className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                                        !isLunar ? "bg-neutral-800 text-white border-neutral-800" : "bg-white text-neutral-400 border-neutral-200 hover:bg-neutral-50"
                                    }`}
                                >양력</button>
                                <button
                                    type="button"
                                    onClick={() => setIsLunar(true)}
                                    className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                                        isLunar ? "bg-neutral-800 text-white border-neutral-800" : "bg-white text-neutral-400 border-neutral-200 hover:bg-neutral-50"
                                    }`}
                                >음력</button>
                            </div>
                        )}

                        {!isLunar ? (
                            /* ─── 양력: native date picker (한 곳) ─── */
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => {
                                        setStartDate(e.target.value);
                                        syncLunarFromSolar(e.target.value);
                                    }}
                                    disabled={isReadOnly}
                                    className="shrink-0 w-[150px] text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0F766E]"
                                />
                                {kind !== "anniversary" && (
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            disabled={isReadOnly}
                                            className="text-sm border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0F766E] bg-white disabled:opacity-50"
                                        />
                                        <span className="text-xs text-neutral-300">~</span>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            disabled={isReadOnly}
                                            className="text-sm border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0F766E] bg-white disabled:opacity-50"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ─── 음력: 단일 버튼 + 캘린더 팝오버 (한 곳) ─── */
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="relative shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setLunarPickerOpen((o) => !o)}
                                            disabled={isReadOnly}
                                            className="w-[150px] text-sm border border-neutral-200 rounded px-2 py-1.5 text-left bg-white focus:outline-none focus:border-[#0F766E]"
                                        >
                                            {lunarYear}-{String(lunarMonth).padStart(2, "0")}{lunarMonthLeap ? "(윤)" : ""}-{String(lunarDay).padStart(2, "0")}
                                        </button>
                                        {lunarPickerOpen && (
                                            <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 z-20 w-[260px]">
                                                {/* 연도 네비게이션 */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <button type="button"
                                                        onClick={() => {
                                                            const ny = lunarYear - 1;
                                                            const yearList = kind === "anniversary" ? LUNAR_YEARS_ANNIVERSARY : LUNAR_YEARS;
                                                            if (!yearList.includes(ny)) return;
                                                            setLunarYear(ny);
                                                            applyLunar(ny, lunarMonth, lunarDay, lunarMonthLeap);
                                                        }}
                                                        className="p-1 hover:bg-neutral-100 rounded">
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </button>
                                                    <span className="text-sm font-medium">{lunarYear}년</span>
                                                    <button type="button"
                                                        onClick={() => {
                                                            const ny = lunarYear + 1;
                                                            const yearList = kind === "anniversary" ? LUNAR_YEARS_ANNIVERSARY : LUNAR_YEARS;
                                                            if (!yearList.includes(ny)) return;
                                                            setLunarYear(ny);
                                                            applyLunar(ny, lunarMonth, lunarDay, lunarMonthLeap);
                                                        }}
                                                        className="p-1 hover:bg-neutral-100 rounded">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                {/* 월 그리드 */}
                                                <div className="grid grid-cols-6 gap-1 mb-2">
                                                    {lunarMonths.map(({ month, isLeap }) => {
                                                        const active = month === lunarMonth && isLeap === lunarMonthLeap;
                                                        return (
                                                            <button key={`${month}-${isLeap}`} type="button"
                                                                onClick={() => {
                                                                    setLunarMonth(month);
                                                                    setLunarMonthLeap(isLeap);
                                                                    applyLunar(lunarYear, month, lunarDay, isLeap);
                                                                }}
                                                                className={`text-xs py-1 rounded ${active ? "bg-[#0F766E] text-white" : "hover:bg-neutral-100 text-neutral-600"}`}>
                                                                {isLeap ? "윤" : ""}{month}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                {/* 일 그리드 */}
                                                <div className="grid grid-cols-7 gap-1">
                                                    {Array.from({ length: lunarDayCount }, (_, i) => i + 1).map((d) => {
                                                        const active = d === lunarDay;
                                                        return (
                                                            <button key={d} type="button"
                                                                onClick={() => {
                                                                    setLunarDay(d);
                                                                    applyLunar(lunarYear, lunarMonth, d, lunarMonthLeap);
                                                                    setLunarPickerOpen(false);
                                                                }}
                                                                className={`text-xs py-1 rounded ${active ? "bg-[#0F766E] text-white" : "hover:bg-neutral-100 text-neutral-700"}`}>
                                                                {d}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {kind !== "anniversary" && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                disabled={isReadOnly}
                                                className="text-sm border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0F766E] bg-white disabled:opacity-50"
                                            />
                                            <span className="text-xs text-neutral-300">~</span>
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                disabled={isReadOnly}
                                                className="text-sm border border-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0F766E] bg-white disabled:opacity-50"
                                            />
                                        </div>
                                    )}
                                </div>
                                {kind === "anniversary" && !LUNAR_YEARS.includes(lunarYear) && (
                                    <p className="text-[10px] text-amber-500">테이블 범위 외 — 근사 변환 적용</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recurrence */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">반복</label>
                            <select
                                value={recurrence}
                                onChange={(e) => setRecurrence(e.target.value as RecurrenceUnit)}
                                disabled={isReadOnly}
                                className="w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0F766E] bg-white"
                            >
                                {allowedRecurrences.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        {recurrence !== "none" && (
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">반복 종료 (선택)</label>
                                <input
                                    type="date"
                                    value={recurrenceUntil}
                                    onChange={(e) => setRecurrenceUntil(e.target.value)}
                                    disabled={isReadOnly}
                                    className="w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0F766E]"
                                />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">메모</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isReadOnly}
                            rows={3}
                            className="w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0F766E] resize-none"
                        />
                    </div>
                    </>}  {/* end tab !== "task" */}
                </div>

                {/* Footer */}
                {!isReadOnly && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-200 shrink-0">
                        <div>
                            {isEdit && (
                                <button
                                    onClick={remove}
                                    type="button"
                                    className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-rose-500 hover:bg-rose-50 rounded"
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> 삭제
                                </button>
                            )}
                        </div>
                        {tab === "task" ? (
                            <button
                                type="button"
                                disabled={!taskText.trim()}
                                onClick={() => {
                                    if (!taskText.trim()) return;
                                    onTaskCreated?.({
                                        text: taskText.trim(),
                                        time: taskTime || null,
                                        project_id: taskProjectId || null,
                                        priority: taskPriority,
                                        memo: taskMemo.trim() || null,
                                    });
                                    onClose();
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white text-sm rounded-lg hover:bg-[#0d5e56] disabled:opacity-50"
                            >
                                추가
                            </button>
                        ) : (
                            <button
                                onClick={submit}
                                disabled={saving || !title.trim()}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white text-sm rounded-lg hover:bg-[#0d5e56] disabled:opacity-50"
                            >
                                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                {isEdit ? "저장" : "추가"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function kindPlaceholder(kind: CalendarKind): string {
    switch (kind) {
        case "meeting":     return "예: 클라이언트 미팅, 팀 스탠드업";
        case "anniversary": return "예: 어머니 생신, 결혼기념일";
        default:            return "제목";
    }
}
