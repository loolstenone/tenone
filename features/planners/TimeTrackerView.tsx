"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Loader2, MapPin, X, Calendar } from "lucide-react";
import { ROUTINE_CATEGORIES as CATEGORIES, categoryMeta as catMeta } from "@/lib/planners/categories";

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

    const inputRef = useRef<HTMLInputElement>(null);
    const nowRef = useRef<HTMLDivElement>(null);
    const nowSlot = date === today ? nowSlotKST() : null;

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
            if ("code" in err && err.code === 1) setErrorMsg("위치 권한이 거부되었습니다");
            else if ("code" in err && err.code === 3) setErrorMsg("위치 조회 시간 초과");
            else setErrorMsg("위치 조회 오류");
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

    return (
        <div className="flex flex-col min-h-screen bg-white planners-dark:bg-[#111]">

            {/* ── 헤더 ─────────────────────────────────── */}
            <div className="sticky top-0 z-20 bg-white/95 planners-dark:bg-[#111]/95 backdrop-blur border-b border-neutral-100 planners-dark:border-[#2A2A2A] px-4 py-3">
                <div className="flex items-center gap-2 max-w-lg mx-auto">
                    <button
                        onClick={() => setDate(d => shiftDate(d, -1))}
                        className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] transition-colors"
                        aria-label="이전 날"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold text-neutral-900 planners-dark:text-neutral-100 truncate">
                            {fmtHeader(date)}
                        </h1>
                        {date === today && (
                            <span className="text-[10px] text-[#0F766E] font-medium uppercase tracking-wide">Today</span>
                        )}
                    </div>
                    <button
                        onClick={() => setDate(d => shiftDate(d, 1))}
                        className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 planners-dark:hover:bg-[#2A2A2A] transition-colors"
                        aria-label="다음 날"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    {date !== today && (
                        <button
                            onClick={() => setDate(today)}
                            className="px-2 py-1.5 rounded-lg text-[11px] font-medium text-neutral-500 hover:text-[#0F766E] hover:bg-[#0F766E]/5 transition-colors"
                            title="오늘로 이동"
                        >
                            <Calendar className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        onClick={() => openSlot(nowSlot ?? "09:00")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#0F766E] text-white hover:bg-[#0d5e56] transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        시간 추가
                    </button>
                </div>
            </div>

            <div className="flex-1 px-4 pb-24 max-w-lg w-full mx-auto">

                {/* 오류 토스트 */}
                {errorMsg && (
                    <div className="mt-3 bg-rose-50 planners-dark:bg-rose-900/20 border border-rose-200 planners-dark:border-rose-800 rounded-lg px-3 py-2 text-xs text-rose-700 planners-dark:text-rose-300 flex items-center gap-2">
                        <span className="flex-1">{errorMsg}</span>
                        <button onClick={() => setErrorMsg(null)} className="p-0.5 hover:bg-rose-100 planners-dark:hover:bg-rose-900/30 rounded"><X className="h-3 w-3" /></button>
                    </div>
                )}

                {/* ── 24h 미니 바 ──────────────────────── */}
                <section className="bg-white planners-dark:bg-[#1C1C1C] border border-neutral-100 planners-dark:border-[#2A2A2A] rounded-xl p-4 mt-4">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2.5">24시간 타임라인</p>
                    <div className="relative">
                        <div className="h-5 bg-neutral-100 planners-dark:bg-[#252525] rounded-lg overflow-hidden">
                            {timedRoutines.map(r => {
                                const s = parseMinutes(r.start_time);
                                const e = parseMinutes(r.end_time);
                                if (s === null) return null;
                                const left  = (s / 1440) * 100;
                                const width = e !== null && e > s ? ((e - s) / 1440) * 100 : 0.7;
                                return (
                                    <div
                                        key={r.id}
                                        className="absolute top-0 h-full opacity-80 hover:opacity-100 transition-opacity rounded-sm cursor-pointer"
                                        style={{ left: `${left}%`, width: `${Math.max(width, 0.7)}%`, backgroundColor: catMeta(r.category).hex }}
                                        title={`${r.activity} ${fmtTime(r.start_time)}${r.end_time ? `–${fmtTime(r.end_time)}` : ""}`}
                                        onClick={() => openEdit(r)}
                                    />
                                );
                            })}
                            {/* 현재 시각 마커 */}
                            {date === today && (() => {
                                const m = parseMinutes(nowSlotKST());
                                if (m === null) return null;
                                return (
                                    <div className="absolute top-0 h-full z-10 flex flex-col items-center" style={{ left: `${(m / 1440) * 100}%` }}>
                                        <div className="w-px h-full bg-neutral-600/40" />
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="flex justify-between mt-1">
                            {[0, 3, 6, 9, 12, 15, 18, 21].map(h => (
                                <span key={h} className="text-[9px] text-neutral-300">{h}시</span>
                            ))}
                        </div>
                    </div>
                    {catSorted.length > 0 ? (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 items-center">
                            {catSorted.map(([key, mins]) => (
                                <span key={key} className="flex items-center gap-1 text-[10px] text-neutral-400">
                                    <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: catMeta(key).hex }} />
                                    {catMeta(key).label} {fmtMinutes(mins)}
                                </span>
                            ))}
                            <span className="text-[10px] text-neutral-300 ml-auto">총 {fmtMinutes(totalTracked)}</span>
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
                                            ? "text-[#0F766E] font-semibold"
                                            : items.length > 0
                                                ? "text-neutral-600 planners-dark:text-neutral-300 font-medium"
                                                : "text-neutral-300 planners-dark:text-neutral-600"
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
                                                                className="md:opacity-0 md:group-hover/row:opacity-100 p-1.5 text-neutral-300 hover:text-rose-400 transition-all shrink-0 mt-0.5"
                                                                aria-label="삭제"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    )
                                                ))}
                                                {/* 이 슬롯에 항목 추가 — 모바일은 항상 보임, 데스크톱은 hover */}
                                                <button
                                                    onClick={() => openSlot(slot)}
                                                    className="md:opacity-0 md:group-hover:opacity-100 flex items-center gap-1 text-[10px] text-neutral-400 hover:text-[#0F766E] transition-all"
                                                >
                                                    <Plus className="h-3 w-3" /> 추가
                                                </button>
                                            </div>
                                        ) : (
                                            /* 빈 슬롯: 모바일 항상 + 표시, 데스크톱 hover */
                                            <button
                                                onClick={() => openSlot(slot)}
                                                className="md:opacity-0 md:group-hover:opacity-100 inline-flex items-center gap-1 text-neutral-300 hover:text-[#0F766E] transition-all py-1 pr-3 -my-1"
                                                aria-label={`${slot} 시간 추가`}
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                <span className="md:hidden text-[10px]">추가</span>
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
            </div>
        </div>
    );
}

// ─── 인라인 추가/수정 폼 ───────────────────────────────────────

function InlineForm({
    inputRef, activity, setActivity, start, setStart, end, setEnd,
    cat, setCat, note, setNote,
    saving, locLoading, isEdit, onSave, onCancel, onLocation,
}: {
    inputRef: React.RefObject<HTMLInputElement | null>;
    activity: string; setActivity: (v: string) => void;
    start: string; setStart: (v: string) => void;
    end: string; setEnd: (v: string) => void;
    cat: string; setCat: (v: string) => void;
    note: string; setNote: (v: string) => void;
    saving: boolean; locLoading: boolean; isEdit: boolean;
    onSave: () => void; onCancel: () => void; onLocation: () => void;
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
