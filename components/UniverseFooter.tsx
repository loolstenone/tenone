"use client";

/**
 * UniverseFooter — 유니버스 표준 푸터 (SSOT)
 *
 * 표준 구조:
 *   1. (선택) 브랜드 콘텐츠 영역 — 뉴스레터·소셜·CTA 등 (children)
 *   2. 4컬럼 그리드 — 브랜드 / 정책 / 문의 / Universe (linkColumns)
 *   3. 하단 카피라이트 + 정책 링크 (자동 생성)
 *
 * 모든 브랜드 푸터는 이 컴포넌트로 통일한다. 자체 푸터 직접 만들지 말 것.
 *
 * 사용 예:
 * ```tsx
 * <UniverseFooter
 *   brandName="Badak"
 *   tagline="기획자 네트워크"
 *   accentColor="#ffd93d"
 *   linkColumns={[
 *     { title: "서비스", links: [{ label: "모임", href: "/badak/groups" }, ...] },
 *     { title: "정책", links: [...] },
 *     { title: "문의", links: [...] },
 *   ]}
 * >
 *   <NewsletterForm />  {' '}
 * </UniverseFooter>
 * ```
 */

import Link from "next/link";
import { ReactNode } from "react";
import clsx from "clsx";

interface FooterLink { label: string; href: string; external?: boolean; }
interface FooterColumn { title: string; links: FooterLink[]; }

export interface UniverseFooterProps {
    /** 브랜드 이름 (좌측 상단) */
    brandName: string;
    /** 한 줄 슬로건 */
    tagline?: string;
    /** 브랜드 메인 컬러 (호버·hr 등) */
    accentColor?: string;
    /** 어두운 배경(검정 계열) 사용 여부 — 텍스트 톤 자동 결정 */
    dark?: boolean;
    /** 브랜드별 링크 컬럼 (최대 3개 권장 — Universe 컬럼은 자동 추가) */
    linkColumns?: FooterColumn[];
    /** 상단 영역 (뉴스레터·CTA 등 — 컬럼 그리드 위에 배치) */
    children?: ReactNode;
    /** Universe 링크 컬럼 자동 추가 비활성화 (TenOne 자체 사이트 등) */
    hideUniverseColumn?: boolean;
}

const DEFAULT_UNIVERSE_LINKS: FooterLink[] = [
    { label: "Ten:One", href: "https://tenone.biz", external: true },
    { label: "About", href: "/about" },
    { label: "Brands", href: "/brands" },
    { label: "Universe", href: "/universe" },
];

const DEFAULT_POLICY_LINKS: FooterLink[] = [
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
];

export function UniverseFooter({
    brandName,
    tagline,
    accentColor = "#171717",
    dark = false,
    linkColumns = [],
    children,
    hideUniverseColumn = false,
}: UniverseFooterProps) {
    const year = new Date().getFullYear();
    const universeColumn: FooterColumn = {
        title: "Ten:One™ Universe",
        links: DEFAULT_UNIVERSE_LINKS,
    };
    const allColumns = hideUniverseColumn ? linkColumns : [...linkColumns, universeColumn];

    const textPrimary = dark ? "text-white" : "text-neutral-900";
    const textSecondary = dark ? "text-neutral-400" : "text-neutral-600";
    const textTertiary = dark ? "text-neutral-500" : "text-neutral-500";
    const linkHover = dark ? "hover:text-white" : "hover:text-neutral-900";
    const borderColor = dark ? "border-white/10" : "border-neutral-200";

    return (
        <footer className={clsx(
            "border-t",
            borderColor,
            dark ? "bg-neutral-950" : "bg-neutral-50"
        )}>
            {/* 상단 슬롯 — 뉴스레터/CTA 등 */}
            {children && (
                <div className={clsx("border-b", borderColor)}>
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                        {children}
                    </div>
                </div>
            )}

            {/* 메인 — 브랜드 + 컬럼 그리드 */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <div className="grid gap-10 md:grid-cols-12">
                    {/* 브랜드 영역 */}
                    <div className="md:col-span-4">
                        <div className={clsx("text-xl font-bold tracking-tight", textPrimary)}>
                            {brandName}
                        </div>
                        {tagline && (
                            <p className={clsx("mt-2 text-sm", textSecondary)}>{tagline}</p>
                        )}
                        <div className={clsx("mt-4 text-xs", textTertiary)}>
                            Part of <Link href="https://tenone.biz" className={clsx(linkHover, "underline-offset-2 hover:underline")} style={{ color: accentColor }}>Ten:One™ Universe</Link>
                        </div>
                    </div>

                    {/* 링크 컬럼들 */}
                    <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {allColumns.map(col => (
                            <div key={col.title}>
                                <div className={clsx("text-xs font-semibold uppercase tracking-wider mb-3", textPrimary)}>
                                    {col.title}
                                </div>
                                <ul className="space-y-2">
                                    {col.links.map(link => (
                                        <li key={link.label + link.href}>
                                            {link.external ? (
                                                <a
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={clsx("text-sm transition-colors", textSecondary, linkHover)}
                                                >
                                                    {link.label}
                                                </a>
                                            ) : (
                                                <Link
                                                    href={link.href}
                                                    className={clsx("text-sm transition-colors", textSecondary, linkHover)}
                                                >
                                                    {link.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 하단 — 카피라이트 + 정책 */}
            <div className={clsx("border-t", borderColor)}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className={clsx("text-xs", textTertiary)}>
                        © {year} {brandName} · Ten:One™ Universe. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {DEFAULT_POLICY_LINKS.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx("text-xs transition-colors", textTertiary, linkHover)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
