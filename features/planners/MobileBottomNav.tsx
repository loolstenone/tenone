"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    LayoutGrid, Sun, FolderKanban, User,
    CalendarDays, Calendar, CalendarRange, Users, Search, Settings,
} from "lucide-react";

export const MOBILE_NAV_STORAGE_KEY = "planners-mobile-nav";
export const MOBILE_NAV_DEFAULT: string[] = ["index", "today", "projects", "identity", "search"];

export const ALL_NAV_OPTIONS = [
    { id: "index",    label: "인덱스",  icon: LayoutGrid,   href: "/planners/app/index" },
    { id: "today",    label: "오늘",    icon: Sun,          href: "/planners/app/today" },
    { id: "weekly",   label: "주간",    icon: CalendarDays, href: "/planners/app/weekly" },
    { id: "monthly",  label: "월간",    icon: Calendar,     href: "/planners/app/monthly" },
    { id: "yearly",   label: "연간",    icon: CalendarRange, href: "/planners/app/yearly" },
    { id: "projects", label: "프로젝트", icon: FolderKanban, href: "/planners/app/projects" },
    { id: "identity", label: "PI",      icon: User,         href: "/planners/app/identity" },
    { id: "contacts", label: "연락처",  icon: Users,        href: "/planners/app/contacts" },
    { id: "search",   label: "검색",    icon: Search,       href: "/planners/app/search" },
    { id: "settings", label: "설정",    icon: Settings,     href: "/planners/app/settings" },
] as const;

export type NavOptionId = typeof ALL_NAV_OPTIONS[number]["id"];

function loadSaved(): string[] {
    if (typeof window === "undefined") return MOBILE_NAV_DEFAULT;
    try {
        const raw = localStorage.getItem(MOBILE_NAV_STORAGE_KEY);
        if (!raw) return MOBILE_NAV_DEFAULT;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === 5) return parsed;
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
        window.addEventListener("storage", onStorage);
        window.addEventListener("planners-mobile-nav-change", () => setItemIds(loadSaved()));
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("planners-mobile-nav-change", () => {});
        };
    }, []);

    const navItems = itemIds
        .map(id => ALL_NAV_OPTIONS.find(o => o.id === id))
        .filter(Boolean) as typeof ALL_NAV_OPTIONS[number][];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[8900] bg-white border-t border-neutral-200 safe-area-inset-bottom">
            <div className="flex items-stretch h-14">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href ||
                        pathname.startsWith(item.href + "?") ||
                        (item.id === "index" && pathname === "/planners/app") ||
                        (item.id === "today" && pathname.startsWith("/planners/app/daily"));
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
                                isActive ? "text-[#0F766E]" : "text-neutral-400"
                            }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
                            <span className="text-[9px] font-medium leading-none tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
            {/* iPhone 홈 인디케이터 safe area */}
            <div className="h-safe-area-inset-bottom bg-white" />
        </nav>
    );
}
