"use client";

import { Brain, Database, Users, ArrowRight, Zap, Eye, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function MindleAboutPage() {
    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-20 sm:py-28 px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                        민들레 홀씨처럼<br /><span className="text-[#F5C518]">트렌드를 퍼뜨립니다</span>
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Mindle은 Ten:One™ Universe의 AI 기반 트렌드 분석 플랫폼입니다.
                        수백만 데이터 포인트에서 트렌드 시그널을 포착하고,
                        AI와 전문가가 함께 만든 인사이트를 매일 전합니다.
                    </p>
                </div>
            </section>

            <section className="py-16 px-6">
                <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Database, title: "수집", sub: "Collect", desc: "카카오 오픈채팅, 커뮤니티, 뉴스, 디스코드 — 수백만 데이터 포인트를 실시간 크롤링합니다." },
                        { icon: Brain, title: "분석", sub: "Analyze", desc: "AI가 패턴을 찾고 키워드를 추출합니다. 플랫폼 간 교차 분석으로 진짜 트렌드를 감지합니다." },
                        { icon: Lightbulb, title: "전달", sub: "Deliver", desc: "전문가가 맥락을 부여하고, 실행 가능한 인사이트로 가공하여 매일 전합니다." },
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
                    <h2 className="text-2xl font-bold text-white mb-4">Ten:One™ Universe와 함께</h2>
                    <p className="text-neutral-400 mb-8">Mindle이 발견한 트렌드는 Universe의 12개 브랜드를 통해 실현됩니다.</p>
                    <Link href="/about?tab=universe" className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-700 rounded-full text-white hover:border-[#F5C518]/50 transition-colors">
                        Universe 둘러보기 <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
