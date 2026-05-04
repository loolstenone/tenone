"use client";

// 도메인 피드 — 한 영역(예: body, work)에 속한 모든 capture 데이터를 시간순으로 표시
//
// 데이터 소스 (해당 도메인 필터):
//   - planners_daily_moments (사진·영상)
//   - planners_daily_routines (시간 사용)
//   - planners_daily_places (방문 장소)
//   - planners_calendar_entries (일정)
//
// 사용처: /myverse/app/{body,work,study,daily,schedule,move,travel,relation}/page.tsx

import { useEffect, useState } from "react";
import { Loader2, Camera, MapPin, Clock, Calendar } from "lucide-react";
import type { DomainKey } from "@/lib/myverse/domains";
import { DOMAINS } from "@/lib/myverse/domains";

type FeedItem =
    | { type: "moment"; id: string; date: string; happened_at: string | null; caption: string | null; media_url: string; media_type: "image" | "video"; visibility: string }
    | { type: "routine"; id: string; date: string; start_time: string | null; end_time: string | null; activity: string; note: string | null; visibility: string }
    | { type: "place"; id: string; date: string; visited_at: string | null; place_name: string; address: string | null; visibility: string }
    | { type: "calendar"; id: string; date: string; title: string; start_time: string | null; visibility: string };

interface Props {
    domain: DomainKey;
    days?: number;            // 최근 N일 (기본 30)
}

export function DomainFeed({ domain, days = 30 }: Props) {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const meta = DOMAINS[domain];

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/myverse/feed?domain=${domain}&days=${days}`);
                if (res.ok) {
                    const json = await res.json();
                    if (!cancelled) setItems(json.items ?? []);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [domain, days]);

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <div
                    className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-3"
                    style={{ backgroundColor: `${meta.color_hex}15`, color: meta.color_hex }}
                >
                    <span className="text-xl">·</span>
                </div>
                <p className="text-sm text-neutral-500 mb-1">{meta.label_ko} 영역에 아직 기록이 없습니다</p>
                <p className="text-xs text-neutral-400 italic max-w-xs mx-auto">{meta.description}</p>
                <p className="text-[11px] text-neutral-300 mt-3">{meta.rule_hints[0]}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4">
            {items.map(item => (
                <FeedItemCard key={`${item.type}-${item.id}`} item={item} domainColor={meta.color_hex} />
            ))}
        </div>
    );
}

function FeedItemCard({ item, domainColor }: { item: FeedItem; domainColor: string }) {
    const dateLabel = formatDate(item.date);
    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-3 flex gap-3">
            <div className="shrink-0 flex flex-col items-center">
                <div
                    className="h-2 w-2 rounded-full mt-1.5"
                    style={{ backgroundColor: domainColor }}
                />
                <div className="text-[10px] text-neutral-400 tabular-nums mt-1.5">{dateLabel}</div>
            </div>
            <div className="flex-1 min-w-0">
                {item.type === "moment" && <MomentRow item={item} />}
                {item.type === "routine" && <RoutineRow item={item} />}
                {item.type === "place" && <PlaceRow item={item} />}
                {item.type === "calendar" && <CalendarRow item={item} />}
            </div>
            {item.visibility !== "private" && (
                <span className="shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-px rounded bg-emerald-50 text-emerald-600 self-start mt-1">
                    {item.visibility === "public" ? "공개" : "친구"}
                </span>
            )}
        </div>
    );
}

function MomentRow({ item }: { item: Extract<FeedItem, { type: "moment" }> }) {
    return (
        <div className="flex items-start gap-2">
            <div className="shrink-0 h-12 w-12 bg-neutral-100 rounded overflow-hidden">
                {item.media_type === "image" ? (
                    <img src={item.media_url} alt="" className="w-full h-full object-cover" />
                ) : (
                    <video src={item.media_url} className="w-full h-full object-cover" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[10px] text-neutral-400 mb-0.5">
                    <Camera className="h-3 w-3" />
                    {item.happened_at ? new Date(item.happened_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" }) : ""}
                </div>
                <p className="text-sm text-neutral-800 line-clamp-2">{item.caption || <span className="text-neutral-300 italic">캡션 없음</span>}</p>
            </div>
        </div>
    );
}

function RoutineRow({ item }: { item: Extract<FeedItem, { type: "routine" }> }) {
    return (
        <>
            <div className="flex items-center gap-1 text-[10px] text-neutral-400 mb-0.5">
                <Clock className="h-3 w-3" />
                {item.start_time ? item.start_time.slice(0, 5) : ""}
                {item.end_time ? `–${item.end_time.slice(0, 5)}` : ""}
            </div>
            <p className="text-sm text-neutral-800">{item.activity}</p>
            {item.note && <p className="text-xs text-neutral-500 mt-0.5">{item.note}</p>}
        </>
    );
}

function PlaceRow({ item }: { item: Extract<FeedItem, { type: "place" }> }) {
    return (
        <>
            <div className="flex items-center gap-1 text-[10px] text-neutral-400 mb-0.5">
                <MapPin className="h-3 w-3" />
                {item.visited_at ? item.visited_at.slice(0, 5) : ""}
            </div>
            <p className="text-sm text-neutral-800">{item.place_name}</p>
            {item.address && <p className="text-xs text-neutral-500 mt-0.5 truncate">{item.address}</p>}
        </>
    );
}

function CalendarRow({ item }: { item: Extract<FeedItem, { type: "calendar" }> }) {
    return (
        <>
            <div className="flex items-center gap-1 text-[10px] text-neutral-400 mb-0.5">
                <Calendar className="h-3 w-3" />
                {item.start_time ? item.start_time.slice(0, 5) : "종일"}
            </div>
            <p className="text-sm text-neutral-800">{item.title}</p>
        </>
    );
}

function formatDate(d: string): string {
    const dt = new Date(d + "T00:00:00+09:00");
    return `${dt.getMonth() + 1}/${dt.getDate()}`;
}
