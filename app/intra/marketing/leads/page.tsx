"use client";

import { useState } from "react";
import { useMarketing } from "@/lib/marketing-context";
import { LeadStage } from "@/types/marketing";

const stages: { key: LeadStage; label: string; color: string; dot: string }[] = [
    { key: 'New', label: 'New', color: 'text-zinc-400', dot: 'bg-zinc-500' },
    { key: 'Contacted', label: 'Contacted', color: 'text-blue-400', dot: 'bg-blue-500' },
    { key: 'Qualified', label: 'Qualified', color: 'text-cyan-400', dot: 'bg-cyan-500' },
    { key: 'Proposal', label: 'Proposal', color: 'text-purple-400', dot: 'bg-purple-500' },
    { key: 'Negotiation', label: 'Negotiation', color: 'text-amber-400', dot: 'bg-amber-500' },
    { key: 'Won', label: 'Won', color: 'text-emerald-400', dot: 'bg-emerald-500' },
    { key: 'Lost', label: 'Lost', color: 'text-red-400', dot: 'bg-red-500' },
];

export default function LeadsPage() {
    const { leads, moveLead } = useMarketing();
    const [dragOver, setDragOver] = useState<LeadStage | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('text/plain', id); };
    const handleDrop = (e: React.DragEvent, stage: LeadStage) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData('text/plain'); if (id) moveLead(id, stage); };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Leads</h2>
                <p className="mt-2 text-zinc-400">리드 퍼널을 관리합니다.</p>
            </div>
            <div className="grid grid-cols-7 gap-2 min-h-[500px]">
                {stages.map(stage => {
                    const stageLeads = leads.filter(l => l.stage === stage.key);
                    return (
                        <div key={stage.key}
                            className={`rounded-xl border bg-zinc-900/30 p-2 transition-all ${dragOver === stage.key ? 'border-indigo-500/50' : 'border-zinc-800'}`}
                            onDrop={e => handleDrop(e, stage.key)} onDragOver={e => { e.preventDefault(); setDragOver(stage.key); }} onDragLeave={() => setDragOver(null)}>
                            <div className="flex items-center gap-1.5 mb-2 px-1">
                                <div className={`h-2 w-2 rounded-full ${stage.dot}`} />
                                <h3 className={`text-[11px] font-semibold ${stage.color}`}>{stage.label}</h3>
                                <span className="text-[10px] text-zinc-600 ml-auto">{stageLeads.length}</span>
                            </div>
                            <div className="space-y-2">
                                {stageLeads.map(lead => (
                                    <div key={lead.id} draggable onDragStart={e => handleDragStart(e, lead.id)}
                                        className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-2.5 cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors">
                                        <p className="text-xs font-medium text-white">{lead.name}</p>
                                        {lead.company && <p className="text-[10px] text-zinc-500">{lead.company}</p>}
                                        <div className="flex justify-between mt-1.5">
                                            <span className="text-[10px] text-zinc-600">{lead.source}</span>
                                            <span className="text-[10px] text-indigo-400">₩{(lead.value / 10000).toLocaleString()}만</span>
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
