"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// 첫 화면 배너 (화면 높이에 꽉 차게, 헤더 64/84px 제외 · 2026-10-15) — 첫 장은 플래너'스 AI(주인공, 2026-10-14), 그다음은 인트라에서 올린 배너 (아임웹 키비주얼 슬라이드 자리)
export interface HeroSlide {
    key: string;
    title: string;
    subtitle?: string | null;
    body?: string | null;
    imageUrl?: string | null;
    imageHref?: string | null;
    primary?: { label: string; href: string } | null;
    secondary?: { label: string; href: string } | null;
    /** 버튼 아래 한 줄 */
    note?: string | null;
    /** 사진 대신 오른쪽에 그릴 화면 (첫 장 = 플래너'스 AI가 일하는 모습) */
    visual?: ReactNode;
}

const INTERVAL = 7000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
    const [i, setI] = useState(0);
    const [paused, setPaused] = useState(false);
    // 직접 넘기면 자동 넘김을 멈춘다 — 읽는 도중 바뀌지 않게 (모바일은 마우스 올림이 없다, 2026-10-15 QA)
    const [stopped, setStopped] = useState(false);
    const n = slides.length;
    const go = (k: number) => { setStopped(true); setI(((k % n) + n) % n); };

    useEffect(() => {
        if (n < 2 || paused || stopped) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // 움직임 줄이기 설정 존중
        const t = setInterval(() => setI((x) => (x + 1) % n), INTERVAL);
        return () => clearInterval(t);
    }, [n, paused, stopped]);

    const s = slides[i];
    // 크기는 단계가 아니라 화면 폭·높이에 비례해 연속으로 (2026-10-15 사용자 "디스플레이 사이즈에 맞춰 동적으로")
    //   글자·여백·그림 = clamp(최소, min(폭 비율, 높이 비율), 최대) — 넓지만 낮은 노트북에서도, 좁고 긴 폰에서도 한 화면에 맞는다
    //   배치만 둘: 1024px 미만 = 위아래(넘김 표시 맨 위 → 제목 → 그림 → 버튼), 이상 = 왼쪽 글·오른쪽 그림(넘김 표시 아래)
    //   버튼 아래 한 줄·그림 설명줄은 넉넉한 화면(폭 1024 이상·높이 860 이상)에서만
    return (
        <section className="relative flex min-h-[calc(100svh-64px)] flex-col bg-[#134E4A] text-white md:min-h-[calc(100svh-84px)]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} aria-roledescription="carousel">
            {/* 넘김 표시: 1024px 미만은 맨 위(뭐가 더 있구나 바로 알게, 2026-10-15 사용자) · 그 이상은 아래 */}
            {n > 1 && (
                <div className="mx-auto flex w-full max-w-[1590px] items-center gap-3 px-6 pt-[clamp(16px,3svh,40px)] md:px-16 lg:absolute lg:bottom-[clamp(16px,4svh,48px)] lg:left-0 lg:right-0 lg:pt-0">
                    <button onClick={() => go(i - 1)} aria-label="이전 배너" className="text-white/60 hover:text-white"><ChevronLeft className="h-5 w-5" /></button>
                    <div className="flex gap-1.5">
                        {slides.map((sl, k) => (
                            <button key={sl.key} onClick={() => go(k)} aria-current={k === i} aria-label={`배너 ${k + 1}`} className={`h-1.5 transition-all ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
                        ))}
                    </div>
                    <button onClick={() => go(i + 1)} aria-label="다음 배너" className="text-white/60 hover:text-white"><ChevronRight className="h-5 w-5" /></button>
                </div>
            )}

            <div key={s.key} className="mx-auto grid w-full max-w-[1590px] flex-1 content-center gap-[clamp(14px,3svh,44px)] px-6 pb-[clamp(24px,5svh,64px)] pt-[clamp(12px,2.5svh,32px)] md:px-16 lg:grid-cols-2 lg:grid-rows-[1fr_auto_1fr] lg:content-normal lg:gap-x-[clamp(48px,6vw,128px)] lg:gap-y-0 lg:py-[clamp(24px,7svh,140px)]">
                <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
                    <h1 className="break-keep text-[clamp(26px,min(8.5vw,5.2svh),56px)] font-black leading-tight lg:text-[clamp(38px,min(4.4vw,7svh),84px)]">{s.title}</h1>
                    {s.subtitle && <p className="mt-[clamp(6px,1.2svh,18px)] break-keep text-[clamp(16px,min(4.6vw,2.6svh),28px)] font-bold leading-snug text-teal-200 lg:text-[clamp(19px,min(2vw,3.3svh),36px)]">{s.subtitle}</p>}
                </div>

                {s.visual ? (
                    <div className="lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-center">{s.visual}</div>
                ) : s.imageUrl ? (() => {
                    const href = s.imageHref ?? s.primary?.href;
                    // eslint-disable-next-line @next/next/no-img-element
                    const img = <img src={s.imageUrl} alt={s.title} className="max-h-[clamp(180px,34svh,440px)] w-full object-contain md:object-left lg:max-h-[min(62svh,640px)] lg:object-center" />;
                    const cls = "block lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-center";
                    // 연결할 곳이 없으면 링크로 만들지 않는다 ('#'로 가면 맨 위로 튄다)
                    return href ? <Link href={href} className={cls}>{img}</Link> : <div className={cls}>{img}</div>;
                })() : null}

                <div className="lg:col-start-1 lg:row-start-2">
                    {s.body && <p className="mb-[clamp(16px,3svh,40px)] hidden max-w-xl whitespace-pre-line break-keep text-[clamp(15px,min(1.6vw,2.2svh),20px)] leading-relaxed text-teal-50 md:block lg:mb-0 lg:mt-[clamp(14px,3svh,36px)] [@media(max-height:700px)]:!hidden">{s.body}</p>}
                    {(s.primary || s.secondary) && (
                        <div className="flex gap-2 md:gap-3 lg:mt-[clamp(16px,4svh,52px)]">
                            {s.primary && (
                                <Link href={s.primary.href} className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap bg-[#14B8A6] px-[clamp(14px,2vw,32px)] py-[clamp(10px,1.6svh,16px)] text-[clamp(14px,min(3.8vw,1.9svh),17px)] font-bold text-[#042F2E] hover:bg-teal-300 md:flex-none">
                                    {s.primary.label} <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                            {s.secondary && (
                                <Link href={s.secondary.href} className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap border border-white/30 px-[clamp(14px,2vw,32px)] py-[clamp(10px,1.6svh,16px)] text-[clamp(14px,min(3.8vw,1.9svh),17px)] font-bold hover:bg-white/10 md:flex-none">
                                    {s.secondary.label}
                                </Link>
                            )}
                        </div>
                    )}
                    {s.note && <p className="mt-[clamp(16px,3svh,32px)] hidden break-keep text-[clamp(15px,1.8svh,18px)] text-teal-200/90 [@media(min-width:1024px)_and_(min-height:860px)]:block">{s.note}</p>}
                </div>
            </div>
        </section>
    );
}
