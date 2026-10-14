"use client";

import { useState } from "react";
import { Loader2, Sparkles, Check, X } from "lucide-react";

// 목표 자동 분해 — 플래너'스 AI 2단계 ① (2026-10-14)
// 거시적 목표("Q3 마케팅 전략 수립")를 실행 단위(조사 1h · 취합 1.5h · 슬라이드 2h …)로 쪼개고 날짜까지 제안 → 고른 것만 프로젝트 업무로 넣는다
// AI = /api/myverse/projects/{id}/breakdown (유료 회원 전용, 402면 앱 쉘 안내) · 저장 = /api/myverse/projects/{id}/tasks (estimate_min 포함)

interface Step { text: string; hours: number; milestone: string | null; date: string }
interface Plan { steps: Step[]; note: string; total_hours: number; hours_per_day: number; over_end_date: boolean; end_date: string | null }

const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

export function ProjectBreakdown({ projectId, onAdded }: { projectId: string; onAdded: () => void }) {
    const [open, setOpen] = useState(false);
    const [goal, setGoal] = useState("");
    const [perDay, setPerDay] = useState(3);
    const [busy, setBusy] = useState(false);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [picked, setPicked] = useState<boolean[]>([]);
    const [msg, setMsg] = useState<string | null>(null);

    async function run() {
        setBusy(true); setMsg(null);
        try {
            const res = await fetch(`/api/myverse/projects/${projectId}/breakdown`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goal, hoursPerDay: perDay }),
            });
            if (res.status === 402) return;
            const d = await res.json().catch(() => ({}));
            if (!res.ok || !d.steps?.length) { setMsg("쪼개지 못했어요. 목표를 한 문장으로 더 적어 보세요."); return; }
            setPlan(d); setPicked(d.steps.map(() => true));
        } finally { setBusy(false); }
    }

    async function commit() {
        if (!plan) return;
        setBusy(true);
        let ok = 0;
        for (const [i, s] of plan.steps.entries()) {
            if (!picked[i]) continue;
            const res = await fetch(`/api/myverse/projects/${projectId}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: s.date, text: `${s.text} (${s.hours}h)`, estimate_min: Math.round(s.hours * 60) }),
            }).catch(() => null);
            if (res?.ok) ok++;
        }
        setBusy(false);
        setPlan(null); setGoal(""); setOpen(false);
        setMsg(`${ok}개 업무를 넣었어요.`);
        onAdded();
    }

    if (!open) {
        return (
            <div className="flex items-center gap-3">
                <button onClick={() => { setOpen(true); setMsg(null); }} className="inline-flex items-center gap-1.5 border border-[var(--pp-accent)]/40 px-3 py-1.5 text-xs font-bold text-[var(--pp-accent)] hover:bg-[var(--pp-accent)]/5">
                    <Sparkles className="h-3.5 w-3.5" /> AI로 목표 쪼개기
                </button>
                {msg && <span className="text-xs text-neutral-500">{msg}</span>}
            </div>
        );
    }

    return (
        <section className="border border-[var(--pp-accent)]/30 bg-white p-4 md:p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--pp-accent)]">
                <Sparkles className="h-4 w-4" /> AI로 목표 쪼개기
                <button onClick={() => { setOpen(false); setPlan(null); }} className="ml-auto text-neutral-400 hover:text-neutral-800" aria-label="닫기"><X className="h-4 w-4" /></button>
            </div>

            {!plan ? (
                <>
                    <input
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") void run(); }}
                        maxLength={500}
                        placeholder="쪼갤 목표 (비우면 프로젝트 전체), 예) Q3 마케팅 전략 수립"
                        className="mt-3 w-full border border-neutral-200 px-3 py-2 text-sm focus:border-[var(--pp-accent)] focus:outline-none"
                    />
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                        <label className="flex items-center gap-2">하루에 쓸 시간
                            <select value={perDay} onChange={(e) => setPerDay(Number(e.target.value))} className="border border-neutral-200 px-2 py-1">
                                {[1, 2, 3, 4, 6, 8].map((h) => <option key={h} value={h}>{h}시간</option>)}
                            </select>
                        </label>
                        {msg && <span className="text-red-500">{msg}</span>}
                        <button onClick={run} disabled={busy} className="ml-auto inline-flex items-center gap-1.5 bg-[var(--pp-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--pp-accent-strong)] disabled:opacity-40">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} 쪼개기
                        </button>
                    </div>
                </>
            ) : (
                <>
                    {plan.note && <p className="mt-3 break-keep text-sm text-neutral-600">{plan.note}</p>}
                    <ul className="mt-3 divide-y divide-neutral-100 border-y border-neutral-100">
                        {plan.steps.map((s, i) => (
                            <li key={i}>
                                <label className="flex cursor-pointer items-center gap-3 py-2.5 text-sm">
                                    <input type="checkbox" checked={picked[i] ?? false} onChange={(e) => setPicked((p) => p.map((v, k) => (k === i ? e.target.checked : v)))} className="h-4 w-4 accent-[var(--pp-accent)]" />
                                    <span className="w-12 shrink-0 font-mono text-xs text-neutral-400">{md(s.date)}</span>
                                    <span className="min-w-0 flex-1">{s.text}{s.milestone && <span className="ml-2 text-xs text-neutral-400">· {s.milestone}</span>}</span>
                                    <span className="shrink-0 text-xs font-bold text-[var(--pp-accent)]">{s.hours}h</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-2 text-xs text-neutral-500">
                        모두 {plan.total_hours}시간 · 하루 {plan.hours_per_day}시간씩 평일에 배치
                        {plan.over_end_date && plan.end_date && <b className="ml-1 text-red-500">프로젝트 마감({md(plan.end_date)})을 넘겨요. 하루 시간을 늘리거나 단계를 줄이세요.</b>}
                    </p>
                    <div className="mt-3 flex justify-end gap-2">
                        <button onClick={() => setPlan(null)} disabled={busy} className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-900">다시 쪼개기</button>
                        <button onClick={commit} disabled={busy || !picked.some(Boolean)} className="inline-flex items-center gap-1.5 bg-[var(--pp-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--pp-accent-strong)] disabled:opacity-40">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {picked.filter(Boolean).length}개 업무로 넣기
                        </button>
                    </div>
                </>
            )}
        </section>
    );
}
