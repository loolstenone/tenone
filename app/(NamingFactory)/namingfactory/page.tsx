"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Lightbulb, Search, CheckCircle, Zap, Star, MessageSquare, FileText, Globe } from "lucide-react";

const process = [
    { step: "01", icon: Search, title: "시장 리서치", desc: "업종, 경쟁사, 타겟 분석으로 네이밍 방향을 설정합니다.", client: "업종·타겟 정보 공유", nf: "경쟁사·키워드 분석" },
    { step: "02", icon: Sparkles, title: "AI 생성", desc: "AI가 수백 개의 네이밍 후보를 생성합니다.", client: "선호 키워드 전달", nf: "AI 500+ 후보 생성" },
    { step: "03", icon: Lightbulb, title: "전문가 큐레이션", desc: "카피라이터와 브랜딩 전문가가 최적 후보를 선별합니다.", client: "후보 리스트 리뷰", nf: "Top 10 선별 + 해설" },
    { step: "04", icon: CheckCircle, title: "상표 검증", desc: "상표등록 가능성을 검토하고 최종 네이밍을 확정합니다.", client: "최종 선택", nf: "KIPRIS 상표 검증" },
];

const cases = [
    { name: "LUKI", category: "AI Idol", desc: "Look + I → 나를 바라봐. AI 아이돌의 정체성을 한 단어로", origin: "영문 합성어" },
    { name: "Badak", category: "Network", desc: "이바닥 → 내 바닥을 넓히는 네트워크. 한국어 감성 + 친근함", origin: "한국어 변형" },
    { name: "Mindle", category: "Intelligence", desc: "Mind + Bundle → 생각의 묶음. 트렌드 인텔리전스 플랫폼", origin: "영문 합성어" },
    { name: "Vrief", category: "Framework", desc: "Vision + Brief → 기획의 본질. 조사→가설→전략 프레임워크", origin: "영문 합성어" },
];

const packages = [
    { name: "Quick", price: "49만원", includes: ["AI 100개 후보", "전문가 Top 5 선별", "상표 사전조사"], delivery: "3일" },
    { name: "Standard", price: "149만원", includes: ["AI 500개 후보", "전문가 Top 10 + 해설", "KIPRIS 상표검증", "슬로건 3안"], delivery: "7일" },
    { name: "Premium", price: "299만원", includes: ["AI 1,000개 후보", "전문가 Top 20 + 스토리텔링", "상표출원 대행", "슬로건 + 태그라인", "Brand Gravity 연동"], delivery: "14일" },
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

                {/* Stats */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-neutral-200 mb-20 rounded-xl overflow-hidden">
                    {[
                        { value: "500+", label: "제작 네이밍" },
                        { value: "AI×전문가", label: "하이브리드" },
                        { value: "KIPRIS", label: "상표 검증" },
                        { value: "3일~", label: "납품 기간" },
                    ].map(s => (
                        <div key={s.label} className="bg-white p-5 text-center">
                            <div className="text-lg font-bold text-violet-600">{s.value}</div>
                            <div className="text-[10px] text-neutral-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </section>

                {/* Process */}
                <section className="mb-20">
                    <h2 className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-3">Process</h2>
                    <p className="text-lg font-bold mb-8">4단계 네이밍 프로세스</p>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {process.map(p => (
                            <div key={p.step} className="p-6 border border-neutral-200 rounded-xl hover:border-violet-300 transition">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded">{p.step}</span>
                                    <p.icon className="w-4 h-4 text-violet-500" />
                                </div>
                                <h3 className="text-sm font-bold mb-2">{p.title}</h3>
                                <p className="text-xs text-neutral-500 leading-relaxed mb-3">{p.desc}</p>
                                <div className="space-y-1.5 pt-3 border-t border-neutral-100">
                                    <div>
                                        <span className="text-[9px] text-neutral-400 uppercase">고객</span>
                                        <p className="text-[11px] text-neutral-500">{p.client}</p>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-violet-500 uppercase">Naming Factory</span>
                                        <p className="text-[11px] text-neutral-500">{p.nf}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Cases */}
                <section className="mb-20">
                    <h2 className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-3">Case Studies</h2>
                    <p className="text-lg font-bold mb-8">Universe에서 태어난 이름들</p>
                    <div className="space-y-3">
                        {cases.map(c => (
                            <div key={c.name} className="flex items-center justify-between p-5 border border-neutral-200 rounded-xl hover:border-violet-300 transition">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-bold">{c.name}</h3>
                                        <span className="text-[9px] text-neutral-400">{c.category}</span>
                                        <span className="text-[9px] px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded">{c.origin}</span>
                                    </div>
                                    <p className="text-xs text-neutral-500">{c.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Packages */}
                <section className="mb-20">
                    <h2 className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-3">Packages</h2>
                    <p className="text-lg font-bold mb-8">패키지 구성</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {packages.map((pkg, i) => (
                            <div key={pkg.name} className={`p-6 border rounded-xl ${i === 1 ? 'border-violet-400 ring-1 ring-violet-200' : 'border-neutral-200'}`}>
                                <h3 className="text-sm font-bold mb-1">{pkg.name}</h3>
                                <div className="text-2xl font-bold text-violet-600 mb-1">{pkg.price}</div>
                                <div className="text-[10px] text-neutral-400 mb-4">납품 {pkg.delivery}</div>
                                <div className="space-y-2">
                                    {pkg.includes.map(item => (
                                        <div key={item} className="flex items-start gap-2 text-xs text-neutral-600">
                                            <CheckCircle className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
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
