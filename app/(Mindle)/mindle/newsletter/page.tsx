"use client";

import { useState, useEffect } from "react";
import { Mail, Check, ArrowRight, Zap, TrendingUp, BarChart3, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const benefits = [
    {
        icon: TrendingUp,
        title: "트렌드 다이제스트",
        desc: "엄선된 신호와 부상하는 패턴을 정기적으로 전달합니다.",
    },
    {
        icon: Zap,
        title: "브레이킹 시그널",
        desc: "데이터에서 중요한 변화가 감지되면 실시간으로 알려드립니다.",
    },
    {
        icon: BarChart3,
        title: "독점 데이터 인사이트",
        desc: "공개 사이트에서 볼 수 없는 차트, 랭킹, 심층 분석.",
    },
    {
        icon: FileText,
        title: "리포트 선공개",
        desc: "정식 발행 전에 리포트를 먼저 받아보세요.",
    },
];

interface PastIssue {
    id: number;
    title: string;
    date: string;
}

export default function NewsletterPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agree, setAgree] = useState(false);
    const [pastIssues, setPastIssues] = useState<PastIssue[]>([]);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from('newsletter_issues')
            .select('id, title, date')
            .eq('published', true)
            .order('date', { ascending: false })
            .limit(5)
            .then(({ data }) => { if (data) setPastIssues(data); });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !agree) return;
        setLoading(true);
        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), source: 'mindle' }),
            });
            if (res.ok) setSubmitted(true);
        } catch { /* 실패 시 무시 */ }
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white pt-20 pb-20">
            {/* Hero */}
            <section className="max-w-3xl mx-auto px-6 text-center mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5C518]/10 text-[#F5C518] text-xs font-medium mb-6">
                    <Mail className="w-3.5 h-3.5" />
                    뉴스레터
                </div>
                <h1 className="font-black tracking-tight mb-6">
                    <span className="block text-xl md:text-2xl text-neutral-400 mb-2">당신의 호기심을 피우는</span>
                    <span className="text-[#F5C518] text-4xl md:text-6xl">트렌드 홀씨.</span>
                </h1>
                <p className="text-neutral-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
                    Mindle의 트렌드 인사이트로 앞서 나가세요. 무료.
                </p>

                {/* Subscribe Form */}
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3 mb-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일을 입력하세요"
                                required
                                className="flex-1 px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#F5C518] transition"
                            />
                            <button
                                type="submit"
                                disabled={loading || !agree}
                                className="px-6 py-3 rounded-lg bg-[#F5C518] text-black font-bold hover:bg-[#E0B015] transition flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                                {loading ? "구독 중..." : "구독하기"}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                        {/* 개인정보 동의 */}
                        <label className="flex items-start gap-2 cursor-pointer text-left">
                            <input
                                type="checkbox"
                                checked={agree}
                                onChange={e => setAgree(e.target.checked)}
                                className="mt-0.5 shrink-0 accent-[#F5C518]"
                            />
                            <span className="text-[11px] text-neutral-500 leading-relaxed">
                                뉴스레터 발송을 위한 이메일 수집 및 수신에 동의합니다. 언제든 수신거부 가능합니다.
                            </span>
                        </label>
                    </form>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-green-400 bg-green-400/10 rounded-lg px-6 py-5 max-w-md mx-auto">
                        <div className="flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">구독 완료! 받은 편지함을 확인하세요.</span>
                        </div>
                        <p className="text-[11px] text-neutral-500">
                            Mindle과 함께 Ten:One™ Universe의 일원이 되셨습니다.
                        </p>
                    </div>
                )}
            </section>

            {/* Benefits */}
            <section className="max-w-4xl mx-auto px-6 mb-20">
                <h2 className="text-2xl font-bold text-center mb-10">구독하면 받는 것들</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {benefits.map((b) => (
                        <div key={b.title} className="p-6 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition">
                            <b.icon className="w-8 h-8 text-[#F5C518] mb-4" />
                            <h3 className="text-lg font-bold mb-2">{b.title}</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">{b.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Past Issues */}
            {pastIssues.length > 0 && (
                <section className="max-w-3xl mx-auto px-6 mb-20">
                    <h2 className="text-2xl font-bold text-center mb-10">지난 호</h2>
                    <div className="space-y-3">
                        {pastIssues.map((issue) => (
                            <div
                                key={issue.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition group"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-neutral-600 text-sm w-24 shrink-0">{issue.date}</span>
                                    <span className="font-medium group-hover:text-[#F5C518] transition">{issue.title}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-[#F5C518] transition" />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Bottom CTA */}
            <section className="max-w-2xl mx-auto px-6 text-center">
                <div className="p-10 rounded-2xl bg-gradient-to-b from-neutral-900 to-[#0A0A0A] border border-neutral-800">
                    <h2 className="text-2xl font-bold mb-3">다음 신호를 놓치지 마세요.</h2>
                    <p className="text-neutral-400 mb-6">가장 좋은 인사이트는 가장 먼저 행동하는 것입니다.</p>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일을 입력하세요"
                                required
                                className="flex-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#F5C518] transition"
                            />
                            <button
                                type="submit"
                                disabled={loading || !agree}
                                className="px-6 py-3 rounded-lg bg-[#F5C518] text-black font-bold hover:bg-[#E0B015] transition disabled:opacity-40"
                            >
                                {loading ? "..." : "구독"}
                            </button>
                        </form>
                    ) : (
                        <p className="text-green-400 font-medium">이미 구독 중입니다!</p>
                    )}
                </div>
            </section>
        </main>
    );
}
