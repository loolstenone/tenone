'use client';

// Smart-Data Hub Widget — V2.0 § 3-B (Phase 5 Item 7)
// 4 소스 통합 KPI 위젯 — 진단·광고·AI 답변·유입
// 정직 원칙: 데이터 없으면 "—" + 사유 명시. Mock 폴백 없음.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Megaphone, Bot, BarChart3, AlertTriangle } from 'lucide-react';

type KpiStatus = 'ok' | 'no_data' | 'table_missing' | 'error';

interface Kpi {
    key: 'audit' | 'campaigns' | 'ai_diff' | 'traffic';
    label: string;
    source: string;
    value: number | null;
    valueLabel: string;
    sub?: string | null;
    status: KpiStatus;
    note?: string;
}

const KPI_META: Record<Kpi['key'], { icon: typeof Activity; color: string; href: string; deepLink: string }> = {
    audit:     { icon: Activity,  color: '#0EA5E9', href: '/smarcomm/dashboard/scan',       deepLink: '진단 페이지로' },
    campaigns: { icon: Megaphone, color: '#F59E0B', href: '/smarcomm/dashboard/campaigns',  deepLink: '캠페인 페이지로' },
    ai_diff:   { icon: Bot,       color: '#A855F7', href: '/smarcomm/dashboard/ai-tracker', deepLink: 'Tracker로' },
    traffic:   { icon: BarChart3, color: '#10B981', href: '/smarcomm/dashboard/traffic',    deepLink: '트래픽으로' },
};

export default function SmartDataHubWidget({ tenantId, domain }: { tenantId?: string; domain?: string | null }) {
    const [kpis, setKpis] = useState<Kpi[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatedAt, setGeneratedAt] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const params = new URLSearchParams();
            if (tenantId) params.set('tenant_id', tenantId);
            if (domain) params.set('domain', domain);
            try {
                const res = await fetch(`/api/smarcomm/data-hub?${params.toString()}`);
                const data = await res.json();
                if (!cancelled) {
                    setKpis(data.kpis ?? []);
                    setGeneratedAt(data.generated_at ?? null);
                }
            } catch {
                if (!cancelled) setKpis([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [tenantId, domain]);

    return (
        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white">
            <div className="flex items-center gap-2 border-b border-border bg-surface/40 px-5 py-3 flex-wrap">
                <h2 className="text-sm font-bold text-text inline-flex items-center gap-1.5">
                    Smart-Data Hub
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[9px] font-medium text-text-muted" title="진단·광고 성과·AI 답변 변화·유입 로그 4 소스 통합">
                        🔬 4 소스 통합
                    </span>
                </h2>
                <p className="text-[11px] text-text-muted">
                    {domain ? <>도메인 <code className="text-[10px]">{domain}</code> 기준</> : '워크스페이스 전체'}
                </p>
                {generatedAt && (
                    <span className="ml-auto text-[10px] text-text-muted">
                        {new Date(generatedAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} 갱신
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
                {(loading || !kpis ? [null, null, null, null] : kpis).map((kpi, i) => {
                    if (!kpi) {
                        return (
                            <div key={i} className="p-5 animate-pulse">
                                <div className="h-3 w-20 bg-surface rounded mb-3" />
                                <div className="h-8 w-16 bg-surface rounded mb-2" />
                                <div className="h-2 w-24 bg-surface rounded" />
                            </div>
                        );
                    }
                    const meta = KPI_META[kpi.key];
                    const Icon = meta.icon;
                    const isOk = kpi.status === 'ok' && kpi.value !== null;
                    const statusBadge = kpi.status === 'no_data' ? '데이터 없음'
                        : kpi.status === 'table_missing' ? '연동 준비 중'
                        : kpi.status === 'error' ? '집계 실패'
                        : null;
                    return (
                        <Link
                            key={kpi.key}
                            href={meta.href}
                            className="block p-5 hover:bg-surface/30 transition-colors group"
                        >
                            <div className="mb-2 flex items-center gap-1.5">
                                <span
                                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                                    style={{ background: `${meta.color}15`, color: meta.color }}
                                >
                                    <Icon size={14} />
                                </span>
                                <span className="text-[11px] font-semibold text-text-sub leading-tight">{kpi.label}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold tabular-nums" style={{ color: isOk ? meta.color : '#94A3B8' }}>
                                    {isOk ? kpi.value : '—'}
                                </span>
                                <span className="text-[11px] text-text-muted">{kpi.valueLabel}</span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5 min-h-[16px]">
                                {kpi.sub && <span className="text-[10px] text-text-muted truncate">{kpi.sub}</span>}
                                {statusBadge && (
                                    <span
                                        className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-700"
                                        title={kpi.note}
                                    >
                                        <AlertTriangle size={9} /> {statusBadge}
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 text-[10px] text-text-muted opacity-70 group-hover:opacity-100">
                                {meta.deepLink} →
                            </div>
                            <div className="mt-1 text-[9px] text-text-muted/60 font-mono truncate" title={kpi.source}>{kpi.source}</div>
                        </Link>
                    );
                })}
            </div>

            <div className="border-t border-border bg-surface/20 px-5 py-2 text-[10px] text-text-muted">
                ⓘ 4 소스 — 진단·광고 성과·AI 답변 변화·유입 로그 데이터를 매 페이지뷰마다 실시간 집계.
                {kpis && kpis.some(k => k.status !== 'ok') && ' 일부 소스는 데이터 누적이 시작되기 전입니다.'}
            </div>
        </div>
    );
}
