"use client";

import Link from "next/link";
import { Users, Building2, Handshake, Activity, ArrowUpRight } from "lucide-react";
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
                <h2 className="text-2xl font-bold">ERP Dashboard</h2>
                <p className="mt-1 text-sm text-neutral-500">Ten:One™ 경영 관리 포털</p>
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
                        <div className="mt-4 text-sm font-medium text-neutral-900">{item.change}</div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Recent Activities</h3>
                        <Link href="/intra/erp/crm/activities" className="text-xs text-neutral-400 hover:text-neutral-900">View All</Link>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {recentActivities.map(act => (
                            <li key={act.id} className="px-6 py-3 hover:bg-neutral-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{act.type}</span>
                                        <span className="text-sm">{act.title}</span>
                                    </div>
                                    <span className="text-xs text-neutral-400">{act.date}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Deal Pipeline */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Deal Pipeline</h3>
                        <Link href="/intra/erp/crm/deals" className="text-xs text-neutral-400 hover:text-neutral-900">View All</Link>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {deals.slice(0, 5).map(deal => (
                            <li key={deal.id} className="px-6 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                                <div>
                                    <p className="text-sm font-medium">{deal.title}</p>
                                    <p className="text-xs text-neutral-400 mt-0.5">₩{deal.value.toLocaleString()}</p>
                                </div>
                                <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{deal.stage}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
