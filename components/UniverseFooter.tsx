"use client";

/**
 * UniverseFooter — 유니버스 표준 푸터 (SSOT) · 규칙 CLAUDE.md §1.9.4 (2026-10-08 개정)
 *
 * 4열 구조:
 *   1. 브랜드 — 브랜드명 · 컨셉/슬로건 · Ten:One™ Universe (유니버스 연결은 여기 한 곳만)
 *   2. 메뉴   — 메인 메뉴. siteId를 주면 헤더와 같은 원천(lib/brand-site-menus.ts siteHeaderNav)에서 자동 생성
 *   3. 참여   — 등록·지원·문의·마이페이지 등 사용자의 행동 (가장 중요한 행동을 맨 위에)
 *   4. 채널   — 외부 채널(SNS·유튜브·뉴스레터) + 유니버스 안의 결이 맞는·서로 도움이 되는 사이트 (예: 매드리그 → HeRo·RooK)
 *   하단 줄  — © 연도 · 상호·대표 · 이용약관·개인정보처리방침 (사업자등록번호는 통신판매 시작 시 함께 표시)
 * 비어 있는 열은 숨긴다. 상단 슬롯(children) = 뉴스레터·CTA 등 선택.
 *
 * 사용 예:
 * ```tsx
 * <UniverseFooter
 *   siteId="madleague" brandName="MAD League" tagline="경쟁을 통한 성장" accentColor="#EC1D25" dark
 *   actions={[{ label: "매드리거 등록", href: "/madleague/apply" }, { label: "문의하기", href: "/madleague/contact" }]}
 *   channels={[{ label: "HeRo", href: "/hero" }, { label: "Instagram", href: "https://instagram.com/…", external: true }]}
 * />
 * ```
 * (이행 중) 아직 메뉴 레지스트리에 없는 브랜드는 linkColumns를 그대로 쓴다.
 */

import Link from "next/link";
import { CrossSiteLink } from "@/components/CrossSiteLink";
import { COMPANY_INFO } from "@/lib/company-info";
import { siteHeaderNav } from "@/lib/brand-site-menus";
import { ReactNode } from "react";
import clsx from "clsx";

export interface FooterLink { label: string; href: string; external?: boolean; }
interface FooterColumn { title: string; links: FooterLink[]; }

export interface UniverseFooterProps {
    /** 브랜드 이름 (1열) */
    brandName: string;
    /** 컨셉 또는 슬로건 (1열) */
    tagline?: string;
    /** 브랜드 메인 컬러 */
    accentColor?: string;
    /** 어두운 배경(검정 계열) 사용 여부 — 텍스트 톤 자동 결정 */
    dark?: boolean;
    /** 2열 메뉴를 헤더 레지스트리에서 자동 생성할 사이트 */
    siteId?: string;
    /** 3열 참여 — 행동 유발 링크 */
    actions?: FooterLink[];
    /** 4열 채널 — 외부 채널 + 유니버스 연관 사이트 (유니버스 경로는 그 사이트 주소로 자동 변환) */
    channels?: FooterLink[];
    /** (이행 중) 메뉴 레지스트리에 없는 브랜드의 기존 링크 열 — siteId·actions·channels를 쓰면 무시 */
    linkColumns?: FooterColumn[];
    /** 상단 영역 (뉴스레터·CTA 등) */
    children?: ReactNode;
    /** @deprecated Universe 열 폐지 (2026-10-08) — 넘겨도 무시 */
    hideUniverseColumn?: boolean;
}

const DEFAULT_POLICY_LINKS: FooterLink[] = [
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
];

/** 2열 메뉴 — 헤더 메뉴 그대로 (하위 메뉴는 헤더에 맡기고 상위 메뉴만) */
function menuFromRegistry(siteId: string): FooterLink[] {
    return siteHeaderNav(siteId).map(item => ({ label: item.name, href: item.href }));
}

export function UniverseFooter({
    brandName,
    tagline,
    accentColor = "#171717",
    dark = false,
    siteId,
    actions = [],
    channels = [],
    linkColumns = [],
    children,
}: UniverseFooterProps) {
    const year = new Date().getFullYear();
    const menu = siteId ? menuFromRegistry(siteId) : [];
    const standard = siteId || actions.length > 0 || channels.length > 0;
    const columns: FooterColumn[] = (standard
        ? [
            { title: "메뉴", links: menu },
            { title: "참여", links: actions },
            { title: "채널", links: channels },
        ]
        : linkColumns
    ).filter(c => c.links.length > 0); // 빈 열은 숨긴다

    const textPrimary = dark ? "text-white" : "text-neutral-900";
    const textSecondary = dark ? "text-neutral-400" : "text-neutral-600";
    const textTertiary = "text-neutral-500";
    const linkHover = dark ? "hover:text-white" : "hover:text-neutral-900";
    const borderColor = dark ? "border-white/10" : "border-neutral-200";
    const linkCls = clsx("text-sm transition-colors", textSecondary, linkHover);

    return (
        <footer className={clsx("border-t", borderColor, dark ? "bg-neutral-950" : "bg-neutral-50")}>
            {children && (
                <div className={clsx("border-b", borderColor)}>
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">{children}</div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <div className="grid gap-10 md:grid-cols-12">
                    {/* 1열 — 브랜드 */}
                    <div className="md:col-span-4">
                        <div className={clsx("text-xl font-bold tracking-tight", textPrimary)}>{brandName}</div>
                        {tagline && <p className={clsx("mt-2 text-sm", textSecondary)}>{tagline}</p>}
                        <div className="mt-4 text-xs">
                            <a href="https://www.tenone.biz" className="underline-offset-2 hover:underline" style={{ color: accentColor }}>Ten:One™ Universe</a>
                        </div>
                    </div>

                    {/* 2~4열 — 메뉴 · 참여 · 채널 */}
                    <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {columns.map(col => (
                            <div key={col.title}>
                                <div className={clsx("text-xs font-semibold uppercase tracking-wider mb-3", textPrimary)}>{col.title}</div>
                                <ul className="space-y-2">
                                    {col.links.map(link => (
                                        <li key={link.label + link.href}>
                                            {link.external || /^https?:\/\//.test(link.href) ? (
                                                <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkCls}>{link.label}</a>
                                            ) : (
                                                // 같은 사이트 경로는 그대로, 다른 브랜드 경로(/hero 등)는 그 사이트 공식 주소로 (lib/cross-site.ts)
                                                <CrossSiteLink href={link.href} className={linkCls}>{link.label}</CrossSiteLink>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 하단 줄 — 카피라이트 · 상호 · 정책 */}
            <div className={clsx("border-t", borderColor)}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className={clsx("text-xs text-center sm:text-left space-y-1", textTertiary)}>
                        <p>© {year} {brandName.startsWith("Ten:One") ? "" : `${brandName} · `}Ten:One™ Universe. All rights reserved.</p>
                        <p>
                            {COMPANY_INFO.legalName} · 대표 {COMPANY_INFO.representative}
                            {/* 사업자등록번호는 2026-10-08 사용자 결정으로 숨김. 통신판매(온라인 결제)를 시작해 신고번호를 넣으면
                                전자상거래법상 표시 의무에 따라 사업자등록번호·통신판매업 신고번호를 함께 표시 */}
                            {COMPANY_INFO.mailOrderNumber && <> · 사업자등록번호 {COMPANY_INFO.businessNumber} · 통신판매업 {COMPANY_INFO.mailOrderNumber}</>}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {DEFAULT_POLICY_LINKS.map(link => (
                            <Link key={link.href} href={link.href} className={clsx("text-xs transition-colors", textTertiary, linkHover)}>{link.label}</Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
