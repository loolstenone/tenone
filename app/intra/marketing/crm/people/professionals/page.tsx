"use client";

import { useCrm } from "@/lib/crm-context";

export default function ProfessionalsPage() {
    const { people } = useCrm();
    const pros = people.filter(p => p.type === 'Professional');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Professionals</h2>
                <p className="mt-2 text-neutral-500">Badak 네트워크 현업자 관리</p>
            </div>
            <div className="border border-neutral-200 bg-white overflow-hidden">
                <table className="w-full">
                    <thead><tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
                        <th className="px-6 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Company</th><th className="px-4 py-3 text-left">Position</th><th className="px-4 py-3 text-left">Tags</th><th className="px-4 py-3 text-left">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-neutral-100">
                        {pros.map(p => (
                            <tr key={p.id} className="hover:bg-neutral-50">
                                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-xs font-bold">{p.avatarInitials}</div><div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-neutral-400">{p.email}</p></div></div></td>
                                <td className="px-4 py-4 text-sm text-neutral-500">{p.company}</td>
                                <td className="px-4 py-4 text-sm text-neutral-500">{p.position}</td>
                                <td className="px-4 py-4"><div className="flex gap-1 flex-wrap">{p.tags.slice(0, 2).map(t => <span key={t} className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500">{t}</span>)}</div></td>
                                <td className="px-4 py-4"><span className="text-xs px-1.5 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{p.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
