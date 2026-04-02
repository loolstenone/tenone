"use client";

import { useState, useEffect } from "react";
import { fetchActivities } from "@/lib/supabase/crm";
import { fetchPeople, fetchOrganizations } from "@/lib/supabase/crm";
import { initialActivities, initialPeople, initialOrganizations } from "@/lib/crm-data";
import { Activity, Person, Organization } from "@/types/crm";
import { Phone, Mail, Calendar, FileText, PartyPopper, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

const typeIcon: Record<string, typeof Phone> = { Call: Phone, Email: Mail, Meeting: Calendar, Note: FileText, Event: PartyPopper };

export default function ActivitiesPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all([fetchActivities(), fetchPeople(), fetchOrganizations()])
            .then(([acts, pRes, oRes]) => {
                if (cancelled) return;
                setActivities(acts.length > 0 ? acts : initialActivities);
                setPeople(pRes.people.length > 0 ? pRes.people : initialPeople);
                setOrgs(oRes.length > 0 ? oRes : initialOrganizations);
            })
            .catch(() => {
                if (!cancelled) { setActivities(initialActivities); setPeople(initialPeople); setOrgs(initialOrganizations); }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const getPersonById = (id?: string) => people.find(p => p.id === id);
    const getOrgById = (id?: string) => orgs.find(o => o.id === id);
    const sorted = [...activities].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="space-y-6">
            <PageHeader title="Activities" description="미팅, 전화, 이메일 등 활동 기록을 관리합니다." />

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
            ) : (
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
            )}
        </div>
    );
}
