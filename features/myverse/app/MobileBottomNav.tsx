"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const MOBILE_NAV_STORAGE_KEY = "myverse-mobile-nav";
const LEGACY_NAV_STORAGE_KEY = "planners-mobile-nav";
// INSIDE/OUTSIDE IA SSOT 기반 모바일 하단 네비 (세션 124 — IA 재구성, MUKKI/인사이트 BLACKBOX)
export const MOBILE_NAV_DEFAULT: string[] = ["today", "traces", "ask", "personal", "feed"];

export const ALL_NAV_OPTIONS = [
    // ── INSIDE / ENGINE
    { id: "today",     label: "오늘",     icon: "wb_twilight",    href: "/myverse/app/daily" },
    { id: "projects",  label: "프로젝트", icon: "folder_managed", href: "/myverse/app/projects" },
    { id: "canvas",    label: "캔버스",   icon: "draw",           href: "/myverse/app/canvas" },
    { id: "templates", label: "템플릿",   icon: "frame_source",   href: "/myverse/app/templates" },
    { id: "contacts",  label: "연락처",   icon: "contacts",       href: "/myverse/app/contacts" },
    // ── INSIDE / PERSONAL
    { id: "personal",  label: "비전",     icon: "castle",         href: "/myverse/app/personal" },
    { id: "resume",    label: "이력서",   icon: "description",    href: "/myverse/app/personal/resume" },
    { id: "portfolio", label: "포폴",     icon: "photo_album",    href: "/myverse/app/portfolio" },
    // ── INSIDE / BLACKBOX
    { id: "traces",    label: "흔적",     icon: "timeline",       href: "/myverse/app/traces" },
    { id: "capsules",  label: "캡슐",     icon: "hourglass",      href: "/myverse/app/capsules" },
    // ── INSIDE / AI
    { id: "ask",       label: "무끼",     icon: "auto_awesome",   href: "/myverse/app/ask" },
    { id: "diary",     label: "일기",     icon: "edit_note",      href: "/myverse/app/diary" },
    { id: "insights",  label: "인사이트", icon: "insights",       href: "/myverse/app/insights" },
    { id: "coach",     label: "코치",     icon: "psychology",     href: "/myverse/app/coach" },
    // ── OUTSIDE
    { id: "feed",      label: "피드",     icon: "dynamic_feed",   href: "/myverse/app/feed" },
    { id: "dm",        label: "DM",       icon: "chat_bubble",    href: "/myverse/app/dm" },
    { id: "card",      label: "명함",     icon: "contact_page",   href: "/myverse/app/card" },
    // ── 시스템
    { id: "search",    label: "검색",     icon: "search",         href: "/myverse/app/search" },
    { id: "settings",  label: "설정",     icon: "tune",           href: "/myverse/app/settings" },
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
                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/") ||
                        pathname.startsWith(item.href + "?") ||
                        (item.id === "today" && (pathname === "/myverse/app" || pathname.startsWith("/myverse/app/daily") || pathname.startsWith("/myverse/app/index"))) ||
                        (item.id === "personal" && pathname === "/myverse/app/personal");
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
                                isActive ? "" : "text-neutral-400 myverse-dark:text-neutral-500"
                            }`}
                            style={isActive ? { color: "var(--myverse-accent-nav)" } : undefined}
                        >
                            <span
                                className="material-symbols-outlined text-[22px] leading-none"
                                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {item.icon}
                            </span>
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
