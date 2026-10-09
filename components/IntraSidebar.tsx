"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useIdentityAdapter } from "@/lib/identity-context";
import {
    ChevronDown, ChevronRight, Menu, X as XIcon,
    LayoutDashboard, FileText, BarChart3, Settings,
} from "lucide-react";
import clsx from "clsx";
import { modules as staticModules, canSeeByRole, regroupBrandSections } from "@/lib/intra-nav";
import { useSiteTiers } from "@/lib/use-site-tiers";

export function IntraSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isStaff, hasAccess, hasModuleAccess } = useAuth();
    const { accessibleModules, isSuperAdmin, identityLoaded } = useIdentityAdapter();
    const getSiteById = (_id: string): { name: string } | null => null;
    const getBoardsBySite = (_id: string): never[] => [];
    const getPostsByBoard = (_id: string): never[] => [];
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openSections, setOpenSections] = useState<Set<string>>(new Set());
    // 브랜드 섹션(집중 / 실험·보관)은 DB ums_sites.tier로 재분류 — tier를 바꾸면 사이드바가 자동으로 따라온다
    const siteTiers = useSiteTiers();
    const modules = useMemo(() => (siteTiers ? regroupBrandSections(staticModules, siteTiers) : staticModules), [siteTiers]);

    // BUMS 사이트 진입 감지
    const siteMatch = pathname.match(/^\/intra\/bums\/sites\/([^/]+)/);
    const activeSiteId = siteMatch ? siteMatch[1] : null;
    const activeSite = activeSiteId ? getSiteById(activeSiteId) : null;
    const siteBoards = activeSiteId ? getBoardsBySite(activeSiteId) : [];

    // 경로 변경 시 모바일 사이드바 닫기
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    // Auto-expand active module
    useEffect(() => {
        const newModules = new Set<string>();
        for (const mod of modules) {
            let isModuleActive = pathname.startsWith(mod.href);
            for (const section of mod.sections) {
                for (const item of section.items) {
                    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
                        isModuleActive = true;
                    }
                    if (item.children) {
                        const isChildActive = item.children.some(
                            (c) => pathname === c.href || pathname.startsWith(c.href + "/")
                        );
                        if (isChildActive) isModuleActive = true;
                    }
                }
            }
            if (isModuleActive) newModules.add(mod.name);
        }
        setExpandedModules(newModules);
    }, [pathname, modules]);

    const toggleModule = (name: string) => {
        setExpandedModules((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname === href || pathname.startsWith(href + "/");
    };

    // 모듈 접근 필터
    // 역할 기반 필터링: user.roles 와 module.roles 교집합 체크 (Tier 3 Dynamic Sidebar)
    // user 로딩 중이면 전체 표시 (깜빡임 방지), 로딩 완료 후 roles 필터 적용.
    const userRoles: string[] = (user?.roles as string[] | undefined) ?? [];
    const visibleModules = user ? modules.filter(mod => canSeeByRole(mod.roles, userRoles)) : modules;

    return (
        <>
        {/* 모바일 햄버거 버튼 */}
        <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-neutral-900 text-white rounded-md shadow-lg"
        >
            <Menu className="h-5 w-5" />
        </button>

        {/* 모바일 오버레이 */}
        {mobileOpen && (
            <div className="lg:hidden fixed inset-0 bg-black/50 z-[55]" onClick={() => setMobileOpen(false)} />
        )}

        <aside className={clsx(
            "fixed left-0 top-0 bottom-0 w-[240px] bg-neutral-900 text-white flex flex-col z-[60] transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
            {/* Logo */}
            <div className="px-5 h-14 flex items-center border-b border-neutral-800 shrink-0">
                <Link href="/intra" className="text-lg font-bold text-white hover:opacity-80 transition-opacity">
                    Ten:One<span className="text-[8px] align-super">™</span>
                </Link>
                <span className="ml-2 text-[9px] tracking-widest text-neutral-500 uppercase">Intra</span>
                <button onClick={() => setMobileOpen(false)} className="lg:hidden ml-auto p-1 text-neutral-400 hover:text-white">
                    <XIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Modules */}
            <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
                {visibleModules.map((mod) => {
                    // mod.href 외에 하위 섹션 아이템 경로도 확인 (MARKETING→/intra/studio/ 등)
                    const isModuleActive = pathname.startsWith(mod.href) ||
                        mod.sections.some((s) =>
                            s.items.some((item) =>
                                pathname === item.href ||
                                pathname.startsWith(item.href + "/") ||
                                (item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + "/")))
                            )
                        );
                    const isExpanded = expandedModules.has(mod.name);
                    const hasSections = mod.sections.length > 0;

                    return (
                        <div key={mod.name}>
                            {/* Module header */}
                            <button
                                onClick={() => {
                                    if (hasSections) toggleModule(mod.name);
                                    else router.push(mod.href);
                                }}
                                className={clsx(
                                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded transition-all",
                                    isModuleActive
                                        ? "bg-white/10 text-white font-medium"
                                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <mod.icon className={clsx("h-4 w-4 shrink-0", isModuleActive ? "text-white" : "text-neutral-500")} />
                                <span className="flex-1 text-left">{mod.name}</span>
                                {hasSections && (
                                    isExpanded
                                        ? <ChevronDown className="h-3 w-3 text-neutral-500" />
                                        : <ChevronRight className="h-3 w-3 text-neutral-500" />
                                )}
                            </button>

                            {/* Module tagline (모듈 헤더 바로 아래, 펼쳤을 때만) */}
                            {isExpanded && mod.tagline && (
                                <p className="text-[10px] text-neutral-500 px-3 pb-1 -mt-0.5 pl-10 leading-snug">
                                    {mod.tagline}
                                </p>
                            )}

                            {/* Expanded sub-menu */}
                            {isExpanded && hasSections && (
                                <div className="ml-3 pl-3 border-l border-neutral-800 mt-1 space-y-1">
                                    {mod.sections.map((section, sIdx) => {
                                        const sectionKey = `${mod.name}:${sIdx}`;
                                        const sectionOpen = !section.collapsed
                                            || openSections.has(sectionKey)
                                            || section.items.some((item) => isActive(item.href, item.exact));
                                        return (
                                        <div key={sIdx}>
                                            {section.label && (section.collapsed ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenSections((prev) => {
                                                        const next = new Set(prev);
                                                        if (next.has(sectionKey)) next.delete(sectionKey); else next.add(sectionKey);
                                                        return next;
                                                    })}
                                                    className="w-full flex items-center gap-1 text-[9px] tracking-widest text-neutral-600 hover:text-neutral-400 uppercase px-3 pt-3 pb-1"
                                                >
                                                    {sectionOpen ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
                                                    {section.label}
                                                    <span className="normal-case tracking-normal">({section.items.length})</span>
                                                </button>
                                            ) : (
                                                <p className="text-[9px] tracking-widest text-neutral-600 uppercase px-3 pt-3 pb-1">
                                                    {section.label}
                                                </p>
                                            ))}
                                            {sectionOpen && section.items
                                                .filter((item) => !item.staffOnly || isStaff)
                                                .filter((item) => canSeeByRole(item.roles, userRoles))
                                                .map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className={clsx(
                                                            "flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                            isActive(item.href, item.exact)
                                                                ? "text-white font-medium bg-white/5"
                                                                : "text-neutral-500 hover:text-white hover:bg-white/[0.03]"
                                                        )}
                                                    >
                                                        <item.icon className={clsx("h-3.5 w-3.5 shrink-0", isActive(item.href, item.exact) ? "text-white" : "text-neutral-600")} />
                                                        <span className="flex-1">{item.name}</span>
                                                        {item.badge === "soon" && (
                                                            <span className="text-[8px] px-1 py-0.5 rounded bg-neutral-800 text-neutral-600 font-medium">준비중</span>
                                                        )}
                                                        {item.badge === "beta" && (
                                                            <span className="text-[8px] px-1 py-0.5 rounded bg-blue-900/50 text-blue-400 font-medium">BETA</span>
                                                        )}
                                                        {item.badge === "new" && (
                                                            <span className="text-[8px] px-1 py-0.5 rounded bg-green-900/50 text-green-400 font-medium">NEW</span>
                                                        )}
                                                    </Link>
                                                ))}
                                        </div>
                                        );
                                    })}

                                    {/* 동적 사이트 관리 메뉴 (BUMS 사이트 진입 시) */}
                                    {mod.dynamic && activeSite && activeSiteId && (
                                        <div className="mt-2 pt-2 border-t border-neutral-800">
                                            <p className="text-[9px] tracking-widest text-neutral-600 uppercase px-3 pt-1 pb-1">
                                                {activeSite.name}
                                            </p>
                                            <Link
                                                href={`/intra/bums/sites/${activeSiteId}`}
                                                className={clsx(
                                                    "flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                    isActive(`/intra/bums/sites/${activeSiteId}`, true)
                                                        ? "text-white font-medium bg-white/5"
                                                        : "text-neutral-500 hover:text-white"
                                                )}
                                            >
                                                <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                                                대시보드
                                            </Link>
                                            <Link
                                                href={`/intra/bums/sites/${activeSiteId}/content`}
                                                className={clsx(
                                                    "flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                    isActive(`/intra/bums/sites/${activeSiteId}/content`)
                                                        ? "text-white font-medium bg-white/5"
                                                        : "text-neutral-500 hover:text-white"
                                                )}
                                            >
                                                <FileText className="h-3.5 w-3.5 shrink-0" />
                                                콘텐츠
                                            </Link>
                                            <Link
                                                href={`/intra/bums/sites/${activeSiteId}/analytics`}
                                                className={clsx(
                                                    "flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                    isActive(`/intra/bums/sites/${activeSiteId}/analytics`)
                                                        ? "text-white font-medium bg-white/5"
                                                        : "text-neutral-500 hover:text-white"
                                                )}
                                            >
                                                <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                                                통계
                                            </Link>
                                            <Link
                                                href={`/intra/bums/sites/${activeSiteId}/settings`}
                                                className={clsx(
                                                    "flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                    isActive(`/intra/bums/sites/${activeSiteId}/settings`)
                                                        ? "text-white font-medium bg-white/5"
                                                        : "text-neutral-500 hover:text-white"
                                                )}
                                            >
                                                <Settings className="h-3.5 w-3.5 shrink-0" />
                                                설정
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

        </aside>
        </>
    );
}
