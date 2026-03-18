import { Users, Calendar, FolderOpen, ArrowUpRight } from "lucide-react";
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
                <h2 className="text-3xl font-bold tracking-tight text-white">Ten:One™ Office</h2>
                <p className="mt-2 text-zinc-400">Integrated Management System for TenOne Ecosystem.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-indigo-500/50 transition-all"
                    >
                        <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-zinc-400">{item.name}</p>
                                <p className="mt-2 text-3xl font-bold text-white">{item.value}</p>
                            </div>
                            <div className="rounded-full bg-zinc-800/50 p-3 text-indigo-500">
                                <item.icon className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-zinc-500">
                            <span className="text-emerald-500 font-medium mr-2">{item.change}</span>
                            <span>vs last period</span>
                        </div>
                        <ArrowUpRight className="absolute top-4 right-4 h-5 w-5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Health Widget */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
                    <h3 className="text-lg font-medium text-white mb-4">System Status Monitor</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                <span className="text-sm font-medium text-zinc-200">All Systems Operational</span>
                            </div>
                            <span className="text-xs text-zinc-500">Updated 1m ago</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                                <span className="text-xs text-zinc-400">Core Sites</span>
                                <span className="text-xs font-bold text-emerald-500">8/8 Online</span>
                            </div>
                            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                                <span className="text-xs text-zinc-400">AI Agents</span>
                                <span className="text-xs font-bold text-emerald-500">2/2 Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
                    <div className="px-6 py-5 border-b border-zinc-800">
                        <h3 className="text-lg font-medium text-white">Recent Activity</h3>
                    </div>
                    <ul role="list" className="divide-y divide-zinc-800/50">
                        {recentActivity.map((activity) => (
                            <li key={activity.id} className="px-6 py-4 hover:bg-zinc-900/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-indigo-400 font-medium">{activity.brand}</span>
                                            <span className="text-zinc-500">•</span>
                                            <span className="text-white font-medium">{activity.type}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mt-1">{activity.content}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-zinc-400">{activity.date}</p>
                                        <p className={`text-xs mt-1 font-medium ${activity.status === 'Completed' ? 'text-emerald-500' :
                                                activity.status === 'Processing' ? 'text-amber-500' : 'text-blue-500'
                                            }`}>
                                            {activity.status}
                                        </p>
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
