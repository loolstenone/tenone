"use client";

// 통합 캘린더 엔트리 편집기 — Daily/Weekly/Monthly/Yearly 모두 같은 모달 사용
// 신규/수정 모두 처리. is_system=true 엔트리는 편집 불가.

import { useEffect, useState } from "react";
import { Loader2, X, Trash2 } from "lucide-react";
import type { CalendarEntry, CalendarKind, RecurrenceUnit } from "@/lib/planners/calendar-rules";
import { KIND_LABELS, KIND_COLORS } from "@/lib/planners/calendar-rules";

type EditableEntry = Omit<CalendarEntry, "id" | "member_id" | "is_system" | "created_at" | "updated_at"> & {
    id?: string;
    is_system?: boolean;
};

const EDITABLE_KINDS: CalendarKind[] = ["meeting", "task", "anniversary"];

const RECURRENCE_OPTIONS: Array<{ value: RecurrenceUnit; label: string; allowedKinds: CalendarKind[] }> = [
    { value: "none",    label: "반복 없음", allowedKinds: ["meeting", "task", "anniversary"] },
    { value: "daily",   label: "매일",      allowedKinds: ["task"] },
    { value: "weekly",  label: "매주",      allowedKinds: ["meeting", "task"] },
    { value: "monthly", label: "매월",      allowedKinds: ["meeting", "task", "anniversary"] },
    { value: "yearly",  label: "매년",      allowedKinds: ["anniversary"] },
];

interface Props {
    open: boolean;
    onClose: () => void;
    onSaved: (entry: CalendarEntry) => void;
    onDeleted?: (id: string) => void;
    /** 수정 모드면 기존 엔트리, 신규면 부분 초기값 */
    initial?: Partial<EditableEntry>;
    /** 기본 시작일 — 신규 생성 시 (YYYY-MM-DD) */
    defaultDate?: string;
}

export function CalendarEntryEditor({ open, onClose, onSaved, onDeleted, initial, defaultDate }: Props) {
    const [kind, setKind] = useState<CalendarKind>("meeting");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState(defaultDate || todayStr());
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [recurrence, setRecurrence] = useState<RecurrenceUnit>("none");
    const [recurrenceUntil, setRecurrenceUntil] = useState("");
    const [saving, setSaving] = useState(false);

    const isEdit = !!initial?.id;
    const isReadOnly = !!initial?.is_system;

    useEffect(() => {
        if (!open) return;
        setKind((initial?.kind as CalendarKind) || "meeting");
        setTitle(initial?.title || "");
        setDescription(initial?.description || "");
        setStartDate(initial?.start_date || defaultDate || todayStr());
        setStartTime(initial?.start_time || "");
        setEndTime(initial?.end_time || "");
        setRecurrence(initial?.recurrence || "none");
        setRecurrenceUntil(initial?.recurrence_until || "");
    }, [open, initial, defaultDate]);

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
                status: kind === "task" ? (initial?.status || "todo") : null,
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
            <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col h-[85vh] sm:h-auto sm:max-h-[85vh] shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
                            {EDITABLE_KINDS.map((k) => {
                                const active = kind === k;
                                const c = KIND_COLORS[k];
                                return (
                                    <button
                                        key={k}
                                        type="button"
                                        onClick={() => setKind(k)}
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

                    {/* Title */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isReadOnly}
                            placeholder={kindPlaceholder(kind)}
                            className="w-full text-sm border-b border-neutral-200 focus:outline-none focus:border-[#0F766E] py-1.5 disabled:bg-transparent"
                        />
                    </div>

                    {/* Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">날짜</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={isReadOnly}
                                className="w-full text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0F766E]"
                            />
                        </div>
                        {kind !== "anniversary" && (
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-neutral-400 mb-1">시간 (선택)</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        disabled={isReadOnly}
                                        className="flex-1 text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0F766E]"
                                    />
                                    <span className="text-xs text-neutral-300">~</span>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        disabled={isReadOnly}
                                        className="flex-1 text-sm border border-neutral-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0F766E]"
                                    />
                                </div>
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
                        <button
                            onClick={submit}
                            disabled={saving || !title.trim()}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F766E] text-white text-sm rounded-lg hover:bg-[#0d5e56] disabled:opacity-50"
                        >
                            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {isEdit ? "저장" : "추가"}
                        </button>
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
        case "task":        return "예: 보고서 마감, 이메일 회신";
        case "anniversary": return "예: 어머니 생신, 결혼기념일";
        default:            return "제목";
    }
}
