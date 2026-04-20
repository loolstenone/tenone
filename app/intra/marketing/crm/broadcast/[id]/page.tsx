"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Save, Send, Eye, Users, CheckCircle2, Mail, Calendar } from "lucide-react";
import type { SegmentRules } from "@/lib/crm-segments";

interface Campaign {
    id: string;
    name: string;
    purpose: string | null;
    segment_id: string | null;
    person_ids: string[] | null;
    sender_id: string;
    subject: string;
    preheader: string | null;
    body_html: string | null;
    body_text: string;
    button_label: string | null;
    button_url: string | null;
    brand_name: string | null;
    brand_color: string | null;
    status: string;
    scheduled_at: string | null;
    sent_at: string | null;
    recipient_count: number;
}

interface Segment { id: string; name: string; color: string; rules: SegmentRules; last_computed_count: number | null; }
interface Sender  { id: string; from_addr: string; from_name: string; purpose: string; }

const STEPS = ['수신자', '메시지', '발송'] as const;

const PURPOSES = [
    { value: 'sales',        label: '세일즈' },
    { value: 'invite',       label: '초대' },
    { value: 'announcement', label: '공지' },
    { value: 'general',      label: '일반' },
];

const TEMPLATES: Record<string, { subject: string; body: string }> = {
    sales: {
        subject: '{{name}}님께 드리는 제안',
        body: '{{name}}님, 안녕하세요.\n\nTen:One Universe입니다. {{company}}의 성장에 도움이 될 만한 제안을 드리고자 연락드립니다.\n\n간단히 소개드리면...\n\n관심 있으시면 아래 버튼으로 회신 부탁드립니다.',
    },
    invite: {
        subject: '{{name}}님을 행사에 초대합니다',
        body: '{{name}}님께,\n\n다가오는 행사에 특별히 초대드립니다.\n\n일시: \n장소: \n\n함께해 주시면 감사하겠습니다.',
    },
    announcement: {
        subject: '[공지] 중요한 안내드립니다',
        body: '{{name}}님,\n\n중요한 소식이 있어 안내드립니다.\n\n...\n\n감사합니다.',
    },
    general: { subject: '', body: '' },
};

export default function BroadcastEditor({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [segments, setSegments] = useState<Segment[]>([]);
    const [senders, setSenders] = useState<Sender[]>([]);
    const [preview, setPreview] = useState<{ count: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [scheduleAt, setScheduleAt] = useState('');
    const [step, setStep] = useState(0);

    const load = useCallback(async () => {
        const supabase = createClient();
        const [cRes, sRes, sndRes] = await Promise.all([
            supabase.from('crm_campaigns').select('*').eq('id', id).single(),
            supabase.from('crm_segments').select('id, name, color, rules, last_computed_count').order('name'),
            supabase.from('email_senders').select('id, from_addr, from_name, purpose').eq('is_active', true),
        ]);
        if (cRes.data) setCampaign(cRes.data as Campaign);
        if (sRes.data) setSegments(sRes.data as Segment[]);
        if (sndRes.data) setSenders(sndRes.data as Sender[]);
        setLoading(false);
    }, [id]);

    useEffect(() => { load(); }, [load]);

    // 세그먼트 변경 시 live count
    useEffect(() => {
        if (!campaign?.segment_id) { setPreview(null); return; }
        const seg = segments.find(s => s.id === campaign.segment_id);
        if (!seg) return;
        (async () => {
            const res = await fetch('/api/intra/crm/segments/preview', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rules: seg.rules, limit: 0 }),
            });
            const d = await res.json();
            if (res.ok) setPreview({ count: d.count });
        })();
    }, [campaign?.segment_id, segments]);

    if (loading || !campaign) return <div className="py-20 text-center text-sm text-neutral-400">불러오는 중...</div>;

    const update = (patch: Partial<Campaign>) => setCampaign(c => c ? { ...c, ...patch } : c);

    const handleSave = async () => {
        setSaving(true);
        const supabase = createClient();
        await supabase.from('crm_campaigns').update({
            name: campaign.name, purpose: campaign.purpose,
            segment_id: campaign.segment_id, sender_id: campaign.sender_id,
            subject: campaign.subject, preheader: campaign.preheader,
            body_text: campaign.body_text, body_html: campaign.body_html,
            button_label: campaign.button_label, button_url: campaign.button_url,
            brand_name: campaign.brand_name, brand_color: campaign.brand_color,
            updated_at: new Date().toISOString(),
        }).eq('id', id);
        setSaving(false);
    };

    const handleTest = async () => {
        if (!testEmail.trim()) { alert('테스트 이메일을 입력해주세요.'); return; }
        await handleSave();
        setSending(true);
        try {
            const res = await fetch('/api/intra/crm/broadcast/send', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: id, testEmails: [testEmail.trim()] }),
            });
            const d = await res.json();
            if (res.ok) alert(`테스트 발송 완료: ${d.sent}명`);
            else alert(`테스트 실패: ${d.error}`);
        } finally { setSending(false); }
    };

    const handleSend = async () => {
        if (!campaign.subject || !campaign.body_text) { alert('제목과 본문을 작성해주세요.'); return; }
        if (!campaign.segment_id && !(campaign.person_ids?.length)) { alert('수신 대상을 선택해주세요.'); return; }
        if (!scheduleAt) {
            if (!confirm(`${preview?.count ?? '?'}명에게 지금 발송하시겠습니까?`)) return;
        }
        await handleSave();
        setSending(true);
        try {
            const res = await fetch('/api/intra/crm/broadcast/send', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    campaignId: id,
                    scheduledAt: scheduleAt ? new Date(scheduleAt).toISOString() : undefined,
                }),
            });
            const d = await res.json();
            if (!res.ok) { alert(`발송 실패: ${d.error}`); return; }
            if (d.scheduled) alert(`예약 완료: ${new Date(d.scheduledAt).toLocaleString('ko-KR')}`);
            else alert(`발송 완료: ${d.sent}/${d.total}명`);
            window.location.href = '/intra/marketing/crm/broadcast';
        } finally { setSending(false); }
    };

    const applyTemplate = (purpose: string) => {
        const t = TEMPLATES[purpose];
        update({ purpose, subject: t.subject || campaign.subject, body_text: t.body || campaign.body_text });
    };

    return (
        <div>
            <div className="mb-4">
                <Link href="/intra/marketing/crm/broadcast" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900">
                    <ArrowLeft className="h-3 w-3" /> Broadcast
                </Link>
            </div>

            <div className="flex items-center justify-between border-b-2 border-neutral-200 pb-4 mb-6">
                <div>
                    <input value={campaign.name} onChange={e => update({ name: e.target.value })}
                        className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-neutral-200 focus:border-neutral-400 focus:outline-none" />
                    <p className="text-xs text-neutral-400 mt-0.5">Status: {campaign.status}</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs border border-neutral-200 rounded hover:bg-neutral-50 disabled:opacity-50">
                    <Save className="h-3 w-3" /> {saving ? '저장 중...' : '저장'}
                </button>
            </div>

            {/* Step nav */}
            <div className="flex items-center gap-2 mb-6">
                {STEPS.map((s, i) => (
                    <button key={s} onClick={() => setStep(i)}
                        className={`flex-1 py-2 text-xs border-b-2 transition-colors ${step === i ? 'border-neutral-900 text-neutral-900 font-semibold' : 'border-neutral-200 text-neutral-400 hover:text-neutral-700'}`}>
                        {i + 1}. {s}
                    </button>
                ))}
            </div>

            {/* Step 1: 수신자 */}
            {step === 0 && (
                <div className="space-y-5">
                    <div>
                        <label className="text-xs font-medium block mb-2">세그먼트 선택</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {segments.map(s => (
                                <button key={s.id} onClick={() => update({ segment_id: s.id })}
                                    className={`p-3 border text-left transition-colors ${campaign.segment_id === s.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                                        <p className="text-sm font-medium truncate">{s.name}</p>
                                    </div>
                                    <p className="text-[11px] text-neutral-400">약 {s.last_computed_count ?? '?'}명</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    {preview && (
                        <div className="p-4 bg-neutral-50 rounded flex items-center justify-between">
                            <span className="text-xs text-neutral-500 inline-flex items-center gap-1.5"><Users className="h-3 w-3" /> 실시간 수신자</span>
                            <span className="text-2xl font-bold">{preview.count}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></span>
                        </div>
                    )}
                    <p className="text-[11px] text-neutral-400">수신 거부자·이메일 없음은 발송 시 자동 제외됩니다.</p>
                </div>
            )}

            {/* Step 2: 메시지 */}
            {step === 1 && (
                <div className="space-y-5">
                    <div>
                        <label className="text-xs font-medium block mb-2">목적 / 템플릿</label>
                        <div className="flex gap-2">
                            {PURPOSES.map(p => (
                                <button key={p.value} onClick={() => applyTemplate(p.value)}
                                    className={`px-3 py-1.5 text-xs border rounded ${campaign.purpose === p.value ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 hover:border-neutral-400'}`}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium block mb-1">발신자</label>
                            <select value={campaign.sender_id} onChange={e => update({ sender_id: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded">
                                {senders.map(s => <option key={s.id} value={s.id}>{s.from_name} ({s.from_addr})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1">브랜드 표기</label>
                            <input value={campaign.brand_name ?? ''} onChange={e => update({ brand_name: e.target.value || null })}
                                placeholder="예: Ten:One Universe" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium block mb-1">제목 *</label>
                        <input value={campaign.subject} onChange={e => update({ subject: e.target.value })}
                            placeholder="{{name}}님께 드리는 제안" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                    </div>

                    <div>
                        <label className="text-xs font-medium block mb-1">프리헤더 (선택)</label>
                        <input value={campaign.preheader ?? ''} onChange={e => update({ preheader: e.target.value || null })}
                            placeholder="받은편지함 미리보기 문구" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                    </div>

                    <div>
                        <label className="text-xs font-medium block mb-1">본문 *</label>
                        <textarea value={campaign.body_text} onChange={e => update({ body_text: e.target.value })}
                            rows={12} placeholder="안녕하세요 {{name}}님, ..."
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded font-mono" />
                        <p className="text-[11px] text-neutral-400 mt-1">변수: <code className="bg-neutral-100 px-1">{'{{name}}'}</code> <code className="bg-neutral-100 px-1">{'{{company}}'}</code> <code className="bg-neutral-100 px-1">{'{{position}}'}</code> <code className="bg-neutral-100 px-1">{'{{email}}'}</code></p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-medium block mb-1">버튼 문구 (선택)</label>
                            <input value={campaign.button_label ?? ''} onChange={e => update({ button_label: e.target.value || null })}
                                placeholder="자세히 보기" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                        </div>
                        <div>
                            <label className="text-xs font-medium block mb-1">버튼 링크 (선택)</label>
                            <input value={campaign.button_url ?? ''} onChange={e => update({ button_url: e.target.value || null })}
                                placeholder="https://..." className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="text" value={testEmail} onChange={e => setTestEmail(e.target.value)}
                            placeholder="test@example.com"
                            className="flex-1 px-3 py-2 text-xs border border-neutral-200 rounded" />
                        <button onClick={handleTest} disabled={sending}
                            className="inline-flex items-center gap-1 px-3 py-2 text-xs border border-neutral-300 rounded hover:bg-neutral-50 disabled:opacity-50 whitespace-nowrap">
                            <Eye className="h-3 w-3" /> 테스트 발송
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: 발송 */}
            {step === 2 && (
                <div className="space-y-5">
                    <div className="border border-neutral-200 p-5 space-y-3 bg-neutral-50">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-500 inline-flex items-center gap-1.5"><Users className="h-3 w-3" /> 수신자</span>
                            <span className="font-bold">{preview?.count ?? '?'}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-500 inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> 발신</span>
                            <span className="text-xs">{senders.find(s => s.id === campaign.sender_id)?.from_addr}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-500">제목</span>
                            <span className="text-xs font-medium truncate ml-4">{campaign.subject || <span className="text-neutral-300">없음</span>}</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium block mb-1 flex items-center gap-1.5"><Calendar className="h-3 w-3" /> 예약 발송 (선택)</label>
                        <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded" />
                        <p className="text-[11px] text-neutral-400 mt-1">비워두면 즉시 발송</p>
                    </div>

                    <div className="border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                        <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                        발송 후 되돌릴 수 없습니다. 테스트 발송으로 내용을 확인하셨나요?
                    </div>

                    <button onClick={handleSend} disabled={sending || campaign.status === 'sent'}
                        className="w-full py-3 bg-neutral-900 text-white rounded font-semibold text-sm hover:bg-neutral-800 disabled:opacity-50 inline-flex items-center justify-center gap-2">
                        <Send className="h-4 w-4" />
                        {sending ? '처리 중...' : scheduleAt ? '예약 저장' : '지금 발송'}
                    </button>
                </div>
            )}

            <div className="flex justify-between mt-8">
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                    className="px-4 py-2 text-xs border border-neutral-200 rounded disabled:opacity-30">← 이전</button>
                <button onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
                    className="px-4 py-2 text-xs border border-neutral-200 rounded disabled:opacity-30">다음 →</button>
            </div>
        </div>
    );
}
