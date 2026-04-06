"use client";

import { useState, useEffect } from "react";
import { fetchCampaigns, fetchLeads, fetchContentPosts, fetchTrends, type TrendInsight } from "@/lib/supabase/marketing";

import { Campaign, Lead, ContentPost } from "@/types/marketing";
import { BarChart3, TrendingUp, DollarSign, Users, Loader2, Flame } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

export default function AnalyticsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [contentPosts, setContentPosts] = useState<ContentPost[]>([]);
    const [trends, setTrends] = useState<TrendInsight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            fetchCampaigns(),
            fetchLeads(),
            fetchContentPosts(),
            fetchTrends({ limit: 5 }).catch(() => []),
        ])
            .then(([c, l, p, t]) => {
                if (cancelled) return;
                setCampaigns(c);
                setLeads(l);
                setContentPosts(p);
                setTrends(t as TrendInsight[]);
            })
            .catch(() => {
                if (!cancelled) { setCampaigns([]); setLeads([]); setContentPosts([]); }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const wonLeads = leads.filter(l => l.stage === 'Won').length;
    const totalLeadValue = leads.filter(l => l.stage === 'Won').reduce((s, l) => s + l.value, 0);
    const publishedContent = contentPosts.filter(p => p.status === 'Published').length;
    const totalEngagement = contentPosts.reduce((s, p) => s + (p.engagement ?? 0), 0);

    const funnelStages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
    const funnelData = funnelStages.map(stage => ({ stage, count: leads.filter(l => l.stage === stage).length }));
    const maxFunnel = Math.max(...funnelData.map(f => f.count), 1);

    const channelStats = [...new Set(contentPosts.map(p => p.channel))].map(ch => {
        const posts = contentPosts.filter(p => p.channel === ch);
        return { channel: ch, count: posts.length, engagement: posts.reduce((s, p) => s + (p.engagement ?? 0), 0) };
    }).sort((a, b) => b.engagement - a.engagement);

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <PageHeader title="Analytics" description="마케팅 성과를 분석합니다." />

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-4">
                <div className="border border-neutral-200 bg-white p-5">
                    <DollarSign className="h-5 w-5 text-neutral-500 mb-2" />
                    <p className="text-2xl font-bold">₩{(totalSpent / 10000).toLocaleString()}만</p>
                    <p className="text-xs text-neutral-400">총 마케팅 집행</p>
                </div>
                <div className="border border-neutral-200 bg-white p-5">
                    <TrendingUp className="h-5 w-5 text-neutral-400 mb-2" />
                    <p className="text-2xl font-bold">{wonLeads}건</p>
                    <p className="text-xs text-neutral-400">성사 리드 (₩{(totalLeadValue / 10000).toLocaleString()}만)</p>
                </div>
                <div className="border border-neutral-200 bg-white p-5">
                    <BarChart3 className="h-5 w-5 text-neutral-500 mb-2" />
                    <p className="text-2xl font-bold">{publishedContent}건</p>
                    <p className="text-xs text-neutral-400">발행 콘텐츠 (총 {totalEngagement} engagement)</p>
                </div>
                <div className="border border-neutral-200 bg-white p-5">
                    <Users className="h-5 w-5 text-neutral-500 mb-2" />
                    <p className="text-2xl font-bold">{activeCampaigns}개</p>
                    <p className="text-xs text-neutral-400">진행 중 캠페인</p>
                </div>
            </div>

            {/* Mindle Insight — 실 DB 연동 */}
            {trends.length > 0 && (
                <div className="border border-neutral-200 bg-white p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Flame className="h-4 w-4 text-neutral-500" />
                        <h3 className="text-sm font-semibold">Mindle 트렌드 Insight</h3>
                        <span className="ml-auto text-xs text-neutral-400">by Mindle DB</span>
                    </div>
                    <div className="divide-y divide-neutral-100">
                        {trends.map(t => (
                            <div key={t.id} className="py-3 flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-900 truncate">{t.title}</p>
                                    <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{t.summary}</p>
                                    <div className="flex gap-1.5 mt-1">
                                        <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5">{t.category}</span>
                                        {t.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] bg-neutral-50 text-neutral-400 px-1.5 py-0.5"># {tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold">{Math.round((t.relevanceScore ?? 0) * 100)}%</p>
                                    <p className="text-[10px] text-neutral-400">관련도</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-6">
                {/* Lead Funnel */}
                <div className="border border-neutral-200 bg-white p-6">
                    <h3 className="text-sm font-semibold mb-4">리드 퍼널 전환</h3>
                    <div className="space-y-3">
                        {funnelData.map(f => (
                            <div key={f.stage} className="flex items-center gap-3">
                                <span className="text-xs text-neutral-400 w-20">{f.stage}</span>
                                <div className="flex-1 h-6 bg-neutral-100 overflow-hidden">
                                    <div className="h-full bg-neutral-900 flex items-center pl-2"
                                        style={{ width: `${(f.count / maxFunnel) * 100}%`, minWidth: f.count > 0 ? '24px' : '0' }}>
                                        {f.count > 0 && <span className="text-xs text-white font-bold">{f.count}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Channel Performance */}
                <div className="border border-neutral-200 bg-white p-6">
                    <h3 className="text-sm font-semibold mb-4">채널별 콘텐츠 성과</h3>
                    <div className="space-y-3">
                        {channelStats.map(ch => (
                            <div key={ch.channel} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                                <div>
                                    <p className="text-sm text-neutral-500">{ch.channel}</p>
                                    <p className="text-xs text-neutral-300">{ch.count} posts</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">{ch.engagement.toLocaleString()}</p>
                                    <p className="text-xs text-neutral-300">engagement</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
