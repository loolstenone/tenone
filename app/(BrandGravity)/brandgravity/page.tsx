"use client";

import Link from "next/link";
import { ArrowRight, Brain, Search, MessageSquare, Target, Database, Radar, PenTool, BarChart3, ChevronRight } from "lucide-react";
import NewsletterSubscribeForm from '@/components/newsletter/NewsletterSubscribeForm';

const painSources = [
    { src: "네이버 쇼핑 리뷰", desc: "한국 소비자 최대 모수" },
    { src: "쿠팡 리뷰", desc: "실사용 맥락이 구체적" },
    { src: "Amazon Reviews", desc: "구매 동기가 명확한 장문" },
    { src: "Google Reviews", desc: "경험 서사가 긴 서비스 리뷰" },
    { src: "올리브영·화해", desc: "뷰티 카테고리 특화" },
    { src: "앱스토어·플레이스토어", desc: "기능 불만 직접 발화" },
    { src: "블로그 체험기", desc: "구매 동기 → 과정 → 결론 서사" },
];

const channels = [
    { icon: Brain, label: "AI에게 묻는다", desc: "ChatGPT, Perplexity, Gemini", trend: "증가 중", color: "text-amber-500" },
    { icon: Search, label: "검색한다", desc: "네이버, 구글, 유튜브", trend: "여전히 주류", color: "text-white" },
    { icon: MessageSquare, label: "커뮤니티에 묻는다", desc: "카페, Reddit, 오픈채팅", trend: "신뢰도 높음", color: "text-white" },
];

const aiSteps = [
    { num: "①", title: "질문 해석", desc: "페인 포인트 + 상황 + 조건 추출", action: "브랜드 보이스를 소비자 언어와 일치시킨다" },
    { num: "②", title: "내부 지식 검색", desc: "학습된 리뷰·기사·포럼·제품 정보", action: "웹 전체에 맥락 자산을 장기 축적한다" },
    { num: "③", title: "웹 검색 실행", desc: "Google/Bing 실시간 결과 수집", action: "핵심 질문 키워드 상위에 클라이언트 콘텐츠를 배치한다" },
    { num: "④", title: "소스 종합", desc: "다중 소스에서 일관되게 추천되는 것에 가중치", action: "리뷰 + 전문가 + 커뮤니티 + 미디어가 같은 말 하게 만든다" },
    { num: "⑤", title: "후보군 생성", desc: "3~5개 추천 + 이유 설명", action: "경쟁사 대비 맥락 강도를 높인다" },
];

const systems = [
    { icon: Database, name: "Pain Collector", desc: "리뷰·커뮤니티·Q&A 크롤링 → 페인 포인트 분류·클러스터링", cycle: "상시 (일/주 배치)" },
    { icon: Search, name: "Question Mapper", desc: "페인 포인트 → AI/검색/커뮤니티별 실제 질문 패턴 수집 + 생성", cycle: "주간" },
    { icon: Brain, name: "AI Prober", desc: "질문 패턴을 5대 AI에 실제 질의 → 추천 결과 + 인용 소스 수집", cycle: "주간/월간" },
    { icon: Radar, name: "Source Tracer", desc: "AI가 참조한 소스 역추적 + 경쟁사 소스 분석 + 신뢰도 위계 매핑", cycle: "질의와 동시" },
    { icon: Target, name: "Gap Analyzer", desc: "페인 포인트 × 질문 × AI 소스 교차 → 클라이언트 브랜드의 부재 지점 특정", cycle: "자동" },
    { icon: PenTool, name: "Voice Designer", desc: "갭에 맞는 브랜드 보이스 가이드 + 리뷰 유도 + 구조화 데이터 + 콘텐츠 브리프", cycle: "갭 분석 후" },
    { icon: BarChart3, name: "Score Tracker", desc: "Gravity Score 산출 + 추이 + 경쟁사 대비", cycle: "월간 스냅샷" },
];

const buildSteps = [
    { n: "1", name: "Pain Collector", value: "당신 카테고리의 진짜 페인 포인트 맵", period: "3~4주" },
    { n: "2", name: "Question Mapper", value: "페인 포인트가 AI/검색에서 어떤 질문으로 바뀌는지", period: "2주" },
    { n: "3", name: "AI Prober + Source Tracer", value: "AI가 뭘 추천하는지, 왜 추천하는지 — Gravity Scan 완성", period: "3주" },
    { n: "4", name: "Gap Analyzer", value: '"당신이 빠져 있는 이유"까지 진단 — Scan 납품물', period: "2주" },
    { n: "5", name: "Voice Designer", value: "갭을 메울 실행 도구 — Program 상품 가능", period: "3주" },
    { n: "6", name: "Score Tracker", value: "리커링 상품, SaaS화", period: "4~6주" },
];

export default function BrandGravityPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">

                {/* Hero */}
                <section className="mb-24">
                    <p className="text-xs tracking-[0.3em] uppercase text-amber-500 mb-4">AI Era Branding</p>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
                        AI가 추천하는<br />브랜드를 만듭니다
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl leading-relaxed mb-10">
                        소비자는 이제 검색창 대신 AI에게 묻습니다.<br />
                        당신의 브랜드는 AI의 답 안에 들어 있습니까?
                    </p>
                    <div className="flex gap-3">
                        <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition">
                            Gravity Scan 받기 <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="/about" className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-700 text-sm rounded-lg hover:border-neutral-500 transition">
                            Ten:One Universe
                        </Link>
                    </div>
                </section>

                {/* 시대 전환 */}
                <section className="mb-24">
                    <div className="grid sm:grid-cols-2 gap-px bg-white/5 rounded-xl overflow-hidden">
                        <div className="bg-[#0A0A0A] p-8">
                            <p className="text-[10px] tracking-[0.2em] text-neutral-600 uppercase mb-4">과거 — 광고·검색 시대</p>
                            <p className="text-sm text-neutral-400 leading-relaxed">
                                소비자는 브랜드를 지목하거나, 필요한 기능을 검색해 비교했습니다.<br /><br />
                                기업은 키워드를 사고, 광고를 올리고, 기능을 밀었습니다.
                            </p>
                        </div>
                        <div className="bg-[#111] p-8 border-l border-amber-500/20">
                            <p className="text-[10px] tracking-[0.2em] text-amber-500 uppercase mb-4">지금 — AI 시대</p>
                            <p className="text-sm text-neutral-300 leading-relaxed">
                                소비자는 페인 포인트를 AI에게 설명하고, AI가 대안을 비교해 제시합니다.<br /><br />
                                기업은 <span className="text-amber-500 font-medium">AI의 추천 안에 들어가야</span> 합니다.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 세 축 */}
                <section className="mb-24">
                    <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">Three Axes</p>
                    <h2 className="text-2xl font-bold mb-12">Brand Gravity의 세 축</h2>

                    {/* 축 1 */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-mono">축 1</span>
                            <h3 className="text-lg font-bold">진짜 페인 포인트</h3>
                        </div>
                        <p className="text-sm text-neutral-400 leading-relaxed mb-6 max-w-2xl">
                            마케팅 부서가 만든 페르소나가 아니라, 실제 돈을 쓴 사람이 남긴 말.<br />
                            <span className="text-white">"뭐 때문에 샀는데 좋았다"</span>와 <span className="text-white">"뭐 때문에 샀는데 안 좋았다"</span> — 이 두 문장이 모든 것의 시작입니다.
                        </p>

                        {/* 리뷰 예시 */}
                        <div className="p-5 bg-neutral-900 rounded-xl border border-neutral-800 mb-6 font-mono text-xs leading-relaxed">
                            <p className="text-neutral-500 mb-3">// 원문 리뷰</p>
                            <p className="text-neutral-300">"족저근막염 때문에 러닝 못 하다가 정형외과에서 쿠셔닝 좋은 신발 신으라고 해서 이거 샀는데 3주째 뛰고 있는데 통증이 확실히 줄었어요. 다만 발볼이 좁아서 양말 두꺼운 거 신으면 좀 끼어요."</p>
                            <div className="mt-4 space-y-1 text-neutral-500">
                                <p><span className="text-amber-500">→ 구매 동기:</span> 족저근막염 → 의사 추천 → 쿠셔닝</p>
                                <p><span className="text-green-500">→ 긍정:</span> 통증 감소, 3주 지속 사용</p>
                                <p><span className="text-red-400">→ 부정:</span> 발볼 좁음</p>
                                <p><span className="text-blue-400">→ 프로필:</span> 러닝 복귀자, 부상 이력, 의료 경유</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3">
                            {painSources.map(s => (
                                <div key={s.src} className="flex items-start gap-3 p-3 border border-neutral-800 rounded-lg">
                                    <ChevronRight className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-white">{s.src}</p>
                                        <p className="text-[11px] text-neutral-500">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 축 2 */}
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-mono">축 2</span>
                            <h3 className="text-lg font-bold">소비자는 어디서 어떻게 묻고 사는가</h3>
                        </div>
                        <p className="text-sm text-neutral-400 leading-relaxed mb-6 max-w-2xl">
                            같은 페인 포인트도 어디서 묻느냐에 따라 결과가 달라집니다.<br />
                            AI에게 묻는 말과 네이버에 치는 말이 다릅니다. 둘 다 알아야 합니다.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {channels.map(c => (
                                <div key={c.label} className="p-5 border border-neutral-800 rounded-xl">
                                    <c.icon className={`w-5 h-5 mb-3 ${c.color}`} />
                                    <h4 className="text-sm font-bold mb-1">{c.label}</h4>
                                    <p className="text-[11px] text-neutral-500 mb-2">{c.desc}</p>
                                    <span className={`text-[10px] ${c.color}`}>{c.trend}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 축 3 */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded font-mono">축 3</span>
                            <h3 className="text-lg font-bold">AI는 어디서 찾아서 추천하는가</h3>
                        </div>
                        <p className="text-sm text-neutral-400 leading-relaxed mb-6 max-w-2xl">
                            Brand Gravity만이 할 수 있는 영역 — AI의 추천 메커니즘을 역설계합니다.
                        </p>
                        <div className="space-y-3">
                            {aiSteps.map(s => (
                                <div key={s.num} className="flex gap-4 p-4 border border-neutral-800 rounded-xl hover:border-amber-500/20 transition">
                                    <span className="text-lg font-mono text-white/20 flex-shrink-0 w-6">{s.num}</span>
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-1">
                                            <h4 className="text-sm font-bold">{s.title}</h4>
                                            <p className="text-[11px] text-neutral-500">{s.desc}</p>
                                        </div>
                                        <p className="text-[11px] text-amber-500/80">→ {s.action}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Gap 다이어그램 */}
                <section className="mb-24">
                    <div className="p-8 border border-amber-500/20 rounded-xl bg-amber-500/5 text-center">
                        <p className="text-xs tracking-[0.2em] text-amber-500 uppercase mb-6">The Gap</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm mb-6">
                            <div className="px-4 py-2 border border-neutral-700 rounded-lg text-neutral-300">소비자가 이걸 아파하고</div>
                            <ChevronRight className="w-4 h-4 text-neutral-600 rotate-90 sm:rotate-0" />
                            <div className="px-4 py-2 border border-neutral-700 rounded-lg text-neutral-300">여기서 이렇게 물어보는데</div>
                            <ChevronRight className="w-4 h-4 text-neutral-600 rotate-90 sm:rotate-0" />
                            <div className="px-4 py-2 border border-amber-500/30 rounded-lg text-amber-400 font-medium">클라이언트 브랜드가 거기에 없다</div>
                        </div>
                        <p className="text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
                            Brand Gravity는 이 갭을 진단하고, 브랜드 보이스를 소비자 언어로 바꾸고,<br />
                            AI가 참조하는 소스에 맥락 자산을 심어 갭을 메웁니다.
                        </p>
                    </div>
                </section>

                {/* 7개 시스템 */}
                <section className="mb-24">
                    <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">Systems</p>
                    <h2 className="text-2xl font-bold mb-8">7개 시스템이 돌아갑니다</h2>
                    <div className="space-y-3">
                        {systems.map((s, i) => (
                            <div key={s.name} className="flex gap-4 p-5 border border-neutral-800 rounded-xl hover:border-amber-500/20 transition">
                                <div className="flex-shrink-0">
                                    <s.icon className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                                        <h3 className="text-sm font-bold">{s.name}</h3>
                                        <span className="text-[10px] text-neutral-600">{s.cycle}</span>
                                    </div>
                                    <p className="text-xs text-neutral-400 leading-relaxed">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 빌드 순서 */}
                <section className="mb-24">
                    <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-3">Build Order</p>
                    <h2 className="text-2xl font-bold mb-2">6단계로 완성합니다</h2>
                    <p className="text-sm text-neutral-500 mb-8">Pain Collector가 전체의 원재료. 여기서 나오는 데이터의 질이 뒤의 모든 걸 결정합니다.</p>
                    <div className="relative">
                        <div className="absolute left-[22px] top-4 bottom-4 w-px bg-neutral-800" />
                        <div className="space-y-4">
                            {buildSteps.map((s, i) => (
                                <div key={s.n} className="flex gap-5">
                                    <div className="flex-shrink-0 w-11 h-11 rounded-full border border-neutral-700 flex items-center justify-center text-sm font-bold text-amber-500 bg-[#0A0A0A] relative z-10">
                                        {s.n}
                                    </div>
                                    <div className="flex-1 pt-2 pb-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                                            <h3 className="text-sm font-bold">{s.name}</h3>
                                            <span className="text-[10px] text-neutral-600">{s.period}</span>
                                        </div>
                                        <p className="text-xs text-neutral-400">{s.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* AI 소스 신뢰도 */}
                <section className="mb-24">
                    <p className="text-xs tracking-[0.2em] uppercase text-neutral-500 mb-6">AI Source Trust Hierarchy</p>
                    <div className="space-y-2">
                        {[
                            { level: "높음", items: ["전문가 (의사, 트레이너, 업계 전문 미디어)", "독립 리뷰 매체 (Runners World, Wirecutter 등)"], color: "text-green-400 border-green-400/20 bg-green-400/5" },
                            { level: "중간", items: ["구조화 데이터 (schema.org, 공식 스펙)", "커뮤니티 다수 합의 (Reddit 100+ upvote)", "실사용자 상세 리뷰 (상황+결과 포함)"], color: "text-amber-400 border-amber-400/20 bg-amber-400/5" },
                            { level: "낮음", items: ["일반 사용자 짧은 리뷰", "브랜드 자체 광고성 콘텐츠"], color: "text-red-400 border-red-400/20 bg-red-400/5" },
                        ].map(g => (
                            <div key={g.level} className={`p-4 border rounded-xl ${g.color}`}>
                                <span className="text-[10px] font-bold uppercase mr-3">{g.level}</span>
                                <span className="text-xs text-neutral-400">{g.items.join(" / ")}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-neutral-600 mt-3">자사 사이트만 말하면 약합니다. 다중 소스가 같은 말 해야 AI가 신뢰합니다.</p>
                </section>

                {/* 뉴스레터 */}
                <section className="py-16 px-6 border-t border-neutral-800 mb-16">
                    <NewsletterSubscribeForm
                        source="brandgravity"
                        dark
                        accentColor="#F59E0B"
                        subtitle="Brand Gravity 인사이트를 가장 먼저 받아보세요."
                    />
                </section>

                {/* CTA */}
                <section className="text-center">
                    <p className="text-xs tracking-[0.2em] text-amber-500 uppercase mb-4">Gravity Scan</p>
                    <h2 className="text-2xl font-bold mb-3">AI가 지금 당신 브랜드를 어떻게 보는지<br />확인해보세요</h2>
                    <p className="text-sm text-neutral-400 mb-8 max-w-md mx-auto">Pain Collector → AI Prober → Gap Analyzer.<br />4주 안에 진단 결과를 드립니다.</p>
                    <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 text-black text-sm font-bold rounded-lg hover:bg-amber-400 transition">
                        Gravity Scan 신청 <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </div>

            <footer className="border-t border-neutral-800 py-8 text-center text-xs text-neutral-600">
                &copy; Brand Gravity. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
            </footer>
        </div>
    );
}
