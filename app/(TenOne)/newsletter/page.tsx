"use client";

import { useState, useEffect } from "react";
import { Mail, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";
import NewsletterSubscribeForm from "@/components/newsletter/NewsletterSubscribeForm";

interface NewsletterIssue {
    id: number;
    title: string;
    date: string;
    category: string;
    url?: string;
}

const categoryStyle: Record<string, string> = {
    MADLeague: "bg-violet-50 text-violet-600",
    LUKI: "bg-blue-50 text-blue-600",
    Badak: "bg-neutral-100 text-neutral-600",
    Culture: "bg-amber-50 text-amber-600",
    Universe: "bg-neutral-900 text-white",
};

export default function NewsletterPage() {
    const { user, isAuthenticated } = useAuth();
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [pastIssues, setPastIssues] = useState<NewsletterIssue[]>([]);

    const isMemberSubscribed = isAuthenticated && user?.newsletterSubscribed;

    useEffect(() => {
        const supabase = createClient();
        supabase.from('newsletter_issues').select('id, title, date, category, url')
            .eq('published', true).order('date', { ascending: false }).limit(12)
            .then(({ data }: { data: NewsletterIssue[] | null }) => { if (data && data.length > 0) setPastIssues(data); });
    }, []);

    const handleMemberSubscribe = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    nickname: user?.name,
                    memberId: user?.id,
                    source: 'tenone-newsletter',
                }),
            });
            if (res.ok) setSent(true);
            else alert('구독에 실패했습니다. 다시 시도해주세요.');
        } catch {
            alert('네트워크 오류가 발생했습니다.');
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            {/* 헤더 */}
            <div className="text-center mb-10 md:mb-16">
                <p className="text-xs tracking-[0.3em] tn-text-sub uppercase mb-3">Newsletter</p>
                <h1 className="text-xl md:text-3xl font-bold tracking-tight mb-4">
                    Ten:One™ Universe의<br />이야기를 받아보세요
                </h1>
                <p className="text-sm tn-text-sub max-w-lg mx-auto">
                    프로젝트 소식, 크루 이야기, 업계 인사이트를 보내드립니다.
                </p>
            </div>

            {/* 구독 폼 */}
            <div className="tn-bg-alt border tn-border p-8 mb-10 md:mb-16">
                {isMemberSubscribed ? (
                    <div className="text-center py-4">
                        <Mail className="h-8 w-8 tn-text-sub mx-auto mb-3" />
                        <h3 className="text-sm font-bold mb-1">이미 뉴스레터를 구독하고 있습니다</h3>
                        <p className="text-xs tn-text-sub">{user?.email}</p>
                        <Link href="/profile" className="inline-block mt-3 text-xs tn-text-sub hover:text-neutral-700 underline underline-offset-2">
                            프로필에서 구독 관리 →
                        </Link>
                    </div>
                ) : isAuthenticated && !sent ? (
                    <div className="text-center py-2">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-bold">
                                {user?.avatarInitials}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs tn-text-sub">{user?.email}</p>
                            </div>
                        </div>
                        <button onClick={handleMemberSubscribe} disabled={submitting}
                            className="px-8 py-3 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-40">
                            <Mail className="h-4 w-4" /> {submitting ? "처리 중..." : "뉴스레터 구독하기"}
                        </button>
                        <p className="text-[10px] tn-text-muted mt-3">신청 후 이메일로 확인 절차가 진행됩니다</p>
                    </div>
                ) : isAuthenticated && sent ? (
                    <div className="text-center py-6">
                        <Mail className="h-10 w-10 tn-text-sub mx-auto mb-3" />
                        <h3 className="text-sm font-bold mb-2">확인 메일을 보냈습니다</h3>
                        <p className="text-xs tn-text-sub">메일함을 확인하고 구독을 완료해주세요.</p>
                    </div>
                ) : (
                    <NewsletterSubscribeForm source="tenone-newsletter" brandName="Ten:One™ Universe" />
                )}
            </div>

            {/* 지난 뉴스레터 */}
            <div>
                <h2 className="text-sm font-bold mb-6">지난 뉴스레터</h2>
                {pastIssues.length === 0 ? (
                    <div className="border tn-border tn-surface p-10 text-center">
                        <Mail className="h-8 w-8 tn-text-muted mx-auto mb-3" />
                        <p className="text-sm font-medium mb-1">아직 발행된 뉴스레터가 없습니다</p>
                        <p className="text-xs tn-text-sub">구독하시면 첫 번째 뉴스레터가 발행될 때 알려드립니다.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pastIssues.map(issue => {
                            const inner = (
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${categoryStyle[issue.category] || "bg-neutral-100 tn-text-sub"}`}>
                                                {issue.category}
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] tn-text-sub">
                                                <Calendar className="h-3 w-3" /> {issue.date}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-medium group-hover:text-neutral-600 transition-colors">{issue.title}</h3>
                                    </div>
                                    {issue.url && <ExternalLink className="h-4 w-4 tn-text-muted group-hover:tn-text-sub transition-colors shrink-0 mt-1" />}
                                </div>
                            );
                            return issue.url ? (
                                <a key={issue.id} href={issue.url} target="_blank" rel="noopener noreferrer"
                                    className="block border tn-border tn-surface p-5 hover:border-neutral-400 transition-colors group">
                                    {inner}
                                </a>
                            ) : (
                                <div key={issue.id} className="border tn-border tn-surface p-5 hover:border-neutral-400 transition-colors group">
                                    {inner}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
