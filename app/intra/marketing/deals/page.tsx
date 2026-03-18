"use client";

import { useState } from "react";
import { useCrm } from "@/lib/crm-context";
import { DealStage } from "@/types/crm";

const stages: { key: DealStage; label: string; color: string; dotColor: string }[] = [
    { key: 'Lead', label: 'Lead', color: 'text-zinc-400', dotColor: 'bg-zinc-500' },
    { key: 'Contacted', label: 'Contacted', color: 'text-blue-400', dotColor: 'bg-blue-500' },
    { key: 'Proposal', label: 'Proposal', color: 'text-purple-400', dotColor: 'bg-purple-500' },
    { key: 'Negotiation', label: 'Negotiation', color: 'text-amber-400', dotColor: 'bg-amber-500' },
    { key: 'Won', label: 'Won', color: 'text-emerald-400', dotColor: 'bg-emerald-500' },
    { key: 'Lost', label: 'Lost', color: 'text-red-400', dotColor: 'bg-red-500' },
];

export default function DealsPage() {
    const { deals, moveDeal, getOrgById } = useCrm();
    const [dragOver, setDragOver] = useState<DealStage | null>(null);

    const handleDragStart = (e: React.DragEvent, dealId: string) => { e.dataTransfer.setData('text/plain', dealId); };
    const handleDrop = (e: React.DragEvent, stage: DealStage) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData('text/plain'); if (id) moveDeal(id, stage); };
    const handleDragOver = (e: React.DragEvent, stage: DealStage) => { e.preventDefault(); setDragOver(stage); };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Deals</h2>
                <p className="mt-2 text-zinc-400">영업 파이프라인을 관리합니다.</p>
            </div>

            <div className="grid grid-cols-6 gap-3 min-h-[500px]">
                {stages.map(stage => {
                    const stageDeals = deals.filter(d => d.stage === stage.key);
                    const total = stageDeals.reduce((s, d) => s + d.value, 0);
                    return (
                        <div key={stage.key}
                            className={`rounded-xl border bg-zinc-900/30 p-3 transition-all ${dragOver === stage.key ? 'border-indigo-500/50' : 'border-zinc-800'}`}
                            onDrop={e => handleDrop(e, stage.key)} onDragOver={e => handleDragOver(e, stage.key)} onDragLeave={() => setDragOver(null)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${stage.dotColor}`} />
                                    <h3 className={`text-xs font-semibold ${stage.color}`}>{stage.label}</h3>
                                </div>
                                <span className="text-[10px] text-zinc-600">{stageDeals.length}</span>
                            </div>
                            {total > 0 && <p className="text-[10px] text-zinc-600 mb-2">₩{(total / 10000).toLocaleString()}만</p>}
                            <div className="space-y-2">
                                {stageDeals.map(deal => {
                                    const org = getOrgById(deal.organizationId);
                                    return (
                                        <div key={deal.id} draggable onDragStart={e => handleDragStart(e, deal.id)}
                                            className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3 cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors"
                                        >
                                            <p className="text-xs font-medium text-white leading-tight">{deal.title}</p>
                                            <p className="text-[10px] text-zinc-500 mt-1">{org?.name ?? '-'}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs font-medium text-indigo-400">₩{deal.value.toLocaleString()}</span>
                                                {deal.expectedCloseDate && <span className="text-[10px] text-zinc-600">{deal.expectedCloseDate}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
