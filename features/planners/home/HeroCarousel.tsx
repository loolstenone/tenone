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
    const n = slides.length;

    useEffect(() => {
        if (n < 2 || paused) return;
        const t = setInterval(() => setI((x) => (x + 1) % n), INTERVAL);
        return () => clearInterval(t);
    }, [n, paused]);

    const s = slides[i];
    return (
        <section className="relative flex min-h-[calc(100svh-64px)] flex-col bg-[#134E4A] text-white md:min-h-[calc(100svh-84px)]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel">
            {/* 넘김 표시: 모바일은 맨 위(뭐가 더 있구나 바로 알게, 2026-10-15 사용자) · 데스크톱은 아래 */}
            {n > 1 && (
                <div className="mx-auto flex w-full max-w-[1590px] items-center gap-3 px-6 pt-6 md:absolute md:bottom-10 md:left-0 md:right-0 md:px-16 md:pt-0">
                    <button onClick={() => setI((x) => (x - 1 + n) % n)} aria-label="이전 배너" className="text-white/60 hover:text-white"><ChevronLeft className="h-5 w-5" /></button>
                    <div className="flex gap-1.5">
                        {slides.map((sl, k) => (
                            <button key={sl.key} onClick={() => setI(k)} aria-label={`배너 ${k + 1}`} className={`h-1.5 transition-all ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
                        ))}
                    </div>
                    <button onClick={() => setI((x) => (x + 1) % n)} aria-label="다음 배너" className="text-white/60 hover:text-white"><ChevronRight className="h-5 w-5" /></button>
                </div>
            )}
            {/* 모바일 = 제목 → 그림 → 버튼(한 줄), 본문·아랫줄은 md부터 — 한 화면 안에 비유(쏟아 낸 생각 → AI 정리)가 보이게 (2026-10-15)
                데스크톱 = 왼쪽 제목·본문·버튼 / 오른쪽 그림 */}
            <div key={s.key} className="mx-auto grid w-full max-w-[1590px] flex-1 content-center gap-7 px-6 pb-12 pt-6 md:content-normal md:grid-cols-2 md:grid-rows-[1fr_auto_1fr] md:gap-x-24 md:gap-y-0 md:px-16 md:py-32">
                <div className="md:col-start-1 md:row-start-1 md:self-end">
                    <h1 className="break-keep text-[32px] font-black leading-tight md:text-6xl">{s.title}</h1>
                    {s.subtitle && <p className="mt-2 break-keep text-lg font-bold leading-snug text-teal-200 md:mt-4 md:text-3xl">{s.subtitle}</p>}
                </div>

                {s.visual ? (
                    <div className="md:col-start-2 md:row-span-3 md:row-start-1 md:self-center">{s.visual}</div>
                ) : s.imageUrl ? (
                    <Link href={s.imageHref ?? s.primary?.href ?? "#"} className="block md:col-start-2 md:row-span-3 md:row-start-1 md:self-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.imageUrl} alt="" className="max-h-[280px] w-full object-contain md:max-h-[560px]" />
                    </Link>
                ) : null}

                <div className="md:col-start-1 md:row-start-2">
                    {s.body && <p className="hidden max-w-xl whitespace-pre-line break-keep leading-relaxed text-teal-50 md:mt-8 md:block md:text-lg">{s.body}</p>}
                    {(s.primary || s.secondary) && (
                        <div className="flex gap-2 md:mt-12 md:gap-3">
                            {s.primary && (
                                <Link href={s.primary.href} className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap bg-[#14B8A6] px-4 py-3 text-[15px] font-bold text-[#042F2E] hover:bg-teal-300 md:flex-none md:px-7 md:py-3.5 md:text-base">
                                    {s.primary.label} <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                            {s.secondary && (
                                <Link href={s.secondary.href} className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap border border-white/30 px-4 py-3 text-[15px] font-bold hover:bg-white/10 md:flex-none md:px-7 md:py-3.5 md:text-base">
                                    {s.secondary.label}
                                </Link>
                            )}
                        </div>
                    )}
                    {s.note && <p className="mt-8 hidden break-keep text-teal-200/90 md:block md:text-lg">{s.note}</p>}
                </div>
            </div>

        </section>
    );
}
