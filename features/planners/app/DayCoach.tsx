"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Sun, Moon, RefreshCw, Check } from "lucide-react";

// 아침 Top 3 · 저녁 회고 — 플래너'스 AI 1단계 ③ (2026-10-14)
// "관리는 비서처럼 똑똑하게, 회고는 코치처럼 따뜻하게"
// AI = /api/myverse/daily/focus (유료 회원 전용 → 402면 앱 쉘 AiPaidOnlyNotice) · 만든 결과는 myverse_daily.focus/reflection에 남아 다시 열어도 AI를 또 부르지 않는다
// 회고 답 저장 = /api/myverse/daily { date, reflection } (본인 하루 기록)

interface Focus { generated_at: string; items: { task_id: string; text: string; reason: string }[]; message: string }
interface Reflection { generated_at: string; questions: { q: string; a: string }[] }

function kstHour(): number {
    return (new Date().getUTCHours() + 9) % 24;
}

export function DayCoach({ date }: { date: string }) {
    const [tab, setTab] = useState<"morning" | "evening">(() => (kstHour() >= 17 ? "evening" : "morning"));
    const [focus, setFocus] = useState<Focus | null>(null);
    const [reflection, setReflection] = useState<Reflection | null>(null);
    const [busy, setBusy] = useState(false);
    const [note, setNote] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    // 이미 만든 값만 읽기 (AI 호출 없음)
    useEffect(() => {
        let cancelled = false;
        fetch(`/api/myverse/daily?date=${date}`, { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (cancelled || !d?.daily) return;
                setFocus(d.daily.focus ?? null);
                setReflection(d.daily.reflection ?? null);
            })
            .catch(() => { /* silent */ });
        return () => { cancelled = true; };
    }, [date]);

    const ask = useCallback(async (mode: "morning" | "evening", refresh = false) => {
        setBusy(true); setNote(null); setSaved(false);
        try {
            const res = await fetch("/api/myverse/daily/focus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date, mode, refresh }),
            });
            if (res.status === 402) return; // 유료 안내는 앱 쉘
            const d = await res.json().catch(() => ({}));
            if (!res.ok) { setNote("지금은 만들지 못했어요. 잠시 뒤 다시 해 주세요."); return; }
            if (mode === "morning") {
                if (d.empty) setNote(d.message);
                setFocus(d.focus ?? null);
            } else {
                setReflection(d.reflection ?? null);
            }
        } finally {
            setBusy(false);
        }
    }, [date]);

    async function saveAnswers() {
        if (!reflection) return;
        setBusy(true);
        const res = await fetch("/api/myverse/daily", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, reflection }),
        }).catch(() => null);
        setBusy(false);
        setSaved(!!res?.ok);
        if (!res?.ok) setNote("저장하지 못했어요. 다시 눌러 주세요.");
    }

    const tabCls = (on: boolean) => `inline-flex items-center gap-1.5 px-3 py-1.5 text-sm ${on ? "font-bold text-[var(--pp-accent)] border-b-2 border-[var(--pp-accent)]" : "text-neutral-500 hover:text-neutral-900"}`;
    const btn = "inline-flex items-center gap-1.5 bg-[var(--pp-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--pp-accent-strong)] disabled:opacity-40";

    return (
        <section className="mb-10 border border-neutral-200 bg-white p-6 md:p-8 myverse-dark:border-white/10 myverse-dark:bg-white/5">
            <div className="flex gap-2 border-b border-neutral-100 myverse-dark:border-white/10">
                <button onClick={() => setTab("morning")} className={tabCls(tab === "morning")}><Sun className="h-4 w-4" /> 오늘의 Top 3</button>
                <button onClick={() => setTab("evening")} className={tabCls(tab === "evening")}><Moon className="h-4 w-4" /> 저녁 회고</button>
            </div>

            {tab === "morning" ? (
                focus && focus.items.length > 0 ? (
                    <div className="mt-4">
                        {focus.message && <p className="break-keep text-[15px] text-neutral-700 myverse-dark:text-neutral-300">{focus.message}</p>}
                        <ol className="mt-4 space-y-3">
                            {focus.items.map((it, i) => (
                                <li key={it.task_id} className="flex gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-[var(--pp-accent)] text-xs font-bold text-white">{i + 1}</span>
                                    <div className="min-w-0">
                                        <p className="font-medium">{it.text}</p>
                                        <p className="mt-0.5 break-keep text-sm text-neutral-500">{it.reason}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                        <button onClick={() => ask("morning", true)} disabled={busy} className="mt-4 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700">
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} 할 일이 바뀌었으면 다시 고르기
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <p className="flex-1 break-keep text-sm text-neutral-500">{note ?? "오늘 할 일 가운데 꼭 끝낼 세 가지를 AI가 이유와 함께 골라 드려요."}</p>
                        <button onClick={() => ask("morning")} disabled={busy} className={btn}>
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sun className="h-4 w-4" />} Top 3 고르기
                        </button>
                    </div>
                )
            ) : reflection && reflection.questions.length > 0 ? (
                <div className="mt-4 space-y-5">
                    {reflection.questions.map((x, i) => (
                        <label key={i} className="block">
                            <span className="block break-keep text-[15px] font-medium">{x.q}</span>
                            <textarea
                                value={x.a}
                                onChange={(e) => { setSaved(false); setReflection({ ...reflection, questions: reflection.questions.map((y, k) => (k === i ? { ...y, a: e.target.value } : y)) }); }}
                                rows={2}
                                maxLength={1000}
                                placeholder="떠오르는 대로 적어 보세요"
                                className="mt-2 w-full resize-none border border-neutral-200 bg-neutral-50 px-3 py-2 text-[15px] focus:border-[var(--pp-accent)] focus:outline-none myverse-dark:border-white/10 myverse-dark:bg-white/5"
                            />
                        </label>
                    ))}
                    <div className="flex items-center justify-end gap-3">
                        {note && <p className="text-sm text-red-500">{note}</p>}
                        {saved && <p className="inline-flex items-center gap-1 text-sm text-[var(--pp-accent)]"><Check className="h-4 w-4" /> 저장했어요</p>}
                        <button onClick={saveAnswers} disabled={busy} className={btn}>회고 저장</button>
                    </div>
                </div>
            ) : (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <p className="flex-1 break-keep text-sm text-neutral-500">{note ?? "오늘 한 일과 못 한 일을 보고, 하루를 돌아볼 질문 세 개를 건네 드려요."}</p>
                    <button onClick={() => ask("evening")} disabled={busy} className={btn}>
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Moon className="h-4 w-4" />} 질문 받기
                    </button>
                </div>
            )}
        </section>
    );
}
