"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Target, TrendingUp, Users, Palette, BarChart3 } from "lucide-react";

const services = [
    { icon: Target, title: "브랜드 전략", desc: "시장 분석과 트렌드 데이터 기반의 포지셔닝 전략을 수립합니다." },
    { icon: Palette, title: "아이덴티티 디자인", desc: "로고, 컬러, 타이포그래피 등 브랜드 시각 체계를 설계합니다." },
    { icon: TrendingUp, title: "Mindle 트렌드 연동", desc: "Mindle의 실시간 트렌드 데이터로 시장 인사이트를 제공합니다." },
    { icon: BarChart3, title: "브랜드 헬스 체크", desc: "브랜드 인지도, 선호도, 충성도를 정량적으로 측정합니다." },
];

export default function BrandGravityPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                {/* Hero */}
                <section className="mb-20">
                    <p className="text-xs tracking-[0.3em] uppercase text-amber-500 mb-4">Branding Consulting</p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
                        끌어당기는<br />브랜드를 만듭니다
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-xl leading-relaxed mb-8">
                        트렌드 데이터 기반의 브랜딩 컨설팅. Mindle의 인텔리전스와 SmarComm의 마케팅 전략이 만나 브랜드의 중력을 만듭니다.
                    </p>
                    <div className="flex gap-3">
                        <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition">
                            상담 문의 <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-700 text-sm rounded-lg hover:border-neutral-500 transition">
                            Ten:One Universe
                        </Link>
                    </div>
                </section>

                {/* Services */}
                <section className="mb-20">
                    <h2 className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-8">Services</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {services.map(s => (
                            <div key={s.title} className="p-6 border border-neutral-800 rounded-xl hover:border-amber-500/30 transition">
                                <s.icon className="w-5 h-5 text-amber-500 mb-3" />
                                <h3 className="text-sm font-bold mb-2">{s.title}</h3>
                                <p className="text-xs text-neutral-400 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Universe Connection */}
                <section className="p-8 border border-neutral-800 rounded-xl text-center">
                    <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">Ten:One Universe 연동</h3>
                    <p className="text-sm text-neutral-400 max-w-md mx-auto mb-4">
                        Mindle 트렌드 분석 + SmarComm 마케팅 전략 + Brand Gravity 브랜딩 = 풀패키지 솔루션
                    </p>
                    <Link href="/universe" className="text-xs text-amber-500 hover:underline">Universe 구조 보기 →</Link>
                </section>
            </div>

            {/* Footer */}
            <footer className="border-t border-neutral-800 py-8 text-center text-xs text-neutral-600">
                &copy; Brand Gravity. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
            </footer>
        </div>
    );
}
