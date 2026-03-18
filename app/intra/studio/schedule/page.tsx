"use client";

import { useState } from "react";
import { brands, events } from "@/lib/data";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Clock, Filter } from "lucide-react";
import clsx from "clsx";

export default function SchedulePage() {
    const [view, setView] = useState<'month' | 'list'>('month');
    const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 1)); // Start from Aug 2025 where mock data is

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
            {/* Page Header & Controls */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Schedule</h2>
                    <p className="mt-2 text-zinc-400">Integrated calendar for Ten:One™ Universe events.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                        <button
                            onClick={() => setView('month')}
                            className={clsx("p-2 rounded-md transition-colors", view === 'month' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white")}
                        >
                            <CalendarIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={clsx("p-2 rounded-md transition-colors", view === 'list' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white")}
                        >
                            <List className="h-5 w-5" />
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors">
                        + New Event
                    </button>
                </div>
            </div>

            {/* Calendar View Container */}
            <div className="flex-1 bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                {/* Calendar Header Nav */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                    <h3 className="text-xl font-semibold text-white">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button onClick={(() => setCurrentDate(new Date()))} className="text-sm text-zinc-400 hover:text-white px-3 font-medium">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {view === 'month' ? (
                    <div className="flex-1 grid grid-cols-7 grid-rows-[auto_1fr] h-full overflow-hidden">
                        {/* Weekday Headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-2 text-center text-sm font-medium text-zinc-500 border-b border-zinc-800 border-r border-zinc-800 last:border-r-0 bg-zinc-900/30">
                                {day}
                            </div>
                        ))}

                        {/* Calendar Grid */}
                        <div className="col-span-7 grid grid-cols-7 auto-rows-fr overflow-y-auto">
                            {blanks.map(blank => (
                                <div key={`blank-${blank}`} className="min-h-[100px] border-b border-r border-zinc-800 bg-zinc-950/30" />
                            ))}
                            {days.map(day => {
                                const dayEvents = getEventsForDay(day);
                                const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                                return (
                                    <div key={day} className={clsx("min-h-[100px] p-2 border-b border-r border-zinc-800 hover:bg-zinc-900/20 transition-colors relative group", isToday && "bg-indigo-500/5")}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={clsx("text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full", isToday ? "bg-indigo-600 text-white" : "text-zinc-400")}>
                                                {day}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents.map(event => (
                                                <div key={event.id} className="px-2 py-1 rounded text-xs truncate bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/30">
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
                                    <div key={event.id} className="flex gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
                                        <div className="flex-shrink-0 w-16 text-center pt-1">
                                            <div className="text-xl font-bold text-white">{new Date(event.date).getDate()}</div>
                                            <div className="text-xs text-zinc-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                                    {getBrandName(event.brandId)}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-400">
                                                    {event.type}
                                                </span>
                                                {event.time && (
                                                    <span className="flex items-center text-xs text-zinc-500">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {event.time}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-lg font-medium text-white">{event.title}</h4>
                                            {event.description && <p className="text-sm text-zinc-400 mt-1">{event.description}</p>}
                                        </div>
                                        <div className="flex flex-col items-end justify-center">
                                            <span className={clsx("text-xs px-2 py-1 rounded-full font-medium",
                                                event.status === 'Completed' ? "bg-emerald-500/10 text-emerald-500" :
                                                    event.status === 'Scheduled' ? "bg-blue-500/10 text-blue-500" : "bg-zinc-800 text-zinc-500"
                                            )}>
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
