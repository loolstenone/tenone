"use client";

import { useState } from "react";
import { Mail, Check, ArrowRight, Zap, TrendingUp, BarChart3, FileText } from "lucide-react";

const benefits = [
    {
        icon: TrendingUp,
        title: "주간 트렌드 다이제스트",
        desc: "엄선된 신호와 부상하는 패턴을 매주 월요일 아침에 전달합니다.",
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
        title: "주간 리포트 선공개",
        desc: "정식 발행 24시간 전에 주간 리포트를 먼저 받아보세요.",
    },
];

const pastIssues = [
    { id: 1, date: "2026.03.24", title: "에이전트 AI, 기업 현장에 진입하다", reads: "2.4K" },
    { id: 2, date: "2026.03.17", title: "하이퍼로컬의 역설", reads: "1.8K" },
    { id: 3, date: "2026.03.10", title: "구독 피로감이 임계점에 달했다", reads: "2.1K" },
    { id: 4, date: "2026.03.03", title: "신뢰 격차 — AI와 소비자 불신의 충돌", reads: "1.6K" },
    { id: 5, date: "2026.02.24", title: "크리에이터 이코노미 3.0 — 인플루언서를 넘어서", reads: "1.9K" },
];

export default function NewsletterPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) });
        } catch { /* 실패해도 UI는 성공 표시 */ }
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white pt-20 pb-20">
            {/* Hero */}
            <section className="max-w-3xl mx-auto px-6 text-center mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5C518]/10 text-[#F5C518] text-xs font-medium mb-6">
                    <Mail className="w-3.5 h-3.5" />
                    뉴스레터
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                    당신의 호기심을 채우는<br />
                    <span className="text-[#F5C518]">트렌드 신호.</span>
                </h1>
                <p className="text-neutral-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
                    매주 Mindle의 트렌드 인사이트로 한 주를 시작하는 수천 명과 함께하세요.
                    무료, 주 1회, 스팸 없음.
                </p>

                {/* Subscribe Form */}
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
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
                            disabled={loading}
                            className="px-6 py-3 rounded-lg bg-[#F5C518] text-black font-bold hover:bg-[#E0B015] transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "구독 중..." : "구독하기"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                ) : (
                    <div className="flex items-center justify-center gap-3 text-green-400 bg-green-400/10 rounded-lg px-6 py-4 max-w-md mx-auto">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">구독 완료! 받은 편지함을 확인하세요.</span>
                    </div>
                )}

                <p className="text-neutral-600 text-xs mt-4">
                    3,200명+ 구독 중 &middot; 매주 월요일 오전 9시 &middot; 언제든 해지 가능
                </p>
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
            <section className="max-w-3xl mx-auto px-6 mb-20">
                <h2 className="text-2xl font-bold text-center mb-10">지난 호</h2>
                <div className="space-y-3">
                    {pastIssues.map((issue) => (
                        <div
                            key={issue.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-neutral-600 text-sm w-24 shrink-0">{issue.date}</span>
                                <span className="font-medium group-hover:text-[#F5C518] transition">{issue.title}</span>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-600 text-sm">
                                <span>{issue.reads} 읽음</span>
                                <ArrowRight className="w-4 h-4 group-hover:text-[#F5C518] transition" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

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
                                disabled={loading}
                                className="px-6 py-3 rounded-lg bg-[#F5C518] text-black font-bold hover:bg-[#E0B015] transition disabled:opacity-50"
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
