"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PublicHeader } from "@/features/tenone/PublicHeader";
import { PublicFooter } from "@/features/tenone/PublicFooter";
import { TenOneThemeWrapper } from "@/features/tenone/TenOneThemeWrapper";
import { CaptchaWidget, useCaptcha } from "@/components/CaptchaWidget";

interface SimplePost {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    representImage: string;
    createdAt: string;
    view_count: number;
    url?: string;
}

export default function HomePage() {
    const [nlEmail, setNlEmail] = useState('');
    const [nlSubscribed, setNlSubscribed] = useState(false);
    const [nlAgree, setNlAgree] = useState(false);
    const [nlLoading, setNlLoading] = useState(false);
    const [nlError, setNlError] = useState(false);
    const nlCaptcha = useCaptcha();
    const [latestWorks, setLatestWorks] = useState<SimplePost[]>([]);

    useEffect(() => {
        fetch('/api/board/posts?site=tenone&board=works&limit=8&status=published')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(d => setLatestWorks(d.posts || []))
            .catch(() => console.warn('[Home] Works fetch failed — using empty state'));
    }, []);

    return (
        <TenOneThemeWrapper>
            <PublicHeader />

            {/* ── 첫 화면 = 문장 한 줄 + 최근 Works (tenone-ui 4.1: 설명이 아니라 내용) ── */}
            <section className="px-6 pt-16 pb-16 md:pt-24">
                <div className="max-w-[1080px] mx-auto">
                    <h1 className="text-[28px] leading-9 md:text-[40px] md:leading-[48px] font-bold">
                        가치로 연결된 거대한 세계관을 만들기로 했다.
                    </h1>
                    <p className="mt-4 text-sm leading-5 tn-text-sub">
                        Ten:One™은 기업과 사회의 문제를 해결하는 프로젝트를 기획하고 운영합니다.{" "}
                        <Link href="/about" className="underline">소개</Link>
                    </p>
                </div>
            </section>

            <section className="px-6 pb-16">
                <div className="max-w-[1080px] mx-auto">
                    <div className="flex items-baseline justify-between border-b tn-border pb-2">
                        <h2 className="text-lg leading-[26px] font-bold">최근 Works</h2>
                        <Link href="/works" className="text-sm underline tn-text-sub">전체 보기</Link>
                    </div>
                    {latestWorks.length === 0 ? (
                        <p className="py-6 text-sm tn-text-sub">등록된 Works가 아직 없습니다. 지난 작업은 <Link href="/history" className="underline">연혁</Link>에서 볼 수 있습니다.</p>
                    ) : (
                        <ul>
                            {latestWorks.map((work) => {
                                const ym = (work.createdAt || '').substring(0, 7).replace('-', '.');
                                return (
                                    <li key={work.id} className="border-b tn-border">
                                        <Link href={`/works/${work.id}`} className="flex gap-4 py-4 text-sm leading-5 hover:opacity-70 transition-opacity">
                                            <span className="w-16 shrink-0 tn-text-sub">{ym}</span>
                                            <span className="font-bold">{work.title}</span>
                                            {work.category && <span className="tn-text-sub">{work.category}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </section>

            {/* ── Newsletter ── */}
            <section className="px-6 pb-16">
                <div className="max-w-[1080px] mx-auto">
                    <h2 className="text-lg leading-[26px] font-bold border-b tn-border pb-2">뉴스레터</h2>
                    <p className="text-sm leading-5 tn-text-sub mt-4 mb-4">
                        프로젝트 소식과 크루 이야기를 메일로 보냅니다.
                    </p>
                    {nlSubscribed ? (
                        <p className="text-sm leading-5"><span className="font-bold">구독했습니다.</span> 다음 호부터 {nlEmail}로 보냅니다.</p>
                    ) : (
                        <>
                            <form onSubmit={async e => {
                                    e.preventDefault();
                                    if (!nlEmail.trim() || !nlAgree || nlLoading || !nlCaptcha.ready) return;
                                    setNlLoading(true);
                                    setNlError(false);
                                    try {
                                        const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: nlEmail.trim(), source: 'tenone-main', captchaToken: nlCaptcha.token }) });
                                        nlCaptcha.reset();
                                        if (res.ok) setNlSubscribed(true);
                                        else setNlError(true);
                                    } catch { setNlError(true); }
                                    finally { setNlLoading(false); }
                                }}
                                className="flex flex-col sm:flex-row items-center gap-2 max-w-lg">
                                <input type="email" value={nlEmail} onChange={e => setNlEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    className="flex-1 w-full px-4 py-2 text-sm rounded-xs border tn-border focus:outline-none focus:border-[var(--tn-text)] placeholder:tn-text-muted" />
                                <button type="submit" disabled={!nlEmail.trim() || !nlAgree || nlLoading || !nlCaptcha.ready}
                                    className="w-full sm:w-auto px-6 py-2 text-sm font-bold rounded-xs hover:opacity-90 transition-opacity disabled:opacity-30 shrink-0"
                                    style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                                    {nlLoading ? '처리 중' : '구독'}
                                </button>
                            </form>
                            <div className="mt-2"><CaptchaWidget {...nlCaptcha.widgetProps} /></div>
                            {nlError && <p className="text-xs text-state-bad mt-2">구독 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>}
                            <div className="flex items-center gap-2 mt-2">
                                <button type="button" onClick={() => setNlAgree(!nlAgree)}
                                    className={`w-5 h-5 min-w-[20px] border rounded-xs flex items-center justify-center shrink-0 transition-colors ${
                                        nlAgree ? 'bg-[var(--tn-accent)] border-[var(--tn-accent)]' : 'border-[var(--tn-border)] tn-surface'
                                    }`}>
                                    {nlAgree && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </button>
                                <p className="text-xs tn-text-sub">이메일 수집 및 뉴스레터 수신에 동의합니다</p>
                            </div>
                        </>
                    )}
                    <p className="text-xs tn-text-sub mt-4"><Link href="/newsletter" className="underline">지난 뉴스레터 보기</Link></p>
                </div>
            </section>

            <PublicFooter />
        </TenOneThemeWrapper>
    );
}
