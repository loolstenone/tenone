"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Settings, HelpCircle, Sparkles, Download, Menu, Maximize, Minimize, MessageSquarePlus, LayoutGrid, Heart, Coffee, Users, Briefcase, BookOpen, Calendar, Navigation, Plane, TrendingUp, Mail, PenLine, Compass, Bell, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DOMAINS, PILLARS, LANE_PATHS, type DomainKey, type LaneKey } from "@/lib/myverse/domains";
import type { MyverseMode, SubscriptionStatus, CustomMenuKey } from "@/lib/myverse/types";
import { REQUIRED_MENU_KEYS } from "@/lib/myverse/types";
import { InstallButton } from "./InstallButton";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";


// 알림 종 — 미확인 카운트 배지 (Supabase Realtime — INSERT 즉시 +1)
function NotificationBell({ pathname }: { pathname: string }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let cancelled = false;
        let memberId: string | null = null;

        async function loadCount() {
            try {
                const r = await fetch("/api/myverse/notifications?unread=1");
                if (!r.ok) return;
                const d = await r.json();
                if (!cancelled) setCount(d.unread_count ?? 0);
            } catch {}
        }

        async function fetchMe(): Promise<string | null> {
            try {
                const r = await fetch("/api/myverse/me");
                if (!r.ok) return null;
                const d = await r.json();
                return d?.member?.id ?? null;
            } catch { return null; }
        }

        const supabase = createClient();
        let channel: ReturnType<typeof supabase.channel> | null = null;

        (async () => {
            await loadCount();
            memberId = await fetchMe();
            if (!memberId || cancelled) return;
            channel = supabase
                .channel(`notif:${memberId}`)
                .on(
                    "postgres_changes",
                    { event: "INSERT", schema: "public", table: "myverse_notifications", filter: `recipient_id=eq.${memberId}` },
                    () => { if (!cancelled) setCount(c => c + 1); },
                )
                .on(
                    "postgres_changes",
                    { event: "UPDATE", schema: "public", table: "myverse_notifications", filter: `recipient_id=eq.${memberId}` },
                    () => { if (!cancelled) void loadCount(); },
                )
                .subscribe();
        })();

        // 페이지가 다시 활성화될 때 한 번만 재동기화
        const onVis = () => { if (document.visibilityState === "visible") void loadCount(); };
        document.addEventListener("visibilitychange", onVis);

        return () => {
            cancelled = true;
            document.removeEventListener("visibilitychange", onVis);
            if (channel) supabase.removeChannel(channel);
        };
    }, []);
    const active = pathname.startsWith("/myverse/app/notifications");
    return (
        <Link
            href="/myverse/app/notifications"
            title="알림"
            className={`relative p-1.5 rounded transition-colors ${
                active
                    ? "bg-[#6366F1]/10 text-[#6366F1]"
                    : "text-neutral-400 myverse-dark:text-neutral-500 hover:text-[#6366F1] hover:bg-[#6366F1]/10"
            }`}
        >
            <Bell className="h-4 w-4" />
            {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 px-1 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                </span>
            )}
        </Link>
    );
}

// 9영역 아이콘 맵 — domains.ts SSOT와 Lucide 컴포넌트 연결
const DOMAIN_ICON_MAP: Record<DomainKey, LucideIcon> = {
    body:     Heart,
    daily:    Coffee,
    relation: Users,
    work:     Briefcase,
    study:    BookOpen,
    schedule: Calendar,
    move:     Navigation,
    travel:   Plane,
};

// SSOT 기반 pillar 그룹 (me/do/time)
const DOMAIN_PILLARS = PILLARS.filter(p => p.domains && p.domains.length > 0);

interface Tab {
    key: string;
    href: string;
    label: string;
    modes: MyverseMode[];
    activePath?: string;
    /** true 면 새 탭으로 외부(사이트) 열기 */
    external?: boolean;
}

// ── 5 Lane SSOT 기반 1차 네비게이션 (세션 119 IA 정리) ─────────
// 오늘 / 기록 / AI / 연결 / 도구 — 사용자 동사 4 + 도구 1
// 9영역·시간 줌은 LayoutGrid 드롭다운(2차 네비) + 각 lane 내부 필터로 노출
const TABS: Tab[] = [
    // 핵심 4 lane — 모든 모드에 노출
    { key: "today",   href: "/myverse/app/today",   label: "오늘", modes: ["weekly", "all_in_one", "custom"] },
    { key: "record",  href: "/myverse/app/traces",  label: "기록", modes: ["weekly", "all_in_one", "custom"] },
    { key: "ai",      href: "/myverse/app/ask",     label: "AI",   modes: ["weekly", "all_in_one", "custom"] },
    { key: "connect", href: "/myverse/app/feed",    label: "연결", modes: ["weekly", "all_in_one", "custom"] },
    // 도구 lane (Planner's 자산) — All in One·Custom만
    { key: "projects",  href: "/myverse/app/projects",    label: "프로젝트",    modes: ["all_in_one"] },
    { key: "canvas",    href: "/myverse/app/canvas",      label: "캔버스",      modes: ["all_in_one"] },
    { key: "templates", href: "/myverse/app/templates",   label: "템플릿",      modes: ["all_in_one", "custom"] },
    { key: "personal",  href: "/myverse/app/personal",    label: "퍼스널",      modes: ["all_in_one", "custom"] },
    { key: "community", href: "/myverse/community",       label: "커뮤니티",    modes: ["weekly", "all_in_one", "custom"], external: true },
];

export function AppTopNav({
    mode,
    userName,
    avatarUrl,
    subscriptionStatus = "free",
    showTimeTracking = true,
    customMenus = [],
}: {
    mode: MyverseMode;
    userName?: string;
    avatarUrl?: string;
    subscriptionStatus?: SubscriptionStatus;
    showTimeTracking?: boolean;
    customMenus?: CustomMenuKey[];
}) {
    const pathname = usePathname();
    // Time Tracking 토글 — 마운트 시 server prop으로 시드 후 localStorage·custom event가 권한
    // (이전엔 [showTimeTracking] deps useEffect가 prop 변경마다 state를 덮어써 토글이 풀리는 버그 발생)
    const [timeTrackingClient, setTimeTrackingClient] = useState(showTimeTracking);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pillarsOpen, setPillarsOpen] = useState(false);
    const [domainCounts, setDomainCounts] = useState<Partial<Record<DomainKey, number>>>({});

    // 9영역 자동 배지 — 드롭다운 첫 열림 시 + 페이지 복귀 시 갱신
    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const r = await fetch("/api/myverse/domains/activity");
                if (!r.ok) return;
                const d = await r.json();
                if (!cancelled) setDomainCounts(d.counts ?? {});
            } catch {}
        }
        void load();
        const onVis = () => { if (document.visibilityState === "visible") void load(); };
        document.addEventListener("visibilitychange", onVis);
        return () => { cancelled = true; document.removeEventListener("visibilitychange", onVis); };
    }, []);
    const pillarsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        // 마운트 시: localStorage에 값 있으면 우선, 없으면 server prop으로 시드
        const stored = localStorage.getItem("pp-time-tracking");
        if (stored !== null) {
            setTimeTrackingClient(stored === "1");
        } else {
            localStorage.setItem("pp-time-tracking", showTimeTracking ? "1" : "0");
        }
        // Settings 토글 즉시 반영
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            setTimeTrackingClient(!!detail?.enabled);
        };
        window.addEventListener("pp-time-tracking-change", handler);
        return () => window.removeEventListener("pp-time-tracking-change", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // showTimeTracking을 deps에 넣지 않음 — server prop이 router.refresh로 늦게 도달해도 client state를 덮어쓰지 않도록

    // 브라우저 전체화면 상태 동기화
    useEffect(() => {
        function onChange() { setIsFullscreen(!!document.fullscreenElement); }
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    // 라우트 변경 시 햄버거 메뉴 + 영역 드롭다운 자동 닫기
    useEffect(() => { setMenuOpen(false); setPillarsOpen(false); }, [pathname]);

    // 영역 드롭다운 외부 클릭 닫기
    useEffect(() => {
        if (!pillarsOpen) return;
        function onOutside(e: MouseEvent) {
            if (pillarsRef.current && !pillarsRef.current.contains(e.target as Node)) {
                setPillarsOpen(false);
            }
        }
        document.addEventListener("mousedown", onOutside);
        return () => document.removeEventListener("mousedown", onOutside);
    }, [pillarsOpen]);

    // ESC 로 닫기
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    // Mode + Custom Menus: localStorage에서 즉시 반영 (router.refresh 왕복 기다리지 않음)
    const [modeClient, setModeClient] = useState<MyverseMode>(mode);
    const [customMenusClient, setCustomMenusClient] = useState<CustomMenuKey[]>(customMenus);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const storedMode = localStorage.getItem("pp-mode");
        if (storedMode === "weekly" || storedMode === "all_in_one" || storedMode === "custom") {
            setModeClient(storedMode);
        }
        const stored = localStorage.getItem("pp-custom-menus");
        if (stored !== null) {
            try { setCustomMenusClient(JSON.parse(stored) as CustomMenuKey[]); } catch { /* ignore */ }
        }
        const menusHandler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (Array.isArray(detail?.menus)) setCustomMenusClient(detail.menus as CustomMenuKey[]);
        };
        const modeHandler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail?.mode) setModeClient(detail.mode as MyverseMode);
        };
        window.addEventListener("pp-custom-menus-change", menusHandler);
        window.addEventListener("pp-mode-change", modeHandler);
        return () => {
            window.removeEventListener("pp-custom-menus-change", menusHandler);
            window.removeEventListener("pp-mode-change", modeHandler);
        };
    }, []);

    // 모든 hook 선언이 끝난 후에만 early return — Rules of Hooks 준수
    if (/^\/myverse\/app\/canvas\/.+/.test(pathname)) return null;
    const requiredKeys = new Set<string>(REQUIRED_MENU_KEYS);
    const visibleTabs = TABS
        .filter((t) => {
            if (modeClient === "custom") {
                if (t.key === "time") return timeTrackingClient;          // time tab은 time_tracking SSOT
                if (requiredKeys.has(t.key)) return true;
                return customMenusClient.includes(t.key as CustomMenuKey);
            }
            return t.modes.includes(modeClient);
        })
        .filter((t) => t.key !== "time" || timeTrackingClient);

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                await document.exitFullscreen();
            }
        } catch (e) {
            console.warn("fullscreen toggle failed", e);
        }
    }

    return (
        <header className="sticky top-0 z-40 bg-white myverse-dark:bg-[#08080E]/95 myverse-dark:backdrop-blur-xl border-b border-neutral-200 myverse-dark:border-white/8 flex items-center h-12 px-3 gap-2 shrink-0">
            {/* Brand — 모바일: 아이콘만, sm+: 전체 텍스트 */}
            <Link href="/myverse/app" className="flex items-center gap-1.5 mr-1 shrink-0">
                <Image
                    src="/Myverse_logo_black.png"
                    alt="Myverse"
                    width={24}
                    height={24}
                    className="shrink-0"
                />
                <span className="hidden sm:inline font-sans font-semibold text-sm text-neutral-900 myverse-dark:text-white tracking-tight whitespace-nowrap">
                    Myverse
                </span>
            </Link>

            <div className="hidden md:block w-px h-4 bg-neutral-200 myverse-dark:bg-white/10 shrink-0" />

            {/* Tabs — 데스크톱만 (모바일은 햄버거 메뉴 전담) */}
            <nav
                className="hidden md:flex items-center gap-1 flex-1 min-w-0 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {visibleTabs.map((tab) => {
                    const hrefPath = tab.href.split("?")[0];
                    // Lane 키일 경우 LANE_PATHS로 매칭, 그 외(도구/external)는 정확한 prefix
                    const lanePaths = LANE_PATHS[tab.key as LaneKey];
                    const active =
                        !tab.external && (
                            lanePaths
                                ? lanePaths.some(p => pathname === p || pathname.startsWith(p + "/"))
                                : (pathname === hrefPath || pathname.startsWith(hrefPath + "/"))
                        );
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            target={tab.external ? "_blank" : undefined}
                            rel={tab.external ? "noopener" : undefined}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                                active
                                    ? "bg-[#6366F1] text-white"
                                    : "text-neutral-600 myverse-dark:text-neutral-400 hover:bg-neutral-100 myverse-dark:hover:bg-white/5 hover:text-neutral-900 myverse-dark:hover:text-white"
                            }`}
                        >
                            {tab.label}
                            {tab.external && <span className="ml-0.5 text-[9px] opacity-50">↗</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* 모바일: 현재 페이지명 표시 (탭 nav 대신) */}
            <div className="flex md:hidden flex-1 min-w-0 items-center">
                <span className="text-xs font-medium text-neutral-700 myverse-dark:text-neutral-300 truncate">
                    {visibleTabs.find(t => {
                        const p = t.href.split("?")[0];
                        return pathname === p || pathname.startsWith(p + "/");
                    })?.label ?? ""}
                </span>
            </div>

            {/* ── 데스크톱 우측 액션 ────────────────── */}
            <div className="hidden md:flex items-center gap-0.5 shrink-0 pl-2 ml-1 border-l border-neutral-100 myverse-dark:border-white/8">
                {subscriptionStatus !== "active" && (
                    <Link
                        href="/myverse/purchase"
                        className="flex items-center gap-1 px-2 py-1 mr-1 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white rounded text-[10px] font-medium hover:opacity-90 transition-opacity"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>구독</span>
                    </Link>
                )}

                <InstallButton className="p-1.5 rounded text-[#6366F1] hover:bg-[#6366F1]/10 transition-colors inline-flex">
                    <Download className="h-4 w-4" />
                </InstallButton>

                {/* ── 9영역 드롭다운 ── */}
                <div ref={pillarsRef} className="relative">
                    <button
                        type="button"
                        onClick={() => setPillarsOpen(o => !o)}
                        title="9 영역 — 나·일·시간"
                        className={`p-1.5 rounded transition-colors ${
                            pillarsOpen
                                ? "bg-[#6366F1]/10 text-[#6366F1]"
                                : "text-neutral-400 hover:text-[#6366F1] hover:bg-[#6366F1]/10"
                        }`}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>

                    {pillarsOpen && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white myverse-dark:bg-[#0D0D15] rounded-xl border border-neutral-200 myverse-dark:border-white/8 shadow-2xl z-50 p-3 grid grid-cols-3 gap-3">
                            {DOMAIN_PILLARS.map(pillar => (
                                <div key={pillar.key}>
                                    <p className="text-[9px] uppercase tracking-widest text-neutral-400 myverse-dark:text-neutral-500 mb-2 px-1">
                                        {pillar.label_ko}
                                    </p>
                                    {(pillar.domains ?? []).map(domainKey => {
                                        const domain = DOMAINS[domainKey];
                                        const Icon = DOMAIN_ICON_MAP[domainKey];
                                        const active = pathname.startsWith(domain.app_href);
                                        return (
                                            <Link
                                                key={domainKey}
                                                href={domain.app_href}
                                                onClick={() => setPillarsOpen(false)}
                                                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors mb-0.5 ${
                                                    active ? "bg-neutral-100 myverse-dark:bg-white/8 font-semibold text-neutral-900 myverse-dark:text-white" : "text-neutral-600 myverse-dark:text-neutral-400 hover:bg-neutral-50 myverse-dark:hover:bg-white/5 hover:text-neutral-900 myverse-dark:hover:text-white"
                                                }`}
                                            >
                                                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: domain.color_hex }} />
                                                <span className="flex-1 truncate">{domain.label_ko}</span>
                                                {domainCounts[domainKey] && domainCounts[domainKey]! > 0 ? (
                                                    <span
                                                        title="최근 7일 활동"
                                                        className={`text-[9px] tabular-nums px-1 rounded-full ${
                                                            active ? "bg-[#6366F1] text-white" : "bg-neutral-100 myverse-dark:bg-white/10 text-neutral-500 myverse-dark:text-neutral-300"
                                                        }`}
                                                    >
                                                        {domainCounts[domainKey]! > 99 ? "99+" : domainCounts[domainKey]}
                                                    </span>
                                                ) : null}
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Link
                    href="/myverse/app/feed"
                    title="피드 — 팔로잉의 공개 흔적"
                    className={`p-1.5 rounded transition-colors ${
                        pathname.startsWith("/myverse/app/feed")
                            ? "bg-[#6366F1]/10 text-[#6366F1]"
                            : "text-neutral-400 myverse-dark:text-neutral-500 hover:text-[#6366F1] hover:bg-[#6366F1]/10"
                    }`}
                >
                    <Compass className="h-4 w-4" />
                </Link>

                <NotificationBell pathname={pathname} />

                <Link
                    href="/myverse/app/diary"
                    title="AI 일기 — 하루를 한 줄로"
                    className={`p-1.5 rounded transition-colors ${
                        pathname.startsWith("/myverse/app/diary")
                            ? "bg-[#6366F1]/10 text-[#6366F1]"
                            : "text-neutral-400 myverse-dark:text-neutral-500 hover:text-[#6366F1] hover:bg-[#6366F1]/10"
                    }`}
                >
                    <PenLine className="h-4 w-4" />
                </Link>

                <Link
                    href="/myverse/app/capsules"
                    title="타임 캡슐 — 미래의 나에게"
                    className={`p-1.5 rounded transition-colors ${
                        pathname.startsWith("/myverse/app/capsules")
                            ? "bg-[#6366F1]/10 text-[#6366F1]"
                            : "text-neutral-400 myverse-dark:text-neutral-500 hover:text-[#6366F1] hover:bg-[#6366F1]/10"
                    }`}
                >
                    <Mail className="h-4 w-4" />
                </Link>

                <Link
                    href="/myverse/app/insights"
                    title="인사이트 — 내 패턴 발견"
                    className={`p-1.5 rounded transition-colors ${
                        pathname.startsWith("/myverse/app/insights")
                            ? "bg-[#6366F1]/10 text-[#6366F1]"
                            : "text-neutral-400 myverse-dark:text-neutral-500 hover:text-[#6366F1] hover:bg-[#6366F1]/10"
                    }`}
                >
                    <TrendingUp className="h-4 w-4" />
                </Link>

                <Link
                    href="/myverse/app/ask"
                    title="Ask Myverse — 내 흔적에 자연어로 묻기"
                    className={`p-1.5 rounded transition-colors ${
                        pathname.startsWith("/myverse/app/ask")
                            ? "bg-[#6366F1]/10 text-[#6366F1]"
                            : "text-neutral-400 myverse-dark:text-neutral-500 hover:text-[#6366F1] hover:bg-[#6366F1]/10"
                    }`}
                >
                    <Sparkles className="h-4 w-4" />
                </Link>

                <Link
                    href="/myverse/app/search"
                    className={`p-1.5 rounded transition-colors ${
                        pathname === "/myverse/app/search"
                            ? "bg-neutral-100 myverse-dark:bg-white/8 text-neutral-900 myverse-dark:text-white"
                            : "text-neutral-400 myverse-dark:text-neutral-500 hover:text-neutral-700 myverse-dark:hover:text-neutral-200 hover:bg-neutral-100 myverse-dark:hover:bg-white/8"
                    }`}
                >
                    <Search className="h-4 w-4" />
                </Link>

                <Link
                    href="/myverse/app/help"
                    className={`p-1.5 rounded transition-colors ${
                        pathname.startsWith("/myverse/app/help")
                            ? "bg-neutral-100 myverse-dark:bg-white/8 text-neutral-900 myverse-dark:text-white"
                            : "text-neutral-400 myverse-dark:text-neutral-500 hover:text-neutral-700 myverse-dark:hover:text-neutral-200 hover:bg-neutral-100 myverse-dark:hover:bg-white/8"
                    }`}
                >
                    <HelpCircle className="h-4 w-4" />
                </Link>

                <Link
                    href="/myverse/app/settings"
                    className={`p-1.5 rounded transition-colors ${
                        pathname.startsWith("/myverse/app/settings")
                            ? "bg-neutral-100 myverse-dark:bg-white/8 text-neutral-900 myverse-dark:text-white"
                            : "text-neutral-400 myverse-dark:text-neutral-500 hover:text-neutral-700 myverse-dark:hover:text-neutral-200 hover:bg-neutral-100 myverse-dark:hover:bg-white/8"
                    }`}
                >
                    <Settings className="h-4 w-4" />
                </Link>

                {/* 전체화면 토글 — 주소창·탭 숨김 */}
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "전체화면 종료 (Esc)" : "전체화면 (주소창·탭 숨김)"}
                    className="p-1.5 rounded text-neutral-400 hover:text-[#6366F1] hover:bg-[#6366F1]/10 transition-colors"
                >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>

                {userName && (
                    <Link
                        href="/profile"
                        className="ml-1 h-7 w-7 rounded-full shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                        title="유니버스 프로필"
                    >
                        {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                        ) : (
                            <span className="h-full w-full bg-[#6366F1]/10 flex items-center justify-center text-[10px] font-bold text-[#6366F1]">
                                {userName[0]}
                            </span>
                        )}
                    </Link>
                )}
            </div>

            {/* ── 모바일 우측 — 아바타 + 햄버거 ─────────────────────── */}
            <div className="md:hidden flex items-center gap-1.5 shrink-0 pl-1 ml-auto border-l border-neutral-100 myverse-dark:border-white/8">
                {userName && (
                    <Link
                        href="/profile"
                        className="h-7 w-7 rounded-full shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                        title="유니버스 프로필"
                    >
                        {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt={userName} className="h-full w-full object-cover" />
                        ) : (
                            <span className="h-full w-full bg-[#6366F1]/10 flex items-center justify-center text-[10px] font-bold text-[#6366F1]">
                                {userName[0]}
                            </span>
                        )}
                    </Link>
                )}
                <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label="메뉴"
                    className="p-1.5 rounded text-neutral-600 myverse-dark:text-neutral-400 hover:bg-neutral-100 myverse-dark:hover:bg-white/8"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* 모바일 햄버거 — UniverseMobileMenu 표준 (우측 2/3 슬라이드) */}
            <UniverseMobileMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                brandName="Myverse App"
                brandNode={
                    <span className="font-sans font-semibold text-neutral-900 myverse-dark:text-white tracking-tight">
                        Myverse
                    </span>
                }
                bgClass="bg-white myverse-dark:bg-[#0D0D15]"
                textTone="dark"
            >
                {/* 네비게이션 메뉴 전체 */}
                <div className="pb-1">
                    {visibleTabs.map((tab) => {
                        const hrefPath = tab.href.split("?")[0];
                        const active = !tab.external && (pathname === hrefPath || pathname.startsWith(hrefPath + "/"));
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                target={tab.external ? "_blank" : undefined}
                                rel={tab.external ? "noopener" : undefined}
                                onClick={() => !tab.external && setMenuOpen(false)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                    active
                                        ? "bg-[#6366F1] text-white font-medium"
                                        : "text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-500/10 myverse-dark:hover:bg-white/8"
                                }`}
                            >
                                <span>{tab.label}</span>
                                {tab.external && <span className="text-[9px] opacity-50">↗</span>}
                            </Link>
                        );
                    })}
                </div>

                {/* 9 영역 — SSOT */}
                <div className="h-px bg-neutral-100 myverse-dark:bg-white/8 my-1" />
                <div className="py-1.5">
                    <p className="px-3 mb-1 text-[9px] uppercase tracking-widest text-neutral-400 myverse-dark:text-neutral-500">9 영역</p>
                    {DOMAIN_PILLARS.map(pillar => (
                        <div key={pillar.key}>
                            <p className="px-3 mt-1.5 mb-0.5 text-[9px] text-neutral-400 myverse-dark:text-neutral-500 font-medium">{pillar.label_ko}</p>
                            {(pillar.domains ?? []).map(domainKey => {
                                const domain = DOMAINS[domainKey];
                                const Icon = DOMAIN_ICON_MAP[domainKey];
                                const active = pathname.startsWith(domain.app_href);
                                return (
                                    <Link
                                        key={domainKey}
                                        href={domain.app_href}
                                        onClick={() => setMenuOpen(false)}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                                            active
                                                ? "bg-neutral-100 myverse-dark:bg-white/8 font-medium text-neutral-900 myverse-dark:text-white"
                                                : "text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-50 myverse-dark:hover:bg-white/5"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" style={{ color: domain.color_hex }} />
                                        <span>{domain.label_ko}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* 구분선 */}
                <div className="h-px bg-neutral-100 myverse-dark:bg-white/8 my-1" />

                {/* 피드 · 알림 · AI · 인사이트 · 캡슐 */}
                <Link
                    href="/myverse/app/feed"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-500/10 myverse-dark:hover:bg-white/8"
                >
                    <Compass className="h-4 w-4 text-[#6366F1]" />
                    <span>피드</span>
                </Link>
                <Link
                    href="/myverse/app/notifications"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-500/10 myverse-dark:hover:bg-white/8"
                >
                    <Bell className="h-4 w-4 text-[#6366F1]" />
                    <span>알림</span>
                </Link>
                <Link
                    href="/myverse/app/ask"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-500/10 myverse-dark:hover:bg-white/8"
                >
                    <Sparkles className="h-4 w-4 text-[#6366F1]" />
                    <span>Ask Myverse</span>
                </Link>
                <Link
                    href="/myverse/app/insights"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-500/10 myverse-dark:hover:bg-white/8"
                >
                    <TrendingUp className="h-4 w-4 text-[#6366F1]" />
                    <span>인사이트</span>
                </Link>
                <Link
                    href="/myverse/app/diary"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-500/10 myverse-dark:hover:bg-white/8"
                >
                    <PenLine className="h-4 w-4 text-[#6366F1]" />
                    <span>AI 일기</span>
                </Link>
                <Link
                    href="/myverse/app/capsules"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-500/10 myverse-dark:hover:bg-white/8"
                >
                    <Mail className="h-4 w-4 text-[#6366F1]" />
                    <span>타임 캡슐</span>
                </Link>

                <div className="h-px bg-neutral-100 myverse-dark:bg-white/8 my-1" />

                {/* 유틸리티 */}
                {subscriptionStatus !== "active" && (
                    <Link
                        href="/myverse/purchase"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-[#6366F1] bg-[#6366F1]/5 hover:bg-[#6366F1]/10"
                    >
                        <Sparkles className="h-4 w-4" />
                        <span className="flex-1">구독</span>
                        <span className="text-[10px] text-[#6366F1]/60">Myverse AI 1년 무제한</span>
                    </Link>
                )}
                <InstallButton className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-50 myverse-dark:hover:bg-white/5 w-full text-left">
                    <Download className="h-4 w-4 text-[#6366F1]" />
                    <span>앱 설치</span>
                </InstallButton>
                <Link
                    href="/myverse/app/search"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-500/10 myverse-dark:hover:bg-white/8"
                >
                    <Search className="h-4 w-4 text-neutral-400" />
                    <span>검색</span>
                </Link>
                <Link
                    href="/myverse/app/help"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-500/10 myverse-dark:hover:bg-white/8"
                >
                    <HelpCircle className="h-4 w-4 text-neutral-400" />
                    <span>도움말 / FAQ</span>
                </Link>
                <Link
                    href="/myverse/app/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-500/10 myverse-dark:hover:bg-white/8"
                >
                    <Settings className="h-4 w-4 text-neutral-400" />
                    <span>설정</span>
                </Link>
                <div className="h-px bg-neutral-100 myverse-dark:bg-white/8 my-1" />
                <button
                    onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent("myverse-feedback-open")); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-neutral-700 myverse-dark:text-neutral-400 hover:bg-neutral-500/10 myverse-dark:hover:bg-white/8"
                >
                    <MessageSquarePlus className="h-4 w-4 text-neutral-400" />
                    <span>피드백 보내기</span>
                </button>
            </UniverseMobileMenu>
        </header>
    );
}
