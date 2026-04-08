"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Mail, Eye, Send, Edit2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface IssueRow {
    id: string;
    title: string;
    status: "draft" | "scheduled" | "sent";
    sent_at: string | null;
    recipient_count: number;
    open_rate: number | null;
    created_at: string;
}

const statusLabel: Record<string, string> = { draft: "작성중", scheduled: "예약", sent: "발송완료" };
const statusStyle: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    scheduled: "bg-neutral-200 text-neutral-700",
    sent: "bg-neutral-900 text-white",
};

export default function NewsletterDashboard() {
    const [issues, setIssues] = useState<IssueRow[]>([]);
    const [totalSubs, setTotalSubs] = useState(0);
    const [activeSubs, setActiveSubs] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const loadData = useCallback(async () => {
        setLoading(true);
        const [issueRes, subRes] = await Promise.all([
            supabase.from("newsletter_issues").select("id, title, status, sent_at, recipient_count, open_rate, created_at").order("created_at", { ascending: false }).limit(5),
            supabase.from("newsletter_subscribers").select("id, is_active"),
        ]);
        if (issueRes.data) setIssues(issueRes.data as IssueRow[]);
        if (subRes.data) {
            const rows = subRes.data as { id: string; is_active: boolean }[];
            setTotalSubs(rows.length);
            setActiveSubs(rows.filter((r) => r.is_active).length);
        }
        setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const sentIssues = issues.filter((i) => i.status === "sent");
    const draftIssues = issues.filter((i) => i.status === "draft");
    const avgOpenRate = sentIssues.length > 0
        ? sentIssues.reduce((sum, i) => sum + (i.open_rate || 0), 0) / sentIssues.length
        : null;

    if (loading) return <div className="flex justify-center py-20"><div className="h-6 w-6 border-2 border-neutral-300 border-t-neutral-800 rounded-full animate-spin" /></div>;

    return (
        <div>
            <PageHeader title="뉴스레터" description="발송 현황 및 구독자 통계" />

            {/* 통계 카드 */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Users className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-xs text-neutral-400">활성 구독자</span>
                    </div>
                    <p className="text-2xl font-bold">{activeSubs}<span className="text-xs font-normal text-neutral-400 ml-1">명</span></p>
                    <p className="text-[11px] text-neutral-400 mt-1">전체 {totalSubs}명 중</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Send className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-xs text-neutral-400">발송 완료</span>
                    </div>
                    <p className="text-2xl font-bold">{sentIssues.length}<span className="text-xs font-normal text-neutral-400 ml-1">건</span></p>
                    <p className="text-[11px] text-neutral-400 mt-1">작성중 {draftIssues.length}건</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Eye className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-xs text-neutral-400">평균 오픈율</span>
                    </div>
                    <p className="text-2xl font-bold">
                        {avgOpenRate != null ? avgOpenRate.toFixed(1) : "—"}
                        <span className="text-xs font-normal text-neutral-400 ml-1">%</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">발송 완료 기준</p>
                </div>
                <div className="border border-neutral-200 bg-white p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Mail className="h-3.5 w-3.5 text-neutral-400" />
                        <span className="text-xs text-neutral-400">총 수신</span>
                    </div>
                    <p className="text-2xl font-bold">
                        {sentIssues.reduce((sum, i) => sum + i.recipient_count, 0).toLocaleString()}
                        <span className="text-xs font-normal text-neutral-400 ml-1">명</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-1">누적 발송 수</p>
                </div>
            </div>

            {/* 바로가기 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <Link href="/intra/ums/newsletter/issues"
                    className="flex items-center justify-between p-4 border border-neutral-200 bg-white hover:border-neutral-400 transition-colors group">
                    <div>
                        <p className="text-sm font-medium mb-0.5">이슈 관리</p>
                        <p className="text-xs text-neutral-400">뉴스레터 작성 및 발송</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                </Link>
                <Link href="/intra/ums/newsletter/subscribers"
                    className="flex items-center justify-between p-4 border border-neutral-200 bg-white hover:border-neutral-400 transition-colors group">
                    <div>
                        <p className="text-sm font-medium mb-0.5">구독자</p>
                        <p className="text-xs text-neutral-400">구독자 목록 및 태그 관리</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                </Link>
            </div>

            {/* 최근 이슈 */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">최근 이슈</h2>
                    <Link href="/intra/ums/newsletter/issues" className="text-xs text-neutral-400 hover:text-neutral-700 flex items-center gap-1">
                        전체 보기 <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>
                <div className="space-y-2">
                    {issues.map((nl) => (
                        <div key={nl.id} className="flex items-center justify-between border border-neutral-200 bg-white p-3.5 hover:border-neutral-300 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${statusStyle[nl.status]}`}>{statusLabel[nl.status]}</span>
                                <span className="text-xs font-medium truncate">{nl.title}</span>
                            </div>
                            <div className="flex items-center gap-4 shrink-0 ml-4">
                                {nl.sent_at && <span className="text-[11px] text-neutral-400">{nl.sent_at.split("T")[0]}</span>}
                                {nl.recipient_count > 0 && <span className="text-[11px] text-neutral-400">{nl.recipient_count}명</span>}
                                {nl.open_rate != null && <span className="text-[11px] text-neutral-400">오픈 {nl.open_rate}%</span>}
                                <Link href="/intra/ums/newsletter/issues" className="p-1 hover:bg-neutral-100 rounded">
                                    <Edit2 className="h-3 w-3 text-neutral-300" />
                                </Link>
                            </div>
                        </div>
                    ))}
                    {issues.length === 0 && (
                        <div className="text-center py-10 text-neutral-400 text-sm">
                            아직 뉴스레터가 없습니다.{" "}
                            <Link href="/intra/ums/newsletter/issues" className="underline hover:text-neutral-700">첫 이슈 만들기 →</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
