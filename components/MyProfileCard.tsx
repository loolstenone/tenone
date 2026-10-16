'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Globe, ChevronRight, Building2, Trash2 } from 'lucide-react';

/** 전화번호 포맷: 010-1234-5678 */
function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

interface MyProfileCardProps {
    /** 사이트 브랜드 컬러 */
    accentColor: string;
    /** 사이트별 역할 뱃지 (예: "MAD Leaguer", "바닥장") */
    siteBadge?: string;
    /** 프로필 카드 하단에 사이트별 추가 콘텐츠 */
    children?: React.ReactNode;
    /** 카드 테마 — 기본 dark (21개 브랜드 호환). light 컨텍스트(마이버스 앱 셸)에선 "light" */
    theme?: "light" | "dark";
    /** Ten:One 프로필·계정 링크. null = 숨김. 기본 /profile (모든 도메인 공용 경로) */
    universeProfileHref?: string | null;
}

/**
 * 유니버스 공통 프로필 카드
 *
 * 모든 사이트 마이페이지 상단에 동일하게 배치.
 * - 아바타 (이미지 or 이니셜)
 * - 이름, 이메일, 연락처, 소속
 * - 사이트별 역할 뱃지
 * - Ten:One 프로필·계정 링크 (/profile)
 * - children: 사이트별 프로필 추가 정보 (동아리, 직무 등)
 */
export function MyProfileCard({ accentColor, siteBadge, children, theme = "dark", universeProfileHref }: MyProfileCardProps) {
    const { user, isStaff, logout } = useAuth();
    const isLight = theme === "light";

    // 테마별 클래스
    const cardCls = isLight
        ? "rounded-2xl border border-neutral-200 bg-white overflow-hidden mb-8 shadow-sm"
        : "rounded-2xl border border-neutral-700/50 bg-neutral-900/50 overflow-hidden mb-8";
    const nameCls = isLight ? "text-lg font-bold text-neutral-900 truncate" : "text-lg font-bold text-white truncate";
    const emailCls = isLight ? "text-sm text-neutral-500 truncate" : "text-sm text-neutral-400 truncate";
    const handleCls = isLight ? "text-xs text-neutral-400 shrink-0" : "text-xs text-neutral-500 shrink-0";
    const staffBadgeCls = isLight ? "text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-900/8 text-neutral-700" : "text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white";
    const companyCls = isLight ? "text-xs text-neutral-500 flex items-center gap-1" : "text-xs text-neutral-500 flex items-center gap-1";
    const infoBoxCls = isLight ? "grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-50 mb-4" : "grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-800/50 mb-4";
    const childrenBoxCls = isLight ? "p-4 rounded-xl bg-neutral-50 mb-4" : "p-4 rounded-xl bg-neutral-800/50 mb-4";
    const universeLinkCls = isLight ? "flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-neutral-400 transition-colors group" : "flex items-center gap-3 p-3 rounded-xl border border-neutral-700/50 hover:border-neutral-500 transition-colors group";
    const universeIconCls = isLight ? "h-4 w-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" : "h-4 w-4 text-neutral-500 group-hover:text-white transition-colors";
    const universePrimaryCls = isLight ? "text-xs font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors" : "text-xs font-medium text-neutral-400 group-hover:text-white transition-colors";
    const universeSecondaryCls = isLight ? "text-xs text-neutral-400" : "text-xs text-neutral-600";
    const universeChevronCls = isLight ? "h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-600 transition-colors" : "h-3.5 w-3.5 text-neutral-600 group-hover:text-neutral-400 transition-colors";
    const deleteBtnCls = isLight ? "text-xs text-neutral-400 hover:text-rose-500 transition-colors flex items-center gap-1 ml-auto" : "text-xs text-neutral-600 hover:text-rose-400 transition-colors flex items-center gap-1 ml-auto";
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    async function handleDelete() {
        if (deleteConfirm !== '탈퇴') return;
        setDeleting(true);
        setDeleteError('');
        try {
            const res = await fetch('/api/account/delete', { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                setDeleteError(data.error || '오류가 발생했습니다.');
                return;
            }
            await logout();
            router.replace('/');
        } finally {
            setDeleting(false);
        }
    }
    if (!user) return null;

    const initials = user.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?';

    // Ten:One 프로필·계정 링크 — null이면 숨김. /profile은 모든 도메인에서 열린다 (공용 경로)
    const upHref = universeProfileHref === null ? null : universeProfileHref ?? "/profile";

    return (
        <div className={cardCls}>
            <div className="p-6">
                {/* 프로필 헤더 */}
                <div className="flex items-center gap-5 mb-5">
                    {/* 아바타 */}
                    {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt={user.name || ''} width={72} height={72}
                            className="w-[72px] h-[72px] rounded-full object-cover shrink-0" />
                    ) : (
                        <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                            style={{ backgroundColor: accentColor + '20', color: accentColor }}>
                            {initials}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className={nameCls}>{user.name}</h2>
                        <div className="flex items-center gap-2">
                            <p className={emailCls}>{user.email}</p>
                            {user.handle && <span className={handleCls}>@{user.handle}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {isStaff && (
                                <span className={staffBadgeCls}>Staff</span>
                            )}
                            {siteBadge && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{ backgroundColor: accentColor + '20', color: accentColor }}>
                                    {siteBadge}
                                </span>
                            )}
                            {user.company && (
                                <span className={companyCls}>
                                    <Building2 className="h-3 w-3" /> {user.company}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 기본 정보 그리드 */}
                <div className={infoBoxCls}>
                    <InfoCell label="연락처" value={user.phone ? formatPhone(user.phone) : '-'} theme={theme} />
                    <InfoCell label="소속" value={user.company || '-'} theme={theme} />
                    <InfoCell label="가입일" value={user.createdAt?.substring(0, 10) || '-'} theme={theme} />
                </div>

                {/* 사이트별 추가 프로필 */}
                {children && (
                    <div className={childrenBoxCls}>
                        {children}
                    </div>
                )}

                {/* Ten:One 프로필·계정 링크 (null이면 숨김) — 이름·사진·소개 수정과 공개 설정은 계정 하나에서 */}
                {upHref && (
                    <Link href={upHref} className={universeLinkCls}>
                        <Globe className={universeIconCls} />
                        <div className="flex-1">
                            <p className={universePrimaryCls}>Ten:One 프로필 · 계정</p>
                            <p className={universeSecondaryCls}>이름·사진·소개 수정 · 공개 설정 — 모든 서비스 공통</p>
                        </div>
                        <ChevronRight className={universeChevronCls} />
                    </Link>
                )}

                {/* 계정 탈퇴 */}
                <div className="mt-3 text-right">
                    <button
                        onClick={() => { setShowDeleteModal(true); setDeleteConfirm(''); setDeleteError(''); }}
                        className={deleteBtnCls}
                    >
                        <Trash2 className="h-3 w-3" /> 계정 탈퇴
                    </button>
                </div>
            </div>

            {/* 탈퇴 확인 모달 */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-base font-bold text-white mb-1">계정 탈퇴</h3>
                        <p className="text-xs text-neutral-400 mb-4">
                            탈퇴하면 모든 데이터가 삭제되며 복구할 수 없습니다.<br />
                            확인하려면 아래에 <span className="text-white font-semibold">탈퇴</span>를 입력하세요.
                        </p>
                        <input
                            type="text"
                            value={deleteConfirm}
                            onChange={e => setDeleteConfirm(e.target.value)}
                            placeholder="탈퇴"
                            className="w-full px-3 py-2 text-sm bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 mb-3"
                        />
                        {deleteError && (
                            <p className="text-xs text-rose-400 mb-3">{deleteError}</p>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-2 text-sm text-neutral-400 border border-neutral-700 rounded-lg hover:border-neutral-500 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteConfirm !== '탈퇴' || deleting}
                                className="flex-1 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-lg transition-colors"
                            >
                                {deleting ? '처리 중...' : '탈퇴하기'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoCell({ label, value, theme = "dark" }: { label: string; value: string; theme?: "light" | "dark" }) {
    const labelCls = theme === "light" ? "text-xs font-medium text-neutral-500 mb-0.5" : "text-xs font-medium text-neutral-500 mb-0.5";
    const valueCls = theme === "light" ? "text-sm text-neutral-900" : "text-sm text-neutral-300";
    return (
        <div>
            <div className={labelCls}>{label}</div>
            <div className={valueCls}>{value}</div>
        </div>
    );
}
