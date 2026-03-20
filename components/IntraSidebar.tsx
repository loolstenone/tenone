"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
    LayoutDashboard, Users, BookOpen, FileText, MessageSquareText,
    LogOut, Home, ChevronDown, ChevronRight,
    // Project
    FolderKanban, ClipboardList, Clock, UserPlus, Palette,
    Workflow, Calendar, Contact, Globe, FolderOpen,
    Megaphone, TrendingUp, Handshake, Activity, BarChart3, Building2, Tags, Upload,
    // ERP - HR
    UserCheck, Target, GitBranch, GraduationCap, DollarSign, CreditCard, Receipt,
    Briefcase, CalendarCheck, Wallet, Award, FileCheck, Heart,
    // ERP - Finance
    Calculator, CircleDollarSign, FileSpreadsheet,
    // ERP - Business
    FolderGit2, PackageCheck, FileSignature, ClipboardCheck, Factory, Gavel,
    // Wiki
    Compass, HelpCircle,
} from "lucide-react";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";
import type { SystemAccess } from "@/types/auth";

interface SubItem {
    name: string;
    href: string;
}

interface MenuItem {
    name: string;
    href: string;
    icon: LucideIcon;
    children?: SubItem[];
}

interface MenuSection {
    label?: string;
    items: MenuItem[];
}

interface NavModule {
    name: string;
    href: string;
    icon: LucideIcon;
    access?: SystemAccess;
    sections: MenuSection[];
}

const modules: NavModule[] = [
    {
        name: "커뮤니케이션", href: "/intra/comm", icon: MessageSquareText,
        sections: [
            {
                label: "소통",
                items: [
                    { name: "공지사항", href: "/intra/comm/notice", icon: ClipboardList },
                    { name: "자유게시판", href: "/intra/comm/free", icon: MessageSquareText },
                    { name: "사내 일정", href: "/intra/comm/calendar", icon: Calendar },
                ],
            },
            {
                label: "Wiki",
                items: [
                    { name: "Culture", href: "/intra/comm/wiki/culture", icon: BookOpen },
                    { name: "Onboarding", href: "/intra/comm/wiki/onboarding", icon: Compass },
                    { name: "Education", href: "/intra/comm/wiki/education", icon: GraduationCap },
                    { name: "Handbook", href: "/intra/comm/wiki/handbook", icon: FileText },
                    { name: "FAQ", href: "/intra/comm/wiki/faq", icon: HelpCircle },
                ],
            },
        ],
    },
    {
        name: "Project", href: "/intra/project", icon: FolderKanban, access: "project",
        sections: [
            {
                label: "MANAGEMENT",
                items: [
                    {
                        name: "프로젝트", href: "/intra/project/management", icon: ClipboardList,
                        children: [
                            { name: "프로젝트 목록", href: "/intra/project/management" },
                            { name: "프로젝트 등록", href: "/intra/project/management/new" },
                        ],
                    },
                    { name: "입찰관리", href: "/intra/project/management/bidding", icon: Gavel },
                    { name: "협력사", href: "/intra/project/management/vendors", icon: Handshake },
                    { name: "타임시트", href: "/intra/project/management/timesheet", icon: Clock },
                ],
            },
            {
                label: "STUDIO",
                items: [
                    {
                        name: "Workflow", href: "/intra/project/studio/workflow", icon: Workflow,
                        children: [
                            { name: "Pipeline", href: "/intra/project/studio/workflow/pipeline" },
                            { name: "Kanban", href: "/intra/project/studio/workflow/kanban" },
                            { name: "Automation", href: "/intra/project/studio/workflow/automation" },
                        ],
                    },
                    { name: "Schedule", href: "/intra/project/studio/schedule", icon: Calendar },
                    { name: "Assets", href: "/intra/project/studio/assets", icon: FolderOpen },
                    { name: "Brands", href: "/intra/project/studio/brands", icon: Palette },
                    { name: "Universe", href: "/intra/project/studio/universe", icon: Globe },
                ],
            },
            {
                label: "MARKETING",
                items: [
                    { name: "Campaigns", href: "/intra/project/marketing/campaigns", icon: Megaphone },
                    { name: "Leads", href: "/intra/project/marketing/leads", icon: TrendingUp },
                    { name: "Deals", href: "/intra/project/marketing/deals", icon: Handshake },
                    { name: "Activities", href: "/intra/project/marketing/activities", icon: Activity },
                    { name: "Contacts", href: "/intra/project/marketing/contacts", icon: Contact },
                    { name: "Analytics", href: "/intra/project/marketing/analytics", icon: BarChart3 },
                ],
            },
        ],
    },
    {
        name: "ERP", href: "/intra/erp", icon: Building2, access: "erp-hr",
        sections: [
            {
                label: "GPR",
                items: [
                    {
                        name: "GPR Dashboard", href: "/intra/erp/gpr", icon: Target,
                        children: [
                            { name: "전사 현황", href: "/intra/erp/gpr" },
                            { name: "목표 캐스케이드", href: "/intra/erp/gpr/cascade" },
                            { name: "평가", href: "/intra/erp/gpr/evaluation" },
                            { name: "인센티브", href: "/intra/erp/gpr/incentive" },
                        ],
                    },
                ],
            },
            {
                label: "HR · CHO",
                items: [
                    {
                        name: "인력관리", href: "/intra/erp/hr/people", icon: UserCheck,
                        children: [
                            { name: "구성원 목록", href: "/intra/erp/hr/people" },
                            { name: "조직도", href: "/intra/erp/hr/people/org" },
                            { name: "구성원 등록", href: "/intra/erp/hr/people/register" },
                            { name: "권한위임", href: "/intra/erp/hr/people/delegation" },
                        ],
                    },
                    { name: "근태관리", href: "/intra/erp/hr/attendance", icon: CalendarCheck },
                    { name: "급여관리", href: "/intra/erp/hr/payroll", icon: Wallet },
                    { name: "교육관리", href: "/intra/erp/hr/education", icon: GraduationCap },
                    { name: "제증명서", href: "/intra/erp/hr/certificates", icon: FileCheck },
                    { name: "가족관리", href: "/intra/erp/hr/family", icon: Heart },
                    {
                        name: "인재관리", href: "/intra/erp/hr/talent", icon: Users,
                        children: [
                            { name: "Talent Pool", href: "/intra/erp/hr/talent" },
                            { name: "Pipeline", href: "/intra/erp/hr/talent/pipeline" },
                            { name: "Programs", href: "/intra/erp/hr/talent/programs" },
                        ],
                    },
                ],
            },
            {
                label: "FINANCE · CFO",
                items: [
                    {
                        name: "경비관리", href: "/intra/erp/finance/expenses", icon: CreditCard,
                        children: [
                            { name: "경비처리", href: "/intra/erp/finance/expenses" },
                            { name: "경비품의서", href: "/intra/erp/finance/expenses/request" },
                        ],
                    },
                    { name: "법인카드", href: "/intra/erp/finance/card", icon: Wallet },
                    { name: "경리리포트", href: "/intra/erp/finance/reports", icon: FileSpreadsheet },
                    {
                        name: "청구/지급", href: "/intra/erp/finance/billing", icon: CircleDollarSign,
                        children: [
                            { name: "청구관리", href: "/intra/erp/finance/billing" },
                            { name: "지급관리", href: "/intra/erp/finance/billing/payment" },
                        ],
                    },
                ],
            },
        ],
    },
    {
        name: "CMS", href: "/intra/cms", icon: FileText,
        sections: [
            {
                items: [
                    { name: "콘텐츠 관리", href: "/intra/cms", icon: FileText },
                    { name: "회사 일정", href: "/intra/cms/schedule", icon: Calendar },
                ],
            },
        ],
    },
];

export function IntraSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, hasAccess, logout } = useAuth();
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Auto-expand active module and items
    useEffect(() => {
        const newModules = new Set<string>();
        const newItems = new Set<string>();

        for (const mod of modules) {
            if (pathname.startsWith(mod.href)) {
                newModules.add(mod.name);
                for (const section of mod.sections) {
                    for (const item of section.items) {
                        if (item.children) {
                            const isChildActive = item.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));
                            if (isChildActive || pathname.startsWith(item.href)) {
                                newItems.add(item.name);
                            }
                        }
                    }
                }
            }
        }

        setExpandedModules(newModules);
        setExpandedItems(newItems);
    }, [pathname]);

    const toggleModule = (name: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const toggleItem = (name: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname === href || pathname.startsWith(href + '/');
    };

    // Filter modules by access
    const visibleModules = modules.filter(mod => {
        if (!mod.access) return true;
        return hasAccess(mod.access);
    });

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-neutral-900 text-white flex flex-col z-50">
            {/* Logo */}
            <div className="px-5 h-14 flex items-center border-b border-neutral-800 shrink-0">
                <Link href="/intra" className="text-lg font-bold tracking-wider text-white hover:opacity-80 transition-opacity">
                    TEN<span className="font-light">:</span>ONE
                </Link>
                <span className="ml-2 text-[9px] tracking-widest text-neutral-500 uppercase">Intra</span>
            </div>

            {/* Dashboard */}
            <div className="px-3 pt-3 pb-1">
                <Link href="/intra"
                    className={clsx(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded transition-all",
                        pathname === '/intra'
                            ? "bg-white/10 text-white font-medium"
                            : "text-neutral-400 hover:text-white hover:bg-white/5"
                    )}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                </Link>
            </div>

            {/* Modules */}
            <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
                {visibleModules.map(mod => {
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
                                )}>
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
                                            {section.items.map(item => (
                                                <div key={item.name}>
                                                    {item.children ? (
                                                        <>
                                                            <button
                                                                onClick={() => toggleItem(item.name)}
                                                                className={clsx(
                                                                    "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                                    isActive(item.href)
                                                                        ? "text-white font-medium"
                                                                        : "text-neutral-500 hover:text-white"
                                                                )}>
                                                                <item.icon className="h-3.5 w-3.5 shrink-0" />
                                                                <span className="flex-1 text-left">{item.name}</span>
                                                                {expandedItems.has(item.name)
                                                                    ? <ChevronDown className="h-2.5 w-2.5 text-neutral-600" />
                                                                    : <ChevronRight className="h-2.5 w-2.5 text-neutral-600" />
                                                                }
                                                            </button>
                                                            {expandedItems.has(item.name) && (
                                                                <div className="ml-5 space-y-0.5 mt-0.5">
                                                                    {item.children.map(child => (
                                                                        <Link key={child.href} href={child.href}
                                                                            className={clsx(
                                                                                "block px-3 py-1 text-[11px] rounded transition-all",
                                                                                isActive(child.href, true)
                                                                                    ? "text-white bg-white/10"
                                                                                    : "text-neutral-500 hover:text-neutral-300"
                                                                            )}>
                                                                            {child.name}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <Link href={item.href}
                                                            className={clsx(
                                                                "flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all",
                                                                isActive(item.href)
                                                                    ? "text-white font-medium bg-white/5"
                                                                    : "text-neutral-500 hover:text-white"
                                                            )}>
                                                            <item.icon className="h-3.5 w-3.5 shrink-0" />
                                                            {item.name}
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-neutral-800 shrink-0">
                <Link href="/"
                    className="flex items-center gap-3 px-6 py-2.5 text-xs text-neutral-500 hover:text-white transition-colors">
                    <Home className="h-3.5 w-3.5" />
                    Public Site
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
                        <button onClick={() => { logout(); router.push('/'); }}
                            className="p-1 text-neutral-600 hover:text-white transition-colors shrink-0" title="로그아웃">
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
