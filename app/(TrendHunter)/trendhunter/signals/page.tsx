"use client";

import { Zap, TrendingUp, TrendingDown, Minus, ArrowRight, Clock, BarChart3 } from "lucide-react";

const signals = [
    {
        id: "s1",
        keyword: "에이전트 AI",
        trend: "up" as const,
        change: "+340%",
        platforms: ["카카오", "커뮤니티", "뉴스"],
        level: "mega" as const,
        desc: "자율 작업 수행 AI 에이전트. 엔터프라이즈 도입 가속화, 실무 적용 사례 급증.",
        relatedKeywords: ["AI 자동화", "워크플로우", "LLM 에이전트"],
        detectedAt: "3시간 전",
    },
    {
        id: "s2",
        keyword: "슬로우 콘텐츠",
        trend: "up" as const,
        change: "+180%",
        platforms: ["커뮤니티", "뉴스"],
        level: "micro" as const,
        desc: "숏폼 피로도 증가 속 긴 형식 콘텐츠 재부상. 팟캐스트, 롱폼 영상 체류 시간 증가.",
        relatedKeywords: ["숏폼 피로", "팟캐스트", "롱폼 영상"],
        detectedAt: "6시간 전",
    },
    {
        id: "s3",
        keyword: "하이퍼로컬 비즈니스",
        trend: "up" as const,
        change: "+120%",
        platforms: ["카카오", "뉴스"],
        level: "trend" as const,
        desc: "동네 기반 비즈니스의 글로벌 확장 모델 확산. 로컬 크리에이터 + 글로벌 팬덤.",
        relatedKeywords: ["로컬 크리에이터", "동네 상권", "글로벌 로컬"],
        detectedAt: "12시간 전",
    },
    {
        id: "s4",
        keyword: "디지털 디톡스",
        trend: "up" as const,
        change: "+95%",
        platforms: ["커뮤니티"],
        level: "micro" as const,
        desc: "스크린 타임 감소 관련 서비스/상품 검색 급증. 새로운 럭셔리 카테고리 가능성.",
        relatedKeywords: ["스크린 타임", "오프라인 경험", "웰니스"],
        detectedAt: "1일 전",
    },
    {
        id: "s5",
        keyword: "AI 카피라이팅",
        trend: "down" as const,
        change: "-15%",
        platforms: ["카카오", "커뮤니티"],
        level: "fad" as const,
        desc: "초기 열풍 대비 관심 감소. 품질 한계 인식 확산. 인간+AI 협업 모델로 전환 중.",
        relatedKeywords: ["생성형 AI", "콘텐츠 품질", "AI 한계"],
        detectedAt: "1일 전",
    },
    {
        id: "s6",
        keyword: "마이크로 SaaS",
        trend: "up" as const,
        change: "+75%",
        platforms: ["디스코드", "뉴스"],
        level: "trend" as const,
        desc: "1인/소규모 팀의 니치 SaaS 창업 트렌드. AI 기반 빠른 MVP + 수익화.",
        relatedKeywords: ["인디해커", "1인 창업", "AI MVP"],
        detectedAt: "2일 전",
    },
];

const levelMap = {
    mega: { label: "Mega", color: "bg-[#E50000]/20 text-[#E50000]" },
    trend: { label: "Trend", color: "bg-[#00C853]/20 text-[#00C853]" },
    micro: { label: "Micro", color: "bg-[#2196F3]/20 text-[#2196F3]" },
    fad: { label: "Fad", color: "bg-neutral-700/50 text-neutral-400" },
};

const trendIcon = {
    up: <TrendingUp className="w-4 h-4 text-[#00C853]" />,
    down: <TrendingDown className="w-4 h-4 text-[#E50000]" />,
    flat: <Minus className="w-4 h-4 text-neutral-400" />,
};

export default function TrendHunterSignalsPage() {
    return (
        <div className="bg-[#0A0A0A]">
            {/* Hero */}
            <section className="py-20 sm:py-28 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-[#FFB800]" />
                        <span className="text-[#FFB800] text-xs font-mono tracking-widest">TREND SIGNALS</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">트렌드 시그널</h1>
                    <p className="text-neutral-400 text-lg max-w-2xl">
                        아직 메인스트림은 아니지만 움직임이 포착된 키워드.
                        AI가 전 플랫폼 데이터를 교차 분석하여 실시간 감지합니다.
                    </p>
                </div>
            </section>

            {/* 시그널 그리드 */}
            <section className="px-6 pb-24">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {signals.map((s) => (
                            <article
                                key={s.id}
                                className="group p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#FFB800]/30 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {trendIcon[s.trend]}
                                        <span className={`font-bold text-lg ${s.trend === "up" ? "text-[#00C853]" : s.trend === "down" ? "text-[#E50000]" : "text-neutral-400"}`}>
                                            {s.change}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${levelMap[s.level].color}`}>
                                        {levelMap[s.level].label}
                                    </span>
                                </div>

                                <h3 className="text-white font-bold text-xl mb-2 group-hover:text-[#FFB800] transition-colors">
                                    {s.keyword}
                                </h3>
                                <p className="text-neutral-400 text-sm leading-relaxed mb-3">{s.desc}</p>

                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {s.relatedKeywords.map((kw) => (
                                        <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-500 font-mono">
                                            {kw}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-xs text-neutral-500">
                                    <div className="flex items-center gap-2">
                                        {s.platforms.map((p) => (
                                            <span key={p} className="px-1.5 py-0.5 rounded bg-neutral-800/50">{p}</span>
                                        ))}
                                    </div>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.detectedAt}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
