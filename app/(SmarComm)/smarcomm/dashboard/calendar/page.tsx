'use client';

// 마케팅 캘린더 — events + comm_events 통합 (월 단위)
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

interface CalEvent {
    id: string;
    title: string;
    description: string;
    start_at: string;
    end_at: string | null;
    all_day: boolean;
    location: string;
    color: string;
    source: 'events' | 'comm_events';
    kind: string;
}

interface CalResp { month: string; total: number; events: CalEvent[] }

function ymKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function CalendarPage() {
    const [cursor, setCursor] = useState<Date>(() => new Date());
    const [data, setData] = useState<CalResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/smarcomm/calendar?month=${ymKey(cursor)}`)
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, [cursor]);

    const grid = useMemo(() => {
        const y = cursor.getFullYear();
        const m = cursor.getMonth();
        const firstDay = new Date(y, m, 1).getDay();
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const cells: { day: number | null; events: CalEvent[] }[] = [];
        for (let i = 0; i < firstDay; i++) cells.push({ day: null, events: [] });
        for (let d = 1; d <= daysInMonth; d++) {
            const events = (data?.events ?? []).filter(e => {
                const dt = new Date(e.start_at);
                return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
            });
            cells.push({ day: d, events });
        }
        return cells;
    }, [cursor, data]);

    const selectedEvents = selectedDay
        ? (data?.events ?? []).filter(e => {
            const dt = new Date(e.start_at);
            return dt.getFullYear() === cursor.getFullYear() && dt.getMonth() === cursor.getMonth() && dt.getDate() === selectedDay;
        })
        : (data?.events ?? []).slice(0, 5);

    return (
        <div className="max-w-6xl">
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-text">마케팅 캘린더</h1>
                        <GuideHelpButton />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">이벤트·캠페인·발송 일정을 통합 관리합니다</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                        className="rounded-lg border border-border bg-white p-1.5 hover:bg-surface">
                        <ChevronLeft size={14} />
                    </button>
                    <span className="text-sm font-semibold text-text min-w-[100px] text-center">
                        {cursor.getFullYear()}.{String(cursor.getMonth() + 1).padStart(2, '0')}
                    </span>
                    <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                        className="rounded-lg border border-border bg-white p-1.5 hover:bg-surface">
                        <ChevronRight size={14} />
                    </button>
                    <button onClick={() => { setCursor(new Date()); setSelectedDay(null); }}
                        className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs hover:bg-surface">오늘</button>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Kpi label="이번 달 일정" value={data?.total ?? 0} loading={loading} accent="#0F172A" />
                <Kpi label="일반 이벤트" value={(data?.events ?? []).filter(e => e.source === 'events').length} loading={loading} accent="#3b82f6" />
                <Kpi label="커뮤니케이션" value={(data?.events ?? []).filter(e => e.source === 'comm_events').length} loading={loading} accent="#8b5cf6" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="rounded-2xl border border-border bg-white p-4">
                    <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-text-muted text-center">
                        {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {grid.map((cell, i) => {
                            const isSelected = cell.day === selectedDay;
                            return (
                                <button key={i}
                                    onClick={() => cell.day && setSelectedDay(cell.day)}
                                    disabled={!cell.day}
                                    className={`aspect-square rounded-lg border p-1.5 text-left text-xs transition-colors ${cell.day ? (isSelected ? 'border-text bg-surface' : 'border-border hover:bg-surface') : 'border-transparent'}`}>
                                    {cell.day && (
                                        <>
                                            <div className="font-medium text-text-sub">{cell.day}</div>
                                            <div className="mt-1 space-y-0.5">
                                                {cell.events.slice(0, 2).map(e => (
                                                    <div key={e.id} className="truncate rounded px-1 py-px text-[9px] text-white"
                                                        style={{ background: e.color }}>{e.title}</div>
                                                ))}
                                                {cell.events.length > 2 && (
                                                    <div className="text-[9px] text-text-muted">+{cell.events.length - 2}</div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-white p-5">
                    <h2 className="mb-3 text-sm font-semibold text-text">
                        {selectedDay ? `${cursor.getMonth() + 1}/${selectedDay} 일정` : '곧 다가오는 일정'}
                    </h2>
                    {selectedEvents.length === 0 && <div className="text-xs text-text-muted">예정된 일정이 없습니다</div>}
                    <div className="space-y-3">
                        {selectedEvents.map(e => (
                            <div key={e.id} className="border-l-2 pl-3" style={{ borderColor: e.color }}>
                                <div className="text-xs font-semibold text-text">{e.title}</div>
                                <div className="mt-0.5 text-[10px] text-text-muted">
                                    {new Date(e.start_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {e.location && (
                                    <div className="mt-0.5 flex items-center gap-1 text-[10px] text-text-muted">
                                        <MapPin size={9} /> {e.location}
                                    </div>
                                )}
                                {e.kind && e.kind !== 'general' && (
                                    <span className="mt-1 inline-block rounded-full bg-surface px-1.5 py-0.5 text-[9px] text-text-sub">{e.kind}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted leading-relaxed">
                <strong className="text-text-sub">🔬 출처</strong> · DB <code className="font-mono text-[10px]">events</code> + <code className="font-mono text-[10px]">comm_events</code> · 일반 일정과 커뮤니케이션 이벤트(공지/캠페인 마감 등) 통합. WIO 일정 모듈과 동일 테이블 공유.
            </div>
        </div>
    );
}

function Kpi({ label, value, accent, loading }: { label: string; value: number; accent: string; loading: boolean }) {
    return (
        <div className="rounded-2xl border border-border bg-white p-4">
            <div className="text-xs text-text-muted">{label}</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: accent }}>{loading ? '—' : value.toLocaleString()}</div>
        </div>
    );
}
