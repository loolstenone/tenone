"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchStaffMembers, fetchGprGoalsTyped, rowToStaffMember } from "@/lib/supabase/erp";
import { initialStaff } from "@/lib/staff-data";
import { brandOptions } from "@/lib/staff-data";
import type { StaffMember } from "@/types/staff";
import Link from "next/link";
import { ArrowLeft, Save, User, Shield, Target, TrendingUp, Calendar, Loader2 } from "lucide-react";

const inputClass = "w-full border border-neutral-200 bg-white px-4 py-2.5 placeholder-neutral-300 focus:border-neutral-900 focus:outline-none";
const disabledClass = "w-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-neutral-400 cursor-not-allowed";
const labelClass = "block text-sm text-neutral-500 mb-1.5";

type Tab = 'profile' | 'gpr';

interface GprGoalLocal {
    id: string;
    title: string;
    type: 'Personal' | 'Quarterly' | 'Yearly';
    status: 'In Progress' | 'Completed' | 'Not Started';
    progress: number;
    description: string;
    dueDate?: string;
}

export default function StaffDetailPage() {
    const params = useParams();
    const [member, setMember] = useState<StaffMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<Tab>('profile');
    const [saved, setSaved] = useState(false);
    const [gprGoals, setGprGoals] = useState<GprGoalLocal[]>([]);

    // Personal editable fields
    const [phone, setPhone] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [bio, setBio] = useState('');
    const [goals, setGoals] = useState('');
    const [values, setValues] = useState('');

    useEffect(() => {
        let cancelled = false;
        const id = params.id as string;

        Promise.all([fetchStaffMembers(), fetchGprGoalsTyped({ memberId: id })])
            .then(([staffList, gprData]) => {
                if (cancelled) return;
                const allStaff = staffList.length > 0 ? staffList : initialStaff;
                const found = allStaff.find(s => s.id === id);
                if (found) {
                    setMember(found);
                    setPhone(found.phone ?? '');
                    setEmergencyContact(found.emergencyContact ?? '');
                    setBio(found.bio ?? '');
                    setGoals(found.goals ?? '');
                    setValues(found.values ?? '');
                }
                if (gprData.length > 0) {
                    setGprGoals(gprData.map(g => ({
                        id: g.id,
                        title: g.title,
                        type: g.level === 'GPR-III' ? 'Yearly' : g.level === 'GPR-II' ? 'Quarterly' : 'Personal',
                        status: g.status === 'Completed' ? 'Completed' : g.status === 'Draft' ? 'Not Started' : 'In Progress',
                        progress: g.progress,
                        description: g.description,
                        dueDate: g.dueDate,
                    })));
                }
            })
            .catch(() => {
                if (!cancelled) {
                    const found = initialStaff.find(s => s.id === id);
                    if (found) {
                        setMember(found);
                        setPhone(found.phone ?? '');
                        setEmergencyContact(found.emergencyContact ?? '');
                        setBio(found.bio ?? '');
                        setGoals(found.goals ?? '');
                        setValues(found.values ?? '');
                    }
                }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [params.id]);

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;
    if (!member) return <div className="text-neutral-400 text-center py-20">직원을 찾을 수 없습니다.</div>;

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link href="/intra/erp/hr/staff" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Staff List
            </Link>

            {/* Header */}
            <div className="border border-neutral-200 bg-white p-6 flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-2xl">
                    {member.avatarInitials}
                </div>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">{member.name}</h1>
                    <p className="text-sm text-neutral-500">{member.position} · {member.department}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono text-neutral-400">{member.employeeId}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{member.role}</span>
                        <span className="text-xs text-neutral-300">{member.accessLevel.join(', ')}</span>
                    </div>
                    {member.brandAssociation.length > 0 && (
                        <div className="flex gap-1 mt-2">
                            {member.brandAssociation.map(b => {
                                const brand = brandOptions.find(bo => bo.id === b);
                                return <span key={b} className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{brand?.name ?? b}</span>;
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-neutral-200">
                <button onClick={() => setTab('profile')} className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${tab === 'profile' ? 'border-neutral-900' : 'text-neutral-400 border-transparent hover:text-neutral-600'}`}>
                    <User className="h-4 w-4 inline mr-1.5" />Profile
                </button>
                <button onClick={() => setTab('gpr')} className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${tab === 'gpr' ? 'border-neutral-900' : 'text-neutral-400 border-transparent hover:text-neutral-600'}`}>
                    <Target className="h-4 w-4 inline mr-1.5" />GPR
                </button>
            </div>

            {/* Profile Tab */}
            {tab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="border border-neutral-200 bg-white p-6">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-neutral-400" /> 시스템 정보 (관리자만 수정)
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className={labelClass}>사번</label><input value={member.employeeId} disabled className={disabledClass} /></div>
                            <div><label className={labelClass}>이름</label><input value={member.name} disabled className={disabledClass} /></div>
                            <div><label className={labelClass}>이메일</label><input value={member.email} disabled className={disabledClass} /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div><label className={labelClass}>부서</label><input value={member.department} disabled className={disabledClass} /></div>
                            <div><label className={labelClass}>직위</label><input value={member.position} disabled className={disabledClass} /></div>
                            <div><label className={labelClass}>입사일</label><input value={member.startDate} disabled className={disabledClass} /></div>
                        </div>
                    </div>

                    <div className="border border-neutral-200 bg-white p-6">
                        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <User className="h-4 w-4 text-neutral-500" /> 개인 정보 (본인 수정)
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>연락처</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputClass} /></div>
                                <div><label className={labelClass}>비상연락처</label><input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="가족 연락처" className={inputClass} /></div>
                            </div>
                            <div><label className={labelClass}>자기소개</label><textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} placeholder="간단한 자기소개" className={inputClass + " resize-none"} /></div>
                            <div><label className={labelClass}>나의 목표</label><textarea value={goals} onChange={e => setGoals(e.target.value)} rows={2} placeholder="올해의 목표, 비전" className={inputClass + " resize-none"} /></div>
                            <div><label className={labelClass}>나의 가치</label><input value={values} onChange={e => setValues(e.target.value)} placeholder="소중하게 여기는 가치 (예: 본질, 속도, 이행)" className={inputClass} /></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        {saved && <span className="text-sm text-neutral-900">저장되었습니다!</span>}
                        {!saved && <div />}
                        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                            <Save className="h-4 w-4" /> 저장
                        </button>
                    </div>
                </form>
            )}

            {/* GPR Tab */}
            {tab === 'gpr' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="border border-neutral-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold">{gprGoals.filter(g => g.type === 'Yearly').length}</p>
                            <p className="text-xs text-neutral-500 mt-1">Yearly Goals</p>
                        </div>
                        <div className="border border-neutral-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold">{gprGoals.filter(g => g.type === 'Quarterly').length}</p>
                            <p className="text-xs text-neutral-500 mt-1">Quarterly Goals</p>
                        </div>
                        <div className="border border-neutral-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold">{gprGoals.filter(g => g.status === 'Completed').length}/{gprGoals.length}</p>
                            <p className="text-xs text-neutral-500 mt-1">Completed</p>
                        </div>
                    </div>

                    {(['Yearly', 'Quarterly', 'Personal'] as const).map(type => {
                        const typeGoals = gprGoals.filter(g => g.type === type);
                        if (typeGoals.length === 0) return null;
                        const typeLabels = { Yearly: 'GPR III — 연간 목표', Quarterly: 'GPR II — 분기 목표', Personal: 'GPR I — 개인 업무 목표' };
                        const typeIcons = { Yearly: Calendar, Quarterly: TrendingUp, Personal: Target };
                        const Icon = typeIcons[type];
                        return (
                            <div key={type}>
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-neutral-500">
                                    <Icon className="h-4 w-4" /> {typeLabels[type]}
                                </h3>
                                <div className="space-y-3">
                                    {typeGoals.map(goal => (
                                        <div key={goal.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-400 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-medium">{goal.title}</h4>
                                                        <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{goal.status}</span>
                                                    </div>
                                                    <p className="text-sm text-neutral-500 mt-1">{goal.description}</p>
                                                </div>
                                                {goal.dueDate && <span className="text-xs text-neutral-300 shrink-0 ml-4">{goal.dueDate}</span>}
                                            </div>
                                            <div className="mt-3 flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-neutral-200 overflow-hidden">
                                                    <div className="h-full bg-neutral-900 transition-all" style={{ width: `${goal.progress}%` }} />
                                                </div>
                                                <span className="text-xs text-neutral-500 w-10 text-right">{goal.progress}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
