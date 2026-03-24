"use client";

import { useState, useEffect } from "react";
import { usePoints } from "@/lib/point-context";
import {
    TrendingUp, Users, FolderKanban, DollarSign, Target,
    ArrowUpRight, ArrowDownRight, Briefcase, Award, Globe,
    BarChart3, PieChart, Activity, ChevronRight, Star,
    Calendar, Layers, UserPlus, CheckCircle2, Clock, XCircle,
    Medal, Gem, Crown
} from "lucide-react";
import Link from "next/link";
import { gradeConfig, gradeLevels } from "@/types/point";
import type { GradeLevel } from "@/types/point";
import { getMemberStats } from "@/lib/supabase/members";
import { getProjectStats } from "@/lib/supabase/projects";

function fmt(n: number) { return new Intl.NumberFormat("ko-KR").format(n); }
function fmtM(n: number) { return (n / 10000).toFixed(0) + '만'; }
function fmtBillion(n: number) { return (n / 100000000).toFixed(1) + '억'; }

// ── Mock BI 데이터 ──
const bizOverview = {
    // 코어 사업
    core: { label: '코어 사업', revenue: 280000000, target: 500000000, projects: 4, brands: ['LUKI', 'RooK'] },
    // 확장 사업
    expand: { label: '확장 사업', revenue: 95000000, target: 200000000, projects: 3, brands: ['MADLeague', 'Badak'] },
    // 곁가지 사업
    side: { label: '곁가지 사업', revenue: 32000000, target: 80000000, projects: 2, brands: ['HeRo', 'Evolution School'] },
};

const monthlyRevenue = [
    { month: '1월', revenue: 45000000, cost: 28000000 },
    { month: '2월', revenue: 62000000, cost: 35000000 },
    { month: '3월', revenue: 78000000, cost: 42000000 },
];

const memberStats = {
    total: 42,
    staff: 8,
    partner: 5,
    juniorPartner: 4,
    crew: 18,
    member: 7,
    newThisMonth: 5,
    activeRate: 78,
    monthlyGrowth: [
        { month: '1월', total: 32, new: 3 },
        { month: '2월', total: 37, new: 5 },
        { month: '3월', total: 42, new: 5 },
    ],
};

const projectStats = {
    total: 12,
    planning: 2,
    inProgress: 6,
    completed: 3,
    onHold: 1,
    avgCompletionRate: 68,
    successRate: 75,
    avgProfitRate: 32.5,
    topProjects: [
        { name: 'LUKI 2nd Single', status: '진행', progress: 45, budget: 80000000, profit: 28 },
        { name: 'MADLeap 5기 운영', status: '진행', progress: 25, budget: 50000000, profit: 35 },
        { name: 'CJ ENM 콘텐츠', status: '입찰', progress: 0, budget: 150000000, profit: 0 },
        { name: '충남 마케팅 지원', status: '검토', progress: 0, budget: 80000000, profit: 0 },
        { name: 'Badak 네트워크 확장', status: '기획', progress: 10, budget: 30000000, profit: 40 },
    ],
};

const opportunityPipeline = {
    total: 8,
    totalValue: 685000000,
    byStatus: [
        { status: '신규', count: 2, value: 85000000, color: 'bg-blue-500' },
        { status: '검토중', count: 2, value: 280000000, color: 'bg-amber-500' },
        { status: '입찰중', count: 1, value: 150000000, color: 'bg-violet-500' },
        { status: '수주', count: 2, value: 130000000, color: 'bg-green-500' },
        { status: '실패/만료', count: 1, value: 40000000, color: 'bg-neutral-300' },
    ],
    conversionRate: 40,
    avgDealSize: 85625000,
    upcomingDeadlines: [
        { title: '서울시 디지털 마케팅 교육', deadline: '2026-03-28', value: 200000000, status: '검토중' },
        { title: 'CJ ENM 브랜드 콘텐츠', deadline: '2026-04-05', value: 150000000, status: '입찰중' },
        { title: '충남 청년 마케팅', deadline: '2026-04-15', value: 80000000, status: '검토중' },
    ],
};

const statusColor: Record<string, string> = {
    '기획': 'bg-blue-100 text-blue-600',
    '진행': 'bg-green-100 text-green-600',
    '검토': 'bg-amber-100 text-amber-600',
    '입찰': 'bg-violet-100 text-violet-600',
    '완료': 'bg-neutral-100 text-neutral-600',
    '보류': 'bg-red-100 text-red-500',
};

function ProgressBar({ value, max, color = 'bg-neutral-900' }: { value: number; max: number; color?: string }) {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    return (
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden flex-1">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
    );
}

export default function BIDashboardPage() {
    const { getLeaderboard } = usePoints();
    const [period] = useState('2026 Q1');
    const leaderboard = getLeaderboard().slice(0, 5);

    const [dbMemberStats, setDbMemberStats] = useState<{ total: number; staff: number; active: number } | null>(null);
    const [dbProjectStats, setDbProjectStats] = useState<{ total: number; inProgress: number; totalRevenue: number; totalProfit: number } | null>(null);

    useEffect(() => {
        getMemberStats()
            .then(stats => setDbMemberStats({ total: stats.total, staff: stats.staff, active: stats.active }))
            .catch(() => { /* DB 실패 시 Mock 유지 */ });
        getProjectStats()
            .then(stats => setDbProjectStats({ total: stats.total, inProgress: stats.inProgress, totalRevenue: stats.totalRevenue, totalProfit: stats.totalProfit }))
            .catch(() => { /* DB 실패 시 Mock 유지 */ });
    }, []);

    const totalRevenue = dbProjectStats?.totalRevenue || (bizOverview.core.revenue + bizOverview.expand.revenue + bizOverview.side.revenue);
    const totalTarget = bizOverview.core.target + bizOverview.expand.target + bizOverview.side.target;
    const totalCost = monthlyRevenue.reduce((s, m) => s + m.cost, 0);
    const totalProfit = dbProjectStats?.totalProfit || (totalRevenue - totalCost);

    return (
        <div className="max-w-7xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">BI Dashboard</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">Ten:One™ 전사 경영 현황 · {period}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-400">마지막 업데이트: 2026-03-22 09:00</span>
                </div>
            </div>

            {/* Row 1: KPI 카드 */}
            <div className="grid grid-cols-5 gap-3 mb-6">
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <DollarSign className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-[10px] text-neutral-400">누적 매출</span>
                    </div>
                    <div className="text-xl font-bold">{fmtBillion(totalRevenue)}</div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600">
                        <ArrowUpRight className="h-3 w-3" /> 목표 대비 {Math.round((totalRevenue / totalTarget) * 100)}%
                    </div>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <TrendingUp className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-[10px] text-neutral-400">영업이익</span>
                    </div>
                    <div className="text-xl font-bold">{fmtBillion(totalProfit)}</div>
                    <div className="text-[10px] text-neutral-400 mt-1">이익률 {Math.round((totalProfit / totalRevenue) * 100)}%</div>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <FolderKanban className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-[10px] text-neutral-400">진행 프로젝트</span>
                    </div>
                    <div className="text-xl font-bold">{dbProjectStats?.inProgress ?? projectStats.inProgress}<span className="text-sm font-normal text-neutral-400">/{dbProjectStats?.total ?? projectStats.total}</span></div>
                    <div className="text-[10px] text-neutral-400 mt-1">평균 완료율 {projectStats.avgCompletionRate}%</div>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Target className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-[10px] text-neutral-400">Opportunity</span>
                    </div>
                    <div className="text-xl font-bold">{opportunityPipeline.total}<span className="text-sm font-normal text-neutral-400">건</span></div>
                    <div className="text-[10px] text-neutral-400 mt-1">파이프라인 {fmtBillion(opportunityPipeline.totalValue)}</div>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Users className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-[10px] text-neutral-400">전체 멤버</span>
                    </div>
                    <div className="text-xl font-bold">{dbMemberStats?.total ?? memberStats.total}<span className="text-sm font-normal text-neutral-400">명</span></div>
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600">
                        <UserPlus className="h-3 w-3" /> 이번 달 +{memberStats.newThisMonth}
                    </div>
                </div>
            </div>

            {/* Row 2: 사업 현황 (3축) + 매출 추이 */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* 3축 사업 현황 */}
                <div className="col-span-2 border border-neutral-200 bg-white p-5">
                    <h3 className="text-xs font-bold mb-4 flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" /> 사업 3축 현황
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(bizOverview).map(([key, biz]) => {
                            const pct = Math.round((biz.revenue / biz.target) * 100);
                            return (
                                <div key={key}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium">{biz.label}</span>
                                            <span className="text-[10px] text-neutral-400">{biz.brands.join(', ')}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-neutral-500">{biz.projects}건</span>
                                            <span className="font-bold">{fmtBillion(biz.revenue)}</span>
                                            <span className="text-neutral-400">/ {fmtBillion(biz.target)}</span>
                                            <span className={`font-bold ${pct >= 50 ? 'text-green-600' : 'text-amber-600'}`}>{pct}%</span>
                                        </div>
                                    </div>
                                    <ProgressBar value={biz.revenue} max={biz.target} color={key === 'core' ? 'bg-neutral-900' : key === 'expand' ? 'bg-blue-500' : 'bg-amber-400'} />
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center justify-between">
                        <span className="text-xs font-medium">합계</span>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="text-neutral-500">{bizOverview.core.projects + bizOverview.expand.projects + bizOverview.side.projects}건</span>
                            <span className="font-bold">{fmtBillion(totalRevenue)}</span>
                            <span className="text-neutral-400">/ {fmtBillion(totalTarget)}</span>
                            <span className="font-bold text-green-600">{Math.round((totalRevenue / totalTarget) * 100)}%</span>
                        </div>
                    </div>
                </div>

                {/* 월별 매출/비용 추이 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <h3 className="text-xs font-bold mb-4 flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5" /> 월별 매출·비용
                    </h3>
                    <div className="space-y-3">
                        {monthlyRevenue.map(m => (
                            <div key={m.month}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-neutral-500">{m.month}</span>
                                    <span className="font-bold">{fmtM(m.revenue)}</span>
                                </div>
                                <div className="flex gap-1 h-3">
                                    <div className="bg-neutral-800 rounded-sm" style={{ width: `${(m.revenue / 100000000) * 100}%` }} />
                                    <div className="bg-red-200 rounded-sm" style={{ width: `${(m.cost / 100000000) * 100}%` }} />
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-0.5">
                                    <span>매출</span>
                                    <span>비용 {fmtM(m.cost)} · 이익 {fmtM(m.revenue - m.cost)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-2 border-t border-neutral-50 text-[10px]">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 bg-neutral-800 rounded-sm" /> 매출</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 bg-red-200 rounded-sm" /> 비용</span>
                    </div>
                </div>
            </div>

            {/* Row 3: 프로젝트 현황 + Opportunity 파이프라인 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* 프로젝트 현황 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold flex items-center gap-1.5">
                            <FolderKanban className="h-3.5 w-3.5" /> 프로젝트 현황
                        </h3>
                        <Link href="/intra/project/management" className="text-[10px] text-neutral-400 hover:text-neutral-900">전체 →</Link>
                    </div>
                    {/* 상태 바 */}
                    <div className="flex items-center gap-0 h-4 rounded-full overflow-hidden mb-3">
                        <div className="bg-blue-400 h-full" style={{ width: `${(projectStats.planning / projectStats.total) * 100}%` }} title="기획" />
                        <div className="bg-green-500 h-full" style={{ width: `${(projectStats.inProgress / projectStats.total) * 100}%` }} title="진행" />
                        <div className="bg-neutral-400 h-full" style={{ width: `${(projectStats.completed / projectStats.total) * 100}%` }} title="완료" />
                        <div className="bg-red-300 h-full" style={{ width: `${(projectStats.onHold / projectStats.total) * 100}%` }} title="보류" />
                    </div>
                    <div className="flex items-center gap-4 text-[10px] mb-4">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 bg-blue-400 rounded-full" /> 기획 {projectStats.planning}</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 bg-green-500 rounded-full" /> 진행 {projectStats.inProgress}</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 bg-neutral-400 rounded-full" /> 완료 {projectStats.completed}</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 bg-red-300 rounded-full" /> 보류 {projectStats.onHold}</span>
                    </div>
                    {/* 주요 프로젝트 */}
                    <div className="space-y-2">
                        {projectStats.topProjects.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-neutral-50 last:border-0">
                                <span className={`px-1.5 py-0.5 text-[9px] rounded ${statusColor[p.status] || 'bg-neutral-100 text-neutral-500'}`}>{p.status}</span>
                                <span className="flex-1 truncate font-medium">{p.name}</span>
                                <span className="text-neutral-400 w-12 text-right">{fmtM(p.budget)}</span>
                                {p.progress > 0 && (
                                    <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${p.progress}%` }} />
                                    </div>
                                )}
                                <span className="text-neutral-400 w-8 text-right">{p.progress}%</span>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-neutral-50">
                        <div className="text-center">
                            <div className="text-lg font-bold">{projectStats.successRate}%</div>
                            <div className="text-[10px] text-neutral-400">성공률</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold">{projectStats.avgProfitRate}%</div>
                            <div className="text-[10px] text-neutral-400">평균 이익률</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold">{projectStats.avgCompletionRate}%</div>
                            <div className="text-[10px] text-neutral-400">평균 완료율</div>
                        </div>
                    </div>
                </div>

                {/* Opportunity 파이프라인 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5" /> Opportunity 파이프라인
                        </h3>
                        <Link href="/intra/opportunity" className="text-[10px] text-neutral-400 hover:text-neutral-900">전체 →</Link>
                    </div>
                    {/* 퍼널 바 */}
                    <div className="flex items-center gap-0.5 h-6 rounded overflow-hidden mb-3">
                        {opportunityPipeline.byStatus.map(s => (
                            <div key={s.status} className={`${s.color} h-full`}
                                style={{ width: `${(s.value / opportunityPipeline.totalValue) * 100}%` }}
                                title={`${s.status}: ${fmtBillion(s.value)}`} />
                        ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] mb-4">
                        {opportunityPipeline.byStatus.map(s => (
                            <span key={s.status} className="flex items-center gap-1">
                                <span className={`h-2 w-2 rounded-full ${s.color}`} />
                                {s.status} {s.count}건 ({fmtBillion(s.value)})
                            </span>
                        ))}
                    </div>
                    {/* 마감 임박 */}
                    <h4 className="text-[10px] font-bold text-neutral-500 mb-2">마감 임박</h4>
                    <div className="space-y-2">
                        {opportunityPipeline.upcomingDeadlines.map((d, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-neutral-50 last:border-0">
                                <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                                <span className="flex-1 truncate">{d.title}</span>
                                <span className="text-neutral-400">{fmtM(d.value)}</span>
                                <span className="text-amber-600 text-[10px] font-medium">{d.deadline}</span>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-neutral-50">
                        <div className="text-center">
                            <div className="text-lg font-bold">{opportunityPipeline.conversionRate}%</div>
                            <div className="text-[10px] text-neutral-400">전환율</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold">{fmtM(opportunityPipeline.avgDealSize)}</div>
                            <div className="text-[10px] text-neutral-400">평균 딜 규모</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold">{fmtBillion(opportunityPipeline.totalValue)}</div>
                            <div className="text-[10px] text-neutral-400">파이프라인 총액</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 4: 멤버 현황 + 포인트 리더보드 */}
            <div className="grid grid-cols-3 gap-4">
                {/* 멤버 현황 */}
                <div className="col-span-2 border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" /> 멤버 현황
                        </h3>
                        <Link href="/intra/erp/hr/people" className="text-[10px] text-neutral-400 hover:text-neutral-900">전체 →</Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {/* 구성 */}
                        <div>
                            <h4 className="text-[10px] font-bold text-neutral-500 mb-2">그룹별 구성</h4>
                            <div className="space-y-2">
                                {[
                                    { label: 'Staff', count: memberStats.staff, total: memberStats.total, color: 'bg-neutral-800' },
                                    { label: 'Partner', count: memberStats.partner, total: memberStats.total, color: 'bg-blue-500' },
                                    { label: 'Junior Partner', count: memberStats.juniorPartner, total: memberStats.total, color: 'bg-cyan-400' },
                                    { label: 'Crew', count: memberStats.crew, total: memberStats.total, color: 'bg-amber-400' },
                                    { label: 'Member', count: memberStats.member, total: memberStats.total, color: 'bg-neutral-300' },
                                ].map(g => (
                                    <div key={g.label} className="flex items-center gap-2 text-xs">
                                        <span className="w-24 text-neutral-600">{g.label}</span>
                                        <ProgressBar value={g.count} max={g.total} color={g.color} />
                                        <span className="w-8 text-right font-medium">{g.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* 월별 가입 추이 + KPI */}
                        <div>
                            <h4 className="text-[10px] font-bold text-neutral-500 mb-2">월별 가입 추이</h4>
                            <div className="space-y-2 mb-4">
                                {memberStats.monthlyGrowth.map(m => (
                                    <div key={m.month} className="flex items-center gap-2 text-xs">
                                        <span className="w-8 text-neutral-400">{m.month}</span>
                                        <ProgressBar value={m.total} max={50} color="bg-neutral-700" />
                                        <span className="w-8 text-right font-medium">{m.total}</span>
                                        <span className="text-green-600 text-[10px]">+{m.new}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="border border-neutral-100 p-2 text-center">
                                    <div className="text-base font-bold text-green-600">{memberStats.activeRate}%</div>
                                    <div className="text-[9px] text-neutral-400">활성률</div>
                                </div>
                                <div className="border border-neutral-100 p-2 text-center">
                                    <div className="text-base font-bold">+{memberStats.newThisMonth}</div>
                                    <div className="text-[9px] text-neutral-400">이번 달 신규</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 포인트 리더보드 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5" /> 포인트 Top 5
                        </h3>
                        <Link href="/intra/erp/hr/points" className="text-[10px] text-neutral-400 hover:text-neutral-900">전체 →</Link>
                    </div>
                    <div className="space-y-2">
                        {leaderboard.map((m, i) => (
                            <div key={m.memberId} className="flex items-center gap-2 text-xs py-1.5 border-b border-neutral-50 last:border-0">
                                <span className={`w-5 text-center font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-neutral-400' : i === 2 ? 'text-amber-600' : 'text-neutral-300'}`}>
                                    {i + 1}
                                </span>
                                <span className="text-[10px]">{gradeConfig[m.grade].icon}</span>
                                <span className="flex-1 font-medium">{m.memberName}</span>
                                <span className="font-bold">{fmt(m.totalPoints)}P</span>
                            </div>
                        ))}
                    </div>
                    {/* 등급 분포 */}
                    <div className="mt-3 pt-3 border-t border-neutral-50">
                        <h4 className="text-[10px] font-bold text-neutral-500 mb-2">등급 분포</h4>
                        <div className="flex items-center gap-2">
                            {gradeLevels.map(g => {
                                const count = leaderboard.filter(m => m.grade === g).length;
                                return (
                                    <div key={g} className="text-center flex-1">
                                        <div className="text-sm">{gradeConfig[g].icon}</div>
                                        <div className="text-xs font-bold">{count}</div>
                                        <div className="text-[9px] text-neutral-400">{g}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
