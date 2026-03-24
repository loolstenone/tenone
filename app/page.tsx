"use client";

import { useState } from "react";
import Link from "next/link";
import { useBums } from "@/lib/bums-context";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { TenOneThemeWrapper } from "@/components/TenOneThemeWrapper";
import Image from "next/image";
import { ArrowRight, ExternalLink, Diamond, Zap, CheckSquare, FolderKanban, Target, Users, CheckCircle2 } from "lucide-react";

export default function HomePage() {
    const { getPublishedByBoardSlug } = useBums();
    const [nlEmail, setNlEmail] = useState('');
    const [nlSubscribed, setNlSubscribed] = useState(false);
    const [nlAgree, setNlAgree] = useState(false);

    // DB 데이터 (boardPosts state 변경 시 자동 재계산)
    const dbWorks = getPublishedByBoardSlug('tenone', 'works', 8);
    const dbNews = getPublishedByBoardSlug('tenone', 'newsroom', 4);
    const latestWorks = dbWorks;
    const latestNews = dbNews;

    return (
        <TenOneThemeWrapper>
            <PublicHeader />

            {/* Hero — 좌측 정렬, 비대칭 */}
            <section className="min-h-screen flex items-center px-6 lg:px-0">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
                    <div className="lg:pl-8">
                        <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-6">
                            Value Connector
                        </p>
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-light tracking-tight leading-[1.1]">
                            가치로 연결된
                            <br />
                            <span className="font-bold">거대한 세계관</span>을
                            <br />
                            만들기로 했다.
                        </h1>
                        <p className="mt-8 text-base tn-text-sub leading-relaxed">
                            기업과 사회의 문제를 해결하는 다양한 프로젝트를 합니다.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                            <Link href="/about?tab=universe"
                                className="group px-8 py-3.5 text-sm tracking-wide transition-colors flex items-center gap-2"
                                style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                                Explore Universe
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/about"
                                className="px-8 py-3.5 border text-sm tracking-wide transition-colors"
                                style={{ borderColor: "var(--tn-border)", color: "var(--tn-text)" }}>
                                Our Philosophy
                            </Link>
                            <Link href="/contact"
                                className="px-8 py-3.5 border text-sm tracking-wide transition-colors"
                                style={{ borderColor: "var(--tn-border)", color: "var(--tn-text)" }}>
                                Contact
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="aspect-[4/5] relative overflow-hidden">
                            <Image
                                src="/hero-banner.png"
                                alt="Ten:One™ Universe - 브랜드 네트워크 시각화"
                                fill
                                className="object-cover opacity-50"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Crew CTA — 크루 모집 */}
            <section className="py-24 px-6 tn-bg-alt">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-xs tracking-[0.3em] tn-text-sub uppercase mb-4">Join the Universe</p>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight mb-3">
                        프로젝트 <span className="tn-text-sub">크루</span>를 모집합니다.
                    </h2>
                    <p className="text-base tn-text-sub mb-12 max-w-2xl mx-auto leading-relaxed">
                        Ten:One™ Crew가 되면 세계관 안에서 함께 성장합니다.<br />
                        기획자, 마케터, 디자이너, 개발자 — 당신의 재능이 필요합니다.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="tn-surface border tn-border p-6 text-left">
                            <FolderKanban className="h-5 w-5 tn-text-sub mb-3" />
                            <h3 className="text-sm font-bold mb-2">실전 프로젝트 참여</h3>
                            <p className="text-xs tn-text-sub leading-relaxed">
                                기업과 지자체 등 실전 프로젝트에 직접 참여합니다.
                                포트폴리오가 아닌 실전 경험을 쌓습니다.
                            </p>
                        </div>
                        <div className="tn-surface border tn-border p-6 text-left">
                            <Target className="h-5 w-5 tn-text-sub mb-3" />
                            <h3 className="text-sm font-bold mb-2">HeRo 역량 진단 & 성장</h3>
                            <p className="text-xs tn-text-sub leading-relaxed">
                                HIT 통합검사로 나의 강점과 적성을 발견하고,
                                맞춤 성장 로드맵과 멘토 매칭을 통해 커리어를 설계합니다.
                            </p>
                        </div>
                        <div className="tn-surface border tn-border p-6 text-left">
                            <Users className="h-5 w-5 tn-text-sub mb-3" />
                            <h3 className="text-sm font-bold mb-2">업계 네트워크 연결</h3>
                            <p className="text-xs tn-text-sub leading-relaxed">
                                현업자 네트워크, 기업 파트너와 연결됩니다.
                                약한 연결이 만들어내는 강력한 기회를 경험하세요.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Link href="/CrewInvite" className="px-8 py-3.5 text-sm tracking-wide hover:opacity-90 transition-colors"
                            style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                            Crew 지원하기
                        </Link>
                        <Link href="/about" className="px-8 py-3.5 border border-[var(--tn-border)] text-[var(--tn-text)] text-sm tracking-wide hover:border-[var(--tn-accent)] hover:tn-text transition-colors tn-surface">
                            더 알아보기
                        </Link>
                    </div>
                </div>
            </section>

            {/* Core Values — 다크 섹션 */}
            <section className="tn-card py-20 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">
                        Core Value
                    </p>
                    <h2 className="text-xl md:text-3xl lg:text-4xl font-light">
                        변하지 않을 가치에 집중하여<br />
                        <span className="font-bold">빠르게 가치를 창출한다</span>
                    </h2>

                    <div className="mt-20 grid md:grid-cols-3 gap-px bg-[var(--tn-bg-alt)]">
                        {[
                            { num: "01", icon: <Diamond className="h-6 w-6 tn-text-sub" />, title: "본질", en: "Essence", desc: "변하지 않을 가치에 집요하게 집중한다. 트렌드에 흔들리지 않는 근본적인 가치를 찾는다." },
                            { num: "02", icon: <Zap className="h-6 w-6 tn-text-sub" />, title: "속도", en: "Speed", desc: "옳은 방향을 계속 확인하며 빠르게 전진한다. 완벽을 기다리지 않고 움직인다." },
                            { num: "03", icon: <CheckSquare className="h-6 w-6 tn-text-sub" />, title: "이행", en: "Carry Out", desc: "본질이 확인된다면 바로 실행에 옮긴다. 실현되지 않으면 아이디어가 아니다." },
                        ].map((val) => (
                            <div key={val.num} className="bg-[var(--tn-surface)] p-10 md:p-12">
                                <span className="text-sm text-[var(--tn-text-sub)] font-mono">{val.num}</span>
                                <h3 className="text-xl md:text-3xl font-bold mt-4 flex items-center gap-3">{val.icon}{val.title}</h3>
                                <p className="text-sm tn-text-sub mt-1">{val.en}</p>
                                <p className="text-sm tn-text-sub mt-6 leading-relaxed">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Works — 화이트 섹션 */}
            {latestWorks.length > 0 && <section className="py-20 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-10 md:mb-16">
                        <div>
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">
                                Works
                            </p>
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-light">
                                우리가 <span className="font-bold">해온 일들</span>
                            </h2>
                        </div>
                        <Link href="/works" className="hidden md:flex items-center gap-2 text-sm tn-text-sub hover:tn-text transition-colors">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {latestWorks.map((work: Record<string, unknown>) => {
                            const title = (work.title as string) || '';
                            const image = (work.image as string) || '';
                            const category = (work.category as string) || (work.categoryId as string) || '';
                            const rawDate = ((work.date as string) || (work.publishedAt as string) || (work.createdAt as string) || '').substring(0, 7);
                            const date = rawDate ? `${rawDate.split('-')[0]}년 ${rawDate.split('-')[1]}월` : '';
                            const extLink = work.externalLink as string | undefined;
                            return (
                                <div key={work.id as string} className="group block border-b tn-border pb-6 hover:border-[var(--tn-accent)] transition-colors">
                                    <div className="aspect-[3/2] tn-bg-alt mb-4 flex items-center justify-center overflow-hidden">
                                        {image && (image.startsWith('http') || image.startsWith('data:')) ? (
                                            <img src={image} alt={title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-bold tn-text-muted">{category || title?.substring(0, 2)}</span>
                                        )}
                                    </div>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs tn-text-sub mb-1">{category}{date ? ` · ${date}` : ''}</p>
                                            <h3 className="font-semibold tn-text text-sm leading-snug">{title}</h3>
                                        </div>
                                        {extLink && (
                                            <a href={extLink} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-3.5 w-3.5 tn-text-muted group-hover:tn-text transition-colors mt-1" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Link href="/works" className="md:hidden flex items-center justify-center gap-2 mt-12 text-sm tn-text-sub hover:tn-text">
                        모든 Works 보기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>}

            {/* Latest — 이미지 카드, 라이트 그레이 배경 */}
            {latestNews.length > 0 && <section className="py-20 md:py-32 px-6 tn-bg-alt">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-10 md:mb-16">
                        <div>
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">
                                Latest
                            </p>
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-light">
                                새로운 <span className="font-bold">소식</span>
                            </h2>
                        </div>
                        <Link href="/newsroom" className="hidden md:flex items-center gap-2 text-sm tn-text-sub hover:tn-text transition-colors">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {latestNews.map((news: Record<string, unknown>) => {
                            const title = (news.title as string) || '';
                            const image = (news.image as string) || '';
                            const date = (news.date as string) || (news.publishedAt as string) || (news.createdAt as string) || '';
                            const summary = (news.summary as string) || '';
                            return (
                                <Link key={news.id as string} href="/newsroom" className="group block">
                                    <div className="aspect-[4/3] bg-[var(--tn-bg-alt)] mb-4 flex items-center justify-center overflow-hidden">
                                        {image && (image.startsWith('http') || image.startsWith('data:')) ? (
                                            <img src={image} alt={title} className="w-full h-full object-cover" />
                                        ) : (
                                            <p className="text-xs tn-text-sub text-center px-4">[{image || '이미지'}]</p>
                                        )}
                                    </div>
                                    <p className="text-xs tn-text-sub">{date}</p>
                                    <h3 className="font-semibold tn-text mt-1 group-hover:underline">{title}</h3>
                                    <p className="text-sm tn-text-sub mt-1 line-clamp-1">{summary}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>}

            {/* CTA — 다크 섹션 */}
            <section className="tn-card py-20 md:py-32 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-light leading-tight">
                            Are you ready to build<br />
                            <span className="font-bold">the Next Universe?</span>
                        </h2>
                        <p className="mt-6 tn-text-sub leading-relaxed">
                            당신의 작은 세계가 연결되어<br />
                            하나의 거대한 세계관을 만듭니다.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-4">
                            <Link href="/contact" className="px-8 py-3.5 tn-surface tn-text text-sm tracking-wide hover:bg-neutral-100 transition-colors">
                                Join the Universe
                            </Link>
                            <Link href="/about?tab=universe" className="px-8 py-3.5 border border-neutral-600 tn-text-muted text-sm tracking-wide hover:border-white hover:text-white transition-colors">
                                Explore
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="aspect-video bg-[var(--tn-bg-alt)] flex items-center justify-center">
                            <p className="text-sm text-[var(--tn-text-sub)] text-center px-12 leading-relaxed">
                                [CTA 비주얼]<br />
                                팀 활동 사진, 네트워킹 이벤트,<br />
                                또는 브랜드 콜라주 이미지<br /><br />
                                <span className="text-xs text-[var(--tn-text)]">권장: Badak 밋업, MAD League 활동 등<br />실제 활동 사진</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-20 px-6 border-t tn-border">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-xs tracking-[0.3em] tn-text-sub uppercase mb-3">Newsletter</p>
                    <h2 className="text-2xl font-bold tracking-tight mb-3">
                        Ten:One™ Universe의 이야기를 받아보세요
                    </h2>
                    <p className="text-sm tn-text-sub mb-8">
                        프로젝트 소식, 크루 이야기, 업계 인사이트를 격주로 보내드립니다.
                    </p>
                    {nlSubscribed ? (
                        <div className="py-4">
                            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                            <p className="text-sm font-bold mb-1">구독이 완료되었습니다!</p>
                            <p className="text-xs tn-text-sub">{nlEmail}로 뉴스레터를 보내드립니다.</p>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={e => { e.preventDefault(); if (nlEmail.trim() && nlAgree) setNlSubscribed(true); }}
                                className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
                                <input type="email" value={nlEmail} onChange={e => setNlEmail(e.target.value)}
                                    placeholder="이메일 주소를 입력하세요"
                                    required
                                    className="flex-1 w-full px-4 py-3 text-sm border tn-border focus:outline-none focus:border-neutral-400 placeholder:tn-text-muted" />
                                <button type="submit" disabled={!nlEmail.trim() || !nlAgree}
                                    className="w-full sm:w-auto px-8 py-3 text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-30 shrink-0"
                                    style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                                    구독하기
                                </button>
                            </form>
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <button type="button" onClick={() => setNlAgree(!nlAgree)}
                                    className={`w-3.5 h-3.5 border rounded flex items-center justify-center shrink-0 transition-colors ${
                                        nlAgree ? 'bg-[var(--tn-accent)] border-[var(--tn-accent)]' : 'border-[var(--tn-border)] tn-surface'
                                    }`}>
                                    {nlAgree && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </button>
                                <p className="text-[10px] tn-text-sub">이메일 수집 및 뉴스레터 수신에 동의합니다</p>
                            </div>
                        </>
                    )}
                    <p className="text-[10px] tn-text-muted mt-3">격주 발행 · 언제든 구독 취소 가능 · <Link href="/newsletter" className="underline hover:tn-text-sub">지난 뉴스레터 보기</Link></p>
                </div>
            </section>

            <PublicFooter />
        </TenOneThemeWrapper>
    );
}
