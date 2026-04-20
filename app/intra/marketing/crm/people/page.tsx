"use client";

import { useState, useEffect } from "react";
import { fetchPeople, createPerson, updatePerson as updatePersonDb } from "@/lib/supabase/crm";
import Link from "next/link";

import { PersonModal } from "@/components/crm/PersonModal";
import { Person } from "@/types/crm";
import { Plus, Search, Filter, Loader2, ExternalLink } from "lucide-react";
import { PageHeader, PrimaryButton } from "@/components/intra/IntraUI";

const LIFECYCLE_MAP: Record<string, { label: string; color: string }> = {
    lead:     { label: '리드',   color: 'bg-neutral-100 text-neutral-600' },
    mql:      { label: 'MQL',    color: 'bg-blue-100 text-blue-700' },
    sql:      { label: 'SQL',    color: 'bg-indigo-100 text-indigo-700' },
    customer: { label: '고객',   color: 'bg-emerald-100 text-emerald-700' },
    churned:  { label: '이탈',   color: 'bg-amber-100 text-amber-700' },
    archived: { label: '보관',   color: 'bg-neutral-200 text-neutral-500' },
};

export default function PeoplePage() {
    const [people, setPeople] = useState<Person[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [lifecycleFilter, setLifecycleFilter] = useState('all');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Person | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchPeople({ limit: 200 })
            .then(res => {
                if (cancelled) return;
                setPeople(res.people);
            })
            .catch(() => {
                if (!cancelled) setPeople([]);
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const filtered = people.filter(p => {
        if (typeFilter !== 'all' && p.type !== typeFilter) return false;
        if (statusFilter !== 'all' && p.status !== statusFilter) return false;
        if (lifecycleFilter !== 'all' && p.lifecycleStage !== lifecycleFilter) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.email.toLowerCase().includes(search.toLowerCase()) && !(p.company ?? '').toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };
    const toggleAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map(p => p.id)));
    };
    const clearSelection = () => setSelected(new Set());

    const handleSave = async (person: Person) => {
        try {
            if (editingPerson) {
                const updated = await updatePersonDb(person.id, person);
                setPeople(prev => prev.map(p => p.id === updated.id ? updated : p));
            } else {
                const created = await createPerson({ ...person, brandId: 'tenone' });
                setPeople(prev => [created, ...prev]);
            }
        } catch {
            // DB 저장 실패 시 로컬 상태만 업데이트
            if (editingPerson) {
                setPeople(prev => prev.map(p => p.id === person.id ? person : p));
            } else {
                setPeople(prev => [{ ...person, id: crypto.randomUUID() }, ...prev]);
            }
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="People" description="TenOne Universe의 모든 연락처를 관리합니다.">
                <PrimaryButton onClick={() => { setEditingPerson(null); setIsModalOpen(true); }}><Plus className="h-4 w-4" /> New Contact</PrimaryButton>
            </PageHeader>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, company..." className="w-full border border-neutral-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-neutral-900 focus:outline-none" />
                </div>
                <Filter className="h-4 w-4 text-neutral-400" />
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none">
                    <option value="all">All Types</option>
                    <option value="Student">Student</option>
                    <option value="Professional">Professional</option>
                    <option value="Mentor">Mentor</option>
                    <option value="Partner">Partner</option>
                    <option value="Client">Client</option>
                    <option value="Vendor">Vendor</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none">
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Lead">Lead</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Alumni">Alumni</option>
                </select>
                <select value={lifecycleFilter} onChange={e => setLifecycleFilter(e.target.value)} className="border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none">
                    <option value="all">All Lifecycle</option>
                    {Object.entries(LIFECYCLE_MAP).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                </select>
            </div>

            {selected.size > 0 && (
                <div className="flex items-center justify-between bg-neutral-900 text-white px-4 py-2 text-xs">
                    <span>{selected.size}명 선택됨</span>
                    <div className="flex items-center gap-2">
                        <button className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded" disabled>메일 발송 (CRM 브로드캐스트 — Phase 5)</button>
                        <button onClick={clearSelection} className="px-2 py-1 hover:bg-white/20 rounded">해제</button>
                    </div>
                </div>
            )}

            <div className="border border-neutral-200 bg-white overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-neutral-200 text-xs text-neutral-500 uppercase tracking-wider">
                                <th className="px-3 py-3 w-8"><input type="checkbox" checked={selected.size > 0 && selected.size === filtered.length} onChange={toggleAll} /></th>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Lifecycle</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Company</th>
                                <th className="px-4 py-3 text-left">Source</th>
                                <th className="px-4 py-3 text-left">Last Touch</th>
                                <th className="px-2 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filtered.map(person => {
                                const ls = person.lifecycleStage ? LIFECYCLE_MAP[person.lifecycleStage] : null;
                                const lastTouch = person.lastTouchedAt ?? person.lastContacted;
                                return (
                                <tr key={person.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" checked={selected.has(person.id)} onChange={() => toggleSelect(person.id)} />
                                    </td>
                                    <td className="px-4 py-3 cursor-pointer" onClick={() => { setEditingPerson(person); setIsModalOpen(true); }}>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-xs font-bold text-white">{person.avatarInitials}</div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-sm font-medium">{person.name}</p>
                                                    {person.memberId && <span className="text-[9px] px-1 py-0.5 rounded bg-violet-100 text-violet-700">회원</span>}
                                                    {person.doNotEmail && <span className="text-[9px] px-1 py-0.5 rounded bg-red-100 text-red-700">메일 금지</span>}
                                                </div>
                                                <p className="text-xs text-neutral-400">{person.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {ls ? <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${ls.color}`}>{ls.label}</span> : <span className="text-xs text-neutral-300">-</span>}
                                    </td>
                                    <td className="px-4 py-3 text-xs font-medium text-neutral-600">{person.type}</td>
                                    <td className="px-4 py-3 text-sm text-neutral-500">{person.company ?? '-'}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-400">{person.source}</td>
                                    <td className="px-4 py-3 text-xs text-neutral-400">{lastTouch ? new Date(lastTouch).toLocaleDateString("ko-KR") : '-'}</td>
                                    <td className="px-2 py-3">
                                        <Link href={`/intra/marketing/crm/people/${person.id}`} className="inline-flex items-center p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded" title="상세">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </Link>
                                    </td>
                                </tr>
                            );})}
                        </tbody>
                    </table>
                )}
                {!loading && filtered.length === 0 && <div className="text-center py-12 text-neutral-400">No contacts found.</div>}
            </div>

            <PersonModal person={editingPerson} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingPerson(null); }} onSave={handleSave} />
        </div>
    );
}
