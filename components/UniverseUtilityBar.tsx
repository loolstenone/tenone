"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, LogOut, Share2, Search, Shield, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

export interface UtilityBarConfig {
    aboutPath: string;
    profilePath?: string;
    workspacePath?: string | null;
    workspaceLabel?: string;
    adminPath?: string | null;
    adminEmails?: string[];
    accentColor?: string;
    signupPath?: string;
    searchPlaceholder?: string;
    loginPath?: string;
    hideAuth?: boolean;
    hideAbout?: boolean;
    /** 검색 시 이동할 경로 (기본: ?q= 파라미터로 현재 페이지) */
    searchPath?: string;
    /** 현재 사이트 ID (검색 API용) */
    siteId?: string;
    /** 현재 사이트 표시명 */
    siteName?: string;
}

const defaultConfig: UtilityBarConfig = {
    aboutPath: "/about",
    profilePath: "/profile",
    workspacePath: null,
    workspaceLabel: "Intra",
    adminPath: null,
    accentColor: "#171717",
    signupPath: "/signup",
    searchPlaceholder: "검색어를 입력하세요...",
};

interface SearchResult {
    id: string;
    title: string;
    description?: string;
    href: string;
    type: string;
}

export function UniverseUtilityBar(props: UtilityBarConfig | { config: UtilityBarConfig }) {
    const rawConfig = 'config' in props ? props.config : props;
    const config = { ...defaultConfig, ...rawConfig };
    const { isAuthenticated, user, logout } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginTab, setLoginTab] = useState<"login" | "signup">("login");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [shareToast, setShareToast] = useState(false);
    const [siteResults, setSiteResults] = useState<SearchResult[]>([]);
    const [universeResults, setUniverseResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isAdmin = user?.role === "Admin" || user?.accountType === "staff"
        || (config.adminEmails || []).includes(user?.email || "");

    const handleShare = async () => {
        if (typeof window === "undefined") return;
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: document.title, url });
            } else {
                await navigator.clipboard.writeText(url);
                setShareToast(true);
                setTimeout(() => setShareToast(false), 2000);
            }
        } catch {
            // clipboard 실패 시 execCommand fallback
            try {
                const el = document.createElement("textarea");
                el.value = url;
                el.style.position = "fixed";
                el.style.opacity = "0";
                document.body.appendChild(el);
                el.select();
                document.execCommand("copy");
                document.body.removeChild(el);
                setShareToast(true);
                setTimeout(() => setShareToast(false), 2000);
            } catch { /* silent */ }
        }
    };

    const openSearch = () => {
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setSearchQuery("");
        setSiteResults([]);
        setUniverseResults([]);
    };

    // ESC키로 검색 닫기
    useEffect(() => {
        if (!searchOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [searchOpen]);

    // 검색 실행 (debounce)
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSiteResults([]);
            setUniverseResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const params = new URLSearchParams({ q: searchQuery });
                if (config.siteId) params.set("site", config.siteId);
                const res = await fetch(`/api/search?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setSiteResults(data.siteResults ?? []);
                    setUniverseResults(data.universeResults ?? []);
                }
            } catch { /* silent */ } finally {
                setSearching(false);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [searchQuery, config.siteId]);

    return (
        <>
            {/* Utility items */}
            <div className="flex items-center gap-4">
                {!config.hideAuth && !config.hideAbout && (
                    <Link href={config.aboutPath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                        ABOUT
                    </Link>
                )}

                {!config.hideAuth && isAuthenticated ? (
                    <>
                        {config.profilePath && (
                            <Link href={config.profilePath} className="flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity">
                                {user?.avatarUrl ? (
                                    <Image src={user.avatarUrl} alt={user.name || ''} width={22} height={22}
                                        className="h-[22px] w-[22px] rounded-full object-cover" />
                                ) : (
                                    <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold"
                                        style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                                        {user?.name?.charAt(0) ?? <User className="h-3 w-3" />}
                                    </div>
                                )}
                                <span className="text-[11px] font-semibold tracking-wider">{user?.name?.substring(0, 6) || "MY"}</span>
                            </Link>
                        )}
                        {config.workspacePath && (
                            <Link href={config.workspacePath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                                {config.workspaceLabel}
                            </Link>
                        )}
                        {config.adminPath && isAdmin && (
                            <Link href={config.adminPath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1">
                                <Shield className="h-3 w-3" /> ADMIN
                            </Link>
                        )}
                        <button onClick={() => logout()} className="text-[11px] font-semibold tracking-wider opacity-40 hover:opacity-80 transition-opacity">
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </>
                ) : !config.hideAuth ? (
                    <>
                        {config.loginPath ? (
                            <Link href={config.loginPath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                                로그인
                            </Link>
                        ) : (
                            <button onClick={() => { setLoginTab("login"); setLoginOpen(true); }} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                                로그인
                            </button>
                        )}
                        <button onClick={() => { setLoginTab("signup"); setLoginOpen(true); }} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                            가입
                        </button>
                    </>
                ) : null}

                <button onClick={handleShare} className="opacity-50 hover:opacity-100 transition-opacity" title="공유">
                    <Share2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={openSearch} className="opacity-50 hover:opacity-100 transition-opacity" title="검색">
                    <Search className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* 전체화면 검색 오버레이 */}
            {searchOpen && (
                <div className="fixed inset-0 z-[9999] flex flex-col" style={{ background: 'rgba(10,10,25,0.97)', backdropFilter: 'blur(8px)' }}>
                    {/* 검색 입력 헤더 */}
                    <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                        <Search className="h-5 w-5 shrink-0 opacity-40" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={config.searchPlaceholder}
                            className="flex-1 bg-transparent text-base text-white placeholder-white/25 focus:outline-none"
                        />
                        <button onClick={closeSearch} className="p-1 text-white/40 hover:text-white transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* 결과 영역 */}
                    <div className="flex-1 overflow-y-auto px-5 py-6">
                        {!searchQuery.trim() ? (
                            <p className="text-center text-sm text-white/25 mt-16">검색어를 입력하세요</p>
                        ) : searching ? (
                            <div className="flex justify-center mt-16">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                            </div>
                        ) : (
                            <div className="mx-auto max-w-2xl space-y-8">
                                {/* 사이트 내 결과 */}
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="text-xs font-bold tracking-widest text-white/40 uppercase">
                                            {config.siteName ?? "사이트"} 검색결과
                                        </span>
                                        {siteResults.length > 0 && (
                                            <span className="text-[10px] text-white/25">{siteResults.length}건</span>
                                        )}
                                    </div>
                                    {siteResults.length === 0 ? (
                                        <p className="text-sm text-white/25 py-3">결과가 없습니다</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {siteResults.map((r) => (
                                                <Link key={r.id} href={r.href} onClick={closeSearch}
                                                    className="flex items-start justify-between gap-3 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors group">
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-white group-hover:text-white truncate">{r.title}</div>
                                                        {r.description && <div className="text-xs text-white/40 mt-0.5 truncate">{r.description}</div>}
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-[10px] text-white/25 font-medium">{r.type}</span>
                                                        <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                {/* 유니버스 검색결과 */}
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="text-xs font-bold tracking-widest text-white/40 uppercase">Ten:One Universe</span>
                                        {universeResults.length > 0 && (
                                            <span className="text-[10px] text-white/25">{universeResults.length}건</span>
                                        )}
                                    </div>
                                    {universeResults.length === 0 ? (
                                        <p className="text-sm text-white/25 py-3">결과가 없습니다</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {universeResults.map((r) => (
                                                <Link key={r.id} href={r.href} onClick={closeSearch}
                                                    className="flex items-start justify-between gap-3 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors group">
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-white/80 group-hover:text-white truncate">{r.title}</div>
                                                        {r.description && <div className="text-xs text-white/35 mt-0.5 truncate">{r.description}</div>}
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-[10px] text-white/25 font-medium">{r.type}</span>
                                                        <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 공유 토스트 */}
            {shareToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg shadow-lg pointer-events-none">
                    링크가 복사되었습니다
                </div>
            )}

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor={config.accentColor} defaultTab={loginTab} />
        </>
    );
}
