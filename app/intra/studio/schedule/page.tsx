"use client";

import { useState, useEffect } from "react";
import { brands, events as mockEvents } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Clock } from "lucide-react";
import clsx from "clsx";

interface ScheduleEvent {
    id: string | number;
    title: string;
    brandId: string;
    type: string;
    date: string;
    time?: string;
    description?: string;
    status?: string;
}

export default function SchedulePage() {
    const [view, setView] = useState<'month' | 'list'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>([]);

    useEffect(() => {
        const supabase = createClient();
        supabase.from('comm_events').select('*').order('start_at', { ascending: true })
            .then(({ data }: { data: Record<string, unknown>[] | null }) => {
                if (data && data.length > 0) {
                    setEvents(data.map((e: Record<string, unknown>) => {
                        const start = new Date(e.start_at as string);
                        return {
                            id: e.id as string,
                            title: e.title as string,
                            brandId: 'tenone',
                            type: (e.description as string) || '일정',
                            date: start.toISOString().split('T')[0],
                            time: start.toTimeString().slice(0, 5),
                            description: (e.description as string) || '',
                        };
                    }));
                } else {
                    setEvents(mockEvents.map(e => ({ ...e, id: String(e.id) })));
                }
            })
            .catch(() => setEvents(mockEvents.map(e => ({ ...e, id: String(e.id) }))));
    }, []);

    // Calendar Logic
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getEventsForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return events.filter(e => e.date === dateStr);
    };

    const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || id;

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <PageHeader title="Schedule" description="Integrated calendar for Ten:One™ Universe events.">
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-neutral-100 p-1 border border-neutral-200">
                        <button
                            onClick={() => setView('month')}
                            className={clsx("p-2 transition-colors", view === 'month' ? "bg-white" : "text-neutral-500 hover:text-neutral-900")}
                        >
                            <CalendarIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={clsx("p-2 transition-colors", view === 'list' ? "bg-white" : "text-neutral-500 hover:text-neutral-900")}
                        >
                            <List className="h-5 w-5" />
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium transition-colors">
                        + New Event
                    </button>
                </div>
            </PageHeader>

            {/* Calendar View Container */}
            <div className="flex-1 bg-white border border-neutral-200 overflow-hidden flex flex-col">
                {/* Calendar Header Nav */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50">
                    <h3 className="text-base font-semibold text-neutral-900">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button onClick={(() => setCurrentDate(new Date()))} className="text-sm text-neutral-500 hover:text-neutral-900 px-3 font-medium">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {view === 'month' ? (
                    <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] h-full overflow-hidden">
                        {/* Weekday Headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-2 text-center text-sm font-medium text-neutral-400 border-b border-neutral-200 border-r border-neutral-200 last:border-r-0 bg-neutral-50">
                                {day}
                            </div>
                        ))}

                        {/* Calendar Grid */}
                        <div className="col-span-7 grid grid-cols-7 auto-rows-fr overflow-y-auto">
                            {blanks.map(blank => (
                                <div key={`blank-${blank}`} className="min-h-[100px] border-b border-r border-neutral-200 bg-neutral-50/30" />
                            ))}
                            {days.map(day => {
                                const dayEvents = getEventsForDay(day);
                                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                                return (
                                    <div key={day} className={clsx("min-h-[100px] p-2 border-b border-r border-neutral-200 hover:bg-neutral-50 transition-colors relative group", isToday && "bg-neutral-100")}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={clsx("text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full", isToday ? "bg-neutral-900 text-white" : "text-neutral-500")}>
                                                {day}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents.map(event => (
                                                <div key={event.id} className="px-2 py-1 text-xs truncate bg-neutral-100 border border-neutral-200 cursor-pointer hover:bg-neutral-200">
                                                    <span className="font-bold mr-1">[{getBrandName(event.brandId)}]</span>
                                                    {event.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* List View */
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-4 max-w-4xl mx-auto">
                            {events
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map(event => (
                                    <div key={event.id} className="flex gap-4 p-4 border border-neutral-200 bg-white hover:border-neutral-400 transition-colors">
                                        <div className="flex-shrink-0 w-16 text-center pt-1">
                                            <div className="text-xl font-bold">{new Date(event.date).getDate()}</div>
                                            <div className="text-xs text-neutral-400 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">
                                                    {getBrandName(event.brandId)}
                                                </span>
                                                <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">
                                                    {event.type}
                                                </span>
                                                {event.time && (
                                                    <span className="flex items-center text-xs text-neutral-400">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {event.time}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-lg font-medium">{event.title}</h4>
                                            {event.description && <p className="text-sm text-neutral-500 mt-1">{event.description}</p>}
                                        </div>
                                        <div className="flex flex-col items-end justify-center">
                                            <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">
                                                {event.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
