"use client";

import { Bell, Search, Menu } from "lucide-react";

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6 shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-neutral-400 hover:text-neutral-900">
                    <Menu className="h-5 w-5" />
                </button>
                <div className="relative w-full max-w-sm md:max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <input type="text" placeholder="Search..."
                        className="h-9 w-full md:w-64 border border-neutral-200 bg-white pl-9 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none transition-all" />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-neutral-900 ring-2 ring-white" />
                    <Bell className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
