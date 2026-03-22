"use client";

import { useState } from "react";
import { usePoints } from "@/lib/point-context";
import {
    Trophy, Search, Plus, ArrowUpRight, ArrowDownRight,
    Filter, Download, Medal, Star, Gem, Crown, Users, TrendingUp, X
} from "lucide-react";
import { gradeConfig, gradeLevels, pointCategoryLabels, defaultPointValues } from "@/types/point";
import type { GradeLevel, PointCategory } from "@/types/point";

function formatNum(n: number) { return new Intl.NumberFormat("ko-KR").format(n); }

const gradeIcons: Record<GradeLevel, typeof Trophy> = {
    Bronze: Medal, Silver: Medal, Gold: Star, Platinum: Gem, Diamond: Crown,
};

export default function ERPPointsPage() {
    const { logs, memberPoints, getLeaderboard, awardPoints, adjustPoints } = usePoints();
    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState<GradeLevel | 'all'>('all');
    const [catFilter, setCatFilter] = useState<PointCategory | 'all'>('all');
    const [tab, setTab] = useState<'members' | 'logs'>('members');
    const [showAwardModal, setShowAwardModal] = useState(false);

    // 부여 모달 폼
    const [formMemberId, setFormMemberId] = useState("");
    const [formCategory, setFormCategory] = useState<PointCategory>('admin_adjust');
    const [formPoints, setFormPoints] = useState(0);
    const [formDesc, setFormDesc] = useState("");

    const leaderboard = getLeaderboard();

    const filteredMembers = leaderboard.filter(m => {
        if (search && !m.memberName.includes(search) && !m.department?.includes(search)) return false;
        if (gradeFilter !== 'all' && m.grade !== gradeFilter) return false;
        return true;
    });

    const filteredLogs = logs.filter(l => {
        if (search && !l.memberName.includes(search) && !l.description.includes(search)) return false;
        if (catFilter !== 'all' && l.category !== catFilter) return false;
        return true;
    });

    // 통계
    const totalMembers = memberPoints.length;
    const gradeDistribution = gradeLevels.map(g => ({
        grade: g,
        count: memberPoints.filter(m => m.grade === g).length,
    }));
    const totalPointsIssued = logs.filter(l => l.points > 0).reduce((sum, l) => sum + l.points, 0);
    const thisMonthLogs = logs.filter(l => l.createdAt >= '2026-03-01');
    const thisMonthPoints = thisMonthLogs.filter(l => l.points > 0).reduce((sum, l) => sum + l.points, 0);

    const handleAward = () => {
        const member = memberPoints.find(m => m.memberId === formMemberId);
        if (!member) return;
        if (formCategory === 'admin_adjust' || formCategory === 'penalty') {
            adjustPoints(member.memberId, member.memberName, formPoints, formDesc, '관리자');
        } else {
            awardPoints({
                memberId: member.memberId,
                memberName: member.memberName,
                category: formCategory,
                points: formPoints || undefined,
                description: formDesc,
                createdBy: '관리자',
            });
        }
        setShowAwardModal(false);
        setFormMemberId("");
        setFormCategory('admin_adjust');
        setFormPoints(0);
        setFormDesc("");
    };

    return (
        <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold">포인트 관리</h1>
                    <p className="text-xs text-neutral-400 mt-0.5">구성원 포인트 및 등급 관리</p>
                </div>
                <button
                    onClick={() => setShowAwardModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white text-xs hover:bg-neutral-800"
                >
                    <Plus className="h-3.5 w-3.5" /> 포인트 부여
                </button>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-5 gap-3 mb-6">
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="text-[10px] text-neutral-400 mb-1">전체 멤버</div>
                    <div className="text-xl font-bold">{totalMembers}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></div>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="text-[10px] text-neutral-400 mb-1">총 발행 포인트</div>
                    <div className="text-xl font-bold">{formatNum(totalPointsIssued)}<span className="text-xs font-normal text-neutral-400 ml-1">P</span></div>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="text-[10px] text-neutral-400 mb-1">이번 달 발행</div>
                    <div className="text-xl font-bold">{formatNum(thisMonthPoints)}<span className="text-xs font-normal text-neutral-400 ml-1">P</span></div>
                </div>
                <div className="border border-neutral-200 bg-white p-4 col-span-2">
                    <div className="text-[10px] text-neutral-400 mb-2">등급 분포</div>
                    <div className="flex items-center gap-2">
                        {gradeDistribution.map(({ grade, count }) => (
                            <div key={grade} className="flex items-center gap-1 text-xs">
                                <span>{gradeConfig[grade].icon}</span>
                                <span className="text-neutral-500">{grade}</span>
                                <span className="font-bold">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 탭 + 검색 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex gap-0">
                    <button onClick={() => setTab('members')} className={`px-4 py-2 text-xs border ${tab === 'members' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200'}`}>
                        <Users className="h-3.5 w-3.5 inline mr-1" /> 멤버별 ({filteredMembers.length})
                    </button>
                    <button onClick={() => setTab('logs')} className={`px-4 py-2 text-xs border -ml-px ${tab === 'logs' ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500 border-neutral-200'}`}>
                        <TrendingUp className="h-3.5 w-3.5 inline mr-1" /> 이력 ({filteredLogs.length})
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <input
                            className="pl-7 pr-3 py-1.5 border border-neutral-200 text-xs w-48"
                            placeholder="이름, 부서 검색..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {tab === 'members' && (
                        <select className="text-xs border border-neutral-200 px-2 py-1.5" value={gradeFilter} onChange={e => setGradeFilter(e.target.value as GradeLevel | 'all')}>
                            <option value="all">전체 등급</option>
                            {gradeLevels.map(g => <option key={g} value={g}>{gradeConfig[g].icon} {g}</option>)}
                        </select>
                    )}
                    {tab === 'logs' && (
                        <select className="text-xs border border-neutral-200 px-2 py-1.5" value={catFilter} onChange={e => setCatFilter(e.target.value as PointCategory | 'all')}>
                            <option value="all">전체 유형</option>
                            {Object.entries(pointCategoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    )}
                </div>
            </div>

            {/* 멤버 테이블 */}
            {tab === 'members' && (
                <div className="border border-neutral-200 bg-white">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50">
                                <th className="text-left px-4 py-2.5 font-medium text-neutral-500 w-10">#</th>
                                <th className="text-left px-4 py-2.5 font-medium text-neutral-500">이름</th>
                                <th className="text-left px-4 py-2.5 font-medium text-neutral-500">부서</th>
                                <th className="text-left px-4 py-2.5 font-medium text-neutral-500">직급</th>
                                <th className="text-center px-4 py-2.5 font-medium text-neutral-500">등급</th>
                                <th className="text-right px-4 py-2.5 font-medium text-neutral-500">총 포인트</th>
                                <th className="text-right px-4 py-2.5 font-medium text-neutral-500">이번 달</th>
                                <th className="text-right px-4 py-2.5 font-medium text-neutral-500">이번 분기</th>
                                <th className="text-center px-4 py-2.5 font-medium text-neutral-500">최근 활동</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {filteredMembers.map((m, i) => {
                                const gc = gradeConfig[m.grade];
                                return (
                                    <tr key={m.memberId} className="hover:bg-neutral-50">
                                        <td className="px-4 py-2.5 text-neutral-400 font-medium">{i + 1}</td>
                                        <td className="px-4 py-2.5 font-medium">{m.memberName}</td>
                                        <td className="px-4 py-2.5 text-neutral-500">{m.department}</td>
                                        <td className="px-4 py-2.5 text-neutral-500">{m.position}</td>
                                        <td className="px-4 py-2.5 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${gc.bgColor} ${gc.color}`}>
                                                {gc.icon} {m.grade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right font-bold">{formatNum(m.totalPoints)}P</td>
                                        <td className="px-4 py-2.5 text-right text-green-600">+{formatNum(m.thisMonthPoints)}</td>
                                        <td className="px-4 py-2.5 text-right text-neutral-600">+{formatNum(m.thisQuarterPoints)}</td>
                                        <td className="px-4 py-2.5 text-center text-neutral-400">{m.lastActivity}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 이력 테이블 */}
            {tab === 'logs' && (
                <div className="border border-neutral-200 bg-white">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50">
                                <th className="text-left px-4 py-2.5 font-medium text-neutral-500">일시</th>
                                <th className="text-left px-4 py-2.5 font-medium text-neutral-500">대상</th>
                                <th className="text-left px-4 py-2.5 font-medium text-neutral-500">유형</th>
                                <th className="text-left px-4 py-2.5 font-medium text-neutral-500">설명</th>
                                <th className="text-right px-4 py-2.5 font-medium text-neutral-500">포인트</th>
                                <th className="text-right px-4 py-2.5 font-medium text-neutral-500">잔액</th>
                                <th className="text-left px-4 py-2.5 font-medium text-neutral-500">부여자</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {filteredLogs.slice(0, 50).map(log => (
                                <tr key={log.id} className="hover:bg-neutral-50">
                                    <td className="px-4 py-2.5 text-neutral-400">{log.createdAt}</td>
                                    <td className="px-4 py-2.5 font-medium">{log.memberName}</td>
                                    <td className="px-4 py-2.5">
                                        <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] rounded">
                                            {pointCategoryLabels[log.category]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-neutral-600 max-w-[200px] truncate">{log.description}</td>
                                    <td className={`px-4 py-2.5 text-right font-bold ${log.points >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        {log.points > 0 ? '+' : ''}{formatNum(log.points)}P
                                    </td>
                                    <td className="px-4 py-2.5 text-right text-neutral-500">{formatNum(log.balance)}P</td>
                                    <td className="px-4 py-2.5 text-neutral-400">{log.createdBy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 포인트 부여 모달 */}
            {showAwardModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white w-[440px] border border-neutral-200 shadow-lg">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
                            <h2 className="text-sm font-bold">포인트 부여</h2>
                            <button onClick={() => setShowAwardModal(false)}><X className="h-4 w-4 text-neutral-400" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-xs font-medium text-neutral-600 block mb-1">대상 멤버</label>
                                <select className="w-full border border-neutral-200 text-xs px-3 py-2" value={formMemberId} onChange={e => setFormMemberId(e.target.value)}>
                                    <option value="">선택하세요</option>
                                    {memberPoints.map(m => (
                                        <option key={m.memberId} value={m.memberId}>{m.memberName} ({m.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-600 block mb-1">부여 유형</label>
                                <select className="w-full border border-neutral-200 text-xs px-3 py-2" value={formCategory} onChange={e => { setFormCategory(e.target.value as PointCategory); setFormPoints(defaultPointValues[e.target.value as PointCategory]); }}>
                                    {Object.entries(pointCategoryLabels).map(([k, v]) => (
                                        <option key={k} value={k}>{v} (기본 {defaultPointValues[k as PointCategory]}P)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-600 block mb-1">포인트</label>
                                <input type="number" className="w-full border border-neutral-200 text-xs px-3 py-2" value={formPoints} onChange={e => setFormPoints(parseInt(e.target.value) || 0)} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-600 block mb-1">설명</label>
                                <input type="text" className="w-full border border-neutral-200 text-xs px-3 py-2" placeholder="부여 사유를 입력하세요" value={formDesc} onChange={e => setFormDesc(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 px-5 py-3 border-t border-neutral-100">
                            <button onClick={() => setShowAwardModal(false)} className="px-4 py-2 text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50">취소</button>
                            <button onClick={handleAward} disabled={!formMemberId || !formDesc} className="px-4 py-2 text-xs bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40">부여</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
