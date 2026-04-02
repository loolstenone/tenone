"use client";

import { useState, useEffect } from "react";
import { fetchPeople } from "@/lib/supabase/crm";
import { initialPeople } from "@/lib/crm-data";
import { Person } from "@/types/crm";
import { Loader2 } from "lucide-react";

export default function ProfessionalsPage() {
    const [pros, setPros] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchPeople({ type: 'Professional', limit: 100 })
            .then(res => {
                if (cancelled) return;
                setPros(res.people.length > 0 ? res.people : initialPeople.filter(p => p.type === 'Professional'));
            })
            .catch(() => {
                if (!cancelled) setPros(initialPeople.filter(p => p.type === 'Professional'));
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Professionals</h2>
                <p className="mt-0.5 text-sm text-neutral-400">Badak 네트워크 현업자 관리</p>
            </div>

            <div className="border border-neutral-200 bg-white overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Company</th>
                                <th className="px-4 py-3 text-left">Position</th>
                                <th className="px-4 py-3 text-left">Tags</th>
                                <th className="px-4 py-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {pros.map(p => (
                                <tr key={p.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-xs font-bold">{p.avatarInitials}</div>
                                            <div>
                                                <p className="text-sm font-medium">{p.name}</p>
                                                <p className="text-xs text-neutral-400">{p.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-neutral-500">{p.company}</td>
                                    <td className="px-4 py-4 text-sm text-neutral-500">{p.position}</td>
                                    <td className="px-4 py-4">
                                        <div className="flex gap-1 flex-wrap">
                                            {p.tags.slice(0, 2).map(t => <span key={t} className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{t}</span>)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{p.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {!loading && pros.length === 0 && <div className="text-center py-12 text-neutral-400">등록된 현업자가 없습니다.</div>}
            </div>
        </div>
    );
}
