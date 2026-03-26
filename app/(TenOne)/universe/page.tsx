"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, TrendingUp, GraduationCap, ExternalLink } from "lucide-react";

const businesses = [
    { id: "madleague", name: "MADLeague", role: "전국 대학생 동아리 연합", tags: ["wio", "yio"],
        wio: ["동아리 관리 DB", "경연 제출 시스템", "성과 아카이브"],
        yio: ["거점 멘토 조직화", "기수별 팀 구성", "YouInOne 크루 실습"],
        syn: "University Pool의 시작점. WIO로 운영 자동화, YIO로 멘토-학생 팀 구조. 인재 발굴 데이터가 HeRo로 흐른다.", href: "/madleague" },
    { id: "badak", name: "Badak", role: "현업 네트워킹", tags: ["wio", "yio"],
        wio: ["회원 DB·프로필", "연결 요청 시스템", "DAM 이벤트 관리"],
        yio: ["호스트 팀 구성", "바닥쇠 봇 운영팀", "콘텐츠 크루"],
        syn: "현업 인재 풀 + SmarComm 클라이언트 소스. WIO CRM이 Badak 회원을 HeRo·SmarComm으로 연결.", href: "/badak" },
    { id: "hero", name: "HeRo", role: "탤런트 에이전시", tags: ["wio", "yio", "rev"],
        wio: ["인재 매칭 알고리즘", "기업 DB·CRM", "포트폴리오 관리"],
        yio: ["매칭 컨설턴트 팀", "역량 평가 위원", "커리어 멘토링"],
        syn: "Universe 인재 파이프라인의 출구. WIO가 매칭 시스템, YIO가 컨설팅·평가.", href: "/hero" },
    { id: "smarcomm", name: "SmarComm.", role: "AI 마케팅 대행", tags: ["wio", "yio", "rev"],
        wio: ["6대 솔루션 플랫폼", "캠페인 자동화", "성과 대시보드"],
        yio: ["YouInOne 크루 투입", "프리랜서 매칭", "전략 기획팀"],
        syn: "Universe 핵심 수익 서비스. WIO 솔루션 테스트베드. YIO로 프로젝트마다 최적 팀 구성.", href: "/smarcomm" },
    { id: "mindle", name: "Mindle", role: "트렌드 플랫폼", tags: ["wio", "rev"],
        wio: ["크롤러 인프라", "콘텐츠 파이프라인", "Claude AI 자동화"],
        yio: ["Mindler 기여자 관리", "큐레이션 팀"],
        syn: "Intelligence 엔진. WIO 크롤러+AI가 콘텐츠 생산. SmarComm·Brand Gravity의 전략 소스.", href: "/mindle" },
    { id: "evschool", name: "Evolution School", role: "직무 교육", tags: ["yio", "rev", "edu"],
        wio: ["LMS 플랫폼", "수강 관리·수료증", "온라인 강의 시스템"],
        yio: ["Badak 멘토→강사", "커리큘럼 팀", "코호트 운영"],
        syn: "Badak 멘토를 강사로. WIO LMS로 운영 자동화. HeRo 연계로 수료생 기업 연결.", href: "#" },
    { id: "planners", name: "Planner's", role: "기획 도구·교육", tags: ["wio", "edu"],
        wio: ["Vrief·GPR 디지털 도구", "템플릿 시스템", "플래너 앱"],
        yio: ["기획 워크숍 퍼실리테이터", "MADLeague 강의"],
        syn: "Protocols(Vrief·GPR)의 제품화. WIO 도구로 접근, YIO 워크숍으로 교육.", href: "/planners" },
    { id: "brandgravity", name: "Brand Gravity", role: "브랜딩 컨설팅", tags: ["yio", "rev"],
        wio: ["Mindle 트렌드 데이터 활용", "브랜드 자산 관리"],
        yio: ["컨설턴트 팀(YouInOne)", "Badak 전문가 네트워크"],
        syn: "Mindle 트렌드 기반 브랜딩. SmarComm과 마케팅+브랜딩 풀패키지.", href: "#" },
    { id: "rook", name: "RooK", role: "AI 크리에이티브", tags: ["wio", "rev"],
        wio: ["AI 콘텐츠 생산 파이프라인", "Claude API 연동"],
        yio: ["크리에이터 크루", "MoNTZ 연계"],
        syn: "Mindle 트렌드+SmarComm 전략→RooK 실행. WIO AI 인프라 위에서 돌아가는 크리에이티브 엔진.", href: "/rook" },
];

const tagConfig: Record<string, { label: string; border: string }> = {
    wio: { label: "WIO", border: "border-indigo-500/40 text-indigo-400" },
    yio: { label: "YIO", border: "border-emerald-500/40 text-emerald-400" },
    rev: { label: "수익화", border: "border-amber-500/40 text-amber-400" },
    edu: { label: "교육", border: "border-rose-500/40 text-rose-400" },
};

const synergyChains = [
    { name: "인재 파이프라인", icon: Users, nodes: [
        { name: "MADLeague", sub: "발굴", accent: "border-emerald-600/50" },
        { name: "HeRo", sub: "역량+연결", accent: "border-orange-600/50" },
        { name: "Badak", sub: "현업 입성", accent: "border-emerald-600/50" },
        { name: "SmarComm", sub: "실전 수익", accent: "border-amber-600/50" },
    ]},
    { name: "트렌드-비즈니스 연계", icon: TrendingUp, nodes: [
        { name: "Mindle", sub: "트렌드 발견", accent: "border-blue-600/50" },
        { name: "SmarComm", sub: "마케팅 전략", accent: "border-amber-600/50" },
        { name: "Brand Gravity", sub: "브랜딩", accent: "border-amber-600/50" },
        { name: "RooK", sub: "AI 크리에이티브", accent: "border-amber-600/50" },
    ]},
    { name: "교육 사다리", icon: GraduationCap, nodes: [
        { name: "MADLeague", sub: "대학생", accent: "border-emerald-600/50" },
        { name: "Planner's", sub: "기획 도구", accent: "border-orange-600/50" },
        { name: "Evo School", sub: "직무 교육", accent: "border-orange-600/50" },
        { name: "HeRo", sub: "기업 데뷔", accent: "border-orange-600/50" },
    ]},
];

export default function UniversePage() {
    const [selected, setSelected] = useState<string | null>(null);
    const selectedBiz = businesses.find(b => b.id === selected);

    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--tn-bg)", color: "var(--tn-text)" }}>
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">

                {/* Hub */}
                <section className="text-center mb-10">
                    <p className="text-xs tracking-[0.3em] uppercase mb-8" style={{ color: "var(--tn-text-sub)" }}>
                        Universe Structure
                    </p>
                    <div className="inline-block px-10 py-5 border rounded-none" style={{ borderColor: "var(--tn-border)" }}>
                        <h1 className="text-2xl font-light tracking-tight">Ten:One&trade;</h1>
                        <p className="text-xs mt-1" style={{ color: "var(--tn-text-sub)" }}>지주사 &middot; 인큐베이터 &middot; Universe 허브</p>
                    </div>
                    <div className="text-xs my-4" style={{ color: "var(--tn-text-sub)" }}>&darr; 전 사업에 적용</div>
                </section>

                {/* Two OS */}
                <section className="grid grid-cols-2 gap-4 mb-14">
                    <Link href="/wio" className="group p-6 border transition-colors hover:border-indigo-500/60 text-center"
                        style={{ borderColor: "var(--tn-border)", backgroundColor: "transparent" }}>
                        <h2 className="text-lg font-light tracking-wide text-indigo-400">WIO</h2>
                        <p className="text-[11px] mt-1" style={{ color: "var(--tn-text-sub)" }}>IT 솔루션 인프라</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--tn-text-sub)", opacity: 0.6 }}>Project &middot; CRM &middot; Content &middot; AI</p>
                    </Link>
                    <Link href="/youinone" className="group p-6 border transition-colors hover:border-emerald-500/60 text-center"
                        style={{ borderColor: "var(--tn-border)", backgroundColor: "transparent" }}>
                        <h2 className="text-lg font-light tracking-wide text-emerald-400">YouInOne</h2>
                        <p className="text-[11px] mt-1" style={{ color: "var(--tn-text-sub)" }}>인간 솔루션 인프라</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--tn-text-sub)", opacity: 0.6 }}>팀 구성 &middot; 역할 &middot; 협업 &middot; 성과</p>
                    </Link>
                </section>

                {/* Business Portfolio */}
                <section className="mb-14">
                    <p className="text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: "var(--tn-text-sub)" }}>
                        사업 포트폴리오 &mdash; 카드 클릭 시 적용 방식 확인
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-px" style={{ backgroundColor: "var(--tn-border)" }}>
                        {businesses.map(b => (
                            <button
                                key={b.id}
                                onClick={() => setSelected(selected === b.id ? null : b.id)}
                                className={`text-left p-4 transition-all ${selected === b.id ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                                style={{ backgroundColor: "var(--tn-bg)" }}
                            >
                                <div className="text-sm font-light tracking-wide">{b.name}</div>
                                <div className="text-[10px] mt-0.5" style={{ color: "var(--tn-text-sub)" }}>{b.role}</div>
                                <div className="flex gap-1 mt-2 flex-wrap">
                                    {b.tags.map(t => (
                                        <span key={t} className={`text-[8px] px-1.5 py-0.5 border ${tagConfig[t].border}`}>
                                            {tagConfig[t].label}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        ))}
                    </div>

                    {selectedBiz && (
                        <div className="mt-6 p-6 border" style={{ borderColor: "var(--tn-border)" }}>
                            <div className="flex items-center justify-between mb-5">
                                <h4 className="text-sm font-light tracking-wide">{selectedBiz.name}</h4>
                                {selectedBiz.href !== "#" && (
                                    <Link href={selectedBiz.href} className="text-[10px] flex items-center gap-1 opacity-50 hover:opacity-100 transition">
                                        사이트 <ExternalLink className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                <div className="border-l-2 border-indigo-500/40 pl-4">
                                    <div className="text-[9px] tracking-[0.15em] uppercase text-indigo-400 mb-2">WIO (IT 솔루션)</div>
                                    {selectedBiz.wio.map(w => (
                                        <div key={w} className="text-xs py-1.5 border-b last:border-0" style={{ borderColor: "var(--tn-border)", color: "var(--tn-text-sub)" }}>{w}</div>
                                    ))}
                                </div>
                                <div className="border-l-2 border-emerald-500/40 pl-4">
                                    <div className="text-[9px] tracking-[0.15em] uppercase text-emerald-400 mb-2">YouInOne (인간 솔루션)</div>
                                    {selectedBiz.yio.map(y => (
                                        <div key={y} className="text-xs py-1.5 border-b last:border-0" style={{ borderColor: "var(--tn-border)", color: "var(--tn-text-sub)" }}>{y}</div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: "var(--tn-text-sub)" }}>시너지</div>
                                <p className="text-xs leading-relaxed" style={{ color: "var(--tn-text-sub)" }}>{selectedBiz.syn}</p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Synergy Chains */}
                <section className="mb-14">
                    <p className="text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: "var(--tn-text-sub)" }}>
                        수평 연계 &mdash; 사업 간 시너지 체인
                    </p>
                    <div className="space-y-6">
                        {synergyChains.map(chain => (
                            <div key={chain.name}>
                                <div className="flex items-center gap-2 text-[10px] mb-2" style={{ color: "var(--tn-text-sub)" }}>
                                    <chain.icon className="w-3 h-3" />
                                    {chain.name}
                                </div>
                                <div className="grid grid-cols-4 gap-px" style={{ backgroundColor: "var(--tn-border)" }}>
                                    {chain.nodes.map((node, i) => (
                                        <div key={i} className={`p-3 text-center border-t-2 ${node.accent}`} style={{ backgroundColor: "var(--tn-bg)" }}>
                                            <div className="text-xs font-light">{node.name}</div>
                                            <div className="text-[9px] mt-0.5" style={{ color: "var(--tn-text-sub)" }}>{node.sub}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center">
                    <Link href="/about"
                        className="inline-flex items-center gap-2 px-8 py-3 text-sm tracking-wide transition-colors"
                        style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                        Philosophy &middot; History &middot; Brands
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </section>
            </div>
        </div>
    );
}
