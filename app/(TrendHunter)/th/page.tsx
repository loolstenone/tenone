"use client";

import { TrendingUp, Brain, BarChart3, FileText, Lightbulb, Rocket, Database, Cpu, Users, ArrowRight, Zap, Globe, Target, Layers } from "lucide-react";

/* ── 트렌드 분류 피라미드 데이터 ── */
const trendLevels = [
    { level: "Meta Trend", desc: "문명 전환 수준의 거대 흐름", span: "50년+", color: "#00FF88", width: "100%" },
    { level: "Mega Trend", desc: "사회 전체를 관통하는 장기 트렌드", span: "10~30년", color: "#00DD77", width: "85%" },
    { level: "Macro Trend", desc: "산업·시장 단위 확산", span: "5~10년", color: "#00BB66", width: "70%" },
    { level: "Trend", desc: "가치와 방향성이 수반되는 현상", span: "3~5년", color: "#009955", width: "55%" },
    { level: "Micro Trend", desc: "소수 오피니언 리더 중심", span: "1~2년", color: "#007744", width: "40%" },
    { level: "Fad", desc: "일시적 유행 (FAD)", span: "수개월", color: "#555555", width: "25%" },
];

/* ── AI 프로세스 단계 ── */
const processSteps = [
    {
        icon: Database,
        step: "01",
        title: "Data Crawling",
        subtitle: "데이터 수집",
        desc: "소셜 미디어, 뉴스, 검색 트렌드, 소비자 리뷰, 특허 데이터 등 수백만 개의 데이터 포인트를 실시간 크롤링합니다.",
        tags: ["SNS", "뉴스", "검색어", "리뷰", "특허"],
    },
    {
        icon: Cpu,
        step: "02",
        title: "AI Analysis",
        subtitle: "인공지능 분석",
        desc: "자연어 처리(NLP), 감성 분석, 패턴 인식 AI가 데이터를 분류·분석하여 트렌드 시그널을 탐지합니다.",
        tags: ["NLP", "감성 분석", "클러스터링", "예측 모델"],
    },
    {
        icon: Users,
        step: "03",
        title: "Human Curation",
        subtitle: "전문가 큐레이션",
        desc: "AI가 발견한 시그널을 업계 전문가가 해석하고 맥락을 부여합니다. 기술로 찾고, 사람이 의미를 만듭니다.",
        tags: ["전문가 리뷰", "맥락 분석", "인사이트 도출"],
    },
];

/* ── 서비스 카드 ── */
const services = [
    {
        icon: FileText,
        title: "트렌드 리포트",
        desc: "월간/분기별 트렌드 분석 보고서. 산업별 맞춤 데이터와 AI 인사이트를 결합한 종합 리포트.",
        features: ["산업별 맞춤 분석", "데이터 기반 예측", "시각화 대시보드"],
    },
    {
        icon: Target,
        title: "브랜드 전략 컨설팅",
        desc: "트렌드 데이터를 기반으로 브랜드 포지셔닝, 신규 사업 기회 발굴, 마케팅 전략을 설계합니다.",
        features: ["시장 기회 분석", "포지셔닝 전략", "경쟁 환경 매핑"],
    },
    {
        icon: Lightbulb,
        title: "콘텐츠 제작",
        desc: "트렌드 인사이트를 기반으로 SNS 콘텐츠, 블로그, 영상 기획안 등 실행 가능한 콘텐츠를 제작합니다.",
        features: ["SNS 전략", "영상 기획", "카피라이팅"],
    },
    {
        icon: BarChart3,
        title: "맞춤형 데이터 분석",
        desc: "기업 고유의 데이터와 외부 트렌드 데이터를 결합하여 의사결정에 필요한 인사이트를 제공합니다.",
        features: ["자사 데이터 연동", "경쟁사 모니터링", "실시간 대시보드"],
    },
];

/* ── Ten:One Universe 브랜드 ── */
const universeProjects = [
    { name: "domo", desc: "커뮤니케이션" },
    { name: "Planner's", desc: "기획·전략" },
    { name: "HeRo", desc: "인재 발굴" },
    { name: "문래지앙", desc: "로컬 프로젝트" },
    { name: "MoNTZ", desc: "포토그래피" },
    { name: "Scribble", desc: "크리에이티브" },
    { name: "BrandGravity", desc: "브랜드 전략" },
    { name: "SmarComm.", desc: "AI 마케팅" },
    { name: "Seoul/360°", desc: "서울 투어" },
    { name: "FWN", desc: "패션 네트워크" },
    { name: "MAD League", desc: "대학 연합" },
    { name: "Badak", desc: "네트워킹" },
];

export default function TrendHunterPage() {
    return (
        <div className="bg-[#0A0A0A]">
            {/* ════════════════════════ HERO ════════════════════════ */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* 배경 그리드 패턴 */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "linear-gradient(#00FF88 1px, transparent 1px), linear-gradient(90deg, #00FF88 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }} />
                {/* 그래디언트 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]" />

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00FF88]/20 bg-[#00FF88]/5 mb-8">
                        <Zap className="w-3.5 h-3.5 text-[#00FF88]" />
                        <span className="text-[#00FF88] text-xs font-mono tracking-wider">AI-POWERED TREND ANALYSIS</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6">
                        <span className="text-white">AI가 데이터를 읽고,</span>
                        <br />
                        <span className="text-[#00FF88]">우리가 트렌드를 만든다.</span>
                    </h1>

                    <p className="text-neutral-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        수백만 데이터 포인트에서 트렌드 시그널을 탐지하고,
                        전문가의 해석으로 실행 가능한 인사이트를 만듭니다.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="#services"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00FF88] text-black font-semibold rounded-lg hover:bg-[#00DD77] transition-colors"
                        >
                            서비스 알아보기
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 px-8 py-3.5 border border-neutral-700 text-white rounded-lg hover:border-[#00FF88]/50 hover:text-[#00FF88] transition-colors"
                        >
                            문의하기
                        </a>
                    </div>
                </div>
            </section>

            {/* ════════════════════════ ABOUT — 트렌드란 무엇인가 ════════════════════════ */}
            <section id="about" className="py-24 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <span className="text-[#00FF88] text-xs font-mono tracking-widest">WHAT IS TREND</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">유행과 트렌드는 다릅니다</h2>
                        <p className="text-neutral-400 mt-4 max-w-xl mx-auto">
                            일시적 유행(Fad)은 금방 사라지지만, 진정한 트렌드는 장기적으로 나타나며 가치와 방향성이 수반됩니다.
                        </p>
                    </div>

                    {/* 트렌드 피라미드 */}
                    <div className="space-y-3 max-w-2xl mx-auto">
                        {trendLevels.map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div
                                    className="h-12 rounded-lg flex items-center px-4 transition-all duration-300 hover:scale-[1.02]"
                                    style={{ width: item.width, backgroundColor: item.color + "15", borderLeft: `3px solid ${item.color}` }}
                                >
                                    <span className="text-sm font-mono font-bold" style={{ color: item.color }}>
                                        {item.level}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0 hidden sm:block">
                                    <p className="text-xs text-neutral-500 truncate">{item.desc}</p>
                                    <p className="text-[10px] text-neutral-600 font-mono">{item.span}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 핵심 철학 */}
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <Globe className="w-8 h-8 text-[#00FF88] mb-4" />
                            <h3 className="text-white font-semibold text-lg mb-2">추적이 아닌 실행</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                트렌드 헌터는 단순히 트렌드를 추적하는 데 그치지 않습니다.
                                발견한 트렌드를 제품과 서비스로 직접 실현합니다.
                            </p>
                        </div>
                        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <Brain className="w-8 h-8 text-[#00FF88] mb-4" />
                            <h3 className="text-white font-semibold text-lg mb-2">AI + 인간의 직관</h3>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                AI는 패턴을 찾고, 사람은 의미를 부여합니다.
                                기술과 직관의 결합이 진짜 인사이트를 만듭니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════ PROCESS — AI 프로세스 ════════════════════════ */}
            <section id="process" className="py-24 px-6 bg-gradient-to-b from-[#0A0A0A] via-[#0d1a12] to-[#0A0A0A]">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <span className="text-[#00FF88] text-xs font-mono tracking-widest">AI-POWERED PROCESS</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">데이터에서 인사이트까지</h2>
                        <p className="text-neutral-400 mt-4 max-w-xl mx-auto">
                            3단계 AI 프로세스로 트렌드 시그널을 발견하고, 실행 가능한 전략으로 전환합니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {processSteps.map((step, i) => (
                            <div key={i} className="relative group">
                                {/* 연결선 */}
                                {i < processSteps.length - 1 && (
                                    <div className="hidden md:block absolute top-12 right-0 translate-x-1/2 w-8 h-px bg-[#00FF88]/20" />
                                )}
                                <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/30 transition-colors h-full">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[#00FF88] text-2xl font-mono font-bold">{step.step}</span>
                                        <step.icon className="w-6 h-6 text-[#00FF88]/60" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-1">{step.title}</h3>
                                    <p className="text-[#00FF88]/60 text-xs font-mono mb-3">{step.subtitle}</p>
                                    <p className="text-neutral-400 text-sm leading-relaxed mb-4">{step.desc}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {step.tags.map((tag) => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[#00FF88]/10 text-[#00FF88]/70 font-mono">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════ SERVICES ════════════════════════ */}
            <section id="services" className="py-24 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <span className="text-[#00FF88] text-xs font-mono tracking-widest">SERVICES</span>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3">트렌드를 실행으로</h2>
                        <p className="text-neutral-400 mt-4 max-w-xl mx-auto">
                            데이터 수집부터 전략 수립, 콘텐츠 제작까지. 트렌드의 발견과 실행을 한 곳에서.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((svc, i) => (
                            <div key={i} className="group p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/30 transition-all duration-300">
                                <svc.icon className="w-8 h-8 text-[#00FF88] mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-white font-bold text-lg mb-2">{svc.title}</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed mb-4">{svc.desc}</p>
                                <div className="space-y-1.5">
                                    {svc.features.map((f) => (
                                        <div key={f} className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-[#00FF88]" />
                                            <span className="text-xs text-neutral-500">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════ UNIVERSE ════════════════════════ */}
            <section className="py-24 px-6 border-t border-neutral-800/50">
                <div className="mx-auto max-w-5xl">
                    <div className="text-center mb-12">
                        <span className="text-[#00FF88] text-xs font-mono tracking-widest">TEN:ONE™ UNIVERSE</span>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mt-3">연결된 브랜드 생태계</h2>
                        <p className="text-neutral-400 mt-3 text-sm">
                            Trend Hunter가 발견한 트렌드는 Ten:One Universe의 브랜드들을 통해 실현됩니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {universeProjects.map((p, i) => (
                            <div key={i} className="p-4 rounded-lg border border-neutral-800/50 bg-neutral-900/20 hover:border-[#00FF88]/20 transition-colors text-center">
                                <p className="text-white text-sm font-medium">{p.name}</p>
                                <p className="text-neutral-500 text-[10px] mt-1">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════════════════════════ CONTACT CTA ════════════════════════ */}
            <section id="contact" className="py-24 px-6">
                <div className="mx-auto max-w-3xl text-center">
                    <Layers className="w-10 h-10 text-[#00FF88] mx-auto mb-6" />
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        트렌드가 궁금하신가요?
                    </h2>
                    <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
                        귀사의 산업에 맞는 트렌드 리포트와 컨설팅을 제안합니다.
                        아래로 연락주시면 빠르게 답변 드리겠습니다.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <a
                            href="mailto:lools@tenone.biz"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00FF88] text-black font-semibold rounded-lg hover:bg-[#00DD77] transition-colors"
                        >
                            이메일 보내기
                            <ArrowRight className="w-4 h-4" />
                        </a>
                        <div className="text-neutral-500 text-sm font-mono">
                            lools@tenone.biz &middot; +82 10 2795 1001
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
