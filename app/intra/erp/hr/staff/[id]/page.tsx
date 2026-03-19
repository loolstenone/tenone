"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStaff } from "@/lib/staff-context";
import { brandOptions } from "@/lib/staff-data";
import Link from "next/link";
import { ArrowLeft, Save, User, Shield, Target, TrendingUp, Calendar } from "lucide-react";

const inputClass = "w-full border border-neutral-200 bg-white px-4 py-2.5 placeholder-neutral-300 focus:border-neutral-900 focus:outline-none";
const disabledClass = "w-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-neutral-400 cursor-not-allowed";
const labelClass = "block text-sm text-neutral-500 mb-1.5";

type Tab = 'profile' | 'gpr';

interface GprGoal {
    id: string;
    title: string;
    type: 'Personal' | 'Quarterly' | 'Yearly';
    status: 'In Progress' | 'Completed' | 'Not Started';
    progress: number;
    description: string;
    dueDate?: string;
}

const mockGprGoals: GprGoal[] = [
    { id: 'g1', title: '10,000명의 기획자 발굴 네트워크 구축', type: 'Yearly', status: 'In Progress', progress: 25, description: 'MADLeague 전국 확장 + Badak 네트워킹 활성화를 통한 기획자 풀 확대', dueDate: '2025-12-31' },
    { id: 'g2', title: 'MADLeague 인사이트 투어링 성공적 운영', type: 'Quarterly', status: 'In Progress', progress: 60, description: '영양군 지역 활동가와 학생 연계 프로그램 실행', dueDate: '2025-10-15' },
    { id: 'g3', title: 'LUKI 데뷔 캠페인 완료', type: 'Quarterly', status: 'Completed', progress: 100, description: 'AI 4인조 걸그룹 LUKI 공식 데뷔 및 콘텐츠 배포' },
    { id: 'g4', title: '주간 콘텐츠 파이프라인 운영', type: 'Personal', status: 'In Progress', progress: 70, description: 'Badak, MADLeague, FWN 채널 주기적 콘텐츠 발행' },
    { id: 'g5', title: 'Vrief 프레임워크 매드리그 교육 적용', type: 'Quarterly', status: 'In Progress', progress: 40, description: '매드리그 대학생 대상 Vrief 3Step 교육 프로그램 운영' },
];

export default function StaffDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { getStaffById, updateStaff } = useStaff();
    const [tab, setTab] = useState<Tab>('profile');
    const [saved, setSaved] = useState(false);

    const member = getStaffById(params.id as string);
    if (!member) return <div className="text-neutral-400 text-center py-20">직원을 찾을 수 없습니다.</div>;

    // Personal editable fields
    const [phone, setPhone] = useState(member.phone ?? '');
    const [emergencyContact, setEmergencyContact] = useState(member.emergencyContact ?? '');
    const [bio, setBio] = useState(member.bio ?? '');
    const [goals, setGoals] = useState(member.goals ?? '');
    const [values, setValues] = useState(member.values ?? '');

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateStaff(member.id, { phone: phone || undefined, emergencyContact: emergencyContact || undefined, bio: bio || undefined, goals: goals || undefined, values: values || undefined });
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
                    <h1 className="text-2xl font-bold">{member.name}</h1>
                    <p className="text-sm text-neutral-500">{member.position} · {member.department}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-mono text-neutral-400">{member.employeeId}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{member.role}</span>
                        <span className="text-xs text-neutral-300">{member.accessLevel.join(', ')}</span>
                    </div>
                    {member.brandAssociation.length > 0 && (
                        <div className="flex gap-1 mt-2">
                            {member.brandAssociation.map(b => {
                                const brand = brandOptions.find(bo => bo.id === b);
                                return <span key={b} className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{brand?.name ?? b}</span>;
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
                    {/* 시스템 정보 (읽기 전용) */}
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

                    {/* 개인 수정 영역 */}
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
                    {/* GPR Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="border border-neutral-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold">{mockGprGoals.filter(g => g.type === 'Yearly').length}</p>
                            <p className="text-xs text-neutral-500 mt-1">Yearly Goals</p>
                        </div>
                        <div className="border border-neutral-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold">{mockGprGoals.filter(g => g.type === 'Quarterly').length}</p>
                            <p className="text-xs text-neutral-500 mt-1">Quarterly Goals</p>
                        </div>
                        <div className="border border-neutral-200 bg-white p-4 text-center">
                            <p className="text-2xl font-bold">{mockGprGoals.filter(g => g.status === 'Completed').length}/{mockGprGoals.length}</p>
                            <p className="text-xs text-neutral-500 mt-1">Completed</p>
                        </div>
                    </div>

                    {/* GPR Levels */}
                    {(['Yearly', 'Quarterly', 'Personal'] as const).map(type => {
                        const goals = mockGprGoals.filter(g => g.type === type);
                        if (goals.length === 0) return null;
                        const typeLabels = { Yearly: 'GPR III — 연간 목표', Quarterly: 'GPR II — 분기 목표', Personal: 'GPR I — 개인 업무 목표' };
                        const typeIcons = { Yearly: Calendar, Quarterly: TrendingUp, Personal: Target };
                        const Icon = typeIcons[type];
                        return (
                            <div key={type}>
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-neutral-500">
                                    <Icon className="h-4 w-4" /> {typeLabels[type]}
                                </h3>
                                <div className="space-y-3">
                                    {goals.map(goal => (
                                        <div key={goal.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-400 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-medium">{goal.title}</h4>
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{goal.status}</span>
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
