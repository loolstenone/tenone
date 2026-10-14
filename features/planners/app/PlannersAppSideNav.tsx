"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarCollapse } from "@/features/myverse/app/SidebarCollapseContext";
import { PLANNERS_APP_NAV, isAppNavActive } from "@/features/planners/app/nav";

// 데스크톱 사이드바 — MyVerse AppSideNav와 같은 폭(펼침 w-52 / 접힘 w-14, MainContent 여백과 짝)
export function PlannersAppSideNav() {
    const pathname = usePathname();
    const { collapsed, toggle } = useSidebarCollapse();

    return (
        <aside className={`hidden md:flex fixed top-12 left-0 bottom-0 z-30 flex-col overflow-hidden border-r border-neutral-200 bg-white transition-[width] duration-200 myverse-dark:border-white/8 myverse-dark:bg-[#0D0D15] ${collapsed ? "w-14" : "w-52"}`}>
            <button
                type="button"
                onClick={toggle}
                aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
                className={`absolute top-1.5 ${collapsed ? "left-1/2 -translate-x-1/2" : "right-1.5"} z-10 flex h-6 w-6 items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700`}
            >
                <span className="material-symbols-outlined text-[16px] leading-none">{collapsed ? "chevron_right" : "chevron_left"}</span>
            </button>
            <nav className={`flex-1 overflow-y-auto px-2 ${collapsed ? "pt-8" : "py-3"}`}>
                {PLANNERS_APP_NAV.map((group, gi) => (
                    <div key={group.label} className={gi > 0 ? "mt-3 border-t border-neutral-100 pt-3 myverse-dark:border-white/8" : ""}>
                        {!collapsed && <p className="px-2 pb-1.5 text-[10px] font-semibold text-neutral-400">{group.label}</p>}
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const active = isAppNavActive(pathname, item.href);
                                return (
                                    <li key={item.key}>
                                        <Link
                                            href={item.href}
                                            title={collapsed ? item.label : undefined}
                                            className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} px-2.5 py-1.5 text-xs transition-colors ${active ? "bg-[#0F766E]/10 font-semibold text-[#0F766E] myverse-dark:text-[#5EEAD4]" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 myverse-dark:text-neutral-400 myverse-dark:hover:bg-white/5"}`}
                                        >
                                            <span className="material-symbols-outlined shrink-0 text-[16px] leading-none" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                                            {!collapsed && <span className="truncate">{item.label}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
