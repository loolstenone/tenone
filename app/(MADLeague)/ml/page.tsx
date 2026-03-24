"use client";

import Link from "next/link";
import { useBums } from "@/lib/bums-context";
import { ArrowRight, Target, Rocket, Award, ChevronRight, HelpCircle } from "lucide-react";

export default function MadLeagueHomePage() {
    const { getPostsByBoard } = useBums();

    const notices = getPostsByBoard("board-mad-notice")
        .filter((p) => p.status === "published")
        .slice(0, 3);
    const gallery = getPostsByBoard("board-mad-gallery")
        .filter((p) => p.status === "published")
        .slice(0, 4);
    const faqs = getPostsByBoard("board-mad-faq")
        .filter((p) => p.status === "published")
        .slice(0, 3);

    return (
        <div>
            {/* Hero */}
            <section className="relative bg-[#212121] text-white min-h-[90vh] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#D32F2F]/20 to-transparent" />
                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <p className="text-[#D32F2F] font-bold text-sm tracking-widest uppercase mb-4">
                        Match &middot; Act &middot; Develop
                    </p>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                        실전 만큼 강력한<br />교육이 있을까?
                    </h1>
                    <p className="text-lg sm:text-xl text-neutral-300 mb-10 leading-relaxed">
                        경쟁하고, 행동하고, 성장하라.<br />
                        경쟁을 통한 성장 플랫폼 <span className="text-[#D32F2F] font-bold">MAD League</span>
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/ml/about"
                            className="px-8 py-3 bg-[#D32F2F] text-white font-semibold hover:bg-[#B71C1C] transition-colors rounded"
                        >
                            더 알아보기
                        </Link>
                        <Link
                            href="/signup"
                            className="px-8 py-3 border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors rounded"
                        >
                            지금 합류하기
                        </Link>
                    </div>
                </div>
            </section>

            {/* 프로그램 소개 */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-xl md:text-3xl font-bold text-neutral-900 mb-3">핵심 프로그램</h2>
                        <p className="text-neutral-500">MAD League의 핵심 성장 프로그램을 소개합니다</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Target,
                                title: "경쟁 PT",
                                desc: "실제 기업 과제를 팀 단위로 분석하고 경쟁 프레젠테이션을 통해 실전 마케팅 역량을 키웁니다.",
                                href: "/ml/pt",
                                color: "bg-red-50 text-[#D32F2F]",
                            },
                            {
                                icon: Rocket,
                                title: "프로그램",
                                desc: "마케팅 부트캠프, 브랜딩 워크숍 등 다양한 실전 프로그램으로 전문성을 강화합니다.",
                                href: "/ml/program",
                                color: "bg-orange-50 text-orange-600",
                            },
                            {
                                icon: Award,
                                title: "히어로",
                                desc: "HeRo 프로그램을 통해 잠재력 있는 인재를 발굴하고 성장을 지원합니다.",
                                href: "/ml/hero",
                                color: "bg-amber-50 text-amber-600",
                            },
                        ].map((card) => (
                            <Link
                                key={card.title}
                                href={card.href}
                                className="group p-8 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-[#D32F2F]/30 transition-all"
                            >
                                <div className={`inline-flex p-3 rounded-lg mb-5 ${card.color}`}>
                                    <card.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-[#D32F2F] transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                                    {card.desc}
                                </p>
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-[#D32F2F]">
                                    자세히 보기 <ArrowRight className="h-4 w-4" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 최신 공지사항 */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-neutral-900">공지사항</h2>
                        <Link href="/ml/about" className="text-sm text-[#D32F2F] hover:underline flex items-center gap-1">
                            전체보기 <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                    {notices.length > 0 ? (
                        <div className="space-y-3">
                            {notices.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg hover:border-[#D32F2F]/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {post.isPinned && (
                                            <span className="px-2 py-0.5 bg-[#D32F2F] text-white text-[10px] font-bold rounded">
                                                필독
                                            </span>
                                        )}
                                        <span className="text-sm font-medium text-neutral-800">{post.title}</span>
                                    </div>
                                    <span className="text-xs text-neutral-400 shrink-0 ml-4">
                                        {post.publishedAt || post.createdAt}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-400">등록된 공지사항이 없습니다.</p>
                    )}
                </div>
            </section>

            {/* 활동 갤러리 */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-neutral-900">활동 갤러리</h2>
                        <Link href="/ml/madzine" className="text-sm text-[#D32F2F] hover:underline flex items-center gap-1">
                            전체보기 <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {gallery.length > 0 ? (
                            gallery.map((post) => (
                                <div
                                    key={post.id}
                                    className="group bg-neutral-100 rounded-xl overflow-hidden aspect-[4/3] relative"
                                >
                                    {post.image ? (
                                        <div className="w-full h-full bg-neutral-200" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[#D32F2F]/10 to-neutral-200 flex items-center justify-center">
                                            <span className="text-4xl font-bold text-[#D32F2F]/20">MAD</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <p className="text-white text-sm font-medium">{post.title}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-neutral-400 col-span-4">갤러리가 비어 있습니다.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* FAQ 미리보기 */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-neutral-900">자주 묻는 질문</h2>
                    </div>
                    {faqs.length > 0 ? (
                        <div className="space-y-4">
                            {faqs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="p-5 bg-white border border-neutral-200 rounded-lg"
                                >
                                    <div className="flex items-start gap-3">
                                        <HelpCircle className="h-5 w-5 text-[#D32F2F] shrink-0 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-neutral-900 text-sm mb-2">
                                                {faq.title}
                                            </h3>
                                            {faq.answer && (
                                                <p className="text-sm text-neutral-500 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-neutral-400">FAQ가 비어 있습니다.</p>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-[#212121] text-white text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-xl md:text-3xl font-bold mb-4">지금 합류하세요</h2>
                    <p className="text-neutral-400 mb-8 leading-relaxed">
                        MAD League와 함께 실전 경쟁을 통해 성장하세요.<br />
                        전국의 열정 있는 대학생들이 당신을 기다리고 있습니다.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-block px-10 py-3 bg-[#D32F2F] text-white font-semibold hover:bg-[#B71C1C] transition-colors rounded"
                    >
                        가입하기
                    </Link>
                </div>
            </section>
        </div>
    );
}
