"use client";

import { useState } from "react";
import { useCrm } from "@/lib/crm-context";
import { DealStage } from "@/types/crm";

const stages: { key: DealStage; label: string }[] = [
    { key: 'Lead', label: 'Lead' },
    { key: 'Contacted', label: 'Contacted' },
    { key: 'Proposal', label: 'Proposal' },
    { key: 'Negotiation', label: 'Negotiation' },
    { key: 'Won', label: 'Won' },
    { key: 'Lost', label: 'Lost' },
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
                <h2 className="text-xl font-bold">Deals</h2>
                <p className="mt-2 text-neutral-500">영업 파이프라인을 관리합니다.</p>
            </div>

            <div className="grid grid-cols-6 gap-3 min-h-[500px]">
                {stages.map(stage => {
                    const stageDeals = deals.filter(d => d.stage === stage.key);
                    const total = stageDeals.reduce((s, d) => s + d.value, 0);
                    return (
                        <div key={stage.key}
                            className={`border bg-white p-3 transition-all ${dragOver === stage.key ? 'border-neutral-900' : 'border-neutral-200'}`}
                            onDrop={e => handleDrop(e, stage.key)} onDragOver={e => handleDragOver(e, stage.key)} onDragLeave={() => setDragOver(null)}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-neutral-400" />
                                    <h3 className="text-xs font-semibold text-neutral-500">{stage.label}</h3>
                                </div>
                                <span className="text-xs text-neutral-300">{stageDeals.length}</span>
                            </div>
                            {total > 0 && <p className="text-xs text-neutral-300 mb-2">₩{(total / 10000).toLocaleString()}만</p>}
                            <div className="space-y-2">
                                {stageDeals.map(deal => {
                                    const org = getOrgById(deal.organizationId);
                                    return (
                                        <div key={deal.id} draggable onDragStart={e => handleDragStart(e, deal.id)}
                                            className="border border-neutral-200 bg-white p-3 cursor-grab active:cursor-grabbing hover:border-neutral-400 transition-colors"
                                        >
                                            <p className="text-xs font-medium leading-tight">{deal.title}</p>
                                            <p className="text-xs text-neutral-400 mt-1">{org?.name ?? '-'}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs font-medium text-neutral-500">₩{deal.value.toLocaleString()}</span>
                                                {deal.expectedCloseDate && <span className="text-xs text-neutral-300">{deal.expectedCloseDate}</span>}
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
