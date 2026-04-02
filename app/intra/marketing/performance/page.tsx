"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchCampaigns, fetchLeads } from "@/lib/supabase/marketing";
import { initialCampaigns, initialLeads } from "@/lib/marketing-data";
import type { Campaign, Lead } from "@/types/marketing";
import { BarChart3, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";

interface PerfSnapshot {
    id: string;
    channel: string;
    metric_name: string;
    value: number;
    target: number;
    period: string;
    brand_id: string;
}

const CHANNELS = ['Instagram', 'YouTube', 'TikTok', 'Email', 'Blog', 'Paid', 'SEO'];

function Trend({ value, target }: { value: number; target: number }) {
    const rate = target > 0 ? (value / target) * 100 : 0;
    if (rate >= 100) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate >= 70) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
}

export default function PerformancePage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [snapshots, setSnapshots] = useState<PerfSnapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchCampaigns().then(rows => { if (rows.length > 0) setCampaigns(rows); }).catch(() => {});
        fetchLeads().then(rows => { if (rows.length > 0) setLeads(rows); }).catch(() => {});
        fetchSnapshots();
    }, []);

    async function fetchSnapshots() {
        setLoading(true);
        const { data } = await supabase
            .from('mkt_performance')
            .select('*')
            .order('period', { ascending: false })
            .limit(100);
        setSnapshots(data || []);
        setLoading(false);
    }

    // Context 기반 KPI (실데이터)
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
    const spendRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const activeLeads = leads.filter(l => !['Won', 'Lost'].includes(l.stage)).length;
    const wonLeads = leads.filter(l => l.stage === 'Won').length;
    const convRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;
    const pipelineValue = leads.filter(l => !['Won', 'Lost'].includes(l.stage)).reduce((s, l) => s + l.value, 0);

    const kpis = [
        { label: '활성 캠페인', value: activeCampaigns, unit: '건', target: 5, color: 'bg-blue-500' },
        { label: '예산 집행률', value: spendRate, unit: '%', target: 80, color: 'bg-purple-500' },
        { label: '활성 리드', value: activeLeads, unit: '건', target: 20, color: 'bg-green-500' },
        { label: '전환율', value: convRate, unit: '%', target: 15, color: 'bg-orange-500' },
        { label: '파이프라인', value: Math.round(pipelineValue / 10000), unit: '만원', target: 1000, color: 'bg-indigo-500' },
        { label: '총 예산', value: Math.round(totalBudget / 10000), unit: '만원', target: Math.round(totalBudget / 10000), color: 'bg-neutral-400' },
    ];

    // 채널별 스냅샷 그룹핑
    const byChannel = CHANNELS.map(ch => ({
        channel: ch,
        items: snapshots.filter(s => s.channel === ch),
    })).filter(g => g.items.length > 0);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Performance</h2>
                    <p className="mt-0.5 text-sm text-neutral-400">채널별 KPI 현황</p>
                </div>
                <button onClick={fetchSnapshots} className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 text-xs hover:bg-neutral-50 transition-colors">
                    <RefreshCw className="h-3.5 w-3.5" /> 새로고침
                </button>
            </div>

            {/* 핵심 KPI */}
            <div>
                <h3 className="text-sm font-semibold mb-3 text-neutral-700">핵심 지표 (실데이터)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {kpis.map(kpi => {
                        const rate = kpi.target > 0 ? Math.min((kpi.value / kpi.target) * 100, 100) : 0;
                        return (
                            <div key={kpi.label} className="border border-neutral-200 bg-white p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-neutral-500">{kpi.label}</p>
                                    <Trend value={kpi.value} target={kpi.target} />
                                </div>
                                <p className="text-2xl font-bold">{kpi.value.toLocaleString()}<span className="text-sm font-normal text-neutral-400 ml-1">{kpi.unit}</span></p>
                                <div className="mt-2 h-1 bg-neutral-100 overflow-hidden">
                                    <div className={`h-full ${kpi.color}`} style={{ width: `${rate}%` }} />
                                </div>
                                <p className="text-xs text-neutral-400 mt-1">목표 {kpi.target.toLocaleString()}{kpi.unit}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 채널별 스냅샷 */}
            <div>
                <h3 className="text-sm font-semibold mb-3 text-neutral-700">채널별 KPI 스냅샷</h3>
                {loading ? (
                    <div className="flex justify-center py-8"><div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" /></div>
                ) : byChannel.length === 0 ? (
                    <div className="text-center py-12 text-neutral-400 border border-dashed border-neutral-200">
                        <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">채널 KPI 데이터가 없습니다</p>
                        <p className="text-xs mt-1">mkt_performance 테이블에 데이터를 추가하세요</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {byChannel.map(group => (
                            <div key={group.channel}>
                                <h4 className="text-xs font-semibold text-neutral-500 mb-2">{group.channel}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {group.items.map(snap => {
                                        const rate = snap.target > 0 ? Math.min((snap.value / snap.target) * 100, 100) : 0;
                                        return (
                                            <div key={snap.id} className="border border-neutral-200 bg-white p-3">
                                                <p className="text-xs text-neutral-500 mb-1">{snap.metric_name}</p>
                                                <div className="flex items-end gap-1">
                                                    <p className="text-lg font-bold">{snap.value.toLocaleString()}</p>
                                                    <Trend value={snap.value} target={snap.target} />
                                                </div>
                                                <div className="mt-1.5 h-1 bg-neutral-100 overflow-hidden">
                                                    <div className="h-full bg-neutral-900" style={{ width: `${rate}%` }} />
                                                </div>
                                                <p className="text-xs text-neutral-400 mt-1">목표 {snap.target.toLocaleString()} · {snap.period}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 캠페인별 집행 현황 */}
            <div>
                <h3 className="text-sm font-semibold mb-3 text-neutral-700">캠페인 예산 집행</h3>
                <div className="space-y-2">
                    {campaigns.slice(0, 8).map(c => {
                        const rate = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0;
                        return (
                            <div key={c.id} className="flex items-center gap-3 border border-neutral-200 bg-white px-4 py-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="text-sm font-medium truncate">{c.name}</p>
                                        <span className={`text-xs ml-2 flex-shrink-0 ${c.status === 'Active' ? 'text-green-600' : 'text-neutral-400'}`}>{c.status}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-neutral-100 overflow-hidden">
                                            <div className={`h-full ${rate >= 90 ? 'bg-red-500' : rate >= 70 ? 'bg-yellow-500' : 'bg-neutral-900'}`}
                                                style={{ width: `${rate}%` }} />
                                        </div>
                                        <span className="text-xs text-neutral-400 flex-shrink-0">{rate}%</span>
                                        <span className="text-xs text-neutral-400 flex-shrink-0">₩{(c.spent / 10000).toLocaleString()}만 / {(c.budget / 10000).toLocaleString()}만</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
