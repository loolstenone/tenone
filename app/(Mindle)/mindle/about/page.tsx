"use client";

import { Brain, Database, Users, ArrowRight, Zap, Eye, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function MindleAboutPage() {
    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-20 sm:py-28 px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                        Like dandelion seeds,<br /><span className="text-[#F5C518]">we spread trends.</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Mindle is Ten:One&trade; Universe&rsquo;s AI-powered trend analysis platform.
                        We capture trend signals from millions of data points
                        and deliver insights created by AI and experts together, every day.
                    </p>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Database, title: "Collect", sub: "Collect", desc: "Kakao open chats, communities, news, Discord — we crawl millions of data points in real time." },
                        { icon: Brain, title: "Analyze", sub: "Analyze", desc: "AI finds patterns and extracts keywords. Cross-platform analysis detects real trends." },
                        { icon: Lightbulb, title: "Deliver", sub: "Deliver", desc: "Experts add context and refine raw data into actionable insights, delivered daily." },
                    ].map((v, i) => (
                        <div key={i} className="p-8 rounded-2xl border border-neutral-800 bg-neutral-900/30">
                            <div className="w-12 h-12 rounded-xl bg-[#F5C518]/10 flex items-center justify-center mb-5">
                                <v.icon className="w-6 h-6 text-[#F5C518]" />
                            </div>
                            <h3 className="text-white font-bold text-xl mb-1">{v.title}</h3>
                            <p className="text-[#F5C518]/50 text-xs font-mono mb-3">{v.sub}</p>
                            <p className="text-neutral-400 text-sm leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="py-16 px-6 border-t border-neutral-800/50">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Together with Ten:One&trade; Universe</h2>
                    <p className="text-neutral-400 mb-8">Trends discovered by Mindle are realized through the 12 brands of the Universe.</p>
                    <Link href="/about?tab=universe" className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-700 rounded-full text-white hover:border-[#F5C518]/50 transition-colors">
                        Explore Universe <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
