"use client";

import { useCrm } from "@/lib/crm-context";
import { Building2, Globe, Users } from "lucide-react";

const typeColor: Record<string, string> = { Partner: 'text-amber-400 bg-amber-500/10', Client: 'text-cyan-400 bg-cyan-500/10', Vendor: 'text-pink-400 bg-pink-500/10', Sponsor: 'text-emerald-400 bg-emerald-500/10' };

export default function OrganizationsPage() {
    const { organizations, getPersonById } = useCrm();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Organizations</h2>
                <p className="mt-2 text-zinc-400">파트너, 클라이언트, 스폰서 조직을 관리합니다.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {organizations.map(org => (
                    <div key={org.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-600 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-zinc-800 p-2"><Building2 className="h-5 w-5 text-zinc-400" /></div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">{org.name}</h3>
                                    {org.industry && <p className="text-xs text-zinc-500">{org.industry}</p>}
                                </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[org.type]}`}>{org.type}</span>
                        </div>
                        {org.notes && <p className="text-sm text-zinc-400 mt-3">{org.notes}</p>}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{org.contactIds.length} contacts</span>
                                {org.website && <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"><Globe className="h-3 w-3" />Website</a>}
                            </div>
                            <div className="flex gap-1">{org.brandAssociation.map(b => <span key={b} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{b}</span>)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
