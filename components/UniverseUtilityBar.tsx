"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CrossSiteLink } from "@/components/CrossSiteLink";
import { Share2, Search, X, ArrowRight, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { NotificationBell, LogoutButton } from "@/components/AccountControls";
import { AccountMenu } from "@/components/AccountMenu";
import { shareCurrentPage } from "@/lib/share-page";

// ── 유틸리티바 (CLAUDE.md §1.9.2, 2026-10-14 개정) ─────────────────
// 모든 브랜드 헤더 우상단. 데스크톱(breakpoint 이상)과 모바일(미만)을 이 컴포넌트가 같이 그린다
//   → 헤더에서 hidden md:flex로 감싸 숨기지 않는다 (감싸면 모바일에서 알림·계정·로그아웃이 사라진다)
// 데스크톱: About · 서비스 입구 · 알림 · 아바타(계정 메뉴) · 로그아웃 | 로그인·가입 · 공유 · 검색
// 모바일:   검색 · 알림 · 아바타(계정 메뉴 시트, 로그아웃 포함) | 로그인 아이콘  — About·공유·서비스 입구는 UniverseMobileMenu
// ❌ 다른 브랜드 목록(WORK 드롭다운)·ADMIN 링크를 바에 두지 않는다 → 계정 메뉴 (components/AccountMenu.tsx)

export interface ServiceEntry {
    /** 버튼 문구 — 브랜드가 정한다 (예: "내 플래너", "Orbi 시작하기") */
    label: string;
    /** 서비스 화면. 이 브랜드 첫 진입이면 BrandJoinGate가 동의를 받는다 */
    href: string;
}

export interface UtilityBarConfig {
    aboutPath: string;
    /** About 표기 — 기본 'ABOUT' (2026-10-13 사용자 결정) */
    aboutLabel?: string;
    hideAbout?: boolean;
    /** 이 사이트의 마이페이지 — 계정 메뉴 첫 줄 */
    profilePath?: string;
    /** 서비스 입구 — 로그인 후 쓰는 서비스 화면(앱)이 있는 브랜드만 (Planner's·WIO·SmarComm 등). 커뮤니티·콘텐츠 브랜드는 없음 */
    serviceEntry?: ServiceEntry;
    accentColor?: string;
    signupPath?: string;
    loginPath?: string;
    searchPlaceholder?: string;
    hideAuth?: boolean;
    /** 알림 숨김 (랜딩 페이지 등에서) */
    hideNotifications?: boolean;
    siteId?: string;
    siteName?: string;
    /** 데스크톱 모양이 시작되는 너비 — 헤더 메뉴가 펼쳐지는 너비와 맞춘다 (기본 md) */
    breakpoint?: "md" | "lg" | "xl";
}

const BP: Record<NonNullable<UtilityBarConfig["breakpoint"]>, { desk: string; mob: string }> = {
    md: { desk: "hidden md:flex", mob: "flex md:hidden" },
    lg: { desk: "hidden lg:flex", mob: "flex lg:hidden" },
    xl: { desk: "hidden xl:flex", mob: "flex xl:hidden" },
};

const defaultConfig: Partial<UtilityBarConfig> = {
    profilePath: "/profile",
    accentColor: "#171717",
    signupPath: "/signup",
    searchPlaceholder: "검색어를 입력하세요...",
    breakpoint: "md",
};

interface SearchResult { id: string; title: string; description?: string; href: string; type: string; }

export function UniverseUtilityBar(props: UtilityBarConfig | { config: UtilityBarConfig }) {
    const rawConfig = 'config' in props ? props.config : props;
    const config = { ...defaultConfig, ...rawConfig };
    const { isAuthenticated } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginTab, setLoginTab] = useState<"login" | "signup">("login");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [shareToast, setShareToast] = useState(false);
    const [siteResults, setSiteResults] = useState<SearchResult[]>([]);
    const [universeResults, setUniverseResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const bp = BP[config.breakpoint ?? "md"];

    const handleShare = async () => {
        if ((await shareCurrentPage()) === "copied") {
            setShareToast(true);
            setTimeout(() => setShareToast(false), 2000);
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

    useEffect(() => {
        if (!searchOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeSearch(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [searchOpen]);

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
            {/* 데스크톱 */}
            <div className={`${bp.desk} items-center gap-3.5`}>
                {!config.hideAbout && config.aboutPath && (
                    <Link href={config.aboutPath} className="text-xs font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                        {config.aboutLabel ?? "ABOUT"}
                    </Link>
                )}

                {config.serviceEntry && (
                    <CrossSiteLink href={config.serviceEntry.href} className="text-xs font-semibold tracking-wider opacity-80 hover:opacity-100 transition-opacity whitespace-nowrap">
                        {config.serviceEntry.label}
                    </CrossSiteLink>
                )}

                {!config.hideAuth && isAuthenticated ? (
                    <>
                        {!config.hideNotifications && <NotificationBell />}
                        <AccountMenu profilePath={config.profilePath} siteId={config.siteId} />
                        <LogoutButton />
                    </>
                ) : !config.hideAuth ? (
                    <>
                        {config.loginPath ? (
                            <Link href={config.loginPath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">로그인</Link>
                        ) : (
                            <button onClick={() => { setLoginTab("login"); setLoginOpen(true); }} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">로그인</button>
                        )}
                        <button onClick={() => { setLoginTab("signup"); setLoginOpen(true); }} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">가입</button>
                    </>
                ) : null}

                <button onClick={handleShare} className="opacity-50 hover:opacity-100 transition-opacity" title="공유">
                    <Share2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={openSearch} className="opacity-50 hover:opacity-100 transition-opacity" title="검색">
                    <Search className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* 모바일 — 햄버거 버튼은 각 헤더가 이 옆에 둔다 */}
            <div className={`${bp.mob} items-center gap-3`}>
                <button onClick={openSearch} className="p-1 opacity-60 hover:opacity-100 transition-opacity" aria-label="검색">
                    <Search className="h-4 w-4" />
                </button>
                {!config.hideAuth && isAuthenticated ? (
                    <>
                        {!config.hideNotifications && <NotificationBell />}
                        <AccountMenu profilePath={config.profilePath} siteId={config.siteId} mode="sheet" />
                    </>
                ) : !config.hideAuth ? (
                    config.loginPath ? (
                        <Link href={config.loginPath} className="p-1 opacity-70 hover:opacity-100" aria-label="로그인"><User className="h-5 w-5" /></Link>
                    ) : (
                        <button onClick={() => { setLoginTab("login"); setLoginOpen(true); }} className="p-1 opacity-70 hover:opacity-100" aria-label="로그인">
                            <User className="h-5 w-5" />
                        </button>
                    )
                ) : null}
            </div>

            {/* 전체화면 검색 오버레이 */}
            {searchOpen && (
                <div className="fixed inset-0 z-[9999] flex flex-col" style={{ background: 'rgba(10,10,25,0.97)', backdropFilter: 'blur(8px)' }}>
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
                    <div className="flex-1 overflow-y-auto px-5 py-6">
                        {!searchQuery.trim() ? (
                            <p className="text-center text-sm text-white/25 mt-16">검색어를 입력하세요</p>
                        ) : searching ? (
                            <div className="flex justify-center mt-16">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                            </div>
                        ) : (
                            <div className="mx-auto max-w-2xl space-y-8">
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="text-xs font-bold tracking-wider text-white/40">{config.siteName ?? "사이트"} 검색결과</span>
                                        {siteResults.length > 0 && <span className="text-[10px] text-white/25">{siteResults.length}건</span>}
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
                                <section>
                                    <div className="mb-3 flex items-center gap-2">
                                        {/* 브랜드 표기는 그대로 — 대문자 변환·™ 생략 금지 */}
                                        <span className="text-xs font-bold tracking-wider text-white/40">Ten:One™ Universe</span>
                                        {universeResults.length > 0 && <span className="text-[10px] text-white/25">{universeResults.length}건</span>}
                                    </div>
                                    {universeResults.length === 0 ? (
                                        <p className="text-sm text-white/25 py-3">결과가 없습니다</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {universeResults.map((r) => (
                                                <CrossSiteLink key={r.id} href={r.href} onClick={closeSearch}
                                                    className="flex items-start justify-between gap-3 rounded-xl px-4 py-3 hover:bg-white/5 transition-colors group">
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium text-white/80 group-hover:text-white truncate">{r.title}</div>
                                                        {r.description && <div className="text-xs text-white/35 mt-0.5 truncate">{r.description}</div>}
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-[10px] text-white/25 font-medium">{r.type}</span>
                                                        <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
                                                    </div>
                                                </CrossSiteLink>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {shareToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg shadow-lg pointer-events-none">
                    링크가 복사되었습니다
                </div>
            )}

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor={config.accentColor} defaultTab={loginTab} />
        </>
    );
}
