"use client";

import { useState, useEffect } from "react";
import { useBumsFilter } from "../layout";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, Eye, ThumbsUp, MessageSquare, FileText, Users, Mail, RefreshCw } from "lucide-react";
import { siteConfigs } from "@/lib/site-config";

interface SiteStat {
    site: string;
    siteName: string;
    postCount: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
}

interface OverallStat {
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    memberCount: number;
    subscriberCount: number;
}

export default function StatsPage() {
    const { selectedSiteId } = useBumsFilter();
    const [siteStats, setSiteStats] = useState<SiteStat[]>([]);
    const [overall, setOverall] = useState<OverallStat | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => { fetchStats(); }, [selectedSiteId]);

    async function fetchStats() {
        setLoading(true);
        try {
            const [postsRes, membersRes, subsRes] = await Promise.all([
                supabase.from('posts').select('site, view_count, like_count, comment_count'),
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }).eq('status', 'active'),
            ]);

            const posts = (postsRes.data || []) as { site: string; view_count: number; like_count: number; comment_count: number }[];
            const filtered = selectedSiteId === 'all' ? posts : posts.filter(p => p.site === selectedSiteId);

            // 전체 통계
            setOverall({
                totalPosts: filtered.length,
                totalViews: filtered.reduce((s, p) => s + (p.view_count || 0), 0),
                totalLikes: filtered.reduce((s, p) => s + (p.like_count || 0), 0),
                totalComments: filtered.reduce((s, p) => s + (p.comment_count || 0), 0),
                memberCount: membersRes.count || 0,
                subscriberCount: subsRes.count || 0,
            });

            // 사이트별 집계
            const siteMap: Record<string, { postCount: number; totalViews: number; totalLikes: number; totalComments: number }> = {};
            for (const p of filtered) {
                if (!siteMap[p.site]) siteMap[p.site] = { postCount: 0, totalViews: 0, totalLikes: 0, totalComments: 0 };
                siteMap[p.site].postCount++;
                siteMap[p.site].totalViews += p.view_count || 0;
                siteMap[p.site].totalLikes += p.like_count || 0;
                siteMap[p.site].totalComments += p.comment_count || 0;
            }

            const stats: SiteStat[] = Object.entries(siteMap).map(([site, data]) => ({
                site,
                siteName: (siteConfigs as any)[site]?.name || site,
                ...data,
            })).sort((a, b) => b.totalViews - a.totalViews);

            setSiteStats(stats);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const kpis = overall ? [
        { label: '총 게시글', value: overall.totalPosts.toLocaleString(), icon: FileText, color: 'text-blue-600' },
        { label: '총 조회수', value: overall.totalViews.toLocaleString(), icon: Eye, color: 'text-purple-600' },
        { label: '총 좋아요', value: overall.totalLikes.toLocaleString(), icon: ThumbsUp, color: 'text-rose-500' },
        { label: '총 댓글', value: overall.totalComments.toLocaleString(), icon: MessageSquare, color: 'text-green-600' },
        { label: '회원 수', value: overall.memberCount.toLocaleString(), icon: Users, color: 'text-orange-500' },
        { label: '뉴스레터 구독', value: overall.subscriberCount.toLocaleString(), icon: Mail, color: 'text-indigo-500' },
    ] : [];

    const maxViews = Math.max(...siteStats.map(s => s.totalViews), 1);

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">통계</h1>
                    <p className="text-sm text-neutral-500 mt-1">사이트별 방문자, 게시글, 매출 통계를 분석합니다.</p>
                </div>
                <button onClick={fetchStats} className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200 text-xs hover:bg-neutral-50 transition-colors">
                    <RefreshCw className="h-3.5 w-3.5" /> 새로고침
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* KPI 카드 */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {kpis.map(kpi => (
                            <div key={kpi.label} className="bg-white border border-neutral-200 p-4">
                                <kpi.icon className={`h-4 w-4 mb-2 ${kpi.color}`} />
                                <p className="text-xl font-bold">{kpi.value}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{kpi.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* 사이트별 통계 */}
                    {siteStats.length === 0 ? (
                        <div className="bg-white border border-neutral-200 p-12 text-center">
                            <BarChart3 className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                            <p className="text-sm text-neutral-400">게시글 데이터가 없습니다</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-neutral-200">
                            <div className="px-5 py-4 border-b border-neutral-100">
                                <h2 className="text-sm font-semibold">사이트별 콘텐츠 통계</h2>
                            </div>
                            <div className="divide-y divide-neutral-50">
                                {siteStats.map(s => {
                                    const viewRate = Math.round((s.totalViews / maxViews) * 100);
                                    return (
                                        <div key={s.site} className="px-5 py-3.5 hover:bg-neutral-50 transition-colors">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-medium">{s.siteName}</span>
                                                <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                    <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{s.postCount}</span>
                                                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{s.totalViews.toLocaleString()}</span>
                                                    <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />{s.totalLikes}</span>
                                                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{s.totalComments}</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-neutral-100 overflow-hidden">
                                                <div className="h-full bg-neutral-900 transition-all" style={{ width: `${viewRate}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
