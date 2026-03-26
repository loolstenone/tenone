"use client";

import { useState } from "react";
import { Target, Users, Lightbulb, GraduationCap, Cpu, Handshake, Briefcase, ArrowRight, Clock, AlertCircle } from "lucide-react";

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string; brand: string }> = {
    recruit: { icon: Users, label: "인재 수요", color: "#2196F3", brand: "HeRo" },
    solution: { icon: Cpu, label: "솔루션 수요", color: "#00C853", brand: "SmarComm." },
    consulting: { icon: Target, label: "컨설팅 수요", color: "#FFB800", brand: "Brand Gravity" },
    education: { icon: GraduationCap, label: "교육 수요", color: "#8BC34A", brand: "Evolution School" },
    ai_demand: { icon: Lightbulb, label: "AI 수요", color: "#E50000", brand: "RooK" },
    collabo: { icon: Handshake, label: "콜라보", color: "#9C27B0", brand: "YouInOne" },
    career: { icon: Briefcase, label: "커리어", color: "#FF5722", brand: "HeRo" },
};

const opportunities = [
    {
        id: "o1",
        type: "ai_demand",
        title: "AI 영상 편집 자동화 니즈",
        description: "영상쟁이 방에서 'AI로 자막 자동 삽입 + 편집 포인트 추천' 관련 대화 반복 등장. 3일간 7건.",
        source: "카카오 영상쟁이방",
        detectedAt: "2시간 전",
        status: "new" as const,
    },
    {
        id: "o2",
        type: "recruit",
        title: "퍼포먼스 마케터 인력 수요",
        description: "'퍼포먼스 마케터 구합니다' 패턴 이번 주 5건 감지. 특히 스타트업 D2C 브랜드 중심.",
        source: "카카오 디마방 + 블라인드",
        detectedAt: "5시간 전",
        status: "new" as const,
    },
    {
        id: "o3",
        type: "consulting",
        title: "리브랜딩 컨설팅 수요",
        description: "'브랜딩 다시 해야 하는데' '리브랜딩 어디에 맡기지' 패턴 3건. 중소 F&B 브랜드.",
        source: "카카오 콜라보방",
        detectedAt: "1일 전",
        status: "reviewed" as const,
    },
    {
        id: "o4",
        type: "education",
        title: "Claude API 실습 교육 수요",
        description: "'Claude API 강의 있나' '프롬프트 엔지니어링 배우고 싶다' 패턴 다수. 비개발자 중심.",
        source: "카카오 RooK + 디스코드",
        detectedAt: "1일 전",
        status: "new" as const,
    },
    {
        id: "o5",
        type: "collabo",
        title: "크리에이터 × 브랜드 매칭",
        description: "'같이 콘텐츠 만들 브랜드' '인플루언서 콜라보 하고 싶은데' 패턴 감지.",
        source: "카카오 콜라보방 + 커뮤니티",
        detectedAt: "2일 전",
        status: "acted" as const,
    },
    {
        id: "o6",
        type: "solution",
        title: "소셜 미디어 자동 포스팅 니즈",
        description: "'인스타 자동 예약 포스팅 괜찮은 거 없나' 'SNS 관리 자동화' 반복 등장.",
        source: "카카오 디마방 + 프리랜서방",
        detectedAt: "3일 전",
        status: "reviewed" as const,
    },
];

const statusMap = {
    new: { label: "신규", color: "bg-[#E50000]/20 text-[#E50000]" },
    reviewed: { label: "검토중", color: "bg-[#FFB800]/20 text-[#FFB800]" },
    acted: { label: "대응완료", color: "bg-[#00C853]/20 text-[#00C853]" },
    dismissed: { label: "보류", color: "bg-neutral-700/50 text-neutral-400" },
};

export default function TrendHunterOpportunitiesPage() {
    const [filter, setFilter] = useState("전체");
    const types = ["전체", ...Object.keys(typeConfig)];

    const filtered = filter === "전체" ? opportunities : opportunities.filter(o => o.type === filter);

    return (
        <div className="bg-[#0A0A0A]">
            {/* Hero */}
            <section className="py-20 sm:py-28 px-6">
                <div className="mx-auto max-w-5xl">
                    <span className="text-[#00C853] text-xs font-mono tracking-widest">OPPORTUNITY RADAR</span>
                    <h1 className="text-3xl sm:text-5xl font-bold text-white mt-4 mb-4">기회 레이더</h1>
                    <p className="text-neutral-400 text-lg max-w-2xl">
                        전 플랫폼 대화에서 AI가 자동 감지한 사업 기회.
                        인재 수요, 솔루션 수요, 컨설팅 니즈, 교육 수요, 콜라보 매칭.
                    </p>
                </div>
            </section>

            {/* 필터 */}
            <section className="px-6 pb-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex flex-wrap gap-2">
                        {types.map((t) => {
                            const cfg = typeConfig[t];
                            return (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-mono transition-colors ${
                                        filter === t
                                            ? "bg-white text-black"
                                            : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-neutral-600"
                                    }`}
                                >
                                    {t === "전체" ? "전체" : cfg?.label || t}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* 기회 목록 */}
            <section className="px-6 pb-24">
                <div className="mx-auto max-w-5xl space-y-4">
                    {filtered.map((opp) => {
                        const cfg = typeConfig[opp.type];
                        const Icon = cfg.icon;
                        return (
                            <article
                                key={opp.id}
                                className="group p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-neutral-600 transition-all duration-300"
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: cfg.color + "15" }}
                                    >
                                        <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ backgroundColor: cfg.color + "20", color: cfg.color }}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-[10px] font-mono text-neutral-600">→ {cfg.brand}</span>
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${statusMap[opp.status].color}`}>
                                                {statusMap[opp.status].label}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-2">{opp.title}</h3>
                                        <p className="text-neutral-400 text-sm leading-relaxed mb-3">{opp.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                                            <span>{opp.source}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {opp.detectedAt}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
