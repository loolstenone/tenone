"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/intra/IntraUI";
import { Mail, Eye, MousePointerClick, AlertTriangle, CheckCircle2, XOctagon, Calendar } from "lucide-react";
import Link from "next/link";

interface Issue { id: string; title: string; sent_at: string | null; recipient_count: number; }
interface Send {
    id: string; to_addr: string; subject: string;
    status: string; sent_at: string | null;
    delivered_at: string | null; opened_at: string | null; clicked_at: string | null;
    bounced_at: string | null; complained_at: string | null;
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [issue, setIssue] = useState<Issue | null>(null);
    const [sends, setSends] = useState<Send[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string | null>(null);

    const load = useCallback(async () => {
        const supabase = createClient();
        const [issueRes, sendRes] = await Promise.all([
            supabase.from("newsletter_issues").select("id, title, sent_at, recipient_count").eq("id", id).single(),
            supabase.from("email_sends").select("*").eq("source_id", id).eq("kind", "newsletter").order("sent_at", { ascending: false }),
        ]);
        if (issueRes.data) setIssue(issueRes.data as Issue);
        if (sendRes.data) setSends(sendRes.data as Send[]);
        setLoading(false);
    }, [id]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>;
    if (!issue) return <div className="text-center py-20 text-neutral-400 text-sm">이슈를 찾을 수 없습니다.</div>;

    const total = sends.length;
    const delivered = sends.filter(s => s.delivered_at).length;
    const opened = sends.filter(s => s.opened_at).length;
    const clicked = sends.filter(s => s.clicked_at).length;
    const bounced = sends.filter(s => s.bounced_at).length;
    const complained = sends.filter(s => s.complained_at).length;

    const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;

    const filtered = filter
        ? sends.filter(s => {
            if (filter === 'delivered') return !!s.delivered_at;
            if (filter === 'opened') return !!s.opened_at;
            if (filter === 'clicked') return !!s.clicked_at;
            if (filter === 'bounced') return !!s.bounced_at;
            if (filter === 'complained') return !!s.complained_at;
            return true;
        })
        : sends;

    const stats = [
        { key: 'sent',       label: '발송',    value: total,      pct: null, icon: Mail,              color: 'text-neutral-700' },
        { key: 'delivered',  label: '전달',    value: delivered,  pct: pct(delivered),  icon: CheckCircle2,       color: 'text-green-600' },
        { key: 'opened',     label: '오픈',    value: opened,     pct: pct(opened),     icon: Eye,                color: 'text-blue-600' },
        { key: 'clicked',    label: '클릭',    value: clicked,    pct: pct(clicked),    icon: MousePointerClick,  color: 'text-indigo-600' },
        { key: 'bounced',    label: '바운스',  value: bounced,    pct: pct(bounced),    icon: XOctagon,           color: 'text-red-600' },
        { key: 'complained', label: '스팸신고',value: complained, pct: pct(complained), icon: AlertTriangle,      color: 'text-amber-600' },
    ] as const;

    return (
        <div>
            <PageHeader title={issue.title} description={issue.sent_at ? `${new Date(issue.sent_at).toLocaleString("ko-KR")} 발송` : "미발송"}>
                <Link href="/intra/ums/newsletter/issues" className="text-xs text-neutral-500 hover:text-neutral-900">← 목록</Link>
            </PageHeader>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                {stats.map(s => (
                    <button key={s.key} onClick={() => setFilter(filter === s.key ? null : s.key)}
                        className={`border p-4 text-left transition-colors ${filter === s.key ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                            <span className="text-[11px] text-neutral-500">{s.label}</span>
                        </div>
                        <p className="text-2xl font-bold">{s.value}</p>
                        {s.pct !== null && <p className="text-[11px] text-neutral-400 mt-0.5">{s.pct}%</p>}
                    </button>
                ))}
            </div>

            <div className="border border-neutral-200 bg-white">
                <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                    <h3 className="text-xs font-semibold">
                        수신자 {filter ? `· ${stats.find(s => s.key === filter)?.label}` : ''} ({filtered.length})
                    </h3>
                    {filter && <button onClick={() => setFilter(null)} className="text-[11px] text-neutral-500 hover:text-neutral-900">필터 해제</button>}
                </div>
                <table className="w-full text-xs">
                    <thead className="bg-neutral-50 text-neutral-500 text-[11px]">
                        <tr>
                            <th className="px-3 py-2 text-left font-medium">이메일</th>
                            <th className="px-3 py-2 text-left font-medium">상태</th>
                            <th className="px-3 py-2 text-left font-medium">발송</th>
                            <th className="px-3 py-2 text-left font-medium">오픈</th>
                            <th className="px-3 py-2 text-left font-medium">클릭</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice(0, 200).map(s => (
                            <tr key={s.id} className="border-t border-neutral-100 hover:bg-neutral-50">
                                <td className="px-3 py-2 font-mono text-[11px]">{s.to_addr}</td>
                                <td className="px-3 py-2">
                                    {s.complained_at ? <span className="text-amber-600">스팸신고</span>
                                     : s.bounced_at ? <span className="text-red-600">바운스</span>
                                     : s.clicked_at ? <span className="text-indigo-600">클릭</span>
                                     : s.opened_at ? <span className="text-blue-600">오픈</span>
                                     : s.delivered_at ? <span className="text-green-600">전달</span>
                                     : <span className="text-neutral-400">{s.status}</span>}
                                </td>
                                <td className="px-3 py-2 text-neutral-500">{s.sent_at ? new Date(s.sent_at).toLocaleString("ko-KR", { month:'numeric', day:'numeric', hour:'numeric', minute:'numeric' }) : '-'}</td>
                                <td className="px-3 py-2 text-neutral-500">{s.opened_at ? new Date(s.opened_at).toLocaleString("ko-KR", { month:'numeric', day:'numeric', hour:'numeric', minute:'numeric' }) : '-'}</td>
                                <td className="px-3 py-2 text-neutral-500">{s.clicked_at ? new Date(s.clicked_at).toLocaleString("ko-KR", { month:'numeric', day:'numeric', hour:'numeric', minute:'numeric' }) : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="py-10 text-center text-neutral-400 text-xs">수신 기록이 없습니다</div>}
                {filtered.length > 200 && <div className="py-2 text-center text-neutral-400 text-[11px] border-t border-neutral-100">최대 200건 표시 (전체 {filtered.length}건)</div>}
            </div>

            <p className="mt-4 text-[11px] text-neutral-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> 오픈·클릭 데이터는 Resend Webhook이 등록된 후 수신되는 이벤트부터 기록됩니다.
            </p>
        </div>
    );
}
