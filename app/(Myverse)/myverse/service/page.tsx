"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Sun,
    Clock,
    Lock,
    User,
    Mic,
    Camera,
    FileText,
    ArrowRight,
    Bot,
    Sparkles,
    ChevronRight,
    Instagram,
    MessageSquare,
    Calendar,
    Heart,
    Activity,
    Smartphone,
} from "lucide-react";

/* ── Hero ── */
function Hero() {
    return (
        <section className="relative overflow-hidden py-32 lg:py-40">
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/8 blur-[120px]" />
            </div>
            <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
                <p className="text-indigo-400 font-medium text-sm mb-4">SERVICE</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    성장하는 나
                </h1>
                <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                    Myverse의 핵심 경험은 대시보드가 아닙니다. <strong className="text-white">성장</strong>입니다.
                    <br className="hidden sm:block" />
                    어두운 점에서 시작해, 나만의 우주를 키워갑니다.
                </p>
            </div>
        </section>
    );
}

/* ── Four Tabs ── */
const tabs = [
    {
        id: "today",
        name: "오늘",
        icon: Sun,
        description: "오늘 하루가 시간순으로 흐른다.",
        detail: "내가 남기는 기록(사진·메모·음성)이 시간순으로 흐른다. 자동 기록(수면·위치·결제)은 사용자 동의를 거쳐 점진 도입 예정이며, 도입된 항목은 자연스럽게 섞여 '오늘의 나'를 구성한다.",
        items: [
            "09:00 — 마케팅 주간회의 [캘린더 · 예정]",
            "09:00 — 회의 음성 48분 [녹음]",
            "12:15 — 돈까스 사진 [사진]",
            "14:00 — \"기획서 방향 다시 잡아야\" [메모]",
            "19:20 — 운동 기록 [수동]",
            "07:12 — 기상, 수면 7시간 12분 [헬스 연동 · 예정]",
            "12:15 — 봉피양 12,000원 [결제 연동 · 예정]",
        ],
    },
    {
        id: "time",
        name: "시간",
        icon: Clock,
        description: "내 디지털 인생의 타임라인.",
        detail: "월 단위로 기록량이 보인다. 새 서비스를 연동할 때마다 과거 구간이 채워진다. 자연어로 검색할 수 있다.",
        items: [
            "2026년 3월 — 847개 기록",
            "2026년 2월 — 1,204개 기록",
            "2025년 12월 — 1,342개 기록",
            "검색: \"부산 여행\", \"작년 크리스마스\"",
            "필터: 전체 | SNS | 대화 | 일정 | 금융 | 건강",
        ],
    },
    {
        id: "vault",
        name: "볼트",
        icon: Lock,
        description: "나를 데려오는 공간.",
        detail: "각 플랫폼에서 데이터를 내려받아 업로드하면 타임라인에 차곡차곡 쌓인다. Instagram·KakaoTalk·Google Calendar 임포터가 우선 제공되며, 나머지 플랫폼은 순차 추가된다.",
        items: [
            "Instagram — 파일 임포트",
            "KakaoTalk — 파일 임포트",
            "Google Calendar — OAuth 연동 · 베타",
            "Facebook — 임포트 예정",
            "Twitter · YouTube · Apple Health — 예정",
        ],
    },
    {
        id: "me",
        name: "나",
        icon: User,
        description: "이 화면이 Myverse의 영혼.",
        detail: "기록이 쌓일수록 AI가 더 정확한 답을 낸다. 나의 기록을 근거로 응답하는 RAG 코치는 단계적으로 도입되며, 일부는 베타 제공 중이다.",
        items: [
            "나의 기록 검색 — 제공",
            "AI 코치 (브리핑·리포트) — 베타",
            "패턴 분석 (소비·건강·관계) — 예정",
            "연도별 비교 — 예정",
        ],
    },
];

function TabsSection() {
    const [active, setActive] = useState("today");
    const current = tabs.find((t) => t.id === active)!;

    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-indigo-400 font-medium text-sm mb-3">APP STRUCTURE</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">4개의 탭, 나만의 우주</h2>
                </div>

                {/* Tab buttons */}
                <div className="flex justify-center gap-2 mb-10">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActive(t.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                                active === t.id
                                    ? "bg-indigo-500 text-white"
                                    : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <t.icon className="h-4 w-4" />
                            {t.name}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{current.name}</h3>
                        <p className="text-lg text-neutral-300 mb-4">{current.description}</p>
                        <p className="text-sm text-neutral-400 leading-relaxed">{current.detail}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="space-y-2">
                            {current.items.map((item, i) => (
                                <div key={i} className="flex items-start gap-2 py-1.5 text-sm text-neutral-400 border-b border-white/5 last:border-0">
                                    <ChevronRight className="h-3.5 w-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Quick Capture ── */
function CaptureSection() {
    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">QUICK CAPTURE</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">3초 안에 기록</h2>
                    <p className="mt-4 text-neutral-400 max-w-lg mx-auto">
                        기록하겠다는 의식 없이. 살면서 자연스럽게 남기는 것들.
                    </p>
                </div>
                <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    {[
                        { icon: Mic, title: "음성", desc: "회의, 생각, 메모를 녹음. AI가 텍스트로 변환하고 태그를 붙인다." },
                        { icon: Camera, title: "사진", desc: "밥 사진, 약 봉투, 합격증. AI가 인식하고 결제 데이터와 매칭한다." },
                        { icon: FileText, title: "메모", desc: "한 줄 메모. 감정 태그 선택(선택). 그게 전부다." },
                    ].map((c) => (
                        <div key={c.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                                <c.icon className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">{c.title}</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">{c.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Data Sources ── */
function SourcesSection() {
    const sources = [
        { icon: Instagram, name: "Instagram", type: "파일 업로드" },
        { icon: MessageSquare, name: "KakaoTalk", type: "파일 업로드" },
        { icon: Calendar, name: "Google Calendar", type: "OAuth 연동" },
        { icon: Smartphone, name: "Facebook", type: "파일 업로드" },
        { icon: Heart, name: "Apple Health", type: "시스템 연동" },
        { icon: Activity, name: "삼성 헬스", type: "시스템 연동" },
    ];

    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">DATA SOURCES</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">흩어진 나를 데려오기</h2>
                    <p className="mt-4 text-neutral-400 max-w-lg mx-auto">
                        각 플랫폼에서 데이터를 다운로드하거나 연동하면, Myverse가 하나로 모읍니다.
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
                    {sources.map((s) => (
                        <div key={s.name} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center hover:border-indigo-500/20 transition-colors">
                            <s.icon className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                            <p className="text-sm text-white font-medium">{s.name}</p>
                            <p className="text-xs text-neutral-500 mt-1">{s.type}</p>
                        </div>
                    ))}
                </div>
                <p className="text-center text-sm text-neutral-500 mt-6">
                    + Twitter/X, YouTube, 네이버 블로그, 금융 마이데이터, 의료 마이데이터...
                </p>
            </div>
        </section>
    );
}

/* ── Growth System ── */
function GrowthSection() {
    const stages = [
        { records: "0~100", state: "아주 어두운 화면. 점 하나.", feature: "기본 기록" },
        { records: "100~1,000", state: "어둠 속에 희미한 빛. 타임라인이 듬성듬성.", feature: "타임라인 검색 (500+)" },
        { records: "1,000~10,000", state: "형태가 잡힌다. 타임라인이 밀도를 가진다.", feature: "나와의 대화 (3,000+)" },
        { records: "10,000+", state: "밝아진 공간. \"나\"가 선명하다.", feature: "패턴 분석, 교차 인사이트" },
    ];

    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">GROWTH SYSTEM</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">어둠에서 빛으로</h2>
                    <p className="mt-4 text-neutral-400 max-w-lg mx-auto">
                        포인트도 레벨도 뱃지도 없다. 대신 체감되는 성장이 있다.
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                    {stages.map((s, i) => (
                        <div key={i} className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
                            <div className={`w-6 h-6 rounded-full mb-3 ${
                                i === 0 ? "bg-white/10" : i === 1 ? "bg-white/20" : i === 2 ? "bg-indigo-500/40" : "bg-indigo-500"
                            }`} />
                            <p className="text-xs text-indigo-400 font-mono mb-1">{s.records}개</p>
                            <p className="text-sm text-neutral-300 mb-2">{s.state}</p>
                            <p className="text-xs text-neutral-500">{s.feature}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Conversation Preview ── */
function ConversationSection() {
    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-indigo-400 font-medium text-sm mb-3">나와의 대화</p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                            나의 기록에게 물어봐
                        </h2>
                        <p className="text-neutral-400 leading-relaxed mb-6">
                            대화 인터페이스에서 응답자 이름은 &ldquo;나의 기록&rdquo;. AI에게 묻는 게 아니라 나에게 묻는 것이다.
                            톤도 다르다. &ldquo;~입니다&rdquo;가 아니라 &ldquo;~야&rdquo;, &ldquo;~거든&rdquo;, &ldquo;~이야&rdquo;.
                        </p>
                        <Link href="/myverse/contact" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-400 transition-colors">
                            Early Access 신청 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <div className="p-3 rounded-lg bg-white/5 text-sm text-neutral-300 max-w-[280px]">
                                나 요즘 건강 괜찮아?
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                                <Bot className="h-3 w-3 text-white" />
                            </div>
                            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-neutral-300 space-y-2">
                                <p>수면이 좀 줄었어. 이번 주 평균 6시간 12분인데, 지난달 평균은 7시간 4분이었거든.</p>
                                <p>3월에 찍어둔 약 봉투 보면 감기약이었는데, 그 이후로 운동 횟수도 주 3회에서 1회로 줄었어.</p>
                                <p className="text-neutral-500">날씨 풀리면 다시 올라갈 수도 있지만, 의식적으로 좀 챙겨도 좋겠어.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function ServicePage() {
    return (
        <>
            <Hero />
            <TabsSection />
            <CaptureSection />
            <SourcesSection />
            <GrowthSection />
            <ConversationSection />
        </>
    );
}
