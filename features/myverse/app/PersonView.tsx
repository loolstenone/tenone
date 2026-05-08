"use client";

// 사람 중심 뷰 — 한 사람과의 모든 순간을 횡단축으로 모아 본다.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Camera, Heart } from "lucide-react";
import { DOMAINS, type DomainKey } from "@/lib/myverse/domains";

interface Moment {
    id: string;
    date: string;
    domain: DomainKey | null;
    sub_tags: string[] | null;
    media_type: "image" | "video";
    media_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    happened_at: string | null;
    with_whom: string | null;
    location: string | null;
    activity: string | null;
}

interface Stats {
    total_moments: number;
    meeting_days: number;
    first_met: string | null;
    last_met: string | null;
    domain_distribution: Record<string, number>;
    top_locations: [string, number][];
}

interface ApiResponse {
    name: string;
    stats: Stats;
    moments: Moment[];
}

function fmtDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso + "T00:00:00").toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function daysBetween(a: string, b: string): number {
    const d1 = new Date(a + "T00:00:00").getTime();
    const d2 = new Date(b + "T00:00:00").getTime();
    return Math.floor(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}

export function PersonView({ name }: { name: string }) {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`/api/myverse/people/${encodeURIComponent(name)}`);
                if (!res.ok || cancelled) return;
                const json = await res.json();
                if (!cancelled) setData(json);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [name]);

    if (loading) return <LoadingSkeleton name={name} />;
    if (!data) return <ErrorState name={name} />;

    const { stats, moments } = data;

    // 월별 그룹핑
    const byMonth = new Map<string, Moment[]>();
    for (const m of moments) {
        const ym = m.date.slice(0, 7);
        if (!byMonth.has(ym)) byMonth.set(ym, []);
        byMonth.get(ym)!.push(m);
    }
    const monthGroups = Array.from(byMonth.entries()).sort(([a], [b]) => b.localeCompare(a));

    const span = stats.first_met && stats.last_met ? daysBetween(stats.first_met, stats.last_met) : 0;

    return (
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
            {/* 헤더 */}
            <div className="mb-6">
                <Link
                    href="/myverse/app/contacts"
                    className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-[#6366F1] mb-3"
                >
                    <ArrowLeft className="h-3 w-3" />
                    연락처로
                </Link>
                <div className="flex items-end gap-4">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center shrink-0">
                        <span className="text-white text-2xl sm:text-3xl font-semibold">{name[0]}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-0.5">
                            <Heart className="h-3 w-3" />
                            함께한 사람
                        </div>
                        <h1 className="text-3xl font-semibold text-neutral-900">{name}</h1>
                        <p className="text-sm text-neutral-500 mt-0.5">
                            {stats.total_moments > 0
                                ? `${stats.meeting_days}일 동안 ${stats.total_moments}개의 순간을 함께`
                                : "아직 함께한 흔적이 없어요"}
                        </p>
                    </div>
                </div>
            </div>

            {/* 빈 상태 */}
            {stats.total_moments === 0 && (
                <div className="border border-dashed border-neutral-300 rounded-xl py-16 px-6 text-center">
                    <Camera className="h-6 w-6 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-600 mb-1">{name}와 함께한 순간이 아직 없네요</p>
                    <p className="text-xs text-neutral-400">
                        흔적의 &ldquo;누구와&rdquo; 필드에 이 이름을 넣으면 자동으로 모입니다
                    </p>
                </div>
            )}

            {/* 통계 카드 */}
            {stats.total_moments > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                    <StatCard label="처음 만난 날" value={fmtDate(stats.first_met)} />
                    <StatCard label="마지막 만난 날" value={fmtDate(stats.last_met)} />
                    <StatCard label="기간" value={span > 0 ? `${span}일` : "하루"} />
                    <StatCard label="만난 날" value={`${stats.meeting_days}일`} />
                </div>
            )}

            {/* 9영역 분포 */}
            {Object.keys(stats.domain_distribution).length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6">
                    <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3">함께한 영역</div>
                    <div className="flex flex-wrap gap-1.5">
                        {Object.entries(stats.domain_distribution)
                            .sort((a, b) => b[1] - a[1])
                            .map(([key, cnt]) => {
                                const meta = DOMAINS[key as DomainKey];
                                if (!meta) return null;
                                return (
                                    <span
                                        key={key}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-white rounded-full"
                                        style={{ backgroundColor: meta.color_hex }}
                                    >
                                        {meta.label_ko}
                                        <span className="opacity-70">·{cnt}</span>
                                    </span>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* 자주 간 장소 */}
            {stats.top_locations.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl p-4 mb-6">
                    <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3">자주 간 장소</div>
                    <div className="space-y-1.5">
                        {stats.top_locations.map(([place, cnt]) => (
                            <div key={place} className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-neutral-700">
                                    <MapPin className="h-3 w-3 text-neutral-400" />
                                    {place}
                                </span>
                                <span className="text-neutral-400 tabular-nums">{cnt}회</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 월별 흔적 그리드 */}
            {monthGroups.length > 0 && (
                <div className="space-y-6">
                    {monthGroups.map(([ym, items]) => {
                        const [y, m] = ym.split("-");
                        return (
                            <section key={ym}>
                                <h2 className="text-sm font-semibold text-neutral-800 mb-2">
                                    {y}년 {parseInt(m, 10)}월
                                    <span className="ml-2 text-xs text-neutral-400 font-normal">{items.length}건</span>
                                </h2>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                                    {items.map(m => <MomentTile key={m.id} m={m} />)}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function MomentTile({ m }: { m: Moment }) {
    const domainMeta = m.domain ? DOMAINS[m.domain] : null;
    return (
        <div className="group relative aspect-square rounded-md overflow-hidden bg-neutral-100">
            {m.media_type === "image" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={m.thumbnail_url || m.media_url} alt={m.caption || ""} className="w-full h-full object-cover" loading="lazy" />
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
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-3 pb-1 text-[8px] text-white space-y-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-0.5">
                    <Calendar className="h-2 w-2" />
                    {m.date.slice(5)}
                </div>
                {m.location && (
                    <div className="flex items-center gap-0.5 truncate">
                        <MapPin className="h-2 w-2" />
                        <span className="truncate">{m.location}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2.5">
            <div className="text-[9px] uppercase tracking-widest text-neutral-400">{label}</div>
            <div className="text-sm font-semibold text-neutral-900 mt-0.5 truncate">{value}</div>
        </div>
    );
}

function LoadingSkeleton({ name }: { name: string }) {
    return (
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
            <div className="flex items-end gap-4 mb-6">
                <div className="h-20 w-20 rounded-full bg-neutral-200 animate-pulse" />
                <div>
                    <h1 className="text-3xl font-semibold text-neutral-400">{name}</h1>
                    <div className="h-3 w-32 bg-neutral-200 rounded mt-2 animate-pulse" />
                </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-neutral-100 rounded-md animate-pulse" />
                ))}
            </div>
        </div>
    );
}

function ErrorState({ name }: { name: string }) {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
            <p className="text-sm text-neutral-500">{name}을(를) 불러오는 중 문제가 생겼어요</p>
        </div>
    );
}
