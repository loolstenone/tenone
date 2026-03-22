"use client";

import { useMarketing } from "@/lib/marketing-context";
import { DollarSign } from "lucide-react";

export default function CampaignsPage() {
    const { campaigns } = useMarketing();
    const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Campaigns</h2>
                <p className="mt-1 text-sm text-neutral-500">마케팅 캠페인을 관리합니다.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="border border-neutral-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'Active').length}</p>
                    <p className="text-xs text-neutral-500">Active</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold">₩{(totalBudget / 10000).toLocaleString()}만</p>
                    <p className="text-xs text-neutral-500">총 예산</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4 text-center">
                    <p className="text-2xl font-bold">₩{(totalSpent / 10000).toLocaleString()}만</p>
                    <p className="text-xs text-neutral-500">총 집행</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {campaigns.map(camp => {
                    const spendRate = camp.budget > 0 ? Math.round((camp.spent / camp.budget) * 100) : 0;
                    return (
                        <div key={camp.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-400 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-semibold">{camp.name}</h3>
                                    <p className="text-xs mt-0.5 text-neutral-500">{camp.type}</p>
                                </div>
                                <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{camp.status}</span>
                            </div>
                            <p className="text-sm text-neutral-500">{camp.description}</p>
                            <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
                                <span>{camp.startDate}</span>
                                {camp.endDate && <><span>→</span><span>{camp.endDate}</span></>}
                                <span>·</span>
                                <span>{camp.assignee}</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <DollarSign className="h-3 w-3 text-neutral-300" />
                                <div className="flex-1 h-1.5 bg-neutral-100 overflow-hidden">
                                    <div className="h-full bg-neutral-900" style={{ width: `${spendRate}%` }} />
                                </div>
                                <span className="text-xs text-neutral-400">₩{(camp.spent / 10000).toLocaleString()}만 / {(camp.budget / 10000).toLocaleString()}만</span>
                            </div>
                            <div className="flex gap-1 mt-3">{camp.channels.map(ch => <span key={ch} className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{ch}</span>)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
