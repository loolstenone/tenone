"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, LogOut, Share2, Search, Shield, X, ArrowRight, Bell, Briefcase, ChevronDown, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";

// ── Workspace 레지스트리 ──────────────────────────────────────
// 각 브랜드의 "내 워크스페이스" 경로. 사용자의 affiliations[]에 해당 brandId가 있으면 자동으로 드롭다운에 노출.
// 새 브랜드 추가 시 여기 한 줄만 추가하면 전 사이트에서 자동 반영.
interface WorkspaceEntry { brandId: string; label: string; path: string; description?: string; }
const WORKSPACE_REGISTRY: WorkspaceEntry[] = [
    { brandId: "planners",     label: "Planner's Planner AI", path: "/planners/app",   description: "능동 AI 플래너" },
    { brandId: "badak",        label: "Badak",                path: "/badak/my",        description: "기획자 네트워크" },
    { brandId: "madleague",    label: "MAD League",           path: "/madleague/my",    description: "현역·OB" },
    { brandId: "madleap",      label: "MADLeap",              path: "/madleap/my",      description: "교육 프로그램" },
    { brandId: "hero",         label: "HeRo",                 path: "/hero/journey",    description: "커리어 여정" },
    { brandId: "wio",          label: "WIO",                  path: "/wio/app",         description: "업무 자동화 OS" },
    { brandId: "smarcomm",     label: "SmarComm",             path: "/dashboard",       description: "마케팅 OS" },
    { brandId: "youinone",     label: "YouInOne",             path: "/youinone/my",     description: "크루 정산" },
    { brandId: "myverse",      label: "Myverse",              path: "/myverse/my",      description: "셀프 디스커버리" },
    { brandId: "mindle",       label: "Mindle",               path: "/mindle/my",       description: "트렌드 콘텐츠" },
    { brandId: "brandgravity", label: "Brand Gravity",        path: "/brandgravity/my", description: "브랜드 진단" },
    { brandId: "jakka",        label: "Jakka",                path: "/jakka/my",        description: "창작자 마켓" },
    { brandId: "domo",         label: "Domo",                 path: "/domo/my",         description: "도시 모임" },
    { brandId: "townity",      label: "Townity",              path: "/townity/my",      description: "동네 커뮤니티" },
    { brandId: "rook",         label: "RooK",                 path: "/rook/my",         description: "독서 모임" },
    { brandId: "changeup",     label: "ChangeUp",             path: "/changeup/my",     description: "변화 코칭" },
    { brandId: "naturebox",    label: "NatureBox",            path: "/naturebox/my",    description: "자연 박스" },
    { brandId: "fwn",          label: "FWN",                  path: "/fwn/my",          description: "여성 네트워크" },
    { brandId: "montz",        label: "MoNTZ",                path: "/montz/my",        description: "월간 전시" },
    { brandId: "mullaesian",   label: "Mullaesian",           path: "/mullaesian/my",   description: "문래 커뮤니티" },
    { brandId: "seoul360",     label: "Seoul360",             path: "/seoul360/my",     description: "서울 360도" },
    { brandId: "ogamja",       label: "0gamja",               path: "/0gamja/my",       description: "0감자" },
];

export interface UtilityBarConfig {
    aboutPath: string;
    profilePath?: string;
    /** 단일 워크스페이스 (legacy 호환). workspaces 배열을 우선 쓰되, 비어있으면 affiliations 기반 자동 노출. */
    workspacePath?: string | null;
    workspaceLabel?: string;
    /** 명시적 워크스페이스 목록 (override). 비어있으면 user.affiliations로 자동 계산. */
    workspaces?: WorkspaceEntry[];
    adminPath?: string | null;
    adminEmails?: string[];
    accentColor?: string;
    signupPath?: string;
    searchPlaceholder?: string;
    loginPath?: string;
    hideAuth?: boolean;
    hideAbout?: boolean;
    /** 알림 숨김 (랜딩 페이지 등에서) */
    hideNotifications?: boolean;
    searchPath?: string;
    siteId?: string;
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

interface SearchResult { id: string; title: string; description?: string; href: string; type: string; }
interface NotificationItem { id: string; title: string; body?: string; href?: string; created_at: string; read?: boolean; }

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

    // 워크스페이스 드롭다운
    const [wsOpen, setWsOpen] = useState(false);
    // 알림 드롭다운
    const [notiOpen, setNotiOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [notiLoading, setNotiLoading] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const isAdmin = user?.role === "Admin" || user?.accountType === "staff"
        || (config.adminEmails || []).includes(user?.email || "");

    // 사용자 affiliations 기반 워크스페이스 자동 계산
    const userAffiliations = (user?.affiliations as string[]) || [];
    const autoWorkspaces = WORKSPACE_REGISTRY.filter(w => userAffiliations.includes(w.brandId));
    const workspaces: WorkspaceEntry[] = config.workspaces && config.workspaces.length > 0
        ? config.workspaces
        : autoWorkspaces;

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

    // 알림 fetch (인증 상태에서, drawer 열렸을 때)
    async function fetchNotifications() {
        if (!isAuthenticated) return;
        setNotiLoading(true);
        try {
            const res = await fetch("/api/notifications", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications ?? []);
            }
        } catch { /* silent — endpoint 미구현이면 빈 목록 */
        } finally {
            setNotiLoading(false);
        }
    }
    useEffect(() => {
        if (notiOpen && notifications.length === 0) fetchNotifications();
    }, [notiOpen]);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        if (!wsOpen && !notiOpen) return;
        const close = () => { setWsOpen(false); setNotiOpen(false); };
        const t = setTimeout(() => window.addEventListener("click", close), 0);
        return () => { clearTimeout(t); window.removeEventListener("click", close); };
    }, [wsOpen, notiOpen]);

    return (
        <>
            <div className="flex items-center gap-3">
                {/* About */}
                {!config.hideAbout && (
                    <Link href={config.aboutPath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity">
                        ABOUT
                    </Link>
                )}

                {!config.hideAuth && isAuthenticated ? (
                    <>
                        {/* Work Space 드롭다운 — affiliations 기반 자동 또는 명시적 workspaces */}
                        {workspaces.length > 0 && (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => { setWsOpen(o => !o); setNotiOpen(false); }}
                                    className="flex items-center gap-1 text-[11px] font-semibold tracking-wider opacity-80 hover:opacity-100 transition-opacity"
                                    title="내 워크스페이스"
                                >
                                    <Briefcase className="h-3.5 w-3.5" />
                                    <span>WORK</span>
                                    {workspaces.length > 1 && <span className="text-[9px] opacity-60">({workspaces.length})</span>}
                                    <ChevronDown className={`h-3 w-3 transition-transform ${wsOpen ? "rotate-180" : ""}`} />
                                </button>
                                {wsOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white text-neutral-900 rounded-lg shadow-xl border border-neutral-200 overflow-hidden z-50">
                                        <div className="px-3 py-2 border-b border-neutral-100 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
                                            이용 중인 서비스
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {workspaces.map(w => (
                                                <Link
                                                    key={w.brandId}
                                                    href={w.path}
                                                    onClick={() => setWsOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 transition-colors group"
                                                >
                                                    <Briefcase className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-medium truncate">{w.label}</div>
                                                        {w.description && <div className="text-[10px] text-neutral-500 truncate">{w.description}</div>}
                                                    </div>
                                                    <ExternalLink className="h-3 w-3 text-neutral-300 group-hover:text-neutral-700 shrink-0" />
                                                </Link>
                                            ))}
                                            {/* legacy workspacePath fallback (registry에 없으나 호출자가 명시한 경우) */}
                                            {config.workspacePath && !workspaces.some(w => w.path === config.workspacePath) && (
                                                <Link
                                                    href={config.workspacePath}
                                                    onClick={() => setWsOpen(false)}
                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 transition-colors border-t border-neutral-100"
                                                >
                                                    <Briefcase className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                                    <div className="text-sm font-medium">{config.workspaceLabel}</div>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {/* legacy 단일 workspacePath만 있고 affiliations이 비어있을 때 */}
                        {workspaces.length === 0 && config.workspacePath && (
                            <Link href={config.workspacePath} className="flex items-center gap-1 text-[11px] font-semibold tracking-wider opacity-80 hover:opacity-100 transition-opacity">
                                <Briefcase className="h-3.5 w-3.5" />
                                {config.workspaceLabel}
                            </Link>
                        )}

                        {/* 알림 */}
                        {!config.hideNotifications && (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => { setNotiOpen(o => !o); setWsOpen(false); }}
                                    className="relative opacity-60 hover:opacity-100 transition-opacity"
                                    title={`알림${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                                >
                                    <Bell className="h-3.5 w-3.5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-3.5 min-w-[14px] px-1 rounded-full bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </button>
                                {notiOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white text-neutral-900 rounded-lg shadow-xl border border-neutral-200 overflow-hidden z-50">
                                        <div className="px-3 py-2 border-b border-neutral-100 flex items-center justify-between">
                                            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">알림</span>
                                            {unreadCount > 0 && <span className="text-[10px] text-rose-500 font-semibold">{unreadCount} 새 알림</span>}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notiLoading ? (
                                                <div className="px-4 py-8 text-center text-xs text-neutral-400">불러오는 중…</div>
                                            ) : notifications.length === 0 ? (
                                                <div className="px-4 py-10 text-center text-xs text-neutral-400">새 알림이 없습니다</div>
                                            ) : notifications.map(n => (
                                                <Link
                                                    key={n.id}
                                                    href={n.href || "#"}
                                                    onClick={() => setNotiOpen(false)}
                                                    className={`block px-3 py-2.5 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors ${
                                                        n.read ? "" : "bg-rose-50/30"
                                                    }`}
                                                >
                                                    <div className="text-sm font-medium text-neutral-900 truncate">{n.title}</div>
                                                    {n.body && <div className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{n.body}</div>}
                                                    <div className="text-[10px] text-neutral-400 mt-1">{new Date(n.created_at).toLocaleString("ko-KR")}</div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 아바타 — 이미지만, 이름 텍스트 X */}
                        {config.profilePath && (
                            <Link href={config.profilePath} className="opacity-80 hover:opacity-100 transition-opacity" title={user?.name || "프로필"}>
                                {user?.avatarUrl ? (
                                    <Image src={user.avatarUrl} alt="" width={24} height={24}
                                        className="h-6 w-6 rounded-full object-cover ring-1 ring-white/20" />
                                ) : (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-1 ring-white/20"
                                        style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}>
                                        {user?.name?.charAt(0) ?? <User className="h-3 w-3" />}
                                    </div>
                                )}
                            </Link>
                        )}

                        {config.adminPath && isAdmin && (
                            <Link href={config.adminPath} className="text-[11px] font-semibold tracking-wider opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1" title="Admin">
                                <Shield className="h-3 w-3" /> ADMIN
                            </Link>
                        )}

                        {/* 로그아웃 — 아이콘 only */}
                        <button onClick={() => logout()} className="opacity-40 hover:opacity-80 transition-opacity" title="로그아웃">
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
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

                {/* 공유 + 검색 — 항상 노출 */}
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
                                        <span className="text-xs font-bold tracking-widest text-white/40 uppercase">{config.siteName ?? "사이트"} 검색결과</span>
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
                                        <span className="text-xs font-bold tracking-widest text-white/40 uppercase">Ten:One Universe</span>
                                        {universeResults.length > 0 && <span className="text-[10px] text-white/25">{universeResults.length}건</span>}
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

            {shareToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-neutral-800 text-white text-sm rounded-lg shadow-lg pointer-events-none">
                    링크가 복사되었습니다
                </div>
            )}

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor={config.accentColor} defaultTab={loginTab} />
        </>
    );
}
