"use client";

import { useState } from "react";
import { Mail, Check, ArrowRight, Zap, TrendingUp, BarChart3, FileText } from "lucide-react";

const benefits = [
    {
        icon: TrendingUp,
        title: "Weekly Trend Digest",
        desc: "Curated signals and emerging patterns delivered every Monday morning.",
    },
    {
        icon: Zap,
        title: "Breaking Signals",
        desc: "Real-time alerts when we detect a major shift in the data.",
    },
    {
        icon: BarChart3,
        title: "Exclusive Data Insights",
        desc: "Charts, rankings, and analysis you won't find on the public site.",
    },
    {
        icon: FileText,
        title: "Early Report Access",
        desc: "Get our weekly reports 24 hours before they go live.",
    },
];

const pastIssues = [
    { id: 1, date: "Mar 24, 2026", title: "Agent AI Enters the Enterprise", reads: "2.4K" },
    { id: 2, date: "Mar 17, 2026", title: "The Hyperlocal Paradox", reads: "1.8K" },
    { id: 3, date: "Mar 10, 2026", title: "Subscription Fatigue Hits Critical Mass", reads: "2.1K" },
    { id: 4, date: "Mar 3, 2026", title: "The Trust Gap — AI Meets Skepticism", reads: "1.6K" },
    { id: 5, date: "Feb 24, 2026", title: "Creator Economy 3.0 — Beyond Influencers", reads: "1.9K" },
];

export default function NewsletterPage() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        // TODO: Supabase newsletter_subscribers 테이블 insert
        await new Promise((r) => setTimeout(r, 1000));
        setLoading(false);
        setSubmitted(true);
    };

    return (
        <main className="min-h-screen bg-[#0A0A0A] text-white pt-20 pb-20">
            {/* Hero */}
            <section className="max-w-3xl mx-auto px-6 text-center mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5C518]/10 text-[#F5C518] text-xs font-medium mb-6">
                    <Mail className="w-3.5 h-3.5" />
                    NEWSLETTER
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                    The signals that satisfies<br />
                    <span className="text-[#F5C518]">your curiosity.</span>
                </h1>
                <p className="text-neutral-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
                    Join thousands of forward-thinkers who start their week with Mindle&apos;s
                    curated trend intelligence. Free, weekly, no spam.
                </p>

                {/* Subscribe Form */}
                {!submitted ? (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            required
                            className="flex-1 px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#F5C518] transition"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 rounded-lg bg-[#F5C518] text-black font-bold hover:bg-[#E0B015] transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? "Subscribing..." : "Subscribe"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                ) : (
                    <div className="flex items-center justify-center gap-3 text-green-400 bg-green-400/10 rounded-lg px-6 py-4 max-w-md mx-auto">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">You&apos;re in! Check your inbox for confirmation.</span>
                    </div>
                )}

                <p className="text-neutral-600 text-xs mt-4">
                    3,200+ subscribers &middot; Every Monday 9AM KST &middot; Unsubscribe anytime
                </p>
            </section>

            {/* Benefits */}
            <section className="max-w-4xl mx-auto px-6 mb-20">
                <h2 className="text-2xl font-bold text-center mb-10">What You Get</h2>
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
                <h2 className="text-2xl font-bold text-center mb-10">Past Issues</h2>
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
                                <span>{issue.reads} reads</span>
                                <ArrowRight className="w-4 h-4 group-hover:text-[#F5C518] transition" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="max-w-2xl mx-auto px-6 text-center">
                <div className="p-10 rounded-2xl bg-gradient-to-b from-neutral-900 to-[#0A0A0A] border border-neutral-800">
                    <h2 className="text-2xl font-bold mb-3">Don&apos;t miss the next signal.</h2>
                    <p className="text-neutral-400 mb-6">The best insights are the ones you act on first.</p>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                                className="flex-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#F5C518] transition"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 rounded-lg bg-[#F5C518] text-black font-bold hover:bg-[#E0B015] transition disabled:opacity-50"
                            >
                                {loading ? "..." : "Join"}
                            </button>
                        </form>
                    ) : (
                        <p className="text-green-400 font-medium">Already subscribed!</p>
                    )}
                </div>
            </section>
        </main>
    );
}
