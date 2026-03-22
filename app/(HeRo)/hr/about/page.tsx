"use client";

import Link from "next/link";
import {
    Target,
    Eye,
    Heart,
    ArrowRight,
    Users,
    Zap,
    Award,
    Globe,
    Calendar,
} from "lucide-react";

const visionItems = [
    {
        icon: Eye,
        title: "비전",
        desc: "모든 인재가 자신의 잠재력을 발견하고, 체계적으로 성장할 수 있는 세상",
    },
    {
        icon: Target,
        title: "미션",
        desc: "숨겨진 인재를 발굴하고, 맞춤형 성장 프로그램으로 꿈을 현실로 만드는 플랫폼",
    },
    {
        icon: Heart,
        title: "핵심 가치",
        desc: "발견(Discovery), 성장(Growth), 연결(Connection), 진정성(Authenticity)",
    },
];

const milestones = [
    { year: "2024", events: ["HeRo 프로젝트 기획 시작", "HIT 진단 도구 개발"] },
    { year: "2025", events: ["HeRo 플랫폼 베타 런칭", "멘토단 1기 구성", "커리어 로드맵 프로그램 시작", "퍼스널 브랜딩 서비스 오픈"] },
    { year: "2026", events: ["HeRo 정식 런칭 (hero.ne.kr)", "이력서 AI 컨설팅 도입", "멘토단 2기 확대"] },
];

const partners = [
    { name: "Ten:One Universe", desc: "멀티 브랜드 생태계", type: "Parent" },
    { name: "MAD League", desc: "대학 연합 경쟁 플랫폼", type: "Collaboration" },
    { name: "YouInOne", desc: "프로젝트 그룹", type: "Collaboration" },
    { name: "SmarComm.", desc: "AI 마케팅 커뮤니케이션", type: "Collaboration" },
];

const stats = [
    { icon: Users, label: "발굴 인재", value: "500+" },
    { icon: Zap, label: "멘토 매칭", value: "200+" },
    { icon: Award, label: "성공 사례", value: "150+" },
    { icon: Globe, label: "파트너 대학", value: "10+" },
];

export default function AboutPage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28 text-center">
                    <div className="max-w-3xl mx-auto">
                        <span className="text-4xl font-extrabold tracking-tight mb-2 block">
                            <span className="text-amber-500">He</span>
                            <span className="text-neutral-900">Ro</span>
                        </span>
                        <p className="text-lg text-neutral-500 mb-4">Hidden Intelligence &amp; Real Opportunity</p>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-6">
                            숨겨진 인재를 발굴하고<br />성장시키는 플랫폼
                        </h1>
                        <p className="text-neutral-600 max-w-xl mx-auto">
                            HeRo는 인재의 잠재력을 과학적으로 진단하고, 체계적인 성장 프로그램을 통해
                            모든 사람이 자신만의 HeRo가 될 수 있도록 돕습니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Vision / Mission / Values */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {visionItems.map((item) => (
                            <div key={item.title} className="border border-neutral-200 rounded-xl p-6 text-center">
                                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-sm text-neutral-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat) => (
                            <div key={stat.label} className="text-center">
                                <stat.icon className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                                <p className="text-3xl font-extrabold text-neutral-900">{stat.value}</p>
                                <p className="text-sm text-neutral-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* History / Timeline */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">연혁</h2>
                        <p className="text-neutral-500">HeRo의 성장 스토리</p>
                    </div>
                    <div className="max-w-2xl mx-auto">
                        <div className="relative pl-8 border-l-2 border-amber-200 space-y-10">
                            {milestones.map((m) => (
                                <div key={m.year} className="relative">
                                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100" />
                                    <div className="ml-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="h-4 w-4 text-amber-500" />
                                            <h3 className="text-lg font-bold">{m.year}</h3>
                                        </div>
                                        <ul className="space-y-2">
                                            {m.events.map((event) => (
                                                <li key={event} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                                                    <span className="text-sm text-neutral-600">{event}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">파트너</h2>
                        <p className="text-neutral-500">Ten:One Universe 생태계와 함께합니다</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {partners.map((partner) => (
                            <div key={partner.name} className="bg-white border border-neutral-200 rounded-xl p-5 text-center">
                                <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium">
                                    {partner.type}
                                </span>
                                <h3 className="text-base font-bold mt-3 mb-1">{partner.name}</h3>
                                <p className="text-xs text-neutral-500">{partner.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-amber-500">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-3xl font-bold text-white mb-3">HeRo에 합류하세요</h2>
                    <p className="text-amber-100 mb-8">당신도 HeRo가 될 수 있습니다</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/hr/hit"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-amber-600 font-bold hover:bg-amber-50 transition-colors rounded-lg"
                        >
                            HIT 진단 시작 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white font-bold hover:bg-amber-600 transition-colors rounded-lg"
                        >
                            회원가입
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
