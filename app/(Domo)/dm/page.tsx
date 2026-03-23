"use client";

import Link from "next/link";
import { ArrowRight, Briefcase, Users, FileText, TrendingUp, Calendar, ChevronRight, Shield, Lightbulb, HandshakeIcon } from "lucide-react";

/* ── Mock 데이터 ── */

const services = [
    {
        icon: Briefcase,
        title: "준비서 서비스",
        desc: "일정 관리, 비즈니스 미팅 어레인지, 여행/골프 예약 등 경영인 맞춤 비서 서비스",
        href: "/dm/services",
    },
    {
        icon: FileText,
        title: "기획 & 컨설팅",
        desc: "사업 기획서 작성, 브랜드 전략, 마케팅 플랜 등 프로젝트 기획 지원",
        href: "/dm/services",
    },
    {
        icon: TrendingUp,
        title: "투자 자문",
        desc: "부동산, 주식, 스타트업 등 포트폴리오 구성과 투자 자문 연결",
        href: "/dm/services",
    },
    {
        icon: Users,
        title: "네트워킹",
        desc: "같은 뜻을 가진 시니어 비즈니스맨들과의 정기 모임 및 교류",
        href: "/dm/network",
    },
];

const upcomingEvents = [
    { date: "4월 12일", title: "시니어 비즈니스 네트워킹 디너", location: "서울 강남", type: "네트워킹" },
    { date: "4월 19일", title: "은퇴 후 자산관리 세미나", location: "온라인 Zoom", type: "세미나" },
    { date: "4월 26일", title: "골프 라운딩 모임", location: "경기도 용인", type: "친목" },
    { date: "5월 3일", title: "스타트업 투자 설명회", location: "서울 여의도", type: "투자" },
];

const insights = [
    { title: "은퇴 후 5년, 성공적인 2막을 연 CEO들의 공통점", category: "인터뷰", date: "2026.03.20" },
    { title: "2026 시니어 창업 트렌드: AI와 헬스케어가 이끈다", category: "트렌드", date: "2026.03.18" },
    { title: "자산 포트폴리오 리밸런싱, 지금이 적기인 이유", category: "투자", date: "2026.03.15" },
    { title: "시니어 비즈니스맨을 위한 퍼스널 브랜딩 전략", category: "브랜딩", date: "2026.03.12" },
    { title: "정년 후 사회공헌, 경험을 나누는 멘토링 프로그램", category: "사회공헌", date: "2026.03.10" },
];

const memberTestimonials = [
    { name: "K 전무", industry: "광고/마케팅 35년", quote: "집에만 있기엔 아직 할 일이 많습니다. 같은 생각을 가진 분들을 만나니 새로운 에너지가 생깁니다." },
    { name: "P 부사장", industry: "금융/투자 30년", quote: "경험과 네트워크를 활용할 수 있는 곳을 찾고 있었습니다. Domo에서 좋은 파트너를 만났습니다." },
    { name: "L 대표", industry: "IT/테크 28년", quote: "은퇴 후 막연했던 계획이 구체적인 프로젝트로 바뀌었습니다." },
];

const values = [
    { icon: Shield, title: "신뢰", desc: "검증된 시니어 비즈니스맨만을 위한 프리미엄 커뮤니티" },
    { icon: Lightbulb, title: "도전", desc: "인생 2회차, 새로운 가능성을 함께 만들어갑니다" },
    { icon: HandshakeIcon, title: "연결", desc: "경험과 지혜를 나누는 의미있는 네트워킹" },
];

/* ── 컴포넌트 ── */

export default function DomoHome() {
    return (
        <div>
            {/* ── Hero Section ── */}
            <section className="relative bg-gradient-to-br from-[#2D1B2E] via-[#3D2540] to-[#1E1220] text-white py-28 px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-[#C88DA0] text-sm font-medium mb-4 tracking-widest uppercase">인생 2회차를 위한 비즈니스 플랫폼</p>
                    <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
                        도모하다
                    </h1>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-4 leading-relaxed">
                        어떤 일을 이루기 위하여 미리 대책과 방법을 세움
                    </p>
                    <p className="text-sm text-white/50 mb-10">
                        정년·은퇴를 앞두고 있거나, 이미 새로운 도전을 시작한 시니어 비즈니스맨을 위한 곳
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link
                            href="/dm/services"
                            className="bg-[#7F1146] hover:bg-[#5C0C33] text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            서비스 알아보기 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/dm/about"
                            className="border border-white/30 hover:border-white/60 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                        >
                            Domo란?
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Values ── */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="mx-auto max-w-5xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((v) => (
                            <div key={v.title} className="text-center p-8">
                                <div className="w-16 h-16 mx-auto mb-4 bg-[#7F1146]/10 rounded-full flex items-center justify-center">
                                    <v.icon className="h-7 w-7 text-[#7F1146]" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">{v.title}</h3>
                                <p className="text-sm text-neutral-600 leading-relaxed">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 핵심 서비스 ── */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-2">핵심 서비스</h2>
                    <p className="text-neutral-500 mb-10">당신의 인생 2회차를 함께 준비합니다</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((svc) => (
                            <Link
                                key={svc.title}
                                href={svc.href}
                                className="group border border-neutral-200 rounded-xl p-6 hover:border-[#7F1146]/30 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 shrink-0 bg-[#7F1146]/10 rounded-lg flex items-center justify-center group-hover:bg-[#7F1146]/20 transition-colors">
                                        <svc.icon className="h-6 w-6 text-[#7F1146]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900 mb-1 group-hover:text-[#7F1146] transition-colors">{svc.title}</h3>
                                        <p className="text-sm text-neutral-600 leading-relaxed">{svc.desc}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 구분선 ── */}
            <div className="mx-auto max-w-5xl border-t border-neutral-200" />

            {/* ── 다가오는 이벤트 ── */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-neutral-900 mb-1">다가오는 모임</h2>
                            <p className="text-neutral-500 text-sm">함께하는 시간이 기회가 됩니다</p>
                        </div>
                        <Link href="/dm/events" className="text-sm text-[#7F1146] hover:text-[#5C0C33] font-medium flex items-center gap-1 transition-colors">
                            전체 보기 <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {upcomingEvents.map((ev, i) => (
                            <Link key={i} href="/dm/events" className="group border border-neutral-200 rounded-xl p-5 hover:border-[#7F1146]/30 hover:shadow-md transition-all">
                                <span className="inline-block text-[10px] font-semibold text-[#7F1146] bg-[#7F1146]/10 px-2 py-0.5 rounded mb-3">{ev.type}</span>
                                <p className="text-xs text-neutral-500 mb-1">{ev.date}</p>
                                <h3 className="font-bold text-sm text-neutral-900 mb-2 group-hover:text-[#7F1146] transition-colors">{ev.title}</h3>
                                <p className="text-xs text-neutral-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {ev.location}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 구분선 ── */}
            <div className="mx-auto max-w-5xl border-t border-neutral-200" />

            {/* ── 인사이트 ── */}
            <section className="py-20 px-6">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-neutral-900 mb-1">인사이트</h2>
                            <p className="text-neutral-500 text-sm">경험에서 우러나온 비즈니스 지혜</p>
                        </div>
                        <Link href="/dm/insights" className="text-sm text-[#7F1146] hover:text-[#5C0C33] font-medium flex items-center gap-1 transition-colors">
                            전체 보기 <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="border-t border-neutral-900 pt-4 space-y-0">
                        {insights.map((post, i) => (
                            <Link key={i} href="/dm/insights" className="block py-4 border-b border-neutral-200 group">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-[10px] font-semibold text-[#7F1146] bg-[#7F1146]/10 px-2 py-0.5 rounded">{post.category}</span>
                                    <span className="text-xs text-neutral-400">{post.date}</span>
                                </div>
                                <h3 className="font-bold text-sm text-neutral-900 group-hover:text-[#7F1146] transition-colors">
                                    {post.title}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 멤버 후기 ── */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-neutral-900 mb-2 text-center">멤버 이야기</h2>
                    <p className="text-neutral-500 text-center mb-12">Domo와 함께하는 분들의 이야기</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {memberTestimonials.map((member, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="w-12 h-12 bg-[#2D1B2E] rounded-full flex items-center justify-center mb-4">
                                    <span className="text-white font-bold text-sm">{member.name.charAt(0)}</span>
                                </div>
                                <p className="text-sm text-neutral-700 leading-relaxed mb-4 italic">
                                    &ldquo;{member.quote}&rdquo;
                                </p>
                                <p className="text-sm font-bold text-neutral-900">{member.name}</p>
                                <p className="text-xs text-neutral-500">{member.industry}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-20 px-6 bg-gradient-to-br from-[#2D1B2E] to-[#1E1220] text-white text-center">
                <div className="mx-auto max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4">함께 도모합시다</h2>
                    <p className="text-white/70 mb-8 leading-relaxed">
                        돈은 있는데 집에만 있기 싫으신가요?<br />
                        경험과 네트워크를 활용할 새로운 무대가 여기 있습니다.
                    </p>
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Link
                            href="/signup"
                            className="bg-[#7F1146] hover:bg-[#A3194F] text-white px-8 py-3 rounded-lg font-medium transition-colors"
                        >
                            멤버 가입하기
                        </Link>
                        <Link
                            href="/dm/about"
                            className="border border-white/30 hover:border-white/60 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                        >
                            자세히 알아보기
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
