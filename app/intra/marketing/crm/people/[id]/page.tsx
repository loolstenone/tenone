"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";
import { Mail, Phone, Building2, Calendar, Clock, AlertCircle, Edit3, Save, X, Plus, ArrowLeft, Eye, MousePointerClick, Send } from "lucide-react";

interface PersonRow {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    type: string | null;
    status: string | null;
    company: string | null;
    position: string | null;
    tags: string[] | null;
    brand_association: string[] | null;
    source: string | null;
    notes: string | null;
    created_at: string;
    member_id: string | null;
    primary_brand_id: string | null;
    lifecycle_stage: string;
    last_touched_at: string | null;
    next_follow_up_at: string | null;
    contact_owner: string | null;
    source_detail: Record<string, unknown>;
    do_not_contact: boolean;
    do_not_email: boolean;
    lifetime_value: number | null;
}

interface TouchpointRow {
    id: string;
    type: string;
    subject: string | null;
    body: string | null;
    occurred_at: string;
    meta: Record<string, unknown>;
}

const LIFECYCLE_STAGES = [
    { value: 'lead',     label: '리드',      color: 'bg-neutral-100 text-neutral-600' },
    { value: 'mql',      label: 'MQL',       color: 'bg-blue-100 text-blue-700' },
    { value: 'sql',      label: 'SQL',       color: 'bg-indigo-100 text-indigo-700' },
    { value: 'customer', label: '고객',      color: 'bg-emerald-100 text-emerald-700' },
    { value: 'churned',  label: '이탈',      color: 'bg-amber-100 text-amber-700' },
    { value: 'archived', label: '보관',      color: 'bg-neutral-200 text-neutral-500' },
] as const;

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
    email_sent: Send,
    email_opened: Eye,
    email_clicked: MousePointerClick,
    meeting: Calendar,
    call: Phone,
    note: Edit3,
};

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [person, setPerson] = useState<PersonRow | null>(null);
    const [touchpoints, setTouchpoints] = useState<TouchpointRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [noteOpen, setNoteOpen] = useState(false);
    const [noteText, setNoteText] = useState("");

    const load = useCallback(async () => {
        const supabase = createClient();
        const [pRes, tRes] = await Promise.all([
            supabase.from("crm_people").select("*").eq("id", id).single(),
            supabase.from("crm_touchpoints").select("*").eq("person_id", id).order("occurred_at", { ascending: false }).limit(100),
        ]);
        if (pRes.data) setPerson(pRes.data as PersonRow);
        if (tRes.data) setTouchpoints(tRes.data as TouchpointRow[]);
        setLoading(false);
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async () => {
        if (!person) return;
        setSaving(true);
        const supabase = createClient();
        await supabase.from("crm_people").update({
            name: person.name,
            phone: person.phone,
            company: person.company,
            position: person.position,
            lifecycle_stage: person.lifecycle_stage,
            next_follow_up_at: person.next_follow_up_at,
            do_not_contact: person.do_not_contact,
            do_not_email: person.do_not_email,
            notes: person.notes,
            updated_at: new Date().toISOString(),
        }).eq("id", id);
        setSaving(false);
        setEditing(false);
    };

    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        const supabase = createClient();
        const { data } = await supabase.from("crm_touchpoints").insert({
            person_id: id,
            type: "note",
            body: noteText.trim(),
        }).select().single();
        if (data) setTouchpoints(prev => [data as TouchpointRow, ...prev]);
        await supabase.from("crm_people").update({ last_touched_at: new Date().toISOString() }).eq("id", id);
        setNoteText("");
        setNoteOpen(false);
    };

    if (loading) return <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>;
    if (!person) return <div className="text-center py-20 text-neutral-400 text-sm">연락처를 찾을 수 없습니다.</div>;

    const stage = LIFECYCLE_STAGES.find(s => s.value === person.lifecycle_stage) ?? LIFECYCLE_STAGES[0];

    return (
        <div>
            <div className="mb-4">
                <Link href="/intra/marketing/crm/people" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900">
                    <ArrowLeft className="h-3 w-3" /> People
                </Link>
            </div>
            <PageHeader title={person.name} description={person.email}>
                {editing ? (
                    <>
                        <button onClick={() => { setEditing(false); load(); }} className="px-3 py-1.5 text-xs border border-neutral-200 rounded hover:bg-neutral-50">취소</button>
                        <button onClick={handleSave} disabled={saving} className="px-3 py-1.5 text-xs bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-50 inline-flex items-center gap-1">
                            <Save className="h-3 w-3" /> {saving ? "저장 중..." : "저장"}
                        </button>
                    </>
                ) : (
                    <button onClick={() => setEditing(true)} className="px-3 py-1.5 text-xs border border-neutral-200 rounded hover:bg-neutral-50 inline-flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> 수정
                    </button>
                )}
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 왼쪽: 프로필 카드 */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="border border-neutral-200 bg-white p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`text-[11px] px-2 py-0.5 rounded ${stage.color}`}>{stage.label}</span>
                            {person.member_id && <span className="text-[11px] px-2 py-0.5 rounded bg-violet-100 text-violet-700">가입회원</span>}
                            {person.do_not_email && <span className="text-[11px] px-2 py-0.5 rounded bg-red-100 text-red-700">이메일 금지</span>}
                        </div>

                        {editing ? (
                            <input value={person.name} onChange={e => setPerson({ ...person, name: e.target.value })}
                                className="w-full px-2 py-1 text-base font-bold border border-neutral-200 rounded mb-2" />
                        ) : (
                            <h2 className="text-base font-bold mb-2">{person.name}</h2>
                        )}

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-neutral-400 shrink-0" />
                                <a href={`mailto:${person.email}`} className="text-neutral-700 hover:underline">{person.email}</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-neutral-400 shrink-0" />
                                {editing ? (
                                    <input value={person.phone || ''} onChange={e => setPerson({ ...person, phone: e.target.value || null })}
                                        placeholder="전화번호" className="flex-1 px-2 py-0.5 border border-neutral-200 rounded" />
                                ) : (
                                    <span className="text-neutral-700">{person.phone || '-'}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-3 w-3 text-neutral-400 shrink-0" />
                                {editing ? (
                                    <input value={person.company || ''} onChange={e => setPerson({ ...person, company: e.target.value || null })}
                                        placeholder="회사" className="flex-1 px-2 py-0.5 border border-neutral-200 rounded" />
                                ) : (
                                    <span className="text-neutral-700">{person.company || '-'}{person.position && ` · ${person.position}`}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-neutral-400 shrink-0" />
                                <span className="text-neutral-500">가입: {new Date(person.created_at).toLocaleDateString("ko-KR")}</span>
                            </div>
                            {person.last_touched_at && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 text-neutral-400 shrink-0" />
                                    <span className="text-neutral-500">마지막 접점: {new Date(person.last_touched_at).toLocaleDateString("ko-KR")}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border border-neutral-200 bg-white p-5">
                        <h3 className="text-xs font-semibold mb-3">라이프사이클</h3>
                        {editing ? (
                            <div className="flex flex-wrap gap-1.5">
                                {LIFECYCLE_STAGES.map(s => (
                                    <button key={s.value} onClick={() => setPerson({ ...person, lifecycle_stage: s.value })}
                                        className={`text-[11px] px-2 py-1 rounded ${person.lifecycle_stage === s.value ? s.color + ' font-semibold ring-1 ring-neutral-900' : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'}`}>
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                {LIFECYCLE_STAGES.filter(s => s.value !== 'archived' && s.value !== 'churned').map((s, i) => {
                                    const isActive = s.value === person.lifecycle_stage;
                                    const isPassed = LIFECYCLE_STAGES.findIndex(x => x.value === person.lifecycle_stage) >= i;
                                    return (
                                        <div key={s.value} className="flex-1 flex flex-col items-center">
                                            <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-neutral-900 ring-2 ring-neutral-200' : isPassed ? 'bg-neutral-900' : 'bg-neutral-200'}`} />
                                            <p className={`text-[10px] mt-1.5 ${isActive ? 'font-bold text-neutral-900' : 'text-neutral-400'}`}>{s.label}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="border border-neutral-200 bg-white p-5">
                        <h3 className="text-xs font-semibold mb-3">연락 설정</h3>
                        <div className="space-y-2 text-xs">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-neutral-600">이메일 수신 금지</span>
                                <input type="checkbox" checked={person.do_not_email} disabled={!editing}
                                    onChange={e => setPerson({ ...person, do_not_email: e.target.checked })} />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-neutral-600">모든 연락 금지</span>
                                <input type="checkbox" checked={person.do_not_contact} disabled={!editing}
                                    onChange={e => setPerson({ ...person, do_not_contact: e.target.checked })} />
                            </label>
                            <div>
                                <label className="block text-neutral-600 mb-1">다음 Follow-up</label>
                                <input type="date" value={person.next_follow_up_at?.slice(0, 10) || ''}
                                    disabled={!editing}
                                    onChange={e => setPerson({ ...person, next_follow_up_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                    className="w-full px-2 py-1 border border-neutral-200 rounded disabled:bg-neutral-50" />
                            </div>
                        </div>
                    </div>

                    {Object.keys(person.source_detail || {}).length > 0 && (
                        <div className="border border-neutral-200 bg-white p-5">
                            <h3 className="text-xs font-semibold mb-2">유입 정보</h3>
                            <pre className="text-[10px] text-neutral-500 whitespace-pre-wrap">{JSON.stringify(person.source_detail, null, 2)}</pre>
                        </div>
                    )}
                </div>

                {/* 오른쪽: 타임라인 */}
                <div className="lg:col-span-2">
                    <div className="border border-neutral-200 bg-white">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                            <h3 className="text-xs font-semibold">접점 타임라인 ({touchpoints.length})</h3>
                            <button onClick={() => setNoteOpen(true)} className="inline-flex items-center gap-1 px-2 py-1 text-[11px] border border-neutral-200 rounded hover:bg-neutral-50">
                                <Plus className="h-3 w-3" /> 메모
                            </button>
                        </div>

                        {noteOpen && (
                            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
                                <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                                    rows={3} placeholder="메모를 입력..."
                                    className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded resize-none focus:outline-none focus:border-neutral-400" />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={() => { setNoteOpen(false); setNoteText(""); }} className="px-2 py-1 text-[11px] text-neutral-500 hover:bg-neutral-100 rounded">취소</button>
                                    <button onClick={handleAddNote} className="px-2 py-1 text-[11px] bg-neutral-900 text-white rounded">추가</button>
                                </div>
                            </div>
                        )}

                        {touchpoints.length === 0 ? (
                            <div className="py-10 text-center text-neutral-400 text-xs flex flex-col items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                아직 기록된 접점이 없습니다
                            </div>
                        ) : (
                            <ul className="divide-y divide-neutral-100">
                                {touchpoints.map(tp => {
                                    const Icon = TYPE_ICON[tp.type] ?? AlertCircle;
                                    return (
                                        <li key={tp.id} className="p-4 flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="h-7 w-7 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                                    <Icon className="h-3.5 w-3.5 text-neutral-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-xs font-medium">{tp.subject || tp.type}</span>
                                                    <span className="text-[10px] text-neutral-400">{new Date(tp.occurred_at).toLocaleString("ko-KR", { month:'numeric', day:'numeric', hour:'numeric', minute:'numeric' })}</span>
                                                </div>
                                                <p className="text-[11px] text-neutral-500 uppercase tracking-wide">{tp.type}</p>
                                                {tp.body && <p className="text-xs text-neutral-700 mt-1.5 whitespace-pre-wrap">{tp.body}</p>}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
