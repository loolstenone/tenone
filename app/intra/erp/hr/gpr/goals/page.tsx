"use client";

import { useState } from "react";
import { useGpr } from "@/lib/gpr-context";
import { useStaff } from "@/lib/staff-context";
import { GoalLevel, GoalStatus } from "@/types/gpr";
import { Plus, X, Send, Check } from "lucide-react";

const levelOptions: GoalLevel[] = ['GPR-I', 'GPR-II', 'GPR-III'];
const levelLabels: Record<string, string> = { 'GPR-I': '개인 업무 목표', 'GPR-II': '분기 목표', 'GPR-III': '연간 목표' };
const inputClass = "w-full border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";

export default function GoalSettingPage() {
    const { goals, addGoal, submitForApproval, agreeGoal, updateGoal } = useGpr();
    const { staff } = useStaff();
    const [showNew, setShowNew] = useState(false);
    const [staffFilter, setStaffFilter] = useState('all');
    const [form, setForm] = useState({ staffId: '', level: 'GPR-I' as GoalLevel, title: '', description: '', kpi: '', weight: 10, dueDate: '', period: '2025' });

    const filtered = staffFilter === 'all' ? goals : goals.filter(g => g.staffId === staffFilter);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date().toISOString().split('T')[0];
        addGoal({ id: `gpr${Date.now()}`, staffId: form.staffId, level: form.level, title: form.title, description: form.description, kpi: form.kpi, weight: form.weight, status: 'Draft', progress: 0, dueDate: form.dueDate || undefined, period: form.period, createdAt: now, updatedAt: now });
        setShowNew(false);
        setForm({ staffId: '', level: 'GPR-I', title: '', description: '', kpi: '', weight: 10, dueDate: '', period: '2025' });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Goal Setting</h2>
                    <p className="mt-2 text-neutral-500">목표 설정, 합의, 추적</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)} className="border border-neutral-200 bg-white px-3 py-2 text-sm">
                        <option value="all">All Staff</option>
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
                        <Plus className="h-4 w-4" /> 새 목표
                    </button>
                </div>
            </div>

            {/* New Goal Form */}
            {showNew && (
                <div className="border border-neutral-900 bg-neutral-50 p-6">
                    <div className="flex justify-between mb-4">
                        <h3 className="text-sm font-semibold text-neutral-900">새 목표 등록</h3>
                        <button onClick={() => setShowNew(false)} className="text-neutral-400 hover:text-neutral-900"><X className="h-4 w-4" /></button>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className="block text-xs text-neutral-500 mb-1">대상 직원 *</label>
                                <select value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})} required className={inputClass}>
                                    <option value="">선택</option>
                                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-xs text-neutral-500 mb-1">레벨 *</label>
                                <select value={form.level} onChange={e => setForm({...form, level: e.target.value as GoalLevel})} className={inputClass}>
                                    {levelOptions.map(l => <option key={l} value={l}>{l} ({levelLabels[l]})</option>)}
                                </select>
                            </div>
                            <div><label className="block text-xs text-neutral-500 mb-1">기간</label>
                                <input value={form.period} onChange={e => setForm({...form, period: e.target.value})} placeholder="2025, 2025-Q3" className={inputClass} />
                            </div>
                        </div>
                        <div><label className="block text-xs text-neutral-500 mb-1">목표명 *</label>
                            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="구체적인 목표명" className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs text-neutral-500 mb-1">설명</label>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className={inputClass + " resize-none"} />
                            </div>
                            <div><label className="block text-xs text-neutral-500 mb-1">KPI (성과 지표) *</label>
                                <textarea value={form.kpi} onChange={e => setForm({...form, kpi: e.target.value})} required rows={2} placeholder="측정 가능한 성과 기준" className={inputClass + " resize-none"} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs text-neutral-500 mb-1">비중 (%)</label>
                                <input type="number" value={form.weight} onChange={e => setForm({...form, weight: Number(e.target.value)})} min={0} max={100} className={inputClass} />
                            </div>
                            <div><label className="block text-xs text-neutral-500 mb-1">마감일</label>
                                <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className={inputClass} />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-4 py-2 bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800">목표 등록 (Draft)</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Goals Table */}
            <div className="border border-neutral-200 bg-white overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
                            <th className="px-4 py-3 text-left">직원</th>
                            <th className="px-4 py-3 text-left">레벨</th>
                            <th className="px-4 py-3 text-left">목표</th>
                            <th className="px-4 py-3 text-left">KPI</th>
                            <th className="px-4 py-3 text-left">비중</th>
                            <th className="px-4 py-3 text-left">진행</th>
                            <th className="px-4 py-3 text-left">상태</th>
                            <th className="px-4 py-3 text-left">액션</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {filtered.map(goal => {
                            const member = staff.find(s => s.id === goal.staffId);
                            return (
                                <tr key={goal.id} className="hover:bg-neutral-50">
                                    <td className="px-4 py-3 text-sm">{member?.name ?? '-'}</td>
                                    <td className="px-4 py-3 text-xs font-mono text-neutral-400">{goal.level}</td>
                                    <td className="px-4 py-3">
                                        <p className="text-sm">{goal.title}</p>
                                        {goal.dueDate && <p className="text-xs text-neutral-300">{goal.dueDate}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-neutral-500 max-w-[200px] truncate">{goal.kpi}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-500">{goal.weight}%</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-neutral-200 overflow-hidden">
                                                <div className={`h-full ${goal.progress === 100 ? 'bg-neutral-900' : 'bg-neutral-900'}`} style={{ width: `${goal.progress}%` }} />
                                            </div>
                                            <span className="text-xs text-neutral-400">{goal.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{goal.status}</span></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1">
                                            {goal.status === 'Draft' && (
                                                <button onClick={() => submitForApproval(goal.id)} className="p-1 text-neutral-500 hover:bg-neutral-100" title="승인 요청">
                                                    <Send className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            {goal.status === 'Pending Approval' && (
                                                <button onClick={() => agreeGoal(goal.id, 's1')} className="p-1 text-neutral-500 hover:bg-neutral-100" title="합의">
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
