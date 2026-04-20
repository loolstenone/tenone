"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, PrimaryButton } from "@/components/intra/IntraUI";
import { Plus, Users, Trash2, Edit3, X, Loader2, Eye, Filter } from "lucide-react";
import {
    FIELD_LABELS, OP_LABELS,
    type SegmentRules, type SegmentCondition, type SegmentOp,
} from "@/lib/crm-segments";

interface Segment {
    id: string;
    name: string;
    description: string | null;
    kind: 'dynamic' | 'static';
    rules: SegmentRules;
    color: string;
    last_computed_count: number | null;
    last_computed_at: string | null;
    created_at: string;
}

const FIELD_OPTIONS: { value: string; ops: SegmentOp[]; type: 'text'|'select'|'date'|'bool'|'array' }[] = [
    { value: 'lifecycle_stage', ops: ['eq','neq','in'], type: 'select' },
    { value: 'type',            ops: ['eq','neq','in'], type: 'select' },
    { value: 'status',          ops: ['eq','neq','in'], type: 'select' },
    { value: 'brand_id',        ops: ['eq','neq','in'], type: 'text' },
    { value: 'source',          ops: ['eq','contains'], type: 'text' },
    { value: 'do_not_email',    ops: ['eq'],            type: 'bool' },
    { value: 'do_not_contact',  ops: ['eq'],            type: 'bool' },
    { value: 'has_member',      ops: ['eq'],            type: 'bool' },
    { value: 'tags',            ops: ['overlaps'],      type: 'array' },
    { value: 'cohort',          ops: ['eq','contains'], type: 'text' },
    { value: 'company',         ops: ['contains','eq'], type: 'text' },
    { value: 'email',           ops: ['contains','eq'], type: 'text' },
    { value: 'created_at',      ops: ['gte','lte'],     type: 'date' },
    { value: 'last_touched_at', ops: ['gte','lte','is_null'], type: 'date' },
];

const SELECT_OPTIONS: Record<string, string[]> = {
    lifecycle_stage: ['lead','mql','sql','customer','churned','archived'],
    type:            ['Student','Professional','Mentor','Partner','Client','Vendor','Other'],
    status:          ['Active','Lead','Inactive','Alumni'],
};

export default function SegmentsPage() {
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<Segment> | null>(null);

    const load = useCallback(async () => {
        const supabase = createClient();
        const { data } = await supabase.from('crm_segments').select('*').order('created_at', { ascending: false });
        setSegments((data ?? []) as Segment[]);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    // 각 세그먼트 실시간 카운트
    const [counts, setCounts] = useState<Record<string, number>>({});
    useEffect(() => {
        segments.forEach(async seg => {
            if (!seg.rules?.conditions) return;
            try {
                const res = await fetch('/api/intra/crm/segments/preview', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rules: seg.rules, limit: 0 }),
                });
                const data = await res.json();
                if (res.ok) setCounts(prev => ({ ...prev, [seg.id]: data.count }));
            } catch { /* no-op */ }
        });
    }, [segments]);

    const handleDelete = async (id: string) => {
        if (!confirm('세그먼트를 삭제하시겠습니까?')) return;
        const supabase = createClient();
        await supabase.from('crm_segments').delete().eq('id', id);
        setSegments(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Segments" description="규칙 기반 동적 세그먼트 — 조건에 맞는 연락처를 실시간으로 집계합니다.">
                <PrimaryButton onClick={() => setEditing({ kind: 'dynamic', rules: { logic: 'and', conditions: [] }, color: '#171717' })}>
                    <Plus className="h-4 w-4" /> 새 세그먼트
                </PrimaryButton>
            </PageHeader>

            {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></div>
            ) : segments.length === 0 ? (
                <div className="border border-dashed border-neutral-300 py-16 text-center text-xs text-neutral-400">
                    아직 세그먼트가 없습니다.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {segments.map(seg => (
                        <div key={seg.id} className="border border-neutral-200 bg-white p-5 hover:border-neutral-400 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full" style={{ background: seg.color || '#171717' }} />
                                    <h3 className="text-sm font-semibold">{seg.name}</h3>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setEditing(seg)} className="p-1 text-neutral-400 hover:text-neutral-900 rounded"><Edit3 className="h-3 w-3" /></button>
                                    <button onClick={() => handleDelete(seg.id)} className="p-1 text-neutral-400 hover:text-red-500 rounded"><Trash2 className="h-3 w-3" /></button>
                                </div>
                            </div>
                            {seg.description && <p className="text-xs text-neutral-500 mb-3">{seg.description}</p>}
                            <div className="flex items-baseline gap-1 mb-3">
                                <Users className="h-3 w-3 text-neutral-400 self-center" />
                                <span className="text-2xl font-bold">{counts[seg.id] ?? '—'}</span>
                                <span className="text-[11px] text-neutral-400">명</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {seg.rules?.conditions?.slice(0, 3).map((c, i) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-neutral-50 border border-neutral-200 rounded">
                                        {FIELD_LABELS[c.field] || c.field} {OP_LABELS[c.op]} {String(c.value ?? '').slice(0, 12)}
                                    </span>
                                ))}
                                {seg.rules?.conditions && seg.rules.conditions.length > 3 && (
                                    <span className="text-[10px] px-1.5 py-0.5 text-neutral-400">+{seg.rules.conditions.length - 3}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && <SegmentBuilder segment={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
        </div>
    );
}

function SegmentBuilder({ segment, onClose, onSaved }:{
    segment: Partial<Segment>;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [name, setName] = useState(segment.name ?? '');
    const [description, setDescription] = useState(segment.description ?? '');
    const [color, setColor] = useState(segment.color ?? '#171717');
    const [rules, setRules] = useState<SegmentRules>(segment.rules ?? { logic: 'and', conditions: [] });
    const [preview, setPreview] = useState<{ count: number; sample: { id: string; name: string; email: string; lifecycle_stage: string }[] } | null>(null);
    const [previewing, setPreviewing] = useState(false);
    const [saving, setSaving] = useState(false);

    const updateCondition = (i: number, patch: Partial<SegmentCondition>) => {
        setRules(r => ({ ...r, conditions: r.conditions.map((c, j) => j === i ? { ...c, ...patch } : c) }));
    };
    const removeCondition = (i: number) => setRules(r => ({ ...r, conditions: r.conditions.filter((_, j) => j !== i) }));
    const addCondition = () => setRules(r => ({ ...r, conditions: [...r.conditions, { field: 'lifecycle_stage', op: 'eq' as SegmentOp, value: 'customer' }] }));

    const runPreview = async () => {
        setPreviewing(true);
        try {
            const res = await fetch('/api/intra/crm/segments/preview', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rules, limit: 10 }),
            });
            const data = await res.json();
            if (res.ok) setPreview(data);
            else alert(data.error || '미리보기 실패');
        } finally { setPreviewing(false); }
    };

    const save = async () => {
        if (!name.trim()) { alert('이름을 입력해주세요.'); return; }
        setSaving(true);
        const supabase = createClient();
        const payload = { name: name.trim(), description: description.trim() || null, rules, color, kind: 'dynamic' };
        if (segment.id) {
            await supabase.from('crm_segments').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', segment.id);
        } else {
            await supabase.from('crm_segments').insert(payload);
        }
        setSaving(false);
        onSaved();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-white shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col pointer-events-auto">
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold">{segment.id ? '세그먼트 수정' : '새 세그먼트'}</h2>
                        <button onClick={onClose}><X className="h-4 w-4" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-5">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <label className="text-[11px] text-neutral-500 block mb-1">이름</label>
                                <input value={name} onChange={e => setName(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                            </div>
                            <div>
                                <label className="text-[11px] text-neutral-500 block mb-1">색상</label>
                                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                                    className="w-full h-[38px] border border-neutral-200 rounded cursor-pointer" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] text-neutral-500 block mb-1">설명 (선택)</label>
                            <input value={description} onChange={e => setDescription(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:border-neutral-400" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium flex items-center gap-1.5"><Filter className="h-3 w-3" /> 조건</label>
                                <div className="inline-flex items-center gap-1 text-[11px] border border-neutral-200 rounded overflow-hidden">
                                    <button onClick={() => setRules(r => ({ ...r, logic: 'and' }))}
                                        className={`px-2 py-0.5 ${rules.logic === 'and' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500'}`}>모두 충족 (AND)</button>
                                    <button onClick={() => setRules(r => ({ ...r, logic: 'or' }))}
                                        className={`px-2 py-0.5 ${rules.logic === 'or' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-500'}`}>하나 이상 (OR)</button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {rules.conditions.map((c, i) => {
                                    const fOpt = FIELD_OPTIONS.find(f => f.value === c.field) ?? FIELD_OPTIONS[0];
                                    return (
                                        <div key={i} className="grid grid-cols-[1fr,100px,1fr,24px] gap-2 items-center">
                                            <select value={c.field} onChange={e => {
                                                const nf = FIELD_OPTIONS.find(f => f.value === e.target.value)!;
                                                updateCondition(i, { field: nf.value, op: nf.ops[0], value: '' });
                                            }} className="px-2 py-1.5 text-xs border border-neutral-200 rounded">
                                                {FIELD_OPTIONS.map(f => <option key={f.value} value={f.value}>{FIELD_LABELS[f.value] || f.value}</option>)}
                                            </select>
                                            <select value={c.op} onChange={e => updateCondition(i, { op: e.target.value as SegmentOp })}
                                                className="px-2 py-1.5 text-xs border border-neutral-200 rounded">
                                                {fOpt.ops.map(op => <option key={op} value={op}>{OP_LABELS[op]}</option>)}
                                            </select>
                                            {c.op === 'is_null' || c.op === 'is_not_null' ? (
                                                <div className="text-[11px] text-neutral-400 self-center">—</div>
                                            ) : fOpt.type === 'bool' ? (
                                                <select value={String(c.value)} onChange={e => updateCondition(i, { value: e.target.value === 'true' })}
                                                    className="px-2 py-1.5 text-xs border border-neutral-200 rounded">
                                                    <option value="true">Yes</option>
                                                    <option value="false">No</option>
                                                </select>
                                            ) : fOpt.type === 'select' ? (
                                                c.op === 'in' ? (
                                                    <input value={Array.isArray(c.value) ? c.value.join(',') : String(c.value ?? '')}
                                                        onChange={e => updateCondition(i, { value: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                                        placeholder="값1, 값2, ..." className="px-2 py-1.5 text-xs border border-neutral-200 rounded" />
                                                ) : (
                                                    <select value={String(c.value ?? '')} onChange={e => updateCondition(i, { value: e.target.value })}
                                                        className="px-2 py-1.5 text-xs border border-neutral-200 rounded">
                                                        {(SELECT_OPTIONS[c.field] || []).map(o => <option key={o} value={o}>{o}</option>)}
                                                    </select>
                                                )
                                            ) : fOpt.type === 'date' ? (
                                                <input value={String(c.value ?? '')} onChange={e => updateCondition(i, { value: e.target.value })}
                                                    placeholder="now-7d  또는  2026-01-01" className="px-2 py-1.5 text-xs border border-neutral-200 rounded" />
                                            ) : fOpt.type === 'array' ? (
                                                <input value={Array.isArray(c.value) ? c.value.join(',') : String(c.value ?? '')}
                                                    onChange={e => updateCondition(i, { value: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                                    placeholder="VIP, 초청, ..." className="px-2 py-1.5 text-xs border border-neutral-200 rounded" />
                                            ) : (
                                                <input value={String(c.value ?? '')} onChange={e => updateCondition(i, { value: e.target.value })}
                                                    className="px-2 py-1.5 text-xs border border-neutral-200 rounded" />
                                            )}
                                            <button onClick={() => removeCondition(i)} className="text-neutral-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                                        </div>
                                    );
                                })}
                                <button onClick={addCondition} className="w-full py-2 text-xs border border-dashed border-neutral-300 rounded hover:bg-neutral-50 text-neutral-500">
                                    + 조건 추가
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-medium">미리보기</h4>
                                <button onClick={runPreview} disabled={previewing || rules.conditions.length === 0}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-40">
                                    <Eye className="h-3 w-3" /> {previewing ? '집계 중...' : '미리보기 실행'}
                                </button>
                            </div>
                            {preview && (
                                <div className="space-y-2">
                                    <div className="p-3 bg-neutral-50 rounded flex items-center justify-between">
                                        <span className="text-xs text-neutral-500">매칭 수</span>
                                        <span className="text-xl font-bold">{preview.count}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></span>
                                    </div>
                                    {preview.sample.length > 0 && (
                                        <div className="border border-neutral-100 rounded divide-y divide-neutral-100 max-h-48 overflow-y-auto">
                                            {preview.sample.map(s => (
                                                <div key={s.id} className="px-3 py-1.5 flex items-center justify-between text-[11px]">
                                                    <span className="font-medium truncate flex-1">{s.name}</span>
                                                    <span className="text-neutral-400 truncate flex-1">{s.email}</span>
                                                    <span className="text-neutral-400 shrink-0">{s.lifecycle_stage}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-neutral-100 flex justify-end gap-2">
                        <button onClick={onClose} className="px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 rounded">취소</button>
                        <button onClick={save} disabled={saving} className="px-4 py-1.5 text-xs bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50">
                            {saving ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
