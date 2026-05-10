"use client";

// 오늘 대시보드 — Stitch 디자인 기반 (세션 122)
// 데이터: /api/myverse/briefing · /moments?date · /calendar?from&to
// 폰트: Hanken Grotesk (display) · Inter (body) · Material Symbols (icons)
// 컬러: Myverse 인디고 #6366F1 유지 (Stitch 스틸블루 미사용 — CLAUDE.md 원칙)

import { useEffect, useState } from "react";
import Link from "next/link";

const ACCENT = "#6366F1";
const ACCENT_DARK = "#4F46E5";
const ACCENT_SOFT = "#EEF0FF";

interface Briefing {
    id: string;
    briefing_date: string;
    briefing_type: "morning" | "evening" | string;
    summary?: string | null;
    body?: string | null;
    score?: number | null;
}

interface Moment {
    id: string;
    happened_at?: string | null;
    caption?: string | null;
    media_url?: string | null;
    media_type?: string | null;
    domain?: string | null;
}

interface CalendarEntry {
    id: string;
    date: string;
    title: string;
    start_time: string | null;
    end_time: string | null;
    is_all_day: boolean;
    color: string | null;
    note: string | null;
    kind?: string | null;
}

function todayKST(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
}

function formatKoDate(date: Date): { weekday: string; full: string } {
    const weekdayMap = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    return {
        weekday: weekdayMap[date.getDay()],
        full: `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`,
    };
}

function timeOfDay(): "morning" | "afternoon" | "evening" {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 18) return "afternoon";
    return "evening";
}

function greeting(name?: string): string {
    const t = timeOfDay();
    const base = t === "morning" ? "좋은 아침이에요" : t === "afternoon" ? "오후도 잘 보내고 있어요" : "오늘 하루 어떠셨나요";
    return name ? `${base}, ${name}님` : base;
}

export function TodayDashboard({ initialDate, userName }: { initialDate?: string; userName?: string | null }) {
    const date = initialDate || todayKST();
    const dateObj = new Date(date + "T00:00:00+09:00");
    const { weekday, full } = formatKoDate(dateObj);

    const [briefings, setBriefings] = useState<Briefing[]>([]);
    const [moments, setMoments] = useState<Moment[]>([]);
    const [entries, setEntries] = useState<CalendarEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const [bRes, mRes, cRes] = await Promise.all([
                    fetch("/api/myverse/briefing"),
                    fetch(`/api/myverse/moments?date=${date}`),
                    fetch(`/api/myverse/calendar?from=${date}&to=${date}`),
                ]);
                if (!alive) return;
                if (bRes.ok) {
                    const j = await bRes.json();
                    setBriefings(j.briefings ?? []);
                }
                if (mRes.ok) {
                    const j = await mRes.json();
                    setMoments((j.moments ?? j.items ?? []).slice(0, 12));
                }
                if (cRes.ok) {
                    const j = await cRes.json();
                    setEntries(j.entries ?? j.items ?? []);
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [date]);

    // 오늘의 브리핑 — morning 우선, 없으면 가장 최근
    const todayBriefing = briefings.find(b => b.briefing_date === date && b.briefing_type === "morning")
        ?? briefings.find(b => b.briefing_date === date)
        ?? briefings[0];

    // 다음 4시간 일정
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const upcoming = entries
        .filter(e => {
            if (e.is_all_day) return false;
            if (!e.start_time) return false;
            const [h, m] = e.start_time.split(":").map(Number);
            const start = h * 60 + m;
            return start >= nowMin - 30 && start <= nowMin + 240;
        })
        .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
        .slice(0, 4);

    return (
        <div
            className="min-h-screen pb-24 bg-neutral-50"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
            <main className="max-w-6xl mx-auto px-5 md:px-10 pt-6 md:pt-10">
                {/* ── 시간 줌 링크 (일/주/월/연) ───────────────────────── */}
                <nav className="flex justify-end gap-1 mb-4 text-xs">
                    {[
                        { label: "일간", href: "/myverse/app/daily" },
                        { label: "주간", href: "/myverse/app/weekly" },
                        { label: "월간", href: "/myverse/app/monthly" },
                        { label: "연간", href: "/myverse/app/yearly" },
                    ].map(z => (
                        <Link
                            key={z.href}
                            href={z.href}
                            className="px-3 py-1.5 rounded-lg text-neutral-500 hover:bg-white hover:text-neutral-900 transition-colors"
                        >
                            {z.label}
                        </Link>
                    ))}
                </nav>

                {/* ── Date & Greeting ─────────────────────────────────── */}
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1
                            className="text-[26px] md:text-[32px] font-medium tracking-tight text-neutral-900 leading-tight"
                            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                        >
                            {greeting(userName ?? undefined)}
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            {full} · {weekday}
                        </p>
                    </div>
                    <Link
                        href="/myverse/app/traces?compose=1"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-white text-xs font-semibold tracking-wider uppercase active:scale-95 transition-all shadow-md"
                        style={{ backgroundColor: ACCENT, boxShadow: `0 4px 12px ${ACCENT}26` }}
                    >
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                            mic
                        </span>
                        빠른 기록
                    </Link>
                </section>

                {/* ── AI Coach Card ───────────────────────────────────── */}
                <section className="mb-8">
                    <div
                        className="bg-white rounded-3xl p-6 md:p-8 relative overflow-hidden border border-neutral-100"
                        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}
                    >
                        <div
                            className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
                            style={{ backgroundColor: `${ACCENT}14` }}
                        />
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-3 max-w-2xl">
                                <div className="flex items-center gap-2" style={{ color: ACCENT }}>
                                    <span
                                        className="material-symbols-outlined text-xl"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        auto_awesome
                                    </span>
                                    <span className="text-[11px] font-semibold uppercase tracking-widest">
                                        오늘의 브리핑
                                    </span>
                                </div>
                                <h2
                                    className="text-[20px] md:text-[24px] font-medium text-neutral-900 leading-snug"
                                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                                >
                                    {todayBriefing?.summary || "오늘의 브리핑을 준비 중입니다"}
                                </h2>
                                <p className="text-sm text-neutral-600 leading-relaxed">
                                    {todayBriefing?.body
                                        ? (todayBriefing.body.length > 220
                                            ? todayBriefing.body.slice(0, 220) + "…"
                                            : todayBriefing.body)
                                        : "흔적을 더 쌓을수록 AI가 더 정확한 브리핑을 만들어 드립니다."}
                                </p>
                                <div className="flex gap-2 pt-2">
                                    <Link
                                        href="/myverse/app/coach"
                                        className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors"
                                        style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
                                    >
                                        브리핑 보기
                                    </Link>
                                    <Link
                                        href="/myverse/app/ask"
                                        className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                                    >
                                        AI에게 묻기
                                    </Link>
                                </div>
                            </div>
                            {typeof todayBriefing?.score === "number" && (
                                <div
                                    className="flex flex-col items-center justify-center p-6 rounded-2xl min-w-[140px]"
                                    style={{ backgroundColor: ACCENT_SOFT }}
                                >
                                    <span
                                        className="text-[44px] font-semibold leading-none tabular-nums"
                                        style={{ color: ACCENT, fontFamily: "'Hanken Grotesk', sans-serif" }}
                                    >
                                        {Math.round(todayBriefing.score)}
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase tracking-widest mt-2" style={{ color: ACCENT }}>
                                        Focus
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── Today's Traces ──────────────────────────────────── */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3
                            className="text-[18px] font-medium text-neutral-900"
                            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                        >
                            오늘의 흔적
                        </h3>
                        <Link
                            href={`/myverse/app/traces?period=today`}
                            className="text-xs font-semibold tracking-wider uppercase hover:underline"
                            style={{ color: ACCENT }}
                        >
                            전체 보기
                        </Link>
                    </div>
                    <div
                        className="flex gap-4 overflow-x-auto pb-3 -mx-5 px-5 md:-mx-10 md:px-10 [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {loading ? (
                            <div className="min-w-[280px] h-[280px] rounded-2xl bg-neutral-100 animate-pulse" />
                        ) : moments.length === 0 ? (
                            <Link
                                href="/myverse/app/traces?compose=1"
                                className="min-w-[280px] h-[280px] rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 hover:border-neutral-300 transition-colors group"
                            >
                                <span className="material-symbols-outlined text-4xl text-neutral-400 mb-2 group-hover:scale-110 transition-transform">
                                    add_circle
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                                    첫 흔적 남기기
                                </span>
                            </Link>
                        ) : (
                            <>
                                {moments.map(m => <TraceCard key={m.id} m={m} />)}
                                <Link
                                    href="/myverse/app/traces?compose=1"
                                    className="min-w-[200px] h-[280px] rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 hover:border-neutral-300 transition-colors group shrink-0"
                                >
                                    <span className="material-symbols-outlined text-3xl text-neutral-400 mb-1 group-hover:scale-110 transition-transform">
                                        add_circle
                                    </span>
                                    <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                                        흔적 추가
                                    </span>
                                </Link>
                            </>
                        )}
                    </div>
                </section>

                {/* ── Next 4 Hours Timeline ──────────────────────────── */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3
                            className="text-[18px] font-medium text-neutral-900"
                            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                        >
                            다음 4시간
                        </h3>
                        <Link
                            href={`/myverse/app/schedule`}
                            className="text-xs font-semibold tracking-wider uppercase hover:underline"
                            style={{ color: ACCENT }}
                        >
                            전체 일정
                        </Link>
                    </div>
                    {upcoming.length === 0 ? (
                        <div
                            className="bg-white rounded-2xl p-8 text-center text-sm text-neutral-500 border border-neutral-100"
                            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.02)" }}
                        >
                            지금부터 4시간 안에 예정된 일정이 없습니다.
                            <Link
                                href="/myverse/app/schedule"
                                className="block mt-3 text-xs font-semibold tracking-wider uppercase"
                                style={{ color: ACCENT }}
                            >
                                일정 추가하기 →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.map((e, i) => {
                                const active = i === 0;
                                return (
                                    <div key={e.id} className="flex gap-4 md:gap-6 items-start">
                                        <div className="flex flex-col items-center pt-1 shrink-0 w-12">
                                            <span
                                                className="text-[11px] font-semibold tracking-wider tabular-nums"
                                                style={{ color: active ? ACCENT : "#9CA3AF" }}
                                            >
                                                {e.start_time?.slice(0, 5)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div
                                                className={`rounded-2xl p-5 transition-all border ${
                                                    active
                                                        ? "border-l-4"
                                                        : "border-neutral-100 bg-white"
                                                }`}
                                                style={
                                                    active
                                                        ? {
                                                            backgroundColor: ACCENT_SOFT,
                                                            borderColor: ACCENT,
                                                            borderLeftWidth: "4px",
                                                            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                                                        }
                                                        : { boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }
                                                }
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4
                                                        className="text-[15px] font-semibold leading-snug"
                                                        style={{ color: active ? ACCENT : "#171717" }}
                                                    >
                                                        {e.title}
                                                    </h4>
                                                    {e.kind && (
                                                        <span
                                                            className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded shrink-0 ml-2"
                                                            style={
                                                                active
                                                                    ? { backgroundColor: ACCENT, color: "#fff" }
                                                                    : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                                                            }
                                                        >
                                                            {e.kind}
                                                        </span>
                                                    )}
                                                </div>
                                                {e.note && (
                                                    <p className={`text-xs ${active ? "text-neutral-700" : "text-neutral-500"}`}>
                                                        {e.note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

function TraceCard({ m }: { m: Moment }) {
    const time = m.happened_at
        ? new Date(m.happened_at).toLocaleTimeString("ko-KR", {
            timeZone: "Asia/Seoul",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
        : "";

    const isImage = m.media_type?.startsWith("image") || (m.media_url && /\.(jpg|jpeg|png|webp|gif)/i.test(m.media_url));

    return (
        <Link
            href={`/myverse/app/traces?moment=${m.id}`}
            className="min-w-[280px] h-[280px] bg-white rounded-2xl overflow-hidden flex flex-col group shrink-0 border border-neutral-100"
            style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}
        >
            <div className="h-3/5 w-full relative bg-neutral-100">
                {isImage && m.media_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={m.media_url}
                        alt={m.caption ?? ""}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <span className="material-symbols-outlined text-5xl">
                            {m.media_type?.startsWith("audio") ? "mic" : "edit_note"}
                        </span>
                    </div>
                )}
                {time && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full">
                        <span className="text-[10px] font-semibold tracking-wider tabular-nums" style={{ color: ACCENT }}>
                            {time}
                        </span>
                    </div>
                )}
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
                <p className="text-sm text-neutral-700 line-clamp-2 leading-relaxed">
                    {m.caption || "(캡션 없음)"}
                </p>
                {m.domain && (
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mt-2">
                        {m.domain}
                    </span>
                )}
            </div>
        </Link>
    );
}
