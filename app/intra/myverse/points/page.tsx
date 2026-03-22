"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { usePoints } from "@/lib/point-context";
import {
    Trophy, TrendingUp, Star, ArrowUpRight, ArrowDownRight,
    ChevronRight, Filter, Medal, Crown, Gem, Award
} from "lucide-react";
import { gradeConfig, getGradeByPoints, getPointsToNextGrade, pointCategoryLabels, gradeLevels } from "@/types/point";
import type { GradeLevel, PointCategory } from "@/types/point";

function formatNum(n: number) { return new Intl.NumberFormat("ko-KR").format(n); }

const gradeIcons: Record<GradeLevel, typeof Trophy> = {
    Bronze: Medal, Silver: Medal, Gold: Star, Platinum: Gem, Diamond: Crown,
};

export default function MyversePointsPage() {
    const { user } = useAuth();
    const { getMemberSummary, getLogsByMember, getLeaderboard } = usePoints();
    const [filterCat, setFilterCat] = useState<PointCategory | 'all'>('all');

    if (!user) return null;

    // 현재 사용자의 memberId 매핑 (Mock: staff-001)
    const memberId = 'staff-001';
    const summary = getMemberSummary(memberId);
    const logs = getLogsByMember(memberId);
    const leaderboard = getLeaderboard().slice(0, 10);

    if (!summary) return (
        <div className="text-center py-20 text-neutral-400">포인트 데이터가 없습니다.</div>
    );

    const grade = summary.grade;
    const config = gradeConfig[grade];
    const nextInfo = getPointsToNextGrade(summary.totalPoints);
    const GradeIcon = gradeIcons[grade];

    // 등급 진행률
    const currentMin = gradeConfig[grade].minPoints;
    const currentMax = gradeConfig[grade].maxPoints ?? summary.totalPoints;
    const progressPct = grade === 'Diamond' ? 100 : Math.round(((summary.totalPoints - currentMin) / (currentMax - currentMin + 1)) * 100);

    const filteredLogs = filterCat === 'all' ? logs : logs.filter(l => l.category === filterCat);

    // 카테고리별 합계
    const categoryTotals: { category: PointCategory; total: number }[] = [];
    const catMap = new Map<PointCategory, number>();
    logs.forEach(l => catMap.set(l.category, (catMap.get(l.category) || 0) + l.points));
    catMap.forEach((total, category) => categoryTotals.push({ category, total }));
    categoryTotals.sort((a, b) => b.total - a.total);

    return (
        <div className="max-w-5xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">내 포인트</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">활동에 따라 자동으로 포인트가 적립됩니다</p>
                </div>
            </div>

            {/* 등급 + 포인트 카드 */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {/* 현재 등급 */}
                <div className={`border border-neutral-200 bg-white p-5 col-span-2`}>
                    <div className="flex items-center gap-4">
                        <div className={`h-16 w-16 rounded-full ${config.bgColor} flex items-center justify-center`}>
                            <GradeIcon className={`h-8 w-8 ${config.color}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-2xl font-bold ${config.color}`}>{config.label}</span>
                                <span className="text-sm text-neutral-400">등급</span>
                            </div>
                            <div className="text-3xl font-black mt-1">{formatNum(summary.totalPoints)} <span className="text-sm font-normal text-neutral-400">P</span></div>
                        </div>
                    </div>
                    {/* 진행 바 */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                            <span>{grade}</span>
                            <span>{nextInfo.nextGrade ? `${nextInfo.nextGrade}까지 ${formatNum(nextInfo.remaining)}P` : 'MAX'}</span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${grade === 'Diamond' ? 'bg-purple-500' : grade === 'Platinum' ? 'bg-blue-500' : grade === 'Gold' ? 'bg-yellow-500' : grade === 'Silver' ? 'bg-neutral-400' : 'bg-amber-600'}`}
                                style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>
                </div>

                {/* 이번 달 / 이번 분기 */}
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="text-xs text-neutral-400 mb-1">이번 달</div>
                    <div className="text-2xl font-bold flex items-center gap-1">
                        +{formatNum(summary.thisMonthPoints)}
                        <span className="text-xs font-normal text-neutral-400">P</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                        <ArrowUpRight className="h-3 w-3" /> 활발한 활동 중
                    </div>
                </div>
                <div className="border border-neutral-200 bg-white p-5">
                    <div className="text-xs text-neutral-400 mb-1">이번 분기</div>
                    <div className="text-2xl font-bold flex items-center gap-1">
                        +{formatNum(summary.thisQuarterPoints)}
                        <span className="text-xs font-normal text-neutral-400">P</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-neutral-400">
                        <TrendingUp className="h-3 w-3" /> Q1 누적
                    </div>
                </div>
            </div>

            {/* 등급 안내 바 */}
            <div className="border border-neutral-200 bg-white p-4 mb-6">
                <h3 className="text-xs font-bold mb-3">등급 체계</h3>
                <div className="flex items-center gap-0">
                    {gradeLevels.map((g, i) => {
                        const gc = gradeConfig[g];
                        const isCurrent = g === grade;
                        return (
                            <div key={g} className={`flex-1 text-center py-2 px-1 border ${isCurrent ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-100'} ${i === 0 ? '' : '-ml-px'}`}>
                                <div className={`text-lg ${isCurrent ? '' : 'opacity-40'}`}>{gc.icon}</div>
                                <div className={`text-[10px] font-bold mt-0.5 ${isCurrent ? config.color : 'text-neutral-400'}`}>{g}</div>
                                <div className="text-[9px] text-neutral-300 mt-0.5">{formatNum(gc.minPoints)}P{gc.maxPoints ? `~${formatNum(gc.maxPoints)}P` : '+'}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {/* 포인트 이력 (2칸) */}
                <div className="col-span-2 border border-neutral-200 bg-white">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                        <h3 className="text-xs font-bold">포인트 이력</h3>
                        <div className="flex items-center gap-1">
                            <Filter className="h-3 w-3 text-neutral-400" />
                            <select
                                className="text-[11px] border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-600"
                                value={filterCat}
                                onChange={e => setFilterCat(e.target.value as PointCategory | 'all')}
                            >
                                <option value="all">전체</option>
                                {Object.entries(pointCategoryLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="divide-y divide-neutral-50 max-h-[400px] overflow-y-auto">
                        {filteredLogs.length === 0 ? (
                            <div className="text-center py-10 text-xs text-neutral-300">이력이 없습니다</div>
                        ) : filteredLogs.map(log => (
                            <div key={log.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50">
                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0 ${log.points >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                    {log.points >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium truncate">{log.description}</div>
                                    <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                                        <span>{pointCategoryLabels[log.category]}</span>
                                        <span>{log.createdAt}</span>
                                    </div>
                                </div>
                                <div className={`text-sm font-bold shrink-0 ${log.points >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {log.points > 0 ? '+' : ''}{formatNum(log.points)}P
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 사이드: 카테고리별 + 리더보드 */}
                <div className="space-y-4">
                    {/* 카테고리별 적립 */}
                    <div className="border border-neutral-200 bg-white">
                        <div className="px-4 py-3 border-b border-neutral-100">
                            <h3 className="text-xs font-bold">카테고리별 적립</h3>
                        </div>
                        <div className="p-4 space-y-2">
                            {categoryTotals.map(({ category, total }) => (
                                <div key={category} className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-600">{pointCategoryLabels[category]}</span>
                                    <span className={`font-bold ${total >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {total > 0 ? '+' : ''}{formatNum(total)}P
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 리더보드 */}
                    <div className="border border-neutral-200 bg-white">
                        <div className="px-4 py-3 border-b border-neutral-100">
                            <h3 className="text-xs font-bold flex items-center gap-1">
                                <Trophy className="h-3 w-3" /> 리더보드
                            </h3>
                        </div>
                        <div className="divide-y divide-neutral-50">
                            {leaderboard.map((m, i) => {
                                const isMe = m.memberId === memberId;
                                return (
                                    <div key={m.memberId} className={`flex items-center gap-2 px-4 py-2 ${isMe ? 'bg-neutral-50' : ''}`}>
                                        <span className={`w-5 text-center text-xs font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-neutral-400' : i === 2 ? 'text-amber-600' : 'text-neutral-300'}`}>
                                            {i + 1}
                                        </span>
                                        <span className="text-[10px]">{gradeConfig[m.grade].icon}</span>
                                        <span className={`text-xs flex-1 ${isMe ? 'font-bold' : ''}`}>{m.memberName}</span>
                                        <span className="text-xs font-bold text-neutral-600">{formatNum(m.totalPoints)}P</span>
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
