"use client";

import Link from "next/link";
import { brands } from "@/lib/data";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { ArrowRight, Sparkles, Globe, Zap, ExternalLink } from "lucide-react";

const latestUpdates = [
    { title: "LUKI", subtitle: "AI 4인조 걸그룹 데뷔", date: "2025.08", color: "text-purple-400" },
    { title: "RooK", subtitle: "인공지능 크리에이터 플랫폼 런칭", date: "2025.04", color: "text-blue-400" },
    { title: "MADzine", subtitle: "마케팅/광고 매거진 창간", date: "2025.04", color: "text-amber-400" },
    { title: "MAD League 2기", subtitle: "전국 7개 동아리 연합 완성", date: "2025.01", color: "text-emerald-400" },
];

const coreValues = [
    { title: "본질", subtitle: "Essence", description: "변하지 않을 가치에 집요하게 집중한다", icon: Sparkles, color: "from-indigo-500 to-purple-500" },
    { title: "속도", subtitle: "Speed", description: "옳은 방향을 계속 확인하며 빠르게 전진한다", icon: Zap, color: "from-emerald-500 to-cyan-500" },
    { title: "이행", subtitle: "Carry Out", description: "본질이 확인된다면 바로 실행에 옮긴다", icon: ArrowRight, color: "from-amber-500 to-orange-500" },
];

export default function HomePage() {
    const showcaseBrands = brands.filter(b => b.domain && b.id !== 'tenone');

    return (
        <div className="min-h-screen bg-black text-white">
            <PublicHeader />

            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_60%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />

                <div className="relative text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400 mb-8">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                        WELCOME TO
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                        Ten<span className="text-indigo-500">:</span>One™
                        <br />
                        <span className="bg-gradient-to-r from-zinc-300 to-zinc-500 bg-clip-text text-transparent">Universe</span>
                    </h1>

                    <p className="mt-8 text-lg md:text-xl text-zinc-400 leading-relaxed">
                        가치로 연결된<br />
                        하나의 <span className="text-white font-semibold">거대한 세계관</span>을 만들기로 했다.
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link href="/universe" className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2">
                            Explore Universe <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link href="/about" className="px-8 py-3 border border-zinc-700 text-white rounded-full hover:bg-zinc-900 transition-colors">
                            Our Philosophy
                        </Link>
                    </div>
                </div>
            </section>

            {/* Universe Brands Showcase */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Universe</h2>
                        <p className="mt-4 text-zinc-400">하나의 생태계로 연결된 브랜드들</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {showcaseBrands.map((brand) => (
                            <a key={brand.id} href={brand.websiteUrl} target="_blank" rel="noopener noreferrer"
                                className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 hover:border-indigo-500/50 hover:bg-zinc-900/60 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center text-sm font-bold text-white">{brand.name.slice(0, 2)}</div>
                                    <ExternalLink className="h-4 w-4 text-zinc-700 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <h3 className="text-white font-semibold">{brand.name}</h3>
                                <p className="text-xs text-indigo-400 mt-1">{brand.domain}</p>
                                {brand.tagline && <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{brand.tagline}</p>}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 px-6 border-t border-zinc-800/50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">Core Value</h2>
                        <p className="mt-4 text-zinc-400">변하지 않을 가치에 집중하여 더 큰 가치를 창출한다</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {coreValues.map((val) => (
                            <div key={val.title} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-8 text-center hover:border-zinc-600 transition-colors">
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${val.color} mb-4`}>
                                    <val.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">{val.title}</h3>
                                <p className="text-sm text-zinc-500 mt-1">{val.subtitle}</p>
                                <p className="text-sm text-zinc-400 mt-4">{val.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Latest Updates */}
            <section className="py-24 px-6 border-t border-zinc-800/50">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-bold text-white">Latest</h2>
                        <Link href="/history" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">View All <ArrowRight className="h-4 w-4" /></Link>
                    </div>
                    <div className="space-y-4">
                        {latestUpdates.map((update, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/20 px-6 py-5 hover:border-zinc-600 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className={`text-lg font-bold ${update.color}`}>{update.title}</span>
                                    <span className="text-sm text-zinc-400">{update.subtitle}</span>
                                </div>
                                <span className="text-sm text-zinc-600">{update.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 border-t border-zinc-800/50">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Are you ready to build<br />the Next Universe?
                    </h2>
                    <p className="mt-4 text-zinc-400">당신의 작은 세계가 연결되어 하나의 거대한 세계관을 만듭니다.</p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link href="/contact" className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-500 transition-colors">Join the Universe</Link>
                        <Link href="/universe" className="px-8 py-3 border border-zinc-700 text-white rounded-full hover:bg-zinc-900 transition-colors flex items-center gap-2">
                            <Globe className="h-4 w-4" /> Explore
                        </Link>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
}
