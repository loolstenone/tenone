"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PublicHeader } from "@/features/tenone/PublicHeader";
import { PublicFooter } from "@/features/tenone/PublicFooter";
import { TenOneThemeWrapper } from "@/features/tenone/TenOneThemeWrapper";
import Image from "next/image";
import { ArrowRight, Diamond, Zap, CheckSquare, FolderKanban, Target, Users, CheckCircle2, Globe } from "lucide-react";
import { UNIVERSE_ROLE_GROUPS } from "@/lib/universe-map";

interface SimplePost {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    representImage: string;
    created_at: string;
    view_count: number;
    url?: string;
}

export default function HomePage() {
    const [nlEmail, setNlEmail] = useState('');
    const [nlSubscribed, setNlSubscribed] = useState(false);
    const [nlAgree, setNlAgree] = useState(false);
    const [nlLoading, setNlLoading] = useState(false);
    const [nlError, setNlError] = useState(false);
    const [latestWorks, setLatestWorks] = useState<SimplePost[]>([]);
    const [latestNews, setLatestNews] = useState<SimplePost[]>([]);

    useEffect(() => {
        fetch('/api/board/posts?site=tenone&board=works&limit=8&status=published')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(d => setLatestWorks(d.posts || []))
            .catch(() => console.warn('[Home] Works fetch failed — using empty state'));
        fetch('/api/newsroom/feed?sort=latest&limit=4')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(d => setLatestNews((d.posts || []).map((p: any) => ({
                id: p.id, title: p.title, excerpt: p.summary || p.excerpt || '',
                category: p.category || p.source_brand || '',
                representImage: p.thumbnail_url || p.represent_image || '',
                created_at: p.published_at || p.created_at, view_count: p.view_count || 0,
                url: p.url || `/newsroom/${p.id}`,
            }))))
            .catch(() => console.warn('[Home] Newsroom feed fetch failed — using empty state'));
    }, []);

    return (
        <TenOneThemeWrapper>
            <PublicHeader />

            {/* ── Hero ── */}
            <section className="min-h-[70vh] md:min-h-screen flex items-center px-6 lg:px-0">
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
                            <Link href="/about"
                                className="group px-8 py-3.5 text-sm tracking-wide transition-colors flex items-center gap-2"
                                style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                                Explore Universe
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/contact"
                                className="px-8 py-3.5 border text-sm tracking-wide transition-colors"
                                style={{ borderColor: "var(--tn-border)", color: "var(--tn-text)" }}>
                                Contact
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="aspect-[4/5] relative overflow-hidden" style={{ backgroundColor: "var(--tn-surface, #111)" }}>
                            <Image
                                src="/hero-banner.png"
                                alt="Ten:One™ Universe - 브랜드 네트워크 시각화"
                                fill
                                className="object-cover opacity-50"
                                priority
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                <div className="text-center">
                                    <div className="text-6xl font-black tracking-tighter" style={{ color: "var(--tn-text-muted)" }}>10:01</div>
                                    <div className="text-xs tracking-[0.3em] mt-2" style={{ color: "var(--tn-text-muted)" }}>UNIVERSE</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Crew CTA ── */}
            <section className="py-24 px-6 tn-bg-alt">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-xs tracking-[0.3em] tn-text-sub uppercase mb-4">Join the Universe</p>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight mb-3">
                        프로젝트 <span className="tn-text-sub">크루</span>를 모집합니다.
                    </h2>
                    <p className="text-base tn-text-sub mb-12 max-w-2xl mx-auto leading-relaxed">
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

                    <div className="flex justify-center">
                        <Link href="/contact?from=crew"
                            className="px-8 py-3.5 text-sm tracking-wide hover:opacity-90 transition-colors"
                            style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                            Crew 지원하기
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Works ── */}
            {latestWorks.length > 0 && (
                <section className="py-20 md:py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-end justify-between mb-10 md:mb-16">
                            <div>
                                <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Works</p>
                                <h2 className="text-xl md:text-3xl lg:text-4xl font-light">
                                    우리가 <span className="font-bold">해온 일들</span>
                                </h2>
                            </div>
                            <Link href="/works" className="hidden md:flex items-center gap-2 text-sm tn-text-sub hover:tn-text transition-colors">
                                View All <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {latestWorks.map((work) => {
                                const rawDate = (work.created_at || '').substring(0, 7);
                                const date = rawDate ? `${rawDate.split('-')[0]}년 ${rawDate.split('-')[1]}월` : '';
                                return (
                                    <Link key={work.id} href={`/works/${work.id}`} className="group block border-b tn-border pb-6 hover:border-[var(--tn-accent)] transition-colors">
                                        <div className="aspect-[3/2] tn-bg-alt mb-4 flex items-center justify-center overflow-hidden relative">
                                            {work.representImage ? (
                                                <img src={work.representImage} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <>
                                                    <span className="text-[4rem] font-bold opacity-[0.06] absolute">{work.title?.substring(0, 1)}</span>
                                                    <span className="text-xs tracking-wider uppercase tn-text-muted">{work.category}</span>
                                                </>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs tn-text-sub mb-1">{work.category}{date ? ` · ${date}` : ''}</p>
                                            <h3 className="font-semibold tn-text text-sm leading-snug">{work.title}</h3>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        <Link href="/works" className="md:hidden flex items-center justify-center gap-2 mt-12 text-sm tn-text-sub hover:tn-text">
                            모든 Works 보기 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            )}

            {/* ── Universe — 전체 브랜드 맵 (8 역할 그룹) ── */}
            <section className="py-20 md:py-32 px-6 tn-bg-alt">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-10 md:mb-16">
                        <div>
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Universe</p>
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-light">
                                지금까지 펼쳐진 <span className="font-bold">세계관</span>
                            </h2>
                        </div>
                        <Link href="/about?tab=universe" className="hidden md:flex items-center gap-2 text-sm tn-text-sub hover:tn-text transition-colors">
                            전체 보기 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {UNIVERSE_ROLE_GROUPS.map((group) => (
                            <div key={group.num} className="border tn-border overflow-hidden" style={{ backgroundColor: "var(--tn-surface)" }}>
                                {/* 그룹 헤더 */}
                                <div className="flex items-center gap-3 px-5 py-3 border-b tn-border" style={{ borderLeftWidth: 3, borderLeftColor: group.color }}>
                                    <span className="text-[11px] font-mono" style={{ color: group.color }}>{group.num}</span>
                                    <span className="text-xs font-medium tn-text-sub">{group.role}</span>
                                </div>
                                {/* 브랜드 카드 */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px" style={{ backgroundColor: "var(--tn-border)" }}>
                                    {group.brands.map((brand) => {
                                        const inner = (
                                            <div style={{ backgroundColor: "var(--tn-surface)" }} className="h-full p-4 hover:opacity-80 transition-opacity">
                                                <div className="flex items-start gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: group.color }} />
                                                    <div>
                                                        <p className="text-sm font-bold tn-text leading-tight">{brand.name}</p>
                                                        {'kr' in brand && <p className="text-[10px] tn-text-muted">{(brand as any).kr}</p>}
                                                        <p className="text-[11px] tn-text-sub mt-1 leading-snug">{brand.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                        return 'href' in brand ? (
                                            <Link key={brand.name} href={(brand as any).href}>{inner}</Link>
                                        ) : (
                                            <div key={brand.name}>{inner}</div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Universe 순환 플로우 */}
                    <div className="mt-8 px-5 py-4 border tn-border text-[11px] tn-text-sub leading-relaxed font-mono" style={{ backgroundColor: "var(--tn-surface)" }}>
                        <span style={{ color: "#5B8FB9" }}>Mindle</span> 트렌드 발견 →{" "}
                        <span style={{ color: "#BA7517" }}>SmarComm</span> 전략 수립 →{" "}
                        <span style={{ color: "#BA7517" }}>RooK</span> 크리에이티브 실행 → 성과 환류 → 다음 트렌드 ↻
                        <span className="mx-4 opacity-30">|</span>
                        <span style={{ color: "#E8845C" }}>MADLeague</span> 모은다 →{" "}
                        <span style={{ color: "#D85A30" }}>HeRo</span> 키운다 →{" "}
                        <span style={{ color: "#E8845C" }}>Badak</span> 연결한다 → 멘토로 돌아온다 ↻
                    </div>

                    <Link href="/about?tab=brands" className="md:hidden flex items-center justify-center gap-2 mt-6 text-sm tn-text-sub hover:tn-text">
                        전체 브랜드 보기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* ── Core Values ── */}
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

            {/* ── Latest News ── */}
            <section className="py-20 md:py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-end justify-between mb-10 md:mb-16">
                        <div>
                            <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Latest</p>
                            <h2 className="text-xl md:text-3xl lg:text-4xl font-light">
                                새로운 <span className="font-bold">소식</span>
                            </h2>
                        </div>
                        <Link href="/newsroom" className="hidden md:flex items-center gap-2 text-sm tn-text-sub hover:tn-text transition-colors">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {latestNews.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {latestNews.map((news) => {
                                const rawDate = (news.created_at || '').substring(0, 10);
                                return (
                                    <Link key={news.id} href={news.url || `/newsroom/${news.id}`} className="group block">
                                        <div className="aspect-[4/3] bg-[var(--tn-bg-alt)] mb-4 flex items-center justify-center overflow-hidden">
                                            {news.representImage ? (
                                                <img src={news.representImage} alt={news.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <p className="text-xs tn-text-sub text-center px-4">{news.category || '뉴스'}</p>
                                            )}
                                        </div>
                                        <p className="text-xs tn-text-sub">{rawDate}</p>
                                        <h3 className="font-semibold tn-text mt-1 group-hover:underline leading-snug">{news.title}</h3>
                                        <p className="text-sm tn-text-sub mt-1 line-clamp-2">{news.excerpt}</p>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm tn-text-sub text-center py-12">준비 중입니다.</p>
                    )}
                </div>
            </section>

            {/* ── CTA — Are you ready ── */}
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
                            {/* Join the Universe — Primary (더 강조) */}
                            <Link href="/contact"
                                className="px-8 py-3.5 text-sm tracking-wide font-semibold transition-opacity hover:opacity-90"
                                style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                                Join the Universe
                            </Link>
                            {/* Explore — Secondary */}
                            <Link href="/about?tab=universe"
                                className="px-8 py-3.5 border border-neutral-600 tn-text-muted text-sm tracking-wide hover:border-white hover:text-white transition-colors">
                                Explore
                            </Link>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <div className="aspect-video bg-[var(--tn-bg-alt)] flex items-center justify-center overflow-hidden">
                            <div className="text-center">
                                <p className="text-4xl font-light tracking-tight" style={{ color: "var(--tn-text-sub)" }}>Ten:One™</p>
                                <p className="text-xs mt-2" style={{ color: "var(--tn-text-muted)" }}>Universe of Possibilities</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Newsletter ── */}
            <section className="py-20 px-6 border-t tn-border">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-xs tracking-[0.3em] tn-text-sub uppercase mb-3">Newsletter</p>
                    <h2 className="text-2xl font-bold tracking-tight mb-3">
                        Ten:One™ Universe의 이야기를 받아보세요
                    </h2>
                    <p className="text-sm tn-text-sub mb-8">
                        프로젝트 소식, 크루 이야기, 업계 인사이트를 보내드립니다.
                    </p>
                    {nlSubscribed ? (
                        <div className="py-4">
                            <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                            <p className="text-sm font-bold mb-1">구독이 완료되었습니다!</p>
                            <p className="text-xs tn-text-sub">{nlEmail}로 뉴스레터를 보내드립니다.</p>
                        </div>
                    ) : (
                        <>
                            <form onSubmit={async e => {
                                    e.preventDefault();
                                    if (!nlEmail.trim() || !nlAgree || nlLoading) return;
                                    setNlLoading(true);
                                    setNlError(false);
                                    try {
                                        const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: nlEmail.trim(), source: 'tenone-main' }) });
                                        if (res.ok) setNlSubscribed(true);
                                        else setNlError(true);
                                    } catch { setNlError(true); }
                                    finally { setNlLoading(false); }
                                }}
                                className="flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto">
                                <input type="email" value={nlEmail} onChange={e => setNlEmail(e.target.value)}
                                    placeholder="이메일 주소를 입력하세요"
                                    required
                                    className="flex-1 w-full px-4 py-3 text-sm border tn-border focus:outline-none focus:border-neutral-400 placeholder:tn-text-muted" />
                                <button type="submit" disabled={!nlEmail.trim() || !nlAgree || nlLoading}
                                    className="w-full sm:w-auto px-8 py-3 text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-30 shrink-0"
                                    style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                                    {nlLoading ? '처리 중...' : '구독하기'}
                                </button>
                            </form>
                            {nlError && <p className="text-xs text-red-500 mt-2">구독 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>}
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <button type="button" onClick={() => setNlAgree(!nlAgree)}
                                    className={`w-6 h-6 min-w-[24px] border rounded flex items-center justify-center shrink-0 transition-colors ${
                                        nlAgree ? 'bg-[var(--tn-accent)] border-[var(--tn-accent)]' : 'border-[var(--tn-border)] tn-surface'
                                    }`}>
                                    {nlAgree && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </button>
                                <p className="text-xs tn-text-sub">이메일 수집 및 뉴스레터 수신에 동의합니다</p>
                            </div>
                        </>
                    )}
                    <p className="text-[10px] tn-text-muted mt-3"><Link href="/newsletter" className="underline hover:tn-text-sub">지난 뉴스레터 보기</Link></p>
                </div>
            </section>

            <PublicFooter />
        </TenOneThemeWrapper>
    );
}
