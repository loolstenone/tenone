"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { historyEvents } from "@/lib/data";
import { UNIVERSE_ROLE_GROUPS } from "@/lib/universe-map";

const TOTAL_BRAND_COUNT = UNIVERSE_ROLE_GROUPS.reduce((sum, g) => sum + g.brands.length, 0);

// ===== History Data (SSOT: lib/data.ts historyEvents, date 내림차순) =====
const HISTORY_DATA = [...historyEvents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(h => ({
        year: h.year,
        date: h.date.substring(0, 7).replace('-', '.'),
        title: h.title,
        desc: h.description,
        link: h.link,
    }));

const years = ['전체', ...Array.from(new Set(HISTORY_DATA.map(h => h.year))).sort((a, b) => b.localeCompare(a))];

// ===== Flywheel Data =====
const flywheel = [
    { num: "01", title: "신뢰 기반 네트워크", desc: "업계 현업자들의 자발적 참여" },
    { num: "02", title: "인재 발굴", desc: "대학생부터 현업 전문가까지 기획자를 발굴" },
    { num: "03", title: "프로젝트 실행", desc: "실전 프로젝트로 문제를 해결하고 경험을 축적" },
    { num: "04", title: "성공 경험 공유", desc: "성과를 공유하여 네트워크 전체가 성장" },
    { num: "05", title: "기회 발견", desc: "신뢰 기반에서 새로운 비즈니스 기회 창출" },
    { num: "06", title: "지속 성장", desc: "순환 구조로 네트워크가 확장되고 강화" },
];

function AboutContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState('philosophy');
    const [yearFilter, setYearFilter] = useState('전체');

    useEffect(() => {
        if (tabParam && ['philosophy', 'universe', 'brands', 'history'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const filteredHistory = yearFilter === '전체' ? HISTORY_DATA : HISTORY_DATA.filter(h => h.year === yearFilter);

    const tabs = [
        { id: 'philosophy', label: 'Philosophy' },
        { id: 'universe', label: 'Universe' },
        { id: 'brands', label: 'Brands' },
        { id: 'history', label: 'History' },
    ];

    return (
        <div className="tn-surface tn-text">
            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">
                        About
                    </p>
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-light leading-tight">
                        가치로 연결된<br />
                        <span className="font-bold">세계관을 만드는 사람들</span>
                    </h1>
                    <p className="mt-6 text-lg tn-text-sub max-w-2xl">
                        Ten:One™은 인재를 발굴하고, 연결하고, 기업과 사회의 문제를 해결합니다.
                    </p>
                </div>
            </section>

            {/* Tab Navigation */}
            <section className="border-b tn-border sticky top-16 tn-surface z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-0 overflow-x-auto">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 text-sm tracking-wide transition-colors border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-neutral-900 tn-text font-medium'
                                        : 'border-transparent tn-text-sub hover:tn-text-sub'
                                }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Philosophy Tab ===== */}
            {activeTab === 'philosophy' && (
                <>
                    {/* Origin Story */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-start">
                            <div>
                                <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Origin</p>
                                <h2 className="text-xl md:text-3xl font-light leading-relaxed">
                                    우연히 시계를 봤을 때<br />
                                    <span className="font-bold">10시 01분</span>일 확률은<br />
                                    얼마나 될까?
                                </h2>
                                <p className="mt-8 tn-text-sub leading-relaxed">
                                    PC통신 시절부터 사용하던 ID &apos;lools&apos;, 생일이자 Ten:One™의 기원인 10월 1일.
                                    반복되는 우연은 그저 우연이 아니라, 마치 계획된 우연처럼 지금의 나를 만들었습니다.
                                </p>
                                <p className="mt-4 tn-text-sub leading-relaxed">
                                    머릿속에 끊임없이 떠오르던 수많은 생각과 구상들.
                                    과거의 아이디어와 계획들을 세상에 꺼내 놓기로 결심하며
                                    Ten:One™ Universe가 시작되었습니다.
                                </p>
                            </div>
                            <div className="aspect-[4/3] tn-bg-alt flex items-center justify-center overflow-hidden">
                                <div className="text-center">
                                    <p className="text-3xl font-light tracking-tight text-neutral-300">10:01</p>
                                    <p className="text-xs mt-1 text-neutral-400">The moment it all began</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Mission / Vision */}
                    <section className="tn-card py-16 md:py-24 px-6" style={{ backgroundColor: "var(--tn-surface)", color: "var(--tn-text)" }}>
                        <div className="max-w-7xl mx-auto">
                            <div className="grid md:grid-cols-2 gap-8 md:gap-16">
                                <div>
                                    <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Mission</p>
                                    <h2 className="text-xl md:text-3xl font-bold leading-relaxed">
                                        기획하고, 연결하고, 확장한다.
                                    </h2>
                                    <p className="text-sm tn-text-sub mt-2">Plan. Connect. Expand.</p>
                                    <p className="mt-8 tn-text-sub leading-relaxed">
                                        약한 연결 고리가 만드는 강력한 기회.
                                        다른 영역에서 다르게 일하는 사람들을 만나고,
                                        본질을 지키며 빠르게 움직이고 실행에 옮깁니다.
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Vision</p>
                                    <h2 className="text-xl md:text-3xl font-bold leading-relaxed">
                                        10,000명의 기획자를<br />발굴하고 연결한다.
                                    </h2>
                                    <p className="text-sm tn-text-sub mt-2">Who is the Next?</p>
                                    <p className="mt-8 tn-text-sub leading-relaxed">
                                        가치 네트워크를 만드는 연결자가 되기로 했습니다.
                                        적어도 자기 인생에서만큼은 모두가 기획자입니다.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Core Value */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Core Value</p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                변하지 않을 가치에 집중하여 <span className="font-bold">빠르게 가치를 창출한다</span>
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6 md:gap-12">
                                {[
                                    { num: "01", symbol: "◆", title: "본질", en: "Essence", desc: "변하지 않을 가치에 집요하게 집중한다. 트렌드에 흔들리지 않는 근본적인 가치를 찾는다." },
                                    { num: "02", symbol: "→", title: "속도", en: "Speed", desc: "옳은 방향을 계속 확인하며 빠르게 전진한다. 완벽을 기다리지 않고 움직인다." },
                                    { num: "03", symbol: "■", title: "이행", en: "Carry Out", desc: "본질이 확인된다면 바로 실행에 옮긴다. 실현되지 않으면 아이디어가 아니다." },
                                ].map((val) => (
                                    <div key={val.num} className="border-t tn-border pt-8">
                                        <span className="text-sm tn-text-muted font-mono">{val.num}</span>
                                        <h3 className="text-2xl font-bold mt-3">
                                            <span className="tn-text-muted mr-2">{val.symbol}</span>{val.title}
                                        </h3>
                                        <p className="text-sm tn-text-sub mt-1">{val.en}</p>
                                        <p className="text-sm tn-text-sub mt-4 leading-relaxed">{val.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Principle 10 */}
                    <section className="tn-bg-alt py-16 md:py-24 px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Principle 10</p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                우리가 <span className="font-bold">믿는 것들</span>
                            </h2>
                            <div className="space-y-6">
                                {[
                                    "우리는 모두 기획자다. 적어도 자기 인생에서 만큼은.",
                                    "기획은 문제를 해결하는 것이다.",
                                    "기획자는 일이 되게 하는 사람이다.",
                                    "어설픈 완벽주의는 일을 출발시키지 못한다.",
                                    "리더와 팔로어는 역할이지 직급이 아니다.",
                                    "문제의 본질에 집중한다.",
                                    "실현되지 않으면 아이디어가 아니다.",
                                    "나의 성장이 우리의 성장이다.",
                                    "신뢰는 먼저 보여주는 것이다.",
                                    "나의 작은 세계가 연결되어 하나의 거대한 세계관을 만든다.",
                                ].map((principle, i) => (
                                    <div key={i} className="flex items-start gap-6 py-4 border-b tn-border last:border-0">
                                        <span className="text-2xl font-bold tn-text-muted min-w-[2.5rem] text-right font-mono">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <p className="tn-text-sub leading-relaxed">{principle}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Founder */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
                            <div className="aspect-square tn-bg-alt flex items-center justify-center max-w-md overflow-hidden">
                                <div className="w-32 h-32 rounded-full bg-neutral-900 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white">CJ</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Founder</p>
                                <h2 className="text-xl md:text-3xl font-bold">전천일</h2>
                                <p className="text-sm tn-text-sub mt-1">Cheonil Jeon · Value Connector</p>
                                <p className="mt-6 tn-text-sub leading-relaxed">
                                    광고, 마케팅, 커뮤니케이션, 기획 분야에서 일해왔습니다.
                                    트렌드, 브랜딩, IT에 관심을 가지고 가치를 연결하는 일을 하고 있습니다.
                                </p>
                                <div className="mt-6 space-y-2 text-sm tn-text-sub">
                                    <p><a href="https://tenone.biz/contact" className="hover:tn-text transition-colors">tenone.biz/contact</a></p>
                                    <p><a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="hover:tn-text transition-colors">Kakao Open Chat</a></p>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* ===== Universe Tab ===== */}
            {activeTab === 'universe' && (
                <>
                    {/* Universe Intro */}
                    <section className="py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Universe</p>
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-light leading-relaxed max-w-3xl">
                                각 유니버스는 고유한 <span className="font-bold">본질(Essence)</span>을 가지고 있으며,
                                하나의 거대한 선순환 생태계로 연결되어 있습니다.
                            </h2>
                        </div>
                    </section>

                    {/* Brand Ecosystem — 8 역할 그룹 (SSOT: lib/universe-map.ts) */}
                    <section className="tn-bg-alt py-16 md:py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Brand Ecosystem</p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                <span className="font-bold">{UNIVERSE_ROLE_GROUPS.length}개 역할 그룹</span>의 {TOTAL_BRAND_COUNT}개 브랜드가 하나의 생태계를 이룹니다.
                            </h2>
                            <div className="space-y-3">
                                {UNIVERSE_ROLE_GROUPS.map((group) => (
                                    <div key={group.num} className="border overflow-hidden" style={{ borderColor: "var(--tn-border)", backgroundColor: "var(--tn-surface)" }}>
                                        <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "var(--tn-border)", borderLeftWidth: 3, borderLeftColor: group.color }}>
                                            <span className="text-[11px] font-mono" style={{ color: group.color }}>{group.num}</span>
                                            <span className="text-xs font-medium tn-text-sub">{group.role}</span>
                                            <span className="ml-auto text-[10px] tn-text-muted">{group.brands.length}개</span>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px" style={{ backgroundColor: "var(--tn-border)" }}>
                                            {group.brands.map((brand) => {
                                                const inner = (
                                                    <div style={{ backgroundColor: "var(--tn-surface)" }} className="h-full p-4 hover:opacity-80 transition-opacity">
                                                        <div className="flex items-start gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: group.color }} />
                                                            <div>
                                                                <p className="text-sm font-bold tn-text leading-tight">{brand.name}</p>
                                                                {brand.kr && <p className="text-[10px] tn-text-muted">{brand.kr}</p>}
                                                                <p className="text-[11px] tn-text-sub mt-1 leading-snug">{brand.desc}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                                return brand.href ? (
                                                    <Link key={brand.name} href={brand.href}>{inner}</Link>
                                                ) : (
                                                    <div key={brand.name}>{inner}</div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Flywheel */}
                    <section className="tn-card py-16 md:py-24 px-6" style={{ backgroundColor: "var(--tn-surface)", color: "var(--tn-text)" }}>
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Ten:One™ Flywheel</p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                실행은 연결을 가속하고, <span className="font-bold">연결은 더 많은 기회를 만든다.</span>
                            </h2>
                            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-px" style={{ backgroundColor: "var(--tn-border)" }}>
                                {flywheel.map((step) => (
                                    <div key={step.num} className="p-6" style={{ backgroundColor: "var(--tn-surface)" }}>
                                        <span className="text-sm text-neutral-600 font-mono">{step.num}</span>
                                        <h3 className="text-sm font-bold mt-3">{step.title}</h3>
                                        <p className="text-xs tn-text-sub mt-2 leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-neutral-600 mt-8 text-sm">↻ 이 순환은 계속됩니다</p>
                        </div>
                    </section>

                    {/* Connection Model */}
                    <section className="py-24 px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Connection Model</p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                브랜드는 <span className="font-bold">4가지 방식</span>으로 연결됩니다.
                            </h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                {[
                                    { type: "Parent", desc: "모-자 관계. Ten:One™이 직접 운영하는 핵심 브랜드.", example: "Ten:One™ → LUKI, RooK, MAD League" },
                                    { type: "Collaboration", desc: "협업 관계. 프로젝트 단위로 함께 일하는 파트너 브랜드.", example: "MAD League × 지평주조" },
                                    { type: "Support", desc: "지원 관계. 기술, 인프라, 네트워크를 공유하는 관계.", example: "Badak → YouInOne" },
                                    { type: "Network", desc: "네트워크 관계. 동일 생태계 내 독립적으로 활동하는 관계.", example: "PAM, ADlle, ABC, 제주수작" },
                                ].map((conn) => (
                                    <div key={conn.type} className="border tn-border p-8">
                                        <h3 className="text-lg font-bold tn-text">{conn.type}</h3>
                                        <p className="text-sm tn-text-sub mt-2 leading-relaxed">{conn.desc}</p>
                                        <p className="text-xs tn-text-sub mt-4 font-mono">{conn.example}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* ===== Brands Tab ===== */}
            {activeTab === 'brands' && (
                <>
                    {/* Intro */}
                    <section className="py-24 px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Brand Roles</p>
                            <h2 className="text-xl md:text-3xl font-light mb-4">
                                리더와 팔로어는 <span className="font-bold">역할이지 직급이 아니다</span>
                            </h2>
                            <p className="text-sm tn-text-sub leading-relaxed max-w-2xl">
                                각 브랜드는 상하 관계가 아니라 서로 다른 역할로 시너지를 만듭니다.
                                상황에 따라 한 브랜드가 엔진이 되기도 하고, 연료가 되기도 하고, 출구가 되기도 합니다.
                            </p>
                        </div>
                    </section>

                    {/* Role Groups */}
                    <section className="px-6 pb-16">
                        <div className="max-w-4xl mx-auto space-y-10">
                            {[
                                {
                                    label: "철학·언어를 만드는 역할",
                                    brands: [
                                        { name: "Ten:One™", role: "Universe의 철학과 방향을 정의. 연결의 기회를 만든다", note: "모든 브랜드가 같은 철학 위에 서 있게 하는 역할. 직급이 아니라 나침반" },
                                        { name: "Protocols", role: "Vrief · GPR · Principle10. 모두가 같은 언어로 일하게 한다", note: "누가 쓰든 같은 방식으로 생각·실행. Universe 공통 문법" },
                                    ],
                                },
                                {
                                    label: "일이 되게 하는 역할",
                                    brands: [
                                        { name: "WIO", role: "모든 사업의 IT 인프라. 입력을 없애고 AI가 채운다", note: "사업이 커질수록 더 필요해지는 역할. 조용히 전체를 받친다" },
                                        { name: "YouInOne", role: "모든 사업의 팀·협업 구조. 사람이 함께 일하게 한다", note: "WIO(IT)와 쌍으로 움직이는 인간 인프라. 프로젝트마다 최적 크루 구성" },
                                    ],
                                },
                                {
                                    label: "사람을 모으는 역할",
                                    brands: [
                                        { name: "MADLeague", role: "전국 대학생이 모이는 곳. 실전이 사람을 강하게 만든다", note: "가장 넓은 입구. 여기서 모인 사람이 Universe 전체로 흐른다" },
                                        { name: "Badak", role: "현업이 모이는 곳. 약한 연결이 강력한 기회를 만든다", note: "MADLeague 졸업생의 다음 집. 멘토·클라이언트·크루가 동시에 여기 있다" },
                                        { name: "0gamja · domo · FWN", role: "중고대학생 · 시니어 · 패션. 각 영역의 특화 입구", note: "Universe 생태계를 더 넓고 다양하게 만드는 역할" },
                                    ],
                                },
                                {
                                    label: "사람을 키우고 연결하는 역할",
                                    brands: [
                                        { name: "HeRo", role: "발굴한 인재를 키워서 세상에 내보낸다", note: "MADLeague·Badak의 출구이자 기업의 입구. 연결이 수익이 된다" },
                                        { name: "Evolution School · Planner's", role: "역량을 높이는 도구와 교육. 기획자를 기획자답게", note: "HeRo 전 단계. 교육이 인재를 완성한다" },
                                        { name: "ChangeUp", role: "창업 트랙. 사업가로 데뷔하는 경로", note: "MADLeague의 창업 가지. HeRo 스타트업 연계" },
                                    ],
                                },
                                {
                                    label: "먼저 보는 역할",
                                    brands: [
                                        { name: "Mindle", role: "트렌드를 보이기 전에 먼저 발견하고 해석한다", note: "특정 사업에 속하지 않고 전체를 관통한다. 발견한 것이 전략이 되고 전략이 실행이 된다" },
                                    ],
                                },
                                {
                                    label: "문제를 풀고 가치를 만드는 역할",
                                    brands: [
                                        { name: "SmarComm.", role: "기업의 마케팅 문제를 AI로 푼다", note: "Mindle 트렌드 + YIO 크루 + WIO 인프라가 여기서 만나 실행된다" },
                                        { name: "Brand Gravity · Naming Factory", role: "브랜드 문제를 푼다. 이름을 짓고 중력을 만든다", note: "SmarComm과 수평 연계. 마케팅+브랜딩 풀패키지" },
                                        { name: "RooK", role: "AI로 크리에이티브를 실행한다", note: "SmarComm 전략의 실행 파트너. Mindle 트렌드를 콘텐츠로" },
                                    ],
                                },
                                {
                                    label: "가능성을 키우는 역할",
                                    brands: [
                                        { name: "Myverse · MoNTZ · Townity · Scribble", role: "지금은 씨앗. 조건이 맞으면 역할이 커진다", note: "Universe 철학 위에서 실험 중. 검증되면 어떤 역할로도 성장 가능" },
                                    ],
                                },
                            ].map((group, gi) => (
                                <div key={gi}>
                                    <div className="flex items-center gap-3 mb-4 pb-2 border-b" style={{ borderColor: "var(--tn-border)" }}>
                                        <span className="text-[10px] font-mono tn-text-sub">{String(gi + 1).padStart(2, '0')}</span>
                                        <h3 className="text-sm font-semibold tracking-wide">{group.label}</h3>
                                    </div>
                                    <div className="grid gap-px sm:grid-cols-2" style={{ backgroundColor: "var(--tn-border)" }}>
                                        {group.brands.map((b, bi) => (
                                            <div key={bi} className="p-5" style={{ backgroundColor: "var(--tn-bg, var(--tn-surface))" }}>
                                                <span className="font-semibold tn-text text-[15px]">{b.name}</span>
                                                <p className="text-sm tn-text-sub leading-relaxed mt-1">{b.role}</p>
                                                <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--tn-text-muted)" }}>{b.note}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Synergy Flows */}
                    <section className="tn-bg-alt py-16 md:py-24 px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Synergy Flows</p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                역할들이 만나는 <span className="font-bold">시너지 흐름</span>
                            </h2>
                            <div className="space-y-8">
                                {[
                                    { nodes: ["MADLeague", "HeRo", "Badak", "SmarComm."], sep: ["→", "→", "→", "↻"], desc: "모은다 → 키운다 → 연결한다 → 실행한다 → 다시 멘토로 돌아온다" },
                                    { nodes: ["Mindle", "SmarComm.", "Brand Gravity", "RooK"], sep: ["→", "+", "+"], desc: "먼저 본다 → 전략을 세운다 → 브랜딩한다 → 실행한다" },
                                    { nodes: ["WIO", "YouInOne", "전 브랜드"], sep: ["+", "→"], desc: "IT 인프라 + 인간 인프라 → 어떤 사업도 같은 방식으로 움직인다" },
                                ].map((flow, fi) => (
                                    <div key={fi} className="p-6 border" style={{ borderColor: "var(--tn-border)" }}>
                                        <div className="flex items-center gap-2 flex-wrap mb-3">
                                            {flow.nodes.map((node, ni) => (
                                                <span key={ni} className="flex items-center gap-2">
                                                    <span className="text-sm font-medium px-3 py-1 border" style={{ borderColor: "var(--tn-border)" }}>{node}</span>
                                                    {ni < flow.sep.length && (
                                                        <span className="text-xs tn-text-sub">{flow.sep[ni]}</span>
                                                    )}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-xs tn-text-sub leading-relaxed">{flow.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Closing Principle */}
                            <div className="mt-16 text-center py-8 border-t" style={{ borderColor: "var(--tn-border)" }}>
                                <p className="text-lg font-bold mb-2">리더와 팔로어는 역할이지 직급이 아니다</p>
                                <p className="text-sm tn-text-sub leading-relaxed max-w-xl mx-auto">
                                    각 브랜드는 상황에 따라 엔진이 되기도 하고, 연료가 되기도 하고, 출구가 되기도 한다.
                                    중요한 것은 위치가 아니라 지금 어떤 역할을 하고 있느냐다.
                                </p>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* ===== History Tab ===== */}
            {activeTab === 'history' && (
                <section className="py-24 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">History</p>
                                <h2 className="text-xl md:text-3xl font-light">
                                    유니버스 <span className="font-bold">연대기</span>
                                </h2>
                            </div>
                        </div>

                        {/* Year filter */}
                        <div className="flex flex-wrap gap-2 mb-12">
                            {years.map(y => (
                                <button key={y} onClick={() => setYearFilter(y)}
                                    className="px-4 py-2 text-sm tracking-wide transition-colors"
                                    style={yearFilter === y
                                        ? { backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }
                                        : { backgroundColor: "var(--tn-surface)", color: "var(--tn-text-sub)" }
                                    }>
                                    {y}
                                </button>
                            ))}
                        </div>

                        {/* Timeline */}
                        <div className="space-y-0">
                            {filteredHistory.map((item, i) => (
                                <div key={i} className="flex gap-8 py-6 border-b tn-border group hover:tn-bg-alt transition-colors px-4 -mx-4">
                                    <div className="min-w-[5rem] text-sm tn-text-sub font-mono pt-0.5">
                                        {item.date}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold tn-text">{item.title}</h3>
                                            {item.link && (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer"
                                                    className="tn-text-muted hover:tn-text transition-colors">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-sm tn-text-sub mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="tn-card py-16 md:py-24 px-6" style={{ backgroundColor: "var(--tn-surface)", color: "var(--tn-text)" }}>
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-xl md:text-3xl font-light">
                        <span className="font-bold">너, 나의 동료가 되라.</span>
                    </h2>
                    <p className="mt-4 tn-text-sub">Ten:One™ Universe는 언제나 열려있습니다.</p>
                    <Link href="/contact" className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 text-sm tracking-wide transition-colors" style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                        Contact Us <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

function AboutPageInner() {
    return (
        <Suspense fallback={<div className="min-h-screen tn-surface" />}>
            <AboutContent />
        </Suspense>
    );
}

export default function AboutPage() {
  return (
    <Suspense>
      <AboutPageInner />
    </Suspense>
  );
}
