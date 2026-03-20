"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Megaphone, TrendingUp, Building2, Handshake,
    Activity, FileText, BarChart3, Settings, LogOut, ChevronDown, ChevronRight,
    Contact, Tags, Upload,
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
        label: "CRM",
        items: [
            { name: "Contacts", href: "/intra/marketing/crm/people", icon: Contact },
            { name: "Organizations", href: "/intra/marketing/organizations", icon: Building2 },
            { name: "Segments", href: "/intra/marketing/crm/segments", icon: Tags },
            { name: "Import", href: "/intra/marketing/crm/import", icon: Upload },
        ],
    },
    {
        label: "MARKETING",
        items: [
            { name: "Campaigns", href: "/intra/marketing/campaigns", icon: Megaphone },
            { name: "Leads", href: "/intra/marketing/leads", icon: TrendingUp },
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
        <div className={clsx("flex h-full w-full flex-col bg-neutral-50 text-neutral-600 border-r border-neutral-200", className)}>
            <div className="flex h-16 items-center px-5 shrink-0 gap-3 border-b border-neutral-100">
                <Link href="/intra/marketing" className="text-lg font-bold text-neutral-900 tracking-tight hover:text-neutral-600 transition-colors">Marketing</Link>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                {navigationGroups.map((group, gIdx) => (
                    <div key={gIdx}>
                        {group.label ? (
                            <div className="flex items-center gap-2 px-3 pt-5 pb-2">
                                <span className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">{group.label}</span>
                                <div className="flex-1 h-px bg-neutral-200" />
                            </div>
                        ) : gIdx > 0 ? <div className="my-2 mx-3 h-px bg-neutral-200" /> : null}
                        <div className="space-y-0.5">
                            {group.items.map(item => (
                                <Link key={item.name} href={item.href} className={clsx(isActive(item.href) ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900", "group flex items-center rounded-md px-2.5 py-2 text-sm font-medium transition-colors")}>
                                    <item.icon className={clsx(isActive(item.href) ? "text-white" : "text-neutral-400 group-hover:text-neutral-600", "mr-3 h-[18px] w-[18px]")} />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        </div>
    );
}
