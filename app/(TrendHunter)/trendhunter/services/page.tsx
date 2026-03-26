"use client";

import { FileText, Target, Lightbulb, BarChart3, Database, Cpu, Users, ArrowRight, Check, Zap } from "lucide-react";
import Link from "next/link";

const services = [
    {
        icon: FileText,
        title: "트렌드 리포트",
        subtitle: "Trend Report",
        desc: "월간/분기별 트렌드 분석 보고서. AI가 수집·분석한 데이터와 전문가의 인사이트를 결합한 종합 리포트를 제공합니다.",
        features: [
            "산업별 맞춤 분석 (IT, 유통, F&B, 패션 등)",
            "AI 기반 데이터 시각화 대시보드",
            "트렌드 예측 모델 (6개월/1년)",
            "경쟁사 벤치마킹 데이터",
            "월간 트렌드 브리핑 미팅",
        ],
        pricing: "월 구독 / 건별 구매",
        color: "#00FF88",
    },
    {
        icon: Target,
        title: "브랜드 전략 컨설팅",
        subtitle: "Brand Strategy Consulting",
        desc: "트렌드 데이터를 기반으로 브랜드 포지셔닝, 신규 사업 기회 발굴, 마케팅 전략을 설계합니다.",
        features: [
            "시장 기회 분석 및 사이징",
            "브랜드 포지셔닝 맵 설계",
            "경쟁 환경 매핑 (SWOT + 트렌드)",
            "타깃 오디언스 세그멘테이션",
            "GTM 전략 수립",
        ],
        pricing: "프로젝트 단위",
        color: "#00CC6A",
    },
    {
        icon: Lightbulb,
        title: "콘텐츠 제작",
        subtitle: "Content Creation",
        desc: "트렌드 인사이트를 기반으로 실행 가능한 콘텐츠를 기획·제작합니다. 데이터가 뒷받침하는 콘텐츠는 다릅니다.",
        features: [
            "SNS 콘텐츠 전략 및 운영",
            "블로그/뉴스레터 기획·작성",
            "영상 콘텐츠 기획 (숏폼/롱폼)",
            "인포그래픽 및 데이터 시각화",
            "카피라이팅 및 메시지 개발",
        ],
        pricing: "월 리테이너 / 건별",
        color: "#00BB66",
    },
    {
        icon: BarChart3,
        title: "맞춤형 데이터 분석",
        subtitle: "Custom Data Analysis",
        desc: "기업 고유의 데이터와 외부 트렌드 데이터를 결합하여 의사결정에 필요한 인사이트를 제공합니다.",
        features: [
            "자사 데이터 연동 및 통합 분석",
            "경쟁사 실시간 모니터링",
            "소비자 감성 분석 (VOC)",
            "맞춤 대시보드 구축",
            "정기 분석 리포트 제공",
        ],
        pricing: "맞춤 견적",
        color: "#009955",
    },
];

const processSteps = [
    { step: "01", title: "데이터 수집", desc: "수백만 데이터 포인트를 실시간 크롤링", icon: Database },
    { step: "02", title: "AI 분석", desc: "NLP, 감성 분석, 패턴 인식으로 시그널 탐지", icon: Cpu },
    { step: "03", title: "전문가 큐레이션", desc: "업계 전문가가 맥락을 부여하고 인사이트 도출", icon: Users },
    { step: "04", title: "전략 수립", desc: "실행 가능한 전략과 콘텐츠로 전환", icon: Target },
];

export default function TrendHunterServicesPage() {
    return (
        <div className="bg-[#0A0A0A]">
            {/* Hero */}
            <section className="py-20 sm:py-28 px-6">
                <div className="mx-auto max-w-5xl">
                    <span className="text-[#00FF88] text-xs font-mono tracking-widest">SERVICES</span>
                    <h1 className="text-3xl sm:text-5xl font-bold text-white mt-4 mb-4">
                        트렌드를 <span className="text-[#00FF88]">실행</span>으로
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl">
                        데이터 수집부터 전략 수립, 콘텐츠 제작까지.
                        트렌드의 발견과 실행을 한 곳에서 수행합니다.
                    </p>
                </div>
            </section>

            {/* 프로세스 */}
            <section className="px-6 pb-20">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {processSteps.map((s, i) => (
                            <div key={i} className="relative text-center p-5 rounded-xl border border-neutral-800 bg-neutral-900/30">
                                {i < processSteps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 text-neutral-700">→</div>
                                )}
                                <s.icon className="w-6 h-6 text-[#00FF88] mx-auto mb-3" />
                                <span className="text-[#00FF88] text-xs font-mono">{s.step}</span>
                                <h3 className="text-white font-semibold text-sm mt-1">{s.title}</h3>
                                <p className="text-neutral-500 text-[11px] mt-1">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 서비스 상세 카드 */}
            <section className="px-6 pb-24">
                <div className="mx-auto max-w-5xl space-y-8">
                    {services.map((svc, i) => (
                        <div
                            key={i}
                            className="group p-8 rounded-2xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/20 transition-all duration-300"
                        >
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: svc.color + "15" }}>
                                            <svc.icon className="w-5 h-5" style={{ color: svc.color }} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-xl">{svc.title}</h3>
                                            <span className="text-neutral-600 text-xs font-mono">{svc.subtitle}</span>
                                        </div>
                                    </div>
                                    <p className="text-neutral-400 text-sm leading-relaxed mb-6">{svc.desc}</p>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                        <Zap className="w-3.5 h-3.5 text-[#00FF88]" />
                                        <span className="font-mono">{svc.pricing}</span>
                                    </div>
                                </div>
                                <div className="lg:w-80 shrink-0">
                                    <h4 className="text-neutral-500 text-xs font-mono tracking-wider mb-3">INCLUDES</h4>
                                    <div className="space-y-2.5">
                                        {svc.features.map((f) => (
                                            <div key={f} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-[#00FF88] shrink-0 mt-0.5" />
                                                <span className="text-neutral-300 text-sm">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 border-t border-neutral-800/50">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        어떤 서비스가 필요하신가요?
                    </h2>
                    <p className="text-neutral-400 mb-8">
                        귀사의 산업과 목표에 맞는 최적의 서비스를 제안해 드립니다.
                    </p>
                    <a
                        href="https://tenone.biz/contact"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00FF88] text-black font-semibold rounded-lg hover:bg-[#00DD77] transition-colors"
                    >
                        상담 신청 <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </section>
        </div>
    );
}
