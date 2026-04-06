"use client";

import { useState, useEffect } from "react";
import { fetchLeads, updateLead, createLead } from "@/lib/supabase/marketing";

import { Lead, LeadStage, LeadSource } from "@/types/marketing";
import { Loader2, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

const stages: { key: LeadStage; label: string }[] = [
    { key: 'New', label: 'New' },
    { key: 'Contacted', label: 'Contacted' },
    { key: 'Qualified', label: 'Qualified' },
    { key: 'Proposal', label: 'Proposal' },
    { key: 'Negotiation', label: 'Negotiation' },
    { key: 'Won', label: 'Won' },
    { key: 'Lost', label: 'Lost' },
];

const LEAD_SOURCES: LeadSource[] = ['Website', 'Referral', 'Event', 'SNS', 'Badak', 'MADLeague', 'Direct'];

const EMPTY_FORM = {
    name: '',
    company: '',
    email: '',
    phone: '',
    stage: 'New' as LeadStage,
    source: 'Website' as LeadSource,
    value: '',
    assignee: '',
    notes: '',
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [dragOver, setDragOver] = useState<LeadStage | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        let cancelled = false;
        fetchLeads()
            .then(data => {
                if (cancelled) return;
                setLeads(data);
            })
            .catch(() => {
                if (!cancelled) setLeads([]);
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    const moveLead = async (id: string, stage: LeadStage) => {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
        try { await updateLead(id, { stage }); } catch { /* local state already updated */ }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('text/plain', id); };
    const handleDrop = (e: React.DragEvent, stage: LeadStage) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData('text/plain'); if (id) moveLead(id, stage); };

    const handleCreate = async () => {
        if (!form.name.trim()) { setFormError('이름을 입력하세요.'); return; }
        if (!form.email.trim()) { setFormError('이메일을 입력하세요.'); return; }
        setSaving(true);
        setFormError('');
        try {
            const created = await createLead({
                name: form.name.trim(),
                company: form.company.trim() || undefined,
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                stage: form.stage,
                source: form.source,
                value: Number(form.value) || 0,
                assignee: form.assignee.trim(),
                notes: form.notes.trim() || undefined,
            });
            setLeads(prev => [created, ...prev]);
            setShowModal(false);
            setForm({ ...EMPTY_FORM });
        } catch {
            setFormError('저장에 실패했습니다. 다시 시도하세요.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <PageHeader title="Leads" description="리드 퍼널을 관리합니다." />
                <button
                    onClick={() => { setShowModal(true); setFormError(''); }}
                    className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 transition-colors mt-1"
                >
                    <Plus className="h-3.5 w-3.5" />
                    리드 등록
                </button>
            </div>
            <div className="grid grid-cols-7 gap-2 min-h-[500px]">
                {stages.map(stage => {
                    const stageLeads = leads.filter(l => l.stage === stage.key);
                    return (
                        <div key={stage.key}
                            className={`border bg-white p-2 transition-all ${dragOver === stage.key ? 'border-neutral-900' : 'border-neutral-200'}`}
                            onDrop={e => handleDrop(e, stage.key)} onDragOver={e => { e.preventDefault(); setDragOver(stage.key); }} onDragLeave={() => setDragOver(null)}>
                            <div className="flex items-center gap-1.5 mb-2 px-1">
                                <div className="h-2 w-2 rounded-full bg-neutral-400" />
                                <h3 className="text-[11px] font-semibold text-neutral-500">{stage.label}</h3>
                                <span className="text-xs text-neutral-300 ml-auto">{stageLeads.length}</span>
                            </div>
                            <div className="space-y-2">
                                {stageLeads.map(lead => (
                                    <div key={lead.id} draggable onDragStart={e => handleDragStart(e, lead.id)}
                                        className="border border-neutral-200 bg-white p-2.5 cursor-grab active:cursor-grabbing hover:border-neutral-400 transition-colors">
                                        <p className="text-xs font-medium">{lead.name}</p>
                                        {lead.company && <p className="text-xs text-neutral-400">{lead.company}</p>}
                                        <div className="flex justify-between mt-1.5">
                                            <span className="text-xs text-neutral-300">{lead.source}</span>
                                            <span className="text-xs text-neutral-500">₩{(lead.value / 10000).toLocaleString()}만</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 리드 등록 모달 */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md bg-white shadow-xl overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
                            <h2 className="text-sm font-semibold">리드 등록</h2>
                            <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-neutral-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* 이름 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">이름 *</label>
                                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="예: 홍길동" />
                            </div>
                            {/* 회사 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">회사</label>
                                <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="예: ABC Corp" />
                            </div>
                            {/* 이메일 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">이메일 *</label>
                                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="예: hong@example.com" />
                            </div>
                            {/* 전화 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">전화</label>
                                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="예: 010-1234-5678" />
                            </div>
                            {/* 단계 + 소스 */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">단계</label>
                                    <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value as LeadStage }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400">
                                        {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-600 mb-1">소스</label>
                                    <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value as LeadSource }))}
                                        className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400">
                                        {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* 예상 가치 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">예상 가치 (원)</label>
                                <input type="number" min="0" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="예: 10000000" />
                                {form.value && (
                                    <p className="mt-1 text-xs text-neutral-400">₩{Number(form.value).toLocaleString()} ({(Number(form.value) / 10000).toLocaleString()}만원)</p>
                                )}
                            </div>
                            {/* 담당자 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">담당자</label>
                                <input type="text" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400"
                                    placeholder="예: 이지수" />
                            </div>
                            {/* 메모 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-600 mb-1">메모</label>
                                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    rows={2}
                                    className="w-full border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-neutral-400 resize-none"
                                    placeholder="추가 정보" />
                            </div>

                            {formError && <p className="text-xs text-red-500">{formError}</p>}
                        </div>
                        <div className="flex justify-end gap-2 px-5 py-4 border-t border-neutral-100">
                            <button onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-xs text-neutral-500 border border-neutral-200 hover:bg-neutral-50">
                                취소
                            </button>
                            <button onClick={handleCreate} disabled={saving}
                                className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-50 transition-colors">
                                {saving ? '저장 중...' : '리드 등록'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
