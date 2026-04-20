"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, PrimaryButton } from "@/components/intra/IntraUI";
import { Plus, Trash2, Mail, Edit3, X, Check } from "lucide-react";

interface Sender {
    id: string;
    from_addr: string;
    from_name: string;
    reply_to: string | null;
    purpose: string;
    brand_id: string | null;
    daily_limit: number;
    is_active: boolean;
    notes: string | null;
}

const PURPOSE_LABEL: Record<string, string> = {
    transactional: '트랜잭션',
    newsletter: '뉴스레터',
    crm: 'CRM',
    announcement: '공지',
};

export default function SendersPage() {
    const [senders, setSenders] = useState<Sender[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<Sender> | null>(null);

    const load = useCallback(async () => {
        const supabase = createClient();
        const { data } = await supabase.from('email_senders').select('*').order('purpose').order('id');
        setSenders((data ?? []) as Sender[]);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const save = async () => {
        if (!editing || !editing.id || !editing.from_addr) { alert('ID와 발송 주소는 필수입니다.'); return; }
        const supabase = createClient();
        const exists = senders.find(s => s.id === editing.id);
        const payload = {
            id: editing.id,
            from_addr: editing.from_addr,
            from_name: editing.from_name ?? 'Ten:One Universe',
            reply_to: editing.reply_to ?? 'lools@tenone.biz',
            purpose: editing.purpose ?? 'transactional',
            brand_id: editing.brand_id ?? null,
            daily_limit: editing.daily_limit ?? 1000,
            is_active: editing.is_active ?? true,
            notes: editing.notes ?? null,
            updated_at: new Date().toISOString(),
        };
        if (exists) await supabase.from('email_senders').update(payload).eq('id', editing.id);
        else await supabase.from('email_senders').insert(payload);
        setEditing(null);
        load();
    };

    const toggleActive = async (s: Sender) => {
        const supabase = createClient();
        await supabase.from('email_senders').update({ is_active: !s.is_active, updated_at: new Date().toISOString() }).eq('id', s.id);
        load();
    };

    const remove = async (id: string) => {
        if (!confirm(`발신자 '${id}'를 삭제하시겠습니까? 이 발신자를 사용하던 캠페인은 실패할 수 있습니다.`)) return;
        const supabase = createClient();
        await supabase.from('email_senders').delete().eq('id', id);
        load();
    };

    if (loading) return <div className="py-20 text-center text-sm text-neutral-400">불러오는 중...</div>;

    return (
        <div>
            <PageHeader title="Email Senders" description="발송 주소 관리 — 용도별로 분리된 발신자 레지스트리">
                <PrimaryButton onClick={() => setEditing({ id: '', purpose: 'transactional', daily_limit: 1000, is_active: true, from_name: 'Ten:One Universe', reply_to: 'lools@tenone.biz' })}>
                    <Plus className="h-4 w-4" /> 새 발신자
                </PrimaryButton>
            </PageHeader>

            <div className="border border-neutral-200 bg-white overflow-hidden">
                <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 text-[11px]">
                        <tr>
                            <th className="px-3 py-2 text-left">ID</th>
                            <th className="px-3 py-2 text-left">발송 주소</th>
                            <th className="px-3 py-2 text-left">표시명</th>
                            <th className="px-3 py-2 text-left">Reply-To</th>
                            <th className="px-3 py-2 text-left">용도</th>
                            <th className="px-3 py-2 text-right">일일 한도</th>
                            <th className="px-3 py-2 text-left">상태</th>
                            <th className="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {senders.map(s => (
                            <tr key={s.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                <td className="px-3 py-2 font-mono text-[11px]">{s.id}</td>
                                <td className="px-3 py-2 font-mono">{s.from_addr}</td>
                                <td className="px-3 py-2">{s.from_name}</td>
                                <td className="px-3 py-2 text-neutral-500">{s.reply_to ?? '-'}</td>
                                <td className="px-3 py-2">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">{PURPOSE_LABEL[s.purpose] || s.purpose}</span>
                                </td>
                                <td className="px-3 py-2 text-right">{s.daily_limit.toLocaleString()}</td>
                                <td className="px-3 py-2">
                                    <button onClick={() => toggleActive(s)}
                                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                        {s.is_active ? <><Check className="h-3 w-3" /> 활성</> : <><X className="h-3 w-3" /> 비활성</>}
                                    </button>
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <button onClick={() => setEditing(s)} className="p-1 text-neutral-400 hover:text-neutral-900"><Edit3 className="h-3 w-3" /></button>
                                    <button onClick={() => remove(s.id)} className="p-1 text-neutral-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                                </td>
                            </tr>
                        ))}
                        {senders.length === 0 && <tr><td colSpan={8} className="px-3 py-8 text-center text-neutral-400">발신자 없음</td></tr>}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 border border-blue-200 bg-blue-50 p-3 text-[11px] text-blue-900 space-y-1">
                <p className="flex items-start gap-1.5"><Mail className="h-3 w-3 mt-0.5 shrink-0" /> 새 발송 주소는 <strong>Resend Domains에서 DNS 검증</strong>이 끝나야 실제 발송 가능합니다.</p>
                <p>· SPF/DKIM이 설정된 `tenone.biz` 하위 주소는 추가 설정 없이 바로 사용 가능</p>
                <p>· 신규 주소는 첫 7일 <strong>하루 100통씩 점진 증량</strong>(warming) 권장 — 도메인 평판 보호</p>
            </div>

            {editing && (
                <>
                    <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setEditing(null)} />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <div className="bg-white shadow-2xl w-full max-w-md pointer-events-auto">
                            <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                                <h2 className="text-sm font-semibold">{senders.find(s => s.id === editing.id) ? '발신자 수정' : '새 발신자'}</h2>
                                <button onClick={() => setEditing(null)}><X className="h-4 w-4" /></button>
                            </div>
                            <div className="p-5 space-y-3">
                                <div>
                                    <label className="text-[11px] text-neutral-500 block mb-1">ID (URL-safe) *</label>
                                    <input value={editing.id ?? ''} onChange={e => setEditing({ ...editing, id: e.target.value })}
                                        disabled={!!senders.find(s => s.id === editing.id)}
                                        placeholder="예: sales" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded font-mono disabled:bg-neutral-50" />
                                </div>
                                <div>
                                    <label className="text-[11px] text-neutral-500 block mb-1">발송 주소 *</label>
                                    <input value={editing.from_addr ?? ''} onChange={e => setEditing({ ...editing, from_addr: e.target.value })}
                                        placeholder="sales@tenone.biz" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded font-mono" />
                                </div>
                                <div>
                                    <label className="text-[11px] text-neutral-500 block mb-1">표시명</label>
                                    <input value={editing.from_name ?? ''} onChange={e => setEditing({ ...editing, from_name: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                                </div>
                                <div>
                                    <label className="text-[11px] text-neutral-500 block mb-1">Reply-To</label>
                                    <input value={editing.reply_to ?? ''} onChange={e => setEditing({ ...editing, reply_to: e.target.value })}
                                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] text-neutral-500 block mb-1">용도</label>
                                        <select value={editing.purpose ?? 'transactional'} onChange={e => setEditing({ ...editing, purpose: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                                            <option value="transactional">트랜잭션</option>
                                            <option value="newsletter">뉴스레터</option>
                                            <option value="crm">CRM</option>
                                            <option value="announcement">공지</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-neutral-500 block mb-1">일일 한도</label>
                                        <input type="number" value={editing.daily_limit ?? 1000}
                                            onChange={e => setEditing({ ...editing, daily_limit: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] text-neutral-500 block mb-1">메모</label>
                                    <input value={editing.notes ?? ''} onChange={e => setEditing({ ...editing, notes: e.target.value || null })}
                                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                                </div>
                            </div>
                            <div className="p-4 border-t border-neutral-100 flex justify-end gap-2">
                                <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 rounded">취소</button>
                                <button onClick={save} className="px-4 py-1.5 text-xs bg-neutral-900 text-white rounded hover:bg-neutral-800">저장</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
