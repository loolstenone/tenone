"use client";

import { useState } from "react";
import { useMarketing } from "@/lib/marketing-context";
import { LeadStage } from "@/types/marketing";

const stages: { key: LeadStage; label: string }[] = [
    { key: 'New', label: 'New' },
    { key: 'Contacted', label: 'Contacted' },
    { key: 'Qualified', label: 'Qualified' },
    { key: 'Proposal', label: 'Proposal' },
    { key: 'Negotiation', label: 'Negotiation' },
    { key: 'Won', label: 'Won' },
    { key: 'Lost', label: 'Lost' },
];

export default function LeadsPage() {
    const { leads, moveLead } = useMarketing();
    const [dragOver, setDragOver] = useState<LeadStage | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('text/plain', id); };
    const handleDrop = (e: React.DragEvent, stage: LeadStage) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData('text/plain'); if (id) moveLead(id, stage); };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Leads</h2>
                <p className="mt-2 text-neutral-500">리드 퍼널을 관리합니다.</p>
            </div>
            <div className="grid grid-cols-7 gap-2 min-h-[500px]">
                {stages.map(stage => {
                    const stageLeads = leads.filter(l => l.stage === stage.key);
                    return (
                        <div key={stage.key}
                            className={`border bg-white p-2 transition-all ${dragOver === stage.key ? 'border-neutral-900' : 'border-neutral-200'}`}
                            onDrop={e => handleDrop(e, stage.key)} onDragOver={e => { e.preventDefault(); setDragOver(stage.key); }} onDragLeave={() => setDragOver(null)}>
                            <div className="flex items-center gap-1.5 mb-2 px-1">
                                <div className="h-2 w-2 rounded-full bg-neutral-400" />
                                <h3 className="text-[11px] font-semibold text-neutral-500">{stage.label}</h3>
                                <span className="text-[10px] text-neutral-300 ml-auto">{stageLeads.length}</span>
                            </div>
                            <div className="space-y-2">
                                {stageLeads.map(lead => (
                                    <div key={lead.id} draggable onDragStart={e => handleDragStart(e, lead.id)}
                                        className="border border-neutral-200 bg-white p-2.5 cursor-grab active:cursor-grabbing hover:border-neutral-400 transition-colors">
                                        <p className="text-xs font-medium">{lead.name}</p>
                                        {lead.company && <p className="text-[10px] text-neutral-400">{lead.company}</p>}
                                        <div className="flex justify-between mt-1.5">
                                            <span className="text-[10px] text-neutral-300">{lead.source}</span>
                                            <span className="text-[10px] text-neutral-500">₩{(lead.value / 10000).toLocaleString()}만</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
