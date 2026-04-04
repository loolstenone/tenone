"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useIdentityAdapter } from "@/lib/identity-context";
import {
    LogOut, ChevronDown, ChevronRight, Menu, X as XIcon,
    LayoutDashboard, FileText, BarChart3, Settings,
} from "lucide-react";
import clsx from "clsx";
import { modules } from "@/lib/intra-nav";

export function IntraSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isStaff, hasAccess, hasModuleAccess, logout } = useAuth();
    const { accessibleModules, isSuperAdmin, identityLoaded } = useIdentityAdapter();
    const getSiteById = (_id: string): any => null;
    const getBoardsBySite = (_id: string): any[] => [];
    const getPostsByBoard = (_id: string): any[] => [];
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [mobileOpen, setMobileOpen] = useState(false);

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
    }, [pathname]);

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
    // layout.tsx가 이미 인증을 완료했으므로, user가 아직 null(로딩중)이면 전체 표시
    // layout.tsx가 이미 인증 + 권한 체크를 완료했으므로
    // 사이드바에서는 모든 모듈을 표시한다.
    // staffOnly 아이템만 isStaff 체크.
    const visibleModules = modules;

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
                <Link href="/intra" className="text-lg font-bold tracking-wider text-white hover:opacity-80 transition-opacity">
                    TEN<span className="font-light">:</span>ONE<span className="text-[8px] align-super">™</span>
                </Link>
                <span className="ml-2 text-[9px] tracking-widest text-neutral-500 uppercase">Intra</span>
                <button onClick={() => setMobileOpen(false)} className="lg:hidden ml-auto p-1 text-neutral-400 hover:text-white">
                    <XIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Modules */}
            <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
                {visibleModules.map((mod) => {
                    const isModuleActive = pathname.startsWith(mod.href);
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

                            {/* Expanded sub-menu */}
                            {isExpanded && hasSections && (
                                <div className="ml-3 pl-3 border-l border-neutral-800 mt-1 space-y-1">
                                    {mod.sections.map((section, sIdx) => (
                                        <div key={sIdx}>
                                            {section.label && (
                                                <p className="text-[9px] tracking-widest text-neutral-600 uppercase px-3 pt-3 pb-1">
                                                    {section.label}
                                                </p>
                                            )}
                                            {section.items
                                                .filter((item) => !item.staffOnly || isStaff)
                                                .map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className={clsx(
                                                            "flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                            isActive(item.href)
                                                                ? "text-white font-medium bg-white/5"
                                                                : "text-neutral-500 hover:text-white hover:bg-white/[0.03]"
                                                        )}
                                                    >
                                                        <item.icon className={clsx("h-3.5 w-3.5 shrink-0", isActive(item.href) ? "text-white" : "text-neutral-600")} />
                                                        <span className="flex-1">{item.name}</span>
                                                    </Link>
                                                ))}
                                        </div>
                                    ))}

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

            {/* Bottom */}
            <div className="border-t border-neutral-800 shrink-0">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-6 py-2.5 text-xs text-neutral-500 hover:text-white transition-colors"
                >
                    ←
                </Link>
                {user && (
                    <div className="px-4 py-3 flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-neutral-700 text-white flex items-center justify-center text-[10px] font-medium shrink-0">
                            {user.avatarInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-neutral-200 truncate">{user.name}</p>
                            <p className="text-[9px] text-neutral-500 truncate">{user.role}</p>
                        </div>
                        <button
                            onClick={() => { sessionStorage.removeItem("tenone_intra_verified"); router.push("/"); setTimeout(() => logout(), 100); }}
                            className="p-1 text-neutral-600 hover:text-white transition-colors shrink-0"
                            title="로그아웃"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </aside>
        </>
    );
}
