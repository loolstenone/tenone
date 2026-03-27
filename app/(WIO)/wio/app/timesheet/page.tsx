'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, Check, AlertCircle, ChevronLeft, ChevronRight, Sparkles, Save } from 'lucide-react';
import { useWIO } from '../layout';
import { fetchTimesheets, upsertTimesheet } from '@/lib/supabase/wio';
import type { WIOProject } from '@/types/wio';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Mock 프로젝트 (DB 미연동 시 fallback)
const MOCK_PROJECTS: Pick<WIOProject, 'id' | 'code' | 'title'>[] = [
    { id: 'p1', title: 'MADLeague S6 Campaign', code: 'ML-S6' },
    { id: 'p2', title: 'Badak Community Rebrand', code: 'BDK-RB' },
    { id: 'p3', title: 'HeRo Platform MVP', code: 'HR-MVP' },
    { id: 'p4', title: 'Mindle Crawler Setup', code: 'MND-CR' },
    { id: 'p5', title: 'Internal / Admin', code: 'INT' },
];

const MOCK_HOURS: Record<string, number[]> = {
    p1: [3, 4, 2, 0, 1], p2: [0, 2, 3, 4, 2], p3: [2, 0, 0, 3, 4],
    p4: [1, 1, 2, 1, 0], p5: [2, 1, 1, 0, 1],
};

function getWeekDates(offset: number) {
    const now = new Date();
    now.setDate(now.getDate() + offset * 7);
    const mon = new Date(now);
    mon.setDate(mon.getDate() - mon.getDay() + 1);
    return weekDays.map((_, i) => {
        const d = new Date(mon);
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    });
}

function getWeekLabel(offset: number) {
    const dates = getWeekDates(offset);
    const mon = new Date(dates[0]);
    const fri = new Date(dates[4]);
    return `${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${fri.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export default function WIOTimesheetPage() {
    const { tenant, member } = useWIO();
    const isDemo = !tenant || tenant.id === 'demo';

    const [projects, setProjects] = useState(MOCK_PROJECTS);
    const [hours, setHours] = useState<Record<string, number[]>>(MOCK_HOURS);
    const [weekOffset, setWeekOffset] = useState(0);
    const [status, setStatus] = useState<'draft' | 'submitted' | 'approved'>('draft');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

    // DB에서 타임시트 로드
    const loadTimesheets = useCallback(async () => {
        if (isDemo || !tenant || !member) return;
        try {
            const dates = getWeekDates(weekOffset);
            const entries = await fetchTimesheets(tenant.id, {
                memberId: member.id,
                weekStart: dates[0],
                weekEnd: dates[4],
            });
            if (entries.length > 0) {
                const hoursMap: Record<string, number[]> = {};
                // 프로젝트별 시간 매핑
                entries.forEach(e => {
                    const pId = e.jobId || 'unknown';
                    if (!hoursMap[pId]) hoursMap[pId] = [0, 0, 0, 0, 0];
                    const dayIdx = dates.indexOf(e.workDate);
                    if (dayIdx >= 0) hoursMap[pId][dayIdx] = Number(e.hours) || 0;
                });
                setHours(hoursMap);
            }
        } catch {
            // DB 실패 시 Mock 유지
        }
    }, [isDemo, tenant, member, weekOffset]);

    useEffect(() => { loadTimesheets(); }, [loadTimesheets]);

    const updateHour = (projectId: string, dayIndex: number, value: number) => {
        setHours(prev => ({
            ...prev,
            [projectId]: (prev[projectId] || [0,0,0,0,0]).map((h, i) => i === dayIndex ? Math.max(0, Math.min(12, value)) : h),
        }));
    };

    // DB에 저장
    const handleSave = async () => {
        if (isDemo) { showToast('데모 모드에서는 저장할 수 없습니다'); return; }
        if (!tenant || !member) return;
        setSaving(true);
        const dates = getWeekDates(weekOffset);
        let success = true;
        for (const [projectId, dayHours] of Object.entries(hours)) {
            for (let i = 0; i < dayHours.length; i++) {
                if (dayHours[i] > 0) {
                    const ok = await upsertTimesheet({
                        tenantId: tenant.id,
                        memberId: member.id,
                        jobId: projectId,
                        workDate: dates[i],
                        hours: dayHours[i],
                    } as any);
                    if (!ok) success = false;
                }
            }
        }
        setSaving(false);
        showToast(success ? '저장 완료' : '일부 저장 실패');
    };

    const handleSubmit = async () => {
        await handleSave();
        setStatus('submitted');
        showToast('제출 완료 — 승인 대기 중');
    };

    const dailyTotals = weekDays.map((_, i) => Object.values(hours).reduce((sum, h) => sum + (h[i] || 0), 0));
    const weekTotal = dailyTotals.reduce((s, d) => s + d, 0);

    return (
        <div className="space-y-6">
            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-lg">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Timesheet</h1>
                    <p className="text-sm text-slate-500 mt-0.5">주간 프로젝트별 시수 입력{isDemo ? ' (데모)' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                    {status === 'draft' && (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-600/30 transition-colors border border-indigo-500/20">
                            <Sparkles className="w-3 h-3" /> AI Auto-Fill
                        </button>
                    )}
                    {status === 'draft' && !isDemo && (
                        <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-slate-300 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors border border-white/10">
                            <Save className="w-3 h-3" /> {saving ? '...' : '임시저장'}
                        </button>
                    )}
                    {status === 'draft' ? (
                        <button onClick={handleSubmit} disabled={saving}
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50">
                            제출
                        </button>
                    ) : status === 'submitted' ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-medium border border-amber-500/20">
                            <AlertCircle className="w-3 h-3" /> 승인 대기
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/20">
                            <Check className="w-3 h-3" /> 승인 완료
                        </span>
                    )}
                </div>
            </div>

            {/* Week Navigator */}
            <div className="flex items-center gap-3">
                <button onClick={() => { setWeekOffset(w => w - 1); setStatus('draft'); }} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">{getWeekLabel(weekOffset)}</span>
                    {weekOffset === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600/20 text-indigo-400">이번 주</span>}
                </div>
                <button onClick={() => { setWeekOffset(w => w + 1); setStatus('draft'); }} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Timesheet Grid */}
            <div className="border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="text-left py-3 px-4 text-xs text-slate-500 font-semibold w-56">프로젝트</th>
                            {weekDays.map(d => (
                                <th key={d} className="py-3 px-2 text-xs text-slate-500 font-semibold text-center w-20">{d}</th>
                            ))}
                            <th className="py-3 px-3 text-xs text-slate-500 font-semibold text-right w-16">합계</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => {
                            const ph = hours[p.id] || [0,0,0,0,0];
                            const total = ph.reduce((s, h) => s + h, 0);
                            return (
                                <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                    <td className="py-2.5 px-4">
                                        <div className="text-sm font-medium text-white">{p.title}</div>
                                        <div className="text-[10px] text-slate-600 font-mono">{p.code}</div>
                                    </td>
                                    {ph.map((h, i) => (
                                        <td key={i} className="py-2.5 px-2 text-center">
                                            <input
                                                type="number" min={0} max={12} step={0.5}
                                                value={h || ''}
                                                onChange={(e) => updateHour(p.id, i, parseFloat(e.target.value) || 0)}
                                                disabled={status !== 'draft'}
                                                className={`w-14 text-center py-1.5 rounded-lg text-sm font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                                    h > 0 ? 'bg-indigo-600/10 text-indigo-300' : 'bg-white/[0.03] text-slate-600'
                                                } ${status !== 'draft' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            />
                                        </td>
                                    ))}
                                    <td className="py-2.5 px-3 text-right text-sm font-bold text-white">{total}h</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-white/[0.02] border-t border-white/5">
                            <td className="py-3 px-4 text-xs font-bold text-slate-400">일별 합계</td>
                            {dailyTotals.map((t, i) => (
                                <td key={i} className={`py-3 px-2 text-center text-sm font-bold ${t > 8 ? 'text-red-400' : t > 0 ? 'text-white' : 'text-slate-700'}`}>
                                    {t}h
                                </td>
                            ))}
                            <td className="py-3 px-3 text-right text-sm font-black text-indigo-400">{weekTotal}h</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">주간 합계</div>
                    <div className="text-2xl font-bold text-white">{weekTotal}<span className="text-sm text-slate-500 ml-0.5">h</span></div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">일 평균</div>
                    <div className="text-2xl font-bold text-white">{(weekTotal / 5).toFixed(1)}<span className="text-sm text-slate-500 ml-0.5">h</span></div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">투입 프로젝트</div>
                    <div className="text-2xl font-bold text-white">{projects.filter(p => (hours[p.id] || []).some(h => h > 0)).length}</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">상태</div>
                    <div className={`text-lg font-bold ${status === 'approved' ? 'text-emerald-400' : status === 'submitted' ? 'text-amber-400' : 'text-slate-400'}`}>
                        {status === 'approved' ? '승인' : status === 'submitted' ? '대기' : '작성 중'}
                    </div>
                </div>
            </div>
        </div>
    );
}
