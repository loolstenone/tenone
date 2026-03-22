"use client";

import { useCrm } from "@/lib/crm-context";
import { Building2, Globe, Users } from "lucide-react";

export default function OrganizationsPage() {
    const { organizations, getPersonById } = useCrm();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Organizations</h2>
                <p className="mt-2 text-neutral-500">파트너, 클라이언트, 스폰서 조직을 관리합니다.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {organizations.map(org => (
                    <div key={org.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-400 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-neutral-100 p-2"><Building2 className="h-5 w-5 text-neutral-500" /></div>
                                <div>
                                    <h3 className="text-sm font-semibold">{org.name}</h3>
                                    {org.industry && <p className="text-xs text-neutral-400">{org.industry}</p>}
                                </div>
                            </div>
                            <span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{org.type}</span>
                        </div>
                        {org.notes && <p className="text-sm text-neutral-500 mt-3">{org.notes}</p>}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-200">
                            <div className="flex items-center gap-3 text-xs text-neutral-400">
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{org.contactIds.length} contacts</span>
                                {org.website && <a href={org.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900"><Globe className="h-3 w-3" />Website</a>}
                            </div>
                            <div className="flex gap-1">{org.brandAssociation.map(b => <span key={b} className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{b}</span>)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
