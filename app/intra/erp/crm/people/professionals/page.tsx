"use client";

import { useCrm } from "@/lib/crm-context";

export default function ProfessionalsPage() {
    const { people } = useCrm();
    const pros = people.filter(p => p.type === 'Professional');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Professionals</h2>
                <p className="mt-2 text-zinc-400">Badak 네트워크 현업자 관리</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                        <th className="px-6 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Company</th><th className="px-4 py-3 text-left">Position</th><th className="px-4 py-3 text-left">Tags</th><th className="px-4 py-3 text-left">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {pros.map(p => (
                            <tr key={p.id} className="hover:bg-zinc-900/50">
                                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">{p.avatarInitials}</div><div><p className="text-sm font-medium text-white">{p.name}</p><p className="text-xs text-zinc-500">{p.email}</p></div></div></td>
                                <td className="px-4 py-4 text-sm text-zinc-400">{p.company}</td>
                                <td className="px-4 py-4 text-sm text-zinc-400">{p.position}</td>
                                <td className="px-4 py-4"><div className="flex gap-1 flex-wrap">{p.tags.slice(0, 2).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{t}</span>)}</div></td>
                                <td className="px-4 py-4"><span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>{p.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
