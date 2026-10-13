"use client";

/**
 * 헤더 가운데 '써치 라이트' 메뉴 — 감시 조명의 동그란 빛이 메뉴명 위를 천천히 훑고, 끝에서 잠깐 멈췄다 돌아온다 (2026-10-13)
 * 동그라미만 움직인다 (사용자 결정 — 빛줄기·글자색 변화 없음). 움직임 줄이기 설정이면 멈춘다
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
            {w > 0 && <span aria-hidden className="hero-sl-spot pointer-events-none absolute left-1 top-1/2 rounded-none" />}
            <span ref={ref} className={clsx("relative text-sm font-bold", active ? "text-[#E53935]" : "text-neutral-600")}>{label}</span>
            <style jsx global>{`
                .hero-sl-spot {
                    width: 2.2em;
                    height: 2.2em;
                    background: radial-gradient(circle, rgba(229, 57, 53, 0.28) 0%, rgba(229, 57, 53, 0.12) 45%, transparent 70%);
                    animation: hero-sl-spot 7s ease-in-out infinite;
                }
                /* 동그라미 중심이 글자 왼쪽 끝 → 오른쪽 끝. 양 끝에서 멈춤 */
                @keyframes hero-sl-spot {
                    0%, 12%   { transform: translate(-50%, -50%); }
                    46%, 58%  { transform: translate(calc(var(--sl-w) - 50%), -50%); }
                    92%, 100% { transform: translate(-50%, -50%); }
                }
                .hero-sl:hover .hero-sl-spot { animation-play-state: paused; }
                @media (prefers-reduced-motion: reduce) {
                    .hero-sl-spot { display: none; }
                }
            `}</style>
        </Link>
    );
}
