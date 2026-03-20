"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Compass, GraduationCap, FileText, HelpCircle, Settings, LogOut } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

const navigation = [
    { name: "Home", href: "/intra/wiki", icon: LayoutDashboard },
    { name: "Culture", href: "/intra/wiki/culture", icon: BookOpen },
    { name: "Onboarding", href: "/intra/wiki/onboarding", icon: Compass },
    { name: "Education", href: "/intra/wiki/education", icon: GraduationCap },
    { name: "Handbook", href: "/intra/wiki/handbook", icon: FileText },
    { name: "FAQ", href: "/intra/wiki/faq", icon: HelpCircle },
];

export function WikiSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const isActive = (href: string) => href === "/intra/wiki" ? pathname === "/intra/wiki" : pathname.startsWith(href);

    return (
        <div className={clsx("flex h-full w-full flex-col bg-neutral-50 text-neutral-600 border-r border-neutral-200", className)}>
            <div className="flex h-16 items-center px-5 shrink-0 gap-3 border-b border-neutral-100">
                <Link href="/intra/wiki" className="text-2xl font-bold text-neutral-900 tracking-tight hover:text-neutral-600 transition-colors">Wiki</Link>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navigation.map(item => (
                    <Link key={item.name} href={item.href} className={clsx(isActive(item.href) ? "bg-zinc-900 text-white" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white", "group flex items-center rounded-md px-2.5 py-2 text-sm font-medium transition-colors")}>
                        <item.icon className={clsx(isActive(item.href) ? "text-indigo-500" : "text-zinc-500 group-hover:text-zinc-300", "mr-3 h-[18px] w-[18px]")} />
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
