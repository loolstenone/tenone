'use client';

// 코호트 분석 — wio_analytics_events 사용자 첫 활동 주차 × 5주 잔존
import { useEffect, useState } from 'react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

interface CohortRow { cohort: string; size: number; retentionPct: number[] }
interface CohortResp { weeks: number; cohorts: CohortRow[]; totalUsers: number }

export default function CohortPage() {
    const [data, setData] = useState<CohortResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [weeks, setWeeks] = useState(8);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/smarcomm/analytics/cohort?weeks=${weeks}`)
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, [weeks]);

    const cellColor = (pct: number) => {
        if (pct >= 80) return '#10b981';
        if (pct >= 60) return '#84cc16';
        if (pct >= 40) return '#f59e0b';
        if (pct >= 20) return '#f97316';
        if (pct > 0) return '#ef4444';
        return '#e5e7eb';
    };

    return (
        <div className="max-w-6xl">
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-text">코호트 분석</h1>
                        <GuideHelpButton />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">첫 활동 주차별 사용자 잔존율을 분석합니다</p>
                </div>
                <div className="flex gap-1">
                    {[4, 8, 12].map(w => (
                        <button key={w} onClick={() => setWeeks(w)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${weeks === w ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
                            {w}주
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Kpi label="총 사용자" value={data?.totalUsers ?? 0} loading={loading} />
                <Kpi label="코호트 수" value={data?.cohorts.length ?? 0} loading={loading} />
                <Kpi label="평균 W1 잔존율"
                    value={data?.cohorts.length ? Math.round(data.cohorts.reduce((s, c) => s + (c.retentionPct[1] ?? 0), 0) / data.cohorts.length) : 0}
                    loading={loading} suffix="%" />
            </div>

            {data && data.cohorts.length > 0 && (
                <div className="rounded-2xl border border-border bg-white p-5 overflow-x-auto">
                    <h2 className="mb-4 text-sm font-semibold text-text">잔존율 히트맵</h2>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-text-muted">
                                <th className="px-3 py-2 text-left font-medium">코호트</th>
                                <th className="px-3 py-2 text-right font-medium">사용자</th>
                                {Array.from({ length: 5 }, (_, i) => (
                                    <th key={i} className="px-3 py-2 text-center font-medium">W{i}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.cohorts.map(c => (
                                <tr key={c.cohort} className="border-t border-border">
                                    <td className="px-3 py-2 font-mono text-text-sub">{c.cohort}</td>
                                    <td className="px-3 py-2 text-right font-bold text-text">{c.size}</td>
                                    {c.retentionPct.map((pct, i) => (
                                        <td key={i} className="px-3 py-2 text-center">
                                            <div className="inline-block rounded px-2 py-1 text-[10px] font-bold min-w-[36px]"
                                                style={{ background: cellColor(pct), color: pct === 0 ? '#94a3b8' : 'white' }}>
                                                {pct}%
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && data && data.cohorts.length === 0 && (
                <div className="rounded-2xl border border-border bg-white p-12 text-center">
                    <div className="text-sm font-semibold text-text">코호트 데이터가 없습니다</div>
                    <p className="mt-2 text-xs text-text-muted">user_id가 있는 이벤트가 더 쌓이면 분석 가능합니다.</p>
                </div>
            )}

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted leading-relaxed">
                <strong className="text-text-sub">🔬 출처</strong> · DB <code className="font-mono text-[10px]">wio_analytics_events</code> · user_id 첫 이벤트 주차를 코호트로 정의, 이후 5주 활성 사용자 비율 산출. 외부 BI 도구 없이 자체 트래킹 기반.
            </div>
        </div>
    );
}

function Kpi({ label, value, loading, suffix }: { label: string; value: number; loading: boolean; suffix?: string }) {
    return (
        <div className="rounded-2xl border border-border bg-white p-4">
            <div className="text-xs text-text-muted">{label}</div>
            <div className="mt-1 text-2xl font-bold text-text">{loading ? '—' : `${value.toLocaleString()}${suffix ?? ''}`}</div>
        </div>
    );
}
