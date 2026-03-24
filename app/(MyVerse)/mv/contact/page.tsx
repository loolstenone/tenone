"use client";

import { Orbit, Mail, Users, Briefcase, MessageSquare } from "lucide-react";

/* ── Hero ── */
function Hero() {
    return (
        <section className="relative overflow-hidden py-32 lg:py-40">
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/8 blur-[120px]" />
            </div>
            <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
                <p className="text-indigo-400 font-medium text-sm mb-4">CONTACT</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    여기에 내가 있다.
                </h1>
                <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                    나만의 우주를 만들 준비가 되셨나요?
                </p>
            </div>
        </section>
    );
}

/* ── Early Access ── */
function EarlyAccessSection() {
    return (
        <section className="py-24 lg:py-32 bg-white/[0.02]">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="relative max-w-xl mx-auto text-center">
                    <div className="absolute -inset-x-20 -inset-y-10 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
                    <div className="relative p-10 rounded-3xl bg-white/[0.03] border border-white/10">
                        <Orbit className="h-10 w-10 text-indigo-400 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-2">Early Access</h2>
                        <p className="text-sm text-neutral-400 mb-8">
                            첫 번째 주민이 되어주세요. 출시 전 베타 초대를 보내드립니다.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="이메일을 입력하세요"
                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                            />
                            <button className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors whitespace-nowrap text-sm">
                                등록하기
                            </button>
                        </div>
                        <p className="text-xs text-neutral-500 mt-4">
                            스팸 없음 · 언제든 구독 해지 가능
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── Contact Cards ── */
function ContactCards() {
    const cards = [
        {
            icon: Mail,
            title: "일반 문의",
            description: "서비스에 대한 궁금한 점이 있으시면",
            action: "lools@tenone.biz",
            href: "mailto:lools@tenone.biz",
        },
        {
            icon: Briefcase,
            title: "투자 / 파트너십",
            description: "투자 또는 데이터 파트너십 제안",
            action: "lools@tenone.biz",
            href: "mailto:lools@tenone.biz",
        },
        {
            icon: Users,
            title: "채용 / 합류",
            description: "함께 우주를 만들고 싶다면",
            action: "lools@tenone.biz",
            href: "mailto:lools@tenone.biz",
        },
        {
            icon: MessageSquare,
            title: "미디어 / 취재",
            description: "미디어 문의 및 인터뷰 요청",
            action: "lools@tenone.biz",
            href: "mailto:lools@tenone.biz",
        },
    ];

    return (
        <section className="py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">문의하기</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    {cards.map((c) => (
                        <a
                            key={c.title}
                            href={c.href}
                            className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-indigo-500/20 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                                <c.icon className="h-5 w-5 text-indigo-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-1">{c.title}</h3>
                            <p className="text-sm text-neutral-400 mb-3">{c.description}</p>
                            <p className="text-sm text-indigo-400 group-hover:text-indigo-300 transition-colors">{c.action}</p>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Bottom ── */
function BottomSection() {
    return (
        <section className="py-16 bg-white/[0.02]">
            <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
                <p className="text-sm text-neutral-500">
                    Myverse는 <a href="https://tenone.biz" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">Ten:One™ Universe</a>의 서비스입니다.
                </p>
                <p className="text-lg text-neutral-300 mt-4 font-medium">
                    Myverse — 디지털 속 나를 키운다.
                </p>
            </div>
        </section>
    );
}

export default function ContactPage() {
    return (
        <>
            <Hero />
            <EarlyAccessSection />
            <ContactCards />
            <BottomSection />
        </>
    );
}
