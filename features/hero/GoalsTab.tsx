"use client";

/**
 * Goals Tab — Vrief × GPR 이중축 목표 관리
 *
 * 액션 단위 원칙:
 *   · 목표 "쓰기" (생성)
 *   · 주간 "체크인"
 *   · 진행률 자동 계산
 *   · 완료 · 보관 · 삭제
 */

import { useState, useEffect, useCallback } from "react";
import {
    Target,
    Plus,
    Trash2,
    CheckCircle2,
    Clock,
    X,
    TrendingUp,
    Activity,
} from "lucide-react";

const RED = "#E53935";

interface VriefTarget { code: string; label: string; from: number; to: number; }
interface GprTarget { label: string; metric?: string; target?: number; current?: number; }
interface Goal {
    id: string;
    title: string;
    description: string | null;
    vrief_targets: VriefTarget[];
    gpr_targets: GprTarget[];
    start_date: string;
    deadline: string | null;
    status: "active" | "completed" | "paused" | "abandoned";
    progress_percent: number;
}

export function GoalsTab({ memberId }: { memberId: string }) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [checkinGoal, setCheckinGoal] = useState<Goal | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/hero/goals?memberId=${memberId}&status=active`);
            if (r.ok) setGoals((await r.json()).goals ?? []);
        } finally {
            setLoading(false);
        }
    }, [memberId]);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                            <Target className="w-5 h-5" style={{ color: RED }} />
                            나의 목표
                        </h3>
                        <p className="text-sm text-neutral-500 mt-1">
                            Vrief(역량) × GPR(업적) 이중축. 분기 단위 3개까지 권장.
                        </p>
                    </div>
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: RED }}
                    >
                        <Plus className="w-4 h-4" /> 새 목표 쓰기
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-32 bg-neutral-100 rounded-xl" />
                        <div className="h-32 bg-neutral-100 rounded-xl" />
                    </div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-12 px-6 border border-dashed border-neutral-200 rounded-xl">
                        <Target className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                        <p className="text-sm text-neutral-500 mb-4">아직 설정된 목표가 없어요.</p>
                        <p className="text-xs text-neutral-400">
                            첫 목표는 분기 단위로 3개월 안에 달성 가능한 것으로.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {goals.map((g) => (
                            <GoalCard key={g.id} goal={g} onCheckin={() => setCheckinGoal(g)} onChange={load} />
                        ))}
                    </div>
                )}
            </div>

            {createOpen && (
                <CreateGoalModal
                    memberId={memberId}
                    onClose={() => setCreateOpen(false)}
                    onCreated={() => { setCreateOpen(false); load(); }}
                />
            )}

            {checkinGoal && (
                <CheckinModal
                    memberId={memberId}
                    goal={checkinGoal}
                    onClose={() => setCheckinGoal(null)}
                    onSaved={() => { setCheckinGoal(null); load(); }}
                />
            )}
        </div>
    );
}

/* ═════════════════════════ 목표 카드 ═════════════════════════ */

function GoalCard({ goal, onCheckin, onChange }: { goal: Goal; onCheckin: () => void; onChange: () => void }) {
    const handleComplete = async () => {
        if (!confirm("이 목표를 완료 처리할까요?")) return;
        await fetch(`/api/hero/goals/${goal.id}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status: "completed", progressPercent: 100 }),
        });
        onChange();
    };
    const handleDelete = async () => {
        if (!confirm("목표를 삭제할까요? 되돌릴 수 없어요.")) return;
        await fetch(`/api/hero/goals/${goal.id}`, { method: "DELETE" });
        onChange();
    };

    const daysLeft = goal.deadline
        ? Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000))
        : null;

    return (
        <div className="border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-neutral-900 text-base leading-tight">{goal.title}</h4>
                    {goal.description && (
                        <p className="text-sm text-neutral-500 mt-1">{goal.description}</p>
                    )}
                    {goal.deadline && (
                        <p className="text-[11px] text-neutral-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            마감: {goal.deadline} {daysLeft !== null && `(D-${daysLeft})`}
                        </p>
                    )}
                </div>
                <div className="text-right shrink-0 ml-4">
                    <div className="text-xl font-bold" style={{ color: RED }}>{goal.progress_percent}%</div>
                </div>
            </div>

            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden mb-4">
                <div className="h-full transition-all" style={{ width: `${goal.progress_percent}%`, backgroundColor: RED }} />
            </div>

            {goal.vrief_targets.length > 0 && (
                <div className="mb-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Vrief 역량
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {goal.vrief_targets.map((v) => (
                            <span key={v.code} className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                                {v.label} {v.from}→{v.to}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {goal.gpr_targets.length > 0 && (
                <div className="mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> GPR 업적
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {goal.gpr_targets.map((g, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                                {g.label}
                                {g.current !== undefined && g.target !== undefined && ` (${g.current}/${g.target})`}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                <button
                    onClick={onCheckin}
                    className="flex-1 py-2 rounded-lg text-white text-sm font-bold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: RED }}
                >
                    주간 체크인
                </button>
                <button
                    onClick={handleComplete}
                    className="p-2 text-neutral-400 hover:text-green-600 transition-colors"
                    title="완료 처리"
                >
                    <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                    title="삭제"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

/* ═════════════════════════ 생성 모달 ═════════════════════════ */

function CreateGoalModal({ memberId, onClose, onCreated }: { memberId: string; onClose: () => void; onCreated: () => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [vrief, setVrief] = useState<VriefTarget[]>([]);
    const [gpr, setGpr] = useState<GprTarget[]>([]);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!title.trim()) return;
        setSaving(true);
        try {
            const r = await fetch("/api/hero/goals", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    memberId,
                    title: title.trim(),
                    description: description.trim() || undefined,
                    vriefTargets: vrief.filter((v) => v.label.trim()),
                    gprTargets: gpr.filter((g) => g.label.trim()),
                    deadline: deadline || undefined,
                }),
            });
            if (r.ok) onCreated();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                    <h3 className="text-lg font-bold text-neutral-900">새 목표 쓰기</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    <Field label="목표 제목 (예: B2B SaaS 마케팅 리드로 전환)">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#E53935]"
                            placeholder="이번 분기 가장 중요한 목표는?"
                        />
                    </Field>

                    <Field label="설명 (선택)">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#E53935] resize-none"
                        />
                    </Field>

                    <Field label="마감일 (선택)">
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#E53935]"
                        />
                    </Field>

                    <VriefEditor value={vrief} onChange={setVrief} />
                    <GprEditor value={gpr} onChange={setGpr} />
                </div>

                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200 bg-neutral-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900">취소</button>
                    <button
                        onClick={save}
                        disabled={saving || !title.trim()}
                        className="px-5 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-50"
                        style={{ backgroundColor: RED }}
                    >
                        {saving ? "저장 중..." : "목표 쓰기"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-bold text-neutral-600 mb-1.5">{label}</label>
            {children}
        </div>
    );
}

function VriefEditor({ value, onChange }: { value: VriefTarget[]; onChange: (v: VriefTarget[]) => void }) {
    return (
        <div className="border border-blue-100 bg-blue-50/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <label className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" /> Vrief — 키울 역량
                    </label>
                    <p className="text-[11px] text-neutral-500 mt-0.5">현재 수준 → 목표 수준 (0~5)</p>
                </div>
                <button
                    onClick={() => onChange([...value, { code: `vr_${Date.now()}`, label: "", from: 3, to: 4 }])}
                    className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                >
                    <Plus className="w-3.5 h-3.5" /> 추가
                </button>
            </div>
            {value.length === 0 && <p className="text-xs text-neutral-400 italic">역량 1~3개 추가 권장</p>}
            <div className="space-y-2">
                {value.map((v, i) => (
                    <div key={v.code} className="flex items-center gap-2">
                        <input
                            value={v.label}
                            onChange={(e) => {
                                const next = [...value];
                                next[i] = { ...next[i], label: e.target.value };
                                onChange(next);
                            }}
                            placeholder="역량명 (예: 시장 분석)"
                            className="flex-1 px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"
                        />
                        <input
                            type="number"
                            step="0.5" min="0" max="5"
                            value={v.from}
                            onChange={(e) => {
                                const next = [...value]; next[i] = { ...next[i], from: +e.target.value };
                                onChange(next);
                            }}
                            className="w-16 px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white text-center"
                        />
                        <span className="text-neutral-400">→</span>
                        <input
                            type="number"
                            step="0.5" min="0" max="5"
                            value={v.to}
                            onChange={(e) => {
                                const next = [...value]; next[i] = { ...next[i], to: +e.target.value };
                                onChange(next);
                            }}
                            className="w-16 px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white text-center"
                        />
                        <button
                            onClick={() => onChange(value.filter((_, j) => j !== i))}
                            className="p-1.5 text-neutral-400 hover:text-red-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GprEditor({ value, onChange }: { value: GprTarget[]; onChange: (v: GprTarget[]) => void }) {
    return (
        <div className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <label className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> GPR — 낼 업적
                    </label>
                    <p className="text-[11px] text-neutral-500 mt-0.5">목표값이 있으면 진행률 자동 계산</p>
                </div>
                <button
                    onClick={() => onChange([...value, { label: "", metric: `gpr_${Date.now()}`, target: 100, current: 0 }])}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                >
                    <Plus className="w-3.5 h-3.5" /> 추가
                </button>
            </div>
            {value.length === 0 && <p className="text-xs text-neutral-400 italic">업적 1~3개 추가 권장</p>}
            <div className="space-y-2">
                {value.map((g, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <input
                            value={g.label}
                            onChange={(e) => {
                                const next = [...value]; next[i] = { ...next[i], label: e.target.value };
                                onChange(next);
                            }}
                            placeholder="업적 (예: 월간 리드 200건)"
                            className="flex-1 px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-emerald-400 bg-white"
                        />
                        <input
                            type="number"
                            value={g.target ?? 0}
                            onChange={(e) => {
                                const next = [...value]; next[i] = { ...next[i], target: +e.target.value };
                                onChange(next);
                            }}
                            placeholder="목표"
                            className="w-20 px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-emerald-400 bg-white text-center"
                        />
                        <button
                            onClick={() => onChange(value.filter((_, j) => j !== i))}
                            className="p-1.5 text-neutral-400 hover:text-red-600"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ═════════════════════════ 체크인 모달 ═════════════════════════ */

function CheckinModal({ memberId, goal, onClose, onSaved }: { memberId: string; goal: Goal; onClose: () => void; onSaved: () => void }) {
    const [vriefLevels, setVriefLevels] = useState<Record<string, number>>(
        Object.fromEntries(goal.vrief_targets.map((v) => [v.code, v.from]))
    );
    const [gprCurrents, setGprCurrents] = useState<Record<string, number>>(
        Object.fromEntries(goal.gpr_targets.filter((g) => g.metric).map((g) => [g.metric!, g.current ?? 0]))
    );
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            const r = await fetch(`/api/hero/goals/${goal.id}/checkin`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    memberId,
                    vriefProgress: Object.entries(vriefLevels).map(([code, level]) => ({ code, level })),
                    gprProgress: Object.entries(gprCurrents).map(([metric, current]) => ({ metric, current })),
                    note: note.trim() || undefined,
                }),
            });
            if (r.ok) onSaved();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                    <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">주간 체크인</p>
                        <h3 className="text-base font-bold text-neutral-900 mt-0.5">{goal.title}</h3>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {goal.vrief_targets.length > 0 && (
                        <div>
                            <label className="text-xs font-bold text-blue-700 flex items-center gap-1.5 mb-3">
                                <TrendingUp className="w-3.5 h-3.5" /> 이번 주 Vrief 체감
                            </label>
                            <div className="space-y-3">
                                {goal.vrief_targets.map((v) => (
                                    <div key={v.code} className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-700 truncate">{v.label}</p>
                                            <p className="text-[11px] text-neutral-400">목표 {v.from} → {v.to}</p>
                                        </div>
                                        <input
                                            type="number"
                                            step="0.5" min="0" max="5"
                                            value={vriefLevels[v.code] ?? v.from}
                                            onChange={(e) => setVriefLevels({ ...vriefLevels, [v.code]: +e.target.value })}
                                            className="w-20 px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-blue-400 text-center"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {goal.gpr_targets.filter((g) => g.metric).length > 0 && (
                        <div>
                            <label className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 mb-3">
                                <Activity className="w-3.5 h-3.5" /> 이번 주 GPR 누적값
                            </label>
                            <div className="space-y-3">
                                {goal.gpr_targets.filter((g) => g.metric).map((g) => (
                                    <div key={g.metric} className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-700 truncate">{g.label}</p>
                                            <p className="text-[11px] text-neutral-400">목표 {g.target}</p>
                                        </div>
                                        <input
                                            type="number"
                                            value={gprCurrents[g.metric!] ?? 0}
                                            onChange={(e) => setGprCurrents({ ...gprCurrents, [g.metric!]: +e.target.value })}
                                            className="w-24 px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-emerald-400 text-center"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-neutral-600 mb-1.5">한 주 메모 (선택)</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            placeholder="잘된 점 · 막힌 점 · 다음 주 방향"
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-[#E53935] resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-200 bg-neutral-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900">취소</button>
                    <button
                        onClick={save}
                        disabled={saving}
                        className="px-5 py-2 text-sm font-bold text-white rounded-lg disabled:opacity-50"
                        style={{ backgroundColor: RED }}
                    >
                        {saving ? "저장 중..." : "체크인 +100 UC"}
                    </button>
                </div>
            </div>
        </div>
    );
}
