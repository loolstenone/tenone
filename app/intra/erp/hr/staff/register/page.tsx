"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStaff } from "@/lib/staff-context";
import { StaffRole, Division, SystemAccess } from "@/types/staff";
import { divisions, positions, accessOptions, divisionDefaultAccess, brandOptions } from "@/lib/staff-data";
import * as membersDb from "@/lib/supabase/members";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";

const roles: StaffRole[] = ['Admin', 'Manager', 'Editor', 'Viewer'];
const inputClass = "w-full border border-neutral-200 bg-white px-4 py-2.5 placeholder-neutral-300 focus:border-neutral-900 focus:outline-none";
const labelClass = "block text-sm text-neutral-500 mb-1.5";

export default function StaffRegisterPage() {
    const router = useRouter();
    const { addStaff } = useStaff();
    const [form, setForm] = useState({
        name: '', email: '', employeeId: '',
        division: '' as Division | '',
        department: '', position: '',
        role: 'Editor' as StaffRole,
        accessLevel: [] as SystemAccess[],
        startDate: new Date().toISOString().split('T')[0],
        phone: '',
        brandAssociation: [] as string[],
        tempPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const selectedDivision = divisions.find(d => d.id === form.division);
    const availableDepts = selectedDivision?.departments ?? [];

    const handleDivisionChange = (divId: string) => {
        const div = divId as Division;
        const defaultAccess = divisionDefaultAccess[div] ?? [];
        setForm({ ...form, division: div, department: '', accessLevel: defaultAccess as SystemAccess[] });
    };

    const toggleAccess = (id: SystemAccess) => {
        setForm(prev => ({
            ...prev,
            accessLevel: prev.accessLevel.includes(id)
                ? prev.accessLevel.filter(a => a !== id)
                : [...prev.accessLevel, id]
        }));
    };

    const toggleBrand = (id: string) => {
        setForm(prev => ({
            ...prev,
            brandAssociation: prev.brandAssociation.includes(id)
                ? prev.brandAssociation.filter(b => b !== id)
                : [...prev.brandAssociation, id]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.employeeId || !form.division || !form.department || !form.position) {
            setError('필수 항목을 모두 입력해주세요.'); return;
        }
        if (!form.tempPassword || form.tempPassword.length < 6) {
            setError('임시 비밀번호를 6자 이상 입력해주세요.'); return;
        }
        if (form.accessLevel.length === 0) {
            setError('시스템 접근 권한을 1개 이상 선택해주세요.'); return;
        }

        const initials = form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || form.name.slice(0, 2).toUpperCase();
        const now = new Date().toISOString().split('T')[0];

        // Mock 저장 (기존 호환)
        addStaff({
            id: `s${Date.now()}`, employeeId: form.employeeId, name: form.name, email: form.email,
            role: form.role, accessLevel: form.accessLevel, division: form.division as Division,
            department: form.department, position: form.position,
            brandAssociation: form.brandAssociation, startDate: form.startDate, status: 'Active',
            phone: form.phone || undefined, avatarInitials: initials, createdAt: now, updatedAt: now,
        });

        // DB 저장 (Supabase members 테이블)
        try {
            await membersDb.createStaffMember({
                email: form.email,
                name: form.name,
                department: form.department,
                position: form.position,
                employee_id: form.employeeId,
                system_access: form.accessLevel,
            });
            console.log('[Staff] Saved to DB:', form.name);
        } catch (err) {
            console.warn('[Staff] DB save failed (mock saved):', err);
        }

        setSuccess(true);
        setTimeout(() => router.push('/intra/erp/hr/staff'), 1500);
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="h-8 w-8 text-neutral-500" />
                    </div>
                    <h3 className="text-xl font-bold">직원이 등록되었습니다</h3>
                    <p className="text-sm text-neutral-500 mt-2">{form.name} ({form.employeeId})</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Link href="/intra/erp/hr/staff" className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-neutral-900 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Staff List
            </Link>

            <div>
                <h2 className="text-2xl font-bold">직원 등록</h2>
                <p className="mt-2 text-neutral-500">새로운 직원을 시스템에 등록합니다.</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* 기본 정보 */}
                <div className="border border-neutral-200 bg-white p-8 mb-6">
                    <h3 className="text-sm font-semibold mb-5">기본 정보</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div><label className={labelClass}>사번 *</label><input value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})} placeholder="2026-0001" required className={inputClass} /></div>
                            <div><label className={labelClass}>이름 *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="홍길동" required className={inputClass} /></div>
                            <div><label className={labelClass}>이메일 *</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="name@tenone.biz" required className={inputClass} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className={labelClass}>연락처</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="010-0000-0000" className={inputClass} /></div>
                            <div><label className={labelClass}>입사일</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className={inputClass} /></div>
                        </div>
                    </div>
                </div>

                {/* 조직 배치 */}
                <div className="border border-neutral-200 bg-white p-8 mb-6">
                    <h3 className="text-sm font-semibold mb-5">조직 배치</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>부문 *</label>
                                <select value={form.division} onChange={e => handleDivisionChange(e.target.value)} required className={inputClass}>
                                    <option value="">선택</option>
                                    {divisions.map(d => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>부서 *</label>
                                <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} required className={inputClass} disabled={!form.division}>
                                    <option value="">선택</option>
                                    {availableDepts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>직위 *</label>
                                <select value={form.position} onChange={e => setForm({...form, position: e.target.value})} required className={inputClass}>
                                    <option value="">선택</option>
                                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>권한 등급</label>
                            <select value={form.role} onChange={e => setForm({...form, role: e.target.value as StaffRole})} className={inputClass}>
                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* 시스템 접근 권한 (중복 선택) */}
                <div className="border border-neutral-900 bg-neutral-50 p-8 mb-6">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-2">시스템 접근 권한 (중복 선택)</h3>
                    <p className="text-xs text-neutral-400 mb-4">부문 선택 시 기본 권한이 자동 할당됩니다. 필요에 따라 추가/제거하세요.</p>
                    <div className="grid grid-cols-5 gap-3">
                        {accessOptions.map(opt => (
                            <button key={opt.id} type="button" onClick={() => toggleAccess(opt.id as SystemAccess)}
                                className={`border px-3 py-3 text-center transition-colors ${
                                    form.accessLevel.includes(opt.id as SystemAccess)
                                        ? 'border-neutral-900 bg-neutral-100'
                                        : 'border-neutral-200 hover:border-neutral-400'
                                }`}>
                                <p className={`text-xs font-medium ${form.accessLevel.includes(opt.id as SystemAccess) ? 'text-neutral-900' : 'text-neutral-500'}`}>{opt.label}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{opt.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 소속 브랜드 */}
                <div className="border border-neutral-200 bg-white p-8 mb-6">
                    <h3 className="text-sm font-semibold mb-4">소속 브랜드</h3>
                    <div className="flex flex-wrap gap-2">
                        {brandOptions.map(b => (
                            <button key={b.id} type="button" onClick={() => toggleBrand(b.id)}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors border ${
                                    form.brandAssociation.includes(b.id)
                                        ? 'bg-neutral-900 text-white border-neutral-900'
                                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400'
                                }`}>{b.name}</button>
                        ))}
                    </div>
                </div>

                {/* 임시 비밀번호 */}
                <div className="border border-neutral-200 bg-white p-8 mb-6">
                    <label className={labelClass}>임시 비밀번호 *</label>
                    <input value={form.tempPassword} onChange={e => setForm({...form, tempPassword: e.target.value})} placeholder="직원에게 전달할 임시 비밀번호" required className={inputClass} />
                    <p className="text-xs text-neutral-300 mt-1">직원이 최초 로그인 시 변경하도록 안내해주세요.</p>
                </div>

                {error && <div className="bg-neutral-100 border border-neutral-200 px-4 py-3 text-sm text-neutral-500 mb-6">{error}</div>}

                <div className="flex items-center justify-between">
                    <Link href="/intra/erp/hr/staff" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">취소</Link>
                    <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                        <UserPlus className="h-4 w-4" /> 직원 등록
                    </button>
                </div>
            </form>
        </div>
    );
}
