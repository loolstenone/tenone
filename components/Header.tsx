"use client";

import { Bell, Search, Menu } from "lucide-react";

interface HeaderProps {
    onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    return (
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 md:px-6 shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="relative w-full max-w-sm md:max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search universe..."
                        className="h-9 w-full md:w-64 rounded-md border border-zinc-800 bg-zinc-900 pl-9 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 text-zinc-400 hover:text-white transition-colors">
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-zinc-950" />
                    <Bell className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
