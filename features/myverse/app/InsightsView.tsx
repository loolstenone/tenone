"use client";

// 인사이트 — 교차 분석 + 위치 히트맵 + 패턴 카드를 한 페이지에 모음.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, MapPin, Users, Calendar, TrendingUp, Clock, Activity, Hash } from "lucide-react";
import { LaneHeader } from "@/features/myverse/app/LaneHeader";
import { DOMAINS, type DomainKey } from "@/lib/myverse/domains";

type Period = "month" | "quarter" | "year";

interface Insights {
    period: string;
    from: string;
    to: string;
    totals: {
        moments: number;
        photos: number;
        videos: number;
        recorded_days: number;
        unique_people: number;
        unique_places: number;
        cal_intake: number;
        cal_burn: number;
        exercise_min: number;
        study_min: number;
    };
    domain_distribution: Record<string, number>;
    top_people: [string, number][];
    top_places: [string, number][];
    weekday_pattern: { day: string; count: number }[];
    monthly_activity: { month: string; count: number }[];
    hour_pattern: number[];
    top_tags: [string, number][];
}

const PERIODS: { key: Period; label: string }[] = [
    { key: "month",   label: "한 달" },
    { key: "quarter", label: "3개월" },
    { key: "year",    label: "1년" },
];

export function InsightsView() {
    const [period, setPeriod] = useState<Period>("year");
    const [data, setData] = useState<Insights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(`/api/myverse/insights?period=${period}`);
                if (!res.ok || cancelled) return;
                const json = await res.json();
                if (!cancelled) setData(json);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [period]);

    return (
        <div className="max-w-6xl mx-auto px-5 py-8 sm:px-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <LaneHeader
                icon="insights"
                label="INSIGHTS"
                title="인사이트"
                subtitle="내가 보지 못한 패턴 — 누구·어디·언제·무엇을"
                status="phase2"
            />

            {/* 기간 토글 */}
            <div className="flex gap-1 mb-5">
                {PERIODS.map(p => (
                    <button
                        key={p.key}
                        onClick={() => setPeriod(p.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            period === p.key ? "bg-[#6366F1] text-white" : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <SkeletonGrid />
            ) : !data ? (
                <p className="text-sm text-neutral-500">데이터를 불러오지 못했어요</p>
            ) : data.totals.moments === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-5">
                    {/* 합계 스트립 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Stat label="기록한 흔적" value={data.totals.moments} />
                        <Stat label="기록한 날" value={data.totals.recorded_days} suffix="일" />
                        <Stat label="만난 사람" value={data.totals.unique_people} suffix="명" />
                        <Stat label="다녀온 장소" value={data.totals.unique_places} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 9영역 분포 */}
                        <Card title="9영역 분포" icon={<Sparkles className="h-3.5 w-3.5" />}>
                            <DomainBars dist={data.domain_distribution} total={data.totals.moments} />
                        </Card>

                        {/* 요일 패턴 */}
                        <Card title="요일 패턴" icon={<Calendar className="h-3.5 w-3.5" />}>
                            <WeekdayBars data={data.weekday_pattern} />
                        </Card>

                        {/* 자주 만난 사람 */}
                        <Card title="자주 만난 사람" icon={<Users className="h-3.5 w-3.5" />}>
                            {data.top_people.length === 0 ? (
                                <Empty />
                            ) : (
                                <ul className="space-y-1.5">
                                    {data.top_people.map(([name, cnt]) => (
                                        <li key={name}>
                                            <Link
                                                href={`/myverse/app/with/${encodeURIComponent(name)}`}
                                                className="flex items-center justify-between text-xs text-neutral-700 hover:text-[#6366F1] py-1 px-2 -mx-2 rounded hover:bg-[#6366F1]/5"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span className="h-5 w-5 rounded-full bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white flex items-center justify-center text-[10px] font-semibold">
                                                        {name[0]}
                                                    </span>
                                                    {name}
                                                </span>
                                                <span className="text-neutral-400 tabular-nums">{cnt}회 →</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>

                        {/* 자주 간 장소 (히트맵) */}
                        <Card title="자주 간 장소" icon={<MapPin className="h-3.5 w-3.5" />}>
                            {data.top_places.length === 0 ? (
                                <Empty />
                            ) : (
                                <div className="space-y-1">
                                    {data.top_places.map(([place, cnt]) => {
                                        const max = data.top_places[0][1];
                                        const pct = (cnt / max) * 100;
                                        return (
                                            <div key={place} className="text-xs">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <span className="text-neutral-700 truncate flex-1">{place}</span>
                                                    <span className="text-neutral-400 tabular-nums shrink-0 ml-2">{cnt}</span>
                                                </div>
                                                <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#6366F1] to-[#4F46E5]"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>

                        {/* 시간대 패턴 */}
                        <Card title="시간대 패턴" icon={<Clock className="h-3.5 w-3.5" />}>
                            <HourBars data={data.hour_pattern} />
                        </Card>

                        {/* 핫 태그 */}
                        <Card title="자주 등장한 태그" icon={<Hash className="h-3.5 w-3.5" />}>
                            {data.top_tags.length === 0 ? (
                                <Empty />
                            ) : (
                                <div className="flex flex-wrap gap-1">
                                    {data.top_tags.map(([tag, cnt]) => (
                                        <span
                                            key={tag}
                                            className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700"
                                        >
                                            #{tag}
                                            <span className="text-neutral-400 ml-0.5">·{cnt}</span>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* 건강 요약 */}
                    {(data.totals.exercise_min > 0 || data.totals.study_min > 0 || data.totals.cal_intake > 0) && (
                        <Card title="건강·학습 합계" icon={<Activity className="h-3.5 w-3.5" />}>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {data.totals.cal_intake > 0 && <Mini label="섭취" value={`${Math.round(data.totals.cal_intake).toLocaleString()} kcal`} />}
                                {data.totals.cal_burn > 0 && <Mini label="소모" value={`${Math.round(data.totals.cal_burn).toLocaleString()} kcal`} />}
                                {data.totals.exercise_min > 0 && <Mini label="운동" value={`${Math.floor(data.totals.exercise_min / 60)}시간`} />}
                                {data.totals.study_min > 0 && <Mini label="공부" value={`${Math.floor(data.totals.study_min / 60)}시간`} />}
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
                {icon}
                {title}
            </div>
            {children}
        </div>
    );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-lg px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-neutral-400">{label}</div>
            <div className="text-xl font-semibold text-neutral-900 mt-0.5">
                {value.toLocaleString()}<span className="text-xs text-neutral-400 ml-0.5">{suffix}</span>
            </div>
        </div>
    );
}

function Mini({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[9px] uppercase tracking-widest text-neutral-400">{label}</div>
            <div className="text-sm font-medium text-neutral-800 mt-0.5">{value}</div>
        </div>
    );
}

function Empty() {
    return <p className="text-xs text-neutral-400 italic">아직 데이터가 충분하지 않아요</p>;
}

function DomainBars({ dist, total }: { dist: Record<string, number>; total: number }) {
    const sorted = Object.entries(dist).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return <Empty />;
    return (
        <div className="space-y-1.5">
            {sorted.map(([key, cnt]) => {
                const meta = DOMAINS[key as DomainKey];
                if (!meta) return null;
                const pct = total > 0 ? (cnt / total) * 100 : 0;
                return (
                    <div key={key} className="text-xs">
                        <div className="flex items-center justify-between mb-0.5">
                            <span className="text-neutral-700">{meta.label_ko}</span>
                            <span className="text-neutral-400 tabular-nums">{cnt} · {pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                                className="h-full"
                                style={{ width: `${pct}%`, backgroundColor: meta.color_hex }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function WeekdayBars({ data }: { data: { day: string; count: number }[] }) {
    const max = Math.max(1, ...data.map(d => d.count));
    return (
        <div className="flex items-end gap-1.5 h-28 px-1">
            {data.map(d => {
                const h = (d.count / max) * 100;
                return (
                    <div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-1">
                        <div
                            className="w-full bg-gradient-to-t from-[#6366F1] to-[#818CF8] rounded-t-sm transition-all"
                            style={{ height: `${Math.max(2, h)}%`, minHeight: d.count > 0 ? "8%" : "2%" }}
                            title={`${d.count}건`}
                        />
                        <span className="text-[10px] text-neutral-500">{d.day}</span>
                    </div>
                );
            })}
        </div>
    );
}

function HourBars({ data }: { data: number[] }) {
    const max = Math.max(1, ...data);
    return (
        <div>
            <div className="flex items-end gap-px h-20">
                {data.map((cnt, h) => (
                    <div
                        key={h}
                        className="flex-1 bg-[#6366F1]/70 rounded-t-sm"
                        style={{ height: `${(cnt / max) * 100}%`, minHeight: cnt > 0 ? "8%" : "2%" }}
                        title={`${h}시 — ${cnt}건`}
                    />
                ))}
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-neutral-400 tabular-nums">
                <span>0시</span>
                <span>6시</span>
                <span>12시</span>
                <span>18시</span>
                <span>23시</span>
            </div>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 bg-neutral-100 rounded-lg animate-pulse" />
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-48 bg-neutral-100 rounded-xl animate-pulse" />
                ))}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="border border-dashed border-neutral-300 rounded-xl py-16 px-6 text-center">
            <TrendingUp className="h-6 w-6 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-600 mb-1">아직 인사이트를 만들 데이터가 부족해요</p>
            <p className="text-xs text-neutral-400">
                흔적·일과·장소를 기록할수록 패턴이 드러납니다
            </p>
        </div>
    );
}
