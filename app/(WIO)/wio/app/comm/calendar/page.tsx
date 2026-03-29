'use client';

import { useState } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, Users, X } from 'lucide-react';
import { useWIO } from '../../layout';

type CalEvent = {
  id: string; title: string; date: string; startTime: string; endTime: string;
  attendees: string[]; color: string; description?: string;
};

const MOCK_EVENTS: CalEvent[] = [
  { id: 'e1', title: '1분기 전략 회의', date: '2026-03-31', startTime: '10:00', endTime: '12:00', attendees: ['김대표', '박개발', '이마케팅'], color: 'bg-indigo-500', description: '각 팀별 1분기 성과 리뷰 및 2분기 계획' },
  { id: 'e2', title: 'WIO v2.2 스프린트 계획', date: '2026-03-31', startTime: '14:00', endTime: '15:30', attendees: ['박개발', '이프론트', '정백엔드'], color: 'bg-emerald-500' },
  { id: 'e3', title: 'SmarComm 캠페인 리뷰', date: '2026-04-01', startTime: '11:00', endTime: '12:00', attendees: ['이마케팅', '윤기획'], color: 'bg-amber-500' },
  { id: 'e4', title: '신규 입사자 온보딩', date: '2026-04-01', startTime: '09:00', endTime: '17:00', attendees: ['최인사', '신규3명'], color: 'bg-rose-500' },
  { id: 'e5', title: 'MAD League 기획 회의', date: '2026-04-02', startTime: '15:00', endTime: '16:00', attendees: ['윤기획', '정디자인'], color: 'bg-violet-500' },
  { id: 'e6', title: '월간 타운홀', date: '2026-04-03', startTime: '16:00', endTime: '17:00', attendees: ['전체'], color: 'bg-indigo-500', description: '전사 월간 타운홀 미팅' },
  { id: 'e7', title: 'LUKI 브랜드 리뷰', date: '2026-04-04', startTime: '10:00', endTime: '11:00', attendees: ['정디자인', '김대표'], color: 'bg-pink-500' },
  { id: 'e8', title: '4월 워크숍', date: '2026-04-11', startTime: '14:00', endTime: '18:00', attendees: ['전체'], color: 'bg-emerald-500', description: 'AI 시대의 팀 협업' },
];

export default function CalendarPage() {
  const { tenant } = useWIO();
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 29)); // March 2026
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');
  const [newAttendees, setNewAttendees] = useState('');

  if (!tenant) return null;
  const isDemo = tenant.id === 'demo';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = '2026-03-29';

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const eventsForDay = (day: number) => events.filter(e => e.date === getDateStr(day));

  const todayEvents = events.filter(e => e.date === today);
  const weekEnd = new Date(2026, 2, 29 + (7 - new Date(2026, 2, 29).getDay()));
  const weekEndStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
  const thisWeekEvents = events.filter(e => e.date >= today && e.date <= weekEndStr);

  const handleAdd = () => {
    if (!newTitle || !newDate) return;
    const ev: CalEvent = {
      id: `e${Date.now()}`, title: newTitle, date: newDate, startTime: newStart, endTime: newEnd,
      attendees: newAttendees.split(',').map(s => s.trim()).filter(Boolean), color: 'bg-indigo-500',
    };
    setEvents(prev => [...prev, ev]);
    setNewTitle(''); setNewDate(''); setNewStart('09:00'); setNewEnd('10:00'); setNewAttendees(''); setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">캘린더</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
          <Plus size={15} /> 일정 추가
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 mb-4 text-sm text-amber-300">
          데모 모드입니다.
        </div>
      )}

      {showForm && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="일정 제목"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          <div className="grid grid-cols-3 gap-3">
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
            <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <input value={newAttendees} onChange={e => setNewAttendees(e.target.value)} placeholder="참석자 (쉼표 구분)"
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">취소</button>
            <button onClick={handleAdd} disabled={!newTitle || !newDate}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors">등록</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 캘린더 그리드 */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-white"><ChevronLeft size={18} /></button>
            <h2 className="text-sm font-semibold">{year}년 {month + 1}월</h2>
            <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-white"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-slate-500 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const dateStr = getDateStr(day);
              const dayEvents = eventsForDay(day);
              const isToday = dateStr === today;
              return (
                <button key={i} onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                  className={`relative rounded-lg p-1.5 text-left min-h-[60px] transition-colors ${isToday ? 'bg-indigo-600/10 ring-1 ring-indigo-500/30' : 'hover:bg-white/[0.04]'} ${selectedDate === dateStr ? 'bg-white/[0.06]' : ''}`}>
                  <span className={`text-xs ${isToday ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}>{day}</span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div key={ev.id} className={`${ev.color} rounded px-1 py-0.5 text-[9px] text-white truncate`}>{ev.title}</div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-[9px] text-slate-500">+{dayEvents.length - 2}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 일정 목록 */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Calendar size={14} className="text-indigo-400" /> 오늘 일정</h3>
            {todayEvents.length === 0 ? (
              <p className="text-xs text-slate-500">오늘 일정이 없습니다</p>
            ) : todayEvents.map(ev => (
              <div key={ev.id} className="flex items-start gap-2 mb-2.5 last:mb-0">
                <div className={`w-1 h-full min-h-[32px] rounded-full ${ev.color}`} />
                <div>
                  <div className="text-sm font-medium">{ev.title}</div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-0.5"><Clock size={9} /> {ev.startTime}-{ev.endTime}</span>
                    <span className="flex items-center gap-0.5"><Users size={9} /> {ev.attendees.length}명</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <h3 className="text-sm font-semibold mb-3">이번 주 일정</h3>
            {thisWeekEvents.length === 0 ? (
              <p className="text-xs text-slate-500">이번 주 일정이 없습니다</p>
            ) : thisWeekEvents.map(ev => (
              <div key={ev.id} className="flex items-start gap-2 mb-2.5 last:mb-0">
                <div className={`w-1 h-full min-h-[32px] rounded-full ${ev.color}`} />
                <div>
                  <div className="text-sm font-medium">{ev.title}</div>
                  <div className="text-[10px] text-slate-500">{ev.date.slice(5)} {ev.startTime}-{ev.endTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
