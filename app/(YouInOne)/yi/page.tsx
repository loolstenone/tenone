"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Lightbulb, Target, Users, ChevronRight } from "lucide-react";
import { useBums } from "@/lib/bums-context";

const typedTexts = [
    "사회 문제를 해결합니다",
    "기업의 성장을 돕습니다",
    "아이디어를 현실로 만듭니다",
    "연대의 힘을 믿습니다",
];

function useTypedText(texts: string[], speed = 80, pause = 2000) {
    const [display, setDisplay] = useState("");
    const [textIdx, setTextIdx] = useState(0);
    const [charIdx, setCharIdx] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const current = texts[textIdx];
        if (!deleting && charIdx < current.length) {
            const t = setTimeout(() => setCharIdx((c) => c + 1), speed);
            return () => clearTimeout(t);
        }
        if (!deleting && charIdx === current.length) {
            const t = setTimeout(() => setDeleting(true), pause);
            return () => clearTimeout(t);
        }
        if (deleting && charIdx > 0) {
            const t = setTimeout(() => setCharIdx((c) => c - 1), speed / 2);
            return () => clearTimeout(t);
        }
        if (deleting && charIdx === 0) {
            setDeleting(false);
            setTextIdx((i) => (i + 1) % texts.length);
        }
    }, [charIdx, deleting, textIdx, texts, speed, pause]);

    useEffect(() => {
        setDisplay(texts[textIdx].slice(0, charIdx));
    }, [charIdx, textIdx, texts]);

    return display;
}

export default function YouInOneHomePage() {
    const typed = useTypedText(typedTexts);
    const { getPostsByBoard } = useBums();

    const portfolios = getPostsByBoard("board-yio-portfolio")
        .filter((p) => p.status === "published")
        .slice(0, 3);
    const notices = getPostsByBoard("board-yio-notice")
        .filter((p) => p.status === "published")
        .slice(0, 3);

    return (
        <div>
            {/* Hero */}
            <section className="relative bg-[#171717] text-white min-h-[90vh] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E53935]/10 to-transparent" />
                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <p className="text-[#E53935] font-bold text-sm tracking-widest uppercase mb-6">
                        Project Group
                    </p>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
                        We are Project Group<br />
                        to solve <span className="text-[#E53935]">Problems</span>
                    </h1>
                    <div className="h-10 flex items-center justify-center mb-8">
                        <p className="text-lg sm:text-xl text-neutral-400">
                            {typed}
                            <span className="animate-pulse text-[#E53935]">|</span>
                        </p>
                    </div>
                    <p className="text-neutral-400 mb-10 leading-relaxed max-w-2xl mx-auto">
                        아이디어와 전략으로 기업과 사회의 문제를 해결합니다.<br />
                        소규모 기업 연합 얼라이언스로 연대하여 더 큰 가치를 만듭니다.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/yi/about"
                            className="px-8 py-3 bg-[#E53935] text-white font-semibold hover:bg-[#C62828] transition-colors rounded"
                        >
                            더 알아보기
                        </Link>
                        <Link
                            href="/yi/alliance"
                            className="px-8 py-3 border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors rounded"
                        >
                            얼라이언스 참여
                        </Link>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-xl md:text-3xl font-bold text-[#171717] mb-3">Idea + Strategy</h2>
                        <p className="text-neutral-500">문제 해결을 위한 유인원의 핵심 접근법</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Lightbulb,
                                title: "Idea",
                                subtitle: "사회문제 해결",
                                desc: "사회와 기업이 직면한 문제를 창의적인 아이디어로 정의하고, 실현 가능한 솔루션으로 발전시킵니다.",
                                href: "/yi/whatwedo",
                            },
                            {
                                icon: Target,
                                title: "Strategy",
                                subtitle: "기업 얼라이언스",
                                desc: "소규모 기업들이 연합하여 서로의 강점을 활용합니다. 혼자서는 어려운 프로젝트도 함께라면 가능합니다.",
                                href: "/yi/alliance",
                            },
                            {
                                icon: Users,
                                title: "People",
                                subtitle: "전문가 네트워크",
                                desc: "마케팅, 브랜딩, 콘텐츠, 교육 분야의 전문가들이 프로젝트에 최적화된 팀을 구성합니다.",
                                href: "/yi/people",
                            },
                        ].map((card) => (
                            <Link
                                key={card.title}
                                href={card.href}
                                className="group p-8 bg-white border border-neutral-200 rounded-xl hover:shadow-lg hover:border-[#E53935]/30 transition-all"
                            >
                                <div className="inline-flex p-3 rounded-lg mb-5 bg-neutral-50 text-[#171717] group-hover:bg-[#E53935]/10 group-hover:text-[#E53935] transition-colors">
                                    <card.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-[#171717] mb-1 group-hover:text-[#E53935] transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-xs text-[#E53935] font-medium mb-3">{card.subtitle}</p>
                                <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                                    {card.desc}
                                </p>
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-[#E53935]">
                                    자세히 보기 <ArrowRight className="h-4 w-4" />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Portfolio */}
            <section className="py-16 px-6 bg-neutral-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-[#171717]">프로젝트</h2>
                        <Link href="/yi/portfolio" className="text-sm text-[#E53935] hover:underline flex items-center gap-1">
                            전체보기 <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {portfolios.length > 0 ? (
                            portfolios.map((post) => (
                                <div
                                    key={post.id}
                                    className="group bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#E53935]/30 transition-all"
                                >
                                    <div className="aspect-[16/10] bg-gradient-to-br from-[#171717] to-neutral-700 flex items-center justify-center">
                                        <span className="text-xl md:text-3xl font-bold text-white/10">YIO</span>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-[#171717] mb-2 group-hover:text-[#E53935] transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 line-clamp-2">{post.summary}</p>
                                        <div className="flex gap-2 mt-3">
                                            {post.tags?.slice(0, 2).map((tag) => (
                                                <span key={tag} className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-neutral-400 col-span-3">등록된 프로젝트가 없습니다.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Notice */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-[#171717]">공지사항</h2>
                    </div>
                    {notices.length > 0 ? (
                        <div className="space-y-3">
                            {notices.map((post) => (
                                <div
                                    key={post.id}
                                    className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg hover:border-[#E53935]/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {post.isPinned && (
                                            <span className="px-2 py-0.5 bg-[#E53935] text-white text-[10px] font-bold rounded">
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

            {/* CTA */}
            <section className="py-20 px-6 bg-[#171717] text-white text-center">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-xl md:text-3xl font-bold mb-4">
                        유인원과 함께<br />
                        세상에 질문을 던져보세요
                    </h2>
                    <p className="text-neutral-400 mb-8 leading-relaxed">
                        아이디어가 있다면 전략은 우리가 만들어 드립니다.<br />
                        기업과 사회의 문제, 함께 해결합시다.
                    </p>
                    <Link
                        href="/yi/contact"
                        className="inline-block px-10 py-3 bg-[#E53935] text-white font-semibold hover:bg-[#C62828] transition-colors rounded"
                    >
                        문의하기
                    </Link>
                </div>
            </section>
        </div>
    );
}
