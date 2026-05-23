'use client';

// 이메일 채널 — email_sends + email_senders + newsletter_subscribers 실 DB

import { useCallback, useEffect, useRef, useState } from 'react';
import { Mail, Send, Eye, MousePointerClick, AlertCircle, Users, CheckCircle2, Clock, Loader2, Plus, X } from 'lucide-react';
import PageTopBar from '@/features/smarcomm/PageTopBar';
import GuideHelpButton from '@/features/smarcomm/GuideHelpButton';

interface Sender { id: string; from_addr: string; from_name: string; purpose: string; brand_id: string; is_active: boolean; daily_limit: number | null }
interface SendRow { id: string; to: string; subject: string; status: string; kind: string; opened: boolean; clicked: boolean; bounced: boolean; created_at: string }
interface EmailResp {
    days: number;
    kpi: { totalSent: number; delivered: number; opened: number; clicked: number; bounced: number; openRate: number; clickRate: number; bounceRate: number };
    subscribers: { total: number; active: number; confirmed: number; unsubscribed: number };
    timeline: { date: string; sent: number; opened: number; clicked: number }[];
    senders: Sender[];
    recentSends: SendRow[];
}

interface MyCampaign {
    id: string;
    name: string;
    subject: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    scheduled_at: string | null;
    sent_at: string | null;
    recipient_count: number | null;
    created_at: string;
}

export default function EmailPage() {
    const [data, setData] = useState<EmailResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [campaigns, setCampaigns] = useState<MyCampaign[] | null>(null);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const EMPTY_FORM = { name: '', subject: '', bodyText: '', preheader: '', buttonLabel: '', buttonUrl: '', senderId: '' };
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/smarcomm/crm/email?days=${days}`)
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, [days]);

    const loadCampaigns = useCallback(async () => {
        const r = await fetch('/api/smarcomm/email/campaigns');
        if (!r.ok) { setCampaigns([]); return; }
        const j = await r.json();
        setCampaigns(j.campaigns ?? []);
    }, []);

    useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

    async function handleSend(c: MyCampaign) {
        if (!confirm(`'${c.name}'을(를) 지금 발송할까요? 발송 후 취소할 수 없습니다.`)) return;
        setSendingId(c.id);
        try {
            const r = await fetch('/api/smarcomm/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId: c.id }),
            });
            const j = await r.json();
            if (!r.ok) {
                alert(`발송 실패: ${j.error ?? r.status}`);
            } else if (j.scheduled) {
                alert(`예약 완료: ${j.scheduledAt}`);
            } else {
                alert(`발송 완료: ${j.sent}/${j.total}${j.errors ? `\n에러: ${j.errors.join('; ')}` : ''}`);
            }
            await loadCampaigns();
        } catch (e) {
            alert(`발송 오류: ${e instanceof Error ? e.message : 'unknown'}`);
        } finally {
            setSendingId(null);
        }
    }

    function openModal() {
        setForm(EMPTY_FORM);
        setSaveError(null);
        setModalOpen(true);
        setTimeout(() => nameRef.current?.focus(), 50);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim() || !form.subject.trim() || !form.bodyText.trim()) {
            setSaveError('캠페인 이름·제목·본문은 필수입니다.');
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            const body: Record<string, string> = {
                name: form.name.trim(),
                subject: form.subject.trim(),
                body_text: form.bodyText.trim(),
            };
            if (form.preheader.trim()) body.preheader = form.preheader.trim();
            if (form.buttonLabel.trim()) body.button_label = form.buttonLabel.trim();
            if (form.buttonUrl.trim()) body.button_url = form.buttonUrl.trim();
            if (form.senderId.trim()) body.sender_id = form.senderId.trim();
            const r = await fetch('/api/smarcomm/email/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const j = await r.json();
            if (!r.ok) { setSaveError(j.error ?? `오류 ${r.status}`); return; }
            setModalOpen(false);
            await loadCampaigns();
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : '알 수 없는 오류');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="max-w-6xl">
            <div className="mb-4 flex justify-end print:hidden"><PageTopBar /></div>

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-text">이메일 채널</h1>
                        <GuideHelpButton />
                    </div>
                    <p className="mt-1 text-xs text-text-muted">발송 이력·오픈·클릭·구독자를 통합 관리합니다</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={openModal} className="inline-flex items-center gap-1.5 rounded-lg bg-text px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
                        <Plus size={13} /> 새 캠페인
                    </button>
                    <div className="flex gap-1">
                        {[7, 30, 90].map(d => (
                            <button key={d} onClick={() => setDays(d)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${days === d ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
                                {d}일
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Kpi icon={Send} label="발송" value={data?.kpi.totalSent ?? 0} accent="#0F172A" loading={loading} />
                <Kpi icon={CheckCircle2} label="전달" value={data?.kpi.delivered ?? 0} accent="#10b981" loading={loading} />
                <Kpi icon={Eye} label="오픈률" value={data?.kpi.openRate ?? 0} accent="#3b82f6" loading={loading} suffix="%" />
                <Kpi icon={MousePointerClick} label="클릭률" value={data?.kpi.clickRate ?? 0} accent="#8b5cf6" loading={loading} suffix="%" />
                <Kpi icon={AlertCircle} label="반송률" value={data?.kpi.bounceRate ?? 0} accent="#ef4444" loading={loading} suffix="%" />
            </div>

            {/* 구독자 KPI */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Kpi icon={Users} label="총 구독자" value={data?.subscribers.total ?? 0} accent="#0F172A" loading={loading} />
                <Kpi icon={Users} label="활성" value={data?.subscribers.active ?? 0} accent="#10b981" loading={loading} />
                <Kpi icon={CheckCircle2} label="이메일 인증" value={data?.subscribers.confirmed ?? 0} accent="#3b82f6" loading={loading} />
                <Kpi icon={AlertCircle} label="구독 해지" value={data?.subscribers.unsubscribed ?? 0} accent="#f59e0b" loading={loading} />
            </div>

            {/* 내 캠페인 (SmarComm 사용자 본인 캠페인) */}
            <div className="mb-6 rounded-2xl border border-border bg-white overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-text">내 캠페인 {campaigns ? `(${campaigns.length})` : ''}</h2>
                    <button onClick={openModal} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[10px] text-text-sub hover:bg-surface">
                        <Plus size={11} /> 새 캠페인
                    </button>
                </div>
                {campaigns === null ? (
                    <div className="px-5 py-8 text-center text-xs text-text-muted">불러오는 중…</div>
                ) : campaigns.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <Mail size={28} className="mx-auto mb-3 text-text-muted" />
                        <p className="mb-3 text-sm font-medium text-text">아직 캠페인이 없습니다</p>
                        <p className="mb-4 text-xs text-text-muted">첫 이메일 캠페인을 작성하고 구독자에게 발송해 보세요.</p>
                        <button onClick={openModal} className="inline-flex items-center gap-1.5 rounded-lg bg-text px-4 py-2 text-xs font-medium text-white hover:opacity-90">
                            <Plus size={13} /> 첫 캠페인 만들기
                        </button>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-border text-xs text-text-muted">
                            <th className="px-5 py-2.5 text-left font-medium">캠페인</th>
                            <th className="px-5 py-2.5 text-center font-medium">상태</th>
                            <th className="px-5 py-2.5 text-right font-medium">발송 수</th>
                            <th className="px-5 py-2.5 text-right font-medium">생성</th>
                            <th className="px-5 py-2.5 text-right font-medium">액션</th>
                        </tr></thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface">
                                    <td className="px-5 py-2.5">
                                        <div className="text-xs font-semibold text-text truncate max-w-[240px]">{c.name}</div>
                                        <div className="text-[10px] text-text-muted truncate max-w-[240px]">{c.subject}</div>
                                    </td>
                                    <td className="px-5 py-2.5 text-center">
                                        <StatusChip status={c.status} />
                                    </td>
                                    <td className="px-5 py-2.5 text-right text-xs text-text-sub">
                                        {c.recipient_count ?? '-'}
                                    </td>
                                    <td className="px-5 py-2.5 text-right text-[10px] text-text-muted">
                                        {c.created_at.slice(0, 10)}
                                    </td>
                                    <td className="px-5 py-2.5 text-right">
                                        {(c.status === 'draft' || c.status === 'scheduled') ? (
                                            <button
                                                onClick={() => handleSend(c)}
                                                disabled={sendingId === c.id}
                                                className="inline-flex items-center gap-1 rounded-lg bg-text px-2.5 py-1 text-[10px] font-medium text-white hover:opacity-90 disabled:opacity-50"
                                            >
                                                {sendingId === c.id ? (
                                                    <><Loader2 size={11} className="animate-spin" /> 발송 중</>
                                                ) : (
                                                    <><Send size={11} /> 지금 발송</>
                                                )}
                                            </button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] text-text-muted">
                                                {c.status === 'sent' && c.sent_at ? <><CheckCircle2 size={10} /> {c.sent_at.slice(0, 10)}</> : null}
                                                {c.status === 'failed' ? <span className="text-danger">실패</span> : null}
                                                {c.status === 'sending' ? <><Clock size={10} /> 진행 중</> : null}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 발신자 */}
            {data && data.senders.length > 0 && (
                <div className="mb-6 rounded-2xl border border-border bg-white p-5">
                    <h2 className="mb-3 text-sm font-semibold text-text">발신자 ({data.senders.length})</h2>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                        {data.senders.map(s => (
                            <div key={s.id} className={`rounded-xl border border-border p-3 ${s.is_active ? '' : 'opacity-50'}`}>
                                <div className="flex items-center gap-1.5">
                                    <Mail size={11} className="text-text-muted" />
                                    <span className="text-xs font-medium text-text truncate">{s.from_name || s.from_addr}</span>
                                </div>
                                <div className="mt-0.5 text-[10px] text-text-muted truncate">{s.from_addr}</div>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="rounded-full bg-surface px-1.5 py-0.5 text-[9px] text-text-sub">{s.purpose || '범용'}</span>
                                    {s.brand_id && <span className="rounded-full bg-surface px-1.5 py-0.5 text-[9px] text-text-sub">{s.brand_id}</span>}
                                    {!s.is_active && <span className="text-[9px] text-danger">비활성</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 최근 발송 */}
            {data && data.recentSends.length > 0 && (
                <div className="mb-6 rounded-2xl border border-border bg-white overflow-hidden">
                    <div className="px-5 py-3 border-b border-border">
                        <h2 className="text-sm font-semibold text-text">최근 발송 ({data.recentSends.length})</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-border text-xs text-text-muted">
                            <th className="px-5 py-2.5 text-left font-medium">수신</th>
                            <th className="px-5 py-2.5 text-left font-medium">제목</th>
                            <th className="px-5 py-2.5 text-center font-medium">상태</th>
                            <th className="px-5 py-2.5 text-right font-medium">날짜</th>
                        </tr></thead>
                        <tbody>
                            {data.recentSends.map(s => (
                                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-surface">
                                    <td className="px-5 py-2.5 text-xs text-text-sub font-mono truncate max-w-[180px]">{s.to}</td>
                                    <td className="px-5 py-2.5 text-xs text-text truncate max-w-[280px]">{s.subject}</td>
                                    <td className="px-5 py-2.5 text-center text-[10px]">
                                        <span className="inline-flex items-center gap-1">
                                            {s.bounced && <span className="rounded bg-danger/10 px-1.5 py-0.5 text-danger">반송</span>}
                                            {s.clicked && <span className="rounded bg-info/10 px-1.5 py-0.5 text-info">클릭</span>}
                                            {s.opened && !s.clicked && <span className="rounded bg-success/10 px-1.5 py-0.5 text-success">오픈</span>}
                                            {!s.bounced && !s.opened && <span className="rounded bg-surface px-1.5 py-0.5 text-text-muted">{s.status}</span>}
                                        </span>
                                    </td>
                                    <td className="px-5 py-2.5 text-right text-[10px] text-text-muted">{s.created_at.slice(0, 10)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && data && data.kpi.totalSent === 0 && data.subscribers.total === 0 && (
                <div className="rounded-2xl border border-border bg-white p-12 text-center">
                    <Mail size={32} className="mx-auto mb-3 text-text-muted" />
                    <div className="text-sm font-semibold text-text">이메일 데이터가 없습니다</div>
                    <p className="mt-2 text-xs text-text-muted">Resend SMTP 발송 + email_events 캡처 + 뉴스레터 구독 폼 운영 시 자동 누적됩니다.</p>
                </div>
            )}

            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-xs text-text-muted leading-relaxed">
                <strong className="text-text-sub">🔬 출처</strong> · DB <code className="font-mono text-[10px]">email_sends</code> + <code className="font-mono text-[10px]">email_senders</code> + <code className="font-mono text-[10px]">newsletter_subscribers</code> · Resend 발송 + webhook 캡처. 오픈/클릭은 Resend webhook 수신 시 갱신.
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                     onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <h2 className="text-base font-semibold text-text">새 캠페인 만들기</h2>
                            <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 hover:bg-surface">
                                <X size={18} className="text-text-sub" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text">캠페인 이름 <span className="text-danger">*</span></label>
                                <input ref={nameRef} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-text focus:outline-none" placeholder="예: 5월 뉴스레터" required />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text">이메일 제목 <span className="text-danger">*</span></label>
                                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-text focus:outline-none" placeholder="예: 이번 달 특별 혜택을 놓치지 마세요!" required />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text">본문 (텍스트) <span className="text-danger">*</span></label>
                                <textarea value={form.bodyText} onChange={e => setForm(f => ({ ...f, bodyText: e.target.value }))}
                                    rows={6} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-text focus:outline-none resize-none" placeholder="이메일 본문을 입력하세요." required />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text">프리헤더 <span className="text-[10px] text-text-muted">(선택)</span></label>
                                <input value={form.preheader} onChange={e => setForm(f => ({ ...f, preheader: e.target.value }))}
                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-text focus:outline-none" placeholder="받은편지함 미리보기 텍스트" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text">버튼 라벨 <span className="text-[10px] text-text-muted">(선택)</span></label>
                                    <input value={form.buttonLabel} onChange={e => setForm(f => ({ ...f, buttonLabel: e.target.value }))}
                                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-text focus:outline-none" placeholder="예: 지금 확인하기" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text">버튼 URL <span className="text-[10px] text-text-muted">(선택)</span></label>
                                    <input value={form.buttonUrl} onChange={e => setForm(f => ({ ...f, buttonUrl: e.target.value }))}
                                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-text focus:outline-none" placeholder="https://..." />
                                </div>
                            </div>
                            {data?.senders && data.senders.length > 0 && (
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text">발신자 <span className="text-[10px] text-text-muted">(선택)</span></label>
                                    <select value={form.senderId} onChange={e => setForm(f => ({ ...f, senderId: e.target.value }))}
                                        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-text focus:outline-none bg-white">
                                        <option value="">기본 발신자</option>
                                        {data.senders.map(s => (
                                            <option key={s.id} value={s.id}>{s.from_name} &lt;{s.from_addr}&gt;</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {saveError && (
                                <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{saveError}</p>
                            )}
                            <div className="flex justify-end gap-2 pt-1">
                                <button type="button" onClick={() => setModalOpen(false)}
                                    className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-text-sub hover:bg-surface">
                                    취소
                                </button>
                                <button type="submit" disabled={saving}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-text px-4 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50">
                                    {saving ? <><Loader2 size={13} className="animate-spin" /> 저장 중</> : '초안으로 저장'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusChip({ status }: { status: MyCampaign['status'] }) {
    const map: Record<MyCampaign['status'], { label: string; cls: string }> = {
        draft:     { label: '초안',    cls: 'bg-surface text-text-muted' },
        scheduled: { label: '예약',    cls: 'bg-info/10 text-info' },
        sending:   { label: '발송 중', cls: 'bg-warning/10 text-warning' },
        sent:      { label: '완료',    cls: 'bg-success/10 text-success' },
        failed:    { label: '실패',    cls: 'bg-danger/10 text-danger' },
    };
    const { label, cls } = map[status];
    return <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${cls}`}>{label}</span>;
}

function Kpi({ icon: Icon, label, value, accent, loading, suffix }: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string; value: number; accent: string; loading: boolean; suffix?: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Icon size={12} /> {label}
            </div>
            <div className="mt-1 text-2xl font-bold" style={{ color: accent }}>
                {loading ? '—' : `${value.toLocaleString()}${suffix ?? ''}`}
            </div>
        </div>
    );
}
