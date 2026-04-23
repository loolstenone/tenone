"use client";

/**
 * Coaching Tab — 코칭 세션 이력
 * 세션 기록(주제·요약·액션아이템) 추가 + 타임라인 표시
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
    BookOpen,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    User,
    CheckSquare,
} from "lucide-react";

const RED = "#E53935";

const SESSION_TYPES = [
    { key: "self",   label: "셀프" },
    { key: "peer",   label: "동료" },
    { key: "mentor", label: "멘토" },
    { key: "pro",    label: "전문코치" },
];

const TYPE_COLOR: Record<string, string> = {
    self:   "bg-neutral-100 text-neutral-600",
    peer:   "bg-blue-50 text-blue-700",
    mentor: "bg-purple-50 text-purple-700",
    pro:    "bg-amber-50 text-amber-700",
};

interface Session {
    id: string;
    session_date: string;
    coach_name: string | null;
    topic: string;
    summary: string | null;
    action_items: string[];
    session_type: string;
    created_at: string;
}

export function CoachingTab({ memberId }: { memberId: string }) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/hero/coaching/sessions?memberId=${memberId}&limit=30`);
            if (r.ok) {
                const { items } = await r.json() as { items: Session[] };
                setSessions(items);
            }
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    useEffect(() => { load(); }, [load]);

    function handleAdded(session: Session) {
        setSessions((prev) => [session, ...prev]);
        setShowForm(false);
    }

    function handleDeleted(id: string) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
    }

    if (loading) {
        return (
            <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-neutral-100 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 헤더 */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" style={{ color: RED }} />
                        코칭 세션 이력
                    </h3>
                    <button
                        onClick={() => setShowForm((v) => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-bold"
                        style={{ backgroundColor: RED }}
                    >
                        <Plus className="w-4 h-4" />
                        기록 추가
                    </button>
                </div>
                <p className="text-sm text-neutral-500">
                    {sessions.length > 0
                        ? `총 ${sessions.length}회 세션 기록`
                        : "코칭 세션을 기록하면 성장 흐름을 추적할 수 있어요."}
                </p>
            </div>

            {/* 입력 폼 */}
            {showForm && (
                <SessionForm
                    memberId={memberId}
                    onAdded={handleAdded}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* 타임라인 */}
            {sessions.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-neutral-200 rounded-2xl">
                    <BookOpen className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-500">아직 기록된 세션이 없어요.</p>
                    <p className="text-xs text-neutral-400 mt-1">첫 번째 코칭 세션을 기록해보세요.</p>
                </div>
            ) : (
                <div className="relative">
                    {/* 타임라인 선 */}
                    <div className="absolute left-[23px] top-0 bottom-0 w-px bg-neutral-200" />
                    <div className="space-y-4">
                        {sessions.map((s) => (
                            <SessionCard key={s.id} session={s} onDelete={handleDeleted} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── 세션 카드 ─────────────────────────────────────────────────────── */

function SessionCard({ session: s, onDelete }: { session: Session; onDelete: (id: string) => void }) {
    const [expanded, setExpanded] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm("이 세션 기록을 삭제할까요?")) return;
        setDeleting(true);
        try {
            const r = await fetch(`/api/hero/coaching/sessions/${s.id}`, { method: "DELETE" });
            if (r.ok) onDelete(s.id);
        } finally {
            setDeleting(false);
        }
    }

    const typeLabel = SESSION_TYPES.find((t) => t.key === s.session_type)?.label ?? s.session_type;
    const typeClass = TYPE_COLOR[s.session_type] ?? TYPE_COLOR.self;
    const hasDetail = s.summary || s.action_items.length > 0;

    return (
        <div className="flex gap-4 pl-2">
            {/* 타임라인 dot */}
            <div className="shrink-0 mt-1 w-[24px] flex justify-center">
                <div className="w-3 h-3 rounded-full border-2 border-[#E53935] bg-white mt-1.5" />
            </div>

            {/* 카드 */}
            <div className="flex-1 bg-white border border-neutral-200 rounded-xl overflow-hidden group">
                <div className="flex items-start justify-between gap-3 p-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-xs text-neutral-400">{s.session_date}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${typeClass}`}>
                                {typeLabel}
                            </span>
                            {s.coach_name && (
                                <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                                    <User className="w-3 h-3" />
                                    {s.coach_name}
                                </span>
                            )}
                        </div>
                        <p className="font-bold text-neutral-900 text-sm leading-snug">{s.topic}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {hasDetail && (
                            <button
                                onClick={() => setExpanded((v) => !v)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                            >
                                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* 확장 영역 */}
                {expanded && hasDetail && (
                    <div className="border-t border-neutral-100 px-4 py-3 space-y-3 bg-neutral-50/50">
                        {s.summary && (
                            <p className="text-sm text-neutral-600 leading-relaxed">{s.summary}</p>
                        )}
                        {s.action_items.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">액션 아이템</p>
                                <ul className="space-y-1">
                                    {s.action_items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                                            <CheckSquare className="w-3.5 h-3.5 text-[#E53935] mt-0.5 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── 세션 입력 폼 ──────────────────────────────────────────────────── */

function SessionForm({ memberId, onAdded, onCancel }: {
    memberId: string;
    onAdded: (s: Session) => void;
    onCancel: () => void;
}) {
    const [topic, setTopic] = useState("");
    const [summary, setSummary] = useState("");
    const [sessionType, setSessionType] = useState("self");
    const [coachName, setCoachName] = useState("");
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
    const [actionItemInput, setActionItemInput] = useState("");
    const [actionItems, setActionItems] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const actionRef = useRef<HTMLInputElement>(null);

    function addActionItem() {
        const trimmed = actionItemInput.trim();
        if (!trimmed || actionItems.length >= 10) return;
        setActionItems((prev) => [...prev, trimmed]);
        setActionItemInput("");
        actionRef.current?.focus();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!topic.trim()) { setError("주제를 입력해주세요"); return; }
        setSubmitting(true);
        setError(null);
        try {
            const r = await fetch("/api/hero/coaching/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    memberId,
                    topic: topic.trim(),
                    summary: summary.trim() || undefined,
                    actionItems,
                    sessionDate,
                    coachName: coachName.trim() || undefined,
                    sessionType,
                }),
            });
            const json = await r.json();
            if (!r.ok) { setError(json.error ?? "오류가 발생했습니다"); return; }
            onAdded(json.item as Session);
        } catch {
            setError("네트워크 오류");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-neutral-900">새 세션 기록</h4>

            {/* 날짜 + 유형 */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold text-neutral-500 mb-1 block">날짜</label>
                    <input
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E53935]"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-neutral-500 mb-1 block">유형</label>
                    <select
                        value={sessionType}
                        onChange={(e) => setSessionType(e.target.value)}
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E53935]"
                    >
                        {SESSION_TYPES.map((t) => (
                            <option key={t.key} value={t.key}>{t.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 코치명 (선택) */}
            <div>
                <label className="text-xs font-bold text-neutral-500 mb-1 block">코치 이름 (선택)</label>
                <input
                    type="text"
                    placeholder="코치 또는 멘토 이름"
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E53935]"
                />
            </div>

            {/* 주제 */}
            <div>
                <label className="text-xs font-bold text-neutral-500 mb-1 block">주제 *</label>
                <input
                    type="text"
                    placeholder="이번 세션에서 다룬 핵심 주제"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    maxLength={100}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E53935]"
                    required
                />
                <p className="text-xs text-neutral-400 mt-1 text-right">{topic.length}/100</p>
            </div>

            {/* 요약 */}
            <div>
                <label className="text-xs font-bold text-neutral-500 mb-1 block">세션 요약 (선택)</label>
                <textarea
                    placeholder="세션에서 나눈 내용을 간단히 기록하세요"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E53935] resize-none"
                />
                <p className="text-xs text-neutral-400 mt-1 text-right">{summary.length}/500</p>
            </div>

            {/* 액션 아이템 */}
            <div>
                <label className="text-xs font-bold text-neutral-500 mb-1 block">
                    액션 아이템 ({actionItems.length}/10)
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        ref={actionRef}
                        type="text"
                        placeholder="할 일 입력 후 Enter"
                        value={actionItemInput}
                        onChange={(e) => setActionItemInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addActionItem(); } }}
                        className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E53935]"
                    />
                    <button
                        type="button"
                        onClick={addActionItem}
                        className="px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-600 hover:bg-neutral-50"
                    >
                        추가
                    </button>
                </div>
                {actionItems.length > 0 && (
                    <ul className="space-y-1">
                        {actionItems.map((item, i) => (
                            <li key={i} className="flex items-center justify-between px-3 py-1.5 bg-neutral-50 rounded-lg text-sm text-neutral-700">
                                <span className="flex items-center gap-2">
                                    <CheckSquare className="w-3.5 h-3.5 text-[#E53935] shrink-0" />
                                    {item}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setActionItems((prev) => prev.filter((_, j) => j !== i))}
                                    className="text-neutral-300 hover:text-red-500 ml-2"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2 pt-1">
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: RED }}
                >
                    {submitting ? "저장 중…" : "저장"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50"
                >
                    취소
                </button>
            </div>
        </form>
    );
}
