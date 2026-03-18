"use client";

import Link from "next/link";
import { Users, Building2, Handshake, Activity, ArrowUpRight, UserCheck, DollarSign } from "lucide-react";
import { useCrm } from "@/lib/crm-context";

export default function ErpDashboard() {
    const { people, organizations, deals, activities } = useCrm();
    const activeDeals = deals.filter(d => !['Won', 'Lost'].includes(d.stage));
    const totalDealValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
    const recentActivities = [...activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

    const stats = [
        { name: "People", value: people.length, icon: Users, href: "/intra/erp/crm/people", change: `${people.filter(p => p.status === 'Active').length} Active` },
        { name: "Organizations", value: organizations.length, icon: Building2, href: "/intra/erp/crm/organizations", change: `${organizations.filter(o => o.status === 'Active').length} Active` },
        { name: "Active Deals", value: activeDeals.length, icon: Handshake, href: "/intra/erp/crm/deals", change: `₩${(totalDealValue / 10000).toLocaleString()}만` },
        { name: "Activities", value: activities.length, icon: Activity, href: "/intra/erp/crm/activities", change: "This month" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Ten:One™ ERP</h2>
                <p className="mt-2 text-zinc-400">Business Resource Planning for TenOne Universe.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(item => (
                    <Link key={item.name} href={item.href} className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-indigo-500/50 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-400">{item.name}</p>
                                <p className="mt-2 text-3xl font-bold text-white">{item.value}</p>
                            </div>
                            <div className="rounded-full bg-zinc-800/50 p-3 text-indigo-500">
                                <item.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-emerald-500 font-medium">{item.change}</div>
                        <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                    <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-white">Recent Activities</h3>
                        <Link href="/intra/erp/crm/activities" className="text-sm text-indigo-400 hover:text-indigo-300">View All</Link>
                    </div>
                    <ul className="divide-y divide-zinc-800/50">
                        {recentActivities.map(act => (
                            <li key={act.id} className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${
                                            act.type === 'Meeting' ? 'bg-blue-500/10 text-blue-400' :
                                            act.type === 'Email' ? 'bg-purple-500/10 text-purple-400' :
                                            act.type === 'Call' ? 'bg-emerald-500/10 text-emerald-400' :
                                            act.type === 'Event' ? 'bg-amber-500/10 text-amber-400' :
                                            'bg-zinc-800 text-zinc-400'
                                        }`}>{act.type}</span>
                                        <span className="text-sm text-white">{act.title}</span>
                                    </div>
                                    <span className="text-xs text-zinc-500">{act.date}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Deal Pipeline Summary */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                    <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-white">Deal Pipeline</h3>
                        <Link href="/intra/erp/crm/deals" className="text-sm text-indigo-400 hover:text-indigo-300">View All</Link>
                    </div>
                    <ul className="divide-y divide-zinc-800/50">
                        {deals.slice(0, 5).map(deal => (
                            <li key={deal.id} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white">{deal.title}</p>
                                    <p className="text-xs text-zinc-500 mt-1">₩{deal.value.toLocaleString()}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    deal.stage === 'Won' ? 'bg-emerald-500/10 text-emerald-400' :
                                    deal.stage === 'Lost' ? 'bg-red-500/10 text-red-400' :
                                    deal.stage === 'Negotiation' ? 'bg-amber-500/10 text-amber-400' :
                                    deal.stage === 'Proposal' ? 'bg-purple-500/10 text-purple-400' :
                                    'bg-zinc-800 text-zinc-400'
                                }`}>{deal.stage}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
