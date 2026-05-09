"use client";

import { useEffect, useState } from "react";
import { Loader2, Calendar, Plus, X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DomainBackLink } from "@/features/myverse/app/DomainBackLink";
import { LaneHeader } from "@/features/myverse/app/LaneHeader";

interface CalEvent {
    id: string;
    date: string;
    title: string;
    start_time: string | null;
    end_time: string | null;
    is_all_day: boolean;
    color: string | null;
    note: string | null;
    visibility: string;
}

const EVENT_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#A855F7", "#EC4899", "#0F766E", "#3B82F6"];

export const dynamic = "force-dynamic";

export default function SchedulePage() {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth()); // 0-indexed
    const [events, setEvents] = useState<CalEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(today);
    const [addOpen, setAddOpen] = useState(false);
    const [memberId, setMemberId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from("members").select("id").eq("auth_id", user.id).maybeSingle();
            setMemberId((data as { id: string } | null)?.id ?? null);
            await loadEvents(supabase, (data as { id: string } | null)?.id ?? null);
        })();
    }, []);

    async function loadEvents(supabase: ReturnType<typeof createClient>, mid: string | null) {
        if (!mid) { setLoading(false); return; }
        setLoading(true);
        try {
            const { data } = await supabase
                .from("myverse_calendar_entries")
                .select("id, date, title, start_time, end_time, is_all_day, color, note, visibility")
                .eq("member_id", mid)
                .order("date")
                .order("start_time", { nullsFirst: true })
                .limit(500);
            setEvents((data ?? []) as CalEvent[]);
        } finally {
            setLoading(false);
        }
    }

    function reload() {
        const supabase = createClient();
        loadEvents(supabase, memberId);
    }

    const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

    // 달력 데이터 계산
    const firstDay = new Date(year, month, 1).getDay(); // 0=일
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    // 6행 맞추기
    while (cells.length % 7 !== 0) cells.push(null);

    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthEvents = events.filter(e => e.date.startsWith(monthStr));

    const eventsByDate: Record<string, CalEvent[]> = {};
    for (const e of monthEvents) {
        if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
        eventsByDate[e.date].push(e);
    }

    const selectedEvents = events.filter(e => e.date === selectedDate).sort((a, b) => {
        if (a.is_all_day && !b.is_all_day) return -1;
        if (!a.is_all_day && b.is_all_day) return 1;
        return (a.start_time ?? "").localeCompare(b.start_time ?? "");
    });

    const upcoming = events.filter(e => e.date >= today).slice(0, 10);

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <header className="px-5 sm:px-10 pt-8 pb-4 border-b border-neutral-200 bg-white">
                <LaneHeader
                    icon="event"
                    label="SCHEDULE"
                    title="일정"
                    subtitle="캘린더 약속·기념일"
                    accent="#0F766E"
                    backLink={<DomainBackLink domain="schedule" />}
                    actions={
                        <button onClick={() => { setSelectedDate(today); setAddOpen(true); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-teal-600 text-white hover:bg-teal-700 rounded-lg">
                            <Plus className="h-3.5 w-3.5" /> 일정 추가
                        </button>
                    }
                />
            </header>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    {/* 미니 캘린더 */}
                    <div className="m-4 bg-white border border-neutral-200 rounded-xl overflow-hidden">
                        {/* 월 네비 */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                            <button onClick={prevMonth} className="p-1 rounded hover:bg-neutral-100"><ChevronLeft className="h-4 w-4 text-neutral-500" /></button>
                            <span className="text-sm font-semibold text-neutral-800">{year}년 {month + 1}월</span>
                            <button onClick={nextMonth} className="p-1 rounded hover:bg-neutral-100"><ChevronRight className="h-4 w-4 text-neutral-500" /></button>
                        </div>

                        {/* 요일 헤더 */}
                        <div className="grid grid-cols-7 text-center text-[10px] text-neutral-400 py-1.5 border-b border-neutral-100">
                            {["일", "월", "화", "수", "목", "금", "토"].map(d => (
                                <div key={d} className={d === "일" ? "text-red-400" : d === "토" ? "text-blue-400" : ""}>{d}</div>
                            ))}
                        </div>

                        {/* 날짜 그리드 */}
                        <div className="grid grid-cols-7">
                            {cells.map((day, i) => {
                                if (!day) return <div key={i} className="h-10 border-b border-r border-neutral-50 last:border-r-0" />;
                                const dateStr = `${monthStr}-${String(day).padStart(2, "0")}`;
                                const isToday = dateStr === today;
                                const isSelected = dateStr === selectedDate;
                                const dayEvents = eventsByDate[dateStr] ?? [];
                                const col = i % 7;
                                return (
                                    <button key={i} onClick={() => setSelectedDate(dateStr)}
                                        className={`h-10 flex flex-col items-center pt-1 border-b border-r border-neutral-50 last:border-r-0 transition-colors ${isSelected ? "bg-teal-50" : "hover:bg-neutral-50"}`}>
                                        <span className={`text-xs w-6 h-6 flex items-center justify-center rounded-full leading-none font-medium ${isToday ? "bg-teal-600 text-white" : col === 0 ? "text-red-400" : col === 6 ? "text-blue-400" : "text-neutral-700"}`}>
                                            {day}
                                        </span>
                                        {dayEvents.length > 0 && (
                                            <div className="flex gap-0.5 mt-0.5">
                                                {dayEvents.slice(0, 3).map((e, j) => (
                                                    <span key={j} className="h-1 w-1 rounded-full" style={{ backgroundColor: e.color ?? "#6366F1" }} />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 선택한 날 이벤트 */}
                    <div className="px-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-neutral-500">
                                {(() => {
                                    const dt = new Date(selectedDate + "T00:00:00+09:00");
                                    const days = ["일", "월", "화", "수", "목", "금", "토"];
                                    return `${dt.getMonth() + 1}월 ${dt.getDate()}일 (${days[dt.getDay()]})`;
                                })()}
                            </p>
                            <button onClick={() => setAddOpen(true)} className="text-[11px] text-teal-600 hover:underline flex items-center gap-0.5">
                                <Plus className="h-3 w-3" /> 추가
                            </button>
                        </div>
                        {selectedEvents.length === 0 ? (
                            <p className="text-sm text-neutral-400 text-center py-4">일정이 없습니다</p>
                        ) : (
                            <div className="space-y-1.5">
                                {selectedEvents.map(e => <EventRow key={e.id} event={e} />)}
                            </div>
                        )}
                    </div>

                    {/* 다가오는 일정 */}
                    {upcoming.length > 0 && (
                        <div className="px-4 pb-6">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">다가오는 일정</p>
                            <div className="space-y-1.5">
                                {upcoming.map(e => <EventRow key={e.id} event={e} showDate />)}
                            </div>
                        </div>
                    )}
                </>
            )}

            {addOpen && memberId && (
                <AddEventModal memberId={memberId} defaultDate={selectedDate} onClose={() => setAddOpen(false)} onAdded={reload} />
            )}
        </div>
    );
}

function EventRow({ event: e, showDate = false }: { event: CalEvent; showDate?: boolean }) {
    const color = e.color ?? "#6366F1";
    return (
        <div className="flex items-start gap-3 bg-white border border-neutral-200 rounded-lg px-3 py-2.5">
            <span className="shrink-0 mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-800 font-medium truncate">{e.title}</p>
                {e.note && <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">{e.note}</p>}
            </div>
            <div className="shrink-0 text-right">
                {showDate && (
                    <p className="text-[10px] text-neutral-400 tabular-nums">
                        {(() => { const dt = new Date(e.date + "T00:00:00+09:00"); return `${dt.getMonth() + 1}/${dt.getDate()}`; })()}
                    </p>
                )}
                {e.is_all_day ? (
                    <span className="text-[10px] text-neutral-400">종일</span>
                ) : e.start_time ? (
                    <span className="flex items-center gap-0.5 text-[10px] text-neutral-400 tabular-nums">
                        <Clock className="h-2.5 w-2.5" />
                        {e.start_time.slice(0, 5)}{e.end_time ? `–${e.end_time.slice(0, 5)}` : ""}
                    </span>
                ) : null}
            </div>
        </div>
    );
}

/* ── 일정 추가 모달 ── */
function AddEventModal({ memberId, defaultDate, onClose, onAdded }: {
    memberId: string; defaultDate: string; onClose: () => void; onAdded: () => void;
}) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(defaultDate);
    const [allDay, setAllDay] = useState(true);
    const [start, setStart] = useState("09:00");
    const [end, setEnd] = useState("10:00");
    const [color, setColor] = useState(EVENT_COLORS[0]);
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);

    async function submit() {
        if (!title.trim()) return;
        setSaving(true);
        try {
            const supabase = createClient();
            await supabase.from("myverse_calendar_entries").insert({
                member_id: memberId,
                date,
                title: title.trim(),
                start_time: allDay ? null : start,
                end_time: allDay ? null : end,
                is_all_day: allDay,
                color,
                note: note.trim() || null,
                domain: "schedule",
                visibility: "private",
            });
            onAdded();
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl flex flex-col md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                    <h2 className="text-sm font-semibold text-neutral-900">일정 추가</h2>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700"><X className="h-4 w-4" /></button>
                </div>
                <div className="px-5 py-4 space-y-3">
                    <div>
                        <label className="text-[11px] text-neutral-500">제목 *</label>
                        <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="일정 이름"
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400" />
                    </div>
                    <div>
                        <label className="text-[11px] text-neutral-500">날짜</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)}
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setAllDay(v => !v)}
                            className={`shrink-0 w-10 h-6 rounded-full transition-colors ${allDay ? "bg-teal-600" : "bg-neutral-300"}`}>
                            <span className={`block w-4 h-4 !bg-white rounded-full shadow transition-transform mx-1 ${allDay ? "translate-x-4" : "translate-x-0"}`} />
                        </button>
                        <span className="text-sm text-neutral-600">하루 종일</span>
                    </div>
                    {!allDay && (
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[11px] text-neutral-500">시작</label>
                                <input type="time" value={start} onChange={e => setStart(e.target.value)}
                                    className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400" />
                            </div>
                            <div>
                                <label className="text-[11px] text-neutral-500">종료</label>
                                <input type="time" value={end} onChange={e => setEnd(e.target.value)}
                                    className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400" />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="text-[11px] text-neutral-500">색상</label>
                        <div className="flex gap-2 mt-1.5">
                            {EVENT_COLORS.map(c => (
                                <button key={c} onClick={() => setColor(c)}
                                    className={`h-6 w-6 rounded-full transition-all ${color === c ? "ring-2 ring-offset-1 ring-neutral-400 scale-110" : ""}`}
                                    style={{ backgroundColor: c }} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] text-neutral-500">메모</label>
                        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="장소, 준비물 등"
                            className="mt-1 w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:border-teal-400" />
                    </div>
                </div>
                <div className="px-5 pb-5">
                    <button onClick={submit} disabled={saving || !title.trim()}
                        className="w-full py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-40 flex items-center justify-center gap-2">
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />} 저장
                    </button>
                </div>
            </div>
        </>
    );
}
