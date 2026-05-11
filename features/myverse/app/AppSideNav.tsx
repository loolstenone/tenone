"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InstallButton } from "@/features/myverse/planner/InstallButton";
import { useSidebarCollapse } from "./SidebarCollapseContext";

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
                    { key: "personal",   label: "비전하우스", icon: "castle",       href: `${BASE}/personal` },
                    { key: "resume",     label: "이력서",    icon: "description",   href: `${BASE}/personal/resume` },
                    { key: "brand",      label: "브랜드",    icon: "auto_awesome",  href: `${BASE}/personal/brand` },
                    { key: "portfolio",  label: "포트폴리오", icon: "photo_album",  href: `${BASE}/portfolio` },
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

/** 사이드바 nav item — 접힘 시 아이콘만 + hover tooltip */
function SideNavLink({
    href, label, icon, active, collapsed,
}: { href: string; label: string; icon: string; active: boolean; collapsed: boolean }) {
    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            className={`relative group flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                active
                    ? "bg-[#6366F1]/10 text-[#6366F1] myverse-dark:bg-[#6366F1]/15"
                    : "text-neutral-600 myverse-dark:text-neutral-400 hover:bg-neutral-100 myverse-dark:hover:bg-white/5 hover:text-neutral-900 myverse-dark:hover:text-neutral-200"
            }`}
        >
            <span
                className="material-symbols-outlined text-[16px] leading-none shrink-0"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
            >
                {icon}
            </span>
            {!collapsed && <span className="truncate font-medium">{label}</span>}
            {/* 접힘 시 hover tooltip — 우측에 floating */}
            {collapsed && (
                <span className="pointer-events-none absolute left-full ml-2 px-2 py-1 rounded-md bg-neutral-900 myverse-dark:bg-neutral-700 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                    {label}
                </span>
            )}
        </Link>
    );
}

export function AppSideNav() {
    const pathname = usePathname();
    const { collapsed, toggle } = useSidebarCollapse();

    return (
        <aside
            className={`hidden md:flex fixed top-12 left-0 bottom-0 z-30 bg-white myverse-dark:bg-[#0D0D15] border-r border-neutral-200 myverse-dark:border-white/8 flex-col overflow-hidden transition-[width] duration-200 ${
                collapsed ? "w-14" : "w-52"
            }`}
        >
            <nav className="flex-1 overflow-y-auto px-2 py-3 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                {NAV.map((section, si) => (
                    <div key={section.section} className={si > 0 ? "mt-1 pt-3 border-t border-neutral-100 myverse-dark:border-white/8" : ""}>
                        {/* Section header — 접힘 시 작은 점으로 대체 */}
                        {collapsed ? (
                            <div className="flex justify-center py-1.5">
                                <span className="h-0.5 w-4 rounded-full bg-neutral-200 myverse-dark:bg-white/10" />
                            </div>
                        ) : (
                            <div className="px-2 pb-1.5">
                                <span className="text-[9px] font-semibold tracking-widest text-neutral-400 myverse-dark:text-neutral-600 uppercase">
                                    {section.section}
                                </span>
                            </div>
                        )}

                        {section.groups.map((group, gi) => (
                            <div key={gi} className={gi > 0 ? (collapsed ? "mt-1" : "mt-2") : ""}>
                                {group.label && !collapsed && (
                                    <div className="px-2 py-1">
                                        <span className="text-[9px] font-medium tracking-wider text-neutral-300 myverse-dark:text-neutral-700 uppercase">
                                            {group.label}
                                        </span>
                                    </div>
                                )}
                                {group.items.map(item => (
                                    <SideNavLink
                                        key={item.key}
                                        href={item.href}
                                        label={item.label}
                                        icon={item.icon}
                                        active={isActive(pathname, item.href)}
                                        collapsed={collapsed}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </nav>

            {/* Footer utility — mt-auto로 항상 하단 고정 */}
            <div className="mt-auto px-2 pb-3 pt-2 border-t border-neutral-100 myverse-dark:border-white/8 space-y-0.5">
                <SideNavLink
                    href="/myverse/app/settings"
                    label="설정"
                    icon="tune"
                    active={pathname.startsWith("/myverse/app/settings")}
                    collapsed={collapsed}
                />
                <SideNavLink
                    href="/myverse/app/help"
                    label="도움말"
                    icon="help"
                    active={pathname.startsWith("/myverse/app/help")}
                    collapsed={collapsed}
                />
                <InstallButton className={`relative group flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-2.5 py-1.5 rounded-lg text-xs text-neutral-500 myverse-dark:text-neutral-500 hover:bg-neutral-50 myverse-dark:hover:bg-white/5 transition-colors w-full text-left`}>
                    <span className="material-symbols-outlined text-[16px] leading-none shrink-0">download</span>
                    {!collapsed && <span>앱 설치</span>}
                </InstallButton>

                {/* 토글 버튼 — 사이드바 최하단 */}
                <button
                    type="button"
                    onClick={toggle}
                    aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
                    title={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
                    className={`mt-1 relative group flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-2.5 py-1.5 rounded-lg text-xs text-neutral-400 myverse-dark:text-neutral-500 hover:bg-neutral-50 myverse-dark:hover:bg-white/5 hover:text-neutral-700 transition-colors w-full text-left`}
                >
                    <span className="material-symbols-outlined text-[16px] leading-none shrink-0">
                        {collapsed ? "chevron_right" : "chevron_left"}
                    </span>
                    {!collapsed && <span>접기</span>}
                </button>
            </div>
        </aside>
    );
}
