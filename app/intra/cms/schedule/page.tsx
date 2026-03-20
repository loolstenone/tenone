"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Clock, Edit2, Trash2, Globe, Lock } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

type EventVisibility = 'public' | 'internal';
type EventType = '회의' | '행사' | '미팅' | '리뷰' | '마감' | '교육' | '공지' | '기타';

interface CompanyEvent {
    id: string;
    title: string;
    date: string;
    endDate?: string;
    time: string;
    endTime?: string;
    type: EventType;
    description?: string;
    location?: string;
    visibility: EventVisibility;
    createdBy: string;
}

const typeColors: Record<string, string> = {
    '회의': 'bg-blue-100 text-blue-700',
    '행사': 'bg-purple-100 text-purple-700',
    '미팅': 'bg-green-100 text-green-700',
    '리뷰': 'bg-amber-100 text-amber-700',
    '마감': 'bg-red-100 text-red-700',
    '교육': 'bg-indigo-100 text-indigo-700',
    '공지': 'bg-neutral-800 text-white',
    '기타': 'bg-neutral-100 text-neutral-600',
};

const initialEvents: CompanyEvent[] = [
    { id: 'ce-1', title: '주간 팀 회의', date: '2026-03-20', time: '10:00', endTime: '11:00', type: '회의', visibility: 'internal', createdBy: 'Cheonil Jeon', location: '회의실 A' },
    { id: 'ce-2', title: 'MADLeap 5기 정기 모임', date: '2026-03-20', time: '14:00', endTime: '17:00', type: '행사', visibility: 'internal', createdBy: 'Cheonil Jeon' },
    { id: 'ce-3', title: 'CJ ENM 콜라보 미팅', date: '2026-03-21', time: '11:00', endTime: '12:00', type: '미팅', visibility: 'internal', createdBy: 'Sarah Kim', location: 'CJ ENM 본사' },
    { id: 'ce-4', title: '콘텐츠 파이프라인 리뷰', date: '2026-03-21', time: '15:00', type: '리뷰', visibility: 'internal', createdBy: 'Cheonil Jeon' },
    { id: 'ce-5', title: 'Badak 월간 밋업', date: '2026-03-25', time: '19:00', endTime: '21:00', type: '행사', visibility: 'public', createdBy: 'Cheonil Jeon', description: '네트워킹 이벤트', location: '역삼 캠퍼스' },
    { id: 'ce-6', title: 'GPR 자기평가 마감', date: '2026-03-31', time: '18:00', type: '마감', visibility: 'internal', createdBy: 'Cheonil Jeon' },
    { id: 'ce-7', title: 'LUKI 콘텐츠 촬영', date: '2026-03-22', time: '09:00', endTime: '18:00', type: '기타', visibility: 'internal', createdBy: 'Sarah Kim', location: '스튜디오 A' },
    { id: 'ce-8', title: '마케팅 전략 회의', date: '2026-03-24', time: '10:00', endTime: '11:30', type: '회의', visibility: 'internal', createdBy: 'Cheonil Jeon' },
    { id: 'ce-9', title: 'Vrief 프레임워크 교육', date: '2026-03-27', time: '14:00', endTime: '17:00', type: '교육', visibility: 'internal', createdBy: 'Cheonil Jeon', description: '실습 중심 교육' },
    { id: 'ce-10', title: '전사 타운홀 미팅', date: '2026-04-01', time: '10:00', endTime: '11:30', type: '공지', visibility: 'internal', createdBy: 'Cheonil Jeon', description: '2026 Q2 전략 공유', location: '온라인' },
];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const eventTypes: EventType[] = ['회의', '행사', '미팅', '리뷰', '마감', '교육', '공지', '기타'];

export default function CmsSchedulePage() {
    const { user } = useAuth();
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [events, setEvents] = useState<CompanyEvent[]>(initialEvents);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CompanyEvent | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [filterType, setFilterType] = useState<EventType | 'all'>('all');

    // Editor state
    const [edTitle, setEdTitle] = useState('');
    const [edDate, setEdDate] = useState('');
    const [edEndDate, setEdEndDate] = useState('');
    const [edTime, setEdTime] = useState('10:00');
    const [edEndTime, setEdEndTime] = useState('');
    const [edType, setEdType] = useState<EventType>('회의');
    const [edDesc, setEdDesc] = useState('');
    const [edLocation, setEdLocation] = useState('');
    const [edVisibility, setEdVisibility] = useState<EventVisibility>('internal');

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const filteredEvents = filterType === 'all' ? events : events.filter(e => e.type === filterType);
    const getEventsForDate = (d: string) => filteredEvents.filter(e => e.date === d || (e.endDate && e.date <= d && e.endDate >= d));
    const selectedEvents = selectedDate ? getEventsForDate(selectedDate).sort((a, b) => a.time.localeCompare(b.time)) : [];

    // List view: upcoming events
    const upcomingEvents = [...filteredEvents].filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    const openEditor = (ev?: CompanyEvent) => {
        if (ev) {
            setEditingEvent(ev);
            setEdTitle(ev.title); setEdDate(ev.date); setEdEndDate(ev.endDate || '');
            setEdTime(ev.time); setEdEndTime(ev.endTime || '');
            setEdType(ev.type); setEdDesc(ev.description || '');
            setEdLocation(ev.location || ''); setEdVisibility(ev.visibility);
        } else {
            setEditingEvent(null);
            setEdTitle(''); setEdDate(selectedDate || todayStr); setEdEndDate('');
            setEdTime('10:00'); setEdEndTime(''); setEdType('회의');
            setEdDesc(''); setEdLocation(''); setEdVisibility('internal');
        }
        setShowEditor(true);
    };

    const handleSave = () => {
        if (!edTitle.trim() || !edDate) return;
        const ev: CompanyEvent = {
            id: editingEvent?.id || `ce-${Date.now()}`,
            title: edTitle, date: edDate, endDate: edEndDate || undefined,
            time: edTime, endTime: edEndTime || undefined,
            type: edType, description: edDesc || undefined,
            location: edLocation || undefined, visibility: edVisibility,
            createdBy: user?.name || 'Unknown',
        };
        if (editingEvent) {
            setEvents(prev => prev.map(e => e.id === ev.id ? ev : e));
        } else {
            setEvents(prev => [...prev, ev]);
        }
        setShowEditor(false);
    };

    const handleDelete = (id: string) => {
        if (!confirm('일정을 삭제하시겠습니까?')) return;
        setEvents(prev => prev.filter(e => e.id !== id));
    };

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">회사 일정 관리</h1>
                    <p className="text-sm text-neutral-500 mt-1">전사 일정을 등록하고 관리합니다. 공개 일정은 퍼블릭 사이트에도 노출됩니다.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex border border-neutral-200 rounded overflow-hidden">
                        <button onClick={() => setViewMode('calendar')}
                            className={clsx("px-3 py-1.5 text-xs", viewMode === 'calendar' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500')}>
                            캘린더
                        </button>
                        <button onClick={() => setViewMode('list')}
                            className={clsx("px-3 py-1.5 text-xs", viewMode === 'list' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500')}>
                            리스트
                        </button>
                    </div>
                    <select value={filterType} onChange={e => setFilterType(e.target.value as EventType | 'all')}
                        className="border border-neutral-200 px-3 py-1.5 text-xs focus:outline-none bg-white rounded">
                        <option value="all">전체 유형</option>
                        {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button onClick={() => openEditor()}
                        className="flex items-center gap-2 px-4 py-1.5 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors rounded">
                        <Plus className="h-4 w-4" /> 일정 등록
                    </button>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <div className="grid grid-cols-[1fr_320px] gap-5">
                    {/* Calendar */}
                    <div className="border border-neutral-200 bg-white rounded">
                        <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
                            <button onClick={prevMonth} className="p-1 hover:bg-neutral-100 rounded"><ChevronLeft className="h-4 w-4" /></button>
                            <h2 className="text-sm font-semibold">{year}년 {MONTHS[month]}</h2>
                            <button onClick={nextMonth} className="p-1 hover:bg-neutral-100 rounded"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                        <div className="grid grid-cols-7">
                            {DAYS.map(d => (
                                <div key={d} className="px-2 py-2 text-center text-[10px] font-medium text-neutral-400 border-b border-neutral-100">{d}</div>
                            ))}
                            {cells.map((day, i) => {
                                if (day === null) return <div key={i} className="h-24 border-b border-r border-neutral-50" />;
                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                const dayEvents = getEventsForDate(dateStr);
                                const isToday = dateStr === todayStr;
                                const isSelected = dateStr === selectedDate;
                                return (
                                    <button key={i} onClick={() => setSelectedDate(dateStr)}
                                        className={clsx("h-24 border-b border-r border-neutral-50 p-1 text-left align-top hover:bg-neutral-50 transition-colors",
                                            isSelected && "bg-neutral-50 ring-1 ring-neutral-300")}>
                                        <span className={clsx("inline-flex items-center justify-center w-6 h-6 text-xs",
                                            isToday ? "bg-neutral-900 text-white rounded-full font-bold" : "text-neutral-700",
                                            i % 7 === 0 && "text-red-400", i % 7 === 6 && "text-blue-400"
                                        )}>{day}</span>
                                        <div className="mt-0.5 space-y-0.5">
                                            {dayEvents.slice(0, 3).map(ev => (
                                                <div key={ev.id} className={clsx("text-[9px] px-1 py-0.5 rounded truncate flex items-center gap-0.5", typeColors[ev.type])}>
                                                    {ev.visibility === 'public' && <Globe className="h-2 w-2 shrink-0" />}
                                                    {ev.title}
                                                </div>
                                            ))}
                                            {dayEvents.length > 3 && <p className="text-[9px] text-neutral-400 px-1">+{dayEvents.length - 3}</p>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Side panel */}
                    <div className="border border-neutral-200 bg-white rounded self-start">
                        <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
                            <h3 className="text-sm font-semibold">{selectedDate || todayStr}</h3>
                            <button onClick={() => openEditor()} className="text-[10px] text-neutral-400 hover:text-neutral-900">+ 추가</button>
                        </div>
                        {selectedEvents.length > 0 ? (
                            <ul className="divide-y divide-neutral-50">
                                {selectedEvents.map(ev => (
                                    <li key={ev.id} className="px-4 py-3 group">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={clsx("text-[9px] px-1.5 py-0.5 rounded font-medium", typeColors[ev.type])}>{ev.type}</span>
                                            <span className="text-[10px] text-neutral-400 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {ev.time}{ev.endTime ? `–${ev.endTime}` : ''}</span>
                                            {ev.visibility === 'public' ? (
                                                <Globe className="h-2.5 w-2.5 text-green-500" />
                                            ) : (
                                                <Lock className="h-2.5 w-2.5 text-neutral-300" />
                                            )}
                                        </div>
                                        <p className="text-sm font-medium">{ev.title}</p>
                                        {ev.location && <p className="text-[10px] text-neutral-400 mt-0.5">{ev.location}</p>}
                                        {ev.description && <p className="text-[10px] text-neutral-400 mt-0.5">{ev.description}</p>}
                                        <div className="hidden group-hover:flex gap-1 mt-2">
                                            <button onClick={() => openEditor(ev)} className="text-[10px] text-neutral-400 hover:text-neutral-900 flex items-center gap-0.5">
                                                <Edit2 className="h-2.5 w-2.5" /> 수정
                                            </button>
                                            <button onClick={() => handleDelete(ev.id)} className="text-[10px] text-neutral-400 hover:text-red-500 flex items-center gap-0.5 ml-2">
                                                <Trash2 className="h-2.5 w-2.5" /> 삭제
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-4 py-8 text-center text-xs text-neutral-400">일정이 없습니다.</div>
                        )}
                    </div>
                </div>
            ) : (
                /* List view */
                <div className="border border-neutral-200 bg-white rounded">
                    <div className="grid grid-cols-[100px_1fr_100px_80px_80px_60px] px-4 py-2.5 text-[10px] font-medium text-neutral-400 uppercase border-b border-neutral-200 bg-neutral-50">
                        <span>날짜</span><span>일정</span><span>시간</span><span>유형</span><span>장소</span><span>공개</span>
                    </div>
                    {upcomingEvents.length === 0 ? (
                        <div className="px-4 py-12 text-center text-sm text-neutral-400">예정된 일정이 없습니다.</div>
                    ) : (
                        upcomingEvents.map(ev => (
                            <div key={ev.id} className="grid grid-cols-[100px_1fr_100px_80px_80px_60px] px-4 py-2.5 border-b border-neutral-50 items-center hover:bg-neutral-50 transition-colors group">
                                <span className="text-xs text-neutral-500">{ev.date}</span>
                                <div>
                                    <p className="text-sm font-medium truncate">{ev.title}</p>
                                    {ev.description && <p className="text-[10px] text-neutral-400 truncate">{ev.description}</p>}
                                </div>
                                <span className="text-xs text-neutral-500">{ev.time}{ev.endTime ? `–${ev.endTime}` : ''}</span>
                                <span className={clsx("text-[9px] px-1.5 py-0.5 rounded font-medium w-fit", typeColors[ev.type])}>{ev.type}</span>
                                <span className="text-[10px] text-neutral-400 truncate">{ev.location || '-'}</span>
                                <div className="flex items-center gap-1">
                                    {ev.visibility === 'public' ? <Globe className="h-3 w-3 text-green-500" /> : <Lock className="h-3 w-3 text-neutral-300" />}
                                    <div className="hidden group-hover:flex gap-1 ml-1">
                                        <button onClick={() => openEditor(ev)} className="text-neutral-400 hover:text-neutral-900"><Edit2 className="h-3 w-3" /></button>
                                        <button onClick={() => handleDelete(ev.id)} className="text-neutral-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Editor modal */}
            {showEditor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg shadow-xl rounded">
                        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold">{editingEvent ? '일정 수정' : '일정 등록'}</h2>
                            <button onClick={() => setShowEditor(false)} className="text-neutral-400 hover:text-neutral-900"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-neutral-500 block mb-1">제목</label>
                                <input value={edTitle} onChange={e => setEdTitle(e.target.value)}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none rounded" placeholder="일정 제목" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-neutral-500 block mb-1">시작일</label>
                                    <input type="date" value={edDate} onChange={e => setEdDate(e.target.value)}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none rounded" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-neutral-500 block mb-1">종료일 (선택)</label>
                                    <input type="date" value={edEndDate} onChange={e => setEdEndDate(e.target.value)}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none rounded" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-neutral-500 block mb-1">시작 시간</label>
                                    <input type="time" value={edTime} onChange={e => setEdTime(e.target.value)}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none rounded" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-neutral-500 block mb-1">종료 시간 (선택)</label>
                                    <input type="time" value={edEndTime} onChange={e => setEdEndTime(e.target.value)}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none rounded" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-500 block mb-1">유형</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {eventTypes.map(t => (
                                        <button key={t} onClick={() => setEdType(t)}
                                            className={clsx("px-2.5 py-1 text-xs border rounded transition-colors",
                                                edType === t ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"
                                            )}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-500 block mb-1">장소</label>
                                <input value={edLocation} onChange={e => setEdLocation(e.target.value)}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none rounded" placeholder="선택사항" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-500 block mb-1">설명</label>
                                <textarea value={edDesc} onChange={e => setEdDesc(e.target.value)}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none resize-none rounded" rows={2} placeholder="선택사항" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-500 block mb-1">공개 범위</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setEdVisibility('internal')}
                                        className={clsx("flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded transition-colors",
                                            edVisibility === 'internal' ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"
                                        )}><Lock className="h-3 w-3" /> 내부 전용</button>
                                    <button onClick={() => setEdVisibility('public')}
                                        className={clsx("flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded transition-colors",
                                            edVisibility === 'public' ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-500 border-neutral-200"
                                        )}><Globe className="h-3 w-3" /> 공개 (사이트 노출)</button>
                                </div>
                            </div>
                        </div>
                        <div className="p-5 border-t border-neutral-100 flex justify-end gap-3">
                            <button onClick={() => setShowEditor(false)} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-900">취소</button>
                            <button onClick={handleSave} className="px-5 py-2 bg-neutral-900 text-white text-sm hover:bg-neutral-800 transition-colors rounded">
                                {editingEvent ? '수정' : '등록'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
