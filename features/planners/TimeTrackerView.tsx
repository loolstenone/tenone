"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Loader2, MapPin, X, Calendar, Clock, Sunrise, Sunset } from "lucide-react";
import { ROUTINE_CATEGORIES as CATEGORIES, categoryMeta as catMeta } from "@/lib/planners/categories";
import { PageShell, PageHeader } from "./PageShell";
import { PermissionGuideModal } from "./PermissionGuideModal";
import type { ActivityBase } from "@/lib/planners/types";

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
};

// 30분 단위 슬롯 전체 (00:00 ~ 23:30)
const ALL_SLOTS: string[] = [];
for (let h = 0; h < 24; h++) {
    ALL_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
    ALL_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

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
    return `${y}년 ${m}월 ${d}일`;
}

function nowSlotKST(): string {
    const kst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    const h = kst.getHours();
    const m = kst.getMinutes() >= 30 ? 30 : 0;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Haversine — 두 좌표 간 거리(미터)
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 좌표가 등록된 거점 반경 안에 있으면 가장 가까운 거점 반환 (기본 150m)
function nearestBase(lat: number, lng: number, bases: ActivityBase[], radius = 150): ActivityBase | null {
    let best: ActivityBase | null = null;
    let bestDist = Infinity;
    for (const b of bases) {
        if (b.lat == null || b.lng == null) continue;
        const d = distanceMeters(lat, lng, b.lat, b.lng);
        if (d <= radius && d < bestDist) {
            best = b;
            bestDist = d;
        }
    }
    return best;
}

// 시작 시각 + 1시간을 디폴트 종료 시각으로
function defaultEndFor(start: string): string {
    const m = parseMinutes(start);
    if (m === null) return "";
    const e = Math.min(m + 60, 23 * 60 + 30);
    return `${String(Math.floor(e / 60)).padStart(2, "0")}:${String(e % 60).padStart(2, "0")}`;
}

// ─── 메인 컴포넌트 ────────────────────────────────────────

export function TimeTrackerView({ initialDate }: { initialDate: string }) {
    const today = todayKST();
    const [date, setDate] = useState(initialDate);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDawn, setShowDawn] = useState(false);

    // 인라인 추가/수정 폼
    const [addingSlot, setAddingSlot] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [inActivity, setInActivity] = useState("");
    const [inStart, setInStart] = useState("");
    const [inEnd, setInEnd] = useState("");
    const [inCat, setInCat] = useState("general");
    const [inNote, setInNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [locLoading, setLocLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [permGuideOpen, setPermGuideOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const nowRef = useRef<HTMLDivElement>(null);
    const nowSlot = date === today ? nowSlotKST() : null;

    // 등록된 활동 거점 (Settings > 활동 거점) — 자동 위치 매칭에 사용
    const [bases, setBases] = useState<ActivityBase[]>([]);
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/planners/settings");
                if (!res.ok) return;
                const json = await res.json();
                const raw = (json.user?.activity_bases ?? []) as ActivityBase[];
                if (Array.isArray(raw)) setBases(raw);
            } catch { /* silent */ }
        })();
    }, []);

    // 데이터 로드
    async function load(d: string) {
        setLoading(true);
        try {
            const res = await fetch(`/api/planners/routines?date=${d}`);
            if (res.ok) {
                const json = await res.json();
                setRoutines(json.routines ?? []);
            } else {
                setErrorMsg("불러오기 실패 — 잠시 후 다시 시도하세요");
            }
        } catch {
            setErrorMsg("네트워크 오류");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(date); }, [date]);

    // 일출/일몰 + 현재 위치명 — 위치 권한 있으면 Open-Meteo + Nominatim 역지오코딩
    const [solar, setSolar] = useState<{ sunrise: string | null; sunset: string | null }>({ sunrise: null, sunset: null });
    const [placeName, setPlaceName] = useState<string | null>(null);
    const [locDenied, setLocDenied] = useState(false);
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude: lat, longitude: lon } = pos.coords;
                // 일출·일몰 (Open-Meteo)
                const solarRes = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto&start_date=${date}&end_date=${date}`
                );
                if (solarRes.ok) {
                    const d = await solarRes.json();
                    const sunrise = d.daily?.sunrise?.[0]?.slice(11, 16) ?? null;
                    const sunset  = d.daily?.sunset?.[0]?.slice(11, 16)  ?? null;
                    setSolar({ sunrise, sunset });
                }
                // 장소명 (Nominatim 역지오코딩) — 도시 + 동/구 정도만
                const placeRes = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko&zoom=14`
                );
                if (placeRes.ok) {
                    const p = await placeRes.json();
                    const a = p.address ?? {};
                    const local = a.suburb ?? a.neighbourhood ?? a.quarter ?? a.borough ?? a.city_district;
                    const city = a.city ?? a.town ?? a.county ?? a.state;
                    const label = local && city ? `${city} ${local}` : local ?? city ?? null;
                    setPlaceName(label);
                }
            } catch { /* silent */ }
        }, () => { setLocDenied(true); }, { timeout: 8000, maximumAge: 60 * 60 * 1000 });
    }, [date]);

    // 오늘이면 현재 시각 슬롯으로 스크롤
    useEffect(() => {
        if (!loading && nowRef.current) {
            setTimeout(() => nowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
        }
    }, [loading]);

    // 현재 위치 자동 입력 (Nominatim 역지오코딩)
    async function autoLocation() {
        if (!navigator.geolocation) {
            setErrorMsg("이 브라우저는 위치 정보를 지원하지 않습니다");
            return;
        }
        setLocLoading(true);
        setErrorMsg(null);
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
            );
            const { latitude: lat, longitude: lon } = pos.coords;

            // 1) 등록된 거점이 가까이 있으면 거점 이름을 활동 라벨로 사용
            const matched = nearestBase(lat, lon, bases);
            if (matched) {
                setInActivity(prev => prev || matched.name);
                if (matched.address) setInNote(prev => prev || matched.address!);
                return;
            }

            // 2) 거점 매칭 실패 시 Nominatim 역지오코딩 사용 (기존 로직)
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko`
            );
            if (res.ok) {
                const data = await res.json();
                const a = data.address ?? {};
                const road = a.road ?? a.pedestrian ?? a.footway ?? "";
                const num  = a.house_number ?? "";
                const sub  = a.neighbourhood ?? a.suburb ?? a.quarter ?? "";
                const city = a.city ?? a.town ?? a.county ?? "";
                const label = [road, num].filter(Boolean).join(" ") || sub || city;
                const detail = (city && road) ? `${city} ${road}`.trim() : "";
                if (label) setInActivity(prev => prev || label);
                if (detail) setInNote(prev => prev || detail);
                if (!label && !detail) setErrorMsg("위치를 찾지 못했습니다");
            } else {
                setErrorMsg("위치 조회 실패");
            }
        } catch (e: unknown) {
            const err = e as GeolocationPositionError | Error;
            if ("code" in err && err.code === 1) {
                // 권한 거부 — 정적 메시지 대신 복구 가이드 모달 띄움
                setPermGuideOpen(true);
            } else if ("code" in err && err.code === 3) {
                setErrorMsg("위치 조회 시간 초과");
            } else {
                setErrorMsg("위치 조회 오류");
            }
        } finally {
            setLocLoading(false);
        }
    }

    function openSlot(time: string) {
        setEditingId(null);
        setAddingSlot(time);
        setInActivity("");
        setInStart(time);
        setInEnd(defaultEndFor(time));
        setInCat("general");
        setInNote("");
        setErrorMsg(null);
        setTimeout(() => inputRef.current?.focus(), 60);
    }

    function openEdit(r: Routine) {
        setAddingSlot(null);
        setEditingId(r.id);
        setInActivity(r.activity);
        setInStart(fmtTime(r.start_time) || "");
        setInEnd(fmtTime(r.end_time) || (r.start_time ? defaultEndFor(fmtTime(r.start_time)) : ""));
        setInCat(r.category);
        setInNote(r.note ?? "");
        setErrorMsg(null);
        setTimeout(() => inputRef.current?.focus(), 60);
    }

    function closeForm() {
        setAddingSlot(null);
        setEditingId(null);
        setInActivity("");
        setInNote("");
        setErrorMsg(null);
    }

    function sortRoutines(arr: Routine[]): Routine[] {
        return [...arr].sort((a, b) => {
            if (!a.start_time) return 1;
            if (!b.start_time) return -1;
            return a.start_time.localeCompare(b.start_time);
        });
    }

    function validateTimes(): string | null {
        if (!inStart) return null; // start 없으면 종일 항목으로 허용
        if (inEnd) {
            const s = parseMinutes(inStart);
            const e = parseMinutes(inEnd);
            if (s !== null && e !== null && e <= s) return "종료 시각은 시작보다 늦어야 합니다";
        }
        return null;
    }

    async function submitForm() {
        if (!inActivity.trim()) return;
        const err = validateTimes();
        if (err) { setErrorMsg(err); return; }

        setSaving(true);
        setErrorMsg(null);
        try {
            const body = {
                date,
                activity: inActivity.trim(),
                start_time: inStart || null,
                end_time: inEnd || null,
                category: inCat,
                note: inNote.trim() || null,
                level: 3,
            };

            if (editingId) {
                const res = await fetch(`/api/planners/routines?id=${editingId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                if (res.ok) {
                    const json = await res.json();
                    setRoutines(prev => sortRoutines(prev.map(r => r.id === editingId ? json.routine : r)));
                    closeForm();
                } else {
                    setErrorMsg("저장 실패");
                }
            } else {
                const res = await fetch("/api/planners/routines", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                if (res.ok) {
                    const json = await res.json();
                    setRoutines(prev => sortRoutines([...prev, json.routine]));
                    closeForm();
                } else {
                    setErrorMsg("저장 실패");
                }
            }
        } catch {
            setErrorMsg("네트워크 오류");
        } finally {
            setSaving(false);
        }
    }

    async function deleteEntry(id: string) {
        const res = await fetch(`/api/planners/routines?id=${id}`, { method: "DELETE" });
        if (res.ok) setRoutines(prev => prev.filter(r => r.id !== id));
        else setErrorMsg("삭제 실패");
    }

    // 표시할 슬롯: 기본 6시 이후, 토글하면 새벽 포함
    const slots = showDawn
        ? ALL_SLOTS
        : ALL_SLOTS.filter(s => parseInt(s.split(":")[0]) >= 6);

    // 24h 바 계산
    const timedRoutines = routines.filter(r => r.start_time);
    const catTotals: Record<string, number> = {};
    for (const r of timedRoutines) {
        const s = parseMinutes(r.start_time);
        const e = parseMinutes(r.end_time);
        if (s !== null && e !== null && e > s)
            catTotals[r.category] = (catTotals[r.category] ?? 0) + (e - s);
    }
    const totalTracked = Object.values(catTotals).reduce((a, b) => a + b, 0);
    const catSorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

    // 추가 통계 — 시간대별 분포 / 활동 top / 종료 미입력 카운트
    const PERIODS = [
        { key: "morning",   label: "오전",   range: [6 * 60, 12 * 60] as [number, number] },
        { key: "afternoon", label: "오후",   range: [12 * 60, 18 * 60] as [number, number] },
        { key: "evening",   label: "저녁",   range: [18 * 60, 22 * 60] as [number, number] },
        { key: "night",     label: "심야",   range: [22 * 60, 24 * 60 + 6 * 60] as [number, number] },
    ];
    const periodTotals: Record<string, number> = {};
    for (const r of timedRoutines) {
        const s = parseMinutes(r.start_time);
        const e = parseMinutes(r.end_time);
        if (s === null || e === null || e <= s) continue;
        for (const p of PERIODS) {
            const overlap = Math.max(0, Math.min(e, p.range[1]) - Math.max(s, p.range[0]));
            if (overlap > 0) periodTotals[p.key] = (periodTotals[p.key] ?? 0) + overlap;
        }
    }

    // 활동 빈도 Top 5
    const activityCount: Record<string, number> = {};
    for (const r of routines) activityCount[r.activity] = (activityCount[r.activity] ?? 0) + 1;
    const activityTop = Object.entries(activityCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const incompleteCount = routines.filter(r => r.start_time && !r.end_time).length;
    const totalEntries = routines.length;
    const completionPct = totalEntries > 0 ? Math.round(((totalEntries - incompleteCount) / totalEntries) * 100) : 0;

    return (
        <PageShell>
            <PageHeader
                icon={<Clock className="h-6 w-6" />}
                title={fmtHeader(date)}
                state={date === today ? "today" : null}
                onPrev={() => setDate(d => shiftDate(d, -1))}
                onNext={() => setDate(d => shiftDate(d, 1))}
                right={
                    date !== today ? (
                        <button
                            onClick={() => setDate(today)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-[#0F766E] hover:bg-[#0F766E]/5 transition-colors"
                            title="오늘로 이동"
                            aria-label="오늘로 이동"
                        >
                            <Calendar className="h-4 w-4" />
                        </button>
                    ) : undefined
                }
            />

            {/* 오류 토스트 — 3열 위 공통 */}
            {errorMsg && (
                <div className="mt-3 max-w-lg mx-auto bg-rose-50 planners-dark:bg-rose-900/20 border border-rose-200 planners-dark:border-rose-800 rounded-lg px-3 py-2 text-xs text-rose-700 planners-dark:text-rose-300 flex items-center gap-2">
                    <span className="flex-1">{errorMsg}</span>
                    <button onClick={() => setErrorMsg(null)} className="p-0.5 hover:bg-rose-100 planners-dark:hover:bg-rose-900/30 rounded"><X className="h-3 w-3" /></button>
                </div>
            )}

            {/* 컨텍스트 스트립 — 장소·일출·일몰·현재시각. 모바일·데스크톱 공통 노출 */}
            {(placeName || solar.sunrise || solar.sunset || nowSlot || locDenied) && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                    {placeName && (
                        <span className="inline-flex items-center gap-1.5 text-neutral-700 planners-dark:text-neutral-200">
                            <MapPin className="h-3.5 w-3.5 text-[#0F766E]" />
                            <span className="font-medium">{placeName}</span>
                        </span>
                    )}
                    {solar.sunrise && (
                        <span className="inline-flex items-center gap-1.5 text-neutral-600 planners-dark:text-neutral-300">
                            <Sunrise className="h-3.5 w-3.5 text-amber-400" />
                            <span className="font-mono tabular-nums">{solar.sunrise}</span>
                        </span>
                    )}
                    {solar.sunset && (
                        <span className="inline-flex items-center gap-1.5 text-neutral-600 planners-dark:text-neutral-300">
                            <Sunset className="h-3.5 w-3.5 text-orange-400" />
                            <span className="font-mono tabular-nums">{solar.sunset}</span>
                        </span>
                    )}
                    {date === today && nowSlot && (
                        <span className="inline-flex items-center gap-1.5 text-neutral-600 planners-dark:text-neutral-300 ml-auto">
                            <Clock className="h-3.5 w-3.5 text-neutral-400" />
                            <span className="font-mono tabular-nums">{nowSlot}</span>
                        </span>
                    )}
                    {locDenied && !placeName && (
                        <button
                            onClick={() => setPermGuideOpen(true)}
                            className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-[#0F766E] transition-colors"
                        >
                            <MapPin className="h-3 w-3" />
                            위치 허용 시 장소·일출·일몰 자동 표시
                        </button>
                    )}
                </div>
            )}

            {/* 3열 레이아웃 — 좌(통계) · 중(타임라인) · 우(분석) */}
            <div className="mt-4 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:gap-6 lg:items-start">

                {/* ── 좌 사이드 — 카테고리·기록 요약 ─────────────── */}
                <aside className="hidden lg:flex flex-col gap-4 sticky top-4">
                    <section className="bg-white planners-dark:bg-[#1C1C1C] border border-neutral-100 planners-dark:border-[#2A2A2A] rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5">카테고리</p>
                        {catSorted.length > 0 ? (
                            <div className="space-y-1.5">
                                {catSorted.map(([key, mins]) => {
                                    const pct = totalTracked > 0 ? (mins / totalTracked) * 100 : 0;
                                    return (
                                        <div key={key} className="text-xs">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <span className="flex items-center gap-1.5 text-neutral-600 planners-dark:text-neutral-300 truncate">
                                                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: catMeta(key).hex }} />
                                                    {catMeta(key).label}
                                                </span>
                                                <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">{fmtMinutes(mins)}</span>
                                            </div>
                                            <div className="h-1 bg-neutral-100 planners-dark:bg-[#252525] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: catMeta(key).hex }} />
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-100 planners-dark:border-[#2A2A2A] text-[11px] text-neutral-500">
                                    <span>총 활성</span>
                                    <span className="tabular-nums font-medium">{fmtMinutes(totalTracked)}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-[11px] text-neutral-300 italic leading-relaxed">
                                종료 시각을 입력하면 카테고리별 시간이 합산됩니다.
                            </p>
                        )}
                    </section>

                    <section className="bg-white planners-dark:bg-[#1C1C1C] border border-neutral-100 planners-dark:border-[#2A2A2A] rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5">기록 요약</p>
                        <div className="space-y-2 text-xs text-neutral-600 planners-dark:text-neutral-300">
                            <div className="flex items-center justify-between">
                                <span>총 항목</span>
                                <span className="tabular-nums font-medium">{totalEntries}건</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>완료 입력</span>
                                <span className="tabular-nums font-medium">{completionPct}%</span>
                            </div>
                            {incompleteCount > 0 && (
                                <div className="flex items-center justify-between text-amber-600 planners-dark:text-amber-400">
                                    <span>종료 미입력</span>
                                    <span className="tabular-nums font-medium">{incompleteCount}건</span>
                                </div>
                            )}
                        </div>
                    </section>
                </aside>

                {/* ── 중앙 — 24h 바 + 세로 타임라인 ─────────────── */}
                <div className="max-w-lg mx-auto lg:mx-0 lg:max-w-none w-full">

                {/* ── 24h 미니 바 ──────────────────────── */}
                <section className="bg-white planners-dark:bg-[#1C1C1C] border border-neutral-100 planners-dark:border-[#2A2A2A] rounded-xl p-4 mt-4">
                    <div className="flex items-center justify-between mb-2.5">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400">24시간 타임라인</p>
                        {totalTracked > 0 && (
                            <p className="text-[10px] text-neutral-400 tabular-nums">
                                기록 <span className="text-neutral-600 planners-dark:text-neutral-200 font-medium">{fmtMinutes(totalTracked)}</span>
                                <span className="ml-1 text-neutral-300">· {Math.round((totalTracked / 1440) * 100)}%/일</span>
                            </p>
                        )}
                    </div>
                    <div className="relative">
                        {/* 3시간 단위 가이드 라인 */}
                        <div className="absolute inset-0 h-9 pointer-events-none">
                            {[3, 6, 9, 12, 15, 18, 21].map(h => (
                                <div key={h} className="absolute top-0 h-full w-px bg-neutral-200/40 planners-dark:bg-white/[0.04]" style={{ left: `${(h / 24) * 100}%` }} />
                            ))}
                        </div>
                        <div className="h-9 bg-neutral-100 planners-dark:bg-[#252525] rounded-lg overflow-hidden relative">
                            {timedRoutines.map(r => {
                                const s = parseMinutes(r.start_time);
                                const e = parseMinutes(r.end_time);
                                if (s === null) return null;
                                const left  = (s / 1440) * 100;
                                const width = e !== null && e > s ? ((e - s) / 1440) * 100 : 0.7;
                                const isWide = width >= 4; // 약 1시간 이상이면 라벨 표시
                                return (
                                    <div
                                        key={r.id}
                                        className="absolute top-0 h-full opacity-90 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center overflow-hidden px-1"
                                        style={{ left: `${left}%`, width: `${Math.max(width, 0.7)}%`, backgroundColor: catMeta(r.category).hex }}
                                        title={`${r.activity} ${fmtTime(r.start_time)}${r.end_time ? `–${fmtTime(r.end_time)}` : ""}`}
                                        onClick={() => openEdit(r)}
                                    >
                                        {isWide && (
                                            <span className="text-[9px] font-medium text-white/95 truncate leading-tight drop-shadow-sm">
                                                {r.activity}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                            {/* 현재 시각 마커 */}
                            {date === today && (() => {
                                const m = parseMinutes(nowSlotKST());
                                if (m === null) return null;
                                return (
                                    <div className="absolute top-0 h-full z-10" style={{ left: `${(m / 1440) * 100}%` }}>
                                        <div className="w-0.5 h-full bg-rose-500" />
                                        <div className="absolute -top-1 -left-[3px] w-2 h-2 rounded-full bg-rose-500 shadow-sm" />
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="flex justify-between mt-1">
                            {[0, 3, 6, 9, 12, 15, 18, 21].map(h => (
                                <span key={h} className="text-[9px] text-neutral-300 tabular-nums">{h}시</span>
                            ))}
                        </div>
                    </div>
                    {/* 카테고리 범례 — 항상 표시 (액션 색상 매핑) */}
                    {catSorted.length > 0 ? (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-neutral-100 planners-dark:border-[#2A2A2A] items-center">
                            {catSorted.map(([key, mins]) => {
                                const pct = totalTracked > 0 ? Math.round((mins / totalTracked) * 100) : 0;
                                return (
                                    <span key={key} className="flex items-center gap-1.5 text-[10px] text-neutral-500 planners-dark:text-neutral-400">
                                        <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: catMeta(key).hex }} />
                                        <span className="text-neutral-700 planners-dark:text-neutral-200">{catMeta(key).label}</span>
                                        <span className="tabular-nums">{fmtMinutes(mins)}</span>
                                        <span className="text-neutral-300">{pct}%</span>
                                    </span>
                                );
                            })}
                        </div>
                    ) : timedRoutines.length > 0 && (
                        <p className="text-[10px] text-neutral-300 mt-2.5">
                            종료 시각을 입력하면 시간이 합산됩니다
                        </p>
                    )}
                </section>

                {/* ── 세로 타임라인 ────────────────────── */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-5 w-5 animate-spin text-neutral-200" />
                    </div>
                ) : (
                    <div className="relative mt-4">
                        {/* 세로 연결선 */}
                        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-neutral-200 planners-dark:bg-[#2A2A2A]" />

                        {/* 새벽 시간대 토글 */}
                        {!showDawn && (
                            <button
                                onClick={() => setShowDawn(true)}
                                className="w-full text-[10px] text-neutral-300 hover:text-neutral-500 planners-dark:hover:text-neutral-400 py-2 text-center transition-colors"
                            >
                                ↑ 새벽 (0–5시) 보기
                            </button>
                        )}

                        {slots.map(slot => {
                            const items = routines.filter(r => r.start_time?.slice(0, 5) === slot);
                            const isNow    = slot === nowSlot;
                            const isAdding = addingSlot === slot;
                            const hasContent = items.length > 0 || isAdding;
                            const meta = items.length > 0 ? catMeta(items[0].category) : null;

                            return (
                                <div
                                    key={slot}
                                    ref={isNow ? nowRef : undefined}
                                    className={`flex items-start gap-0 group ${hasContent ? "py-3" : "py-[5px]"}`}
                                >
                                    {/* ○ 원형 마커 */}
                                    <div
                                        className={`relative z-10 shrink-0 mt-[3px] w-[15px] h-[15px] rounded-full border-2 transition-colors ${
                                            items.length > 0
                                                ? "border-transparent"
                                                : isNow
                                                    ? "border-neutral-500 bg-neutral-200 planners-dark:bg-[#444]"
                                                    : "border-neutral-300 bg-white planners-dark:bg-[#111]"
                                        }`}
                                        style={meta ? { backgroundColor: meta.hex, borderColor: meta.hex } : undefined}
                                    />

                                    {/* 시간 라벨 */}
                                    <span className={`ml-3 w-10 text-[11px] shrink-0 mt-0.5 tabular-nums ${
                                        isNow
                                            ? "text-[#0F766E] planners-dark:text-[#5EEAD4] font-semibold"
                                            : items.length > 0
                                                ? "text-neutral-600 planners-dark:text-neutral-200 font-medium"
                                                : "text-neutral-400 planners-dark:text-neutral-500"
                                    }`}>
                                        {slot}
                                    </span>

                                    {/* 콘텐츠 영역 */}
                                    <div className="flex-1 min-w-0 ml-3">
                                        {isAdding && !editingId ? (
                                            <InlineForm
                                                inputRef={inputRef}
                                                activity={inActivity} setActivity={setInActivity}
                                                start={inStart} setStart={setInStart}
                                                end={inEnd} setEnd={setInEnd}
                                                cat={inCat} setCat={setInCat}
                                                note={inNote} setNote={setInNote}
                                                saving={saving} locLoading={locLoading}
                                                isEdit={false}
                                                onSave={submitForm}
                                                onCancel={closeForm}
                                                onLocation={autoLocation}
                                                bases={bases}
                                            />
                                        ) : items.length > 0 ? (
                                            <div className="space-y-2">
                                                {items.map(r => (
                                                    editingId === r.id ? (
                                                        <InlineForm
                                                            key={r.id}
                                                            inputRef={inputRef}
                                                            activity={inActivity} setActivity={setInActivity}
                                                            start={inStart} setStart={setInStart}
                                                            end={inEnd} setEnd={setInEnd}
                                                            cat={inCat} setCat={setInCat}
                                                            note={inNote} setNote={setInNote}
                                                            saving={saving} locLoading={locLoading}
                                                            isEdit={true}
                                                            onSave={submitForm}
                                                            onCancel={closeForm}
                                                            onLocation={autoLocation}
                                                            bases={bases}
                                                        />
                                                    ) : (
                                                        <div key={r.id} className="group/row flex items-start justify-between gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEdit(r)}
                                                                className="text-left min-w-0 flex-1 hover:bg-neutral-50 planners-dark:hover:bg-[#1A1A1A] rounded -mx-1 px-1 py-0.5 transition-colors"
                                                            >
                                                                <p className="text-sm text-neutral-800 planners-dark:text-neutral-200 leading-snug">
                                                                    {r.activity}
                                                                </p>
                                                                {r.note && (
                                                                    <p className="text-[11px] text-neutral-400 mt-0.5">{r.note}</p>
                                                                )}
                                                                <span className="text-[9px] text-neutral-300 uppercase tracking-wide">
                                                                    {catMeta(r.category).label}
                                                                    {r.end_time ? ` · ${fmtTime(r.start_time)}–${fmtTime(r.end_time)}` : ` · ${fmtTime(r.start_time)} (종료 미입력)`}
                                                                </span>
                                                            </button>
                                                            <button
                                                                onClick={() => deleteEntry(r.id)}
                                                                className="p-1.5 text-neutral-300 hover:text-rose-400 transition-colors shrink-0 mt-0.5"
                                                                aria-label="삭제"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    )
                                                ))}
                                                {/* 이 슬롯에 항목 추가 — 항상 표시 (일관성) */}
                                                <button
                                                    onClick={() => openSlot(slot)}
                                                    className="flex items-center gap-1 text-[10px] text-neutral-300 hover:text-[#0F766E] transition-colors"
                                                >
                                                    <Plus className="h-3 w-3" /> 추가
                                                </button>
                                            </div>
                                        ) : (
                                            /* 빈 슬롯: 항상 표시 (일관성) */
                                            <button
                                                onClick={() => openSlot(slot)}
                                                className="inline-flex items-center gap-1 text-neutral-300 hover:text-[#0F766E] transition-colors py-1 pr-3 -my-1"
                                                aria-label={`${slot} 시간 추가`}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                <span className="text-[10px]">추가</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* 데이터 없을 때 안내 */}
                        {routines.length === 0 && !addingSlot && (
                            <div className="text-center py-12">
                                <p className="text-xs text-neutral-300 italic mb-3">
                                    오늘의 시간 사용을 기록하세요
                                </p>
                                <button
                                    onClick={() => openSlot(nowSlot ?? "09:00")}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#0F766E]/10 text-[#0F766E] hover:bg-[#0F766E]/15 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    첫 시간 추가
                                </button>
                            </div>
                        )}
                    </div>
                )}
                </div>{/* /center column */}

                {/* ── 우 사이드 — 시간대 분포 + 활동 Top ─────────── */}
                <aside className="hidden lg:flex flex-col gap-4 sticky top-4">
                    <section className="bg-white planners-dark:bg-[#1C1C1C] border border-neutral-100 planners-dark:border-[#2A2A2A] rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5">시간대 분포</p>
                        {Object.keys(periodTotals).length > 0 ? (
                            <div className="space-y-1.5">
                                {PERIODS.map(p => {
                                    const mins = periodTotals[p.key] ?? 0;
                                    const pct = totalTracked > 0 ? (mins / totalTracked) * 100 : 0;
                                    if (mins === 0) return null;
                                    return (
                                        <div key={p.key} className="text-xs">
                                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                                <span className="text-neutral-600 planners-dark:text-neutral-300">{p.label}</span>
                                                <span className="text-[10px] text-neutral-400 tabular-nums shrink-0">{fmtMinutes(mins)}</span>
                                            </div>
                                            <div className="h-1 bg-neutral-100 planners-dark:bg-[#252525] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full bg-[#0F766E]" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-[11px] text-neutral-300 italic leading-relaxed">
                                기록을 추가하면 오전/오후/저녁/심야 분포가 표시됩니다.
                            </p>
                        )}
                    </section>

                    <section className="bg-white planners-dark:bg-[#1C1C1C] border border-neutral-100 planners-dark:border-[#2A2A2A] rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5">활동 Top</p>
                        {activityTop.length > 0 ? (
                            <ol className="space-y-1.5">
                                {activityTop.map(([name, count], i) => (
                                    <li key={name} className="flex items-center gap-2 text-xs">
                                        <span className="text-[10px] text-neutral-300 w-3 shrink-0 tabular-nums">{i + 1}</span>
                                        <span className="text-neutral-700 planners-dark:text-neutral-200 flex-1 truncate">{name}</span>
                                        {count > 1 && <span className="text-[10px] text-neutral-400 shrink-0">×{count}</span>}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-[11px] text-neutral-300 italic leading-relaxed">
                                오늘의 활동이 없습니다.
                            </p>
                        )}
                    </section>

                    {date === today && (
                        <section className="bg-white planners-dark:bg-[#1C1C1C] border border-neutral-100 planners-dark:border-[#2A2A2A] rounded-xl p-4">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1.5">현재 시각</p>
                            <p className="font-mono text-2xl text-neutral-800 planners-dark:text-neutral-100 tabular-nums">
                                {nowSlot ?? "—"}
                            </p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">KST · 30분 단위</p>
                        </section>
                    )}

                    {(solar.sunrise || solar.sunset) && (
                        <section className="bg-white planners-dark:bg-[#1C1C1C] border border-neutral-100 planners-dark:border-[#2A2A2A] rounded-xl p-4">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5">일출 · 일몰</p>
                            <div className="space-y-1.5 text-xs">
                                {solar.sunrise && (
                                    <div className="flex items-center justify-between text-neutral-600 planners-dark:text-neutral-300">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Sunrise className="h-3.5 w-3.5 text-amber-400" />
                                            일출
                                        </span>
                                        <span className="font-mono tabular-nums">{solar.sunrise}</span>
                                    </div>
                                )}
                                {solar.sunset && (
                                    <div className="flex items-center justify-between text-neutral-600 planners-dark:text-neutral-300">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Sunset className="h-3.5 w-3.5 text-orange-400" />
                                            일몰
                                        </span>
                                        <span className="font-mono tabular-nums">{solar.sunset}</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </aside>

            </div>{/* /3-col grid */}

            {/* 위치 권한 복구 가이드 — 거부된 권한을 사용자가 다시 켤 수 있도록 단계 안내 */}
            <PermissionGuideModal
                open={permGuideOpen}
                onClose={() => setPermGuideOpen(false)}
                permission="geolocation"
                onRetry={async () => { await autoLocation(); }}
                onGranted={() => { void autoLocation(); }}
            />
        </PageShell>
    );
}

// ─── 인라인 추가/수정 폼 ───────────────────────────────────────

function InlineForm({
    inputRef, activity, setActivity, start, setStart, end, setEnd,
    cat, setCat, note, setNote,
    saving, locLoading, isEdit, onSave, onCancel, onLocation,
    bases,
}: {
    inputRef: React.RefObject<HTMLInputElement | null>;
    activity: string; setActivity: (v: string) => void;
    start: string; setStart: (v: string) => void;
    end: string; setEnd: (v: string) => void;
    cat: string; setCat: (v: string) => void;
    note: string; setNote: (v: string) => void;
    saving: boolean; locLoading: boolean; isEdit: boolean;
    onSave: () => void; onCancel: () => void; onLocation: () => void;
    bases: ActivityBase[];
}) {
    return (
        <div className="bg-neutral-50 planners-dark:bg-[#1C1C1C] border border-neutral-200 planners-dark:border-[#333] rounded-xl p-3 space-y-2.5">
            {/* 활동 입력 + 위치 자동 버튼 */}
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={activity}
                    onChange={e => setActivity(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel(); }}
                    placeholder="무엇을 했나요? (또는 위치)"
                    className="flex-1 text-sm bg-transparent text-neutral-800 planners-dark:text-neutral-100 placeholder:text-neutral-300 focus:outline-none min-w-0"
                />
                <button
                    type="button"
                    onClick={onLocation}
                    disabled={locLoading}
                    title="현재 위치 자동 입력"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-[#0F766E] hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] transition-colors disabled:opacity-40"
                >
                    {locLoading
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <MapPin className="h-3.5 w-3.5" />
                    }
                </button>
            </div>

            {/* 등록된 거점 빠른 선택 — Settings에서 등록한 거점 한 번에 채움 */}
            {bases.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {bases.map(b => (
                        <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                                setActivity(b.name);
                                if (b.address) setNote(b.address);
                            }}
                            className="px-2 py-0.5 text-[10px] rounded-full bg-neutral-100 planners-dark:bg-[#2A2A2A] text-neutral-600 planners-dark:text-neutral-300 hover:bg-[#0F766E]/10 hover:text-[#0F766E] transition-colors"
                            title={b.address ?? b.name}
                        >
                            {b.name}
                        </button>
                    ))}
                </div>
            )}

            {/* 시작/종료 시각 — 30분 단위로 보정해도 자유 입력 가능 */}
            <div className="flex items-center gap-2">
                <label className="text-[10px] text-neutral-400 uppercase tracking-wide w-8 shrink-0">시작</label>
                <input
                    type="time"
                    value={start}
                    onChange={e => setStart(e.target.value)}
                    step={1800}
                    className="text-xs bg-white planners-dark:bg-[#111] border border-neutral-200 planners-dark:border-[#333] rounded px-2 py-1 text-neutral-700 planners-dark:text-neutral-200 focus:outline-none focus:border-[#0F766E]"
                />
                <label className="text-[10px] text-neutral-400 uppercase tracking-wide w-8 shrink-0 ml-2">종료</label>
                <input
                    type="time"
                    value={end}
                    onChange={e => setEnd(e.target.value)}
                    step={1800}
                    className="text-xs bg-white planners-dark:bg-[#111] border border-neutral-200 planners-dark:border-[#333] rounded px-2 py-1 text-neutral-700 planners-dark:text-neutral-200 focus:outline-none focus:border-[#0F766E]"
                />
            </div>

            {/* 상세 메모 / 위치 */}
            <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="상세 위치 또는 메모 (선택)"
                className="w-full text-xs bg-transparent text-neutral-500 planners-dark:text-neutral-400 placeholder:text-neutral-300 focus:outline-none"
            />

            {/* 카테고리 */}
            <div className="flex flex-wrap gap-1">
                {CATEGORIES.map(c => (
                    <button
                        key={c.key}
                        type="button"
                        onClick={() => setCat(c.key)}
                        className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                            cat === c.key
                                ? "text-white"
                                : "bg-neutral-200 planners-dark:bg-[#2A2A2A] text-neutral-500 hover:bg-neutral-300"
                        }`}
                        style={cat === c.key ? { backgroundColor: c.hex } : undefined}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {/* 저장/취소 */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving || !activity.trim()}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0F766E] text-white disabled:opacity-40 hover:bg-[#0d5e56] transition-colors"
                >
                    {saving ? "저장…" : isEdit ? "수정" : "추가"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] transition-colors"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
