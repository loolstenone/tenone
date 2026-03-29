"use client";

import { useState } from "react";
import Link from "next/link";
import { User, LogOut, Share2, Search, Shield, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

export interface UtilityBarConfig {
    /** About 페이지 경로 */
    aboutPath: string;
    /** 프로필 경로 */
    profilePath?: string;
    /** 인트라/워크스페이스 경로 (null이면 비표시) */
    workspacePath?: string | null;
    /** 인트라/워크스페이스 라벨 */
    workspaceLabel?: string;
    /** 관리자 페이지 경로 (null이면 비표시) */
    adminPath?: string | null;
    /** 관리자 표시 조건 (기본: staff 또는 Admin) */
    adminEmails?: string[];
    /** 악센트 컬러 (LoginModal용) */
    accentColor?: string;
    /** 가입 경로 */
    signupPath?: string;
    /** 검색 placeholder */
    searchPlaceholder?: string;
    /** 로그인 페이지 경로 (설정 시 모달 대신 페이지 이동) */
    loginPath?: string;
    /** 인증 UI 완전 숨김 (기업 전용 사이트) */
    hideAuth?: boolean;
}

const defaultConfig: UtilityBarConfig = {
    aboutPath: "/about",
    profilePath: "/profile",
    workspacePath: null,
    workspaceLabel: "Intra",
    adminPath: null,
    accentColor: "#171717",
    signupPath: "/signup",
    searchPlaceholder: "Search...",
};

export function UniverseUtilityBar(props: UtilityBarConfig | { config: UtilityBarConfig }) {
    const rawConfig = 'config' in props ? props.config : props;
    const config = { ...defaultConfig, ...rawConfig };
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginTab, setLoginTab] = useState<"login" | "signup">("login");
    const [searchOpen, setSearchOpen] = useState(false);
    const [shareToast, setShareToast] = useState(false);

    const isAdmin = user?.role === "Admin" || user?.accountType === "staff"
        || (config.adminEmails || []).includes(user?.email || "");

    const handleLogout = async () => { await logout(); };

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        if (navigator.share) {
            try { await navigator.share({ title: document.title, url }); } catch {}
        } else {
            await navigator.clipboard.writeText(url);
            setShareToast(true);
            setTimeout(() => setShareToast(false), 2000);
        }
    };

    return (
        <>
            {/* Utility items */}
            <div className="flex items-center gap-4">
                {/* About (hideAuth 모드에서는 메인 메뉴에 있으므로 숨김) */}
                {!config.hideAuth && (
                    <Link href={config.aboutPath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                        ABOUT
                    </Link>
                )}

                {!config.hideAuth && isAuthenticated ? (
                    <>
                        {/* 프로필 */}
                        {config.profilePath && (
                            <Link href={config.profilePath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1">
                                <User className="h-3 w-3" /> {user?.name?.substring(0, 4) || "MY"}
                            </Link>
                        )}
                        {/* 인트라 (권한 있는 사용자만) */}
                        {config.workspacePath && (
                            <Link href={config.workspacePath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                                {config.workspaceLabel}
                            </Link>
                        )}
                        {/* 관리자 */}
                        {config.adminPath && isAdmin && (
                            <Link href={config.adminPath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1">
                                <Shield className="h-3 w-3" /> ADMIN
                            </Link>
                        )}
                        {/* 로그아웃 */}
                        <button onClick={handleLogout} className="text-[11px] font-semibold tracking-wider opacity-40 hover:opacity-80 transition-opacity">
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </>
                ) : !config.hideAuth && !isAuthenticated ? (
                    <>
                        {/* 로그인 */}
                        {config.loginPath ? (
                            <Link href={config.loginPath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                                LOG IN
                            </Link>
                        ) : (
                            <button onClick={() => { setLoginTab("login"); setLoginOpen(true); }} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                                LOG IN
                            </button>
                        )}
                        {/* 가입 */}
                        <button onClick={() => { setLoginTab("signup"); setLoginOpen(true); }} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                            JOIN
                        </button>
                    </>
                ) : null}

                {/* 공유 */}
                <button onClick={handleShare} className="opacity-50 hover:opacity-100 transition-opacity" title="공유">
                    <Share2 className="h-3.5 w-3.5" />
                </button>

                {/* 검색 */}
                <button onClick={() => setSearchOpen(!searchOpen)} className="opacity-50 hover:opacity-100 transition-opacity" title="검색">
                    <Search className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* 검색 바 (열린 상태) — 부모에서 border-b 처리 필요 */}
            {searchOpen && (
                <div className="absolute left-0 right-0 top-full z-50 border-b border-current/10" style={{ backgroundColor: "inherit" }}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
                        <form onSubmit={(e) => { e.preventDefault(); /* TODO: 검색 구현 */ }} className="flex items-center gap-3">
                            <Search className="h-4 w-4 opacity-40 shrink-0" />
                            <input type="text" placeholder={config.searchPlaceholder} autoFocus
                                className="flex-1 bg-transparent text-sm placeholder-current/30 focus:outline-none" />
                            <button type="submit" className="opacity-60 hover:opacity-100 text-[11px] font-semibold tracking-wider">
                                검색
                            </button>
                            <button type="button" onClick={() => setSearchOpen(false)} className="opacity-40 hover:opacity-100">
                                <X className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 공유 토스트 */}
            {shareToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg shadow-lg">
                    링크가 복사되었습니다
                </div>
            )}

            {/* 로그인 모달 */}
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor={config.accentColor} defaultTab={loginTab} />
        </>
    );
}
