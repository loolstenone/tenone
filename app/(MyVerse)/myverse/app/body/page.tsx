"use client";

// BODY 영역 — 운동·식사·수면 통합 뷰 + Apple Health 임포트
// 3탭: 운동 / 식사 / 수면 + 상단 통계 카드 (스트릭·주간 빈도·평균 칼로리·평균 수면)

import { useEffect, useRef, useState } from "react";
import { Loader2, Heart, Flame, Moon, Apple, Upload, TrendingUp } from "lucide-react";
import type { BodyStats } from "@/lib/myverse/body/stats";

type Tab = "workout" | "meal" | "sleep";

interface Routine {
    id: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    activity: string;
    body_subtype: string | null;
    body_data: Record<string, unknown> | null;
    visibility: string;
}

export default function BodyPage() {
    const [tab, setTab] = useState<Tab>("workout");
    const [stats, setStats] = useState<BodyStats | null>(null);
    const [items, setItems] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ inserted: number; skipped: number } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    async function loadStats() {
        const res = await fetch("/api/myverse/body/stats?days=90");
        if (res.ok) {
            const j = await res.json();
            setStats(j.stats);
        }
    }

    async function loadItems(currentTab: Tab) {
        setLoading(true);
        try {
            const res = await fetch(`/api/myverse/body/items?subtype=${currentTab}`);
            if (res.ok) {
                const j = await res.json();
                setItems(j.items ?? []);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadStats(); }, []);
    useEffect(() => { loadItems(tab); }, [tab]);

    async function importApple(file: File) {
        setImporting(true);
        setImportResult(null);
        try {
            const form = new FormData();
            form.append("file", file);
            const res = await fetch("/api/myverse/health/apple/import", { method: "POST", body: form });
            const j = await res.json();
            if (!res.ok) {
                alert(`임포트 실패: ${j.error}${j.hint ? "\n" + j.hint : ""}`);
                return;
            }
            setImportResult({ inserted: j.inserted, skipped: j.skipped });
            await loadStats();
            await loadItems(tab);
        } finally {
            setImporting(false);
        }
    }

    return (
        <div>
            {/* 헤더 */}
            <header className="px-6 pt-6 pb-3 border-b border-neutral-200 bg-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Heart className="h-3 w-3 text-emerald-500" />
                            <span className="text-[10px] uppercase tracking-widest text-emerald-500">Body</span>
                        </div>
                        <h1 className="text-2xl font-serif text-neutral-900">BODY</h1>
                        <p className="text-xs text-neutral-500 mt-1">운동·식사·수면 — 몸의 흔적</p>
                    </div>
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={importing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg disabled:opacity-50"
                    >
                        {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        {importing ? "가져오는 중…" : "Apple Health"}
                    </button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".xml,.zip"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) importApple(f);
                            e.target.value = "";
                        }}
                    />
                </div>

                {importResult && (
                    <div className="mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded text-[11px] text-emerald-700">
                        가져옴 {importResult.inserted}건 · 건너뜀 {importResult.skipped}건
                    </div>
                )}
            </header>

            {/* 통계 카드 */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4">
                    <StatCard icon={Flame} label="운동 연속" value={`${stats.workout_streak}일`} accent="#EF4444" />
                    <StatCard icon={TrendingUp} label="최근 30일 운동" value={`${stats.workout_days_last_30}회`} accent="#10B981" />
                    <StatCard icon={Apple} label="평균 칼로리" value={stats.avg_calories_in ? `${stats.avg_calories_in}kcal` : "—"} accent="#F59E0B" />
                    <StatCard icon={Moon} label="평균 수면" value={stats.avg_sleep_minutes ? `${Math.floor(stats.avg_sleep_minutes / 60)}h ${stats.avg_sleep_minutes % 60}m` : "—"} accent="#A855F7" />
                </div>
            )}

            {/* 주간 빈도 시계열 */}
            {stats && stats.workouts_by_week.length > 0 && (
                <div className="mx-4 mb-4 bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs uppercase tracking-widest text-neutral-400">최근 8주 운동</h3>
                        <span className="text-[10px] text-neutral-400">목표 주 {stats.weekly_workout_target}회</span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                        {stats.workouts_by_week.map(w => {
                            const pct = Math.min(100, (w.count / Math.max(stats.weekly_workout_target, 5)) * 100);
                            const reachedTarget = w.count >= stats.weekly_workout_target;
                            return (
                                <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full rounded-t"
                                        style={{
                                            height: `${pct}%`,
                                            backgroundColor: reachedTarget ? "#10B981" : "#A7F3D0",
                                            minHeight: "4px",
                                        }}
                                        title={`${w.week}: ${w.count}회 / ${w.minutes}분`}
                                    />
                                    <span className="text-[9px] text-neutral-400 tabular-nums">{w.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 탭 */}
            <nav className="flex border-b border-neutral-200 px-4 bg-white sticky top-0 z-10">
                {([
                    { key: "workout", label: "운동" },
                    { key: "meal",    label: "식사" },
                    { key: "sleep",   label: "수면" },
                ] as Array<{ key: Tab; label: string }>).map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`relative px-4 py-2.5 text-sm transition-colors ${
                            tab === t.key
                                ? "text-emerald-600 font-semibold"
                                : "text-neutral-500 hover:text-neutral-900"
                        }`}
                    >
                        {t.label}
                        {tab === t.key && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-emerald-500" />}
                    </button>
                ))}
            </nav>

            {/* 항목 목록 */}
            <div className="p-4">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                ) : items.length === 0 ? (
                    <div className="text-center py-12 text-sm text-neutral-400 italic">
                        {tab === "workout" && "운동 기록이 없습니다 (Apple Health 가져오기 또는 직접 추가)"}
                        {tab === "meal" && "식사 기록이 없습니다"}
                        {tab === "sleep" && "수면 기록이 없습니다 (Apple Health 가져오기)"}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {items.map(it => <BodyItemCard key={it.id} item={it} subtype={tab} />)}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Heart; label: string; value: string; accent: string }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3 w-3" style={{ color: accent }} />
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">{label}</span>
            </div>
            <p className="text-lg font-semibold text-neutral-900 tabular-nums">{value}</p>
        </div>
    );
}

function BodyItemCard({ item, subtype }: { item: Routine; subtype: Tab }) {
    const data = item.body_data ?? {};
    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-3 flex items-start gap-3">
            <div className="shrink-0 text-[10px] text-neutral-400 tabular-nums w-12 text-center">
                {formatDate(item.date)}
                <br />
                {item.start_time?.slice(0, 5) ?? ""}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900">{item.activity}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-neutral-500 mt-0.5">
                    {subtype === "workout" && (
                        <>
                            {typeof data.duration_min === "number" && <span>{data.duration_min}분</span>}
                            {typeof data.distance_km === "number" && <span>{data.distance_km}km</span>}
                            {typeof data.calories_burned === "number" && <span>{data.calories_burned}kcal</span>}
                        </>
                    )}
                    {subtype === "meal" && (
                        <>
                            {Array.isArray(data.items) && (
                                <span>{(data.items as Array<{ name: string }>).map(i => i.name).join(", ")}</span>
                            )}
                        </>
                    )}
                    {subtype === "sleep" && (
                        <>
                            {typeof data.duration_min === "number" && (
                                <span>{Math.floor((data.duration_min as number) / 60)}h {(data.duration_min as number) % 60}m</span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatDate(d: string): string {
    const dt = new Date(d + "T00:00:00+09:00");
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
}
