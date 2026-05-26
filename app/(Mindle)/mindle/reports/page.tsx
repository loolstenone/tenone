// Mindle 주간 리포트 (Server Component) — Phase 0 정직성 회복
// 발송 완료된 newsletter_issues만 노출. 발송 0건이면 "준비 중" 안내.

import Link from "next/link";
import { Calendar, FileText, Mail, ChevronRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import NewsletterSubscribeForm from "@/components/newsletter/NewsletterSubscribeForm";

export const revalidate = 300;

interface SentIssue {
    id: string;
    title: string;
    sent_at: string;
    total_sent: number | null;
    open_rate: number | null;
}

async function fetchSentIssues(): Promise<SentIssue[]> {
    const admin = createAdminClient();
    const { data } = await admin
        .from("newsletter_issues")
        .select("id, title, sent_at, total_sent, open_rate")
        .eq("status", "sent")
        .not("sent_at", "is", null)
        .order("sent_at", { ascending: false })
        .limit(20);
    return (data ?? []) as SentIssue[];
}

async function fetchSubscriberCount(): Promise<number> {
    const admin = createAdminClient();
    const { count } = await admin
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true });
    return count ?? 0;
}

export default async function MindleReportsPage() {
    const [issues, subscribers] = await Promise.all([
        fetchSentIssues(),
        fetchSubscriberCount(),
    ]);

    return (
        <div className="bg-[#0A0A0A] min-h-screen">
            <div className="mx-auto max-w-5xl px-6">
                <section className="py-8 border-b border-neutral-800/50">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">주간 리포트</h1>
                            <p className="text-neutral-500 text-sm">
                                AI가 분석한 트렌드 리포트를 매주 월요일 발행할 예정입니다.
                            </p>
                            <p className="mt-2 text-[11px] text-neutral-600">
                                🔬 실측 DB · 발송된 호수만 노출 · newsletter_issues
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-[11px] text-neutral-500 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
                            <Calendar className="w-3 h-3" /> 매주 월요일 오전 9시 (예정)
                        </div>
                    </div>
                </section>

                <section className="py-6">
                    {issues.length === 0 ? (
                        <div className="text-center py-16 px-6 bg-neutral-900/40 border border-neutral-800/40 rounded-2xl">
                            <Mail className="w-10 h-10 text-neutral-700 mx-auto mb-4" />
                            <h2 className="text-lg font-bold text-white mb-2">
                                첫 호 발행을 준비하고 있습니다
                            </h2>
                            <p className="text-sm text-neutral-500 mb-1 max-w-md mx-auto leading-relaxed">
                                현재 트렌드 카드 큐레이션과 발행 파이프라인을 정비하고 있습니다.
                                첫 호가 발행되면 구독자 분께 가장 먼저 발송됩니다.
                            </p>
                            <p className="text-xs text-neutral-600 mb-6">
                                현재 구독자 <span className="text-white font-medium">{subscribers.toLocaleString()}</span>명
                            </p>
                            <Link
                                href="/mindle/trends"
                                className="inline-flex items-center gap-1.5 text-sm text-[#F5C518] hover:underline"
                            >
                                지금 트렌드 카드 보러가기 <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-800/40">
                            {issues.map((issue, i) => (
                                <article key={issue.id} className="group py-6">
                                    <div className="flex items-start gap-5">
                                        <div className="hidden sm:flex flex-col items-center shrink-0 w-16 pt-1">
                                            <span className={`text-[10px] font-bold tracking-wider ${i === 0 ? "text-[#F5C518]" : "text-neutral-500"}`}>
                                                #{issues.length - i}
                                            </span>
                                            <span className="text-[10px] text-neutral-700 mt-0.5">
                                                {issue.sent_at.slice(5, 10).replace("-", ".")}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {i === 0 && (
                                                <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded bg-[#F5C518] text-black mb-2">
                                                    최신
                                                </span>
                                            )}
                                            <h2 className="text-lg font-bold leading-snug mb-2 text-white">
                                                {issue.title}
                                            </h2>
                                            <div className="flex items-center gap-4 text-[10px] text-neutral-600">
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-2.5 h-2.5" />
                                                    발송 {(issue.total_sent ?? 0).toLocaleString()}
                                                </span>
                                                {issue.open_rate !== null && (
                                                    <span>오픈률 {Math.round((issue.open_rate ?? 0) * 100)}%</span>
                                                )}
                                                <span>{issue.sent_at.slice(0, 10)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {issues.length === 0 && (
                    <section className="py-12 border-t border-neutral-800/40">
                        <NewsletterSubscribeForm source="mindle-reports" brandName="Mindle" dark accentColor="#F5C518" />
                    </section>
                )}
            </div>
        </div>
    );
}
