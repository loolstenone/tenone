"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Mail, Loader2 } from "lucide-react";
import { PageHeader, Card, SectionTitle } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface MonthlyGrowth {
    month: string;
    new_subs: number;
    unsubs: number;
}

export default function MindleRevenuePage() {
    const [loading, setLoading] = useState(true);
    const [totalSubs, setTotalSubs] = useState(0);
    const [activeSubs, setActiveSubs] = useState(0);
    const [thisMonthNew, setThisMonthNew] = useState(0);
    const [thisMonthUnsub, setThisMonthUnsub] = useState(0);
    const [issuesSent, setIssuesSent] = useState(0);
    const [avgOpenRate, setAvgOpenRate] = useState<number | null>(null);

    useEffect(() => {
        const sb = createClient();
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        Promise.all([
            sb.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("site_id", "mindle"),
            sb.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("site_id", "mindle").eq("is_active", true),
            sb.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("site_id", "mindle").gte("created_at", monthStart),
            sb.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("site_id", "mindle").eq("is_active", false).gte("updated_at", monthStart),
            sb.from("newsletter_issues").select("*", { count: "exact", head: true }).eq("status", "sent"),
            sb.from("newsletter_issues").select("open_rate").eq("status", "sent").limit(10),
        ]).then(([total, active, newSubs, unsubs, sent, issues]) => {
            setTotalSubs(total.count ?? 0);
            setActiveSubs(active.count ?? 0);
            setThisMonthNew(newSubs.count ?? 0);
            setThisMonthUnsub(unsubs.count ?? 0);
            setIssuesSent(sent.count ?? 0);
            const rates = (issues.data ?? []).map((i: { open_rate?: number }) => i.open_rate).filter(Boolean) as number[];
            setAvgOpenRate(rates.length > 0 ? +(rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1) : null);
            setLoading(false);
        });
    }, []);

    const retentionRate = totalSubs > 0 ? +((activeSubs / totalSubs) * 100).toFixed(1) : null;

    return (
        <div>
            <PageHeader title="손익 관리" description="Mindle 뉴스레터 구독 성장 · 발송 현황" />

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-neutral-400"><Users className="h-4 w-4" /><span className="text-xs">활성 구독자</span></div>
                            <p className="text-2xl font-bold">{activeSubs.toLocaleString()}</p>
                            <p className="text-xs text-neutral-400 mt-1">전체 {totalSubs.toLocaleString()}명</p>
                        </div>
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-neutral-400"><TrendingUp className="h-4 w-4" /><span className="text-xs">이번달 신규</span></div>
                            <p className="text-2xl font-bold">{thisMonthNew > 0 ? `+${thisMonthNew}` : "0"}</p>
                            <p className="text-xs text-neutral-400 mt-1">해지 {thisMonthUnsub}명</p>
                        </div>
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-neutral-400"><Mail className="h-4 w-4" /><span className="text-xs">총 발송 이슈</span></div>
                            <p className="text-2xl font-bold">{issuesSent}</p>
                            <p className="text-xs text-neutral-400 mt-1">누적 발송 횟수</p>
                        </div>
                        <div className="border border-neutral-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-neutral-400"><TrendingUp className="h-4 w-4" /><span className="text-xs">유지율</span></div>
                            <p className="text-2xl font-bold">{retentionRate != null ? `${retentionRate}%` : "-"}</p>
                            <p className="text-xs text-neutral-400 mt-1">활성/전체 구독자</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <SectionTitle title="구독 현황 요약" />
                            <div className="space-y-3">
                                {[
                                    { label: "전체 구독자", value: totalSubs.toLocaleString() + "명" },
                                    { label: "활성 구독자", value: activeSubs.toLocaleString() + "명" },
                                    { label: "비활성 (수신 거부)", value: (totalSubs - activeSubs).toLocaleString() + "명" },
                                    { label: "이번달 신규 구독", value: `+${thisMonthNew}명` },
                                    { label: "이번달 해지", value: `-${thisMonthUnsub}명` },
                                    { label: "평균 오픈율", value: avgOpenRate != null ? `${avgOpenRate}%` : "수집 중" },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                                        <span className="text-sm text-neutral-600">{label}</span>
                                        <span className="text-sm font-semibold text-neutral-900">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card>
                            <SectionTitle title="수익화 로드맵" />
                            <div className="space-y-3">
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
                                    <p className="font-semibold mb-1">현재 — 무료 뉴스레터</p>
                                    <p>구독자 기반 확장 단계. 광고 수익 없음.</p>
                                </div>
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">Phase 2 — 프리미엄 구독</p>
                                    <p>선별된 심층 리포트 · 업계 인사이트 유료화</p>
                                </div>
                                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600">
                                    <p className="font-semibold mb-1">Phase 3 — 브랜드 스폰서십</p>
                                    <p>구독자 세그먼트 기반 타겟 광고·제휴</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
