// MADLeap 홈 (madleap.co.kr 원문 기반 재작성, 2026-05-25)
//
// 정직성 회복:
// - 검증 안 된 mock 제거: stats 4건 (200+멤버·15+수상·12+파트너)·highlights 4건 (대상·DAM Party·관광공사·32명선발)
//   · instaPosts 6건 (가짜 캡션·좋아요)·5기 30명·전형 4단계 등
// - madleap.co.kr 원문: "선배님 저 정말..." 3가지 학생 목소리·"매년 2~3월 2년 활동"·5대 가치 원문 순서
// - 검증 가능 콘텐츠만: 5대 가치·MAD 의미·활동 4축·Universe 파트너 3·연락처

"use client";

import Link from "next/link";
import NewsletterSubscribeForm from '@/components/newsletter/NewsletterSubscribeForm';
import {
    ArrowRight,
    Expand,
    Link2,
    Footprints,
    BarChart3,
    Lightbulb,
    Users,
    Trophy,
    Star,
    Quote,
    Instagram,
    Mail,
    ExternalLink,
} from "lucide-react";

const values = [
    { icon: Expand, title: "확장하다", desc: "기존 광고 동아리의 '광고·크리에이티브' 틀에서 벗어나 마케팅·커뮤니케이션·데이터로 확장한다." },
    { icon: Link2, title: "연결하다", desc: "국내 여러 광고 동아리와 지속적으로 관계를 구축하고, 현업 선배와 소통하며 프로젝트를 진행한다." },
    { icon: Footprints, title: "발로 뛰다", desc: "주어진 과제에 만족하지 않고 직접 발로 뛰며 본질적 문제 해결책을 발굴한다." },
    { icon: Lightbulb, title: "세상을 기획하는 기획자가 되다", desc: "AE·AP가 아닌, 일이 되게끔 만드는 기획. 생각을 세상에 꺼내 결과를 만든다." },
    { icon: BarChart3, title: "결과로 말하다", desc: "큰 혁신을 불러올 잠재력을 실전 프로젝트로 증명한다. 과정도 중요하지만 결과로 말한다." },
];

const activities = [
    { icon: BarChart3, title: "스터디", desc: "마케팅·광고·커뮤니케이션·데이터 분야별 스터디 그룹 운영" },
    { icon: Trophy, title: "프로젝트", desc: "실제 브랜드 RFP 수주·제안·실행 경험" },
    { icon: Users, title: "네트워킹", desc: "현업 선배 멘토링 + 광고 동아리 연합 교류" },
    { icon: Star, title: "온보딩 매듭", desc: "신입 기수 온보딩 프로그램 — 실전 기획 첫 경험" },
];

const partners = [
    { name: "MAD League", role: "본부 — 전국 광고·마케팅 동아리 연합 (서울 거점)" },
    { name: "Badak", role: "네트워크 파트너 — 대학생·현업 커리어 네트워크" },
    { name: "Ten:One Universe", role: "인큐베이팅 — IT 인프라·멘토링 지원" },
];

const studentVoices = [
    "선배님, 저 정말 광고 기획 제대로 배워 보고 싶어요",
    "선배님, 마케팅 비전공자는 뭐부터 해야 하나요?",
    "선배님, 이론은 이제 지겨워요. 실무가 너무 궁금해요",
];

export default function MadLeapHome() {
    return (
        <>
            {/* ── Hero ── */}
            <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#1a1a2e]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e]/30 via-[#1a1a2e]/60 to-[#1a1a2e]" />
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[url('/brands/madleap/hero-bg.jpg')] bg-cover bg-center" />
                </div>
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-[#4361ee]/60 rounded-full animate-pulse"
                            style={{
                                top: `${15 + i * 15}%`,
                                left: `${10 + i * 16}%`,
                                animationDelay: `${i * 0.4}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight">
                            M<span className="text-[#4361ee]">A</span>D
                        </h1>
                        <div className="flex items-center justify-center gap-4 -mt-2">
                            <div className="h-px w-16 bg-white/60" />
                            <span className="text-xl md:text-3xl font-light text-white tracking-[0.3em]">L E A P</span>
                            <div className="h-px w-16 bg-white/60" />
                        </div>
                    </div>

                    <p className="text-xl md:text-2xl text-white/90 font-bold mt-8">미치지 않으면, 미치지 못한다.</p>
                    <p className="text-sm md:text-base text-white/50 mt-3">실전 프로젝트 대학생 연합동아리</p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/madleap/about"
                            className="w-full sm:w-auto px-8 py-3.5 bg-[#4361ee] text-white text-sm font-bold hover:bg-[#3451de] transition-all rounded-lg flex items-center justify-center gap-2"
                        >
                            매드립 알아보기
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/madleap/portfolio"
                            className="w-full sm:w-auto px-8 py-3.5 border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all rounded-lg text-center"
                        >
                            포트폴리오 보기
                        </Link>
                    </div>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                    </div>
                </div>
            </section>

            {/* ── About Preview (madleap.co.kr 원문 인용) ── */}
            <section className="bg-[#1a1a2e] text-white py-16 md:py-24">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <p className="text-[#4361ee] text-xs font-semibold tracking-widest uppercase mb-3">Our Origin</p>
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-10">우리의 시작은 기웃거림이었습니다.</h2>

                    <div className="space-y-3 mb-10 text-left">
                        {studentVoices.map((v) => (
                            <div key={v} className="rounded-xl bg-white/[0.04] border border-white/10 px-5 py-4">
                                <Quote className="inline h-4 w-4 text-[#4361ee] mr-2 -mt-0.5" />
                                <span className="text-white/80 text-[15px]">{v}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-neutral-300 text-base md:text-lg leading-relaxed mb-6">
                        그렇게 마케팅·광고가 하고 싶은 학생들의 열정이 현업 선배에게 닿았습니다.
                        선배들은 손을 잡아 주었고, 함께 마케팅·광고 동아리계의 새로운 패러다임을 만들었습니다.
                    </p>
                    <p className="text-[#4361ee] font-semibold text-lg md:text-xl leading-relaxed">
                        디지털과 AI가 모든 경계를 허문 지금,<br />
                        매드립은 한 번 더 도약합니다.
                    </p>

                    <Link
                        href="/madleap/about"
                        className="inline-flex items-center gap-2 mt-10 px-6 py-3 border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all rounded-lg"
                    >
                        더 알아보기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* ── Activities ── */}
            <section className="bg-white py-16 md:py-24">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="text-center mb-10 md:mb-14">
                        <p className="text-[#4361ee] text-xs font-semibold tracking-widest uppercase mb-3">Activities</p>
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">매드립은 이런 일을 합니다</h2>
                        <p className="text-neutral-500 text-sm md:text-base max-w-2xl mx-auto">
                            대학생들과 현업 선배가 멘토가 되어 함께 만들어 갑니다.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {activities.map((act) => (
                            <div
                                key={act.title}
                                className="border border-neutral-200 rounded-xl p-6 hover:border-[#4361ee]/30 hover:shadow-md transition-all group"
                            >
                                <act.icon className="h-8 w-8 text-[#4361ee] mb-3 group-hover:scale-110 transition-transform" />
                                <h3 className="font-bold text-lg mb-2 text-neutral-900">{act.title}</h3>
                                <p className="text-neutral-500 text-sm leading-relaxed">{act.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 5대 운영 가치 (madleap.co.kr 원문 순서) ── */}
            <section className="bg-neutral-50 py-16 md:py-24">
                <div className="mx-auto max-w-5xl px-6">
                    <div className="mb-10 md:mb-14 text-center">
                        <p className="text-[#4361ee] text-xs font-semibold tracking-widest uppercase mb-3">Our Values</p>
                        <h2 className="text-2xl md:text-3xl font-bold">5대 운영 가치</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        {values.map((v, i) => (
                            <div key={v.title} className="flex gap-4">
                                <div className="shrink-0">
                                    <div className="w-10 h-10 rounded-lg bg-[#4361ee]/10 flex items-center justify-center">
                                        <v.icon className="h-5 w-5 text-[#4361ee]" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-[#4361ee]/60 font-bold mb-1">0{i + 1}</p>
                                    <h3 className="text-lg font-bold mb-2 text-neutral-900">{v.title}</h3>
                                    <p className="text-neutral-600 text-sm leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 모집 안내 (madleap.co.kr 원문) ── */}
            <section className="bg-[#1a1a2e] py-16 md:py-20">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <p className="text-[#4361ee] text-xs font-semibold tracking-widest uppercase mb-3">Recruiting</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">함께 도약할 리퍼를 찾습니다</h2>
                    <p className="text-neutral-300 text-base md:text-lg leading-relaxed mb-3">
                        매년 <strong className="text-[#4361ee]">2~3월</strong>, 2년 활동을 기준으로
                        새로운 기수를 모집합니다.
                    </p>
                    <p className="text-neutral-500 text-sm mb-10">
                        모집 공지는 SNS·공식 홈페이지·에브리타임·링커리어에서 안내합니다.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href="https://instagram.com/madleap.official"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-6 py-3 bg-[#4361ee] text-white text-sm font-bold hover:bg-[#3451de] transition-all rounded-lg inline-flex items-center justify-center gap-2"
                        >
                            <Instagram className="h-4 w-4" />
                            인스타그램 팔로우
                        </a>
                        <a
                            href="mailto:official@madleap.co.kr"
                            className="w-full sm:w-auto px-6 py-3 border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-all rounded-lg inline-flex items-center justify-center gap-2"
                        >
                            <Mail className="h-4 w-4" />
                            문의: official@madleap.co.kr
                        </a>
                    </div>
                </div>
            </section>

            {/* ── Partners (Universe 내부 3) ── */}
            <section className="bg-white py-12 md:py-16">
                <div className="mx-auto max-w-5xl px-6">
                    <h2 className="text-sm font-semibold text-neutral-400 text-center mb-8 uppercase tracking-wider">Partners</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {partners.map((p) => (
                            <div
                                key={p.name}
                                className="px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-lg"
                            >
                                <div className="font-bold text-sm text-neutral-900">{p.name}</div>
                                <div className="text-xs text-neutral-500 mt-0.5">{p.role}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 채널 (madleap.co.kr 공식 채널) ── */}
            <section className="bg-neutral-50 py-12">
                <div className="mx-auto max-w-3xl px-6">
                    <h2 className="text-sm font-semibold text-neutral-400 text-center mb-6 uppercase tracking-wider">Channels</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <a
                            href="https://instagram.com/madleap.official"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-5 py-4 bg-white border border-neutral-200 rounded-lg hover:border-[#4361ee]/30 hover:shadow-sm transition-all"
                        >
                            <Instagram className="h-5 w-5 text-neutral-700" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-neutral-400">Instagram</div>
                                <div className="text-sm font-semibold text-neutral-800 truncate">@madleap.official</div>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                        </a>
                        <a
                            href="https://blog.naver.com/madleap"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-5 py-4 bg-white border border-neutral-200 rounded-lg hover:border-[#4361ee]/30 hover:shadow-sm transition-all"
                        >
                            <Star className="h-5 w-5 text-green-600" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-neutral-400">Naver Blog</div>
                                <div className="text-sm font-semibold text-neutral-800 truncate">blog.naver.com/madleap</div>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-neutral-400" />
                        </a>
                        <a
                            href="mailto:official@madleap.co.kr"
                            className="flex items-center gap-3 px-5 py-4 bg-white border border-neutral-200 rounded-lg hover:border-[#4361ee]/30 hover:shadow-sm transition-all"
                        >
                            <Mail className="h-5 w-5 text-neutral-700" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-neutral-400">Email</div>
                                <div className="text-sm font-semibold text-neutral-800 truncate">official@madleap.co.kr</div>
                            </div>
                        </a>
                    </div>
                </div>
            </section>

            {/* ── 뉴스레터 구독 ── */}
            <section className="py-16 px-6 border-t border-neutral-800">
                <NewsletterSubscribeForm source="madleap" brandName="MAD Leap" dark accentColor="#4361ee" />
            </section>

            {/* ── Bottom CTA ── */}
            <section className="bg-[#4361ee] py-16">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">매드립과 함께 도약하세요</h2>
                    <p className="text-white/80 mb-8">매년 2~3월, 새로운 기수를 모집합니다.</p>
                    <Link
                        href="/madleap/about"
                        className="inline-block px-8 py-3.5 bg-white text-[#4361ee] font-bold hover:bg-neutral-100 transition-colors rounded-lg"
                    >
                        매드립 알아보기
                    </Link>
                </div>
            </section>
        </>
    );
}
