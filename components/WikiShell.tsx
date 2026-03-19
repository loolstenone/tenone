"use client";

import { useState, useEffect } from "react";
import { WikiSidebar } from "@/components/WikiSidebar";
import { Header } from "@/components/Header";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

export function WikiShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    useEffect(() => { setSidebarOpen(false); }, [pathname]);

    return (
        <div className="flex h-full">
            {/* Desktop Sidebar — 다크 유지 */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
                <WikiSidebar />
            </div>
            {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-neutral-950 transform transition-transform duration-300 ease-in-out md:hidden border-r border-neutral-800" style={{ transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
                <div className="flex justify-end p-4">
                    <button onClick={() => setSidebarOpen(false)} className="text-neutral-400 hover:text-white"><X className="h-6 w-6" /></button>
                </div>
                <WikiSidebar className="h-full" />
            </div>
            {/* Main Content — 라이트 */}
            <div className="flex flex-1 flex-col md:pl-64 h-full overflow-hidden bg-neutral-50 text-neutral-900">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
            </div>
        </div>
    );
}
