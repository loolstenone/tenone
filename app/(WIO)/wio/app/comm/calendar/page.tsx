'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Clock, Users, X,
  MapPin, Repeat, Bell, Trash2, Edit3, List, LayoutGrid, Columns, AlignJustify
} from 'lucide-react';
import { useWIO } from '../../layout';
import { createClient } from '@/lib/supabase/client';

/* ───── Types ───── */
type ViewMode = 'month' | 'week' | 'day' | 'list';
type EventColor = typeof EVENT_COLORS[number];

interface CalEvent {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:mm
  endTime: string;
  allDay: boolean;
  location?: string;
  description?: string;
  attendees: string[];
  color: EventColor;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminder?: 'none' | '5' | '15' | '30' | '60';
}

/* ───── Constants ───── */
const EVENT_COLORS = [
  { id: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-400', dot: 'bg-indigo-500', ring: 'ring-indigo-500/30', light: 'bg-indigo-500/15' },
  { id: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-400', dot: 'bg-emerald-500', ring: 'ring-emerald-500/30', light: 'bg-emerald-500/15' },
  { id: 'amber', bg: 'bg-amber-500', text: 'text-amber-400', dot: 'bg-amber-500', ring: 'ring-amber-500/30', light: 'bg-amber-500/15' },
  { id: 'rose', bg: 'bg-rose-500', text: 'text-rose-400', dot: 'bg-rose-500', ring: 'ring-rose-500/30', light: 'bg-rose-500/15' },
  { id: 'violet', bg: 'bg-violet-500', text: 'text-violet-400', dot: 'bg-violet-500', ring: 'ring-violet-500/30', light: 'bg-violet-500/15' },
  { id: 'pink', bg: 'bg-pink-500', text: 'text-pink-400', dot: 'bg-pink-500', ring: 'ring-pink-500/30', light: 'bg-pink-500/15' },
  { id: 'sky', bg: 'bg-sky-500', text: 'text-sky-400', dot: 'bg-sky-500', ring: 'ring-sky-500/30', light: 'bg-sky-500/15' },
  { id: 'teal', bg: 'bg-teal-500', text: 'text-teal-400', dot: 'bg-teal-500', ring: 'ring-teal-500/30', light: 'bg-teal-500/15' },
] as const;

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const TODAY = '2026-03-29';
const TODAY_DATE = new Date(2026, 2, 29);

/* ───── Mock Events ───── */
const MOCK_EVENTS: CalEvent[] = [
  { id: 'e1', title: '1분기 전략 회의', date: '2026-03-29', startTime: '10:00', endTime: '12:00', allDay: false, attendees: ['김대표', '박개발', '이마케팅'], color: EVENT_COLORS[0], location: '대회의실', description: '각 팀별 1분기 성과 리뷰 및 2분기 계획 수립', repeat: 'none', reminder: '15' },
  { id: 'e2', title: '점심 미팅', date: '2026-03-29', startTime: '12:30', endTime: '13:30', allDay: false, attendees: ['윤채린'], color: EVENT_COLORS[2], location: '강남역 근처', reminder: '30' },
  { id: 'e3', title: 'WIO v2.3 스프린트 계획', date: '2026-03-31', startTime: '14:00', endTime: '15:30', allDay: false, attendees: ['박개발', '이프론트', '정백엔드'], color: EVENT_COLORS[1], location: '개발팀 회의실' },
  { id: 'e4', title: 'SmarComm 캠페인 리뷰', date: '2026-04-01', startTime: '11:00', endTime: '12:00', allDay: false, attendees: ['이마케팅', '윤기획'], color: EVENT_COLORS[2] },
  { id: 'e5', title: '신규 입사자 온보딩', date: '2026-04-01', startTime: '09:00', endTime: '17:00', allDay: true, attendees: ['최인사', '신규 3명'], color: EVENT_COLORS[3], description: '신규 입사자 전일 온보딩 프로그램' },
  { id: 'e6', title: 'MAD League 기획', date: '2026-04-02', startTime: '15:00', endTime: '16:00', allDay: false, attendees: ['윤기획', '정디자인'], color: EVENT_COLORS[4] },
  { id: 'e7', title: '월간 타운홀', date: '2026-04-03', startTime: '16:00', endTime: '17:00', allDay: false, attendees: ['전체'], color: EVENT_COLORS[0], description: '전사 월간 타운홀 미팅', location: '대강당' },
  { id: 'e8', title: 'LUKI 브랜드 리뷰', date: '2026-04-04', startTime: '10:00', endTime: '11:00', allDay: false, attendees: ['정디자인', '김대표'], color: EVENT_COLORS[5] },
  { id: 'e9', title: '디자인 시스템 워크숍', date: '2026-04-07', startTime: '13:00', endTime: '16:00', allDay: false, attendees: ['프론트팀', '디자인팀'], color: EVENT_COLORS[6], location: '소회의실 B' },
  { id: 'e10', title: '4월 워크숍', date: '2026-04-11', startTime: '14:00', endTime: '18:00', allDay: false, attendees: ['전체'], color: EVENT_COLORS[1], description: 'AI 시대의 팀 협업', location: '강남 코워킹스페이스 3층' },
  { id: 'e11', title: '주간 스탠드업', date: '2026-03-31', startTime: '09:30', endTime: '10:00', allDay: false, attendees: ['개발팀'], color: EVENT_COLORS[6], repeat: 'weekly' },
  { id: 'e12', title: '투자자 미팅', date: '2026-04-08', startTime: '10:00', endTime: '11:30', allDay: false, attendees: ['김대표', '재무팀'], color: EVENT_COLORS[3], location: '외부 (삼성동)' },
  { id: 'e13', title: '콘텐츠 기획 회의', date: '2026-04-09', startTime: '14:00', endTime: '15:00', allDay: false, attendees: ['콘텐츠팀'], color: EVENT_COLORS[4] },
  { id: 'e14', title: 'QA 테스트 데이', date: '2026-04-10', startTime: '09:00', endTime: '18:00', allDay: true, attendees: ['QA팀', '개발팀'], color: EVENT_COLORS[7] },
  { id: 'e15', title: '월말 정산', date: '2026-03-31', startTime: '15:00', endTime: '16:00', allDay: false, attendees: ['재무팀'], color: EVENT_COLORS[2], repeat: 'monthly' },
];

/* ───── Helpers ───── */
const pad = (n: number) => String(n).padStart(2, '0');
const getDateStr = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const formatDate = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${m}월 ${d}일 (${DAYS_KR[date.getDay()]})`;
};
const timeToMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

/* ───── Component ───── */
export default function CalendarPage() {
  const { tenant } = useWIO();
  const [events, setEvents] = useState<CalEvent[]>(MOCK_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStart, setFormStart] = useState('09:00');
  const [formEnd, setFormEnd] = useState('10:00');
  const [formAllDay, setFormAllDay] = useState(false);
  const [formLocation, setFormLocation] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formAttendees, setFormAttendees] = useState('');
  const [formColorIdx, setFormColorIdx] = useState(0);
  const [formRepeat, setFormRepeat] = useState<CalEvent['repeat']>('none');
  const [formReminder, setFormReminder] = useState<CalEvent['reminder']>('none');

  const [loading, setLoading] = useState(false);

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  // Supabase에서 일정 로드
  useEffect(() => {
    if (isDemo) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const sb = createClient();
        const { data, error } = await sb
          .from('events')
          .select('*')
          .eq('tenant_id', tenant!.id)
          .order('date', { ascending: true });
        if (error) throw error;
        if (!cancelled && data && data.length > 0) {
          setEvents(data.map((row: any): CalEvent => ({
            id: row.id,
            title: row.title || '',
            date: row.date || '',
            startTime: row.start_time || '09:00',
            endTime: row.end_time || '10:00',
            allDay: row.all_day ?? false,
            location: row.location,
            description: row.description,
            attendees: Array.isArray(row.attendees) ? row.attendees : [],
            color: EVENT_COLORS[row.color_index ?? 0] || EVENT_COLORS[0],
            repeat: row.repeat || 'none',
            reminder: row.reminder || 'none',
          })));
        }
        // 데이터 없으면 Mock 폴백 (초기값 유지)
      } catch {
        // 에러 시 Mock 폴백 (초기값 유지)
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isDemo, tenant]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /* Navigation */
  const prev = () => {
    if (viewMode === 'month') setCurrentDate(new Date(year, month - 1, 1));
    else if (viewMode === 'week') setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    else if (viewMode === 'day') setCurrentDate(new Date(currentDate.getTime() - 86400000));
  };
  const next = () => {
    if (viewMode === 'month') setCurrentDate(new Date(year, month + 1, 1));
    else if (viewMode === 'week') setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    else if (viewMode === 'day') setCurrentDate(new Date(currentDate.getTime() + 86400000));
  };
  const goToday = () => setCurrentDate(new Date(2026, 2, 29));

  const headerLabel = useMemo(() => {
    if (viewMode === 'month') return `${year}년 ${month + 1}월`;
    if (viewMode === 'week') {
      const start = getWeekStart(currentDate);
      const end = new Date(start.getTime() + 6 * 86400000);
      return `${start.getMonth() + 1}월 ${start.getDate()}일 — ${end.getMonth() + 1}월 ${end.getDate()}일`;
    }
    if (viewMode === 'day') return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일 (${DAYS_KR[currentDate.getDay()]})`;
    return `${year}년 ${month + 1}월`;
  }, [viewMode, currentDate, year, month]);

  /* Event helpers */
  const getEventsForDate = useCallback((dateStr: string) => events.filter(e => e.date === dateStr), [events]);

  /* Modal */
  const openCreateModal = (dateStr?: string) => {
    setEditingEvent(null);
    setFormTitle(''); setFormDate(dateStr || TODAY); setFormStart('09:00'); setFormEnd('10:00');
    setFormAllDay(false); setFormLocation(''); setFormDesc(''); setFormAttendees('');
    setFormColorIdx(0); setFormRepeat('none'); setFormReminder('none');
    setShowModal(true);
  };

  const openEditModal = (ev: CalEvent) => {
    setEditingEvent(ev);
    setFormTitle(ev.title); setFormDate(ev.date); setFormStart(ev.startTime); setFormEnd(ev.endTime);
    setFormAllDay(ev.allDay); setFormLocation(ev.location || ''); setFormDesc(ev.description || '');
    setFormAttendees(ev.attendees.join(', '));
    setFormColorIdx(EVENT_COLORS.findIndex(c => c.id === ev.color.id));
    setFormRepeat(ev.repeat || 'none'); setFormReminder(ev.reminder || 'none');
    setShowModal(true);
    setSelectedEvent(null);
  };

  const handleSave = () => {
    if (!formTitle.trim() || !formDate) return;
    const ev: CalEvent = {
      id: editingEvent?.id || `e_${Date.now()}`,
      title: formTitle.trim(), date: formDate, startTime: formStart, endTime: formEnd,
      allDay: formAllDay, location: formLocation || undefined, description: formDesc || undefined,
      attendees: formAttendees.split(',').map(s => s.trim()).filter(Boolean),
      color: EVENT_COLORS[formColorIdx] || EVENT_COLORS[0],
      repeat: formRepeat, reminder: formReminder,
    };
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? ev : e));
    } else {
      setEvents(prev => [...prev, ev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelectedEvent(null);
    setShowModal(false);
  };

  /* ───── Month View ───── */
  const MonthView = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      cells.push({ day: d, isCurrentMonth: false, dateStr: getDateStr(y, m, d) });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, isCurrentMonth: true, dateStr: getDateStr(year, month, i) });
    }
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      cells.push({ day: i, isCurrentMonth: false, dateStr: getDateStr(y, m, i) });
    }

    return (
      <div className="flex-1 overflow-hidden">
        {/* Days header */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {DAYS_KR.map((d, i) => (
            <div key={d} className={`py-2 text-center text-xs font-medium ${i === 0 ? 'text-rose-400/70' : i === 6 ? 'text-sky-400/70' : 'text-slate-500'}`}>{d}</div>
          ))}
        </div>
        {/* Grid */}
        <div className="grid grid-cols-7 grid-rows-6 flex-1" style={{ height: 'calc(100% - 32px)' }}>
          {cells.map((cell, idx) => {
            const isToday = cell.dateStr === TODAY;
            const isSelected = cell.dateStr === selectedDate;
            const dayEvents = getEventsForDate(cell.dateStr);
            const dayOfWeek = (firstDay + idx) % 7;
            return (
              <button key={idx}
                onClick={() => { setSelectedDate(cell.dateStr === selectedDate ? null : cell.dateStr); }}
                onDoubleClick={() => openCreateModal(cell.dateStr)}
                className={`relative border-b border-r border-white/[0.03] p-1 text-left transition-colors min-h-[80px] md:min-h-[100px] ${!cell.isCurrentMonth ? 'opacity-30' : ''} ${isSelected ? 'bg-indigo-500/5' : 'hover:bg-white/[0.02]'}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs leading-none ${isToday ? 'flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white font-bold' : dayOfWeek === 0 ? 'text-rose-400/70' : dayOfWeek === 6 ? 'text-sky-400/70' : 'text-slate-400'} ${!cell.isCurrentMonth ? '' : ''}`}>
                    {cell.day}
                  </span>
                  {dayEvents.length > 2 && (
                    <span className="text-[9px] text-slate-600 hidden md:block">+{dayEvents.length - 2}</span>
                  )}
                </div>
                <div className="space-y-0.5">
                  {/* Mobile: dots only */}
                  <div className="flex gap-0.5 md:hidden flex-wrap">
                    {dayEvents.slice(0, 4).map(ev => (
                      <div key={ev.id} className={`h-1.5 w-1.5 rounded-full ${ev.color.dot}`} />
                    ))}
                  </div>
                  {/* Desktop: bars */}
                  <div className="hidden md:block space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div key={ev.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                        className={`${ev.color.light} ${ev.color.text} rounded px-1.5 py-0.5 text-[10px] truncate cursor-pointer hover:opacity-80 transition-opacity`}>
                        {!ev.allDay && <span className="opacity-60 mr-0.5">{ev.startTime}</span>}
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  /* ───── Week View ───── */
  const WeekView = () => {
    const weekStart = getWeekStart(currentDate);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart.getTime() + i * 86400000);
      return { date: d, dateStr: getDateStr(d.getFullYear(), d.getMonth(), d.getDate()) };
    });

    const nowHour = 14; // simulated current time
    const nowMin = 30;

    return (
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-white/5 sticky top-0 bg-slate-950 z-10">
          <div className="p-2" />
          {weekDates.map((wd, i) => (
            <div key={i} className={`p-2 text-center border-l border-white/[0.03] ${wd.dateStr === TODAY ? 'bg-indigo-500/5' : ''}`}>
              <div className={`text-[10px] ${i === 0 ? 'text-rose-400/60' : i === 6 ? 'text-sky-400/60' : 'text-slate-500'}`}>{DAYS_KR[i]}</div>
              <div className={`text-sm font-medium mt-0.5 ${wd.dateStr === TODAY ? 'flex h-7 w-7 mx-auto items-center justify-center rounded-full bg-indigo-600 text-white' : 'text-slate-300'}`}>
                {wd.date.getDate()}
              </div>
            </div>
          ))}
        </div>
        {/* Time grid */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
          {HOURS.map(h => (
            <div key={h} className="contents">
              <div className="h-14 flex items-start justify-end pr-2 pt-0 text-[10px] text-slate-600 border-b border-white/[0.02]">
                {pad(h)}:00
              </div>
              {weekDates.map((wd, di) => {
                const eventsHere = getEventsForDate(wd.dateStr).filter(ev =>
                  !ev.allDay && timeToMinutes(ev.startTime) >= h * 60 && timeToMinutes(ev.startTime) < (h + 1) * 60
                );
                return (
                  <div key={di} className={`h-14 border-l border-b border-white/[0.02] relative ${wd.dateStr === TODAY ? 'bg-indigo-500/[0.02]' : ''}`}>
                    {eventsHere.map(ev => {
                      const startMin = timeToMinutes(ev.startTime) - h * 60;
                      const duration = timeToMinutes(ev.endTime) - timeToMinutes(ev.startTime);
                      const topPx = (startMin / 60) * 56;
                      const heightPx = Math.max((duration / 60) * 56, 20);
                      return (
                        <div key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`absolute left-0.5 right-0.5 ${ev.color.light} ${ev.color.text} rounded px-1 py-0.5 text-[10px] cursor-pointer overflow-hidden hover:opacity-80 transition-opacity border-l-2 ${ev.color.bg.replace('bg-', 'border-')}`}
                          style={{ top: `${topPx}px`, height: `${heightPx}px` }}>
                          <div className="font-medium truncate">{ev.title}</div>
                          {heightPx > 30 && <div className="opacity-60 truncate">{ev.startTime}-{ev.endTime}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
          {/* Current time indicator */}
          {weekDates.some(wd => wd.dateStr === TODAY) && (
            <div className="absolute left-[60px] right-0 pointer-events-none" style={{ top: `${(nowHour * 60 + nowMin) / 60 * 56}px` }}>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-rose-500 -ml-1" />
                <div className="flex-1 h-px bg-rose-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ───── Day View ───── */
  const DayView = () => {
    const dateStr = getDateStr(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const dayEvents = getEventsForDate(dateStr);
    const nowHour = 14;
    const nowMin = 30;

    return (
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[60px_1fr]">
          {HOURS.map(h => {
            const eventsHere = dayEvents.filter(ev =>
              !ev.allDay && timeToMinutes(ev.startTime) >= h * 60 && timeToMinutes(ev.startTime) < (h + 1) * 60
            );
            return (
              <div key={h} className="contents">
                <div className="h-14 flex items-start justify-end pr-2 text-[10px] text-slate-600 border-b border-white/[0.02]">
                  {pad(h)}:00
                </div>
                <div className="h-14 border-l border-b border-white/[0.02] relative">
                  {eventsHere.map(ev => {
                    const startMin = timeToMinutes(ev.startTime) - h * 60;
                    const duration = timeToMinutes(ev.endTime) - timeToMinutes(ev.startTime);
                    const topPx = (startMin / 60) * 56;
                    const heightPx = Math.max((duration / 60) * 56, 24);
                    return (
                      <div key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`absolute left-1 right-1 ${ev.color.light} ${ev.color.text} rounded-lg px-3 py-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity border-l-2 ${ev.color.bg.replace('bg-', 'border-')}`}
                        style={{ top: `${topPx}px`, height: `${heightPx}px` }}>
                        <div className="font-medium">{ev.title}</div>
                        {heightPx > 30 && <div className="opacity-60">{ev.startTime} - {ev.endTime}{ev.location ? ` | ${ev.location}` : ''}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {/* Current time */}
        {dateStr === TODAY && (
          <div className="absolute left-[60px] right-0 pointer-events-none" style={{ top: `${(nowHour * 60 + nowMin) / 60 * 56 + 56}px` }}>
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-rose-500 -ml-1" />
              <div className="flex-1 h-px bg-rose-500" />
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ───── List View ───── */
  const ListView = () => {
    const upcoming = events
      .filter(e => e.date >= TODAY)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 30);

    const grouped: Record<string, CalEvent[]> = {};
    upcoming.forEach(ev => {
      if (!grouped[ev.date]) grouped[ev.date] = [];
      grouped[ev.date].push(ev);
    });

    return (
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {Object.entries(grouped).map(([date, evts]) => (
          <div key={date}>
            <h3 className="text-xs font-semibold text-slate-400 mb-2 sticky top-0 bg-slate-950 py-1">
              {date === TODAY && <span className="text-indigo-400 mr-1.5">오늘</span>}
              {formatDate(date)}
            </h3>
            <div className="space-y-1.5">
              {evts.map(ev => (
                <button key={ev.id} onClick={() => setSelectedEvent(ev)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] transition-colors">
                  <div className={`w-1 self-stretch rounded-full ${ev.color.bg}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-slate-200 truncate">{ev.title}</span>
                      {ev.repeat && ev.repeat !== 'none' && <Repeat size={11} className="text-slate-600 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={10} /> {ev.allDay ? '종일' : `${ev.startTime} - ${ev.endTime}`}</span>
                      {ev.location && <span className="flex items-center gap-1 truncate"><MapPin size={10} /> {ev.location}</span>}
                      <span className="flex items-center gap-1"><Users size={10} /> {ev.attendees.length}명</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
        {upcoming.length === 0 && (
          <div className="text-center text-slate-600 py-12 text-sm">예정된 일정이 없습니다</div>
        )}
      </div>
    );
  };

  /* ───── Event Detail Popup ───── */
  const EventDetail = () => {
    if (!selectedEvent) return null;
    const ev = selectedEvent;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
        <div className="absolute inset-0 bg-black/50" />
        <div onClick={e => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#15152e] p-5 shadow-2xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${ev.color.dot}`} />
              <h3 className="text-lg font-bold">{ev.title}</h3>
            </div>
            <button onClick={() => setSelectedEvent(null)} className="p-1 text-slate-500 hover:text-white"><X size={18} /></button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Calendar size={15} className="text-slate-500 shrink-0" />
              <span>{formatDate(ev.date)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-300">
              <Clock size={15} className="text-slate-500 shrink-0" />
              <span>{ev.allDay ? '종일' : `${ev.startTime} - ${ev.endTime}`}</span>
            </div>
            {ev.location && (
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin size={15} className="text-slate-500 shrink-0" />
                <span>{ev.location}</span>
              </div>
            )}
            <div className="flex items-start gap-2.5 text-slate-300">
              <Users size={15} className="text-slate-500 shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {ev.attendees.map(a => (
                  <span key={a} className="px-2 py-0.5 rounded-full bg-white/[0.05] text-xs text-slate-400">{a}</span>
                ))}
              </div>
            </div>
            {ev.description && (
              <div className="pt-2 border-t border-white/5">
                <p className="text-sm text-slate-400">{ev.description}</p>
              </div>
            )}
            {ev.repeat && ev.repeat !== 'none' && (
              <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                <Repeat size={13} className="text-slate-500" />
                <span>{ev.repeat === 'daily' ? '매일' : ev.repeat === 'weekly' ? '매주' : '매월'} 반복</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-5 pt-4 border-t border-white/5">
            <button onClick={() => openEditModal(ev)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.05] text-sm text-slate-300 hover:bg-white/[0.08] transition-colors">
              <Edit3 size={14} /> 수정
            </button>
            <button onClick={() => handleDelete(ev.id)} className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-rose-500/10 text-sm text-rose-400 hover:bg-rose-500/20 transition-colors">
              <Trash2 size={14} /> 삭제
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ───── Create/Edit Modal ───── */
  const EventModal = () => {
    if (!showModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
        <div className="absolute inset-0 bg-black/50" />
        <div onClick={e => e.stopPropagation()} className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#15152e] p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold">{editingEvent ? '일정 수정' : '새 일정'}</h3>
            <button onClick={() => setShowModal(false)} className="p-1 text-slate-500 hover:text-white"><X size={18} /></button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="일정 제목"
              className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm font-medium focus:border-indigo-500/50 focus:outline-none placeholder:text-slate-600" />

            {/* Date / Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)}
                className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500/50 focus:outline-none [color-scheme:dark]" />
              {!formAllDay && (
                <>
                  <input type="time" value={formStart} onChange={e => setFormStart(e.target.value)}
                    className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500/50 focus:outline-none [color-scheme:dark]" />
                  <input type="time" value={formEnd} onChange={e => setFormEnd(e.target.value)}
                    className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500/50 focus:outline-none [color-scheme:dark]" />
                </>
              )}
            </div>

            {/* All day toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div className={`h-5 w-9 rounded-full transition-colors relative ${formAllDay ? 'bg-indigo-600' : 'bg-white/10'}`}
                onClick={() => setFormAllDay(!formAllDay)}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${formAllDay ? 'left-[18px]' : 'left-0.5'}`} />
              </div>
              <span className="text-sm text-slate-300">종일</span>
            </label>

            {/* Location */}
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={formLocation} onChange={e => setFormLocation(e.target.value)} placeholder="장소"
                className="w-full rounded-xl border border-white/5 bg-white/[0.03] pl-9 pr-4 py-2.5 text-sm focus:border-indigo-500/50 focus:outline-none placeholder:text-slate-600" />
            </div>

            {/* Description */}
            <textarea value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="설명" rows={2}
              className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-sm focus:border-indigo-500/50 focus:outline-none resize-none placeholder:text-slate-600" />

            {/* Color */}
            <div>
              <label className="text-xs text-slate-500 mb-2 block">색상</label>
              <div className="flex gap-2">
                {EVENT_COLORS.map((c, i) => (
                  <button key={c.id} onClick={() => setFormColorIdx(i)}
                    className={`h-7 w-7 rounded-full ${c.bg} transition-all ${formColorIdx === i ? 'ring-2 ring-offset-2 ring-offset-[#15152e] ' + c.ring : 'opacity-50 hover:opacity-80'}`} />
                ))}
              </div>
            </div>

            {/* Attendees */}
            <div className="relative">
              <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={formAttendees} onChange={e => setFormAttendees(e.target.value)} placeholder="참석자 (쉼표 구분)"
                className="w-full rounded-xl border border-white/5 bg-white/[0.03] pl-9 pr-4 py-2.5 text-sm focus:border-indigo-500/50 focus:outline-none placeholder:text-slate-600" />
            </div>

            {/* Repeat & Reminder */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block flex items-center gap-1"><Repeat size={11} /> 반복</label>
                <select value={formRepeat} onChange={e => setFormRepeat(e.target.value as CalEvent['repeat'])}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500/50 focus:outline-none [color-scheme:dark]">
                  <option value="none">없음</option><option value="daily">매일</option><option value="weekly">매주</option><option value="monthly">매월</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block flex items-center gap-1"><Bell size={11} /> 알림</label>
                <select value={formReminder} onChange={e => setFormReminder(e.target.value as CalEvent['reminder'])}
                  className="w-full rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500/50 focus:outline-none [color-scheme:dark]">
                  <option value="none">없음</option><option value="5">5분 전</option><option value="15">15분 전</option><option value="30">30분 전</option><option value="60">1시간 전</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
            {editingEvent && (
              <button onClick={() => handleDelete(editingEvent.id)} className="px-4 py-2.5 rounded-xl bg-rose-500/10 text-sm text-rose-400 hover:bg-rose-500/20 transition-colors">
                <Trash2 size={14} />
              </button>
            )}
            <div className="flex-1" />
            <button onClick={() => setShowModal(false)} className="px-4 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
            <button onClick={handleSave} disabled={!formTitle.trim() || !formDate}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-30 transition-colors">
              {editingEvent ? '수정' : '등록'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ───── Side Panel (day detail when date selected) ───── */
  const SidePanel = () => {
    if (!selectedDate) return null;
    const dayEvents = getEventsForDate(selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));
    return (
      <div className="hidden lg:block w-[280px] shrink-0 border-l border-white/5 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">
            {selectedDate === TODAY && <span className="text-indigo-400 mr-1">오늘</span>}
            {formatDate(selectedDate)}
          </h3>
          <button onClick={() => openCreateModal(selectedDate)} className="p-1 text-slate-500 hover:text-indigo-400 transition-colors">
            <Plus size={16} />
          </button>
        </div>
        {dayEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={24} className="mx-auto mb-2 text-slate-700" />
            <p className="text-xs text-slate-600">일정이 없습니다</p>
            <button onClick={() => openCreateModal(selectedDate)} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">+ 일정 추가</button>
          </div>
        ) : (
          <div className="space-y-2">
            {dayEvents.map(ev => (
              <button key={ev.id} onClick={() => setSelectedEvent(ev)}
                className="w-full text-left p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.03] transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`h-2 w-2 rounded-full ${ev.color.dot}`} />
                  <span className="text-sm font-medium text-slate-200 truncate">{ev.title}</span>
                </div>
                <div className="ml-4 space-y-0.5">
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock size={10} /> {ev.allDay ? '종일' : `${ev.startTime} - ${ev.endTime}`}
                  </p>
                  {ev.location && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <MapPin size={10} /> {ev.location}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-600 flex items-center gap-1">
                    <Users size={10} /> {ev.attendees.join(', ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ───── View mode icons ───── */
  const viewModes: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
    { key: 'month', label: '월', icon: <LayoutGrid size={14} /> },
    { key: 'week', label: '주', icon: <Columns size={14} /> },
    { key: 'day', label: '일', icon: <AlignJustify size={14} /> },
    { key: 'list', label: '목록', icon: <List size={14} /> },
  ];

  /* ───── Main Render ───── */
  return (
    <div className="h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.24))]">
      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 mb-3 text-xs text-amber-300">
          데모 모드 &mdash; 일정은 로컬에서만 유지됩니다.
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={prev} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"><ChevronLeft size={18} /></button>
          <h1 className="text-sm md:text-base font-bold min-w-[140px] text-center">{headerLabel}</h1>
          <button onClick={next} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors"><ChevronRight size={18} /></button>
          <button onClick={goToday} className="ml-2 px-3 py-1.5 text-xs text-slate-400 border border-white/5 rounded-lg hover:text-white hover:bg-white/[0.05] transition-colors">오늘</button>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-white/[0.03] rounded-lg border border-white/5 overflow-hidden">
            {viewModes.map(v => (
              <button key={v.key} onClick={() => setViewMode(v.key)}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs transition-colors ${viewMode === v.key ? 'bg-indigo-600/15 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                {v.icon}
                <span className="hidden md:inline">{v.label}</span>
              </button>
            ))}
          </div>
          <button onClick={() => openCreateModal()} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
            <Plus size={14} /> <span className="hidden md:inline">일정 추가</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100%-theme(spacing.20))] rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
        {viewMode === 'month' && <MonthView />}
        {viewMode === 'week' && <WeekView />}
        {viewMode === 'day' && <DayView />}
        {viewMode === 'list' && <ListView />}
        {viewMode === 'month' && <SidePanel />}
      </div>

      {/* Modals */}
      <EventDetail />
      <EventModal />
    </div>
  );
}

/* ───── Utility ───── */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
