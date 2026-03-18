"use client";

import { useCrm } from "@/lib/crm-context";
import { Phone, Mail, Calendar, FileText, PartyPopper } from "lucide-react";

const typeIcon: Record<string, typeof Phone> = { Call: Phone, Email: Mail, Meeting: Calendar, Note: FileText, Event: PartyPopper };
const typeColor: Record<string, string> = { Meeting: 'bg-blue-500/10 text-blue-400', Email: 'bg-purple-500/10 text-purple-400', Call: 'bg-emerald-500/10 text-emerald-400', Event: 'bg-amber-500/10 text-amber-400', Note: 'bg-zinc-800 text-zinc-400' };

export default function ActivitiesPage() {
    const { activities, getPersonById, getOrgById } = useCrm();
    const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Activities</h2>
                <p className="mt-2 text-zinc-400">미팅, 전화, 이메일 등 활동 기록을 관리합니다.</p>
            </div>

            <div className="space-y-3">
                {sorted.map(act => {
                    const Icon = typeIcon[act.type] ?? FileText;
                    const person = act.personId ? getPersonById(act.personId) : null;
                    const org = act.organizationId ? getOrgById(act.organizationId) : null;
                    return (
                        <div key={act.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 hover:border-zinc-600 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`rounded-lg p-2 shrink-0 ${typeColor[act.type]}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-white">{act.title}</h3>
                                        <span className="text-xs text-zinc-500 shrink-0 ml-2">{act.date}</span>
                                    </div>
                                    {act.description && <p className="text-sm text-zinc-400 mt-1">{act.description}</p>}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                                        {person && <span>👤 {person.name}</span>}
                                        {org && <span>🏢 {org.name}</span>}
                                        <span className={`px-1.5 py-0.5 rounded ${typeColor[act.type]}`}>{act.type}</span>
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
