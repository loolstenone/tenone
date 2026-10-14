"use client";

// 시간 인텔리전스 — 하루/주/월 단위로 내 모든 활동을 시간축에 모아 보는 뷰
// 9 도메인의 데이터를 시간대별로 집계·시각화
// 누적 통계: 어떤 운동을, 얼마나 했고, 어디에 있었고, 어떤 삶을 사는지

import { useEffect, useState, useMemo } from "react";
import {
    Loader2, Clock, ChevronLeft, ChevronRight,
    Heart, Coffee, Users, Briefcase, BookOpen,
    Calendar, Navigation, Plane,
    type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DOMAINS, type DomainKey } from "@/lib/myverse/domains";

export const dynamic = "force-dynamic";

// ── 도메인 아이콘 맵 ──────────────────────────────────────────
const DOMAIN_ICON: Record<DomainKey, LucideIcon> = {
    body:     Heart,
    daily:    Coffee,
    relation: Users,
    work:     Briefcase,
    study:    BookOpen,
    schedule: Calendar,
    move:     Navigation,
    travel:   Plane,
};

// ── 타입 ─────────────────────────────────────────────────────
interface ActivityItem {
    id: string;
    domain: DomainKey;
    date: string;
    start_time: string | null;
    end_time: string | null;
    activity: string;
    note: string | null;
    body_data?: Record<string, unknown> | null;
}

interface CalendarItem {
    id: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    title: string;
    color: string | null;
}

type PeriodKey = "day" | "week" | "month";

// ── 유틸 ─────────────────────────────────────────────────────
function todayKST(): string {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

function addDays(dateStr: string, n: number): string {
    const d = new Date(dateStr + "T00:00:00+09:00");
    d.setDate(d.getDate() + n);
    return d.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

function dateLabel(dateStr: string, period: PeriodKey): string {
    const d = new Date(dateStr + "T00:00:00+09:00");
    const today = todayKST();
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    if (period === "day") {
        if (dateStr === today) return "오늘";
        if (dateStr === addDays(today, -1)) return "어제";
        return `${d.getMonth() + 1}/${d.getDate()} (${dayNames[d.getDay()]})`;
    }
    if (period === "week") {
        const end = addDays(dateStr, 6);
        const e = new Date(end + "T00:00:00+09:00");
        return `${d.getMonth() + 1}/${d.getDate()} – ${e.getMonth() + 1}/${e.getDate()}`;
    }
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

function timeToMinutes(t: string): number {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
}

function minutesToHHMM(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function durationLabel(min: number): string {
    if (min < 60) return `${min}분`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}시간 ${m}분` : `${h}시간`;
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function TimePage() {
    const [period, setPeriod] = useState<PeriodKey>("day");
    const [anchor, setAnchor] = useState(todayKST()); // day: 날짜, week: 시작일, month: 월 1일
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [calendar, setCalendar] = useState<CalendarItem[]>([]);
    const [loading, setLoading] = useState(true);

    // 날짜 범위 계산
    const { from, to } = useMemo(() => {
        if (period === "day") return { from: anchor, to: anchor };
        if (period === "week") return { from: anchor, to: addDays(anchor, 6) };
        // month
        const d = new Date(anchor + "T00:00:00+09:00");
        const first = new Date(d.getFullYear(), d.getMonth(), 1).toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
        const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
        return { from: first, to: last };
    }, [period, anchor]);

    // 네비게이션
    function nav(dir: 1 | -1) {
        if (period === "day") setAnchor(a => addDays(a, dir));
        else if (period === "week") setAnchor(a => addDays(a, dir * 7));
        else {
            const d = new Date(anchor + "T00:00:00+09:00");
            d.setMonth(d.getMonth() + dir);
            setAnchor(d.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }).slice(0, 7) + "-01");
        }
    }

    // 오늘로 복귀
    function goToday() {
        const today = todayKST();
        if (period === "week") {
            const d = new Date(today + "T00:00:00+09:00");
            const dow = d.getDay(); // 0=sun
            const mon = addDays(today, -dow === 0 ? 0 : -(dow === 0 ? 0 : dow));
            setAnchor(addDays(today, -(dow || 7) + 1));
        } else if (period === "month") {
            setAnchor(today.slice(0, 7) + "-01");
        } else {
            setAnchor(today);
        }
    }

    // 데이터 로드
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data: member } = await supabase.from("members").select("id").eq("auth_id", user.id).maybeSingle();
                if (!member) return;
                const mid = (member as { id: string }).id;

                const [routineRes, calRes] = await Promise.all([
                    supabase
                        .from("myverse_daily_routines")
                        .select("id, domain, date, start_time, end_time, activity, note, body_data")
                        .eq("member_id", mid)
                        .gte("date", from)
                        .lte("date", to)
                        .order("date")
                        .order("start_time", { ascending: true, nullsFirst: false })
                        .limit(500),
                    supabase
                        .from("myverse_calendar_entries")
                        .select("id, date, start_time, end_time, title, color")
                        .eq("member_id", mid)
                        .gte("date", from)
                        .lte("date", to)
                        .order("date")
                        .order("start_time", { ascending: true, nullsFirst: false })
                        .limit(200),
                ]);

                if (cancelled) return;
                setActivities((routineRes.data ?? []) as ActivityItem[]);
                setCalendar((calRes.data ?? []) as CalendarItem[]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [from, to]);

    // 도메인별 집계
    const domainStats = useMemo(() => {
        const counts: Partial<Record<DomainKey, number>> = {};
        const durations: Partial<Record<DomainKey, number>> = {}; // in minutes
        for (const a of activities) {
            const dk = a.domain as DomainKey;
            counts[dk] = (counts[dk] ?? 0) + 1;
            if (a.start_time && a.end_time) {
                const dur = timeToMinutes(a.end_time) - timeToMinutes(a.start_time);
                if (dur > 0) durations[dk] = (durations[dk] ?? 0) + dur;
            }
            // body_data duration_min
            const bd = a.body_data as Record<string, unknown> | null;
            if (bd?.duration_min) durations[dk] = (durations[dk] ?? 0) + (bd.duration_min as number);
        }
        return { counts, durations };
    }, [activities]);

    const totalMinutes = Object.values(domainStats.durations).reduce((a, b) => a + (b ?? 0), 0);

    // 하루 타임라인 (period=day만)
    const timed = useMemo(() => {
        if (period !== "day") return [];
        return [
            ...activities.filter(a => a.start_time).map(a => ({ ...a, _type: "routine" as const })),
            ...calendar.filter(c => c.start_time).map(c => ({
                id: c.id, domain: "schedule" as DomainKey, date: c.date,
                start_time: c.start_time, end_time: c.end_time,
                activity: c.title, note: null, body_data: { color: c.color },
                _type: "calendar" as const,
            })),
        ].sort((a, b) => (a.start_time ?? "").localeCompare(b.start_time ?? ""));
    }, [activities, calendar, period]);

    const untimed = useMemo(() => {
        if (period !== "day") return [];
        return activities.filter(a => !a.start_time);
    }, [activities, period]);

    return (
        <div className="flex flex-col h-full">
            {/* 헤더 */}
            <header className="px-6 pt-6 pb-4 border-b border-neutral-200 bg-white shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3 w-3 text-neutral-500" />
                            <span className="text-[10px] uppercase tracking-widest text-neutral-500">Time</span>
                        </div>
                        <h1 className="text-2xl font-serif text-neutral-900">시간</h1>
                        <p className="text-xs text-neutral-500 mt-1">모든 활동의 시간축 — 어떤 삶을 살고 있나</p>
                    </div>
                </div>

                {/* 기간 선택 + 날짜 네비 */}
                <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-0.5 bg-neutral-100 rounded-lg p-0.5">
                        {(["day", "week", "month"] as PeriodKey[]).map(p => (
                            <button key={p} onClick={() => { setPeriod(p); goToday(); }}
                                className={`px-3 py-1 text-xs rounded transition-colors ${period === p ? "bg-white text-neutral-900 font-semibold shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}>
                                {p === "day" ? "일" : p === "week" ? "주" : "월"}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => nav(-1)} className="p-1 rounded hover:bg-neutral-100 text-neutral-400">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-medium text-neutral-900 min-w-[120px] text-center">
                            {dateLabel(anchor, period)}
                        </span>
                        <button onClick={() => nav(1)} className="p-1 rounded hover:bg-neutral-100 text-neutral-400">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <button onClick={goToday} className="text-[11px] text-neutral-400 hover:text-neutral-700 px-2 py-1 rounded hover:bg-neutral-100">
                        오늘
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    {/* 도메인 통계 */}
                    <DomainStats stats={domainStats} totalMin={totalMinutes} activityCount={activities.length} />

                    {/* 타임라인 (일 뷰) */}
                    {period === "day" && (
                        <DayTimeline timed={timed} untimed={untimed} />
                    )}

                    {/* 주/월 뷰 — 날짜별 요약 */}
                    {period !== "day" && (
                        <PeriodSummary activities={activities} from={from} to={to} period={period} />
                    )}
                </div>
            )}
        </div>
    );
}

// ── 도메인 통계 바 ────────────────────────────────────────────
function DomainStats({ stats, totalMin, activityCount }: {
    stats: { counts: Partial<Record<DomainKey, number>>; durations: Partial<Record<DomainKey, number>> };
    totalMin: number;
    activityCount: number;
}) {
    const domains: DomainKey[] = ["body", "work", "study", "daily", "schedule", "move", "travel", "relation"];
    const active = domains.filter(d => (stats.counts[d] ?? 0) > 0);

    return (
        <section className="px-6 py-5 border-b border-neutral-100">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-neutral-700">활동 분포</p>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                    <span>{activityCount}건</span>
                    {totalMin > 0 && <span>{durationLabel(totalMin)} 기록</span>}
                </div>
            </div>

            {active.length === 0 ? (
                <p className="text-sm text-neutral-400 italic text-center py-4">이 기간에 기록이 없습니다</p>
            ) : (
                <>
                    {/* 스택 바 */}
                    {totalMin > 0 && (
                        <div className="flex h-2.5 rounded-full overflow-hidden bg-neutral-100 mb-4">
                            {domains.map(d => {
                                const min = stats.durations[d] ?? 0;
                                if (!min) return null;
                                const pct = (min / totalMin) * 100;
                                return (
                                    <div key={d} className="h-full transition-all" title={`${DOMAINS[d].label_ko}: ${durationLabel(min)}`}
                                        style={{ width: `${pct}%`, backgroundColor: DOMAINS[d].color_hex }} />
                                );
                            })}
                        </div>
                    )}

                    {/* 도메인 카드 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {active.map(d => {
                            const count = stats.counts[d] ?? 0;
                            const min = stats.durations[d] ?? 0;
                            const Icon = DOMAIN_ICON[d];
                            return (
                                <div key={d} className="flex items-center gap-2.5 p-2.5 bg-white border border-neutral-100 rounded-xl">
                                    <div className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: DOMAINS[d].color_hex + "18" }}>
                                        <Icon className="h-4 w-4" style={{ color: DOMAINS[d].color_hex }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-medium text-neutral-700">{DOMAINS[d].label_ko}</p>
                                        <p className="text-[10px] text-neutral-400">
                                            {min > 0 ? durationLabel(min) : `${count}건`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </section>
    );
}

// ── 하루 타임라인 ─────────────────────────────────────────────
function DayTimeline({ timed, untimed }: {
    timed: (ActivityItem & { _type: "routine" | "calendar" })[];
    untimed: ActivityItem[];
}) {
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 ~ 23:00

    // 시간대별 그룹
    function itemsInHour(h: number) {
        return timed.filter(a => {
            if (!a.start_time) return false;
            const min = timeToMinutes(a.start_time);
            return min >= h * 60 && min < (h + 1) * 60;
        });
    }

    const hasAnyTimed = timed.length > 0;

    return (
        <section className="px-6 py-5">
            <p className="text-xs font-semibold text-neutral-700 mb-4">시간대별 활동</p>

            {!hasAnyTimed && untimed.length === 0 ? (
                <p className="text-sm text-neutral-400 italic text-center py-6">이 날 기록된 활동이 없습니다</p>
            ) : (
                <div className="relative">
                    {/* 타임드 아이템 */}
                    {hasAnyTimed && (
                        <div className="space-y-0">
                            {hours.map(h => {
                                const items = itemsInHour(h);
                                return (
                                    <div key={h} className="flex gap-3 min-h-[2.5rem]">
                                        <div className="shrink-0 w-10 pt-1 text-right">
                                            <span className="text-[10px] text-neutral-300 tabular-nums">
                                                {String(h).padStart(2, "0")}:00
                                            </span>
                                        </div>
                                        <div className="flex-1 border-t border-neutral-100 pt-1 pb-1 space-y-1">
                                            {items.map(a => <TimeBlock key={a.id} item={a} />)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* 시간 미기록 활동 */}
                    {untimed.length > 0 && (
                        <div className="mt-6">
                            <p className="text-[11px] uppercase tracking-widest text-neutral-400 mb-2">시간 미기록</p>
                            <div className="space-y-1.5">
                                {untimed.map(a => {
                                    const Icon = DOMAIN_ICON[a.domain] ?? Coffee;
                                    return (
                                        <div key={a.id} className="flex items-center gap-2.5 p-2.5 bg-white border border-neutral-100 rounded-lg">
                                            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: DOMAINS[a.domain]?.color_hex ?? "#9CA3AF" }} />
                                            <span className="text-sm text-neutral-700 flex-1">{a.activity}</span>
                                            <span className="text-[10px] text-neutral-300 shrink-0" style={{ color: DOMAINS[a.domain]?.color_hex + "99" }}>
                                                {DOMAINS[a.domain]?.label_ko}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

function TimeBlock({ item }: { item: ActivityItem & { _type: "routine" | "calendar" } }) {
    const Icon = DOMAIN_ICON[item.domain] ?? Coffee;
    const color = DOMAINS[item.domain]?.color_hex ?? "#9CA3AF";
    const dur = item.start_time && item.end_time
        ? timeToMinutes(item.end_time) - timeToMinutes(item.start_time)
        : (item.body_data as Record<string, unknown> | null)?.duration_min as number | undefined;

    return (
        <div className="flex items-start gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: color + "12" }}>
            <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color }} />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-800 truncate">{item.activity}</p>
            </div>
            <div className="shrink-0 text-right">
                <p className="text-[10px] tabular-nums text-neutral-400">{item.start_time?.slice(0, 5)}</p>
                {dur && dur > 0 && <p className="text-[10px] text-neutral-300">{durationLabel(dur)}</p>}
            </div>
        </div>
    );
}

// ── 주/월 뷰 ─────────────────────────────────────────────────
function PeriodSummary({ activities, from, to, period }: {
    activities: ActivityItem[];
    from: string;
    to: string;
    period: PeriodKey;
}) {
    // 날짜별 그룹
    const byDate: Record<string, ActivityItem[]> = {};
    for (const a of activities) {
        if (!byDate[a.date]) byDate[a.date] = [];
        byDate[a.date].push(a);
    }

    // 날짜 범위 생성
    const dates: string[] = [];
    let cur = from;
    while (cur <= to) {
        dates.push(cur);
        cur = addDays(cur, 1);
    }

    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const today = todayKST();

    return (
        <section className="px-6 py-5">
            <p className="text-xs font-semibold text-neutral-700 mb-4">
                {period === "week" ? "주간 일별 요약" : "월간 일별 요약"}
            </p>
            <div className="space-y-2">
                {dates.filter(d => (byDate[d]?.length ?? 0) > 0 || d === today).map(d => {
                    const items = byDate[d] ?? [];
                    const dt = new Date(d + "T00:00:00+09:00");
                    const isToday = d === today;
                    const domainSet = [...new Set(items.map(i => i.domain as DomainKey))];

                    if (items.length === 0) return null;

                    return (
                        <div key={d} className={`p-3 rounded-xl border ${isToday ? "border-neutral-300 bg-white" : "border-neutral-100 bg-white"}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-neutral-900">
                                        {dt.getMonth() + 1}/{dt.getDate()} ({dayNames[dt.getDay()]})
                                    </span>
                                    {isToday && <span className="text-[9px] bg-neutral-800 text-white px-1.5 py-0.5 rounded-full">오늘</span>}
                                </div>
                                <span className="text-[10px] text-neutral-400">{items.length}건</span>
                            </div>
                            {/* 도메인 도트 */}
                            <div className="flex gap-1 flex-wrap">
                                {domainSet.map(dk => {
                                    const count = items.filter(i => i.domain === dk).length;
                                    return (
                                        <span key={dk} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: DOMAINS[dk].color_hex + "18", color: DOMAINS[dk].color_hex }}>
                                            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: DOMAINS[dk].color_hex }} />
                                            {DOMAINS[dk].label_ko} {count}
                                        </span>
                                    );
                                })}
                            </div>
                            {/* 대표 활동 */}
                            <div className="mt-2 space-y-0.5">
                                {items.slice(0, 3).map(a => {
                                    const Icon = DOMAIN_ICON[a.domain] ?? Coffee;
                                    return (
                                        <div key={a.id} className="flex items-center gap-1.5 text-xs text-neutral-600">
                                            <Icon className="h-3 w-3 shrink-0" style={{ color: DOMAINS[a.domain]?.color_hex }} />
                                            <span className="truncate">{a.activity}</span>
                                            {a.start_time && <span className="ml-auto text-[10px] text-neutral-300 tabular-nums shrink-0">{a.start_time.slice(0, 5)}</span>}
                                        </div>
                                    );
                                })}
                                {items.length > 3 && (
                                    <p className="text-[10px] text-neutral-400 pl-4">+{items.length - 3}건 더</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
