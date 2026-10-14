"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { AI_BETA_ONLY_TEXT } from "@/lib/myverse/ai-error";

// 주간 회고 리포트 — 플래너'스 AI 2단계 ② (2026-10-14)
// 숫자(요일별 완료율·Top 3 달성·상태와 완료율)는 무료 · '코치의 한 주 읽기'는 유료 AI (/api/myverse/weekly-review)

interface Day { date: string; dow: string; total: number; done: number; rate: number | null; mood: number | null; energy: number | null; top3: number; top3_done: number; reflected: boolean }
interface Stats { week: string; end: string; days: Day[]; total: number; done: number; rate: number | null; top3: number; top3_done: number; reflected_days: number; relation: { high_days: number; high_rate: number; low_days: number; low_rate: number } | null; best_day: { dow: string; rate: number } | null }
interface Insight { summary: string; highlights: { well: string; pattern: string; next: string }; created_at: string }

const addDays = (d: string, n: number) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

export function WeeklyReview() {
    const [week, setWeek] = useState<string | null>(null); // null = 이번 주(서버가 계산)
    const [stats, setStats] = useState<Stats | null>(null);
    const [insight, setInsight] = useState<Insight | null>(null);
    const [busy, setBusy] = useState(false);
    const [note, setNote] = useState<string | null>(null);

    const load = useCallback(async (w: string | null) => {
        setStats(null); setInsight(null); setNote(null);
        const res = await fetch(`/api/myverse/weekly-review${w ? `?week=${w}` : ""}`, { cache: "no-store" }).catch(() => null);
        if (!res?.ok) return;
        const d = await res.json();
        setStats(d.stats); setInsight(d.insight ?? null);
        if (!w) setWeek(d.stats.week);
    }, []);
    useEffect(() => { void load(null); }, [load]);

    async function readWeek(refresh = false) {
        if (!stats) return;
        setBusy(true); setNote(null);
        try {
            const res = await fetch("/api/myverse/weekly-review", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ week: stats.week, refresh }),
            });
            if (res.status === 402) { setNote(AI_BETA_ONLY_TEXT); return; }
            const d = await res.json().catch(() => ({}));
            if (!res.ok) { setNote("지금은 만들지 못했어요. 잠시 뒤 다시 해 주세요."); return; }
            if (d.empty) setNote(d.message);
            setInsight(d.insight ?? null);
        } catch {
            setNote("연결이 불안정해요. 잠시 뒤 다시 해 주세요.");
        } finally { setBusy(false); }
    }

    const move = (n: number) => { if (!week) return; const w = addDays(week, n * 7); setWeek(w); void load(w); };

    return (
        <section className="mb-10 border border-neutral-200 bg-white p-6 md:p-8 myverse-dark:border-white/10 myverse-dark:bg-white/5">
            <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[var(--pp-accent)]">주간 회고</p>
                <div className="ml-auto flex items-center gap-1 text-sm text-neutral-500">
                    <button onClick={() => move(-1)} className="p-1 hover:text-neutral-900" aria-label="지난주"><ChevronLeft className="h-4 w-4" /></button>
                    <span className="min-w-[96px] text-center font-mono text-xs">{stats ? `${md(stats.week)} ~ ${md(stats.end)}` : "…"}</span>
                    <button onClick={() => move(1)} className="p-1 hover:text-neutral-900" aria-label="다음 주"><ChevronRight className="h-4 w-4" /></button>
                </div>
            </div>

            {!stats ? (
                <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    {/* 숫자 요약 */}
                    <div className="mt-4 grid grid-cols-3 gap-px bg-neutral-100 myverse-dark:bg-white/10">
                        <Num label="완료" value={stats.rate !== null ? `${stats.rate}%` : "-"} sub={`${stats.done}/${stats.total}`} />
                        <Num label="Top 3 달성" value={stats.top3 ? `${stats.top3_done}/${stats.top3}` : "-"} sub={stats.top3 ? "고른 날만" : "아직 없음"} />
                        <Num label="회고한 날" value={`${stats.reflected_days}일`} sub="저녁 회고 답" />
                    </div>

                    {/* 요일별 막대 */}
                    <div className="mt-5 flex h-28 items-end gap-2">
                        {stats.days.map((d) => (
                            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                                <span className="text-[10px] text-neutral-400">{d.rate !== null ? `${d.rate}%` : ""}</span>
                                <div className="flex w-full max-w-[36px] flex-1 items-end bg-neutral-100 myverse-dark:bg-white/10">
                                    <div className="w-full bg-[var(--pp-accent)]" style={{ height: `${d.rate ?? 0}%`, opacity: d.total ? 1 : 0 }} />
                                </div>
                                <span className={`text-xs ${d.reflected ? "font-bold text-[var(--pp-accent)]" : "text-neutral-500"}`}>{d.dow}</span>
                            </div>
                        ))}
                    </div>

                    {stats.relation && (
                        <p className="mt-4 break-keep text-sm text-neutral-600">
                            컨디션이 좋은 날({stats.relation.high_days}일) 평균 완료 <b>{stats.relation.high_rate}%</b> · 낮은 날({stats.relation.low_days}일) <b>{stats.relation.low_rate}%</b>
                        </p>
                    )}

                    {/* 코치의 한 주 읽기 (유료 AI) */}
                    <div className="mt-5 border-t border-neutral-100 pt-5 myverse-dark:border-white/10">
                        {insight ? (
                            <div className="space-y-3 text-[15px]">
                                <p className="break-keep font-medium">{insight.summary}</p>
                                <Line label="잘한 점" text={insight.highlights.well} />
                                <Line label="보이는 패턴" text={insight.highlights.pattern} />
                                <Line label="다음 주 실험" text={insight.highlights.next} />
                                <button onClick={() => readWeek(true)} disabled={busy} className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700">
                                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} 기록이 늘었으면 다시 읽기
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-3">
                                <p className="flex-1 break-keep text-sm text-neutral-500">{note ?? "한 주의 기록과 저녁 회고를 코치가 읽고 잘한 점·패턴·다음 주 실험을 돌려드려요."}</p>
                                <button onClick={() => readWeek()} disabled={busy} className="inline-flex items-center gap-1.5 bg-[var(--pp-accent)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--pp-accent-strong)] disabled:opacity-40">
                                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} 한 주 읽기
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}

function Num({ label, value, sub }: { label: string; value: string; sub: string }) {
    return (
        <div className="bg-white px-4 py-3 myverse-dark:bg-[#0d0d14]">
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            <p className="text-[11px] text-neutral-400">{sub}</p>
        </div>
    );
}

function Line({ label, text }: { label: string; text: string }) {
    if (!text) return null;
    return (
        <p className="flex gap-3 break-keep">
            <span className="w-20 shrink-0 text-sm font-bold text-[var(--pp-accent)]">{label}</span>
            <span className="text-neutral-700 myverse-dark:text-neutral-300">{text}</span>
        </p>
    );
}
