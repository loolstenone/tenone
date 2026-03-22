"use client";

import { useCrm } from "@/lib/crm-context";
import { Phone, Mail, Calendar, FileText, PartyPopper } from "lucide-react";

const typeIcon: Record<string, typeof Phone> = { Call: Phone, Email: Mail, Meeting: Calendar, Note: FileText, Event: PartyPopper };

export default function ActivitiesPage() {
    const { activities, getPersonById, getOrgById } = useCrm();
    const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Activities</h2>
                <p className="mt-2 text-neutral-500">미팅, 전화, 이메일 등 활동 기록을 관리합니다.</p>
            </div>

            <div className="space-y-3">
                {sorted.map(act => {
                    const Icon = typeIcon[act.type] ?? FileText;
                    const person = act.personId ? getPersonById(act.personId) : null;
                    const org = act.organizationId ? getOrgById(act.organizationId) : null;
                    return (
                        <div key={act.id} className="border border-neutral-200 bg-white p-4 hover:border-neutral-400 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="bg-neutral-100 p-2 shrink-0">
                                    <Icon className="h-4 w-4 text-neutral-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium">{act.title}</h3>
                                        <span className="text-xs text-neutral-400 shrink-0 ml-2">{act.date}</span>
                                    </div>
                                    {act.description && <p className="text-sm text-neutral-500 mt-1">{act.description}</p>}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                                        {person && <span>👤 {person.name}</span>}
                                        {org && <span>🏢 {org.name}</span>}
                                        <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{act.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
