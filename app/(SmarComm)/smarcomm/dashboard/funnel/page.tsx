'use client';

// 퍼널 분석 — wio_analytics_events 세션 시퀀스
// 4단계 기본 퍼널: 랜딩 → 탐색 → 참여 → 전환

import { useEffect, useState } from 'react';
import { TrendingDown } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';
import NextStepCTA from '@/features/smarcomm/NextStepCTA';

interface FunnelStep {
    key: string;
    label: string;
    count: number;
    conversionFromPrev: number;
    conversionFromTop: number;
}

interface FunnelResp {
    days: number;
    totalSessions: number;
    steps: FunnelStep[];
}

const STAGE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export default function FunnelPage() {
    const [data, setData] = useState<FunnelResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/smarcomm/analytics/funnel?days=${days}`)
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, [days]);

    const maxCount = Math.max(...(data?.steps.map(s => s.count) ?? [0]), 1);

    return (
        <div className="max-w-5xl">
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-text">퍼널 분석</h1>
                        <GuideHelpButton />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">방문자가 어디서 이탈하는지 단계별 전환율을 분석합니다</p>
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

            {/* KPI */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <KpiCard label="총 세션" value={data?.totalSessions ?? 0} accent="#0F172A" loading={loading} />
                <KpiCard label="최종 전환" value={data?.steps?.[data.steps.length - 1]?.count ?? 0} accent="#10b981" loading={loading} />
                <KpiCard label="전환율 (전체)" value={data?.steps?.[data.steps.length - 1]?.conversionFromTop ?? 0} accent="#8b5cf6" loading={loading} suffix="%" />
            </div>

            {/* 퍼널 차트 */}
            {data && data.steps.length > 0 && (
                <div className="mb-6 rounded-2xl border border-border bg-white p-5">
                    <h2 className="mb-4 text-sm font-semibold text-text">퍼널 단계</h2>
                    <div className="space-y-3">
                        {data.steps.map((s, i) => {
                            const widthPct = maxCount > 0 ? Math.max((s.count / maxCount) * 100, 5) : 5;
                            const color = STAGE_COLORS[i] || '#64748b';
                            return (
                                <div key={s.key}>
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 text-text-muted">{i + 1}</span>
                                            <span className="font-semibold text-text">{s.label}</span>
                                            {i > 0 && (
                                                <span className="inline-flex items-center gap-0.5 text-text-muted">
                                                    <TrendingDown size={10} /> {s.conversionFromPrev}%
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-text-sub">
                                            <span className="font-bold text-text">{s.count.toLocaleString()}</span>
                                            <span className="ml-1 text-[10px] text-text-muted">({s.conversionFromTop}%)</span>
                                        </span>
                                    </div>
                                    <div className="h-8 rounded-lg overflow-hidden bg-surface">
                                        <div className="h-full rounded-lg flex items-center justify-end pr-3 text-[10px] text-white font-medium"
                                            style={{ width: `${widthPct}%`, background: color }}>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {!loading && data && data.totalSessions === 0 && (
                <div className="rounded-2xl border border-border bg-white p-12 text-center">
                    <div className="text-sm font-semibold text-text">이 기간의 세션이 없습니다</div>
                    <p className="mt-2 text-xs text-text-muted">기간을 늘리거나 더 많은 이벤트가 쌓이면 분석 가능합니다.</p>
                </div>
            )}

            <NextStepCTA stage="분석 → 기획" title="병목 구간 기반으로 개선 프로젝트 시작"
                description="퍼널 분석 결과를 프로젝트와 태스크로 전환하여 체계적으로 개선하세요" actionLabel="프로젝트 생성"
                href="/smarcomm/dashboard/workflow/projects" />

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted leading-relaxed">
                <strong className="text-text-sub">🔬 출처</strong> · DB <code className="font-mono text-[10px]">wio_analytics_events</code> ·
                <strong className="ml-1">퍼널 정의</strong>: 랜딩(/, /badak, /smarcomm 등) → 탐색(/explore, /groups, /about, /community) → 참여(/my, /create, /apply, /scan) → 전환(/signup, /login, /pricing, /checkout). session_id 단위 단계 진입 추적.
            </div>
        </div>
    );
}

function KpiCard({ label, value, accent, loading, suffix }: { label: string; value: number; accent: string; loading: boolean; suffix?: string }) {
    return (
        <div className="rounded-2xl border border-border bg-white p-4">
            <div className="text-xs text-text-muted">{label}</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: accent }}>
                {loading ? '—' : `${value.toLocaleString()}${suffix ?? ''}`}
            </div>
        </div>
    );
}
