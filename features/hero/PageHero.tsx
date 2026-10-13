import Link from "next/link";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * HeRo 페이지 첫 화면 표준 (2026-10-13) — 작은 한국어 라벨 → 제목 → 설명 → 빨간 주 버튼 하나.
 * 흰 배경·왼쪽 정렬이 표준 (2026-10-13 메뉴 간 통일 — align="center"는 쓰지 않는다). 어두운 첫 화면은 써치 라이트만, 홈은 캐릭터 + 슬로건 별도.
 * 빨강은 라벨 1곳 + 주 버튼 1개 (app/(HeRo)/CLAUDE.md 색 규약).
 */
export interface PageHeroAction { label: string; href: string }

export function PageHero({
    label,
    title,
    desc,
    cta,
    secondary,
    note,
    align = "left",
    children,
}: {
    /** 제목 위 작은 라벨 — 메뉴 이름 그대로 (한국어) */
    label: string;
    title: ReactNode;
    desc?: ReactNode;
    cta?: PageHeroAction;
    secondary?: PageHeroAction;
    note?: ReactNode;
    align?: "left" | "center";
    /** 버튼 자리를 직접 그릴 때 (조건부 버튼 등) */
    children?: ReactNode;
}) {
    const center = align === "center";
    return (
        <section className="bg-gradient-to-b from-red-50/70 to-white border-b border-neutral-100">
            <div className={clsx("mx-auto max-w-5xl px-6 lg:px-8 py-16 md:py-24", center && "text-center")}>
                <p className="text-sm font-bold text-[#E53935] mb-3">{label}</p>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight break-keep">{title}</h1>
                {desc && (
                    <p className={clsx("mt-5 text-base md:text-lg text-neutral-600 leading-relaxed break-keep max-w-2xl", center && "mx-auto")}>{desc}</p>
                )}
                {(cta || secondary || children) && (
                    <div className={clsx("mt-8 flex flex-wrap gap-3", center && "justify-center")}>
                        {cta && (
                            <Link href={cta.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-none bg-[#E53935] text-white text-sm font-bold hover:bg-red-700 transition-colors">
                                {cta.label} <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                        {secondary && (
                            <Link href={secondary.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-none border border-neutral-300 text-neutral-700 text-sm font-bold hover:border-neutral-500 transition-colors">
                                {secondary.label}
                            </Link>
                        )}
                        {children}
                    </div>
                )}
                {note && <p className="mt-4 text-xs text-neutral-500">{note}</p>}
            </div>
        </section>
    );
}
