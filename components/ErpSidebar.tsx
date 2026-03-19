"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Users,
    UserCheck, GitBranch, GraduationCap, DollarSign, Receipt,
    CreditCard, Settings, LogOut, ChevronDown, ChevronRight, Target,
    Upload, Tags, Contact,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/Logo";
import type { LucideIcon } from "lucide-react";

interface NavChild { name: string; href: string; }
interface NavItem { name: string; href: string; icon: LucideIcon; children?: NavChild[]; }
interface NavGroup { label?: string; items: NavItem[]; }

const navigationGroups: NavGroup[] = [
    {
        items: [
            { name: "Dashboard", href: "/intra/erp", icon: LayoutDashboard },
        ],
    },
    {
        label: "HR (HeRo)",
        items: [
            {
                name: "Staff", href: "/intra/erp/hr/staff", icon: UserCheck,
                children: [
                    { name: "Staff List", href: "/intra/erp/hr/staff" },
                    { name: "Register", href: "/intra/erp/hr/staff/register" },
                ],
            },
            {
                name: "GPR", href: "/intra/erp/hr/gpr", icon: Target,
                children: [
                    { name: "Dashboard", href: "/intra/erp/hr/gpr" },
                    { name: "Goal Setting", href: "/intra/erp/hr/gpr/goals" },
                    { name: "Evaluation", href: "/intra/erp/hr/gpr/evaluation" },
                ],
            },
            { name: "Talent Pool", href: "/intra/erp/hr/talent", icon: Users },
            { name: "Pipeline", href: "/intra/erp/hr/pipeline", icon: GitBranch },
            { name: "Programs", href: "/intra/erp/hr/programs", icon: GraduationCap },
        ],
    },
    {
        label: "FINANCE",
        items: [
            { name: "Revenue", href: "/intra/erp/finance/revenue", icon: DollarSign },
            { name: "Expenses", href: "/intra/erp/finance/expenses", icon: CreditCard },
            { name: "Invoices", href: "/intra/erp/finance/invoices", icon: Receipt },
        ],
    },
    {
        items: [
            { name: "Settings", href: "/intra/erp/settings", icon: Settings },
        ],
    },
];

export function ErpSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());

    useEffect(() => {
        const newOpen = new Set(openMenus);
        for (const group of navigationGroups) {
            for (const item of group.items) {
                if (item.children) {
                    const isChildActive = item.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));
                    if (isChildActive || pathname.startsWith(item.href)) newOpen.add(item.name);
                }
            }
        }
        if (newOpen.size !== openMenus.size || [...newOpen].some(v => !openMenus.has(v))) setOpenMenus(newOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const toggleMenu = (name: string) => {
        setOpenMenus(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
    };

    const isActive = (href: string) => pathname === href;
    const isParentActive = (item: NavItem) => {
        if (pathname === item.href) return true;
        if (item.children) return item.children.some(c => pathname === c.href || pathname.startsWith(c.href + '/'));
        return pathname.startsWith(item.href + '/');
    };

    return (
        <div className={clsx("flex h-full w-full flex-col bg-zinc-950 text-zinc-400 border-r border-zinc-800", className)}>
            <div className="flex h-16 items-center px-5 shrink-0 gap-3">
                <Logo variant="vertical" size="sm" />
                <Link href="/intra/erp" className="text-2xl font-bold text-white tracking-tight hover:text-indigo-400 transition-colors">
                    ERP
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {navigationGroups.map((group, gIdx) => (
                    <div key={gIdx}>
                        {group.label ? (
                            <div className="flex items-center gap-2 px-3 pt-5 pb-2">
                                <span className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">{group.label}</span>
                                <div className="flex-1 h-px bg-zinc-800/60" />
                            </div>
                        ) : gIdx > 0 ? <div className="my-2 mx-3 h-px bg-zinc-800/60" /> : null}

                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const hasChildren = item.children && item.children.length > 0;
                                const parentActive = isParentActive(item);
                                const isOpen = openMenus.has(item.name);
                                return (
                                    <div key={item.name}>
                                        {hasChildren ? (
                                            <button
                                                onClick={() => { toggleMenu(item.name); if (!isOpen) router.push(item.href); }}
                                                className={clsx(parentActive ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white", "group flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors")}
                                            >
                                                <div className="flex items-center">
                                                    <item.icon className={clsx(parentActive ? "text-indigo-500" : "text-zinc-500 group-hover:text-zinc-300", "mr-3 h-[18px] w-[18px]")} />
                                                    {item.name}
                                                </div>
                                                {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-zinc-500" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />}
                                            </button>
                                        ) : (
                                            <Link href={item.href} className={clsx(parentActive ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white", "group flex items-center rounded-md px-2.5 py-2 text-sm font-medium transition-colors")}>
                                                <item.icon className={clsx(parentActive ? "text-indigo-500" : "text-zinc-500 group-hover:text-zinc-300", "mr-3 h-[18px] w-[18px]")} />
                                                {item.name}
                                            </Link>
                                        )}
                                        {hasChildren && isOpen && (
                                            <div className="ml-5 mt-0.5 space-y-0.5 border-l border-zinc-800/60 pl-3">
                                                {item.children!.map(child => (
                                                    <Link key={child.href} href={child.href} className={clsx(isActive(child.href) ? "text-white bg-zinc-900/50" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30", "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors")}>
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

        </div>
    );
}
