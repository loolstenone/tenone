'use client';

import { useState } from 'react';
import { Clock, Calendar, Check, AlertCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const projects = [
    { id: 'p1', name: 'MADLeague S6 Campaign', code: 'ML-S6', rate: 50000 },
    { id: 'p2', name: 'Badak Community Rebrand', code: 'BDK-RB', rate: 60000 },
    { id: 'p3', name: 'HeRo Platform MVP', code: 'HR-MVP', rate: 55000 },
    { id: 'p4', name: 'Mindle Crawler Setup', code: 'MND-CR', rate: 45000 },
    { id: 'p5', name: 'Internal / Admin', code: 'INT', rate: 0 },
];

const initialHours: Record<string, number[]> = {
    p1: [3, 4, 2, 0, 1],
    p2: [0, 2, 3, 4, 2],
    p3: [2, 0, 0, 3, 4],
    p4: [1, 1, 2, 1, 0],
    p5: [2, 1, 1, 0, 1],
};

export default function WIOTimesheetPage() {
    const [hours, setHours] = useState(initialHours);
    const [weekOffset, setWeekOffset] = useState(0);
    const [status, setStatus] = useState<'draft' | 'submitted' | 'approved'>('draft');

    const getWeekLabel = () => {
        const now = new Date();
        now.setDate(now.getDate() + weekOffset * 7);
        const mon = new Date(now);
        mon.setDate(mon.getDate() - mon.getDay() + 1);
        const fri = new Date(mon);
        fri.setDate(fri.getDate() + 4);
        return `${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${fri.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const updateHour = (projectId: string, dayIndex: number, value: number) => {
        setHours(prev => ({
            ...prev,
            [projectId]: prev[projectId].map((h, i) => i === dayIndex ? Math.max(0, Math.min(12, value)) : h),
        }));
    };

    const dailyTotals = weekDays.map((_, i) => Object.values(hours).reduce((sum, h) => sum + (h[i] || 0), 0));
    const weekTotal = dailyTotals.reduce((s, d) => s + d, 0);
    const projectTotals = projects.map(p => ({
        ...p,
        total: (hours[p.id] || []).reduce((s, h) => s + h, 0),
        cost: (hours[p.id] || []).reduce((s, h) => s + h, 0) * p.rate,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">Timesheet</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Weekly hours by project. AI auto-fills from calendar & commits.</p>
                </div>
                <div className="flex items-center gap-2">
                    {status === 'draft' && (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-600/30 transition-colors border border-indigo-500/20">
                            <Sparkles className="w-3 h-3" /> AI Auto-Fill
                        </button>
                    )}
                    {status === 'draft' ? (
                        <button onClick={() => setStatus('submitted')} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors">
                            Submit
                        </button>
                    ) : status === 'submitted' ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-medium border border-amber-500/20">
                            <AlertCircle className="w-3 h-3" /> Pending Approval
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/20">
                            <Check className="w-3 h-3" /> Approved
                        </span>
                    )}
                </div>
            </div>

            {/* Week Navigator */}
            <div className="flex items-center gap-3">
                <button onClick={() => setWeekOffset(w => w - 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">{getWeekLabel()}</span>
                    {weekOffset === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600/20 text-indigo-400">This Week</span>}
                </div>
                <button onClick={() => setWeekOffset(w => w + 1)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Timesheet Grid */}
            <div className="border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                            <th className="text-left py-3 px-4 text-xs text-slate-500 font-semibold w-56">PROJECT</th>
                            {weekDays.map(d => (
                                <th key={d} className="py-3 px-2 text-xs text-slate-500 font-semibold text-center w-20">{d}</th>
                            ))}
                            <th className="py-3 px-3 text-xs text-slate-500 font-semibold text-right w-16">TOTAL</th>
                            <th className="py-3 px-4 text-xs text-slate-500 font-semibold text-right w-24">COST</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projectTotals.map(p => (
                            <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                <td className="py-2.5 px-4">
                                    <div className="text-sm font-medium text-white">{p.name}</div>
                                    <div className="text-[10px] text-slate-600 font-mono">{p.code}</div>
                                </td>
                                {(hours[p.id] || [0,0,0,0,0]).map((h, i) => (
                                    <td key={i} className="py-2.5 px-2 text-center">
                                        <input
                                            type="number"
                                            min={0} max={12} step={0.5}
                                            value={h || ''}
                                            onChange={(e) => updateHour(p.id, i, parseFloat(e.target.value) || 0)}
                                            disabled={status !== 'draft'}
                                            className={`w-14 text-center py-1.5 rounded-lg text-sm font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                                h > 0 ? 'bg-indigo-600/10 text-indigo-300' : 'bg-white/[0.03] text-slate-600'
                                            } ${status !== 'draft' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        />
                                    </td>
                                ))}
                                <td className="py-2.5 px-3 text-right text-sm font-bold text-white">{p.total}h</td>
                                <td className="py-2.5 px-4 text-right text-sm text-slate-400 font-mono">
                                    {p.rate > 0 ? `₩${(p.cost / 10000).toFixed(0)}만` : '–'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-white/[0.02] border-t border-white/5">
                            <td className="py-3 px-4 text-xs font-bold text-slate-400">DAILY TOTAL</td>
                            {dailyTotals.map((t, i) => (
                                <td key={i} className={`py-3 px-2 text-center text-sm font-bold ${t > 8 ? 'text-red-400' : t > 0 ? 'text-white' : 'text-slate-700'}`}>
                                    {t}h
                                </td>
                            ))}
                            <td className="py-3 px-3 text-right text-sm font-black text-indigo-400">{weekTotal}h</td>
                            <td className="py-3 px-4 text-right text-sm font-bold text-white font-mono">
                                ₩{(projectTotals.reduce((s, p) => s + p.cost, 0) / 10000).toFixed(0)}만
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">WEEK TOTAL</div>
                    <div className="text-2xl font-bold text-white">{weekTotal}<span className="text-sm text-slate-500 ml-0.5">h</span></div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">DAILY AVG</div>
                    <div className="text-2xl font-bold text-white">{(weekTotal / 5).toFixed(1)}<span className="text-sm text-slate-500 ml-0.5">h</span></div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">PROJECTS</div>
                    <div className="text-2xl font-bold text-white">{projects.filter(p => (hours[p.id] || []).some(h => h > 0)).length}</div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                    <div className="text-[10px] text-slate-500 font-semibold tracking-wider mb-1">BILLABLE</div>
                    <div className="text-2xl font-bold text-indigo-400">
                        ₩{(projectTotals.reduce((s, p) => s + p.cost, 0) / 10000).toFixed(0)}<span className="text-sm text-slate-500 ml-0.5">만</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
