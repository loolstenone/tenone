"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// 세션 134 — capture를 가운데 슬롯에 강제 적용하기 위해 storage key bump (v2).
// 옛 키(`myverse-mobile-nav`)에 저장된 사용자 커스텀은 무시 — 모두 새 기본값에서 다시 시작.
// 사용자가 customize 페이지에서 다시 조정 가능.
export const MOBILE_NAV_STORAGE_KEY = "myverse-mobile-nav-v2";
const LEGACY_V1_KEY = "myverse-mobile-nav";
const LEGACY_PLANNERS_KEY = "planners-mobile-nav";
// 캡쳐를 가운데(index 2) 슬롯에 — 시각적 강조 처리
export const MOBILE_NAV_DEFAULT: string[] = ["projects", "today", "capture", "feed", "card"];

export const ALL_NAV_OPTIONS = [
    // ── INSIDE / ENGINE
    { id: "capture",   label: "캡쳐",    icon: "bolt",           href: "/myverse/app/capture" },
    { id: "today",     label: "오늘",     icon: "wb_twilight",    href: "/myverse/app/daily" },
    { id: "projects",  label: "프로젝트", icon: "folder_managed", href: "/myverse/app/projects" },
    { id: "canvas",    label: "캔버스",   icon: "draw",           href: "/myverse/app/canvas" },
    { id: "templates", label: "템플릿",   icon: "frame_source",   href: "/myverse/app/templates" },
    { id: "contacts",  label: "연락처",   icon: "contacts",       href: "/myverse/app/contacts" },
    { id: "mail",      label: "메일",     icon: "mail",           href: "/myverse/app/mail" },
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
        // v1·옛 planners 키는 회수만 하고 마이그레이션은 안 함 — 새 기본값(capture 가운데) 강제 적용
        try { localStorage.removeItem(LEGACY_V1_KEY); } catch {}
        try { localStorage.removeItem(LEGACY_PLANNERS_KEY); } catch {}
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
                {navItems.map((item, idx) => {
                    const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/") ||
                        pathname.startsWith(item.href + "?") ||
                        (item.id === "today" && (pathname === "/myverse/app" || pathname.startsWith("/myverse/app/daily") || pathname.startsWith("/myverse/app/index"))) ||
                        (item.id === "personal" && pathname === "/myverse/app/personal");
                    // 5개 슬롯의 가운데(index 2) — Primary 액션 강조 (캡쳐 등)
                    const isCenterEmphasis = navItems.length === 5 && idx === 2;

                    if (isCenterEmphasis) {
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className="flex-1 flex flex-col items-center justify-center active:scale-95 transition-transform"
                            >
                                <span
                                    className="-mt-5 mb-0.5 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white myverse-dark:ring-[#08080E]"
                                    style={{ background: "var(--myverse-accent-nav, #6366F1)" }}
                                >
                                    <span
                                        className="material-symbols-outlined text-[24px] leading-none"
                                        style={{ fontVariationSettings: "'FILL' 1" }}
                                    >
                                        {item.icon}
                                    </span>
                                </span>
                                <span
                                    className="text-[9px] font-semibold leading-none tracking-tight"
                                    style={{ color: isActive ? "var(--myverse-accent-nav)" : undefined }}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    }

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
