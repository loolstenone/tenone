"use client";

import Link from "next/link";
import { useMarketing } from "@/lib/marketing-context";
import { Megaphone, TrendingUp, FileText, BarChart3, ArrowUpRight } from "lucide-react";

export default function MarketingDashboard() {
    const { campaigns, leads, contentPosts } = useMarketing();
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const activeLeads = leads.filter(l => !['Won', 'Lost'].includes(l.stage)).length;
    const publishedContent = contentPosts.filter(p => p.status === 'Published').length;

    const stats = [
        { name: "Active Campaigns", value: activeCampaigns, icon: Megaphone, href: "/intra/marketing/campaigns", color: "text-purple-500" },
        { name: "Active Leads", value: activeLeads, icon: TrendingUp, href: "/intra/marketing/leads", color: "text-amber-500" },
        { name: "Published Content", value: publishedContent, icon: FileText, href: "/intra/marketing/content", color: "text-emerald-500" },
        { name: "Total Leads", value: leads.length, icon: BarChart3, href: "/intra/marketing/analytics", color: "text-blue-500" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Marketing</h2>
                <p className="mt-2 text-zinc-400">Ten:One™ Universe 마케팅 포털</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(item => (
                    <Link key={item.name} href={item.href} className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-indigo-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-400">{item.name}</p>
                                <p className="mt-2 text-3xl font-bold text-white">{item.value}</p>
                            </div>
                            <div className={`rounded-full bg-zinc-800/50 p-3 ${item.color}`}><item.icon className="h-6 w-6" /></div>
                        </div>
                        <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
