'use client';

// 이메일 채널 — email_sends + email_senders + newsletter_subscribers 실 DB

import { useEffect, useState } from 'react';
import { Mail, Send, Eye, MousePointerClick, AlertCircle, Users, CheckCircle2 } from 'lucide-react';
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

export default function EmailPage() {
    const [data, setData] = useState<EmailResp | null>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/smarcomm/crm/email?days=${days}`)
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, [days]);

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
                <div className="flex gap-1">
                    {[7, 30, 90].map(d => (
                        <button key={d} onClick={() => setDays(d)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${days === d ? 'bg-text text-white' : 'bg-surface text-text-sub hover:text-text'}`}>
                            {d}일
                        </button>
                    ))}
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
        </div>
    );
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
