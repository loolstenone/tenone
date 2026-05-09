"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutGrid, Sun, FolderKanban, User, Sparkles, Wrench,
    CalendarDays, Calendar, CalendarRange, Users, Search, Settings,
} from "lucide-react";

export const MOBILE_NAV_STORAGE_KEY = "myverse-mobile-nav";
const LEGACY_NAV_STORAGE_KEY = "planners-mobile-nav";
// 5 lane SSOT 기반 모바일 하단 네비 (세션 121 — 도구 lane 포함)
export const MOBILE_NAV_DEFAULT: string[] = ["today", "record", "ai", "connect", "work"];

export const ALL_NAV_OPTIONS = [
    // ── 5 Lane (1차 SSOT)
    { id: "today",    label: "오늘",     icon: Sun,           href: "/myverse/app/today" },
    { id: "record",   label: "기록",     icon: LayoutGrid,    href: "/myverse/app/traces" },
    { id: "ai",       label: "AI",       icon: Sparkles,      href: "/myverse/app/ask" },
    { id: "connect",  label: "연결",     icon: Users,         href: "/myverse/app/feed" },
    { id: "work",     label: "도구",     icon: Wrench,        href: "/myverse/app/projects" },
    // ── 도구 lane 직접 진입 (커스터마이즈용)
    { id: "projects", label: "프로젝트", icon: FolderKanban,  href: "/myverse/app/projects" },
    { id: "identity", label: "퍼스널",   icon: User,          href: "/myverse/app/personal" },
    { id: "contacts", label: "연락처",   icon: Calendar,      href: "/myverse/app/contacts" },
    // ── 시간 줌 (도구)
    { id: "weekly",   label: "주간",     icon: CalendarDays,  href: "/myverse/app/weekly" },
    { id: "monthly",  label: "월간",     icon: Calendar,      href: "/myverse/app/monthly" },
    { id: "yearly",   label: "연간",     icon: CalendarRange, href: "/myverse/app/yearly" },
    // ── 시스템
    { id: "search",   label: "검색",     icon: Search,        href: "/myverse/app/search" },
    { id: "settings", label: "설정",     icon: Settings,      href: "/myverse/app/settings" },
] as const;

export type NavOptionId = typeof ALL_NAV_OPTIONS[number]["id"];

function loadSaved(): string[] {
    if (typeof window === "undefined") return MOBILE_NAV_DEFAULT;
    try {
        const raw = localStorage.getItem(MOBILE_NAV_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length === 5) return parsed;
        }
        // migrate from legacy key
        const legacy = localStorage.getItem(LEGACY_NAV_STORAGE_KEY);
        if (legacy) {
            const parsed = JSON.parse(legacy);
            if (Array.isArray(parsed) && parsed.length === 5) {
                localStorage.setItem(MOBILE_NAV_STORAGE_KEY, legacy);
                localStorage.removeItem(LEGACY_NAV_STORAGE_KEY);
                return parsed;
            }
        }
    } catch {}
    return MOBILE_NAV_DEFAULT;
}

export function MobileBottomNav() {
    const pathname = usePathname();
    const [itemIds, setItemIds] = useState<string[]>(MOBILE_NAV_DEFAULT);

    useEffect(() => {
        setItemIds(loadSaved());
        const onStorage = (e: StorageEvent) => {
            if (e.key === MOBILE_NAV_STORAGE_KEY) setItemIds(loadSaved());
        };
        const onNavChange = () => setItemIds(loadSaved());
        window.addEventListener("storage", onStorage);
        window.addEventListener("myverse-mobile-nav-change", onNavChange);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("myverse-mobile-nav-change", onNavChange);
        };
    }, []);

    const navItems = itemIds
        .map(id => ALL_NAV_OPTIONS.find(o => o.id === id))
        .filter(Boolean) as typeof ALL_NAV_OPTIONS[number][];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[8900] bg-white myverse-dark:bg-[#08080E]/95 myverse-dark:backdrop-blur-xl border-t border-neutral-200 myverse-dark:border-white/8 safe-area-inset-bottom">
            <div className="flex items-stretch h-14">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/") ||
                        pathname.startsWith(item.href + "?") ||
                        (item.id === "today" && (pathname === "/myverse/app" || pathname.startsWith("/myverse/app/daily") || pathname.startsWith("/myverse/app/index"))) ||
                        (item.id === "work" && (pathname.startsWith("/myverse/app/projects") || pathname.startsWith("/myverse/app/tasks") || pathname.startsWith("/myverse/app/canvas") || pathname.startsWith("/myverse/app/templates") || pathname.startsWith("/myverse/app/contacts") || pathname.startsWith("/myverse/app/personal"))) ||
                        (item.id === "ai" && (pathname.startsWith("/myverse/app/ask") || pathname.startsWith("/myverse/app/coach") || pathname.startsWith("/myverse/app/diary") || pathname.startsWith("/myverse/app/insights") || pathname.startsWith("/myverse/app/capsules"))) ||
                        (item.id === "connect" && (pathname.startsWith("/myverse/app/feed") || pathname.startsWith("/myverse/app/dm") || pathname.startsWith("/myverse/app/verse") || pathname.startsWith("/myverse/app/notifications"))) ||
                        (item.id === "record" && (pathname.startsWith("/myverse/app/traces") || pathname.startsWith("/myverse/app/weekly") || pathname.startsWith("/myverse/app/monthly") || pathname.startsWith("/myverse/app/yearly") || pathname.startsWith("/myverse/app/body") || pathname.startsWith("/myverse/app/work") || pathname.startsWith("/myverse/app/study") || pathname.startsWith("/myverse/app/lifestyle") || pathname.startsWith("/myverse/app/schedule") || pathname.startsWith("/myverse/app/travel") || pathname.startsWith("/myverse/app/move") || pathname.startsWith("/myverse/app/relation") || pathname.startsWith("/myverse/app/with") || pathname.startsWith("/myverse/app/time")));
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
                                isActive ? "" : "text-neutral-400 myverse-dark:text-neutral-500"
                            }`}
                            style={isActive ? { color: "var(--myverse-accent-nav)" } : undefined}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                            <span className="text-[9px] font-medium leading-none tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
            {/* iPhone 홈 인디케이터 safe area */}
            <div className="h-safe-area-inset-bottom bg-white myverse-dark:bg-[#08080E]" />
        </nav>
    );
}
