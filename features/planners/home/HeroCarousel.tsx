"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// 첫 화면 배너 — 첫 장은 확정 문구(브랜드), 그다음은 인트라에서 올린 배너 (아임웹 키비주얼 슬라이드 자리)
export interface HeroSlide {
    key: string;
    title: string;
    subtitle?: string | null;
    body?: string | null;
    imageUrl?: string | null;
    imageHref?: string | null;
    primary?: { label: string; href: string } | null;
    secondary?: { label: string; href: string } | null;
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
        <section className="relative bg-[#134E4A] text-white" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel">
            <div className="mx-auto grid min-h-[420px] max-w-[1200px] items-center gap-8 px-4 py-12 md:grid-cols-2 md:px-6 md:py-16">
                <div key={s.key}>
                    <h1 className="break-keep text-4xl font-black leading-tight md:text-5xl">{s.title}</h1>
                    {s.subtitle && <p className="mt-2 break-keep text-xl font-bold text-teal-200 md:text-2xl">{s.subtitle}</p>}
                    {s.body && <p className="mt-6 max-w-md whitespace-pre-line break-keep leading-relaxed text-teal-50">{s.body}</p>}
                    {(s.primary || s.secondary) && (
                        <div className="mt-8 flex flex-wrap gap-3">
                            {s.primary && (
                                <Link href={s.primary.href} className="inline-flex items-center gap-2 bg-[#14B8A6] px-6 py-3 font-bold text-[#042F2E] hover:bg-teal-300">
                                    {s.primary.label} <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                            {s.secondary && (
                                <Link href={s.secondary.href} className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 font-bold hover:bg-white/10">
                                    {s.secondary.label}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
                {s.imageUrl && (
                    <Link href={s.imageHref ?? s.primary?.href ?? "#"} className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.imageUrl} alt="" className="max-h-[360px] w-full object-contain" />
                    </Link>
                )}
            </div>

            {n > 1 && (
                <div className="absolute bottom-4 left-0 right-0 mx-auto flex max-w-[1200px] items-center gap-3 px-4 md:px-6">
                    <button onClick={() => setI((x) => (x - 1 + n) % n)} aria-label="이전 배너" className="text-white/60 hover:text-white"><ChevronLeft className="h-5 w-5" /></button>
                    <div className="flex gap-1.5">
                        {slides.map((sl, k) => (
                            <button key={sl.key} onClick={() => setI(k)} aria-label={`배너 ${k + 1}`} className={`h-1.5 transition-all ${k === i ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
                        ))}
                    </div>
                    <button onClick={() => setI((x) => (x + 1) % n)} aria-label="다음 배너" className="text-white/60 hover:text-white"><ChevronRight className="h-5 w-5" /></button>
                </div>
            )}
        </section>
    );
}
