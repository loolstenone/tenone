"use client";

import Link from "next/link";
import { Users, ClipboardList, Target, TrendingUp } from "lucide-react";
import { useStaff } from "@/lib/staff-context";
import { useGpr } from "@/lib/gpr-context";

export default function ErpDashboard() {
    const { staff } = useStaff();
    const { goals } = useGpr();

    const activeStaff = staff.filter(s => s.status === 'Active');
    const completedGoals = goals.filter(g => g.status === 'Completed');
    const pendingGoals = goals.filter(g => g.status === 'In Progress');

    const stats = [
        { name: "Staff", value: staff.length, icon: Users, href: "/intra/erp/hr/staff", change: `${activeStaff.length} Active` },
        { name: "Goals", value: goals.length, icon: Target, href: "/intra/erp/hr/gpr/goals", change: `${completedGoals.length} Completed` },
        { name: "In Progress", value: pendingGoals.length, icon: ClipboardList, href: "/intra/erp/hr/gpr/goals", change: `${pendingGoals.length} 진행 중` },
        { name: "GPR", value: `${Math.round((completedGoals.length / Math.max(goals.length, 1)) * 100)}%`, icon: TrendingUp, href: "/intra/erp/hr/gpr", change: "Goal completion rate" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold">ERP Dashboard</h2>
                <p className="mt-1 text-sm text-neutral-500">Ten:One™ HR 관리 포털</p>
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
                {/* Recent Staff */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Staff</h3>
                        <Link href="/intra/erp/hr/staff" className="text-xs text-neutral-400 hover:text-neutral-900">View All</Link>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {staff.slice(0, 5).map(staff => (
                            <li key={staff.id} className="px-6 py-3 hover:bg-neutral-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-medium text-neutral-500">
                                            {staff.name.slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{staff.name}</p>
                                            <p className="text-xs text-neutral-400">{staff.position}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{staff.status}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Goals */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Goals</h3>
                        <Link href="/intra/erp/hr/gpr/goals" className="text-xs text-neutral-400 hover:text-neutral-900">View All</Link>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {goals.slice(0, 5).map(goal => (
                            <li key={goal.id} className="px-6 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                                <div>
                                    <p className="text-sm font-medium">{goal.title}</p>
                                    <p className="text-xs text-neutral-400 mt-0.5">{goal.period}</p>
                                </div>
                                <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{goal.status}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
