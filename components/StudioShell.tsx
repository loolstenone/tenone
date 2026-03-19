"use client";

import { useState, useEffect } from "react";
import { StudioSidebar } from "@/components/StudioSidebar";
import { Header } from "@/components/Header";
import { usePathname } from "next/navigation";

export function StudioShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    useEffect(() => { setSidebarOpen(false); }, [pathname]);

    return (
        <div className="flex h-full flex h-full">
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
                <StudioSidebar />
            </div>
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-neutral-950 transform transition-transform duration-300 ease-in-out md:hidden border-r border-neutral-800" style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
                <StudioSidebar className="h-full" />
            </div>
            <div className="flex flex-1 flex-col md:pl-64 h-full overflow-hidden bg-neutral-50 text-neutral-900">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
            </div>
        </div>
    );
}
