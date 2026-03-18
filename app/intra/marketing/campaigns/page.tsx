"use client";

import { useMarketing } from "@/lib/marketing-context";
import { Megaphone, DollarSign } from "lucide-react";

const statusColor: Record<string, string> = { Draft: 'bg-zinc-800 text-zinc-400', Active: 'bg-emerald-500/10 text-emerald-400', Paused: 'bg-amber-500/10 text-amber-400', Completed: 'bg-blue-500/10 text-blue-400' };
const typeColor: Record<string, string> = { Brand: 'text-purple-400', Product: 'text-blue-400', Event: 'text-amber-400', Content: 'text-emerald-400', Partnership: 'text-pink-400' };

export default function CampaignsPage() {
    const { campaigns } = useMarketing();
    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Campaigns</h2>
                <p className="mt-2 text-zinc-400">마케팅 캠페인을 관리합니다.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                    <p className="text-2xl font-bold text-white">{campaigns.filter(c => c.status === 'Active').length}</p>
                    <p className="text-xs text-emerald-400">Active</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                    <p className="text-2xl font-bold text-white">₩{(totalBudget / 10000).toLocaleString()}만</p>
                    <p className="text-xs text-zinc-500">총 예산</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
                    <p className="text-2xl font-bold text-white">₩{(totalSpent / 10000).toLocaleString()}만</p>
                    <p className="text-xs text-zinc-500">총 집행</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {campaigns.map(camp => {
                    const spendRate = camp.budget > 0 ? Math.round((camp.spent / camp.budget) * 100) : 0;
                    return (
                        <div key={camp.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-600 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{camp.name}</h3>
                                    <p className={`text-xs mt-0.5 ${typeColor[camp.type]}`}>{camp.type}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[camp.status]}`}>{camp.status}</span>
                            </div>
                            <p className="text-sm text-zinc-400">{camp.description}</p>
                            <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
                                <span>{camp.startDate}</span>
                                {camp.endDate && <><span>→</span><span>{camp.endDate}</span></>}
                                <span>·</span>
                                <span>{camp.assignee}</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <DollarSign className="h-3 w-3 text-zinc-600" />
                                <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${spendRate}%` }} />
                                </div>
                                <span className="text-[10px] text-zinc-500">₩{(camp.spent / 10000).toLocaleString()}만 / {(camp.budget / 10000).toLocaleString()}만</span>
                            </div>
                            <div className="flex gap-1 mt-3">{camp.channels.map(ch => <span key={ch} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{ch}</span>)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
