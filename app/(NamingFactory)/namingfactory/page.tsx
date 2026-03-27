"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Lightbulb, Search, CheckCircle, Zap } from "lucide-react";

const process = [
    { step: "01", icon: Search, title: "시장 리서치", desc: "업종, 경쟁사, 타겟 분석으로 네이밍 방향을 설정합니다." },
    { step: "02", icon: Sparkles, title: "AI 생성", desc: "AI가 수백 개의 네이밍 후보를 생성합니다." },
    { step: "03", icon: Lightbulb, title: "전문가 큐레이션", desc: "카피라이터와 브랜딩 전문가가 최적 후보를 선별합니다." },
    { step: "04", icon: CheckCircle, title: "상표 검증", desc: "상표등록 가능성을 검토하고 최종 네이밍을 확정합니다." },
];

export default function NamingFactoryPage() {
    return (
        <div className="min-h-screen bg-white text-neutral-900">
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                {/* Hero */}
                <section className="mb-20">
                    <p className="text-xs tracking-[0.3em] uppercase text-violet-600 mb-4">AI + Expert Naming</p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
                        이름이<br />브랜드의 시작이다
                    </h1>
                    <p className="text-neutral-500 text-lg max-w-xl leading-relaxed mb-8">
                        AI의 창의력과 전문가의 감각이 만나는 네이밍·슬로건 솔루션.
                        상표 검색 연동으로 등록 가능한 이름만 제안합니다.
                    </p>
                    <div className="flex gap-3">
                        <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-500 transition">
                            네이밍 의뢰 <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/brandgravity" className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-300 text-sm rounded-lg hover:border-neutral-400 transition">
                            Brand Gravity 연동
                        </Link>
                    </div>
                </section>

                {/* Process */}
                <section className="mb-20">
                    <h2 className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-8">Process</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {process.map(p => (
                            <div key={p.step} className="p-6 border border-neutral-200 rounded-xl hover:border-violet-300 transition group">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded">{p.step}</span>
                                    <p.icon className="w-4 h-4 text-violet-500" />
                                </div>
                                <h3 className="text-sm font-bold mb-2">{p.title}</h3>
                                <p className="text-xs text-neutral-500 leading-relaxed">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Stats */}
                <section className="grid grid-cols-3 gap-px bg-neutral-200 mb-20">
                    {[
                        { value: "500+", label: "제작 네이밍" },
                        { value: "AI×전문가", label: "하이브리드 방식" },
                        { value: "상표 검증", label: "등록 가능성 포함" },
                    ].map(s => (
                        <div key={s.label} className="bg-white p-6 text-center">
                            <div className="text-2xl font-bold text-violet-600">{s.value}</div>
                            <div className="text-xs text-neutral-500 mt-1">{s.label}</div>
                        </div>
                    ))}
                </section>

                {/* CTA */}
                <section className="p-8 bg-neutral-50 border border-neutral-200 rounded-xl text-center">
                    <Zap className="w-6 h-6 text-violet-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">무료 네이밍 샘플 받기</h3>
                    <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">
                        브랜드명이나 업종을 알려주시면 AI가 10개 네이밍 샘플을 무료로 생성해 드립니다.
                    </p>
                    <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-500 transition">
                        무료 샘플 요청 <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </div>

            <footer className="border-t border-neutral-200 py-8 text-center text-xs text-neutral-400">
                &copy; Naming Factory. Powered by <a href="/about?tab=universe" className="hover:text-neutral-900 transition-colors">Ten:One&trade; Universe</a>.
            </footer>
        </div>
    );
}
