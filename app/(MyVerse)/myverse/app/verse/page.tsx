"use client";

// Verse — 9 영역 통합 타임라인 + 6단계 줌 + X년 전 오늘 + 사람 횡단 필터
//
// 줌 단계:
//   day:    개별 항목 시간순 (최근 30일 기본)
//   week:   주간 — 일별 영역 분포
//   month:  월간 — 주별 영역 분포
//   quarter: 분기 — 월별 영역 분포
//   year:   연간 — 분기별 영역 분포
//   life:   평생 — 연도별 영역 분포

import { useEffect, useState, useMemo } from "react";
import { Loader2, Camera, Clock, MapPin, Calendar, Orbit, Filter, Users } from "lucide-react";
import { DOMAINS, DOMAIN_KEYS } from "@/lib/myverse/domains";
import type { DomainKey } from "@/lib/myverse/domains";
import { LaneSubNav, CONNECT_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

type Zoom = "day" | "week" | "month" | "quarter" | "year" | "life";

const ZOOM_LABELS: Record<Zoom, string> = {
    day: "일", week: "주", month: "월", quarter: "분기", year: "년", life: "평생",
};

// 줌별 기본 fetch 범위
const ZOOM_DAYS: Record<Zoom, number> = {
    day: 30, week: 90, month: 365, quarter: 730, year: 1825, life: 18250,
};

interface DayItem {
    type: "moment" | "routine" | "place" | "calendar";
    id: string;
    date: string;
    domain: string | null;
    sortKey: string;
    [k: string]: unknown;
}

interface BucketSummary {
    key: string;
    domains: Record<string, number>;
    total: number;
}

interface OnThisDayGroup {
    year: number;
    years_ago: number;
    items: Array<{ type: string; date: string; [k: string]: unknown }>;
}

export default function VersePage() {
    const [zoom, setZoom] = useState<Zoom>("day");
    const [domainFilter, setDomainFilter] = useState<DomainKey | null>(null);
    const [items, setItems] = useState<DayItem[]>([]);
    const [summary, setSummary] = useState<BucketSummary[]>([]);
    const [onThisDay, setOnThisDay] = useState<OnThisDayGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const days = ZOOM_DAYS[zoom];
                const today = new Date();
                const from = new Date(today.getTime() - days * 86400000).toISOString().slice(0, 10);
                const to = today.toISOString().slice(0, 10);
                const params = new URLSearchParams({ from, to, zoom });
                if (domainFilter) params.set("domain", domainFilter);
                const res = await fetch(`/api/myverse/verse?${params}`);
                if (!res.ok) return;
                const json = await res.json();
                if (cancelled) return;
                if (zoom === "day") {
                    setItems(json.items ?? []);
                    setSummary([]);
                } else {
                    setSummary(json.summary ?? []);
                    setItems([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [zoom, domainFilter]);

    // X년 전 오늘
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/myverse/verse/on-this-day");
                if (res.ok) {
                    const j = await res.json();
                    setOnThisDay(j.groups ?? []);
                }
            } catch { /* silent */ }
        })();
    }, []);

    return (
        <div>
            <LaneSubNav tabs={CONNECT_LANE_TABS} />
            <header className="px-6 pt-6 pb-3 border-b border-neutral-200 bg-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Orbit className="h-3 w-3 text-[#6366F1]" />
                            <span className="text-[10px] uppercase tracking-widest text-[#6366F1]">Verse</span>
                        </div>
                        <h1 className="text-2xl font-serif text-neutral-900">통합 타임라인</h1>
                        <p className="text-xs text-neutral-500 mt-1">9 영역 × 사람 × 시간 — 모든 흔적이 한 자리</p>
                    </div>
                </div>
            </header>

            {/* 줌 + 영역 필터 */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-0.5">
                    {(Object.keys(ZOOM_LABELS) as Zoom[]).map(z => (
                        <button
                            key={z}
                            onClick={() => setZoom(z)}
                            className={`px-2.5 py-1 text-xs rounded transition-colors ${
                                zoom === z
                                    ? "bg-white text-[#6366F1] font-semibold shadow-sm"
                                    : "text-neutral-500 hover:text-neutral-900"
                            }`}
                        >
                            {ZOOM_LABELS[z]}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1 ml-auto">
                    <Filter className="h-3 w-3 text-neutral-400" />
                    <button
                        onClick={() => setDomainFilter(null)}
                        className={`px-2 py-0.5 text-[10px] rounded-full transition-colors ${
                            !domainFilter ? "bg-neutral-800 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                        }`}
                    >
                        전체
                    </button>
                    {DOMAIN_KEYS.map(d => (
                        <button
                            key={d}
                            onClick={() => setDomainFilter(d)}
                            className="px-2 py-0.5 text-[10px] rounded-full transition-colors"
                            style={
                                domainFilter === d
                                    ? { backgroundColor: DOMAINS[d].color_hex, color: "white" }
                                    : { backgroundColor: "#f5f5f5", color: "#6b7280" }
                            }
                        >
                            {DOMAINS[d].label_ko}
                        </button>
                    ))}
                </div>
            </div>

            {/* X년 전 오늘 */}
            {onThisDay.length > 0 && (
                <section className="bg-gradient-to-br from-[#6366F1]/5 to-[#A855F7]/5 border-b border-neutral-100 px-6 py-4">
                    <h2 className="text-[10px] uppercase tracking-widest text-[#6366F1] mb-2 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> X년 전 오늘
                    </h2>
                    <div className="space-y-2">
                        {onThisDay.slice(0, 3).map(g => (
                            <div key={g.year} className="bg-white rounded-lg p-3 border border-neutral-200">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold text-neutral-900">{g.years_ago}년 전 ({g.year})</span>
                                    <span className="text-[10px] text-neutral-400">{g.items.length}건</span>
                                </div>
                                <div className="text-xs text-neutral-600 line-clamp-2">
                                    {g.items.slice(0, 3).map((it, i) => (
                                        <span key={i}>
                                            {i > 0 && " · "}
                                            {summarizeItem(it)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* 본문 */}
            <div className="p-4">
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                ) : zoom === "day" ? (
                    items.length === 0 ? (
                        <p className="text-center text-sm text-neutral-400 italic py-12">아직 기록이 없습니다</p>
                    ) : (
                        <div className="space-y-2 max-w-2xl mx-auto">
                            {items.map(it => <TimelineItem key={`${it.type}-${it.id}`} item={it} />)}
                        </div>
                    )
                ) : (
                    summary.length === 0 ? (
                        <p className="text-center text-sm text-neutral-400 italic py-12">아직 기록이 없습니다</p>
                    ) : (
                        <div className="space-y-1.5 max-w-2xl mx-auto">
                            {summary.map(b => <BucketRow key={b.key} bucket={b} />)}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

function TimelineItem({ item }: { item: DayItem }) {
    const meta = item.domain && DOMAIN_KEYS.includes(item.domain as DomainKey) ? DOMAINS[item.domain as DomainKey] : null;
    const Icon = item.type === "moment" ? Camera
        : item.type === "routine" ? Clock
        : item.type === "place" ? MapPin
        : Calendar;

    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-3 flex gap-3">
            <div className="shrink-0 flex flex-col items-center">
                <div
                    className="h-2 w-2 rounded-full mt-1.5"
                    style={{ backgroundColor: meta?.color_hex ?? "#9CA3AF" }}
                />
                <div className="text-[10px] text-neutral-400 tabular-nums mt-1.5">{formatDate(item.date)}</div>
            </div>
            <Icon className="h-3.5 w-3.5 text-neutral-300 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                {summaryText(item)}
            </div>
            {meta && (
                <span
                    className="shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-px rounded self-start mt-1"
                    style={{ backgroundColor: `${meta.color_hex}15`, color: meta.color_hex }}
                >
                    {meta.label_ko}
                </span>
            )}
        </div>
    );
}

function summaryText(item: DayItem) {
    if (item.type === "moment") {
        const url = item.media_url as string | undefined;
        return (
            <div className="flex items-start gap-2">
                {url && (
                    <div className="shrink-0 h-10 w-10 rounded bg-neutral-100 overflow-hidden">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
                <p className="text-sm text-neutral-800 line-clamp-2">
                    {(item.caption as string | null) || <span className="text-neutral-300 italic">캡션 없음</span>}
                </p>
            </div>
        );
    }
    if (item.type === "routine") {
        return <p className="text-sm text-neutral-800">{item.activity as string}</p>;
    }
    if (item.type === "place") {
        return <p className="text-sm text-neutral-800">{item.place_name as string}</p>;
    }
    if (item.type === "calendar") {
        return <p className="text-sm text-neutral-800">{item.title as string}</p>;
    }
    return null;
}

function summarizeItem(it: { type: string; [k: string]: unknown }): string {
    if (it.type === "moment") return (it.caption as string | null) ?? "사진";
    if (it.type === "routine") return (it.activity as string | null) ?? "활동";
    if (it.type === "calendar") return (it.title as string | null) ?? "일정";
    return "기록";
}

function BucketRow({ bucket }: { bucket: BucketSummary }) {
    const max = bucket.total;
    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-neutral-900 tabular-nums">{bucket.key}</span>
                <span className="text-[10px] text-neutral-400">{bucket.total}건</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-neutral-100">
                {DOMAIN_KEYS.map(d => {
                    const count = bucket.domains[d] ?? 0;
                    if (count === 0) return null;
                    const pct = (count / max) * 100;
                    return (
                        <div
                            key={d}
                            className="h-full"
                            style={{ width: `${pct}%`, backgroundColor: DOMAINS[d].color_hex }}
                            title={`${DOMAINS[d].label_ko}: ${count}건`}
                        />
                    );
                })}
            </div>
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1.5">
                {DOMAIN_KEYS.map(d => {
                    const count = bucket.domains[d] ?? 0;
                    if (count === 0) return null;
                    return (
                        <span key={d} className="flex items-center gap-1 text-[10px] text-neutral-500">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: DOMAINS[d].color_hex }} />
                            <span>{DOMAINS[d].label_ko} {count}</span>
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

function formatDate(d: string): string {
    const dt = new Date(d + "T00:00:00+09:00");
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
}
