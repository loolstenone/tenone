"use client";

import { useState } from "react";
import { timelineData, universeNodes, universeLinks } from "@/lib/universe";
import { TimelineView } from "@/components/TimelineView";
import { RelationshipMap } from "@/components/RelationshipMap";
import { GitGraph, Network, BarChart3, TrendingUp, Users, Briefcase, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import clsx from "clsx";

type View = 'dashboard' | 'timeline' | 'graph';

interface BrandKPI {
    name: string;
    category: string;
    members: number;
    membersTrend: number;
    projects: number;
    revenue: string;
    revenueTrend: number;
    status: 'active' | 'building' | 'planning';
    wioModules: string[];
}

const BRAND_KPIS: BrandKPI[] = [
    { name: 'MADLeague', category: 'Community', members: 320, membersTrend: 12, projects: 7, revenue: '—', revenueTrend: 0, status: 'active', wioModules: ['Project', 'People', 'Talk', 'Competition'] },
    { name: 'Badak', category: 'Network', members: 1240, membersTrend: 8, projects: 3, revenue: '—', revenueTrend: 0, status: 'active', wioModules: ['People', 'Networking', 'Content'] },
    { name: 'HeRo', category: 'Talent', members: 85, membersTrend: 15, projects: 5, revenue: '480만', revenueTrend: 22, status: 'active', wioModules: ['People', 'Sales', 'Learn'] },
    { name: 'SmarComm', category: 'Marketing', members: 42, membersTrend: 35, projects: 12, revenue: '1,200만', revenueTrend: 45, status: 'active', wioModules: ['Project', 'Sales', 'Content', 'Insight'] },
    { name: 'WIO', category: 'Platform', members: 15, membersTrend: 0, projects: 1, revenue: '—', revenueTrend: 0, status: 'building', wioModules: ['All'] },
    { name: 'Evolution School', category: 'Education', members: 680, membersTrend: 5, projects: 24, revenue: '320만', revenueTrend: 10, status: 'active', wioModules: ['Learn', 'People', 'Certificate'] },
    { name: 'Mindle', category: 'Intelligence', members: 28, membersTrend: 20, projects: 2, revenue: '—', revenueTrend: 0, status: 'building', wioModules: ['Content', 'Insight'] },
    { name: 'ChangeUp', category: 'Startup', members: 95, membersTrend: 18, projects: 8, revenue: '150만', revenueTrend: -5, status: 'active', wioModules: ['Project', 'Finance', 'Learn'] },
    { name: 'RooK', category: 'Creator', members: 9, membersTrend: 0, projects: 8, revenue: '—', revenueTrend: 0, status: 'active', wioModules: ['Content', 'Project'] },
    { name: 'Brand Gravity', category: 'Consulting', members: 5, membersTrend: 0, projects: 3, revenue: '800만', revenueTrend: 30, status: 'active', wioModules: ['Project', 'Sales'] },
    { name: 'Naming Factory', category: 'Naming', members: 3, membersTrend: 0, projects: 15, revenue: '450만', revenueTrend: 12, status: 'active', wioModules: ['Project', 'Sales'] },
    { name: 'YouInOne', category: 'HR Solution', members: 12, membersTrend: 0, projects: 4, revenue: '—', revenueTrend: 0, status: 'building', wioModules: ['People', 'Finance', 'Timesheet'] },
];

const STATUS_CONFIG = {
    active: { label: '운영중', color: 'text-emerald-600 bg-emerald-50' },
    building: { label: '구축중', color: 'text-blue-600 bg-blue-50' },
    planning: { label: '기획중', color: 'text-neutral-500 bg-neutral-100' },
};

function TrendIcon({ value }: { value: number }) {
    if (value > 0) return <span className="flex items-center gap-0.5 text-[10px] text-emerald-600"><ArrowUpRight className="w-3 h-3" />+{value}%</span>;
    if (value < 0) return <span className="flex items-center gap-0.5 text-[10px] text-red-500"><ArrowDownRight className="w-3 h-3" />{value}%</span>;
    return <span className="flex items-center gap-0.5 text-[10px] text-neutral-400"><Minus className="w-3 h-3" />—</span>;
}

export default function UniversePage() {
    const [view, setView] = useState<View>('dashboard');
    const [sortBy, setSortBy] = useState<'members' | 'revenue' | 'projects'>('members');

    const totalMembers = BRAND_KPIS.reduce((s, b) => s + b.members, 0);
    const totalProjects = BRAND_KPIS.reduce((s, b) => s + b.projects, 0);
    const activeBrands = BRAND_KPIS.filter(b => b.status === 'active').length;
    const totalModules = new Set(BRAND_KPIS.flatMap(b => b.wioModules)).size;

    const sorted = [...BRAND_KPIS].sort((a, b) => {
        if (sortBy === 'members') return b.members - a.members;
        if (sortBy === 'projects') return b.projects - a.projects;
        return 0;
    });

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Universe</h2>
                    <p className="mt-2 text-neutral-500">크로스 브랜드 현황 · 타임라인 · 관계도</p>
                </div>
                <div className="flex items-center bg-neutral-100 p-1 border border-neutral-200 overflow-x-auto">
                    {([
                        { id: 'dashboard' as View, icon: BarChart3, label: 'Dashboard' },
                        { id: 'timeline' as View, icon: GitGraph, label: 'Timeline' },
                        { id: 'graph' as View, icon: Network, label: 'Relationships' },
                    ]).map(t => (
                        <button key={t.id} onClick={() => setView(t.id)}
                            className={clsx("flex items-center gap-2 px-4 py-2 transition-colors text-sm font-medium whitespace-nowrap", view === t.id ? "bg-white" : "text-neutral-500 hover:text-neutral-900")}>
                            <t.icon className="h-4 w-4" /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {view === 'dashboard' && (
                <div className="space-y-6 animation-fade-in">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-neutral-500 mb-2"><Users className="w-4 h-4" /><span className="text-xs font-medium">총 멤버</span></div>
                            <div className="text-2xl font-bold">{totalMembers.toLocaleString()}</div>
                        </div>
                        <div className="border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-neutral-500 mb-2"><Briefcase className="w-4 h-4" /><span className="text-xs font-medium">총 프로젝트</span></div>
                            <div className="text-2xl font-bold">{totalProjects}</div>
                        </div>
                        <div className="border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-neutral-500 mb-2"><TrendingUp className="w-4 h-4" /><span className="text-xs font-medium">운영 브랜드</span></div>
                            <div className="text-2xl font-bold">{activeBrands}<span className="text-sm text-neutral-400 font-normal ml-1">/ {BRAND_KPIS.length}</span></div>
                        </div>
                        <div className="border border-neutral-200 rounded-xl p-5">
                            <div className="flex items-center gap-2 text-neutral-500 mb-2"><Network className="w-4 h-4" /><span className="text-xs font-medium">WIO 모듈</span></div>
                            <div className="text-2xl font-bold">{totalModules}</div>
                        </div>
                    </div>

                    {/* Brand Table */}
                    <div className="border border-neutral-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50">
                            <h3 className="text-sm font-semibold">브랜드별 현황</h3>
                            <div className="flex gap-1">
                                {([['members', '멤버순'], ['projects', '프로젝트순'], ['revenue', '매출순']] as [typeof sortBy, string][]).map(([id, label]) => (
                                    <button key={id} onClick={() => setSortBy(id)}
                                        className={clsx("px-2.5 py-1 rounded text-xs transition-colors", sortBy === id ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100")}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-neutral-100 text-xs text-neutral-500">
                                        <th className="text-left px-5 py-2.5 font-medium">브랜드</th>
                                        <th className="text-left px-5 py-2.5 font-medium">카테고리</th>
                                        <th className="text-right px-5 py-2.5 font-medium">멤버</th>
                                        <th className="text-right px-5 py-2.5 font-medium">증감</th>
                                        <th className="text-right px-5 py-2.5 font-medium">프로젝트</th>
                                        <th className="text-right px-5 py-2.5 font-medium">월 매출</th>
                                        <th className="text-center px-5 py-2.5 font-medium">상태</th>
                                        <th className="text-left px-5 py-2.5 font-medium">WIO 모듈</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sorted.map(b => {
                                        const st = STATUS_CONFIG[b.status];
                                        return (
                                            <tr key={b.name} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                                                <td className="px-5 py-3 font-semibold">{b.name}</td>
                                                <td className="px-5 py-3 text-neutral-500 text-xs">{b.category}</td>
                                                <td className="px-5 py-3 text-right font-medium">{b.members.toLocaleString()}</td>
                                                <td className="px-5 py-3 text-right"><TrendIcon value={b.membersTrend} /></td>
                                                <td className="px-5 py-3 text-right">{b.projects}</td>
                                                <td className="px-5 py-3 text-right text-neutral-600">{b.revenue}</td>
                                                <td className="px-5 py-3 text-center"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span></td>
                                                <td className="px-5 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {b.wioModules.slice(0, 3).map(m => (
                                                            <span key={m} className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500">{m}</span>
                                                        ))}
                                                        {b.wioModules.length > 3 && <span className="text-[9px] text-neutral-400">+{b.wioModules.length - 3}</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {view === 'timeline' && (
                <div className="min-h-[600px]">
                    <div className="max-w-3xl mx-auto animation-fade-in">
                        <TimelineView data={timelineData} />
                    </div>
                </div>
            )}

            {view === 'graph' && (
                <div className="min-h-[600px] animation-fade-in">
                    <RelationshipMap nodes={universeNodes} links={universeLinks} />
                </div>
            )}
        </div>
    );
}
