"use client";

import { useState, useEffect } from "react";
import { fetchPeople } from "@/lib/supabase/crm";
import { initialPeople } from "@/lib/crm-data";
import { Person } from "@/types/crm";
import { Loader2 } from "lucide-react";

export default function MentorsPage() {
    const [mentors, setMentors] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchPeople({ type: 'Mentor', limit: 100 })
            .then(res => {
                if (cancelled) return;
                setMentors(res.people.length > 0 ? res.people : initialPeople.filter(p => p.type === 'Mentor'));
            })
            .catch(() => {
                if (!cancelled) setMentors(initialPeople.filter(p => p.type === 'Mentor'));
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold">Mentors</h2>
                <p className="mt-2 text-neutral-500">YouInOne 멘토단 관리</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mentors.map(m => (
                        <div key={m.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-400 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-sm font-bold">{m.avatarInitials}</div>
                                <div>
                                    <p className="text-sm font-semibold">{m.name}</p>
                                    <p className="text-xs text-neutral-400">{m.position}</p>
                                </div>
                            </div>
                            <p className="text-xs text-neutral-500">{m.company}</p>
                            <div className="flex gap-1 mt-3 flex-wrap">{m.tags.map(t => <span key={t} className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{t}</span>)}</div>
                            <p className="text-xs text-neutral-300 mt-3">Source: {m.source}</p>
                        </div>
                    ))}
                    {mentors.length === 0 && <p className="text-sm text-neutral-400 col-span-3">등록된 멘토가 없습니다.</p>}
                </div>
            )}
        </div>
    );
}
