'use client';

// 트래픽 분석 — wio_analytics_events 실 데이터
// V2.0 § 3-B Smart-Data Hub 유입 로그 소스

import { useEffect, useState } from 'react';
import { TrendingUp, Users, Eye, Clock, ArrowDownToLine } from 'lucide-react';
import LineChart from '@/features/smarcomm/charts/LineChart';
import BarChart from '@/features/smarcomm/charts/BarChart';
import { getChartColors } from '@/lib/smarcomm/chart-palette';
import NextStepCTA from '@/features/smarcomm/NextStepCTA';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

interface TrafficResp {
    days: number;
    kpi: { totalPageViews: number; totalSessions: number; totalUsers: number; avgDuration: number; bounceRate: number };
    timeline: { date: string; pageViews: number; sessions: number; users: number }[];
    topPages: { path: string; views: number }[];
    brandBreakdown: { brand: string; count: number }[];
}

export default function TrafficPage() {
    const [data, setData] = useState<TrafficResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(30);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/smarcomm/analytics/traffic?days=${days}`)
            .then(r => r.json())
            .then(res => {
                if ('error' in res) setError(res.error);
                else { setData(res); setError(null); }
            })
            .catch(e => setError(String(e)))
            .finally(() => setLoading(false));
    }, [days]);

    const pc = getChartColors(8);

    const fmtDur = (s: number) => {
        if (!s) return '0초';
        const m = Math.floor(s / 60);
        const r = s % 60;
        return m > 0 ? `${m}분 ${r}초` : `${r}초`;
    };

    return (
        <div className="max-w-6xl">
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-text">트래픽 분석</h1>
                        <GuideHelpButton />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">사이트 방문·세션·체류 시간을 분석합니다</p>
                </div>
                <div className="flex gap-1">
                    {[7, 30, 90].map(d => (
                        <button key={d} onClick={() => setDays(d)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${days === d ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
                            {d}일
                        </button>
                    ))}
                </div>
            </div>

            {error && <div className="mb-4 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">에러: {error}</div>}

            {/* KPI */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <KpiCard label="페이지뷰" icon={Eye} value={data?.kpi.totalPageViews ?? 0} accent="#0F172A" loading={loading} />
                <KpiCard label="세션" icon={TrendingUp} value={data?.kpi.totalSessions ?? 0} accent="#3b82f6" loading={loading} />
                <KpiCard label="고유 사용자" icon={Users} value={data?.kpi.totalUsers ?? 0} accent="#10b981" loading={loading} />
                <KpiCard label="평균 체류" icon={Clock} value={data?.kpi.avgDuration ?? 0} accent="#8b5cf6" loading={loading} format={fmtDur} />
                <KpiCard label="이탈률" icon={ArrowDownToLine} value={data?.kpi.bounceRate ?? 0} accent="#f59e0b" loading={loading} format={(n) => `${n}%`} />
            </div>

            {/* 일자별 추이 */}
            {data && data.timeline.length > 0 && (
                <div className="mb-6 rounded-2xl border border-border bg-white p-5">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-text">일자별 추이</h2>
                        <span className="text-[10px] text-text-muted">🔬 wio_analytics_events</span>
                    </div>
                    <LineChart
                        data={data.timeline.map(d => ({ label: d.date.slice(5), value: d.pageViews }))}
                        height={200}
                        color={pc[0]}
                    />
                </div>
            )}

            <div className="mb-6 grid gap-4 lg:grid-cols-2">
                {/* Top 페이지 */}
                {data && data.topPages.length > 0 && (
                    <div className="rounded-2xl border border-border bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold text-text">상위 페이지 ({data.topPages.length})</h2>
                        <div className="space-y-2">
                            {data.topPages.slice(0, 10).map((p, i) => (
                                <div key={p.path} className="flex items-center gap-3">
                                    <span className="w-5 text-xs text-text-muted">{i + 1}</span>
                                    <span className="flex-1 truncate text-xs text-text-sub font-mono">{p.path}</span>
                                    <span className="text-xs font-bold text-text">{p.views.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 브랜드 분포 */}
                {data && data.brandBreakdown.length > 0 && (
                    <div className="rounded-2xl border border-border bg-white p-5">
                        <h2 className="mb-3 text-sm font-semibold text-text">브랜드별 이벤트</h2>
                        <BarChart
                            data={data.brandBreakdown.slice(0, 8).map((b, i) => ({ label: b.brand, value: b.count, color: pc[i % pc.length] }))}
                            height={200}
                        />
                    </div>
                )}
            </div>

            {!loading && data && data.kpi.totalPageViews === 0 && (
                <div className="rounded-2xl border border-border bg-white p-12 text-center">
                    <Eye size={32} className="mx-auto mb-3 text-text-muted" />
                    <div className="text-sm font-semibold text-text">이 기간의 트래픽이 없습니다</div>
                    <p className="mt-2 text-xs text-text-muted">기간을 늘리거나 GA4 연동 후 더 풍부한 데이터를 받을 수 있습니다.</p>
                </div>
            )}

            <NextStepCTA stage="분석 → 기획" title="트래픽 분석을 기반으로 마케팅 전략 수립"
                description="유입 채널별 성과를 분석하고 예산을 최적화하세요" actionLabel="AI 어드바이저" href="/smarcomm/dashboard/advisor" />

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted leading-relaxed">
                <strong className="text-text-sub">🔬 출처</strong> · DB <code className="font-mono text-[10px]">wio_analytics_events</code> ·
                자체 이벤트 트래커 기반(page_view + session_end). 외부 분석 정확도는 GA4·Search Console 연동 시 보강됩니다.
            </div>
        </div>
    );
}

function KpiCard({ label, icon: Icon, value, accent, loading, format }: {
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    value: number;
    accent: string;
    loading: boolean;
    format?: (n: number) => string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Icon size={12} /> {label}
            </div>
            <div className="mt-1 text-2xl font-bold" style={{ color: accent }}>
                {loading ? '—' : (format ? format(value) : value.toLocaleString())}
            </div>
        </div>
    );
}
