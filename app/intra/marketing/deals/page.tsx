"use client";

import { useState, useEffect } from "react";
import { fetchDeals, updateDeal } from "@/lib/supabase/crm";
import { initialDeals, initialOrganizations } from "@/lib/crm-data";
import { fetchOrganizations } from "@/lib/supabase/crm";
import { Deal, DealStage, Organization } from "@/types/crm";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

const stages: { key: DealStage; label: string }[] = [
    { key: 'Lead', label: 'Lead' },
    { key: 'Contacted', label: 'Contacted' },
    { key: 'Proposal', label: 'Proposal' },
    { key: 'Negotiation', label: 'Negotiation' },
    { key: 'Won', label: 'Won' },
    { key: 'Lost', label: 'Lost' },
];

export default function DealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [dragOver, setDragOver] = useState<DealStage | null>(null);

    useEffect(() => {
        let cancelled = false;
        Promise.all([fetchDeals(), fetchOrganizations()])
            .then(([d, o]) => {
                if (cancelled) return;
                setDeals(d.length > 0 ? d : initialDeals);
                setOrgs(o.length > 0 ? o : initialOrganizations);
            })
            .catch(() => {
                if (!cancelled) { setDeals(initialDeals); setOrgs(initialOrganizations); }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const getOrgById = (id?: string) => orgs.find(o => o.id === id);

    const moveDeal = async (id: string, stage: DealStage) => {
        setDeals(prev => prev.map(d => d.id === id ? { ...d, stage } : d));
        try { await updateDeal(id, { stage }); } catch { /* local state already updated */ }
    };

    const handleDragStart = (e: React.DragEvent, dealId: string) => { e.dataTransfer.setData('text/plain', dealId); };
    const handleDrop = (e: React.DragEvent, stage: DealStage) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData('text/plain'); if (id) moveDeal(id, stage); };
    const handleDragOver = (e: React.DragEvent, stage: DealStage) => { e.preventDefault(); setDragOver(stage); };

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <PageHeader title="Deals" description="영업 파이프라인을 관리합니다." />

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
