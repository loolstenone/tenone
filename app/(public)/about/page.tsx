"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

// ===== History Data =====
const HISTORY_DATA = [
    { year: "2025", date: "2025.08", title: "LUKI", desc: "인공지능 4인조 여성 아이돌 데뷔", link: "https://youtube.com/@LUKI-AIdol" },
    { year: "2025", date: "2025.08", title: "RooK", desc: "인공지능 크리에이터 플랫폼 런칭", link: "http://RooK.co.kr" },
    { year: "2025", date: "2025.04", title: "MADzine", desc: "마케팅/광고 매거진 창간" },
    { year: "2025", date: "2025.03", title: "DAM Be", desc: "MAD League 캐릭터 개발" },
    { year: "2025", date: "2025.01", title: "제주 수작 합류", desc: "전국 5개 권역 네트워크 완성" },
    { year: "2024", date: "2024.11", title: "광주전남 ABC 합류", desc: "매드리그 네트워크 확장" },
    { year: "2024", date: "2024.09", title: "MAD League X 지평주조", desc: "경쟁 PT 프로젝트" },
    { year: "2024", date: "2024.05", title: "ChangeUp", desc: "인공지능 시대 인재 양성 프로그램", link: "http://ChangeUp.company" },
    { year: "2024", date: "2024.02", title: "대구경북 ADlle 합류", desc: "매드리그 네트워크 확장" },
    { year: "2024", date: "2024.01", title: "0gamja", desc: "하찮고 귀여운 감자들의 공감 캐릭터", link: "http://0gamja.com" },
    { year: "2023", date: "2023.12", title: "부산경남 PAM 합류", desc: "30년 전통 광고 동아리" },
    { year: "2023", date: "2023.11", title: "Creazy Challenge", desc: "글로벌 광고제 도전 프로그램" },
    { year: "2023", date: "2023.09", title: "FWN", desc: "패션 위크 네트워크", link: "http://FWN.co.kr" },
    { year: "2023", date: "2023.05", title: "YouInOne", desc: "프로젝트 그룹 · 소규모 기업 연합", link: "http://YouInOne.com" },
    { year: "2023", date: "2023.02", title: "Chat with ChatGPT", desc: "인간이 묻고 AI가 답하는 책 출간" },
    { year: "2023", date: "2023.01", title: "유인원 인수 & DAM Party", desc: "대학생 스타트업 인수, 네트워킹 파티 시작" },
    { year: "2022", date: "2022.07", title: "MAD League", desc: "마케팅&광고 대학생 프로젝트 연합", link: "http://MADLeague.net" },
    { year: "2021", date: "2021.11", title: "MAD Leap", desc: "대학생 마케팅/광고 연합동아리 창단" },
    { year: "2021", date: "2021.02", title: "Badak.biz", desc: "마케팅/광고 업계 네트워킹 커뮤니티", link: "http://badak.biz" },
    { year: "2020", date: "2020.03", title: "Ten:One™ Universe", desc: "세계관의 시작" },
];

const years = ['전체', ...Array.from(new Set(HISTORY_DATA.map(h => h.year))).sort((a, b) => b.localeCompare(a))];

// ===== Flywheel Data =====
const flywheel = [
    { num: "01", title: "신뢰 기반 네트워크", desc: "마케팅/광고 업계 현업자들의 자발적 참여" },
    { num: "02", title: "인재 발굴", desc: "대학생부터 현업 전문가까지 기획자를 발굴" },
    { num: "03", title: "프로젝트 실행", desc: "실전 프로젝트로 문제를 해결하고 경험을 축적" },
    { num: "04", title: "성공 경험 공유", desc: "성과를 공유하여 네트워크 전체가 성장" },
    { num: "05", title: "기회 발견", desc: "신뢰 기반에서 새로운 비즈니스 기회 창출" },
    { num: "06", title: "지속 성장", desc: "순환 구조로 네트워크가 확장되고 강화" },
];

export default function AboutPage() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState('philosophy');
    const [yearFilter, setYearFilter] = useState('전체');

    useEffect(() => {
        if (tabParam && ['philosophy', 'universe', 'history'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const filteredHistory = yearFilter === '전체' ? HISTORY_DATA : HISTORY_DATA.filter(h => h.year === yearFilter);

    const tabs = [
        { id: 'philosophy', label: 'Philosophy' },
        { id: 'universe', label: 'Universe' },
        { id: 'history', label: 'History' },
    ];

    return (
        <div className="bg-white text-neutral-900">
            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
                        About
                    </p>
                    <h1 className="text-4xl md:text-6xl font-light leading-tight">
                        가치로 연결된<br />
                        <span className="font-bold">세계관을 만드는 사람들</span>
                    </h1>
                    <p className="mt-6 text-lg text-neutral-500 max-w-2xl">
                        Ten:One™은 인재를 발굴하고, 연결하고, 기업과 사회의 문제를 해결합니다.
                    </p>
                </div>
            </section>

            {/* Tab Navigation */}
            <section className="border-b border-neutral-200 sticky top-16 bg-white z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-0">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-4 text-sm tracking-wide transition-colors border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-neutral-900 text-neutral-900 font-medium'
                                        : 'border-transparent text-neutral-400 hover:text-neutral-700'
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
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            <div>
                                <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">Origin</p>
                                <h2 className="text-3xl font-light leading-relaxed">
                                    우연히 시계를 봤을 때<br />
                                    <span className="font-bold">10시 01분</span>일 확률은<br />
                                    얼마나 될까?
                                </h2>
                                <p className="mt-8 text-neutral-500 leading-relaxed">
                                    PC통신 시절부터 사용하던 ID &apos;lools&apos;, 생일이자 Ten:One의 기원인 10월 1일.
                                    반복되는 우연은 그저 우연이 아니라, 마치 계획된 우연처럼 지금의 나를 만들었습니다.
                                </p>
                                <p className="mt-4 text-neutral-500 leading-relaxed">
                                    머릿속에 끊임없이 떠오르던 수많은 생각과 구상들.
                                    과거의 아이디어와 계획들을 세상에 꺼내 놓기로 결심하며
                                    Ten:One™ Universe가 시작되었습니다.
                                </p>
                            </div>
                            <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center">
                                <p className="text-sm text-neutral-400 text-center px-8">
                                    [창업 스토리 비주얼]<br />
                                    <span className="text-xs text-neutral-300">대표의 스토리를 담은 사진 또는 일러스트</span>
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Mission / Vision */}
                    <section className="bg-neutral-900 text-white py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid md:grid-cols-2 gap-16">
                                <div>
                                    <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-4">Mission</p>
                                    <h2 className="text-3xl font-bold leading-relaxed">
                                        기획하고, 연결하고, 확장한다.
                                    </h2>
                                    <p className="text-sm text-neutral-500 mt-2">Plan. Connect. Expand.</p>
                                    <p className="mt-8 text-neutral-400 leading-relaxed">
                                        약한 연결 고리가 만드는 강력한 기회.
                                        다른 영역에서 다르게 일하는 사람들을 만나고,
                                        본질을 지키며 빠르게 움직이고 실행에 옮깁니다.
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-4">Vision</p>
                                    <h2 className="text-3xl font-bold leading-relaxed">
                                        10,000명의 기획자를<br />발굴하고 연결한다.
                                    </h2>
                                    <p className="text-sm text-neutral-500 mt-2">Who is the Next?</p>
                                    <p className="mt-8 text-neutral-400 leading-relaxed">
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
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">Core Value</p>
                            <h2 className="text-3xl font-light mb-16">
                                변하지 않을 가치에 집중하여 <span className="font-bold">빠르게 가치를 창출한다</span>
                            </h2>
                            <div className="grid md:grid-cols-3 gap-12">
                                {[
                                    { num: "01", symbol: "◆", title: "본질", en: "Essence", desc: "변하지 않을 가치에 집요하게 집중한다. 트렌드에 흔들리지 않는 근본적인 가치를 찾는다." },
                                    { num: "02", symbol: "→", title: "속도", en: "Speed", desc: "옳은 방향을 계속 확인하며 빠르게 전진한다. 완벽을 기다리지 않고 움직인다." },
                                    { num: "03", symbol: "■", title: "이행", en: "Carry Out", desc: "본질이 확인된다면 바로 실행에 옮긴다. 실현되지 않으면 아이디어가 아니다." },
                                ].map((val) => (
                                    <div key={val.num} className="border-t border-neutral-200 pt-8">
                                        <span className="text-sm text-neutral-300 font-mono">{val.num}</span>
                                        <h3 className="text-2xl font-bold mt-3">
                                            <span className="text-neutral-300 mr-2">{val.symbol}</span>{val.title}
                                        </h3>
                                        <p className="text-sm text-neutral-400 mt-1">{val.en}</p>
                                        <p className="text-sm text-neutral-500 mt-4 leading-relaxed">{val.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Founder */}
                    <section className="bg-neutral-50 py-24 px-6">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="aspect-square bg-neutral-200 flex items-center justify-center max-w-md">
                                <p className="text-sm text-neutral-400 text-center px-8">
                                    [대표 프로필 사진]
                                </p>
                            </div>
                            <div>
                                <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">Founder</p>
                                <h2 className="text-3xl font-bold">전천일</h2>
                                <p className="text-sm text-neutral-400 mt-1">Cheonil Jeon · Value Connector</p>
                                <p className="mt-6 text-neutral-500 leading-relaxed">
                                    광고, 마케팅, 커뮤니케이션, 기획 분야에서 일해왔습니다.
                                    트렌드, 브랜딩, IT에 관심을 가지고 가치를 연결하는 일을 하고 있습니다.
                                </p>
                                <div className="mt-6 space-y-2 text-sm text-neutral-500">
                                    <p><a href="mailto:lools@tenone.biz" className="hover:text-neutral-900 transition-colors">lools@tenone.biz</a></p>
                                    <p><a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">Kakao Open Chat</a></p>
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
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">Universe</p>
                            <h2 className="text-3xl md:text-4xl font-light leading-relaxed max-w-3xl">
                                각 유니버스는 고유한 <span className="font-bold">본질(Essence)</span>을 가지고 있으며,
                                하나의 거대한 선순환 생태계로 연결되어 있습니다.
                            </h2>
                        </div>
                    </section>

                    {/* Flywheel */}
                    <section className="bg-neutral-900 text-white py-24 px-6">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-500 mb-4">Ten:One™ Flywheel</p>
                            <h2 className="text-3xl font-light mb-16">
                                실행은 연결을 가속하고, <span className="font-bold">연결은 더 많은 기회를 만든다.</span>
                            </h2>
                            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-px bg-neutral-800">
                                {flywheel.map((step) => (
                                    <div key={step.num} className="bg-neutral-900 p-6">
                                        <span className="text-sm text-neutral-600 font-mono">{step.num}</span>
                                        <h3 className="text-sm font-bold mt-3">{step.title}</h3>
                                        <p className="text-xs text-neutral-500 mt-2 leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-center text-neutral-600 mt-8 text-sm">↻ 이 순환은 계속됩니다</p>
                        </div>
                    </section>

                    {/* Vision House */}
                    <section className="py-24 px-6">
                        <div className="max-w-3xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4 text-center">Vision House</p>
                            <div className="space-y-px">
                                {[
                                    { label: "Declaration", text: "빠르게 변하는 세상 속에서 우물쭈물 하지 않고 도전을 선언한다.", bg: "bg-neutral-900 text-white" },
                                    { label: "Philosophy", text: "변하지 않을 가치에 집중하여 빠르게 가치를 창출한다", bg: "bg-neutral-100 text-neutral-900" },
                                    { label: "Mission", text: "기획하고, 연결하고, 확장한다. Plan. Connect. Expand.", bg: "bg-neutral-50 text-neutral-900" },
                                    { label: "Vision", text: "10,000명의 기획자를 발굴하고 연결한다. Who is the Next?", bg: "bg-neutral-50 text-neutral-900" },
                                    { label: "Strategy", text: "약한 연결 고리로 빠르게 조직하고 일이 되게 한다.", bg: "bg-neutral-100 text-neutral-900" },
                                ].map((item) => (
                                    <div key={item.label} className={`${item.bg} p-8`}>
                                        <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 mb-2">{item.label}</p>
                                        <p className="text-lg font-medium">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Principle 10 */}
                    <section className="bg-neutral-50 py-24 px-6">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">Principle 10</p>
                            <h2 className="text-3xl font-light mb-16">
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
                                    <div key={i} className="flex items-start gap-6 py-4 border-b border-neutral-200 last:border-0">
                                        <span className="text-2xl font-bold text-neutral-200 min-w-[2.5rem] text-right font-mono">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <p className="text-neutral-700 leading-relaxed">{principle}</p>
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
                                <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">History</p>
                                <h2 className="text-3xl font-light">
                                    유니버스 <span className="font-bold">연대기</span>
                                </h2>
                            </div>
                        </div>

                        {/* Year filter */}
                        <div className="flex flex-wrap gap-2 mb-12">
                            {years.map(y => (
                                <button key={y} onClick={() => setYearFilter(y)}
                                    className={`px-4 py-2 text-sm tracking-wide transition-colors ${
                                        yearFilter === y
                                            ? 'bg-neutral-900 text-white'
                                            : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                                    }`}>
                                    {y}
                                </button>
                            ))}
                        </div>

                        {/* Timeline */}
                        <div className="space-y-0">
                            {filteredHistory.map((item, i) => (
                                <div key={i} className="flex gap-8 py-6 border-b border-neutral-100 group hover:bg-neutral-50 transition-colors px-4 -mx-4">
                                    <div className="min-w-[5rem] text-sm text-neutral-400 font-mono pt-0.5">
                                        {item.date}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-neutral-900">{item.title}</h3>
                                            {item.link && (
                                                <a href={item.link} target="_blank" rel="noopener noreferrer"
                                                    className="text-neutral-300 hover:text-neutral-900 transition-colors">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-sm text-neutral-500 mt-1">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="bg-neutral-900 text-white py-24 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl font-light">
                        <span className="font-bold">너, 나의 동료가 되라.</span>
                    </h2>
                    <p className="mt-4 text-neutral-500">Ten:One™ Universe는 언제나 열려있습니다.</p>
                    <Link href="/contact" className="inline-flex items-center gap-2 mt-8 px-8 py-3.5 bg-white text-neutral-900 text-sm tracking-wide hover:bg-neutral-100 transition-colors">
                        Contact Us <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
