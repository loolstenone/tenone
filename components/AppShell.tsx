"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex h-full bg-black text-white">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 transform transition-transform duration-300 ease-in-out md:hidden border-r border-zinc-800",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex justify-end p-4 md:hidden">
                    <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <Sidebar className="h-full" />
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col md:pl-64 h-full overflow-hidden transition-all duration-300">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
