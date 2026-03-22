"use client";

import { useMarketing } from "@/lib/marketing-context";
import { BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";

export default function AnalyticsPage() {
    const { campaigns, leads, contentPosts } = useMarketing();

    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
    const roi = totalSpent > 0 ? Math.round(((totalBudget - totalSpent) / totalSpent) * 100) : 0;
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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Analytics</h2>
                <p className="mt-2 text-neutral-500">마케팅 성과를 분석합니다.</p>
            </div>

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

            <div className="grid grid-cols-2 gap-6">
                {/* Lead Funnel */}
                <div className="border border-neutral-200 bg-white p-6">
                    <h3 className="text-sm font-semibold mb-4">리드 퍼널 전환</h3>
                    <div className="space-y-3">
                        {funnelData.map((f, idx) => (
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
