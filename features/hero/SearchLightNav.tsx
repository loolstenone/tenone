"use client";

/**
 * 헤더 가운데 '써치 라이트' 메뉴 — 교도소 감시 조명처럼 빛이 메뉴명을 천천히 훑고, 끝에서 잠깐 멈췄다 돌아온다 (2026-10-13)
 * 구조: 회색 글자(바탕) 위로 '빛 창'(타원)이 좌우로 움직이고, 창 안에는 빨간 글자가 반대로 움직여 제자리에 고정된다
 *       → 빛이 지나가는 자리만 빨갛게 켜진다. 위에서 내려오는 빛줄기가 같은 박자로 기울어진다
 * 움직임 줄이기 설정이면 멈춘다 (빛 없음, 글자만)
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export function SearchLightNav({ href, label, active, className }: { href: string; label: string; active: boolean; className?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [w, setW] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => setW(el.offsetWidth);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <Link href={href} className={clsx("hero-sl relative inline-flex items-center whitespace-nowrap px-1 py-1", className)}
            style={{ ["--sl-w" as string]: `${w}px` }} aria-current={active ? "page" : undefined}>
            <span ref={ref} className={clsx("relative text-sm font-semibold", active ? "text-[#E53935]" : "text-neutral-500")}>{label}</span>
            {w > 0 && !active && (
                <>
                    <span aria-hidden className="hero-sl-beam pointer-events-none absolute left-1 bottom-1/2" />
                    <span aria-hidden className="hero-sl-window pointer-events-none absolute left-1 top-1/2 overflow-hidden rounded-full">
                        <span className="hero-sl-inner absolute left-0 top-1/2 text-sm font-semibold text-[#E53935]">{label}</span>
                    </span>
                </>
            )}
            <style jsx global>{`
                .hero-sl-window {
                    width: calc(var(--sl-w) * 0.42);
                    height: 1.9em;
                    background: radial-gradient(ellipse at center, rgba(229, 57, 53, 0.2) 0%, rgba(229, 57, 53, 0.07) 55%, transparent 72%);
                    animation: hero-sl-move 7s ease-in-out infinite;
                }
                .hero-sl-inner {
                    width: var(--sl-w);
                    white-space: nowrap;
                    animation: hero-sl-counter 7s ease-in-out infinite;
                }
                .hero-sl-beam {
                    width: calc(var(--sl-w) * 0.42);
                    height: 30px;
                    background: linear-gradient(to top, rgba(229, 57, 53, 0.24), rgba(229, 57, 53, 0));
                    clip-path: polygon(38% 0, 62% 0, 100% 100%, 0 100%);
                    transform-origin: 50% 0;
                    animation: hero-sl-beam 7s ease-in-out infinite;
                }
                /* 빛 창 위치: 글자 폭 기준 -0.3 ~ 0.88. 양 끝에서 멈춤 */
                @keyframes hero-sl-move {
                    0%, 12%   { transform: translate(calc(var(--sl-w) * -0.3), -50%); }
                    46%, 58%  { transform: translate(calc(var(--sl-w) * 0.88), -50%); }
                    92%, 100% { transform: translate(calc(var(--sl-w) * -0.3), -50%); }
                }
                @keyframes hero-sl-counter {
                    0%, 12%   { transform: translate(calc(var(--sl-w) * 0.3), -50%); }
                    46%, 58%  { transform: translate(calc(var(--sl-w) * -0.88), -50%); }
                    92%, 100% { transform: translate(calc(var(--sl-w) * 0.3), -50%); }
                }
                @keyframes hero-sl-beam {
                    0%, 12%   { transform: translateX(calc(var(--sl-w) * -0.3)) skewX(18deg); }
                    46%, 58%  { transform: translateX(calc(var(--sl-w) * 0.88)) skewX(-18deg); }
                    92%, 100% { transform: translateX(calc(var(--sl-w) * -0.3)) skewX(18deg); }
                }
                .hero-sl:hover .hero-sl-window,
                .hero-sl:hover .hero-sl-inner,
                .hero-sl:hover .hero-sl-beam { animation-play-state: paused; }
                @media (prefers-reduced-motion: reduce) {
                    .hero-sl-window, .hero-sl-beam { display: none; }
                }
            `}</style>
        </Link>
    );
}
