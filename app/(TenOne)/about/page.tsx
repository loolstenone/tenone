"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { historyEvents } from "@/lib/data";
import { UNIVERSE_ROLE_GROUPS } from "@/lib/universe-map";
import { useOpenLinkFilter, useBrandStatus } from "@/lib/use-open-sites";

// ===== History Data (SSOT: lib/data.ts historyEvents, date 내림차순) =====
const HISTORY_DATA = [...historyEvents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(h => ({
        year: h.year,
        date: h.date.substring(0, 7).replace('-', '.'),
        title: h.title,
        desc: h.description,
        link: h.link,
        postId: h.postId,
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
    const isOpenLink = useOpenLinkFilter();
    const brandStatus = useBrandStatus();
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState('philosophy');
    const [yearFilter, setYearFilter] = useState('전체');
    const tabsAnchorRef = useRef<HTMLDivElement>(null);

    // 탭 전환 시 새 탭 내용을 처음부터 보이게 — 탭 바 아래로 내려가 있었다면 탭 바 위치로 (헤더 64px)
    const selectTab = (id: string) => {
        setActiveTab(id);
        router.replace(id === 'philosophy' ? '/about' : `/about?tab=${id}`, { scroll: false });
        const anchor = tabsAnchorRef.current;
        if (!anchor) return;
        const top = anchor.getBoundingClientRect().top + window.scrollY - 64;
        if (window.scrollY > top) window.scrollTo({ top });
    };

    useEffect(() => {
        // URL ↔ 탭 동기화 — 상단 About 메뉴(/about)로 재진입 시 첫 탭으로
        setActiveTab(tabParam && ['philosophy', 'universe', 'brands', 'history'].includes(tabParam) ? tabParam : 'philosophy');
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
            <div ref={tabsAnchorRef} />
            <section className="border-b tn-border sticky top-16 tn-surface z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-0 overflow-x-auto">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => selectTab(tab.id)}
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
                                    PC통신 시절부터 쓰던 ID &apos;lools&apos;, 전화번호 끝자리 1001, 무언가 특별한 일을 하고 싶었던 10월 1일, 시계를 볼 때마다 자주 마주친 10시 01분.
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
                        <div className="max-w-7xl mx-auto">
                            <div className="max-w-2xl">
                                <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Founder</p>
                                <h2 className="text-xl md:text-3xl font-bold">전천일</h2>
                                <p className="text-sm tn-text-sub mt-1">Cheonil Jeon · Value Connector</p>
                                <p className="mt-6 tn-text-sub leading-relaxed">
                                    광고, 마케팅, 커뮤니케이션, 기획 분야에서 일해왔습니다.
                                    트렌드, 브랜딩, IT에 관심을 가지고 가치를 연결하는 일을 하고 있습니다.
                                </p>
                                <div className="mt-6 space-y-2 text-sm tn-text-sub">
                                    <p><a href="mailto:lools@tenone.biz" className="hover:tn-text transition-colors">lools@tenone.biz</a></p>
                                    <p><a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="hover:tn-text transition-colors">Kakao Open Chat</a></p>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* ===== Universe Tab - 세계관 철학 (브랜드 목록은 Brands 탭) ===== */}
            {activeTab === 'universe' && (
                <>
                    <section className="py-24 px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Universe</p>
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-light leading-relaxed">
                                나의 작은 세계가 연결되어<br />
                                <span className="font-bold">하나의 거대한 세계관</span>을 만든다
                            </h2>
                            <p className="mt-8 tn-text-sub leading-relaxed">
                                Ten:One™ Universe는 브랜드를 모아 둔 목록이 아니라 하나의 세계관입니다.
                                각자 독립적으로 움직이는 작은 세계들이 같은 철학과 같은 언어 위에서 연결될 때,
                                혼자서는 만들 수 없는 기회가 생긴다고 믿습니다.
                            </p>
                            <p className="mt-4 tn-text-sub leading-relaxed">
                                각 세계는 고유한 본질(Essence)을 지키면서 서로를 위해 역할을 나눕니다.
                                그 연결이 쌓여 하나의 선순환이 됩니다.
                            </p>
                        </div>
                    </section>

                    {/* Three Resources */}
                    <section className="tn-bg-alt py-16 md:py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Three Resources</p>
                            <h2 className="text-xl md:text-3xl font-light mb-10 md:mb-16">
                                모든 일은 <span className="font-bold">사람 · 돈 · 시간</span>으로 움직인다
                            </h2>
                            <div className="grid md:grid-cols-3 gap-6 md:gap-12">
                                {[
                                    { title: "사람", en: "People", desc: "누가 함께하는가. 모든 연결은 사람에서 시작합니다." },
                                    { title: "돈", en: "Value", desc: "어떤 가치를 만드는가. 가치가 있어야 오래 갑니다." },
                                    { title: "시간", en: "Time", desc: "언제까지 무엇을 이루는가. 실행은 시간 위에서만 일어납니다." },
                                ].map((r) => (
                                    <div key={r.title} className="border-t tn-border pt-8">
                                        <h3 className="text-2xl font-bold">{r.title}</h3>
                                        <p className="text-sm tn-text-sub mt-1">{r.en}</p>
                                        <p className="text-sm tn-text-sub mt-4 leading-relaxed">{r.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Flywheel */}
                    <section className="tn-card py-16 md:py-24 px-6" style={{ backgroundColor: "var(--tn-surface)", color: "var(--tn-text)" }}>
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] tn-text-sub mb-4">Ten:One™ Flywheel</p>
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

                    {/* Closing Principle */}
                    <section className="tn-bg-alt py-16 px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <p className="text-lg font-bold mb-2">리더와 팔로어는 역할이지 직급이 아니다</p>
                            <p className="text-sm tn-text-sub leading-relaxed max-w-xl mx-auto">
                                세계관 속 각자는 상황에 따라 엔진이 되기도 하고, 연료가 되기도 하고, 출구가 되기도 합니다.
                                중요한 것은 위치가 아니라 지금 어떤 역할을 하고 있느냐입니다.
                            </p>
                        </div>
                    </section>
                </>
            )}

            {/* ===== Brands Tab - 세계관 안에서 만들고 싶은 브랜드 (SSOT: lib/universe-map.ts, 상태 = DB ums_sites) ===== */}
            {activeTab === 'brands' && (
                <>
                    <section className="py-24 px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Brands</p>
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-light leading-relaxed">
                                세계관 안에서<br />
                                <span className="font-bold">하나씩 만들어 가는 브랜드</span>
                            </h2>
                            <p className="mt-8 tn-text-sub leading-relaxed">
                                각 브랜드는 세계관 속에서 맡은 역할이 있습니다.
                                이미 열린 곳도, 만들고 있는 곳도, 아직 구상 중인 곳도 있습니다. 하나씩 세상에 꺼내 놓겠습니다.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-xs tn-text-sub">
                                <span><span className="font-semibold tn-text">운영 중</span> 지금 이용할 수 있어요</span>
                                <span><span className="font-semibold tn-text">만드는 중</span> 곧 열려요</span>
                                <span><span className="font-semibold tn-text">구상</span> 세계관 속에서 준비하고 있어요</span>
                            </div>
                        </div>
                    </section>

                    <section className="px-6 pb-16 md:pb-24">
                        <div className="max-w-5xl mx-auto space-y-14">
                            {UNIVERSE_ROLE_GROUPS.map((group) => (
                                <div key={group.num}>
                                    <div className="flex items-baseline gap-3 pb-3 border-b tn-border">
                                        <span className="text-[11px] font-mono tn-text-muted">{group.num}</span>
                                        <h3 className="text-base md:text-lg font-semibold">{group.role} 역할</h3>
                                    </div>
                                    <p className="text-sm tn-text-sub leading-relaxed mt-3 mb-5 max-w-2xl">{group.story}</p>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {group.brands.map((brand) => {
                                            const status = brandStatus(brand.href);
                                            const href = status === 'open' && brand.href && isOpenLink(brand.href) ? brand.href : null;
                                            const inner = (
                                                <div className="h-full p-5 flex flex-col border tn-border" style={{ backgroundColor: "var(--tn-surface)" }}>
                                                    <p className="text-[15px] font-semibold tn-text leading-tight">{brand.name}</p>
                                                    {brand.kr && <p className="text-[11px] tn-text-muted mt-0.5">{brand.kr}</p>}
                                                    <p className="text-sm tn-text-sub mt-2 leading-snug flex-1">{brand.desc}</p>
                                                    <p className="text-xs mt-4 tn-text-sub">
                                                        {status === 'open' && <span className="font-semibold tn-text">운영 중{href && " →"}</span>}
                                                        {status === 'building' && "만드는 중"}
                                                        {status === 'idea' && <span className="tn-text-muted">구상</span>}
                                                    </p>
                                                </div>
                                            );
                                            return href ? (
                                                <Link key={brand.name} href={href} className="hover:opacity-80 transition-opacity">{inner}</Link>
                                            ) : (
                                                <div key={brand.name}>{inner}</div>
                                            );
                                        })}
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
                                    실행해 온 <span className="font-bold">이야기</span>
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
                                            {/* 제목 = 이 사건을 기록한 Works 글 (lib/data.ts historyEvents.postId) */}
                                            {item.postId
                                                ? <Link href={`/works?postId=${item.postId}`} className="font-bold tn-text hover:underline underline-offset-4">{item.title}</Link>
                                                : <h3 className="font-bold tn-text">{item.title}</h3>}
                                            {item.link && isOpenLink(item.link) && (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={`${item.title} 사이트`}
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
