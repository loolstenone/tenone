"use client";

import { useEffect, useState } from "react";
import { Calendar, ExternalLink } from "lucide-react";

interface ExternalEvent {
    id: string;
    provider: string;
    summary: string;
    location: string | null;
    start_at: string;
    end_at: string | null;
    is_all_day: boolean;
    html_link: string | null;
}

export function ExternalEventsBanner({ date }: { date: string }) {
    const [events, setEvents] = useState<ExternalEvent[]>([]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const from = `${date}T00:00:00Z`;
            const to = `${date}T23:59:59Z`;
            const res = await fetch(`/api/planners/external-events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
            if (cancelled) return;
            if (res.ok) {
                const d = await res.json();
                setEvents(d.events || []);
            }
        })();
        return () => { cancelled = true; };
    }, [date]);

    if (events.length === 0) return null;

    return (
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <h3 className="text-xs uppercase tracking-widest text-blue-700 font-semibold">
                    외부 일정 · {events.length}건
                </h3>
            </div>
            <div className="space-y-1.5">
                {events.map((ev) => {
                    const time = ev.is_all_day
                        ? "종일"
                        : new Date(ev.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                    return (
                        <div key={ev.id} className="flex items-center gap-3 text-sm">
                            <span className="text-xs text-blue-600 font-mono w-14">{time}</span>
                            <span className="flex-1 text-neutral-800 truncate">{ev.summary}</span>
                            {ev.location && (
                                <span className="text-xs text-neutral-500 truncate max-w-[120px]">{ev.location}</span>
                            )}
                            {ev.html_link && (
                                <a
                                    href={ev.html_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
