"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, Calendar, RefreshCw, Wifi, WifiOff, Camera, Clock, Sunrise, Sunset } from "lucide-react";
import { ROUTINE_CATEGORIES as CATEGORIES, categoryMeta as catMeta } from "@/lib/myverse/categories";
import { PageShell, PageHeader } from "./PageShell";

// ─── 타입 ────────────────────────────────────────────────

type Routine = {
    id: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    activity: string;
    category: string;
    note: string | null;
    level: number | null;
    capture_mode?: "manual" | "auto" | "imported";
    domain?: string;
};

type Place = {
    id: string;
    place_name: string;
    visited_at: string | null;
    duration_min: number | null;
    category: string;
};

type Moment = {
    id: string;
    happened_at: string | null;
    caption: string | null;
    media_type: string;
};

type ExternalEvent = {
    id: string;
    provider: string;
    title: string;
    start_at: string;
    end_at: string | null;
    location: string | null;
    color: string | null;
    calendar_name: string | null;
};

type Integration = {
    id: string;
    provider: string;
    status: string;
    external_email: string | null;
    external_name: string | null;
    sync_direction: string | null;
    last_sync_at: string | null;
    created_at: string;
};

type HourlyEntry = { key: string; total: number; domains: Record<string, number> };

// ─── 헬퍼 ────────────────────────────────────────────────

function parseMinutes(t: string | null): number | null {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
}

function fmtTime(t: string | null) {
    if (!t) return "";
    return t.slice(0, 5);
}

function fmtMinutes(min: number) {
    if (min < 60) return `${min}분`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}시간 ${m}분` : `${h}시간`;
}

function todayKST(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
}

function shiftDate(dateStr: string, days: number): string {
    const d = new Date(dateStr + "T00:00:00+09:00");
    d.setDate(d.getDate() + days);
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(d);
}

function fmtHeader(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const dt = new Date(dateStr + "T00:00:00+09:00");
    const dow = days[dt.getDay()];
    return `${y}년 ${m}월 ${d}일 (${dow})`;
}

function nowSlotKST(): string {
    const kst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const h = kst.getHours();
    const m = kst.getMinutes();
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function nowMinutesKST(): number {
    const kst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    return kst.getHours() * 60 + kst.getMinutes();
}

// ISO string → KST HH:MM
function isoToKST(iso: string): string {
    try {
        const d = new Date(iso);
        return new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Seoul",
            hour: "2-digit", minute: "2-digit", hour12: false,
        }).format(d);
    } catch {
        return "";
    }
}

// ISO string → KST minute offset (0–1440)
function isoToKSTMinutes(iso: string): number {
    const t = isoToKST(iso);
    return parseMinutes(t) ?? 0;
}

// WMO 날씨 코드 → 한국어 레이블 + 이모지
function weatherLabel(code: number): { emoji: string; label: string } {
    if (code === 0) return { emoji: "☀️", label: "맑음" };
    if (code <= 3) return { emoji: "⛅", label: "구름 조금" };
    if (code <= 48) return { emoji: "🌫️", label: "안개" };
    if (code <= 55) return { emoji: "🌦️", label: "이슬비" };
    if (code <= 65) return { emoji: "🌧️", label: "비" };
    if (code <= 75) return { emoji: "❄️", label: "눈" };
    if (code <= 82) return { emoji: "🌦️", label: "소나기" };
    if (code <= 99) return { emoji: "⛈️", label: "뇌우" };
    return { emoji: "🌡️", label: "날씨 정보" };
}

// provider 표시명
function providerLabel(p: string): string {
    switch (p) {
        case "google_calendar": return "Google";
        case "ical": return "iCal";
        case "notion": return "Notion";
        case "slack": return "Slack";
        default: return p;
    }
}

// provider 컬러
function providerColor(p: string): string {
    switch (p) {
        case "google_calendar": return "#4285F4";
        case "ical": return "#FF6B6B";
        default: return "#6366F1";
    }
}

// relative time (last sync 등)
function relTime(iso: string | null): string {
    if (!iso) return "없음";
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "방금";
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

// ─── 서브 컴포넌트 ────────────────────────────────────────

function SourceBadge({ source }: { source: "calendar" | "gps" | "routine" | "moment" }) {
    const map = {
        calendar: { label: "캘린더", cls: "bg-blue-50 text-blue-500" },
        gps: { label: "GPS", cls: "bg-emerald-50 text-emerald-500" },
        routine: { label: "일정", cls: "bg-indigo-50 text-indigo-400" },
        moment: { label: "순간", cls: "bg-amber-50 text-amber-500" },
    };
    const { label, cls } = map[source];
    return (
        <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded font-medium leading-none shrink-0 ${cls}`}>
            {label}
        </span>
    );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────

export function TimeTrackerView({ initialDate }: { initialDate: string }) {
    const today = todayKST();
    const [date, setDate] = useState(initialDate);

    // 데이터
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [moments, setMoments] = useState<Moment[]>([]);
    const [hourlyData, setHourlyData] = useState<HourlyEntry[]>([]);
    const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>([]);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    // 위치/날씨/일출
    const [geoName, setGeoName] = useState<string | null>(null);
    const [sunrise, setSunrise] = useState<string | null>(null);
    const [sunset, setSunset] = useState<string | null>(null);
    const [tempMax, setTempMax] = useState<number | null>(null);
    const [tempMin, setTempMin] = useState<number | null>(null);
    const [weatherCode, setWeatherCode] = useState<number | null>(null);
    const [showDawn, setShowDawn] = useState(false);

    const nowRef = useRef<HTMLDivElement>(null);
    const nowMin = date === today ? nowMinutesKST() : null;

    // 통합 연동 상태
    const googleCal = integrations.find(i => i.provider === "google_calendar");
    const calConnected = googleCal?.status === "connected";

    // ─ 데이터 로드

    async function load(d: string) {
        setLoading(true);
        try {
            const [routinesRes, placesRes, momentsRes, verseRes, extRes] = await Promise.all([
                fetch(`/api/myverse/routines?date=${d}`),
                fetch(`/api/myverse/places?date=${d}`),
                fetch(`/api/myverse/moments?date=${d}`),
                fetch(`/api/myverse/verse?from=${d}&to=${d}&zoom=hour`),
                fetch(`/api/myverse/external-events?from=${d}T00:00:00&to=${d}T23:59:59`),
            ]);
            if (routinesRes.ok) { const j = await routinesRes.json(); setRoutines(j.routines ?? []); }
            if (placesRes.ok) { const j = await placesRes.json(); setPlaces(j.places ?? []); }
            if (momentsRes.ok) { const j = await momentsRes.json(); setMoments(j.moments ?? []); }
            if (verseRes.ok) { const j = await verseRes.json(); setHourlyData(j.summary ?? []); }
            if (extRes.ok) { const j = await extRes.json(); setExternalEvents(j.events ?? []); }
        } catch { /* silent */ } finally {
            setLoading(false);
        }
    }

    async function loadIntegrations() {
        try {
            const res = await fetch("/api/myverse/integrations");
            if (res.ok) { const j = await res.json(); setIntegrations(j.integrations ?? []); }
        } catch { /* silent */ }
    }

    // 위치 + 일출·일몰
    async function loadGeo() {
        try {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                const [geoRes, sunRes] = await Promise.all([
                    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ko`),
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia%2FSeoul&forecast_days=1`),
                ]);
                if (geoRes.ok) {
                    const g = await geoRes.json();
                    const addr = g.address;
                    setGeoName(addr?.neighbourhood ?? addr?.suburb ?? addr?.quarter ?? addr?.town ?? addr?.city ?? null);
                }
                if (sunRes.ok) {
                    const s = await sunRes.json();
                    const sr = s.daily?.sunrise?.[0] as string | undefined;
                    const ss = s.daily?.sunset?.[0] as string | undefined;
                    if (sr) setSunrise(isoToKST(sr));
                    if (ss) setSunset(isoToKST(ss));
                    const tMax = s.daily?.temperature_2m_max?.[0] as number | undefined;
                    const tMin = s.daily?.temperature_2m_min?.[0] as number | undefined;
                    const wc = s.daily?.weathercode?.[0] as number | undefined;
                    if (tMax != null) setTempMax(Math.round(tMax));
                    if (tMin != null) setTempMin(Math.round(tMin));
                    if (wc != null) setWeatherCode(wc);
                }
            }, undefined, { timeout: 5000 });
        } catch { /* silent */ }
    }

    useEffect(() => { load(date); }, [date]);
    useEffect(() => { loadIntegrations(); loadGeo(); }, []);

    // 현재 시각 라인 스크롤
    useEffect(() => {
        if (nowRef.current) {
            nowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [loading]);

    // Google Calendar 동기화
    async function syncGoogleCalendar() {
        if (!calConnected || syncing) return;
        setSyncing(true);
        try {
            await fetch("/api/myverse/integrations/google/sync", { method: "POST" });
            await Promise.all([load(date), loadIntegrations()]);
        } catch { /* silent */ } finally {
            setSyncing(false);
        }
    }

    // ─ 타임라인 아이템 통합 (시간순 정렬)

    type TimelineItem =
        | { kind: "event"; data: ExternalEvent; startMin: number; endMin: number }
        | { kind: "routine"; data: Routine; startMin: number; endMin: number }
        | { kind: "place"; data: Place; startMin: number }
        | { kind: "moment"; data: Moment; startMin: number };

    const timelineItems: TimelineItem[] = [
        ...externalEvents
            .filter(e => e.start_at)
            .map(e => ({
                kind: "event" as const,
                data: e,
                startMin: isoToKSTMinutes(e.start_at),
                endMin: e.end_at ? isoToKSTMinutes(e.end_at) : isoToKSTMinutes(e.start_at) + 60,
            })),
        ...routines
            .filter(r => r.start_time)
            .map(r => ({
                kind: "routine" as const,
                data: r,
                startMin: parseMinutes(r.start_time) ?? 0,
                endMin: parseMinutes(r.end_time) ?? (parseMinutes(r.start_time) ?? 0) + 60,
            })),
        ...places
            .filter(p => p.visited_at)
            .map(p => ({
                kind: "place" as const,
                data: p,
                startMin: isoToKSTMinutes(p.visited_at!),
            })),
        ...moments
            .filter(m => m.happened_at)
            .map(m => ({
                kind: "moment" as const,
                data: m,
                startMin: isoToKSTMinutes(m.happened_at!),
            })),
    ].sort((a, b) => a.startMin - b.startMin);

    // 카테고리별 집계 (routine 기준)
    const catStats = CATEGORIES.reduce((acc, cat) => {
        const items = routines.filter(r => r.category === cat.key);
        const total = items.reduce((s, r) => {
            const sm = parseMinutes(r.start_time);
            const em = parseMinutes(r.end_time);
            return s + (sm != null && em != null ? em - sm : 0);
        }, 0);
        if (total > 0) acc[cat.key] = total;
        return acc;
    }, {} as Record<string, number>);

    const totalTrackedMin = Object.values(catStats).reduce((a, b) => a + b, 0);

    // 상위 3 장소
    const topPlaces = [...places]
        .sort((a, b) => (b.duration_min ?? 0) - (a.duration_min ?? 0))
        .slice(0, 3);

    // 24h 바 데이터 (hourly → 48 slots 시각화)
    const maxHourly = Math.max(...hourlyData.map(h => h.total), 1);

    // ─ 렌더

    const TIMELINE_HEIGHT = 48 * 30; // 1440px (30px per 30min slot)
    const PX_PER_MIN = TIMELINE_HEIGHT / (24 * 60);

    return (
        <PageShell>
            <PageHeader
                title={fmtHeader(date)}
                onPrev={() => setDate(shiftDate(date, -1))}
                onNext={() => setDate(shiftDate(date, 1))}
                right={
                    date !== today ? (
                        <button
                            onClick={() => setDate(today)}
                            className="text-xs text-indigo-300 hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-colors"
                        >
                            오늘
                        </button>
                    ) : undefined
                }
            />

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-300 border-t-indigo-600" />
                </div>
            ) : (
                <div className="flex gap-4 h-full overflow-hidden">

                    {/* ── 좌측: 데이터 소스 상태 + 요약 ── */}
                    <div className="w-52 shrink-0 flex flex-col gap-3 overflow-y-auto pr-1">

                        {/* 데이터 소스 연동 */}
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider mb-2">데이터 소스</div>

                            {/* Google Calendar */}
                            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    {calConnected ? (
                                        <Wifi className="h-3.5 w-3.5 text-blue-400" />
                                    ) : (
                                        <WifiOff className="h-3.5 w-3.5 text-white/30" />
                                    )}
                                    <div>
                                        <div className="text-xs font-medium text-white/80">Google Cal</div>
                                        {calConnected && googleCal?.last_sync_at && (
                                            <div className="text-[10px] text-white/30">{relTime(googleCal.last_sync_at)}</div>
                                        )}
                                        {!calConnected && (
                                            <div className="text-[10px] text-white/30">미연결</div>
                                        )}
                                    </div>
                                </div>
                                {calConnected && (
                                    <button
                                        onClick={syncGoogleCalendar}
                                        disabled={syncing}
                                        className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                                        title="동기화"
                                    >
                                        <RefreshCw className={`h-3 w-3 text-blue-400 ${syncing ? "animate-spin" : ""}`} />
                                    </button>
                                )}
                            </div>

                            {/* GPS 위치 */}
                            <div className="flex items-center gap-2 py-1.5 border-b border-white/5">
                                <MapPin className={`h-3.5 w-3.5 ${geoName ? "text-emerald-400" : "text-white/30"}`} />
                                <div>
                                    <div className="text-xs font-medium text-white/80">GPS</div>
                                    <div className="text-[10px] text-white/30">{geoName ?? "위치 없음"}</div>
                                </div>
                            </div>

                            {/* 날씨 */}
                            {weatherCode != null && (
                                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base leading-none">{weatherLabel(weatherCode).emoji}</span>
                                        <div>
                                            <div className="text-xs font-medium text-white/80">{weatherLabel(weatherCode).label}</div>
                                            {tempMax != null && tempMin != null && (
                                                <div className="text-[10px] text-white/40">
                                                    {tempMax}° / {tempMin}°
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 일출·일몰 */}
                            {(sunrise || sunset) && (
                                <div className="flex items-center gap-3 py-1.5 border-b border-white/5">
                                    <div className="flex items-center gap-1">
                                        <Sunrise className="h-3 w-3 text-amber-400" />
                                        <span className="text-[10px] text-white/50">{sunrise}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Sunset className="h-3 w-3 text-orange-400" />
                                        <span className="text-[10px] text-white/50">{sunset}</span>
                                    </div>
                                </div>
                            )}

                            {/* 외부 이벤트 개수 */}
                            <div className="flex items-center gap-2 py-1.5">
                                <Calendar className="h-3.5 w-3.5 text-blue-400" />
                                <div>
                                    <div className="text-xs font-medium text-white/80">캘린더 이벤트</div>
                                    <div className="text-[10px] text-white/30">{externalEvents.length}개</div>
                                </div>
                            </div>
                        </div>

                        {/* 시간 요약 */}
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider mb-2">기록 요약</div>
                            {totalTrackedMin > 0 ? (
                                <>
                                    <div className="text-lg font-bold text-white">{fmtMinutes(totalTrackedMin)}</div>
                                    <div className="text-[10px] text-white/40 mb-2">기록된 시간</div>
                                    <div className="space-y-1.5">
                                        {Object.entries(catStats)
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 5)
                                            .map(([cat, min]) => {
                                                const meta = catMeta(cat);
                                                const pct = Math.round((min / totalTrackedMin) * 100);
                                                return (
                                                    <div key={cat} className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: meta?.hex ?? "#6366F1" }} />
                                                        <div className="flex-1 text-[10px] text-white/60 truncate">{meta?.label ?? cat}</div>
                                                        <div className="text-[10px] text-white/40">{pct}%</div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </>
                            ) : (
                                <div className="text-[10px] text-white/30">기록 없음</div>
                            )}
                        </div>

                        {/* 주요 장소 */}
                        {topPlaces.length > 0 && (
                            <div className="bg-white/5 rounded-xl p-3">
                                <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider mb-2">주요 장소</div>
                                <div className="space-y-2">
                                    {topPlaces.map(p => (
                                        <div key={p.id} className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-white/80 truncate">{p.place_name}</div>
                                                {p.duration_min && (
                                                    <div className="text-[10px] text-white/30">{fmtMinutes(p.duration_min)}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 순간(사진) */}
                        {moments.length > 0 && (
                            <div className="bg-white/5 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Camera className="h-3.5 w-3.5 text-amber-400" />
                                    <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider">순간</div>
                                </div>
                                <div className="text-sm font-medium text-white">{moments.length}개</div>
                                <div className="text-[10px] text-white/30">오늘 기록된 사진·영상</div>
                            </div>
                        )}
                    </div>

                    {/* ── 중앙: 24h 타임라인 ── */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                        {/* 24h 미니바 */}
                        <div className="h-6 bg-white/5 rounded-lg mb-3 relative overflow-hidden flex shrink-0">
                            {/* 일출~일몰 배경 */}
                            {sunrise && sunset && (() => {
                                const srMin = parseMinutes(sunrise) ?? 0;
                                const ssMin = parseMinutes(sunset) ?? 1440;
                                return (
                                    <div
                                        className="absolute top-0 bottom-0 bg-amber-500/10"
                                        style={{ left: `${(srMin / 1440) * 100}%`, width: `${((ssMin - srMin) / 1440) * 100}%` }}
                                    />
                                );
                            })()}
                            {/* 외부 이벤트 */}
                            {externalEvents.map(e => {
                                const s = isoToKSTMinutes(e.start_at);
                                const en = e.end_at ? isoToKSTMinutes(e.end_at) : s + 60;
                                return (
                                    <div
                                        key={e.id}
                                        className="absolute top-1 bottom-1 rounded-sm opacity-80"
                                        style={{
                                            left: `${(s / 1440) * 100}%`,
                                            width: `${Math.max(((en - s) / 1440) * 100, 0.5)}%`,
                                            backgroundColor: providerColor(e.provider),
                                        }}
                                        title={e.title}
                                    />
                                );
                            })}
                            {/* 루틴 */}
                            {routines.filter(r => r.start_time).map(r => {
                                const s = parseMinutes(r.start_time) ?? 0;
                                const e = parseMinutes(r.end_time) ?? s + 60;
                                const meta = catMeta(r.category);
                                return (
                                    <div
                                        key={r.id}
                                        className="absolute top-1.5 bottom-1.5 rounded-sm opacity-60"
                                        style={{
                                            left: `${(s / 1440) * 100}%`,
                                            width: `${Math.max(((e - s) / 1440) * 100, 0.3)}%`,
                                            backgroundColor: meta?.hex ?? "#6366F1",
                                        }}
                                    />
                                );
                            })}
                            {/* 현재 시각 마커 */}
                            {nowMin != null && (
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-red-400"
                                    style={{ left: `${(nowMin / 1440) * 100}%` }}
                                />
                            )}
                            {/* 시간 눈금 */}
                            {[6, 12, 18].map(h => (
                                <div
                                    key={h}
                                    className="absolute top-0 bottom-0 w-px bg-white/10"
                                    style={{ left: `${(h / 24) * 100}%` }}
                                />
                            ))}
                        </div>

                        {/* 세로 타임라인 */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="relative" style={{ height: TIMELINE_HEIGHT }}>

                                {/* 시간 눈금선 */}
                                {Array.from({ length: 25 }, (_, h) => (
                                    <div
                                        key={h}
                                        className="absolute left-0 right-0 flex items-center"
                                        style={{ top: h * 60 * PX_PER_MIN }}
                                    >
                                        <span className="text-[10px] text-white/20 w-10 shrink-0 text-right pr-2 leading-none">
                                            {h < 24 ? `${String(h).padStart(2, "0")}:00` : ""}
                                        </span>
                                        <div className="flex-1 h-px bg-white/5" />
                                    </div>
                                ))}

                                {/* 새벽 토글 배경 */}
                                {!showDawn && (
                                    <button
                                        onClick={() => setShowDawn(true)}
                                        className="absolute left-10 right-0 flex items-center justify-center text-[10px] text-white/20 hover:text-white/40 transition-colors z-10"
                                        style={{ top: 0, height: 6 * 60 * PX_PER_MIN }}
                                    >
                                        새벽 (0–6시) 펼치기
                                    </button>
                                )}

                                {/* 일출~일몰 배경 */}
                                {sunrise && sunset && (() => {
                                    const srMin = parseMinutes(sunrise) ?? 0;
                                    const ssMin = parseMinutes(sunset) ?? 1440;
                                    return (
                                        <div
                                            className="absolute left-10 right-0 bg-amber-500/5 pointer-events-none"
                                            style={{
                                                top: srMin * PX_PER_MIN,
                                                height: (ssMin - srMin) * PX_PER_MIN,
                                            }}
                                        />
                                    );
                                })()}

                                {/* 현재 시각 라인 */}
                                {nowMin != null && (
                                    <div
                                        ref={nowRef}
                                        className="absolute left-10 right-0 flex items-center gap-1 z-20 pointer-events-none"
                                        style={{ top: nowMin * PX_PER_MIN - 1 }}
                                    >
                                        <div className="h-2 w-2 rounded-full bg-red-400 shrink-0" />
                                        <div className="flex-1 h-0.5 bg-red-400/60" />
                                        <span className="text-[10px] text-red-400 pr-2">{nowSlotKST()}</span>
                                    </div>
                                )}

                                {/* 장소 방문 핀 */}
                                {places.filter(p => p.visited_at).map(p => {
                                    const min = isoToKSTMinutes(p.visited_at!);
                                    return (
                                        <div
                                            key={p.id}
                                            className="absolute left-10 flex items-center gap-1 z-10"
                                            style={{ top: min * PX_PER_MIN - 6 }}
                                        >
                                            <div className="h-3 w-3 rounded-full bg-emerald-400/80 flex items-center justify-center shrink-0">
                                                <MapPin className="h-2 w-2 text-white" />
                                            </div>
                                            <span className="text-[10px] text-emerald-300/70 truncate max-w-[120px]">{p.place_name}</span>
                                        </div>
                                    );
                                })}

                                {/* 순간(사진) 핀 */}
                                {moments.filter(m => m.happened_at).map(m => {
                                    const min = isoToKSTMinutes(m.happened_at!);
                                    return (
                                        <div
                                            key={m.id}
                                            className="absolute right-2 flex items-center gap-1 z-10"
                                            style={{ top: min * PX_PER_MIN - 6 }}
                                            title={m.caption ?? "순간"}
                                        >
                                            <Camera className="h-3 w-3 text-amber-400/70" />
                                        </div>
                                    );
                                })}

                                {/* 외부 이벤트 블록 */}
                                {externalEvents.map(e => {
                                    const s = isoToKSTMinutes(e.start_at);
                                    const en = e.end_at ? isoToKSTMinutes(e.end_at) : s + 60;
                                    const h = Math.max((en - s) * PX_PER_MIN, 20);
                                    return (
                                        <div
                                            key={e.id}
                                            className="absolute left-12 right-14 rounded-md px-2 py-1 overflow-hidden z-10"
                                            style={{
                                                top: s * PX_PER_MIN,
                                                height: h,
                                                backgroundColor: `${providerColor(e.provider)}20`,
                                                borderLeft: `2px solid ${providerColor(e.provider)}`,
                                            }}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-medium text-white/80 truncate flex-1">{e.title}</span>
                                                <span className="text-[9px] text-white/30 shrink-0">{providerLabel(e.provider)}</span>
                                            </div>
                                            {h > 28 && e.location && (
                                                <div className="text-[9px] text-white/40 truncate mt-0.5">{e.location}</div>
                                            )}
                                            {h > 36 && (
                                                <div className="text-[9px] text-white/30 mt-0.5">
                                                    {fmtTime(isoToKST(e.start_at))} – {e.end_at ? fmtTime(isoToKST(e.end_at)) : ""}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* 루틴 블록 (참고 레이어) */}
                                {routines.filter(r => r.start_time).map(r => {
                                    const s = parseMinutes(r.start_time) ?? 0;
                                    const e = parseMinutes(r.end_time) ?? s + 60;
                                    const h = Math.max((e - s) * PX_PER_MIN, 18);
                                    const meta = catMeta(r.category);
                                    return (
                                        <div
                                            key={r.id}
                                            className="absolute right-2 rounded px-2 py-0.5 overflow-hidden z-10 border border-white/5"
                                            style={{
                                                top: s * PX_PER_MIN,
                                                height: h,
                                                width: 100,
                                                backgroundColor: `${meta?.hex ?? "#6366F1"}15`,
                                            }}
                                        >
                                            <div className="flex items-center gap-1">
                                                <div
                                                    className="h-1.5 w-1.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: meta?.hex ?? "#6366F1" }}
                                                />
                                                <span className="text-[9px] text-white/60 truncate">{r.activity}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── 우측: 시간대 분포 ── */}
                    <div className="w-44 shrink-0 flex flex-col gap-3 overflow-y-auto pl-1">

                        {/* 시간대별 활동 밀도 */}
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider mb-2">시간대 활동</div>
                            {hourlyData.length > 0 ? (
                                <div className="space-y-0.5">
                                    {hourlyData
                                        .filter(h => parseInt(h.key) >= (showDawn ? 0 : 6))
                                        .slice(0, showDawn ? 24 : 18)
                                        .map(h => {
                                            const pct = Math.round((h.total / maxHourly) * 100);
                                            return (
                                                <div key={h.key} className="flex items-center gap-1.5">
                                                    <span className="text-[9px] text-white/30 w-8 shrink-0 text-right">{h.key}:00</span>
                                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-400 rounded-full"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[9px] text-white/30 w-4 shrink-0">{h.total > 0 ? h.total : ""}</span>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="text-[10px] text-white/30">데이터 없음</div>
                            )}
                        </div>

                        {/* 미연결 소스 안내 */}
                        {!calConnected && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-blue-400" />
                                    <span className="text-[10px] font-medium text-blue-300">캘린더 연동</span>
                                </div>
                                <p className="text-[10px] text-blue-200/60 leading-relaxed">
                                    Google Calendar를 연동하면 일정이 자동으로 타임라인에 표시됩니다.
                                </p>
                                <a
                                    href="/myverse/app/settings"
                                    className="mt-2 block text-center text-[10px] text-blue-300 hover:text-blue-200 transition-colors"
                                >
                                    설정에서 연동하기 →
                                </a>
                            </div>
                        )}

                        {/* 데이터 소스 범례 */}
                        <div className="bg-white/5 rounded-xl p-3">
                            <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider mb-2">범례</div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-3 rounded-sm" style={{ backgroundColor: providerColor("google_calendar") }} />
                                    <span className="text-[10px] text-white/50">Google Calendar</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-3 rounded-sm bg-indigo-400/60" />
                                    <span className="text-[10px] text-white/50">오늘 기록</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-2.5 w-2.5 text-emerald-400" />
                                    <span className="text-[10px] text-white/50">GPS 장소</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Camera className="h-2.5 w-2.5 text-amber-400" />
                                    <span className="text-[10px] text-white/50">사진·영상</span>
                                </div>
                            </div>
                        </div>

                        {/* 현재 시각 */}
                        {date === today && (
                            <div className="bg-white/5 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-red-400" />
                                    <div>
                                        <div className="text-[10px] text-white/40">현재 시각</div>
                                        <div className="text-sm font-medium text-white">{nowSlotKST()}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PageShell>
    );
}
