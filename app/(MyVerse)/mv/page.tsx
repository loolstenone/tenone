"use client";

import Link from "next/link";
import {
    Orbit,
    User,
    Shield,
    Zap,
    Link2,
    Bot,
    ArrowRight,
    Sparkles,
    Database,
    Lock,
    ChevronRight,
    Globe,
    Brain,
} from "lucide-react";

/* ── Hero ── */
function HeroSection() {
    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[80px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-32 lg:py-44">
                <div className="text-center max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300 mb-8">
                        <Orbit className="h-4 w-4 text-indigo-400" />
                        Personal Black Box
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
                        디지털 속
                        <br />
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            나를 키운다
                        </span>
                    </h1>

                    <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                        흩어져 있는 나의 기록을 모으고, AI가 나를 알아가고,
                        <br className="hidden sm:block" />
                        디지털 세상에서 나를 대표하는 영혼의 단짝.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/mv/contact"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors"
                        >
                            Early Access 신청
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/mv/philosophy"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-neutral-300 font-medium hover:bg-white/5 transition-colors"
                        >
                            왜 Myverse인가
                        </Link>
                    </div>
                </div>

                {/* Floating orbs */}
                <div className="mt-20 relative h-40 flex items-center justify-center">
                    <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
                        <Bot className="h-8 w-8 text-indigo-300" />
                    </div>
                    <div className="absolute -left-8 top-4 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/20 flex items-center justify-center sm:left-[calc(50%-160px)]">
                        <User className="h-5 w-5 text-pink-300" />
                    </div>
                    <div className="absolute -right-4 top-0 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center sm:right-[calc(50%-170px)]">
                        <Database className="h-5 w-5 text-cyan-300" />
                    </div>
                    <div className="absolute left-4 bottom-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center sm:left-[calc(50%-120px)]">
                        <Lock className="h-4 w-4 text-amber-300" />
                    </div>
                    <div className="absolute right-8 bottom-4 w-11 h-11 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 flex items-center justify-center sm:right-[calc(50%-130px)]">
                        <Globe className="h-4 w-4 text-green-300" />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── 5 Transitions ── */
const transitions = [
    { num: "01", title: "나를 모은다", desc: "흩어진 기록을 한 곳에 데려온다. 잊혀져가는 데이터를 구출한다.", icon: Database },
    { num: "02", title: "나를 쌓는다", desc: "과거를 구출한 다음, 현재를 쌓는다. 특별한 노력 없이, 하루가 기록된다.", icon: Sparkles },
    { num: "03", title: "나를 알아간다", desc: "AI가 나를 이해하기 시작한다. 비서가 아니라 영혼의 단짝으로.", icon: Brain },
    { num: "04", title: "나를 대표한다", desc: "디지털 세상에서 나를 대표할 수 있게 된다. 더 이상 앱이 아닌, 나 자신.", icon: User },
    { num: "05", title: "세상이 접속한다", desc: "내가 서비스에 접속하는 게 아니라, 서비스가 나에게 접속한다.", icon: Globe },
];

function TransitionsSection() {
    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">FIVE TRANSITIONS</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        다섯 번의 전환
                    </h2>
                    <p className="mt-4 text-neutral-400 max-w-xl mx-auto">
                        어둠 속의 점 하나에서 시작해, 세상이 나에게 접속하기까지
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {transitions.map((t) => (
                        <div key={t.num} className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.06] transition-all">
                            <span className="text-xs text-indigo-400 font-mono">{t.num}</span>
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center my-3">
                                <t.icon className="h-5 w-5 text-indigo-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">{t.title}</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">{t.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <Link href="/mv/philosophy" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1">
                        철학 더 알아보기 <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

/* ── Core Values ── */
const coreValues = [
    { icon: User, title: "개인화", en: "Personalize", description: "AI가 당신의 패턴, 선호, 역량을 학습하여 최적의 정보와 서비스를 제공합니다.", color: "from-indigo-500 to-blue-500", borderColor: "border-indigo-500/20" },
    { icon: Zap, title: "사용자 주도권", en: "Initiative", description: "무엇을 공유하고, 어떤 데이터를 활용할지 모든 결정은 사용자의 손에 있습니다.", color: "from-amber-500 to-orange-500", borderColor: "border-amber-500/20" },
    { icon: Shield, title: "완벽한 보안", en: "Security", description: "엔드투엔드 암호화, 제로 지식 아키텍처로 데이터 주권을 보장합니다.", color: "from-emerald-500 to-green-500", borderColor: "border-emerald-500/20" },
    { icon: Link2, title: "쉬운 연결과 단절", en: "Connect & Cut off", description: "원할 때 연결하고, 원할 때 끊습니다. 서비스 간 데이터 이동과 삭제가 자유롭습니다.", color: "from-purple-500 to-pink-500", borderColor: "border-purple-500/20" },
];

function ValuesSection() {
    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <p className="text-indigo-400 font-medium text-sm mb-3">CORE VALUES</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">4가지 핵심 가치</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {coreValues.map((v) => (
                        <div key={v.en} className={`p-6 rounded-2xl bg-white/[0.03] border ${v.borderColor} hover:bg-white/[0.06] transition-all`}>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center mb-4`}>
                                <v.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-1">{v.title}</h3>
                            <p className="text-xs text-indigo-400 mb-3">{v.en}</p>
                            <p className="text-sm text-neutral-400 leading-relaxed">{v.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Agent Preview ── */
function AgentSection() {
    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-indigo-400 font-medium text-sm mb-3">SOUL MATE AI</p>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            비서가 아닌
                            <br />
                            <span className="text-indigo-400">영혼의 단짝</span>
                        </h2>
                        <p className="mt-6 text-neutral-400 leading-relaxed">
                            Myverse의 AI는 참견하지 않습니다. 오래 사귄 친구처럼 나를 깊이 알되,
                            조심스럽습니다. 필요할 때만, 적절한 만큼만.
                        </p>
                        <div className="mt-8 space-y-3 text-sm text-neutral-400">
                            <div className="flex items-start gap-3">
                                <span className="text-red-400 mt-0.5">✕</span>
                                <span>&ldquo;커피를 너무 많이 드시네요. 줄이세요.&rdquo; — 훈계</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-green-400 mt-0.5">○</span>
                                <span>&ldquo;이번 주 커피 7잔째야.&rdquo; — 관찰</span>
                            </div>
                        </div>
                        <Link href="/mv/service" className="mt-8 text-sm text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1">
                            서비스 자세히 보기 <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div>
                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-white font-medium">나의 기록</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="p-3 rounded-lg bg-white/5 text-neutral-300">
                                    요즘 왜 이렇게 돈을 많이 쓰지?
                                </div>
                                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-neutral-300 space-y-2">
                                    <p>이번 달 외식이 23회야. 지난달보다 8번 많아.</p>
                                    <p>주로 목~금요일에 몰려 있어. 이번 달 마감이 3건 겹쳤거든.</p>
                                    <p className="text-neutral-500">네 패턴상 마감 전후에 외식이 느는 편이야.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── CTA ── */
function CTASection() {
    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="relative max-w-2xl mx-auto text-center">
                    <div className="absolute -inset-x-20 -inset-y-10 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
                    <div className="relative p-10 rounded-3xl bg-white/[0.03] border border-white/10">
                        <Orbit className="h-10 w-10 text-indigo-400 mx-auto mb-6" />
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                            여기에 내가 있다.
                        </h2>
                        <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                            처음엔 어둠 속 점 하나. 하나씩 모아서, 매일 쌓아서, 조금씩 키워서.
                            디지털 속의 내가 형태를 갖습니다.
                        </p>
                        <Link
                            href="/mv/contact"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors"
                        >
                            Early Access 신청
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Main ── */
export default function MyVersePage() {
    return (
        <>
            <HeroSection />
            <TransitionsSection />
            <ValuesSection />
            <AgentSection />
            <CTASection />
        </>
    );
}
