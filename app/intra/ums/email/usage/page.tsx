"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";
import { Mail, Send, CheckCircle2, Eye, MousePointerClick, XOctagon, AlertTriangle, TrendingUp } from "lucide-react";

interface UsageRow {
    kind: string;
    count: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    complained: number;
}

interface SenderUsage {
    from_addr: string;
    today: number;
    month: number;
    daily_limit: number;
}

interface DomainHealth {
    from_domain: string;
    total: number;
    bounced: number;
    complained: number;
    bounce_rate: number;
    complaint_rate: number;
}

export default function UsagePage() {
    const [today, setToday] = useState<UsageRow[]>([]);
    const [month, setMonth] = useState<UsageRow[]>([]);
    const [senders, setSenders] = useState<SenderUsage[]>([]);
    const [health, setHealth] = useState<DomainHealth[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        const supabase = createClient();
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthStart30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

        // 오늘·이번달 통계 집계 (클라이언트 aggregation)
        const [todayRes, monthRes, sendersRes, healthRes] = await Promise.all([
            supabase.from('email_sends').select('kind, status, delivered_at, opened_at, clicked_at, bounced_at, complained_at').gte('created_at', startOfDay),
            supabase.from('email_sends').select('kind, status, delivered_at, opened_at, clicked_at, bounced_at, complained_at').gte('created_at', startOfMonth),
            supabase.from('email_senders').select('from_addr, daily_limit').eq('is_active', true),
            supabase.from('email_sends').select('from_addr, bounced_at, complained_at').gte('created_at', monthStart30),
        ]);

        const aggregate = (rows: { kind: string; delivered_at: string | null; opened_at: string | null; clicked_at: string | null; bounced_at: string | null; complained_at: string | null }[] | null): UsageRow[] => {
            const map: Record<string, UsageRow> = {};
            for (const r of rows ?? []) {
                if (!map[r.kind]) map[r.kind] = { kind: r.kind, count: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, complained: 0 };
                const m = map[r.kind];
                m.count++;
                if (r.delivered_at) m.delivered++;
                if (r.opened_at) m.opened++;
                if (r.clicked_at) m.clicked++;
                if (r.bounced_at) m.bounced++;
                if (r.complained_at) m.complained++;
            }
            return Object.values(map);
        };
        setToday(aggregate(todayRes.data));
        setMonth(aggregate(monthRes.data));

        // 발신자별 사용량
        if (sendersRes.data) {
            const todaySenders: Record<string, number> = {};
            const monthSenders: Record<string, number> = {};
            for (const r of (todayRes.data ?? []) as { from_addr?: string }[]) if (r.from_addr) todaySenders[r.from_addr] = (todaySenders[r.from_addr] ?? 0) + 1;
            for (const r of (monthRes.data ?? []) as { from_addr?: string }[]) if (r.from_addr) monthSenders[r.from_addr] = (monthSenders[r.from_addr] ?? 0) + 1;
            setSenders((sendersRes.data as { from_addr: string; daily_limit: number }[]).map(s => ({
                from_addr: s.from_addr,
                daily_limit: s.daily_limit,
                today: todaySenders[s.from_addr] ?? 0,
                month: monthSenders[s.from_addr] ?? 0,
            })));
        }

        // 도메인 건강도
        if (healthRes.data) {
            const domainMap: Record<string, DomainHealth> = {};
            for (const r of healthRes.data as { from_addr: string; bounced_at: string | null; complained_at: string | null }[]) {
                const domain = r.from_addr?.split('@')[1] ?? 'unknown';
                if (!domainMap[domain]) domainMap[domain] = { from_domain: domain, total: 0, bounced: 0, complained: 0, bounce_rate: 0, complaint_rate: 0 };
                domainMap[domain].total++;
                if (r.bounced_at) domainMap[domain].bounced++;
                if (r.complained_at) domainMap[domain].complained++;
            }
            Object.values(domainMap).forEach(d => {
                d.bounce_rate = d.total > 0 ? (d.bounced / d.total) * 100 : 0;
                d.complaint_rate = d.total > 0 ? (d.complained / d.total) * 100 : 0;
            });
            setHealth(Object.values(domainMap));
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div className="py-20 text-center text-sm text-neutral-400">집계 중...</div>;

    const sumToday = today.reduce((a, r) => a + r.count, 0);
    const sumMonth = month.reduce((a, r) => a + r.count, 0);
    const pct = (n: number, d: number) => d > 0 ? Math.round((n / d) * 100) : 0;

    const KIND_LABEL: Record<string, string> = { newsletter: '뉴스레터', crm_broadcast: 'CRM', transactional: '트랜잭션', confirm: '구독 인증' };

    return (
        <div>
            <PageHeader title="Email Usage" description="일·월 발송량, 발신자 사용률, 도메인 건강도" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Mail className="h-3 w-3 text-neutral-400" />
                        <span className="text-[11px] text-neutral-500">오늘 발송</span>
                    </div>
                    <p className="text-2xl font-bold">{sumToday}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-3 w-3 text-neutral-400" />
                        <span className="text-[11px] text-neutral-500">이번 달 누적</span>
                    </div>
                    <p className="text-2xl font-bold">{sumMonth}</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Eye className="h-3 w-3 text-blue-500" />
                        <span className="text-[11px] text-neutral-500">월 오픈율</span>
                    </div>
                    <p className="text-2xl font-bold">{pct(month.reduce((a,r) => a+r.opened, 0), sumMonth)}%</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <XOctagon className="h-3 w-3 text-red-500" />
                        <span className="text-[11px] text-neutral-500">월 바운스율</span>
                    </div>
                    <p className="text-2xl font-bold">{pct(month.reduce((a,r) => a+r.bounced, 0), sumMonth)}%</p>
                </div>
            </div>

            {/* 종류별 표 */}
            <div className="border border-neutral-200 bg-white mb-6 overflow-hidden">
                <div className="px-4 py-2 border-b border-neutral-100 text-xs font-semibold">종류별 (이번 달)</div>
                <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 text-[11px]">
                        <tr>
                            <th className="px-3 py-2 text-left">종류</th>
                            <th className="px-3 py-2 text-right">발송</th>
                            <th className="px-3 py-2 text-right">전달</th>
                            <th className="px-3 py-2 text-right">오픈</th>
                            <th className="px-3 py-2 text-right">클릭</th>
                            <th className="px-3 py-2 text-right">바운스</th>
                            <th className="px-3 py-2 text-right">신고</th>
                        </tr>
                    </thead>
                    <tbody>
                        {month.map(r => (
                            <tr key={r.kind} className="border-t border-neutral-100">
                                <td className="px-3 py-2 font-medium">{KIND_LABEL[r.kind] || r.kind}</td>
                                <td className="px-3 py-2 text-right">{r.count}</td>
                                <td className="px-3 py-2 text-right text-green-600">{r.delivered}</td>
                                <td className="px-3 py-2 text-right text-blue-600">{r.opened} <span className="text-neutral-400 text-[10px]">({pct(r.opened, r.count)}%)</span></td>
                                <td className="px-3 py-2 text-right text-indigo-600">{r.clicked} <span className="text-neutral-400 text-[10px]">({pct(r.clicked, r.count)}%)</span></td>
                                <td className="px-3 py-2 text-right text-red-600">{r.bounced}</td>
                                <td className="px-3 py-2 text-right text-amber-600">{r.complained}</td>
                            </tr>
                        ))}
                        {month.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-neutral-400">발송 기록 없음</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* 발신자 사용률 */}
            <div className="border border-neutral-200 bg-white mb-6">
                <div className="px-4 py-2 border-b border-neutral-100 text-xs font-semibold">발신자별 사용률</div>
                <div className="p-4 space-y-3">
                    {senders.map(s => {
                        const pctUsed = Math.min(100, (s.today / s.daily_limit) * 100);
                        return (
                            <div key={s.from_addr}>
                                <div className="flex items-center justify-between mb-1 text-xs">
                                    <span className="font-mono">{s.from_addr}</span>
                                    <span className="text-neutral-500">오늘 {s.today} / {s.daily_limit} · 월 {s.month}</span>
                                </div>
                                <div className="h-1.5 bg-neutral-100 rounded overflow-hidden">
                                    <div className={`h-full transition-all ${pctUsed > 80 ? 'bg-red-500' : pctUsed > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${pctUsed}%` }} />
                                </div>
                            </div>
                        );
                    })}
                    {senders.length === 0 && <p className="text-center text-xs text-neutral-400 py-4">활성 발신자 없음</p>}
                </div>
            </div>

            {/* 도메인 건강도 */}
            <div className="border border-neutral-200 bg-white">
                <div className="px-4 py-2 border-b border-neutral-100 text-xs font-semibold">도메인 건강도 (최근 30일)</div>
                <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 text-[11px]">
                        <tr>
                            <th className="px-3 py-2 text-left">도메인</th>
                            <th className="px-3 py-2 text-right">총 발송</th>
                            <th className="px-3 py-2 text-right">바운스율</th>
                            <th className="px-3 py-2 text-right">신고율</th>
                            <th className="px-3 py-2 text-left">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {health.map(d => {
                            const isHealthy = d.bounce_rate < 5 && d.complaint_rate < 0.1;
                            const isWarning = d.bounce_rate < 10 && d.complaint_rate < 0.3;
                            return (
                                <tr key={d.from_domain} className="border-t border-neutral-100">
                                    <td className="px-3 py-2 font-mono">{d.from_domain}</td>
                                    <td className="px-3 py-2 text-right">{d.total}</td>
                                    <td className={`px-3 py-2 text-right ${d.bounce_rate > 5 ? 'text-red-600 font-semibold' : ''}`}>{d.bounce_rate.toFixed(2)}%</td>
                                    <td className={`px-3 py-2 text-right ${d.complaint_rate > 0.1 ? 'text-amber-600 font-semibold' : ''}`}>{d.complaint_rate.toFixed(3)}%</td>
                                    <td className="px-3 py-2">
                                        {isHealthy ? <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px]"><CheckCircle2 className="h-3 w-3" /> 정상</span>
                                            : isWarning ? <span className="inline-flex items-center gap-1 text-amber-600 text-[11px]"><AlertTriangle className="h-3 w-3" /> 주의</span>
                                            : <span className="inline-flex items-center gap-1 text-red-600 text-[11px]"><XOctagon className="h-3 w-3" /> 위험</span>}
                                    </td>
                                </tr>
                            );
                        })}
                        {health.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-neutral-400">데이터 없음</td></tr>}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-[11px] text-neutral-400 space-y-1">
                <p>· 바운스율 5% 이상, 신고율 0.1% 이상이면 도메인 평판 하락 위험 — 발송 일시 중단 권장</p>
                <p>· Resend 무료 플랜 하루 100통, Pro 월 50,000통 (업그레이드 후 확장)</p>
            </div>
        </div>
    );
}
