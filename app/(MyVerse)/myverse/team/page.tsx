"use client";

import Link from "next/link";
import {
    Orbit,
    ArrowRight,
    Users,
    Code2,
    Brain,
    Palette,
    Smartphone,
    Server,
    ExternalLink,
} from "lucide-react";

/* ── Hero ── */
function Hero() {
    return (
        <section className="relative overflow-hidden py-32 lg:py-40">
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-pink-500/8 blur-[120px]" />
            </div>
            <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
                <p className="text-indigo-400 font-medium text-sm mb-4">TEAM</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    함께 만드는 우주
                </h1>
                <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                    Myverse는 Ten:One™ Universe의 핵심 서비스입니다.
                    <br className="hidden sm:block" />
                    &ldquo;가치로 연결된 하나의 거대한 세계관&rdquo;을 함께 만들어갑니다.
                </p>
            </div>
        </section>
    );
}

/* ── Ten:One Universe ── */
function UniverseSection() {
    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-indigo-400 font-medium text-sm mb-3">TEN:ONE™ UNIVERSE</p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Plan. Connect. Expand.
                        </h2>
                        <p className="mt-4 text-neutral-400 leading-relaxed">
                            기획하고, 연결하고, 확장한다. Ten:One™은 인재 생태계 파이프라인의 HQ입니다.
                            멀티 유니버스를 여행하는 히치하이커를 위한 안내서.
                        </p>
                        <div className="mt-6 space-y-3">
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-sm text-white font-medium">Vision</p>
                                <p className="text-sm text-neutral-400">&ldquo;10,000명의 기획자를 발굴하고 연결한다. Who is the Next?&rdquo;</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-sm text-white font-medium">Core Value</p>
                                <p className="text-sm text-neutral-400">본질(Essence) · 속도(Speed) · 이행(Carry Out)</p>
                            </div>
                            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-sm text-white font-medium">Declaration</p>
                                <p className="text-sm text-neutral-400">&ldquo;빠르게 변하는 세상 속에서 우물쭈물 하지 않고 도전을 선언한다&rdquo;</p>
                            </div>
                        </div>
                        <a
                            href="https://tenone.biz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Ten:One™ Universe 방문 <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { name: "MADLeague", desc: "역량 경연 플랫폼" },
                            { name: "Badak", desc: "업계 네트워킹" },
                            { name: "YouInOne", desc: "프로젝트 그룹" },
                            { name: "HeRo", desc: "Talent Agency" },
                            { name: "RooK", desc: "콘텐츠 제작" },
                            { name: "Myverse", desc: "Personal Black Box" },
                        ].map((b) => (
                            <div key={b.name} className={`p-4 rounded-xl border ${
                                b.name === "Myverse"
                                    ? "bg-indigo-500/10 border-indigo-500/20"
                                    : "bg-white/[0.03] border-white/5"
                            }`}>
                                <p className={`font-semibold text-sm ${b.name === "Myverse" ? "text-indigo-400" : "text-white"}`}>{b.name}</p>
                                <p className="text-xs text-neutral-500 mt-1">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Hiring ── */
const positions = [
    {
        icon: Smartphone,
        title: "앱 개발자",
        tech: "React Native",
        description: "iOS/Android 크로스 플랫폼 앱 개발. 온보딩 플로우, 타임라인 UI, Quick Capture 등 핵심 UX 구현.",
    },
    {
        icon: Server,
        title: "백엔드 개발자",
        tech: "Kotlin / Spring Boot",
        description: "Universal Record 파이프라인, 파서 플러그인 시스템, 데이터 동기화 엔진 개발.",
    },
    {
        icon: Brain,
        title: "AI 엔지니어",
        tech: "Claude API / RAG",
        description: "개인 맥락 RAG 시스템, 벡터 검색, 패턴 분석, '나와의 대화' 엔진 개발.",
    },
    {
        icon: Palette,
        title: "프로덕트 디자이너",
        tech: "Figma / Design System",
        description: "'어둠에서 빛으로' 성장하는 디자인 시스템 설계. 감성적이면서 기능적인 UX.",
    },
];

function HiringSection() {
    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">WE&apos;RE HIRING</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        함께할 동료를 찾습니다
                    </h2>
                    <p className="mt-4 text-neutral-400 max-w-lg mx-auto">
                        &ldquo;혼자는 힘들다, 함께할 동료가 필요하다.&rdquo;
                    </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {positions.map((p) => (
                        <div key={p.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/20 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    <p.icon className="h-5 w-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">{p.title}</h3>
                                    <p className="text-xs text-indigo-400">{p.tech}</p>
                                </div>
                            </div>
                            <p className="text-sm text-neutral-400 leading-relaxed">{p.description}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-10">
                    <Link
                        href="/myverse/contact"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors"
                    >
                        합류 문의
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

/* ── Culture ── */
function CultureSection() {
    const principles = [
        "우리는 모두 기획자다",
        "어설픈 완벽주의는 일을 출발시키지 못한다",
        "약한 연결고리가 만드는 강력한 기회",
        "실전이 우리를 강하게 하리라",
        "실현되지 않으면 아이디어가 아니다",
        "일이 되게 하는 사람",
    ];

    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-indigo-400 font-medium text-sm mb-3">CULTURE</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">일하는 원칙</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                    {principles.map((p, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/5">
                            <span className="text-xs font-mono text-indigo-400 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                            <p className="text-sm text-neutral-300">{p}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function TeamPage() {
    return (
        <>
            <Hero />
            <UniverseSection />
            <CultureSection />
            <HiringSection />
        </>
    );
}
