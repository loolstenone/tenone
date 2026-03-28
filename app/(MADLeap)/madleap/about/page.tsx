"use client";

import Link from "next/link";
import {
    Target,
    Zap,
    TrendingUp,
    Users,
    Sparkles,
    Award,
    Rocket,
    ArrowRight,
    Quote,
    Globe,
    GraduationCap,
    Handshake,
    CheckCircle,
} from "lucide-react";

/* ── Data ── */

const timeline = [
    {
        year: "2023 하반기",
        gen: "1기",
        title: "MADLeap 창립",
        events: [
            "유인원(커뮤니티)에서 뜻이 맞는 대학생 12명이 모여 출발",
            "MAD League 서울 거점 동아리로 등록",
            "첫 스터디 그룹 3개 운영 (브랜딩, 콘텐츠, 데이터)",
            "1기 수료식 및 포트폴리오 발표회",
        ],
        members: 12,
    },
    {
        year: "2024 상반기",
        gen: "2기",
        title: "성장과 실전",
        events: [
            "2기 리퍼 24명 선발 (경쟁률 2.5:1)",
            "첫 경쟁PT 대회 개최 — 6팀 참가",
            "현업 멘토 네트워크 구축 시작 (5명)",
            "Badak 네트워크 합류, 타 동아리 교류 시작",
        ],
        members: 24,
    },
    {
        year: "2024 하반기",
        gen: "3기",
        title: "실전 프로젝트 도입",
        events: [
            "3기 리퍼 28명 선발",
            "스타벅스 코리아 캠페인 기획 프로젝트 (모의)",
            "DAM Party Vol.1 공동 주최 — 80명 참가",
            "AI 마케팅 스터디 신설",
            "제2회 경쟁PT 대회 — 최우수상 Team Spark",
        ],
        members: 28,
    },
    {
        year: "2025 상반기",
        gen: "4기",
        title: "도약의 해",
        events: [
            "4기 리퍼 32명 선발 (경쟁률 3.75:1, 120명 지원)",
            "지평주조 마케팅 전략 PT — Team HOPS 대상 수상",
            "한국관광공사 MZ 관광 콘텐츠 캠페인 수행",
            "DAM Party Vol.3 — 150명 규모, 8개 동아리 연합",
            "현업 멘토 12명으로 확대",
            "누적 멤버 200명 돌파",
        ],
        members: 32,
    },
    {
        year: "2026 상반기",
        gen: "5기",
        title: "5기 모집중",
        events: [
            "5기 리퍼 모집 진행중 (03.17 ~ 04.06)",
            "포트폴리오 플랫폼 런칭",
            "전국 확장 준비 — 부산/대전 거점 탐색",
        ],
        members: null,
        isCurrent: true,
    },
];

const madValues = [
    { icon: Target, letter: "M", title: "Marketing", desc: "전략적 사고와 데이터 기반 마케팅 역량을 키웁니다. 소비자 인사이트부터 GTM 전략까지." },
    { icon: Zap, letter: "A", title: "Advertising", desc: "크리에이티브한 광고 기획을 실행합니다. 카피라이팅, 비주얼, 미디어 플래닝을 실전으로." },
    { icon: TrendingUp, letter: "D", title: "Digital", desc: "디지털과 AI 시대를 선도하는 기획자가 됩니다. 퍼포먼스, AI 마케팅, 콘텐츠 자동화까지." },
];

const coreValues = [
    { icon: Rocket, title: "실전", desc: "교실 밖에서 배운다. 실제 브랜드와 프로젝트를 수행하고, 결과로 증명한다." },
    { icon: TrendingUp, title: "성장", desc: "매 기수가 끝나면 포트폴리오 하나가 완성된다. 개인도, 팀도 함께 성장한다." },
    { icon: Handshake, title: "연결", desc: "현업 멘토, 타 동아리, 파트너 기업. 대학 밖 세상과 연결되는 관계를 만든다." },
];

const orgStructure = [
    {
        role: "회장단",
        icon: Award,
        members: [
            { name: "김도윤", position: "5기 회장", school: "고려대 경영학" },
            { name: "이서연", position: "5기 부회장", school: "연세대 미디어커뮤니케이션" },
        ],
    },
    {
        role: "운영진",
        icon: Users,
        members: [
            { name: "박지호", position: "기획팀장", school: "성균관대 글로벌경영" },
            { name: "최은서", position: "콘텐츠팀장", school: "중앙대 광고홍보" },
            { name: "정민재", position: "대외협력팀장", school: "한양대 경영학" },
            { name: "한소율", position: "디자인팀장", school: "홍익대 시각디자인" },
        ],
    },
    {
        role: "멘토단",
        icon: Sparkles,
        members: [
            { name: "천재원", position: "총괄 멘토", school: "Ten:One 대표" },
            { name: "김현수", position: "마케팅 멘토", school: "前 카카오 마케터" },
            { name: "이수빈", position: "브랜딩 멘토", school: "前 제일기획 AE" },
            { name: "박준영", position: "데이터 멘토", school: "네이버 데이터분석가" },
        ],
    },
];

const partnerDetails = [
    { name: "MAD League", role: "본부 조직", desc: "전국 대학 광고·마케팅 동아리 연합. 매드립은 MAD League 서울 거점.", icon: Globe },
    { name: "Badak (바닥)", role: "네트워크 파트너", desc: "대학생·현업 커리어 네트워크. DAM Party 공동 주최.", icon: Handshake },
    { name: "Ten:One Universe", role: "인큐베이팅", desc: "매드립의 모 조직. IT 인프라, 멘토링, 운영 지원 제공.", icon: Rocket },
];

const alumniQuotes = [
    { name: "김태희", gen: "1기", school: "고려대", quote: "매드립에서 처음으로 '진짜 마케팅'이 뭔지 알게 됐어요. 졸업 후 취업 면접에서 매드립 포트폴리오가 결정적이었습니다.", now: "현 카카오 마케팅팀" },
    { name: "이준혁", gen: "2기", school: "연세대", quote: "경쟁PT에서 팀을 이끌며 기획력과 리더십을 동시에 키웠습니다. 단순 스펙이 아니라 진짜 경험이었어요.", now: "현 삼성전자 브랜드마케팅" },
    { name: "박서윤", gen: "3기", school: "이화여대", quote: "AI 마케팅 스터디에서 배운 것들이 지금 회사에서 바로 쓰이고 있어요. 가장 실전적인 동아리입니다.", now: "현 토스 그로스마케팅" },
];

export default function MadLeapAboutPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-[#1a1a2e] text-white py-20 md:py-28">
                <div className="mx-auto max-w-4xl px-6 text-center">
                    <p className="text-[#4361ee] text-sm font-semibold tracking-wider uppercase mb-4">About MADLeap</p>
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">
                        2023년, 유인원에서 시작해<br />
                        <span className="text-[#4361ee]">MAD League 서울 거점</span>이 되기까지
                    </h1>
                    <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                        Marketing · Advertising · Digital — Leap!<br />
                        미치지 않으면, 미치지 못한다.
                    </p>
                </div>
            </section>

            {/* MAD 의미 */}
            <section className="py-20 md:py-28">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">MAD의 의미</h2>
                    <p className="text-neutral-500 text-center text-sm mb-12">매드립을 구성하는 세 가지 축</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {madValues.map((v) => (
                            <div key={v.letter} className="text-center p-8 rounded-2xl border border-neutral-200 hover:border-[#4361ee]/30 hover:shadow-lg transition-all group">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#4361ee]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#4361ee]/20 transition-colors">
                                    <span className="text-2xl font-black text-[#4361ee]">{v.letter}</span>
                                </div>
                                <h3 className="font-bold text-lg mb-1">{v.title}</h3>
                                <p className="text-neutral-600 text-sm leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="bg-neutral-50 py-20 md:py-28">
                <div className="mx-auto max-w-3xl px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">우리의 이야기</h2>
                    <div className="space-y-6 text-neutral-700 leading-relaxed text-[15px]">
                        <p>
                            2023년 여름, &ldquo;유인원&rdquo;이라는 작은 커뮤니티에서 마케팅을 좋아하는 대학생 12명이 모였습니다.
                            교실 안의 이론만으로는 채울 수 없는 갈증을 느꼈고, 직접 현업의 선배님들을 찾아갔습니다.
                        </p>
                        <p>
                            선배님들은 우리의 손을 잡아 주었고, 함께 마케팅·광고 동아리계의 새로운 패러다임을 만들었습니다.
                            그것이 <strong>MADLeap</strong>의 시작입니다. MAD League의 서울 거점으로 등록하며 공식적인 첫 발을 내딛었습니다.
                        </p>
                        <p>
                            디지털과 인공지능이 모든 경계를 허물었고, 기업은 신입이 아닌 경력을 원합니다.
                            그래서 매드립은 한 번 더 도약을 했습니다 — <strong>누구보다 AI를 잘 활용하고, 실전 프로젝트로 증명하는 조직</strong>이 되기로.
                        </p>
                        <p>
                            1기 12명으로 시작한 매드립은 현재 <strong>누적 200명 이상의 멤버</strong>가 거쳐간 수도권 최대 규모의
                            마케팅 연합동아리로 성장했습니다. 지평주조, 한국관광공사 등 실제 브랜드와의 프로젝트,
                            역대 15건 이상의 수상, 그리고 카카오·삼성·토스 등에 합류한 졸업생들이 매드립의 이야기를 증명합니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 md:py-28">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">핵심 가치</h2>
                    <p className="text-neutral-500 text-center text-sm mb-12">매드립이 지키는 세 가지</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {coreValues.map((v) => (
                            <div key={v.title} className="bg-[#1a1a2e] text-white rounded-2xl p-8 hover:scale-[1.02] transition-transform">
                                <v.icon className="h-8 w-8 text-[#4361ee] mb-4" />
                                <h3 className="text-xl font-bold mb-3">{v.title}</h3>
                                <p className="text-neutral-400 text-sm leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="bg-neutral-50 py-20 md:py-28">
                <div className="mx-auto max-w-4xl px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">역대 기수</h2>
                    <p className="text-neutral-500 text-center text-sm mb-12">1기(2023 하반기) ~ 5기(2026 상반기, 모집중)</p>

                    <div className="space-y-0">
                        {timeline.map((t, idx) => (
                            <div key={t.gen} className="relative flex gap-6 md:gap-8">
                                {/* Timeline line */}
                                <div className="flex flex-col items-center shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                        t.isCurrent
                                            ? "bg-[#4361ee] text-white ring-4 ring-[#4361ee]/20"
                                            : "bg-[#1a1a2e] text-white"
                                    }`}>
                                        {t.gen}
                                    </div>
                                    {idx < timeline.length - 1 && (
                                        <div className="w-0.5 h-full bg-neutral-200 min-h-[40px]" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`pb-10 flex-1 ${t.isCurrent ? "" : ""}`}>
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <h3 className="font-bold text-lg">{t.title}</h3>
                                        <span className="text-sm text-neutral-400">{t.year}</span>
                                        {t.members && (
                                            <span className="text-xs px-2 py-0.5 bg-[#4361ee]/10 text-[#4361ee] rounded-full">{t.members}명</span>
                                        )}
                                        {t.isCurrent && (
                                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                모집중
                                            </span>
                                        )}
                                    </div>
                                    <ul className="space-y-1.5">
                                        {t.events.map((e, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                                                <CheckCircle className="h-4 w-4 text-[#4361ee]/60 shrink-0 mt-0.5" />
                                                {e}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Organization */}
            <section className="bg-[#1a1a2e] text-white py-20 md:py-28">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">조직 구성</h2>
                    <p className="text-neutral-400 text-center text-sm mb-12">5기 기준 운영진 + 멘토단 + 리퍼</p>

                    <div className="space-y-10">
                        {orgStructure.map((group) => (
                            <div key={group.role}>
                                <div className="flex items-center gap-3 mb-4">
                                    <group.icon className="h-5 w-5 text-[#4361ee]" />
                                    <h3 className="text-lg font-bold">{group.role}</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                    {group.members.map((m) => (
                                        <div key={m.name} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                                            <div className="w-10 h-10 bg-[#4361ee]/20 rounded-full flex items-center justify-center text-sm font-bold text-[#4361ee] mb-3">
                                                {m.name[0]}
                                            </div>
                                            <h4 className="font-semibold text-sm">{m.name}</h4>
                                            <p className="text-xs text-[#4361ee] mt-0.5">{m.position}</p>
                                            <p className="text-xs text-neutral-500 mt-0.5">{m.school}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Leapers */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <GraduationCap className="h-5 w-5 text-[#4361ee]" />
                                <h3 className="text-lg font-bold">리퍼 (Leaper)</h3>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                                <p className="text-3xl font-black text-[#4361ee] mb-2">5기 모집중</p>
                                <p className="text-neutral-400 text-sm">매 기수 25~35명의 리퍼가 함께 활동합니다</p>
                                <Link
                                    href="/madleap/apply"
                                    className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 bg-[#4361ee] text-white text-sm font-medium rounded-lg hover:bg-[#3451de] transition-colors"
                                >
                                    5기 지원하기 <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Alumni Quotes */}
            <section className="py-20 md:py-28">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">졸업생이 말하는 매드립</h2>
                    <p className="text-neutral-500 text-center text-sm mb-12">매드립을 거쳐간 선배들의 이야기</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {alumniQuotes.map((q) => (
                            <div key={q.name} className="bg-neutral-50 rounded-2xl p-6 relative">
                                <Quote className="h-8 w-8 text-[#4361ee]/20 absolute top-4 right-4" />
                                <p className="text-sm text-neutral-600 leading-relaxed mb-6 relative z-10">
                                    &ldquo;{q.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#1a1a2e] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {q.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{q.name} <span className="text-neutral-400 font-normal">{q.gen}</span></p>
                                        <p className="text-xs text-[#4361ee]">{q.now}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="bg-neutral-50 py-20">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">파트너 & 네트워크</h2>
                    <p className="text-neutral-500 text-center text-sm mb-12">매드립과 함께하는 조직들</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {partnerDetails.map((p) => (
                            <div key={p.name} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-md transition-shadow">
                                <p.icon className="h-8 w-8 text-[#4361ee] mb-3" />
                                <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                                <p className="text-xs text-[#4361ee] font-medium mb-2">{p.role}</p>
                                <p className="text-sm text-neutral-600">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-[#4361ee] py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        다음 이야기의 주인공은 당신입니다
                    </h2>
                    <p className="text-white/80 mb-8">
                        5기 리퍼로 함께 도약하세요
                    </p>
                    <Link
                        href="/madleap/apply"
                        className="inline-block px-8 py-3.5 bg-white text-[#4361ee] font-bold hover:bg-neutral-100 transition-colors rounded-lg"
                    >
                        5기 지원하기
                    </Link>
                </div>
            </section>
        </>
    );
}
