"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Clock } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

interface CalendarEvent {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string;
    type: '회의' | '행사' | '미팅' | '리뷰' | '마감' | '기타';
    description?: string;
}

const typeColors: Record<string, string> = {
    '회의': 'bg-blue-100 text-blue-700',
    '행사': 'bg-purple-100 text-purple-700',
    '미팅': 'bg-green-100 text-green-700',
    '리뷰': 'bg-amber-100 text-amber-700',
    '마감': 'bg-red-100 text-red-700',
    '기타': 'bg-neutral-100 text-neutral-600',
};

const initialEvents: CalendarEvent[] = [
    { id: 'e-1', title: '주간 팀 회의', date: '2026-03-20', time: '10:00', type: '회의', description: '주간 업무 공유 및 이슈 논의' },
    { id: 'e-2', title: 'MADLeap 5기 정기 모임', date: '2026-03-20', time: '14:00', type: '행사' },
    { id: 'e-3', title: 'CJ ENM 콜라보 미팅', date: '2026-03-21', time: '11:00', type: '미팅', description: '콜라보레이션 기획 논의' },
    { id: 'e-4', title: '콘텐츠 파이프라인 리뷰', date: '2026-03-21', time: '15:00', type: '리뷰' },
    { id: 'e-5', title: 'Badak 월간 밋업', date: '2026-03-25', time: '19:00', type: '행사', description: '네트워킹 이벤트' },
    { id: 'e-6', title: 'GPR 자기평가 마감', date: '2026-03-31', time: '18:00', type: '마감', description: 'ERP > HR > GPR에서 완료' },
    { id: 'e-7', title: 'LUKI 콘텐츠 촬영', date: '2026-03-22', time: '09:00', type: '기타', description: '스튜디오 A' },
    { id: 'e-8', title: '마케팅 전략 회의', date: '2026-03-24', time: '10:00', type: '회의' },
    { id: 'e-9', title: 'Vrief 교육', date: '2026-03-27', time: '14:00', type: '행사', description: '프레임워크 실습' },
];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarPage() {
    const { user } = useAuth();
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [edTitle, setEdTitle] = useState('');
    const [edDate, setEdDate] = useState('');
    const [edTime, setEdTime] = useState('10:00');
    const [edType, setEdType] = useState<CalendarEvent['type']>('회의');
    const [edDesc, setEdDesc] = useState('');

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const getEventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);

    const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

    const handleAddEvent = () => {
        if (!edTitle.trim() || !edDate) return;
        setEvents(prev => [...prev, {
            id: `e-${Date.now()}`, title: edTitle, date: edDate, time: edTime, type: edType,
            description: edDesc || undefined,
        }]);
        setEdTitle(''); setEdDate(''); setEdTime('10:00'); setEdType('회의'); setEdDesc('');
        setShowEditor(false);
    };

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">사내 일정</h1>
                    <p className="text-sm text-neutral-500 mt-1">팀 일정과 주요 이벤트</p>
                </div>
                <button onClick={() => { setShowEditor(true); setEdDate(selectedDate || todayStr); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors">
                    <Plus className="h-4 w-4" /> 일정 등록
                </button>
            </div>

            <div className="grid grid-cols-[1fr_320px] gap-6">
                {/* Calendar grid */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <button onClick={prevMonth} className="p-1 hover:bg-neutral-100 rounded transition-colors">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <h2 className="text-sm font-semibold">{year}년 {MONTHS[month]}</h2>
                        <button onClick={nextMonth} className="p-1 hover:bg-neutral-100 rounded transition-colors">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7">
                        {DAYS.map(d => (
                            <div key={d} className="px-2 py-2 text-center text-[10px] font-medium text-neutral-400 border-b border-neutral-100">
                                {d}
                            </div>
                        ))}
                        {cells.map((day, i) => {
                            if (day === null) return <div key={i} className="h-24 border-b border-r border-neutral-50" />;
                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const dayEvents = getEventsForDate(dateStr);
                            const isToday = dateStr === todayStr;
                            const isSelected = dateStr === selectedDate;
                            return (
                                <button key={i} onClick={() => setSelectedDate(dateStr)}
                                    className={clsx(
                                        "h-24 border-b border-r border-neutral-50 p-1 text-left align-top hover:bg-neutral-50 transition-colors",
                                        isSelected && "bg-neutral-50 ring-1 ring-neutral-300"
                                    )}>
                                    <span className={clsx(
                                        "inline-flex items-center justify-center w-6 h-6 text-xs",
                                        isToday ? "bg-neutral-900 text-white rounded-full font-bold" : "text-neutral-700",
                                        i % 7 === 0 && "text-red-400",
                                        i % 7 === 6 && "text-blue-400",
                                    )}>{day}</span>
                                    <div className="mt-0.5 space-y-0.5">
                                        {dayEvents.slice(0, 3).map(ev => (
                                            <div key={ev.id} className={clsx("text-[9px] px-1 py-0.5 rounded truncate", typeColors[ev.type])}>
                                                {ev.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <p className="text-[9px] text-neutral-400 px-1">+{dayEvents.length - 3}개</p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Side panel */}
                <div className="border border-neutral-200 bg-white self-start">
                    <div className="px-5 py-4 border-b border-neutral-100">
                        <h3 className="text-sm font-semibold">
                            {selectedDate || todayStr}
                        </h3>
                    </div>
                    {selectedEvents.length > 0 ? (
                        <ul className="divide-y divide-neutral-50">
                            {selectedEvents.sort((a, b) => a.time.localeCompare(b.time)).map(ev => (
                                <li key={ev.id} className="px-5 py-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={clsx("text-[10px] px-1.5 py-0.5 rounded font-medium", typeColors[ev.type])}>{ev.type}</span>
                                        <span className="text-xs text-neutral-400 flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {ev.time}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium">{ev.title}</p>
                                    {ev.description && <p className="text-xs text-neutral-400 mt-0.5">{ev.description}</p>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-5 py-8 text-center text-sm text-neutral-400">
                            일정이 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* Event editor */}
            {showEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md shadow-xl">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold">일정 등록</h2>
                            <button onClick={() => setShowEditor(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">제목</label>
                                <input value={edTitle} onChange={e => setEdTitle(e.target.value)}
                                    className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none"
                                    placeholder="일정 제목" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-neutral-700 block mb-1">날짜</label>
                                    <input type="date" value={edDate} onChange={e => setEdDate(e.target.value)}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-neutral-700 block mb-1">시간</label>
                                    <input type="time" value={edTime} onChange={e => setEdTime(e.target.value)}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">유형</label>
                                <div className="flex flex-wrap gap-2">
                                    {(['회의', '행사', '미팅', '리뷰', '마감', '기타'] as const).map(t => (
                                        <button key={t} onClick={() => setEdType(t)}
                                            className={clsx("px-3 py-1.5 text-xs border rounded transition-colors",
                                                edType === t ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"
                                            )}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-1">설명</label>
                                <textarea value={edDesc} onChange={e => setEdDesc(e.target.value)}
                                    className="w-full border border-neutral-200 px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none resize-none"
                                    rows={3} placeholder="선택사항" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
                            <button onClick={() => setShowEditor(false)}
                                className="px-5 py-2.5 text-sm text-neutral-500 hover:text-neutral-900">취소</button>
                            <button onClick={handleAddEvent}
                                className="px-5 py-2.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors">등록</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
