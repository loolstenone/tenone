"use client";

// 프로젝트 트래킹 시계열 — Daily 트래킹과 자동 연동
// 프로젝트 설정의 tracking_metrics 배열에 있는 메트릭만 표시

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface SeriesPoint {
    date: string;
    value: number;
    note?: string | null;
}

interface Stats {
    avg: number | null;
    min: number | null;
    max: number | null;
    count: number;
}

interface TrackingData {
    metrics: string[];
    series: Record<string, SeriesPoint[]>;
    stats: Record<string, Stats>;
    range?: { from: string; to: string };
}

const METRIC_LABELS: Record<string, string> = {
    energy: "에너지",
    satisfaction: "만족도",
    mood: "기분",
    study: "공부",
    faith: "신앙",
    exercise: "운동(분)",
    health: "체중(kg)",
};

const METRIC_COLORS: Record<string, string> = {
    energy: "#6366F1",
    satisfaction: "#F59E0B",
    mood: "#FB7185",
    study: "#0EA5E9",
    faith: "#A855F7",
    exercise: "#10B981",
    health: "#64748B",
};

export function ProjectTrackingTab({ projectId, projectColor }: { projectId: string; projectColor: string }) {
    const [data, setData] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/myverse/projects/${projectId}/tracking`);
                if (res.ok) {
                    const d = await res.json();
                    setData(d);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [projectId]);

    if (loading) {
        return (
            <div className="py-16 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중…
            </div>
        );
    }

    if (!data || data.metrics.length === 0) {
        return (
            <div className="py-12 text-center bg-white border border-neutral-200 rounded-xl">
                <p className="text-sm text-neutral-400">
                    추적 메트릭이 설정되지 않았습니다. <span className="text-neutral-600">표지·설정</span> 탭에서 연결할 트래킹을 선택하세요.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.range && (
                <p className="text-xs text-neutral-500 font-mono">
                    범위: {data.range.from} → {data.range.to}
                </p>
            )}
            {data.metrics.map((m) => {
                const points = data.series[m] ?? [];
                const stats = data.stats[m];
                const color = METRIC_COLORS[m] ?? projectColor;
                const label = METRIC_LABELS[m] ?? m;
                return (
                    <section key={m} className="bg-white border border-neutral-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                {label}
                            </h2>
                            <p className="text-[10px] text-neutral-400">
                                기록 {stats.count}일
                            </p>
                        </div>

                        {points.length === 0 ? (
                            <p className="text-xs text-neutral-300 italic py-4">기록 없음</p>
                        ) : (
                            <>
                                {/* 통계 */}
                                <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                                    <Cell label="평균" value={stats.avg ?? "—"} accent={`text-[${color}]`} />
                                    <Cell label="최소" value={stats.min ?? "—"} />
                                    <Cell label="최대" value={stats.max ?? "—"} />
                                </div>
                                {/* 시계열 SVG */}
                                <Sparkline points={points} color={color} />
                                {/* 노트 (있는 메트릭만) */}
                                {points.some(p => p.note) && (
                                    <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                                        {points.filter(p => p.note).slice(-5).map((p, i) => (
                                            <p key={i} className="text-[11px] text-neutral-600">
                                                <span className="text-neutral-400 font-mono mr-2">{p.date.slice(5)}</span>
                                                {p.note}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                );
            })}
        </div>
    );
}

function Cell({ label, value, accent = "text-neutral-900" }: { label: string; value: string | number; accent?: string }) {
    return (
        <div className="bg-neutral-50 rounded-lg py-2">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400">{label}</p>
            <p className={`text-base font-semibold ${accent}`}>{value}</p>
        </div>
    );
}

function Sparkline({ points, color }: { points: SeriesPoint[]; color: string }) {
    if (points.length < 2) {
        return points.length === 1 ? (
            <p className="text-xs text-neutral-400">단일 포인트: {points[0].value}</p>
        ) : null;
    }
    const W = 600, H = 80, P = 8;
    const xs = points.map((_, i) => i);
    const ys = points.map(p => p.value);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const rangeY = maxY - minY || 1;
    const xScale = (i: number) => P + (i / (xs.length - 1 || 1)) * (W - 2 * P);
    const yScale = (v: number) => H - P - ((v - minY) / rangeY) * (H - 2 * P);

    const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(p.value)}`).join(" ");
    const area = `M ${xScale(0)} ${H - P} L ${path.slice(2)} L ${xScale(xs.length - 1)} ${H - P} Z`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
            <path d={area} fill={color} fillOpacity={0.1} />
            <path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
            {points.map((p, i) => (
                <circle key={i} cx={xScale(i)} cy={yScale(p.value)} r={2} fill={color} />
            ))}
        </svg>
    );
}
