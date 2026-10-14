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
    daily: "오늘",
    weekly: "주간",
    monthly: "월간",
    yearly: "연간",
    project: "프로젝트",
    project_note: "노트",
    briefing: "브리핑",
    identity: "퍼스널",
};

export function SearchView({ initialQuery }: { initialQuery: string }) {
    const [query, setQuery] = useState(initialQuery);
    const [hits, setHits] = useState<SearchHit[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    // 일상어로 찾기 (플래너'스 AI 2단계 — /api/myverse/smart-search, 유료 회원 전용)
    const [aiBusy, setAiBusy] = useState(false);
    const [ai, setAi] = useState<{ answer: string; range: { from: string; to: string }; keywords: string[]; results: { id: string; type: string; date: string; title: string; snippet: string; href: string }[] } | null>(null);

    async function askAi() {
        const q = query.trim();
        if (q.length < 2 || aiBusy) return;
        setAiBusy(true); setAi(null);
        try {
            const res = await fetch("/api/myverse/smart-search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
            if (res.status === 402) return; // 유료 안내는 앱 쉘
            if (res.ok) setAi(await res.json());
        } finally { setAiBusy(false); }
    }

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
                const res = await fetch(`/api/myverse/planner-search?q=${encodeURIComponent(query.trim())}`);
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
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12">
            <div className="flex items-center gap-3 mb-6">
                <Search className="h-6 w-6 text-[var(--pp-accent)]" />
                <h1 className="font-serif text-2xl md:text-3xl text-neutral-900">검색</h1>
            </div>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setAi(null); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void askAi(); } }}
                    placeholder="단어로 찾거나, 일상어로 물어보세요 — 예) 작년 가을 팀장님과 얘기한 신규 프로젝트 아이디어"
                    className="w-full bg-white border border-neutral-200 rounded-xl pl-11 pr-4 py-3 text-base text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--pp-accent)]"
                    autoFocus
                />
                {loading && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-neutral-400" />
                )}
            </div>

            {/* 일상어로 찾기 */}
            {query.trim().length >= 2 && (
                <div className="-mt-5 mb-8">
                    {!ai ? (
                        <button onClick={askAi} disabled={aiBusy} className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--pp-accent)] hover:underline disabled:opacity-50">
                            {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <span aria-hidden>✦</span>} AI로 찾기 — 날짜를 몰라도 일상어로
                        </button>
                    ) : (
                        <div className="border border-[var(--pp-accent)]/30 bg-[var(--pp-accent)]/5 p-5">
                            {ai.answer && <p className="break-keep text-[15px] text-neutral-800">{ai.answer}</p>}
                            <p className="mt-2 text-xs text-neutral-500">{ai.range.from} ~ {ai.range.to} · 찾은 말: {ai.keywords.join(", ")}</p>
                            {ai.results.length > 0 && (
                                <ul className="mt-4 divide-y divide-neutral-200/70">
                                    {ai.results.map((r) => (
                                        <li key={r.id}>
                                            <a href={r.href} className="flex items-baseline gap-3 py-2.5 hover:text-[var(--pp-accent)]">
                                                <span className="w-20 shrink-0 font-mono text-xs text-neutral-400">{r.date}</span>
                                                <span className="shrink-0 bg-white px-1.5 py-0.5 text-[11px] text-neutral-500">{r.type}</span>
                                                <span className="min-w-0 flex-1 text-sm"><b className="font-medium">{r.title}</b>{r.snippet && <span className="ml-2 text-neutral-500">{r.snippet}</span>}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            )}

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
                                            className="block bg-white border border-neutral-200 rounded-xl p-4 hover:border-[var(--pp-accent)] hover:bg-[var(--pp-accent)]/5 transition-all"
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
