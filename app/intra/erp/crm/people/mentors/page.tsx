"use client";

import { useCrm } from "@/lib/crm-context";
import { UserCheck } from "lucide-react";

export default function MentorsPage() {
    const { people } = useCrm();
    const mentors = people.filter(p => p.type === 'Mentor');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Mentors</h2>
                <p className="mt-2 text-zinc-400">YouInOne 멘토단 관리</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mentors.map(m => (
                    <div key={m.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-600 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm font-bold">{m.avatarInitials}</div>
                            <div>
                                <p className="text-sm font-semibold text-white">{m.name}</p>
                                <p className="text-xs text-zinc-500">{m.position}</p>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-400">{m.company}</p>
                        <div className="flex gap-1 mt-3 flex-wrap">{m.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">{t}</span>)}</div>
                        <p className="text-xs text-zinc-600 mt-3">Source: {m.source}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
