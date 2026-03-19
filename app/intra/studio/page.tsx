import { Users, Calendar, FolderOpen, ArrowUpRight, ArrowRight } from "lucide-react";
import Link from "next/link";

const stats = [
    { name: "Active Brands", value: "12", icon: Users, change: "+2", href: "/intra/studio/brands" },
    { name: "Upcoming Events", value: "5", icon: Calendar, change: "This Week", href: "/intra/studio/schedule" },
    { name: "New Assets", value: "128", icon: FolderOpen, change: "+24 today", href: "/intra/studio/assets" },
];

const recentActivity = [
    { id: 1, type: "Release", brand: "LUKI", content: "New Single 'Starlight'", date: "2h ago", status: "Completed" },
    { id: 2, type: "Upload", brand: "RooK", content: "Concept Art Batch #04", date: "5h ago", status: "Processing" },
    { id: 3, type: "Event", brand: "MADLeague", content: "Networking Night", date: "1d ago", status: "Scheduled" },
];

export default function OfficeDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold">Studio Dashboard</h2>
                <p className="mt-1 text-sm text-neutral-500">Ten:One™ 콘텐츠 제작 및 브랜드 관리</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="group border border-neutral-200 bg-white p-6 hover:border-neutral-900 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-500">{item.name}</p>
                                <p className="mt-2 text-3xl font-bold">{item.value}</p>
                            </div>
                            <div className="p-3 bg-neutral-100 text-neutral-400">
                                <item.icon className="h-5 w-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-neutral-400">
                            <span className="font-medium text-neutral-900 mr-2">{item.change}</span>
                            <span>vs last period</span>
                        </div>
                        <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                            <span className="text-xs text-neutral-400">Updated 1m ago</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 border border-neutral-100 flex justify-between items-center">
                                <span className="text-xs text-neutral-500">Core Sites</span>
                                <span className="text-xs font-semibold">8/8</span>
                            </div>
                            <div className="p-3 border border-neutral-100 flex justify-between items-center">
                                <span className="text-xs text-neutral-500">AI Agents</span>
                                <span className="text-xs font-semibold">2/2</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="border border-neutral-200 bg-white">
                    <div className="px-6 py-4 border-b border-neutral-100">
                        <h3 className="text-sm font-semibold">Recent Activity</h3>
                    </div>
                    <ul className="divide-y divide-neutral-100">
                        {recentActivity.map((activity) => (
                            <li key={activity.id} className="px-6 py-4 hover:bg-neutral-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{activity.brand}</span>
                                            <span className="text-neutral-300">·</span>
                                            <span className="text-neutral-600">{activity.type}</span>
                                        </div>
                                        <p className="text-sm text-neutral-500 mt-0.5">{activity.content}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-neutral-400">{activity.date}</p>
                                        <p className="text-xs mt-1 font-medium text-neutral-500">{activity.status}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
