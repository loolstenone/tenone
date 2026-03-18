"use client";

import { useState } from "react";
import { useCrm } from "@/lib/crm-context";
import { PersonModal } from "@/components/crm/PersonModal";
import { Person } from "@/types/crm";
import { Plus, Search, Filter } from "lucide-react";

export default function PeoplePage() {
    const { people, addPerson, updatePerson } = useCrm();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);

    const filtered = people.filter(p => {
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.email.toLowerCase().includes(search.toLowerCase()) && !(p.company ?? '').toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleSave = (person: Person) => {
        if (editingPerson) updatePerson(person.id, person);
        else addPerson(person);
    };

    const statusColor: Record<string, string> = { Active: 'text-emerald-400 bg-emerald-500/10', Lead: 'text-amber-400 bg-amber-500/10', Inactive: 'text-zinc-400 bg-zinc-800', Alumni: 'text-blue-400 bg-blue-500/10' };
    const typeColor: Record<string, string> = { Student: 'text-blue-400', Professional: 'text-emerald-400', Mentor: 'text-purple-400', Partner: 'text-amber-400', Client: 'text-cyan-400', Vendor: 'text-pink-400', Other: 'text-zinc-400' };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">People</h2>
                    <p className="mt-2 text-zinc-400">TenOne Universe의 모든 연락처를 관리합니다.</p>
                </div>
                <button onClick={() => { setEditingPerson(null); setIsModalOpen(true); }} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                    <Plus className="h-4 w-4" /> New Contact
                </button>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, company..." className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                </div>
                <Filter className="h-4 w-4 text-zinc-500" />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
                    <option value="all">All Types</option>
                    <option value="Student">Student</option>
                    <option value="Professional">Professional</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Partner">Partner</option>
                    <option value="Client">Client</option>
                    <option value="Vendor">Vendor</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Lead">Lead</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Alumni">Alumni</option>
                </select>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                            <th className="px-6 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Type</th>
                            <th className="px-4 py-3 text-left">Company</th>
                            <th className="px-4 py-3 text-left">Source</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Last Contact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                        {filtered.map(person => (
                            <tr key={person.id} onClick={() => { setEditingPerson(person); setIsModalOpen(true); }} className="hover:bg-zinc-900/50 cursor-pointer transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">{person.avatarInitials}</div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{person.name}</p>
                                            <p className="text-xs text-zinc-500">{person.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className={`px-4 py-4 text-xs font-medium ${typeColor[person.type] ?? 'text-zinc-400'}`}>{person.type}</td>
                                <td className="px-4 py-4 text-sm text-zinc-400">{person.company ?? '-'}</td>
                                <td className="px-4 py-4 text-xs text-zinc-500">{person.source}</td>
                                <td className="px-4 py-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[person.status]}`}>{person.status}</span></td>
                                <td className="px-4 py-4 text-xs text-zinc-500">{person.lastContacted ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="text-center py-12 text-zinc-500">No contacts found.</div>}
            </div>

            <PersonModal person={editingPerson} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingPerson(null); }} onSave={handleSave} />
        </div>
    );
}
