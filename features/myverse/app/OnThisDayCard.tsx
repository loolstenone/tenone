"use client";

// "오늘 같은 날" — X년 전 오늘의 흔적을 자동으로 띄워주는 회상 카드.
// 흔적 페이지 상단 / 오늘 페이지 등에 임베드.

import { useEffect, useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { DOMAINS, type DomainKey } from "@/lib/myverse/domains";

interface Moment {
    id: string;
    date: string;
    domain: DomainKey | null;
    media_type: "image" | "video";
    media_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    location: string | null;
}

interface YearGroup {
    year_diff: number;
    date: string;
    moments: Moment[];
}

interface Props {
    /** YYYY-MM-DD; 미지정 시 오늘 */
    date?: string;
    /** 클릭 시 모달 열기 등에 쓰는 콜백 */
    onMomentClick?: (id: string) => void;
}

export function OnThisDayCard({ date, onMomentClick }: Props) {
    const [years, setYears] = useState<YearGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                const url = date
                    ? `/api/myverse/moments/on-this-day?date=${date}`
                    : "/api/myverse/moments/on-this-day";
                const res = await fetch(url);
                if (!res.ok || cancelled) return;
                const data = await res.json();
                if (!cancelled) {
                    setYears(data.years ?? []);
                    setActiveIdx(0);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [date]);

    if (loading) return null;            // skeleton 안 띄움 — 데이터 없으면 조용히 사라짐
    if (years.length === 0) return null; // 조건부 hook — 부드러운 표면

    const active = years[activeIdx];
    const yearLabel = active.year_diff === 1 ? "작년 오늘" : `${active.year_diff}년 전 오늘`;
    const dateLabel = new Date(active.date + "T00:00:00").toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

    return (
        <section className="mb-6 bg-gradient-to-br from-[#6366F1]/[0.04] via-white to-[#6366F1]/[0.04] border border-[#6366F1]/15 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#6366F1]/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-3.5 w-3.5 text-[#6366F1]" />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-neutral-900">{yearLabel}</div>
                        <div className="text-[11px] text-neutral-500">{dateLabel} · {active.moments.length}건의 흔적</div>
                    </div>
                </div>
                {years.length > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
                            disabled={activeIdx === 0}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="text-[10px] text-neutral-500 tabular-nums">
                            {activeIdx + 1} / {years.length}
                        </span>
                        <button
                            onClick={() => setActiveIdx(i => Math.min(years.length - 1, i + 1))}
                            disabled={activeIdx === years.length - 1}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* 가로 스크롤 그리드 */}
            <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                {active.moments.map(m => {
                    const domainMeta = m.domain ? DOMAINS[m.domain] : null;
                    return (
                        <button
                            key={m.id}
                            onClick={() => onMomentClick?.(m.id)}
                            className="group relative shrink-0 w-24 sm:w-28 aspect-square rounded-lg overflow-hidden bg-neutral-100 hover:ring-2 hover:ring-[#6366F1] transition-all"
                        >
                            {m.media_type === "image" ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={m.thumbnail_url || m.media_url}
                                    alt={m.caption || ""}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <video src={m.media_url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                            )}
                            {domainMeta && (
                                <span
                                    className="absolute top-1 right-1 text-[8px] font-medium text-white px-1.5 py-0.5 rounded"
                                    style={{ backgroundColor: domainMeta.color_hex }}
                                >
                                    {domainMeta.label_ko}
                                </span>
                            )}
                            {m.location && (
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1 pt-3 pb-0.5 text-[8px] text-white truncate flex items-center gap-0.5">
                                    <MapPin className="h-2 w-2" />
                                    {m.location}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
