"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Save, ArrowLeft, Shield, User, Building2, Mail, Lock, X, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const inputClass = "w-full border tn-border px-4 py-2.5 text-sm tn-text focus:border-neutral-900 focus:outline-none placeholder:tn-text-sub tn-surface";
const disabledClass = "w-full border tn-border tn-bg-alt px-4 py-2.5 text-sm tn-text-sub cursor-not-allowed";
const labelClass = "block text-sm tn-text-sub mb-1.5";

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, isStaff, updateProfile, login } = useAuth();
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
    const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
    // 비밀번호 확인 모달
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [pwError, setPwError] = useState('');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace('/login?redirect=/profile');
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setCompany(user.company ?? '');
            setPhone(user.phone ?? '');
            setBio(user.bio ?? '');
            setSubscribeNewsletter(user.newsletterSubscribed ?? false);
        }
    }, [user]);

    if (isLoading || !isAuthenticated || !user) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // 비밀번호 확인 모달 표시
        setConfirmPassword('');
        setPwError('');
        setShowPw(false);
        setShowPasswordModal(true);
    };

    const handleConfirmSave = async () => {
        if (!user) return;
        // 비밀번호 검증
        const result = await login(user.email, confirmPassword);
        if (!result.success) {
            setPwError('비밀번호가 일치하지 않습니다.');
            return;
        }
        // 검증 성공 → 프로필 저장
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || name.slice(0, 2).toUpperCase();
        updateProfile({ name, company: company || undefined, phone: phone || undefined, bio: bio || undefined, avatarInitials: initials, newsletterSubscribed: subscribeNewsletter });
        setShowPasswordModal(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const accountLabel = isStaff ? 'Staff' : 'Member';
    const accountColor = isStaff ? 'bg-neutral-900 tn-text' : 'bg-neutral-200 text-neutral-700';

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Link href="/" className="inline-flex items-center gap-1 text-sm tn-text-sub hover:tn-text mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4" /> 홈으로
            </Link>

            <h1 className="text-xl md:text-3xl font-bold tn-text mb-2">프로필</h1>
            <p className="tn-text-sub mb-8">내 정보를 관리합니다.</p>

            {/* Avatar + Badge */}
            <div className="rounded-2xl border tn-border tn-surface p-8 mb-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-neutral-900 flex items-center justify-center tn-text font-bold text-xl">
                        {user.avatarInitials}
                    </div>
                    <div>
                        <p className="text-lg font-semibold tn-text">{user.name}</p>
                        <p className="text-sm tn-text-sub">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${accountColor}`}>
                                {accountLabel}
                            </span>
                            <span className="text-xs tn-text-sub">{user.role}</span>
                            {user.createdAt && <span className="text-xs tn-text-sub">가입일: {user.createdAt}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSave}>
                {/* 기본 정보 */}
                <div className="rounded-2xl border tn-border tn-surface p-8 mb-6">
                    <h2 className="text-sm font-semibold text-neutral-700 mb-5 flex items-center gap-2">
                        <User className="h-4 w-4 tn-text-sub" /> 기본 정보
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
                    <div className="rounded-2xl border tn-border tn-bg-alt p-8 mb-6">
                        <h2 className="text-sm font-semibold text-neutral-700 mb-5 flex items-center gap-2">
                            <Shield className="h-4 w-4" /> 직원 정보
                        </h2>
                        <p className="text-[10px] text-neutral-400 mb-4">직원 정보는 관리자만 수정할 수 있습니다.</p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>사번</label>
                                    <input value={employeeId} disabled className={disabledClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>부서</label>
                                    <input value={department} disabled className={disabledClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>직위</label>
                                    <input value={position} disabled className={disabledClass} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>입사일</label>
                                    <input value={startDate} disabled className={disabledClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>비상연락처</label>
                                    <input value={emergencyContact} disabled className={disabledClass} />
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
                    <div className="rounded-2xl border tn-border tn-bg-alt p-8 mb-6">
                        <h2 className="text-sm font-semibold text-neutral-600 mb-5 flex items-center gap-2">
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

                {/* 뉴스레터 구독 — 일반회원 전용 */}
                {!isStaff && (
                    <div className="rounded-2xl border tn-border tn-bg-alt p-8 mb-6">
                        <h2 className="text-sm font-semibold text-neutral-600 mb-4 flex items-center gap-2">
                            <Mail className="h-4 w-4" /> 뉴스레터
                        </h2>

                        {subscribeNewsletter ? (
                            /* 구독 중 */
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-neutral-800 mb-1">뉴스레터 구독 중</p>
                                    <p className="text-xs tn-text-sub leading-relaxed">
                                        Universe의 새로운 소식, 프로젝트 업데이트, 이벤트 초대를 이메일로 받고 있습니다.
                                    </p>
                                    <p className="text-xs tn-text-sub mt-1.5">수신 이메일: <span className="font-medium text-neutral-600">{user.email}</span></p>
                                    <button type="button" onClick={() => setSubscribeNewsletter(false)}
                                        className="mt-3 text-xs tn-text-sub hover:text-red-500 transition-colors underline underline-offset-2">
                                        구독 해지
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* 미구독 — 구독 신청 */
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center shrink-0">
                                    <Mail className="w-3 h-3 tn-text-sub" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-neutral-800 mb-1">뉴스레터를 구독하지 않고 있습니다</p>
                                    <p className="text-xs tn-text-sub leading-relaxed">
                                        Ten:One™ Universe의 새로운 소식, 프로젝트 업데이트, 이벤트 초대를 이메일로 받아보세요.
                                        월 1~2회 발송되며, 언제든 구독 해지할 수 있습니다.
                                    </p>
                                    <button type="button" onClick={() => setSubscribeNewsletter(true)}
                                        className="mt-3 flex items-center gap-1.5 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors">
                                        <Mail className="h-3.5 w-3.5" /> 뉴스레터 구독 신청
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Save */}
                <div className="flex items-center justify-between">
                    {saved && <span className="text-sm text-neutral-600">저장되었습니다!</span>}
                    {!saved && <div />}
                    <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                        <Save className="h-4 w-4" /> 저장
                    </button>
                </div>
            </form>

            {/* 비밀번호 확인 모달 */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="tn-surface rounded-2xl border tn-border w-full max-w-sm p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 tn-text-sub" />
                                <h2 className="text-sm font-bold">비밀번호 확인</h2>
                            </div>
                            <button onClick={() => setShowPasswordModal(false)}>
                                <X className="h-4 w-4 tn-text-sub hover:text-neutral-700" />
                            </button>
                        </div>
                        <p className="text-xs tn-text-sub mb-4">프로필 수정을 위해 현재 비밀번호를 입력해주세요.</p>
                        <div className="relative mb-3">
                            <input
                                type={showPw ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setPwError(''); }}
                                onKeyDown={e => e.key === 'Enter' && handleConfirmSave()}
                                placeholder="비밀번호 입력"
                                autoFocus
                                className="w-full border tn-border px-4 py-2.5 text-sm rounded focus:border-neutral-900 focus:outline-none pr-10"
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 tn-text-sub hover:text-neutral-700">
                                {showPw ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                        </div>
                        {pwError && <p className="text-xs text-red-500 mb-3">{pwError}</p>}
                        <div className="flex gap-2">
                            <button onClick={() => setShowPasswordModal(false)}
                                className="flex-1 px-4 py-2 text-sm border tn-border rounded tn-text-sub hover:border-neutral-400 transition-colors">
                                취소
                            </button>
                            <button onClick={handleConfirmSave}
                                className="flex-1 px-4 py-2 text-sm bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors">
                                확인 후 저장
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
