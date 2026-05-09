"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Heart, Flame, Moon, Apple, Upload, TrendingUp, Plus, X, Dumbbell, UtensilsCrossed, BedDouble } from "lucide-react";
import type { BodyStats } from "@/lib/myverse/body/stats";
import { DomainBackLink } from "@/features/myverse/app/DomainBackLink";
import { LaneHeader } from "@/features/myverse/app/LaneHeader";

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

const WORKOUT_TYPES = ["러닝", "걷기", "자전거", "수영", "헬스", "요가", "필라테스", "등산", "축구", "농구", "테니스", "배드민턴", "기타"];
const MEAL_TYPES = ["아침", "점심", "저녁", "간식", "야식"];

export default function BodyPage() {
    const [tab, setTab] = useState<Tab>("workout");
    const [stats, setStats] = useState<BodyStats | null>(null);
    const [items, setItems] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ inserted: number; skipped: number } | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [addTab, setAddTab] = useState<Tab>("workout");
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
            if (!res.ok) { alert(`임포트 실패: ${j.error}${j.hint ? "\n" + j.hint : ""}`); return; }
            setImportResult({ inserted: j.inserted, skipped: j.skipped });
            await loadStats();
            await loadItems(tab);
        } finally {
            setImporting(false);
        }
    }

    function openAdd(t: Tab) { setAddTab(t); setAddOpen(true); }

    async function onAdded() {
        setAddOpen(false);
        await loadStats();
        await loadItems(tab);
    }

    return (
        <div className="relative" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* 헤더 — Stitch 정렬 + 도메인 컬러 (세션 122) */}
            <header className="px-5 sm:px-10 pt-8 pb-4 border-b border-neutral-200 bg-white">
                <LaneHeader
                    icon="favorite"
                    label="BODY"
                    title="BODY"
                    subtitle="운동·식사·수면 — 몸의 흔적"
                    accent="#10B981"
                    backLink={<DomainBackLink domain="body" />}
                    actions={
                        <>
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={importing}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-lg disabled:opacity-50"
                            >
                                {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                {importing ? "가져오는 중…" : "Apple Health"}
                            </button>
                            <button
                                onClick={() => openAdd(tab)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg"
                            >
                                <Plus className="h-3.5 w-3.5" /> 기록 추가
                            </button>
                        </>
                    }
                />
                <input ref={fileRef} type="file" accept=".xml,.zip" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) importApple(f); e.target.value = ""; }} />
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

            {/* 주간 운동 차트 */}
            {stats && stats.workouts_by_week.length > 0 && (
                <div className="mx-4 mb-4 bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs uppercase tracking-widest text-neutral-400">최근 8주 운동</h3>
                        <span className="text-[10px] text-neutral-400">목표 주 {stats.weekly_workout_target}회</span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                        {stats.workouts_by_week.map(w => {
                            const pct = Math.min(100, (w.count / Math.max(stats.weekly_workout_target, 5)) * 100);
                            const reached = w.count >= stats.weekly_workout_target;
                            return (
                                <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                                    <div className="w-full rounded-t" style={{ height: `${pct}%`, backgroundColor: reached ? "#10B981" : "#A7F3D0", minHeight: "4px" }}
                                        title={`${w.week}: ${w.count}회 / ${w.minutes}분`} />
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
                    { key: "workout", label: "운동", icon: Dumbbell },
                    { key: "meal",    label: "식사", icon: UtensilsCrossed },
                    { key: "sleep",   label: "수면", icon: BedDouble },
                ] as Array<{ key: Tab; label: string; icon: typeof Dumbbell }>).map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors ${tab === t.key ? "text-emerald-600 font-semibold" : "text-neutral-500 hover:text-neutral-900"}`}>
                        <t.icon className="h-3.5 w-3.5" />
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
                    <EmptyState tab={tab} onAdd={() => openAdd(tab)} />
                ) : (
                    <div className="space-y-2">
                        {items.map(it => <BodyItemCard key={it.id} item={it} subtype={tab} />)}
                    </div>
                )}
            </div>

            {/* 기록 추가 모달 */}
            {addOpen && (
                <AddModal tab={addTab} onTabChange={setAddTab} onClose={() => setAddOpen(false)} onAdded={onAdded} />
            )}
        </div>
    );
}

/* ── 빈 상태 ── */
function EmptyState({ tab, onAdd }: { tab: Tab; onAdd: () => void }) {
    const msgs: Record<Tab, string> = {
        workout: "운동 기록이 없습니다",
        meal: "식사 기록이 없습니다",
        sleep: "수면 기록이 없습니다",
    };
    return (
        <div className="text-center py-14">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 mb-3">
                <Heart className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-sm text-neutral-500 mb-3">{msgs[tab]}</p>
            <button onClick={onAdd} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                <Plus className="h-3.5 w-3.5" /> 직접 입력
            </button>
            {tab !== "meal" && (
                <p className="text-[11px] text-neutral-400 mt-3">Apple Health 가져오기로 한 번에 불러올 수도 있습니다</p>
            )}
        </div>
    );
}

/* ── 기록 카드 ── */
function BodyItemCard({ item, subtype }: { item: Routine; subtype: Tab }) {
    const data = item.body_data ?? {};
    const dateLabel = (() => {
        const dt = new Date(item.date + "T00:00:00+09:00");
        return `${dt.getMonth() + 1}/${dt.getDate()}`;
    })();
    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-3 flex items-start gap-3">
            <div className="shrink-0 text-[10px] text-neutral-400 tabular-nums w-10 text-center pt-0.5">
                {dateLabel}<br />
                <span className="text-[9px]">{item.start_time?.slice(0, 5) ?? ""}</span>
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
                            {typeof data.meal_type === "string" && <span className="text-emerald-600 font-medium">{data.meal_type}</span>}
                            {Array.isArray(data.items) && <span>{(data.items as Array<{ name: string }>).map(i => i.name).join(", ")}</span>}
                            {typeof data.calories_in === "number" && <span>{data.calories_in}kcal</span>}
                        </>
                    )}
                    {subtype === "sleep" && (
                        <>
                            {typeof data.duration_min === "number" && (
                                <span>{Math.floor((data.duration_min as number) / 60)}h {(data.duration_min as number) % 60}m</span>
                            )}
                            {typeof data.quality === "number" && <span>품질 {data.quality}/5</span>}
                        </>
                    )}
                </div>
                {typeof data.note === "string" && data.note && (
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{data.note as string}</p>
                )}
            </div>
        </div>
    );
}

/* ── 기록 추가 모달 ── */
function AddModal({ tab, onTabChange, onClose, onAdded }: {
    tab: Tab;
    onTabChange: (t: Tab) => void;
    onClose: () => void;
    onAdded: () => void;
}) {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const nowHHMM = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" });

    // workout fields
    const [wType, setWType] = useState(WORKOUT_TYPES[0]);
    const [wDate, setWDate] = useState(today);
    const [wStart, setWStart] = useState(nowHHMM);
    const [wDur, setWDur] = useState("");
    const [wDist, setWDist] = useState("");
    const [wCal, setWCal] = useState("");
    const [wNote, setWNote] = useState("");

    // meal fields
    const [mType, setMType] = useState(MEAL_TYPES[0]);
    const [mDate, setMDate] = useState(today);
    const [mTime, setMTime] = useState(nowHHMM);
    const [mFood, setMFood] = useState("");
    const [mCal, setMCal] = useState("");
    const [mNote, setMNote] = useState("");

    // sleep fields
    const [sDate, setSDate] = useState(today);
    const [sBed, setSBed] = useState("23:00");
    const [sWake, setSWake] = useState("07:00");
    const [sQuality, setSQuality] = useState(3);
    const [sNote, setSNote] = useState("");

    const [saving, setSaving] = useState(false);

    async function submit() {
        setSaving(true);
        let body: Record<string, unknown>;

        if (tab === "workout") {
            const dur = wDur ? parseInt(wDur, 10) : undefined;
            const dist = wDist ? parseFloat(wDist) : undefined;
            const cal = wCal ? parseInt(wCal, 10) : undefined;
            body = {
                subtype: "workout",
                date: wDate,
                start_time: wStart || null,
                activity: wType,
                body_data: {
                    ...(dur !== undefined && { duration_min: dur }),
                    ...(dist !== undefined && { distance_km: dist }),
                    ...(cal !== undefined && { calories_burned: cal }),
                    ...(wNote && { note: wNote }),
                },
            };
        } else if (tab === "meal") {
            const foods = mFood.split(",").map(s => s.trim()).filter(Boolean).map(name => ({ name }));
            const cal = mCal ? parseInt(mCal, 10) : undefined;
            body = {
                subtype: "meal",
                date: mDate,
                start_time: mTime || null,
                activity: `${mType} — ${mFood || "식사"}`,
                body_data: {
                    meal_type: mType,
                    items: foods,
                    ...(cal !== undefined && { calories_in: cal }),
                    ...(mNote && { note: mNote }),
                },
            };
        } else {
            const [bH, bM] = sBed.split(":").map(Number);
            const [wH, wM] = sWake.split(":").map(Number);
            let dur = (wH * 60 + wM) - (bH * 60 + bM);
            if (dur < 0) dur += 24 * 60;
            body = {
                subtype: "sleep",
                date: sDate,
                start_time: sBed,
                end_time: sWake,
                activity: "수면",
                body_data: {
                    duration_min: dur,
                    quality: sQuality,
                    ...(sNote && { note: sNote }),
                },
            };
        }

        try {
            const res = await fetch("/api/myverse/body/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
            if (res.ok) onAdded();
            else { const j = await res.json(); alert(j.error || "저장 실패"); }
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:rounded-xl md:max-h-[90vh]">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                    <h2 className="text-sm font-semibold text-neutral-900">기록 추가</h2>
                    <button onClick={onClose} className="p-1 rounded-md text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
                </div>

                {/* 타입 탭 */}
                <div className="flex border-b border-neutral-100 px-5">
                    {([
                        { key: "workout", label: "운동", icon: Dumbbell },
                        { key: "meal",    label: "식사", icon: UtensilsCrossed },
                        { key: "sleep",   label: "수면", icon: BedDouble },
                    ] as Array<{ key: Tab; label: string; icon: typeof Dumbbell }>).map(t => (
                        <button key={t.key} onClick={() => onTabChange(t.key)}
                            className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors ${tab === t.key ? "text-emerald-600 font-semibold" : "text-neutral-400 hover:text-neutral-700"}`}>
                            <t.icon className="h-3.5 w-3.5" />{t.label}
                            {tab === t.key && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-emerald-500" />}
                        </button>
                    ))}
                </div>

                {/* 폼 */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {tab === "workout" && (
                        <>
                            <FormRow label="운동 종류">
                                <select value={wType} onChange={e => setWType(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400">
                                    {WORKOUT_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </FormRow>
                            <div className="grid grid-cols-2 gap-2">
                                <FormRow label="날짜">
                                    <input type="date" value={wDate} onChange={e => setWDate(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                                </FormRow>
                                <FormRow label="시작 시간">
                                    <input type="time" value={wStart} onChange={e => setWStart(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                                </FormRow>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <FormRow label="시간(분)">
                                    <input type="number" placeholder="60" value={wDur} onChange={e => setWDur(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                                </FormRow>
                                <FormRow label="거리(km)">
                                    <input type="number" step="0.1" placeholder="0.0" value={wDist} onChange={e => setWDist(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                                </FormRow>
                                <FormRow label="칼로리">
                                    <input type="number" placeholder="kcal" value={wCal} onChange={e => setWCal(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                                </FormRow>
                            </div>
                            <FormRow label="메모">
                                <input type="text" placeholder="간단 메모" value={wNote} onChange={e => setWNote(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                            </FormRow>
                        </>
                    )}

                    {tab === "meal" && (
                        <>
                            <FormRow label="식사 구분">
                                <div className="flex gap-1.5 flex-wrap">
                                    {MEAL_TYPES.map(t => (
                                        <button key={t} onClick={() => setMType(t)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${mType === t ? "bg-emerald-500 text-white border-emerald-500" : "border-neutral-200 text-neutral-600 hover:border-emerald-300"}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </FormRow>
                            <div className="grid grid-cols-2 gap-2">
                                <FormRow label="날짜">
                                    <input type="date" value={mDate} onChange={e => setMDate(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                                </FormRow>
                                <FormRow label="시간">
                                    <input type="time" value={mTime} onChange={e => setMTime(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                                </FormRow>
                            </div>
                            <FormRow label="음식 (쉼표로 구분)">
                                <input type="text" placeholder="삼겹살, 공기밥, 된장찌개" value={mFood} onChange={e => setMFood(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                            </FormRow>
                            <FormRow label="칼로리 (선택)">
                                <input type="number" placeholder="kcal" value={mCal} onChange={e => setMCal(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                            </FormRow>
                            <FormRow label="메모">
                                <input type="text" placeholder="간단 메모" value={mNote} onChange={e => setMNote(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                            </FormRow>
                        </>
                    )}

                    {tab === "sleep" && (
                        <>
                            <FormRow label="날짜 (잠든 날)">
                                <input type="date" value={sDate} onChange={e => setSDate(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                            </FormRow>
                            <div className="grid grid-cols-2 gap-2">
                                <FormRow label="취침 시간">
                                    <input type="time" value={sBed} onChange={e => setSBed(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                                </FormRow>
                                <FormRow label="기상 시간">
                                    <input type="time" value={sWake} onChange={e => setSWake(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                                </FormRow>
                            </div>
                            <FormRow label="수면 품질">
                                <div className="flex gap-2">
                                    {[1,2,3,4,5].map(n => (
                                        <button key={n} onClick={() => setSQuality(n)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${sQuality === n ? "bg-purple-500 text-white border-purple-500" : "border-neutral-200 text-neutral-500 hover:border-purple-300"}`}>
                                            {n}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-neutral-400 mt-1 text-right">1=매우 나쁨 · 5=매우 좋음</p>
                            </FormRow>
                            <FormRow label="메모">
                                <input type="text" placeholder="간단 메모" value={sNote} onChange={e => setSNote(e.target.value)} className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400" />
                            </FormRow>
                            {/* 수면 시간 미리보기 */}
                            {sBed && sWake && (() => {
                                const [bH, bM] = sBed.split(":").map(Number);
                                const [wH, wM] = sWake.split(":").map(Number);
                                let dur = (wH * 60 + wM) - (bH * 60 + bM);
                                if (dur < 0) dur += 24 * 60;
                                return (
                                    <div className="px-3 py-2 bg-purple-50 rounded-lg text-[11px] text-purple-700 text-center">
                                        총 수면 시간 {Math.floor(dur / 60)}시간 {dur % 60}분
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </div>

                {/* 저장 버튼 */}
                <div className="px-5 py-4 border-t border-neutral-100">
                    <button onClick={submit} disabled={saving}
                        className="w-full py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {saving ? "저장 중…" : "저장"}
                    </button>
                </div>
            </div>
        </>
    );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[11px] text-neutral-500 mb-1">{label}</label>
            {children}
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
