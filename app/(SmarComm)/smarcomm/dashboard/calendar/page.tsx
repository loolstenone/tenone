'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { MOCK_CALENDAR } from '@/lib/smarcomm/dashboard-data';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import PageTopBar from '@/components/smarcomm/PageTopBar';
import GuideHelpButton from '@/components/smarcomm/GuideHelpButton';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // 2026년 3월
  const [events, setEvents] = useState(MOCK_CALENDAR);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState<'campaign' | 'video' | 'season' | 'content'>('campaign');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });

  const pc = getChartColors(7);
  const typeColors = { campaign: pc[0], video: pc[1], season: pc[2], content: pc[3] };
  const typeLabels = { campaign: '캠페인', video: '영상', season: '시즌', content: '콘텐츠' };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const handleAdd = () => {
    if (!newTitle || !newDate) return;
    setEvents([...events, { id: `e${Date.now()}`, title: newTitle, date: newDate, type: newType, color: typeColors[newType] }]);
    setNewTitle(''); setNewDate('');
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>
      <div className="flex items-center gap-2 mb-6"><h1 className="text-xl font-bold text-text">마케팅 캘린더</h1><GuideHelpButton /></div>

      {/* Month Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={prevMonth} className="rounded-lg border border-border p-2 hover:bg-surface"><ChevronLeft size={16} /></button>
        <span className="text-base font-semibold text-text">{year}년 {month + 1}월</span>
        <button onClick={nextMonth} className="rounded-lg border border-border p-2 hover:bg-surface"><ChevronRight size={16} /></button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6 rounded-2xl border border-border bg-white overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border bg-surface">
          {['일', '월', '화', '수', '목', '금', '토'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-text-muted">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            return (
              <div key={i} className={`min-h-[80px] border-b border-r border-border p-1 ${day ? '' : 'bg-surface/50'}`}>
                {day && (
                  <>
                    <div className={`mb-0.5 text-xs ${isToday ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-text text-white' : 'text-text-sub'}`}>{day}</div>
                    {dayEvents.map(e => (
                      <div key={e.id} className="mb-0.5 truncate rounded px-1 py-0.5 text-[10px] font-medium text-white" style={{ background: e.color }}>
                        {e.title}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-text">일정 추가</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="일정 제목" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none" />
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-text focus:outline-none" />
          <select value={newType} onChange={e => setNewType(e.target.value as typeof newType)} className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text focus:border-text focus:outline-none">
            {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={handleAdd} className="flex items-center justify-center gap-1 rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white hover:bg-accent-sub">
            <Plus size={15} /> 추가
          </button>
        </div>
      </div>
    </div>
  );
}
