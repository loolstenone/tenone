"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, PrimaryButton } from "@/components/intra/IntraUI";
import { Plus, Send, Trash2, Edit3, Calendar, Users, Mail, BarChart3 } from "lucide-react";

interface Campaign {
    id: string;
    name: string;
    purpose: string | null;
    segment_id: string | null;
    sender_id: string;
    subject: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    scheduled_at: string | null;
    sent_at: string | null;
    recipient_count: number;
    brand_name: string | null;
    created_at: string;
}

const STATUS_LABEL: Record<string, string> = { draft: '작성중', scheduled: '예약', sending: '발송중', sent: '발송완료', failed: '실패' };
const STATUS_STYLE: Record<string, string> = {
    draft: 'bg-neutral-100 text-neutral-500',
    scheduled: 'bg-blue-100 text-blue-700',
    sending: 'bg-amber-100 text-amber-700 animate-pulse',
    sent: 'bg-neutral-900 text-white',
    failed: 'bg-red-100 text-red-700',
};

const PURPOSE_LABEL: Record<string, string> = {
    sales: '세일즈',
    invite: '초대',
    announcement: '공지',
    general: '일반',
};

export default function BroadcastPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        const supabase = createClient();
        const { data } = await supabase.from('crm_campaigns').select('*').order('created_at', { ascending: false });
        setCampaigns((data ?? []) as Campaign[]);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('crm_campaigns').insert({
            name: '새 캠페인', purpose: 'general', subject: '', body_text: '', sender_id: 'hello',
        }).select().single();
        if (data) window.location.href = `/intra/marketing/crm/broadcast/${(data as Campaign).id}`;
    };

    const handleDelete = async (id: string) => {
        if (!confirm('캠페인을 삭제하시겠습니까?')) return;
        const supabase = createClient();
        await supabase.from('crm_campaigns').delete().eq('id', id);
        setCampaigns(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Broadcast" description="CRM 세그먼트 대상 메일 발송 — 세일즈·초대·공지">
                <PrimaryButton onClick={handleCreate}><Plus className="h-4 w-4" /> 새 캠페인</PrimaryButton>
            </PageHeader>

            {loading ? (
                <div className="py-16 text-center text-neutral-400 text-sm">불러오는 중...</div>
            ) : campaigns.length === 0 ? (
                <div className="border border-dashed border-neutral-300 py-16 text-center">
                    <Mail className="h-8 w-8 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm text-neutral-400 mb-3">첫 캠페인을 만들어보세요</p>
                    <button onClick={handleCreate} className="text-xs underline text-neutral-600">새 캠페인 →</button>
                </div>
            ) : (
                <div className="space-y-2">
                    {campaigns.map(c => (
                        <div key={c.id} className="border border-neutral-200 bg-white p-4 hover:border-neutral-300">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_STYLE[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                                        {c.purpose && <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-50 border border-neutral-200 text-neutral-500">{PURPOSE_LABEL[c.purpose] || c.purpose}</span>}
                                        <h3 className="text-sm font-medium truncate">{c.name}</h3>
                                    </div>
                                    <p className="text-xs text-neutral-500 truncate mb-1">{c.subject || <span className="text-neutral-300">제목 미작성</span>}</p>
                                    <div className="flex items-center gap-4 text-[11px] text-neutral-400">
                                        <span>발신: {c.sender_id}</span>
                                        {c.brand_name && <span>브랜드: {c.brand_name}</span>}
                                        {c.sent_at && <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {c.sent_at.split('T')[0]}</span>}
                                        {c.scheduled_at && <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> 예약 {c.scheduled_at.split('T')[0]}</span>}
                                        {c.recipient_count > 0 && <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5" /> {c.recipient_count}명</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {c.status === 'sent' && (
                                        <Link href={`/intra/marketing/crm/broadcast/${c.id}/analytics`} className="p-1.5 hover:bg-neutral-100 rounded" title="분석">
                                            <BarChart3 className="h-3 w-3 text-neutral-400 hover:text-neutral-700" />
                                        </Link>
                                    )}
                                    <Link href={`/intra/marketing/crm/broadcast/${c.id}`} className="p-1.5 hover:bg-neutral-100 rounded" title="수정">
                                        <Edit3 className="h-3 w-3 text-neutral-400" />
                                    </Link>
                                    <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded" title="삭제">
                                        <Trash2 className="h-3 w-3 text-neutral-300 hover:text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
