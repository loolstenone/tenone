"use client";

import Link from "next/link";
import {
    Orbit,
    Database,
    Sparkles,
    Brain,
    User,
    Globe,
    ArrowRight,
    Shield,
    ChevronRight,
} from "lucide-react";

/* ── Hero ── */
function Hero() {
    return (
        <section className="relative overflow-hidden py-32 lg:py-40">
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/8 blur-[120px]" />
            </div>
            <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
                <p className="text-indigo-400 font-medium text-sm mb-4">PHILOSOPHY</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    어둠 속의 점 하나
                </h1>
                <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                    처음에는 아무것도 없다. 어두운 공간에 작은 점 하나. 그게 나다.
                    <br className="hidden sm:block" />
                    디지털 세상에서의 나. 아직 형태도 없고, 빛도 없고, 기억도 없다.
                </p>
            </div>
        </section>
    );
}

/* ── Scattered Story ── */
function ScatteredSection() {
    return (
        <section className="py-20 lg:py-28 bg-white/[0.02]">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
                <div className="prose prose-invert prose-neutral max-w-none">
                    <p className="text-lg text-neutral-300 leading-relaxed">
                        지난 20년간 나는 수십 개의 서비스에 내 조각들을 흩뿌려왔다.
                    </p>
                    <div className="my-8 grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {["싸이월드에 10대를", "페이스북에 20대를", "인스타그램에 30대를", "카카오톡에 대화를", "구글에 위치를", "토스에 소비를"].map((t) => (
                            <div key={t} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-neutral-400">{t}</div>
                        ))}
                    </div>
                    <p className="text-lg text-neutral-300 leading-relaxed">
                        그리고 서비스가 사라질 때마다 그 안의 &ldquo;나&rdquo;도 함께 사라졌다.
                    </p>
                    <p className="text-lg text-neutral-300 leading-relaxed mt-4">
                        그 조각들을 하나씩 찾아와서 이 어두운 공간에 갖다 놓으면 — 점이 조금씩 커진다. 빛이 생긴다. 형태가 잡힌다.
                    </p>
                    <p className="mt-6 text-xl font-semibold text-white">
                        Myverse는 디지털 속 나를 키우는 것이다.
                    </p>
                </div>
            </div>
        </section>
    );
}

/* ── Five Transitions ── */
const transitions = [
    {
        num: "1",
        title: "나를 모은다",
        desc: "흩어진 조각을 한 곳에 데려온다. 잊혀져가는 기록을 구출한다. 사라질 위기의 데이터를 안전하게 보관한다.",
        value: "\"여기에 내가 있었구나.\"",
        icon: Database,
    },
    {
        num: "2",
        title: "나를 쌓는다",
        desc: "과거를 구출한 다음, 현재를 쌓는다. 밥 사진, 메모, 합격증, 약 봉투, 음성. 특별한 노력 없이, 하루가 하루치만큼 기록된다.",
        value: "\"기록하겠다는 의식 없이, 살면서 남기는 것들\"",
        icon: Sparkles,
    },
    {
        num: "3",
        title: "나를 알아간다",
        desc: "AI가 나의 소비 패턴, 수면 패턴, 관계 패턴, 감정 패턴을 이해한다. 하지만 나서지 않는다. 오래 사귄 친구처럼, 조심스럽게.",
        value: "\"비서가 아니라 영혼의 단짝\"",
        icon: Brain,
    },
    {
        num: "4",
        title: "나를 대표한다",
        desc: "AI가 나를 충분히 알게 되면, 디지털 세상에서 나를 대표할 수 있게 된다. 더 이상 앱이 아니라 디지털 세상에서의 나 자신.",
        value: "\"내가 직접 가지 않아도 된다\"",
        icon: User,
    },
    {
        num: "5",
        title: "세상이 나에게 접속한다",
        desc: "패러다임이 뒤집힌다. 내가 서비스에 접속하는 게 아니라, 서비스가 나에게 접속한다. 내가 허락한 만큼만.",
        value: "\"여기에 내가 있다. 만나러 와라.\"",
        icon: Globe,
    },
];

function TransitionsSection() {
    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">FIVE TRANSITIONS</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">다섯 번의 전환</h2>
                </div>

                <div className="space-y-6 max-w-3xl mx-auto">
                    {transitions.map((t) => (
                        <div key={t.num} className="flex gap-6 p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/20 transition-colors">
                            <div className="flex-shrink-0">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    <t.icon className="h-6 w-6 text-indigo-400" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-indigo-400">{t.num}차</span>
                                    <h3 className="text-white font-semibold text-lg">{t.title}</h3>
                                </div>
                                <p className="text-sm text-neutral-400 leading-relaxed mb-2">{t.desc}</p>
                                <p className="text-sm text-indigo-300 italic">{t.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Three Principles ── */
const principles = [
    {
        num: "1",
        title: "나는 서비스의 사용자가 아니라, 서비스의 주인이다.",
        desc: "내 데이터는 내가 가지고 있고, 누구에게 보여줄지 내가 결정한다.",
        icon: Shield,
    },
    {
        num: "2",
        title: "서비스는 유한하지만, 나는 계속된다.",
        desc: "어떤 서비스에도 종속되지 않는 \"나\"의 기록. Myverse 자체가 사라져도 데이터는 표준 포맷으로 남는다.",
        icon: Database,
    },
    {
        num: "3",
        title: "나를 가장 잘 아는 건 알고리즘이 아니라 나 자신이어야 한다.",
        desc: "유튜브가 내 취향을 아는 건 틀린 구조다. 내 취향은 내가 알아야 하고, 그 위에서 내가 선택해야 한다.",
        icon: Brain,
    },
];

function PrinciplesSection() {
    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">THREE PRINCIPLES</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">세 가지 원칙</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {principles.map((p) => (
                        <div key={p.num} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                                <p.icon className="h-5 w-5 text-indigo-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-3 leading-snug">{p.title}</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Black Box ── */
function BlackBoxSection() {
    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
                <Orbit className="h-12 w-12 text-indigo-400 mx-auto mb-6" />
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                    나의 Personal Black Box
                </h2>
                <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
                    비행기에는 블랙박스가 있다. 모든 비행 데이터를 기록해서 무슨 일이 있었는지 말해준다.
                    사람에게는 그런 게 없었다. 기억은 왜곡되고, 흐려지고, 사라진다.
                </p>
                <p className="text-xl font-semibold text-white">
                    Myverse는 나의 Personal Black Box다.
                </p>
                <div className="mt-10">
                    <Link
                        href="/myverse/service"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors"
                    >
                        서비스 살펴보기
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

/* ── Soul Mate ── */
function SoulMateSection() {
    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
                <div className="text-center mb-12">
                    <p className="text-indigo-400 font-medium text-sm mb-3">SOUL MATE</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">영혼의 단짝</h2>
                    <p className="mt-4 text-neutral-400 max-w-xl mx-auto">
                        나를 깊이 알되, 조심스럽다. 필요할 때만, 적절한 만큼만.
                    </p>
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                    <div className="flex gap-3 items-start">
                        <span className="text-red-400 text-lg mt-0.5">✕</span>
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-sm text-neutral-400 flex-1">
                            &ldquo;오늘 운동 안 하셨어요! 운동하세요!&rdquo; → <span className="text-red-300">참견</span>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                        <span className="text-green-400 text-lg mt-0.5">○</span>
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-sm text-neutral-400 flex-1">
                            (아무 말 안 함. 내가 물으면 그때 알려줌) → <span className="text-green-300">배려</span>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                        <span className="text-red-400 text-lg mt-0.5">✕</span>
                        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-sm text-neutral-400 flex-1">
                            &ldquo;이 보험 상품 어때요? 추천드려요!&rdquo; → <span className="text-red-300">광고</span>
                        </div>
                    </div>
                    <div className="flex gap-3 items-start">
                        <span className="text-green-400 text-lg mt-0.5">○</span>
                        <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-sm text-neutral-400 flex-1">
                            &ldquo;건강검진 결과가 작년보다 조금 변했어.&rdquo; → <span className="text-green-300">알아챔</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-10">
                    <Link href="/myverse/service" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1">
                        나와의 대화 더 알아보기 <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default function PhilosophyPage() {
    return (
        <>
            <Hero />
            <ScatteredSection />
            <TransitionsSection />
            <PrinciplesSection />
            <SoulMateSection />
            <BlackBoxSection />
        </>
    );
}
