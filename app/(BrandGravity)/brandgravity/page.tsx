"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Target, TrendingUp, Users, Palette, BarChart3, CheckCircle2, Zap, Eye } from "lucide-react";

const services = [
    { icon: Target, title: "브랜드 전략", desc: "시장 분석과 트렌드 데이터 기반의 포지셔닝 전략을 수립합니다." },
    { icon: Palette, title: "아이덴티티 디자인", desc: "로고, 컬러, 타이포그래피 등 브랜드 시각 체계를 설계합니다." },
    { icon: TrendingUp, title: "Mindle 트렌드 연동", desc: "Mindle의 실시간 트렌드 데이터로 시장 인사이트를 제공합니다." },
    { icon: BarChart3, title: "브랜드 헬스 체크", desc: "브랜드 인지도, 선호도, 충성도를 정량적으로 측정합니다." },
];

const process = [
    { num: "01", tag: "DISCOVER", title: "발견", client: "현재 브랜드 상태·목표 공유", bg: "리서치 + Mindle 트렌드 분석" },
    { num: "02", tag: "DEFINE", title: "정의", client: "핵심 가치·차별점 확인", bg: "포지셔닝 맵 + 경쟁 분석" },
    { num: "03", tag: "DESIGN", title: "설계", client: "시안 피드백·의사결정", bg: "BI 시스템 + 가이드라인 제작" },
    { num: "04", tag: "DELIVER", title: "적용", client: "런칭 승인", bg: "전 채널 적용 + SmarComm 연동" },
];

const cases = [
    { name: "MADLeague", category: "Community", result: "대학생 동아리 연합 → 전국 12개 대학 확대", tags: ["로고", "컬러", "웹사이트"] },
    { name: "LUKI", category: "AI Idol", result: "AI 아이돌 브랜드 론칭 → SNS 팔로워 5만 돌파", tags: ["캐릭터", "세계관", "콘텐츠"] },
    { name: "Badak", category: "Network", result: "전문가 네트워크 리브랜딩 → 가입자 30% 증가", tags: ["BI", "UX", "마케팅"] },
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

                {/* Stats */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden mb-20">
                    {[
                        { value: "50+", label: "브랜딩 프로젝트" },
                        { value: "23", label: "Universe 브랜드" },
                        { value: "4D", label: "프로세스" },
                        { value: "92%", label: "고객 만족도" },
                    ].map(s => (
                        <div key={s.label} className="bg-[#0A0A0A] p-5 text-center">
                            <div className="text-xl font-bold text-amber-500">{s.value}</div>
                            <div className="text-[10px] text-neutral-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
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

                {/* Process — 4D */}
                <section className="mb-20">
                    <h2 className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">Process</h2>
                    <p className="text-lg font-bold mb-8">4D 프로세스</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {process.map(p => (
                            <div key={p.num} className="p-5 border border-neutral-800 rounded-xl">
                                <div className="text-2xl font-extralight text-white/10 mb-2">{p.num}</div>
                                <p className="text-[10px] tracking-[0.15em] uppercase text-amber-500 mb-1">{p.tag}</p>
                                <h3 className="text-sm font-bold mb-3">{p.title}</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-[9px] text-neutral-600 uppercase">고객</p>
                                        <p className="text-xs text-neutral-400">{p.client}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-amber-500/60 uppercase">Brand Gravity</p>
                                        <p className="text-xs text-neutral-400">{p.bg}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Cases */}
                <section className="mb-20">
                    <h2 className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">Case Studies</h2>
                    <p className="text-lg font-bold mb-8">Universe 브랜드 실적</p>
                    <div className="space-y-4">
                        {cases.map(c => (
                            <div key={c.name} className="flex items-center justify-between p-5 border border-neutral-800 rounded-xl hover:border-amber-500/30 transition">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold">{c.name}</h3>
                                        <span className="text-[9px] text-neutral-600">{c.category}</span>
                                    </div>
                                    <p className="text-xs text-neutral-400">{c.result}</p>
                                </div>
                                <div className="hidden sm:flex gap-1.5">
                                    {c.tags.map(t => (
                                        <span key={t} className="text-[9px] px-2 py-0.5 border border-neutral-800 rounded text-neutral-500">{t}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Universe Connection */}
                <section className="p-8 border border-neutral-800 rounded-xl text-center mb-20">
                    <Sparkles className="w-6 h-6 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">Ten:One Universe 연동</h3>
                    <p className="text-sm text-neutral-400 max-w-md mx-auto mb-4">
                        Mindle 트렌드 분석 + SmarComm 마케팅 전략 + Brand Gravity 브랜딩 = 풀패키지 솔루션
                    </p>
                    <Link href="/universe" className="text-xs text-amber-500 hover:underline">Universe 구조 보기 →</Link>
                </section>

                {/* CTA */}
                <section className="text-center">
                    <h2 className="text-2xl font-bold mb-3">브랜드, 다시 설계할 때</h2>
                    <p className="text-sm text-neutral-400 mb-6">무료 브랜드 헬스 체크로 시작하세요. 현재 상태를 데이터로 보여드립니다.</p>
                    <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition">
                        무료 진단 받기 <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </div>

            <footer className="border-t border-neutral-800 py-8 text-center text-xs text-neutral-600">
                &copy; Brand Gravity. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
            </footer>
        </div>
    );
}
