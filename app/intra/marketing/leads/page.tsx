"use client";

import { useState, useEffect } from "react";
import { fetchLeads, updateLead } from "@/lib/supabase/marketing";
import { initialLeads } from "@/lib/marketing-data";
import { Lead, LeadStage } from "@/types/marketing";
import { Loader2 } from "lucide-react";

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
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [dragOver, setDragOver] = useState<LeadStage | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetchLeads()
            .then(data => {
                if (cancelled) return;
                setLeads(data.length > 0 ? data : initialLeads);
            })
            .catch(() => {
                if (!cancelled) setLeads(initialLeads);
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const moveLead = async (id: string, stage: LeadStage) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
        try { await updateLead(id, { stage }); } catch { /* local state already updated */ }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('text/plain', id); };
    const handleDrop = (e: React.DragEvent, stage: LeadStage) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData('text/plain'); if (id) moveLead(id, stage); };

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-lg font-semibold tracking-tight text-neutral-900">Leads</h1>
                <p className="text-sm text-neutral-400 mt-0.5">리드 퍼널을 관리합니다.</p>
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
                                <span className="text-xs text-neutral-300 ml-auto">{stageLeads.length}</span>
                            </div>
                            <div className="space-y-2">
                                {stageLeads.map(lead => (
                                    <div key={lead.id} draggable onDragStart={e => handleDragStart(e, lead.id)}
                                        className="border border-neutral-200 bg-white p-2.5 cursor-grab active:cursor-grabbing hover:border-neutral-400 transition-colors">
                                        <p className="text-xs font-medium">{lead.name}</p>
                                        {lead.company && <p className="text-xs text-neutral-400">{lead.company}</p>}
                                        <div className="flex justify-between mt-1.5">
                                            <span className="text-xs text-neutral-300">{lead.source}</span>
                                            <span className="text-xs text-neutral-500">₩{(lead.value / 10000).toLocaleString()}만</span>
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
