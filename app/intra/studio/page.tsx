"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { brands } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { fetchPipelineItems } from "@/lib/supabase/workflow";
import type { PipelineItem } from "@/types/workflow";

export default function OfficeDashboard() {
    const [eventCount, setEventCount] = useState<number | null>(null);
    const [recentItems, setRecentItems] = useState<PipelineItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        Promise.all([
            supabase.from('comm_events').select('id', { count: 'exact', head: true })
                .gte('start_at', new Date().toISOString()),
            fetchPipelineItems(),
        ]).then(([evRes, items]) => {
            setEventCount(evRes.count ?? 0);
            setRecentItems(items.slice(0, 3));
        }).catch(() => {
            setEventCount(0);
            setRecentItems([]);
        }).finally(() => setLoading(false));
    }, []);

    const stats = [
        { name: "Active Brands", value: String(brands.length), icon: Users, change: "Registered", href: "/intra/studio/brands" },
        { name: "Upcoming Events", value: eventCount === null ? "…" : String(eventCount), icon: Calendar, change: "From now", href: "/intra/studio/schedule" },
        { name: "Content Items", value: loading ? "…" : String(recentItems.length > 0 ? "DB" : "–"), icon: FolderOpen, change: "In pipeline", href: "/intra/studio/studio" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-lg font-semibold tracking-tight text-neutral-900">Studio Dashboard</h1>
                <p className="text-sm text-neutral-400 mt-0.5">Ten:One™ 콘텐츠 제작 및 브랜드 관리</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="group border border-neutral-200 bg-white p-5 hover:border-neutral-400 transition-colors"
                    >
                        <p className="text-xs text-neutral-400">{item.name}</p>
                        <p className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">{item.value}</p>
                        <p className="mt-1.5 text-xs text-neutral-400">{item.change}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Status */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100">
                        <h3 className="text-sm font-semibold">System Status</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-3 border border-neutral-100 bg-neutral-50">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-neutral-900"></div>
                                <span className="text-sm">All Systems Operational</span>
                            </div>
                            <span className="text-xs text-neutral-400">Live</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 border border-neutral-100 flex justify-between items-center">
                                <span className="text-xs text-neutral-500">Brands</span>
                                <span className="text-xs font-semibold">{brands.length}</span>
                            </div>
                            <div className="p-3 border border-neutral-100 flex justify-between items-center">
                                <span className="text-xs text-neutral-500">Upcoming Events</span>
                                <span className="text-xs font-semibold">{eventCount === null ? "…" : eventCount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Pipeline */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Recent Pipeline</h3>
                        <Link href="/intra/studio/studio" className="text-xs text-neutral-400 hover:text-neutral-900 flex items-center gap-1">
                            전체보기 <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-neutral-300" />
                        </div>
                    ) : recentItems.length === 0 ? (
                        <p className="px-6 py-4 text-sm text-neutral-400">콘텐츠 없음</p>
                    ) : (
                        <ul className="divide-y divide-neutral-100">
                            {recentItems.map((item) => (
                                <li key={item.id} className="px-6 py-4 hover:bg-neutral-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{item.title}</p>
                                            <p className="text-xs text-neutral-400 mt-0.5">{item.type} · {item.brandId}</p>
                                        </div>
                                        <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5">{item.stage}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
