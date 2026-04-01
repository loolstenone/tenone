"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchCampaigns, fetchLeads, fetchContentPosts } from "@/lib/supabase/marketing";
import { initialCampaigns, initialLeads, initialContentPosts } from "@/lib/marketing-data";
import { Campaign, Lead, ContentPost } from "@/types/marketing";
import { Megaphone, TrendingUp, FileText, BarChart3, Loader2 } from "lucide-react";

export default function MarketingDashboard() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [contentPosts, setContentPosts] = useState<ContentPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all([fetchCampaigns(), fetchLeads(), fetchContentPosts()])
            .then(([c, l, p]) => {
                if (cancelled) return;
                setCampaigns(c.length > 0 ? c : initialCampaigns);
                setLeads(l.length > 0 ? l : initialLeads);
                setContentPosts(p.length > 0 ? p : initialContentPosts);
            })
            .catch(() => {
                if (!cancelled) { setCampaigns(initialCampaigns); setLeads(initialLeads); setContentPosts(initialContentPosts); }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
    const activeLeads = leads.filter(l => !['Won', 'Lost'].includes(l.stage)).length;
    const publishedContent = contentPosts.filter(p => p.status === 'Published').length;

    const stats = [
        { name: "Active Campaigns", value: activeCampaigns, icon: Megaphone, href: "/intra/marketing/campaigns" },
        { name: "Active Leads", value: activeLeads, icon: TrendingUp, href: "/intra/marketing/leads" },
        { name: "Published Content", value: publishedContent, icon: FileText, href: "/intra/marketing/content" },
        { name: "Total Leads", value: leads.length, icon: BarChart3, href: "/intra/marketing/analytics" },
    ];

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold">Marketing Dashboard</h2>
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
