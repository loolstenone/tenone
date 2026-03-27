"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Save, ArrowLeft, Shield, User, Building2, Mail, Lock, X, Eye, EyeOff, Bookmark } from "lucide-react";
import Link from "next/link";

const inputClass = "w-full border tn-border px-4 py-2.5 text-sm tn-text focus:border-neutral-900 focus:outline-none placeholder:tn-text-sub tn-surface";
const disabledClass = "w-full border tn-border tn-bg-alt px-4 py-2.5 text-sm tn-text-sub cursor-not-allowed";
const labelClass = "block text-sm tn-text-sub mb-1.5";

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
    // unused states removed (password modal, newsletter)

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
        if (!user) return;
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || name.slice(0, 2).toUpperCase();
        updateProfile({ name, company: company || undefined, phone: phone || undefined, bio: bio || undefined, avatarInitials: initials });
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
                                    <input value={user.brandAccess?.join(', ') || '없음'} disabled className={disabledClass} />
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

                {/* 뉴스레터 — 기능 준비 후 활성화 예정 */}

                {/* Save */}
                <div className="flex items-center justify-between">
                    {saved && <span className="text-sm text-neutral-600">저장되었습니다!</span>}
                    {!saved && <div />}
                    <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
                        <Save className="h-4 w-4" /> 저장
                    </button>
                </div>
            </form>

            {/* 북마크 목록 */}
            <BookmarkList userId={user.id} />
        </div>
    );
}

function BookmarkList({ userId }: { userId: string }) {
    const [bookmarks, setBookmarks] = useState<{ id: string; title: string; board: string; site: string; createdAt: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/board/bookmark?userId=${userId}&limit=10`)
            .then(r => r.ok ? r.json() : { bookmarks: [] })
            .then(d => setBookmarks(d.bookmarks || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return null;
    if (bookmarks.length === 0) return null;

    return (
        <div className="rounded-2xl border tn-border tn-bg-alt p-8 mt-6">
            <h2 className="text-sm font-semibold text-neutral-600 mb-4 flex items-center gap-2">
                <Bookmark className="h-4 w-4" /> 북마크한 글
            </h2>
            <div className="space-y-2">
                {bookmarks.map((bm) => (
                    <Link key={bm.id} href={`/${bm.board}?postId=${bm.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border tn-border hover:tn-bg-alt transition-colors group">
                        <div className="min-w-0">
                            <p className="text-sm font-medium tn-text truncate group-hover:underline">{bm.title}</p>
                            <p className="text-[10px] tn-text-sub">{bm.board} · {bm.site}</p>
                        </div>
                        <span className="text-[10px] tn-text-muted shrink-0 ml-3">
                            {new Date(bm.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
