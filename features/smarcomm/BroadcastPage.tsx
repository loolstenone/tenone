'use client';

// 채널 공통 브로드캐스트 페이지 (카카오·푸시 공유)
import { useEffect, useState } from 'react';
import { Plus, X, Send, Eye, MousePointerClick, CheckCircle2 } from 'lucide-react';

interface Broadcast {
    id: string; name: string; channel: string; status: string;
    title: string; content: string; link_url: string; image_url: string;
    target_audience: string; target_count: number;
    scheduled_at: string | null; sent_at: string | null;
    sent_count: number; delivered_count: number; opened_count: number; clicked_count: number;
    created_at: string;
}

interface BroadcastResp {
    broadcasts: Broadcast[];
    total: number;
    byStatus: Record<string, number>;
    kpi: { totalSent: number; totalDelivered: number; totalOpened: number; totalClicked: number };
}

const STATUS_COLOR: Record<string, string> = {
    draft: '#94a3b8', scheduled: '#3b82f6', sending: '#8b5cf6',
    completed: '#10b981', failed: '#ef4444', cancelled: '#64748b',
};
const STATUS_LABEL: Record<string, string> = {
    draft: '초안', scheduled: '예약', sending: '발송 중',
    completed: '완료', failed: '실패', cancelled: '취소',
};

interface Props {
    channelPrefix?: string;
    channelOptions: { value: string; label: string }[];
    defaultChannel: string;
    title: string;
    description: string;
    accentColor: string;
    sourceNote: string;
}

export default function BroadcastPage({ channelPrefix, channelOptions, defaultChannel, title, description, accentColor, sourceNote }: Props) {
    const [data, setData] = useState<BroadcastResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({
        name: '', channel: defaultChannel, title: '', content: '',
        link_url: '', target_audience: '', target_count: '', scheduled_at: '',
    });

    const reload = () => {
        setLoading(true);
        const q = channelPrefix ? `?channelPrefix=${channelPrefix}` : '';
        fetch(`/api/smarcomm/broadcasts${q}`).then(r => r.json()).then(setData).finally(() => setLoading(false));
    };
    useEffect(reload, [channelPrefix]);

    const submit = async () => {
        if (!form.name.trim() || !form.content.trim()) return;
        await fetch('/api/smarcomm/broadcasts', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                target_count: parseInt(form.target_count || '0', 10),
                scheduled_at: form.scheduled_at || null,
                status: form.scheduled_at ? 'scheduled' : 'draft',
            }),
        });
        setShowCreate(false);
        setForm({ name: '', channel: defaultChannel, title: '', content: '', link_url: '', target_audience: '', target_count: '', scheduled_at: '' });
        reload();
    };

    const del = async (id: string) => {
        if (!confirm('삭제하시겠습니까?')) return;
        await fetch(`/api/smarcomm/broadcasts?id=${id}`, { method: 'DELETE' });
        reload();
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-text">{title}</h1>
                    <p className="mt-1 text-xs text-text-muted">{description}</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    style={{ background: accentColor }}>
                    <Plus size={15} /> 새 발송
                </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Kpi icon={Send} label="발송" value={data?.kpi.totalSent ?? 0} accent="#0F172A" loading={loading} />
                <Kpi icon={CheckCircle2} label="전달" value={data?.kpi.totalDelivered ?? 0} accent="#10b981" loading={loading} />
                <Kpi icon={Eye} label="오픈" value={data?.kpi.totalOpened ?? 0} accent="#3b82f6" loading={loading} />
                <Kpi icon={MousePointerClick} label="클릭" value={data?.kpi.totalClicked ?? 0} accent="#8b5cf6" loading={loading} />
                <Kpi icon={Send} label="브로드캐스트" value={data?.total ?? 0} accent="#f59e0b" loading={loading} />
            </div>

            {!loading && data && data.broadcasts.length === 0 ? (
                <div className="rounded-2xl border border-border bg-white p-12 text-center">
                    <Send size={32} className="mx-auto mb-3 text-text-muted" />
                    <div className="text-sm font-semibold text-text">아직 발송 이력이 없습니다</div>
                    <p className="mt-2 text-xs text-text-muted">"새 발송"으로 템플릿·타겟·예약 시간을 정의하세요. 실제 발송은 외부 API 연동 시 활성됩니다.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {data?.broadcasts.map(b => (
                        <div key={b.id} className="rounded-2xl border border-border bg-white p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium"
                                            style={{ background: (STATUS_COLOR[b.status] || '#64748b') + '15', color: STATUS_COLOR[b.status] || '#64748b' }}>
                                            {STATUS_LABEL[b.status] || b.status}
                                        </span>
                                        <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-text-sub">{b.channel}</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-text">{b.name}</h3>
                                    {b.title && <div className="mt-1 text-xs text-text-sub">{b.title}</div>}
                                    {b.content && <p className="mt-1 text-xs text-text-muted line-clamp-2">{b.content}</p>}

                                    <div className="mt-3 flex items-center gap-4 text-[10px] text-text-muted flex-wrap">
                                        {b.target_audience && <span>타겟: {b.target_audience}</span>}
                                        {b.target_count > 0 && <span>대상 {b.target_count.toLocaleString()}명</span>}
                                        {b.scheduled_at && <span>예약 {new Date(b.scheduled_at).toLocaleString('ko-KR')}</span>}
                                        {b.sent_at && <span>발송 {new Date(b.sent_at).toLocaleString('ko-KR')}</span>}
                                    </div>

                                    {b.sent_count > 0 && (
                                        <div className="mt-3 flex items-center gap-3 text-[10px]">
                                            <span className="text-text-muted">전달 <strong className="text-text">{b.delivered_count}</strong>/{b.sent_count}</span>
                                            <span className="text-text-muted">오픈 <strong className="text-text">{b.opened_count}</strong></span>
                                            <span className="text-text-muted">클릭 <strong className="text-text">{b.clicked_count}</strong></span>
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => del(b.id)} className="rounded-lg p-1.5 text-text-muted hover:bg-surface hover:text-danger" title="삭제">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
                    <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="mb-4 text-base font-bold text-text">새 발송</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-text-muted">캠페인명</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">유형</label>
                                <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm">
                                    {channelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">제목 (옵션)</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">내용</label>
                                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-text-muted">타겟 설명</label>
                                    <input value={form.target_audience} onChange={e => setForm({ ...form, target_audience: e.target.value })}
                                        placeholder="VIP 고객"
                                        className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs text-text-muted">대상 수</label>
                                    <input type="number" value={form.target_count} onChange={e => setForm({ ...form, target_count: e.target.value })}
                                        placeholder="0"
                                        className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-text-muted">예약 시각 (옵션)</label>
                                <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })}
                                    className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div className="mt-5 flex gap-2 justify-end">
                            <button onClick={() => setShowCreate(false)} className="rounded-xl border border-border px-4 py-2 text-sm text-text-sub hover:bg-surface">취소</button>
                            <button onClick={submit} disabled={!form.name.trim() || !form.content.trim()} className="rounded-xl bg-text px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">저장</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted leading-relaxed">
                <strong className="text-text-sub">🔬 출처</strong> · DB <code className="font-mono text-[10px]">smarcomm_broadcasts</code> · {sourceNote}
            </div>
        </div>
    );
}

function Kpi({ icon: Icon, label, value, accent, loading }: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string; value: number; accent: string; loading: boolean;
}) {
    return (
        <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Icon size={12} /> {label}
            </div>
            <div className="mt-1 text-2xl font-bold" style={{ color: accent }}>{loading ? '—' : value.toLocaleString()}</div>
        </div>
    );
}
