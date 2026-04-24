"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Loader2, Sun, Moon, Compass, FolderKanban, CalendarDays, CalendarRange, CalendarClock, FileText } from "lucide-react";

interface SearchHit {
    source: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'project' | 'project_note' | 'briefing' | 'identity';
    id: string;
    title: string;
    snippet: string;
    date?: string;
    href: string;
}

const SOURCE_ICON = {
    daily: Sun,
    weekly: CalendarDays,
    monthly: CalendarRange,
    yearly: CalendarClock,
    project: FolderKanban,
    project_note: FileText,
    briefing: Moon,
    identity: Compass,
};

const SOURCE_LABEL: Record<string, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
    project: "Project",
    project_note: "Note",
    briefing: "Briefing",
    identity: "Identity",
};

export function SearchView({ initialQuery }: { initialQuery: string }) {
    const [query, setQuery] = useState(initialQuery);
    const [hits, setHits] = useState<SearchHit[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Debounced search
    useEffect(() => {
        if (query.trim().length < 2) {
            setHits([]);
            setSearched(false);
            return;
        }
        const handler = setTimeout(async () => {
            setLoading(true);
            setSearched(true);
            try {
                const res = await fetch(`/api/planners/search?q=${encodeURIComponent(query.trim())}`);
                if (res.ok) {
                    const d = await res.json();
                    setHits(d.hits || []);
                }
            } finally {
                setLoading(false);
            }
        }, 250);
        return () => clearTimeout(handler);
    }, [query]);

    const grouped = useMemo(() => {
        const g: Record<string, SearchHit[]> = {};
        hits.forEach((h) => {
            g[h.source] = g[h.source] || [];
            g[h.source].push(h);
        });
        return g;
    }, [hits]);

    return (
        <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 md:py-12">
            <div className="flex items-center gap-3 mb-6">
                <Search className="h-6 w-6 text-[#0F766E]" />
                <h1 className="font-serif text-3xl text-neutral-900">Search</h1>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Daily · Weekly · Notes · Projects · AI 브리핑 전체 검색…"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-11 pr-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0F766E]"
                    autoFocus
                />
                {loading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-neutral-400" />
                )}
            </div>

            {query.trim().length > 0 && query.trim().length < 2 && (
                <p className="text-xs text-neutral-400 text-center">2글자 이상 입력</p>
            )}

            {searched && !loading && hits.length === 0 && (
                <div className="py-16 text-center">
                    <p className="text-neutral-400 text-sm">"{query}"에 대한 검색 결과가 없습니다.</p>
                </div>
            )}

            {hits.length > 0 && (
                <div className="space-y-6">
                    <p className="text-xs text-neutral-500">총 {hits.length}건</p>
                    {Object.entries(grouped).map(([source, items]) => {
                        const Icon = SOURCE_ICON[source as keyof typeof SOURCE_ICON] || FileText;
                        return (
                            <section key={source}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className="h-3.5 w-3.5 text-neutral-400" />
                                    <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
                                        {SOURCE_LABEL[source] || source} · {items.length}
                                    </h2>
                                </div>
                                <div className="space-y-2">
                                    {items.map((hit) => (
                                        <Link
                                            key={hit.id}
                                            href={hit.href}
                                            className="block bg-white border border-neutral-200 rounded-xl p-4 hover:border-[#0F766E] hover:bg-[#0F766E]/5 transition-all"
                                        >
                                            <p className="text-sm font-semibold text-neutral-900">{hit.title}</p>
                                            {hit.snippet && (
                                                <p className="text-xs text-neutral-600 mt-1 leading-relaxed line-clamp-2">
                                                    {hit.snippet}
                                                </p>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
