"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstallButton } from "@/features/myverse/planner/InstallButton";

const BASE = "/myverse/app";

type NavItem = { key: string; label: string; icon: string; href: string };
type NavGroup = { label: string | null; items: NavItem[] };
type NavSection = { section: string; groups: NavGroup[] };

const NAV: NavSection[] = [
    {
        section: "INSIDE",
        groups: [
            {
                label: "ENGINE",
                items: [
                    { key: "today",     label: "오늘",    icon: "wb_twilight",    href: `${BASE}/daily` },
                    { key: "projects",  label: "프로젝트", icon: "folder_managed", href: `${BASE}/projects` },
                    { key: "canvas",    label: "캔버스",   icon: "draw",           href: `${BASE}/canvas` },
                    { key: "templates", label: "템플릿",   icon: "frame_source",   href: `${BASE}/templates` },
                    { key: "contacts",  label: "연락처",   icon: "contacts",       href: `${BASE}/contacts` },
                ],
            },
            {
                label: "PERSONAL",
                items: [
                    { key: "personal",   label: "비전하우스", icon: "castle",      href: `${BASE}/personal` },
                    { key: "resume",     label: "이력서",    icon: "description",  href: `${BASE}/personal/resume` },
                    { key: "portfolio",  label: "포트폴리오", icon: "photo_album", href: `${BASE}/portfolio` },
                ],
            },
            {
                label: "BLACKBOX",
                items: [
                    { key: "traces",   label: "흔적",     icon: "timeline",  href: `${BASE}/traces` },
                    { key: "capsules", label: "타임캡슐", icon: "hourglass", href: `${BASE}/capsules` },
                    { key: "insights", label: "인사이트", icon: "insights",  href: `${BASE}/insights` },
                ],
            },
            // MUKKI(무끼/일기/코치) — 사이드바 제거. 우측 하단 플로팅 AI 버튼으로 통합.
        ],
    },
    {
        section: "OUTSIDE",
        groups: [
            {
                label: null,
                items: [
                    { key: "feed",    label: "피드",   icon: "dynamic_feed", href: `${BASE}/feed` },
                    { key: "profile", label: "프로필", icon: "person",       href: `${BASE}/profile` },
                    { key: "card",    label: "명함",   icon: "contact_page", href: `${BASE}/card` },
                ],
            },
        ],
    },
];

function isActive(pathname: string, href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
}

export function AppSideNav() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex fixed top-12 left-0 bottom-0 w-52 z-30 bg-white myverse-dark:bg-[#0D0D15] border-r border-neutral-200 myverse-dark:border-white/8 flex-col overflow-hidden">
            <nav className="flex-1 overflow-y-auto px-2 py-3 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                {NAV.map((section, si) => (
                    <div key={section.section} className={si > 0 ? "mt-1 pt-3 border-t border-neutral-100 myverse-dark:border-white/8" : ""}>
                        {/* Section header */}
                        <div className="px-2 pb-1.5">
                            <span className="text-[9px] font-semibold tracking-widest text-neutral-400 myverse-dark:text-neutral-600 uppercase">
                                {section.section}
                            </span>
                        </div>

                        {section.groups.map((group, gi) => (
                            <div key={gi} className={gi > 0 ? "mt-2" : ""}>
                                {group.label && (
                                    <div className="px-2 py-1">
                                        <span className="text-[9px] font-medium tracking-wider text-neutral-300 myverse-dark:text-neutral-700 uppercase">
                                            {group.label}
                                        </span>
                                    </div>
                                )}
                                {group.items.map(item => {
                                    const active = isActive(pathname, item.href);
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                                active
                                                    ? "bg-[#6366F1]/10 text-[#6366F1] myverse-dark:bg-[#6366F1]/15"
                                                    : "text-neutral-600 myverse-dark:text-neutral-400 hover:bg-neutral-100 myverse-dark:hover:bg-white/5 hover:text-neutral-900 myverse-dark:hover:text-neutral-200"
                                            }`}
                                        >
                                            <span
                                                className="material-symbols-outlined text-[16px] leading-none shrink-0"
                                                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                                            >
                                                {item.icon}
                                            </span>
                                            <span className="truncate font-medium">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer utility — mt-auto로 항상 하단 고정 (nav가 짧을 때 떠 있는 현상 방지) */}
            <div className="mt-auto px-2 pb-3 pt-2 border-t border-neutral-100 myverse-dark:border-white/8 space-y-0.5">
                <Link
                    href="/myverse/app/settings"
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        pathname.startsWith("/myverse/app/settings")
                            ? "bg-neutral-100 myverse-dark:bg-white/8 text-neutral-900 myverse-dark:text-white"
                            : "text-neutral-500 myverse-dark:text-neutral-500 hover:bg-neutral-50 myverse-dark:hover:bg-white/5"
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px] leading-none">tune</span>
                    <span>설정</span>
                </Link>
                <Link
                    href="/myverse/app/help"
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                        pathname.startsWith("/myverse/app/help")
                            ? "bg-neutral-100 myverse-dark:bg-white/8 text-neutral-900 myverse-dark:text-white"
                            : "text-neutral-500 myverse-dark:text-neutral-500 hover:bg-neutral-50 myverse-dark:hover:bg-white/5"
                    }`}
                >
                    <span className="material-symbols-outlined text-[16px] leading-none">help</span>
                    <span>도움말</span>
                </Link>
                <InstallButton className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-500 myverse-dark:text-neutral-500 hover:bg-neutral-50 myverse-dark:hover:bg-white/5 transition-colors w-full text-left">
                    <span className="material-symbols-outlined text-[16px] leading-none">download</span>
                    <span>앱 설치</span>
                </InstallButton>
            </div>
        </aside>
    );
}
