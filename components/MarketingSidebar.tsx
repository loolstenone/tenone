"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Megaphone, TrendingUp, Building2, Handshake,
    Activity, FileText, BarChart3, Settings, LogOut, ChevronDown, ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/Logo";
import type { LucideIcon } from "lucide-react";

interface NavChild { name: string; href: string; }
interface NavItem { name: string; href: string; icon: LucideIcon; children?: NavChild[]; }
interface NavGroup { label?: string; items: NavItem[]; }

const navigationGroups: NavGroup[] = [
    { items: [{ name: "Dashboard", href: "/intra/marketing", icon: LayoutDashboard }] },
    {
        label: "MARKETING",
        items: [
            { name: "Campaigns", href: "/intra/marketing/campaigns", icon: Megaphone },
            { name: "Leads", href: "/intra/marketing/leads", icon: TrendingUp },
            { name: "Organizations", href: "/intra/marketing/organizations", icon: Building2 },
            { name: "Deals", href: "/intra/marketing/deals", icon: Handshake },
            { name: "Activities", href: "/intra/marketing/activities", icon: Activity },
            { name: "Content", href: "/intra/marketing/content", icon: FileText },
            { name: "Analytics", href: "/intra/marketing/analytics", icon: BarChart3 },
        ],
    },
    { items: [{ name: "Settings", href: "/intra/marketing/settings", icon: Settings }] },
];

export function MarketingSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const isActive = (href: string) => href === "/intra/marketing" ? pathname === "/intra/marketing" : pathname.startsWith(href);

    return (
        <div className={clsx("flex h-full w-full flex-col bg-zinc-950 text-zinc-400 border-r border-zinc-800", className)}>
            <div className="flex h-16 items-center px-5 shrink-0 gap-3">
                <Logo variant="vertical" size="sm" />
                <Link href="/intra/marketing" className="text-2xl font-bold text-white tracking-tight hover:text-indigo-400 transition-colors">Marketing</Link>
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
                            {group.items.map(item => (
                                <Link key={item.name} href={item.href} className={clsx(isActive(item.href) ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white", "group flex items-center rounded-md px-2.5 py-2 text-sm font-medium transition-colors")}>
                                    <item.icon className={clsx(isActive(item.href) ? "text-indigo-500" : "text-zinc-500 group-hover:text-zinc-300", "mr-3 h-[18px] w-[18px]")} />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">{user?.avatarInitials ?? 'U'}</div>
                        <div className="text-sm"><p className="text-white font-medium">{user?.name ?? 'User'}</p><p className="text-xs text-zinc-500">{user?.role ?? 'Viewer'}</p></div>
                    </div>
                    <button onClick={() => { logout(); window.location.href = '/'; }} className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors" title="Sign out">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
