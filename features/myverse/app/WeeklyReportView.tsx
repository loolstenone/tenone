"use client";

// 주간 라이프 리포트 — 지난 주 한눈에 / 과거 주 탐색
// 사용처: /myverse/app/coach (탭 추가) 또는 /myverse/app/insights

import { useEffect, useState } from "react";
import { Loader2, Sparkles, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface Highlight { title: string; body: string }
interface TopItem { key: string; count: number }
interface Stats {
    moments: number;
    routines: number;
    places: number;
    top_people: TopItem[];
    top_places: TopItem[];
    top_domain: TopItem | null;
}
interface Report {
    id: string;
    week_start: string;
    week_end: string;
    summary: string;
    highlights: Highlight[] | null;
    stats: Stats | null;
    created_at: string;
}

const DOMAIN_LABEL: Record<string, string> = {
    body: "BODY", work: "업무", study: "공부", daily: "일상",
    schedule: "일정", travel: "여행", move: "이동", relation: "관계",
};

function fmtRange(start: string, end: string): string {
    const s = new Date(start + "T00:00:00+09:00");
    const e = new Date(end + "T00:00:00+09:00");
    const sm = s.getMonth() + 1, sd = s.getDate();
    const em = e.getMonth() + 1, ed = e.getDate();
    return sm === em ? `${sm}월 ${sd}일 — ${ed}일` : `${sm}월 ${sd}일 — ${em}월 ${ed}일`;
}

function shiftWeek(weekStart: string, n: number): string {
    const d = new Date(weekStart + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + n * 7);
    return d.toISOString().slice(0, 10);
}

export function WeeklyReportView() {
    const [weekStart, setWeekStart] = useState<string | null>(null);
    const [weekEnd, setWeekEnd] = useState<string | null>(null);
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [empty, setEmpty] = useState(false);

    async function load(week?: string) {
        setLoading(true);
        setEmpty(false);
        try {
            const url = week ? `/api/myverse/coach/weekly?week=${week}` : "/api/myverse/coach/weekly";
            const res = await fetch(url);
            if (res.ok) {
                const d = await res.json();
                setWeekStart(d.week_start);
                setWeekEnd(d.week_end);
                setReport(d.report ?? null);
            }
        } finally {
            setLoading(false);
        }
    }

    async function generate() {
        if (!weekStart) return;
        setGenerating(true);
        try {
            const res = await fetch("/api/myverse/coach/weekly", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ week: weekStart }),
            });
            if (res.ok) {
                const d = await res.json();
                setReport(d.report ?? null);
                setEmpty(d.empty === true);
            }
        } finally {
            setGenerating(false);
        }
    }

    useEffect(() => { void load(); }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl w-full mx-auto px-6 py-5 space-y-5">
            {/* 주 네비 */}
            <div className="flex items-center justify-between">
                <button onClick={() => weekStart && load(shiftWeek(weekStart, -1))}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-indigo-400">Weekly</p>
                    <p className="text-sm font-medium text-neutral-900">
                        {weekStart && weekEnd ? fmtRange(weekStart, weekEnd) : "—"}
                    </p>
                </div>
                <button onClick={() => weekStart && load(shiftWeek(weekStart, 1))}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* 본문 */}
            {report ? (
                <>
                    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                            <span className="text-[10px] uppercase tracking-widest text-indigo-500">한 주 요약</span>
                        </div>
                        <p className="text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap">{report.summary}</p>
                    </div>

                    {report.highlights && report.highlights.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {report.highlights.map((h, i) => (
                                <div key={i} className="rounded-xl border border-neutral-200 bg-white p-3">
                                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">{h.title}</p>
                                    <p className="text-sm text-neutral-800">{h.body}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {report.stats && (
                        <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <Stat label="흔적" value={report.stats.moments} />
                                <Stat label="일과" value={report.stats.routines} />
                                <Stat label="장소" value={report.stats.places} />
                            </div>
                            {(report.stats.top_people.length > 0 || report.stats.top_places.length > 0 || report.stats.top_domain) && (
                                <div className="border-t border-neutral-100 pt-3 space-y-2">
                                    {report.stats.top_people.length > 0 && (
                                        <Row label="자주 만난 사람" items={report.stats.top_people} />
                                    )}
                                    {report.stats.top_places.length > 0 && (
                                        <Row label="자주 간 장소" items={report.stats.top_places} />
                                    )}
                                    {report.stats.top_domain && (
                                        <Row label="주력 영역" items={[{
                                            key: DOMAIN_LABEL[report.stats.top_domain.key] ?? report.stats.top_domain.key,
                                            count: report.stats.top_domain.count,
                                        }]} />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <p className="text-[10px] text-neutral-400 text-center">
                        생성: {new Date(report.created_at).toLocaleString("ko-KR")}
                    </p>
                </>
            ) : empty ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                    <p className="text-sm text-neutral-500 mb-1">이 주는 기록이 적어 리포트를 만들 수 없어.</p>
                    <p className="text-xs text-neutral-400">짧게라도 흔적을 남기면 한 주 후 정리해 줄게.</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/40 to-white p-6 text-center">
                    <Sparkles className="h-5 w-5 text-indigo-500 mx-auto mb-2" />
                    <p className="text-sm text-neutral-700 mb-3">이 주의 리포트는 아직 만들어지지 않았어.</p>
                    <button onClick={generate} disabled={generating}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 disabled:opacity-50">
                        {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        {generating ? "한 주를 보고 있어…" : "리포트 받기"}
                    </button>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <p className="text-2xl font-serif text-neutral-900 tabular-nums">{value}</p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">{label}</p>
        </div>
    );
}

function Row({ label, items }: { label: string; items: TopItem[] }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400 shrink-0 w-24">{label}</span>
            <div className="flex flex-wrap gap-1.5">
                {items.map((it, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                        {it.key}
                        <span className="text-neutral-400 tabular-nums">{it.count}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
