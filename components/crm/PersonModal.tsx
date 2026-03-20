"use client";

import { useState, useEffect } from "react";
import { Person, PersonType, PersonStatus } from "@/types/crm";
import { X } from "lucide-react";

interface PersonModalProps {
    person?: Person | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (person: Person) => void;
}

const types: PersonType[] = ['Student', 'Professional', 'Mentor', 'Partner', 'Client', 'Vendor', 'Other'];
const statuses: PersonStatus[] = ['Active', 'Lead', 'Inactive', 'Alumni'];

export function PersonModal({ person, isOpen, onClose, onSave }: PersonModalProps) {
    const [form, setForm] = useState({ name: '', email: '', phone: '', type: 'Student' as PersonType, status: 'Active' as PersonStatus, company: '', position: '', source: '', cohort: '', tags: '', notes: '' });

    useEffect(() => {
        if (person) setForm({ name: person.name, email: person.email, phone: person.phone ?? '', type: person.type, status: person.status, company: person.company ?? '', position: person.position ?? '', source: person.source, cohort: person.cohort ?? '', tags: person.tags.join(', '), notes: person.notes ?? '' });
        else setForm({ name: '', email: '', phone: '', type: 'Student', status: 'Active', company: '', position: '', source: '', cohort: '', tags: '', notes: '' });
    }, [person, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const initials = form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        onSave({
            id: person?.id ?? `p${Date.now()}`,
            name: form.name, email: form.email, phone: form.phone || undefined,
            type: form.type, status: form.status, company: form.company || undefined,
            position: form.position || undefined, avatarInitials: person?.avatarInitials ?? initials,
            brandAssociation: person?.brandAssociation ?? [], tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            source: form.source, cohort: form.cohort || undefined, createdAt: person?.createdAt ?? new Date().toISOString().split('T')[0],
            notes: form.notes || undefined,
        });
        onClose();
    };

    const inputClass = "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";
    const labelClass = "block text-sm text-neutral-500 mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl mx-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900">{person ? 'Edit Contact' : 'New Contact'}</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className={inputClass} /></div>
                        <div><label className={labelClass}>Email *</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Type</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value as PersonType})} className={inputClass}>{types.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label className={labelClass}>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value as PersonStatus})} className={inputClass}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Company</label><input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className={inputClass} /></div>
                        <div><label className={labelClass}>Position</label><input value={form.position} onChange={e => setForm({...form, position: e.target.value})} className={inputClass} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={labelClass}>Source</label><input value={form.source} onChange={e => setForm({...form, source: e.target.value})} placeholder="MADLeap, Badak, Referral..." className={inputClass} /></div>
                        <div><label className={labelClass}>Cohort</label><input value={form.cohort} onChange={e => setForm({...form, cohort: e.target.value})} placeholder="MADLeap 5기" className={inputClass} /></div>
                    </div>
                    <div><label className={labelClass}>Tags (comma separated)</label><input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className={inputClass} /></div>
                    <div><label className={labelClass}>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className={`${inputClass} resize-none`} /></div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-neutral-500 hover:text-neutral-900">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800">
                            {person ? 'Save Changes' : 'Create Contact'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
