"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { ChevronLeft, ChevronRight, Plus, X, Clock, ExternalLink, Loader2 } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import * as townityDb from "@/lib/supabase/townity";

/* ── Types ── */
type EventType = "일반" | "프로젝트" | "전체행사" | "휴가" | "마감";

type AudienceType = '전체' | 'Staff' | 'Partner 이상' | 'Crew 이상' | 'Admin Only';
const audienceOptions: AudienceType[] = ['전체', 'Staff', 'Partner 이상', 'Crew 이상', 'Admin Only'];

interface CalendarEvent {
  id: string;
  title: string;
  date: string;       // YYYY-MM-DD
  endDate?: string;    // YYYY-MM-DD (for multi-day)
  time?: string;
  type: EventType;
  department?: string;
  description?: string;
  projectCode?: string;
  audience?: AudienceType;
}

/* ── Color config ── */
const typeConfig: Record<EventType, { dot: string; bg: string; text: string; label: string }> = {
  "일반":     { dot: "bg-blue-400",   bg: "bg-blue-50",   text: "text-blue-600",   label: "일반 업무" },
  "프로젝트": { dot: "bg-violet-400", bg: "bg-violet-50", text: "text-violet-600", label: "프로젝트" },
  "전체행사": { dot: "bg-amber-400",  bg: "bg-amber-50",  text: "text-amber-600",  label: "전체 행사" },
  "휴가":     { dot: "bg-green-400",  bg: "bg-green-50",  text: "text-green-600",  label: "휴가" },
  "마감":     { dot: "bg-red-400",    bg: "bg-red-50",    text: "text-red-600",    label: "마감" },
};

/* ── Calendar utils ── */
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function formatDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function isDateInRange(dateStr: string, start: string, end?: string) {
  if (!end) return dateStr === start;
  return dateStr >= start && dateStr <= end;
}

const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

/* ── DB row → CalendarEvent 변환 ── */
function dbEventToCalendarEvent(row: Record<string, unknown>): CalendarEvent {
  const startAt = row.start_at as string || '';
  const endAt = row.end_at as string | undefined;
  const startDate = startAt.split('T')[0];
  const endDate = endAt ? endAt.split('T')[0] : undefined;
  // 시간 추출 (HH:MM)
  const timePart = startAt.includes('T') ? startAt.split('T')[1]?.substring(0, 5) : undefined;

  return {
    id: row.id as string,
    title: row.title as string,
    date: startDate,
    endDate: endDate && endDate !== startDate ? endDate : undefined,
    time: timePart && timePart !== '00:00' ? timePart : undefined,
    type: (row.event_type as EventType) || '일반',
    department: row.location as string | undefined,
    description: row.description as string | undefined,
    audience: (row.visibility as AudienceType) || '전체',
  };
}

/* ── Component ── */
export default function CalendarPage() {
  const { user } = useAuth();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [eventFilter, setEventFilter] = useState<"전체" | "팀" | "개인" | "프로젝트">("전체");

  // Editor state
  const [edTitle, setEdTitle] = useState("");
  const [edDate, setEdDate] = useState("");
  const [edTime, setEdTime] = useState("10:00");
  const [edType, setEdType] = useState<EventType>("일반");
  const [edDept, setEdDept] = useState("경영기획");
  const [edDesc, setEdDesc] = useState("");
  const [edAudience, setEdAudience] = useState<AudienceType>("전체");

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // DB에서 이벤트 로드 (현재 월 +-1개월 범위)
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      // 이전 달 1일 ~ 다음 달 말일까지 넓게 로드
      const startMonth = month === 0 ? 11 : month - 1;
      const startYear = month === 0 ? year - 1 : year;
      const endMonth = month === 11 ? 0 : month + 1;
      const endYear = month === 11 ? year + 1 : year;
      const startAfter = formatDateStr(startYear, startMonth, 1);
      const endBefore = formatDateStr(endYear, endMonth, getDaysInMonth(endYear, endMonth));

      const data = await townityDb.fetchEvents({
        startAfter,
        endBefore: endBefore + 'T23:59:59',
      });

      const mapped = (data as Record<string, unknown>[]).map(dbEventToCalendarEvent);
      setEvents(mapped);
    } catch (err) {
      console.error('[CalendarPage] 일정 로드 실패:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  };

  // Get events for a specific date
  const getEventsForDate = (dateStr: string) =>
    events.filter(e => isDateInRange(dateStr, e.date, e.endDate));

  // Events visible in this month
  const monthEvents = useMemo(() => {
    const monthStart = formatDateStr(year, month, 1);
    const monthEnd = formatDateStr(year, month, daysInMonth);
    return events
      .filter(e => {
        const eEnd = e.endDate || e.date;
        return e.date <= monthEnd && eEnd >= monthStart;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));
  }, [events, year, month, daysInMonth]);

  // Today's events
  const todayEvents = useMemo(() =>
    getEventsForDate(todayStr)
      .sort((a, b) => (a.time || "").localeCompare(b.time || "")),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, todayStr]
  );

  // Selected date events
  const selectedEvents = selectedDate
    ? getEventsForDate(selectedDate).sort((a, b) => (a.time || "").localeCompare(b.time || ""))
    : [];

  const handleAddEvent = async () => {
    if (!edTitle.trim() || !edDate || !user?.id) return;
    try {
      setSubmitting(true);
      const startAt = edTime ? `${edDate}T${edTime}:00` : `${edDate}T00:00:00`;
      await townityDb.createEvent({
        title: edTitle,
        description: edDesc || undefined,
        start_at: startAt,
        event_type: edType,
        location: edDept,
        visibility: edAudience,
        created_by: user.id,
      });
      setEdTitle(""); setEdDate(""); setEdTime("10:00"); setEdType("일반"); setEdDesc(""); setEdAudience("전체");
      setShowEditor(false);
      await loadEvents();
    } catch (err) {
      console.error('[CalendarPage] 일정 등록 실패:', err);
      alert('일정 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // Build calendar grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Project bars (multi-day events)
  const projectBars = useMemo(() => {
    const monthStart = formatDateStr(year, month, 1);
    const monthEnd = formatDateStr(year, month, daysInMonth);
    return events.filter(e =>
      e.type === "프로젝트" && e.endDate && e.date <= monthEnd && e.endDate >= monthStart
    );
  }, [events, year, month, daysInMonth]);

  // non-project events for date cells
  const nonProjectEvents = useMemo(() =>
    events.filter(e => !(e.type === "프로젝트" && e.endDate)),
    [events]
  );

  const getEventsForDateNonProject = (dateStr: string) =>
    nonProjectEvents.filter(e => isDateInRange(dateStr, e.date, e.endDate));

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">전체 일정</h1>
          <p className="text-sm text-neutral-500 mt-1">회사 전체 일정 · 이벤트</p>
        </div>
        <button
          onClick={() => { setShowEditor(true); setEdDate(selectedDate || todayStr); }}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> 일정 등록
        </button>
      </div>

      {/* 필터 + 보기 모드 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {(["전체", "팀", "개인", "프로젝트"] as const).map(f => (
            <button key={f} onClick={() => setEventFilter(f)}
              className={clsx("px-2.5 py-1 text-xs rounded border transition-colors",
                eventFilter === f ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 hover:border-neutral-400")}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 border border-neutral-200 rounded overflow-hidden">
          <button onClick={() => setViewMode("calendar")}
            className={clsx("px-3 py-1 text-xs transition-colors", viewMode === "calendar" ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 hover:bg-neutral-50")}>
            캘린더
          </button>
          <button onClick={() => setViewMode("list")}
            className={clsx("px-3 py-1 text-xs transition-colors", viewMode === "list" ? "bg-neutral-900 text-white" : "bg-white text-neutral-500 hover:bg-neutral-50")}>
            리스트
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
          <span className="ml-2 text-sm text-neutral-400">일정을 불러오는 중...</span>
        </div>
      ) : viewMode === "calendar" ? (
      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* ── Left: Calendar Grid ── */}
        <div>
          <div className="border border-neutral-200 bg-white">
            {/* Month nav */}
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
              <button onClick={prevMonth} className="p-1 hover:bg-neutral-100 rounded transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <h2 className="text-xs font-semibold">{year}년 {MONTHS[month]}</h2>
              <button onClick={nextMonth} className="p-1 hover:bg-neutral-100 rounded transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Project bars */}
            {projectBars.length > 0 && (
              <div className="px-3 py-2 border-b border-neutral-100 space-y-1">
                {projectBars.map(pb => (
                  <div key={pb.id} className="flex items-center gap-2">
                    {pb.projectCode ? (
                      <Link
                        href={`/intra/project/management/${pb.projectCode}`}
                        className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-violet-50 text-violet-600 text-xs rounded hover:bg-violet-100 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        <span className="font-medium truncate">{pb.title}</span>
                        <span className="text-violet-400 ml-auto shrink-0">{pb.date} ~ {pb.endDate}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </Link>
                    ) : (
                      <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-violet-50 text-violet-600 text-xs rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        <span className="font-medium truncate">{pb.title}</span>
                        <span className="text-violet-400 ml-auto">{pb.date} ~ {pb.endDate}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Day headers */}
            <div className="grid grid-cols-7">
              {DAYS.map(d => (
                <div key={d} className="px-1 py-1.5 text-center text-xs font-medium text-neutral-400 border-b border-neutral-100">
                  {d}
                </div>
              ))}

              {/* Day cells */}
              {cells.map((day, i) => {
                if (day === null) return <div key={i} className="h-20 border-b border-r border-neutral-50" />;
                const dateStr = formatDateStr(year, month, day);
                const dayEvents = getEventsForDateNonProject(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const isSun = i % 7 === 0;
                const isSat = i % 7 === 6;

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(dateStr)}
                    className={clsx(
                      "h-20 border-b border-r border-neutral-50 p-1 text-left align-top hover:bg-neutral-50 transition-colors",
                      isSelected && "bg-neutral-50 ring-1 ring-inset ring-neutral-300"
                    )}
                  >
                    <span className={clsx(
                      "inline-flex items-center justify-center w-5 h-5 text-xs",
                      isToday ? "bg-neutral-900 text-white rounded-full font-bold" : "text-neutral-700",
                      isSun && !isToday && "text-red-400",
                      isSat && !isToday && "text-blue-400",
                    )}>
                      {day}
                    </span>
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.slice(0, 2).map(ev => {
                        const cfg = typeConfig[ev.type] || typeConfig["일반"];
                        return (
                          <div key={ev.id} className={clsx("flex items-center gap-0.5 text-[10px] px-0.5 py-px rounded truncate", cfg.bg, cfg.text)}>
                            <span className={clsx("w-1 h-1 rounded-full shrink-0", cfg.dot)} />
                            <span className="truncate">{ev.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <p className="text-[10px] text-neutral-400 px-0.5">+{dayEvents.length - 2}개</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Events List (this month) ── */}
          <div className="border border-neutral-200 bg-white mt-4">
            <div className="px-4 py-3 border-b border-neutral-100">
              <h3 className="text-xs font-semibold">{MONTHS[month]} 일정 목록</h3>
            </div>
            <div className="divide-y divide-neutral-50 max-h-64 overflow-y-auto">
              {monthEvents.length > 0 ? monthEvents.map(ev => {
                const cfg = typeConfig[ev.type] || typeConfig["일반"];
                return (
                  <div key={ev.id} className="px-4 py-2.5 flex items-start gap-3 hover:bg-neutral-50 transition-colors">
                    <div className="text-xs text-neutral-400 w-20 shrink-0 pt-0.5">
                      <div className="font-medium text-neutral-600">{ev.date.slice(5)}</div>
                      {ev.time && <div className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{ev.time}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={clsx("text-xs px-1.5 py-0.5 rounded font-medium", cfg.bg, cfg.text)}>
                          {ev.type}
                        </span>
                        {ev.projectCode ? (
                          <Link
                            href={`/intra/project/management/${ev.projectCode}`}
                            className="text-xs font-medium text-violet-600 hover:underline flex items-center gap-0.5"
                          >
                            {ev.title} <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        ) : (
                          <span className="text-xs font-medium text-neutral-900">{ev.title}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {ev.department && <span className="text-xs text-neutral-400">{ev.department}</span>}
                        {ev.description && <span className="text-xs text-neutral-400">{ev.description}</span>}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="p-6 text-center text-xs text-neutral-400">이번 달 일정이 없습니다.</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="space-y-4">
          {/* Today */}
          <div className="border border-neutral-200 bg-white">
            <div className="px-4 py-3 border-b border-neutral-100">
              <h3 className="text-xs font-semibold">오늘 일정</h3>
              <p className="text-xs text-neutral-400 mt-0.5">{todayStr}</p>
            </div>
            {todayEvents.length > 0 ? (
              <ul className="divide-y divide-neutral-50">
                {todayEvents.map(ev => {
                  const cfg = typeConfig[ev.type] || typeConfig["일반"];
                  return (
                    <li key={ev.id} className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={clsx("text-xs px-1.5 py-0.5 rounded font-medium", cfg.bg, cfg.text)}>
                          {ev.type}
                        </span>
                        {ev.time && (
                          <span className="text-xs text-neutral-400 flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" /> {ev.time}
                          </span>
                        )}
                      </div>
                      {ev.projectCode ? (
                        <Link
                          href={`/intra/project/management/${ev.projectCode}`}
                          className="text-xs font-medium text-violet-600 hover:underline flex items-center gap-0.5"
                        >
                          {ev.title} <ExternalLink className="h-2.5 w-2.5" />
                        </Link>
                      ) : (
                        <p className="text-xs font-medium">{ev.title}</p>
                      )}
                      {ev.description && <p className="text-xs text-neutral-400 mt-0.5">{ev.description}</p>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center text-xs text-neutral-400">오늘 일정이 없습니다.</div>
            )}
          </div>

          {/* Selected date */}
          {selectedDate && selectedDate !== todayStr && (
            <div className="border border-neutral-200 bg-white">
              <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold">선택한 날짜</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{selectedDate}</p>
                </div>
                <button onClick={() => setSelectedDate(null)} className="text-neutral-400 hover:text-neutral-600">
                  <X className="h-3 w-3" />
                </button>
              </div>
              {selectedEvents.length > 0 ? (
                <ul className="divide-y divide-neutral-50">
                  {selectedEvents.map(ev => {
                    const cfg = typeConfig[ev.type] || typeConfig["일반"];
                    return (
                      <li key={ev.id} className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={clsx("text-xs px-1.5 py-0.5 rounded font-medium", cfg.bg, cfg.text)}>
                            {ev.type}
                          </span>
                          {ev.time && (
                            <span className="text-xs text-neutral-400 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {ev.time}
                            </span>
                          )}
                        </div>
                        {ev.projectCode ? (
                          <Link
                            href={`/intra/project/management/${ev.projectCode}`}
                            className="text-xs font-medium text-violet-600 hover:underline flex items-center gap-0.5"
                          >
                            {ev.title} <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        ) : (
                          <p className="text-xs font-medium">{ev.title}</p>
                        )}
                        {ev.description && <p className="text-xs text-neutral-400 mt-0.5">{ev.description}</p>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-xs text-neutral-400">일정이 없습니다.</div>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="border border-neutral-200 bg-white px-4 py-3">
            <h3 className="text-xs font-semibold text-neutral-400 mb-2">범례</h3>
            <div className="space-y-1.5">
              {(Object.entries(typeConfig) as [EventType, typeof typeConfig[EventType]][]).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={clsx("w-2 h-2 rounded-full", cfg.dot)} />
                  <span className="text-xs text-neutral-600">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      ) : (
      /* ── 리스트 뷰 ── */
      <div className="border border-neutral-200 bg-white">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-neutral-100 text-[11px] text-neutral-400 uppercase tracking-wider">
          <span className="col-span-2">날짜</span>
          <span className="col-span-1">시간</span>
          <span className="col-span-4">제목</span>
          <span className="col-span-1">유형</span>
          <span className="col-span-2">부서</span>
          <span className="col-span-2">비고</span>
        </div>
        {events
          .filter(e => {
            if (eventFilter === "프로젝트") return e.type === "프로젝트";
            if (eventFilter === "팀") return e.type === "일반";
            if (eventFilter === "개인") return e.type === "휴가";
            return true;
          })
          .filter(e => {
            const eDate = e.date;
            const mStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
            const mEnd = `${year}-${String(month + 1).padStart(2, "0")}-31`;
            return eDate >= mStart && eDate <= mEnd;
          })
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(e => {
            const cfg = typeConfig[e.type] || typeConfig["일반"];
            return (
              <div key={e.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-neutral-50 last:border-0 items-center hover:bg-neutral-50 text-xs">
                <span className="col-span-2 font-mono text-neutral-500">{e.date.slice(5)}{e.endDate ? ` ~ ${e.endDate.slice(5)}` : ""}</span>
                <span className="col-span-1 text-neutral-400">{e.time || "-"}</span>
                <div className="col-span-4">
                  {e.projectCode ? (
                    <Link href={`/intra/project/management/${e.projectCode}`} className="text-xs font-medium hover:underline">{e.title}</Link>
                  ) : (
                    <span className="text-xs font-medium">{e.title}</span>
                  )}
                </div>
                <span className={clsx("col-span-1 text-[10px] px-1.5 py-0.5 rounded w-fit", cfg.bg, cfg.text)}>{e.type}</span>
                <span className="col-span-2 text-neutral-400">{e.department || "-"}</span>
                <span className="col-span-2 text-neutral-400 truncate">{e.description || "-"}</span>
              </div>
            );
          })}
        {events.filter(e => {
          const mStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
          const mEnd = `${year}-${String(month + 1).padStart(2, "0")}-31`;
          return e.date >= mStart && e.date <= mEnd;
        }).length === 0 && (
          <div className="py-8 text-center text-xs text-neutral-400">이번 달 일정이 없습니다.</div>
        )}
      </div>
      )}

      {/* ── Event Registration Modal ── */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md shadow-xl">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-sm font-bold">일정 등록</h2>
              <button onClick={() => setShowEditor(false)} className="text-neutral-400 hover:text-neutral-900">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">제목</label>
                <input
                  value={edTitle}
                  onChange={e => setEdTitle(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none"
                  placeholder="일정 제목"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">유형</label>
                <div className="flex flex-wrap gap-1.5">
                  {(["일반", "프로젝트", "전체행사", "마감"] as EventType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setEdType(t)}
                      className={clsx(
                        "px-2.5 py-1 text-xs border rounded transition-colors",
                        edType === t
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">날짜</label>
                  <input
                    type="date"
                    value={edDate}
                    onChange={e => setEdDate(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 block mb-1">시간</label>
                  <input
                    type="time"
                    value={edTime}
                    onChange={e => setEdTime(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">부서</label>
                <select
                  value={edDept}
                  onChange={e => setEdDept(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none bg-white"
                >
                  {["경영기획", "브랜드관리", "커뮤니티운영", "콘텐츠제작", "디자인", "AI크리에이티브", "마케팅", "개발"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">공개 대상</label>
                <div className="flex flex-wrap gap-1.5">
                  {audienceOptions.map(a => (
                    <button key={a} onClick={() => setEdAudience(a)}
                      className={clsx("px-2.5 py-1 text-xs border rounded transition-colors",
                        edAudience === a ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                      )}>{a}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-600 block mb-1">설명</label>
                <textarea
                  value={edDesc}
                  onChange={e => setEdDesc(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 text-xs focus:border-neutral-900 focus:outline-none resize-none"
                  rows={2}
                  placeholder="선택사항"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-neutral-100 flex justify-end gap-2">
              <button onClick={() => setShowEditor(false)} className="px-4 py-2 text-xs text-neutral-500 hover:text-neutral-900">
                취소
              </button>
              <button onClick={handleAddEvent} disabled={submitting}
                className="px-4 py-2 bg-neutral-900 text-white text-xs hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-1.5">
                {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
