"use client";

import Link from "next/link";
import { useMarketing } from "@/lib/marketing-context";
import { Megaphone, TrendingUp, FileText, BarChart3 } from "lucide-react";

export default function MarketingDashboard() {
    const { campaigns, leads, contentPosts } = useMarketing();
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const activeLeads = leads.filter(l => !['Won', 'Lost'].includes(l.stage)).length;
    const publishedContent = contentPosts.filter(p => p.status === 'Published').length;

    const stats = [
        { name: "Active Campaigns", value: activeCampaigns, icon: Megaphone, href: "/intra/marketing/campaigns" },
        { name: "Active Leads", value: activeLeads, icon: TrendingUp, href: "/intra/marketing/leads" },
        { name: "Published Content", value: publishedContent, icon: FileText, href: "/intra/marketing/content" },
        { name: "Total Leads", value: leads.length, icon: BarChart3, href: "/intra/marketing/analytics" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Marketing Dashboard</h2>
                <p className="mt-1 text-sm text-neutral-500">Ten:One™ 마케팅 포털</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(item => (
                    <Link key={item.name} href={item.href} className="group border border-neutral-200 bg-white p-6 hover:border-neutral-900 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500">{item.name}</p>
                                <p className="mt-2 text-3xl font-bold">{item.value}</p>
                            </div>
                            <div className="p-3 bg-neutral-100 text-neutral-400">
                                <item.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
