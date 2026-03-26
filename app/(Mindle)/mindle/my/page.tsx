"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { User, FileText, Bookmark, Bell, Settings, ArrowRight } from "lucide-react";

export default function MindleMyPage() {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="bg-[#0A0A0A] min-h-[60vh] flex items-center justify-center px-6">
                <div className="text-center">
                    <User className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <h2 className="text-white text-xl font-bold mb-2">Login Required</h2>
                    <p className="text-neutral-400 text-sm">Please log in to access your page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-16 px-6">
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-14 h-14 rounded-full bg-[#F5C518]/10 flex items-center justify-center">
                            <User className="w-7 h-7 text-[#F5C518]" />
                        </div>
                        <div>
                            <h1 className="text-white text-xl font-bold">{user?.name || "User"}</h1>
                            <p className="text-neutral-400 text-sm">{user?.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#F5C518]/20 transition-colors">
                            <Bookmark className="w-5 h-5 text-neutral-400 mb-2" />
                            <p className="text-white text-sm font-medium">Saved Trends</p>
                            <p className="text-neutral-500 text-xs mt-1">Bookmarked articles</p>
                        </div>
                        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#F5C518]/20 transition-colors">
                            <Bell className="w-5 h-5 text-neutral-400 mb-2" />
                            <p className="text-white text-sm font-medium">Notification Settings</p>
                            <p className="text-neutral-500 text-xs mt-1">Keyword alerts</p>
                        </div>
                        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#F5C518]/20 transition-colors">
                            <Settings className="w-5 h-5 text-neutral-400 mb-2" />
                            <p className="text-white text-sm font-medium">Interests</p>
                            <p className="text-neutral-500 text-xs mt-1">Personalized trend recommendations</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
