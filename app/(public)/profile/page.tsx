"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Save, ArrowLeft, Shield, User, Building2 } from "lucide-react";
import Link from "next/link";

const inputClass = "w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none";
const disabledClass = "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-500 cursor-not-allowed";
const labelClass = "block text-sm text-zinc-400 mb-1.5";

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, isStaff, updateProfile } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    // Staff fields
    const [department, setDepartment] = useState('');
    const [position, setPosition] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/profile');
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setCompany(user.company ?? '');
            setPhone(user.phone ?? '');
            setBio(user.bio ?? '');
        }
    }, [user]);

    if (isLoading || !isAuthenticated || !user) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || name.slice(0, 2).toUpperCase();
        updateProfile({ name, company: company || undefined, phone: phone || undefined, bio: bio || undefined, avatarInitials: initials });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const accountLabel = isStaff ? 'Staff' : 'Member';
    const accountColor = isStaff ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400';

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4" /> 홈으로
            </Link>

            <h1 className="text-3xl font-bold text-white mb-2">프로필</h1>
            <p className="text-zinc-400 mb-8">내 정보를 관리합니다.</p>

            {/* Avatar + Badge */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                        {user.avatarInitials}
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-zinc-500">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${accountColor}`}>
                                {accountLabel}
                            </span>
                            <span className="text-xs text-zinc-600">{user.role}</span>
                            {user.createdAt && <span className="text-xs text-zinc-700">가입일: {user.createdAt}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSave}>
                {/* 기본 정보 */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 mb-6">
                    <h2 className="text-sm font-semibold text-zinc-300 mb-5 flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-500" /> 기본 정보
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>이름</label>
                                <input value={name} onChange={e => setName(e.target.value)} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>이메일</label>
                                <input value={user.email} disabled className={disabledClass} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>연락처</label>
                                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>{isStaff ? '소속' : '회사/학교'}</label>
                                <input value={company} onChange={e => setCompany(e.target.value)} placeholder={isStaff ? '부서명' : '회사 또는 학교명'} className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>자기소개</label>
                            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} placeholder="간단한 자기소개" className={inputClass + " resize-none"} />
                        </div>
                    </div>
                </div>

                {/* 직원 전용 정보 */}
                {isStaff && (
                    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-8 mb-6">
                        <h2 className="text-sm font-semibold text-indigo-400 mb-5 flex items-center gap-2">
                            <Shield className="h-4 w-4" /> 직원 정보
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>사번</label>
                                    <input value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="TEN-001" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>부서</label>
                                    <input value={department} onChange={e => setDepartment(e.target.value)} placeholder="크리에이티브팀" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>직위</label>
                                    <input value={position} onChange={e => setPosition(e.target.value)} placeholder="디렉터" className={inputClass} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>입사일</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>비상연락처</label>
                                    <input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="가족 연락처" className={inputClass} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>권한</label>
                                    <input value={user.role} disabled className={disabledClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>브랜드 접근</label>
                                    <input value={user.brandAccess.join(', ') || '없음'} disabled className={disabledClass} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 기업 회원 전용 */}
                {!isStaff && user.company && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 mb-6">
                        <h2 className="text-sm font-semibold text-emerald-400 mb-5 flex items-center gap-2">
                            <Building2 className="h-4 w-4" /> 기업 정보
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>회사명</label>
                                    <input value={company} onChange={e => setCompany(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>업종</label>
                                    <input placeholder="마케팅, IT, 제조업 등" className={inputClass} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>회사 웹사이트</label>
                                    <input placeholder="https://company.com" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>관심 서비스</label>
                                    <input placeholder="브랜딩, 마케팅, 인재채용 등" className={inputClass} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save */}
                <div className="flex items-center justify-between">
                    {saved && <span className="text-sm text-emerald-400">저장되었습니다!</span>}
                    {!saved && <div />}
                    <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                        <Save className="h-4 w-4" /> 저장
                    </button>
                </div>
            </form>
        </div>
    );
}
