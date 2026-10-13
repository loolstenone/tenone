"use client";

/**
 * UniverseMobileMenu — 유니버스 표준 모바일 슬라이드 메뉴 (SSOT)
 *
 * 원칙:
 * - 우측에서 슬라이드 인 (가로 화면 전체 덮지 않음)
 * - 너비: w-2/3 max-w-sm (~67% 화면, 최대 384px)
 * - 백드롭 클릭 시 닫힘
 * - 헤더(브랜드명 + X) + 스크롤 가능한 본문 + 하단 푸터(선택)
 *
 * 각 브랜드 헤더에서 모바일 메뉴를 만들 때는 이 컴포넌트를 반드시 사용한다.
 *
 * 사용 예:
 * ```tsx
 * <UniverseMobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} brandName="Badak" bgClass="bg-[#12122a]">
 *   {navItems.map(item => <MenuLink href={item.href} ... />)}
 *   <Footer>
 *     <ProfileLink />
 *   </Footer>
 * </UniverseMobileMenu>
 * ```
 */

import { useState, useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface UniverseMobileMenuProps {
    open: boolean;
    onClose: () => void;
    /** 브랜드명 (헤더 라벨, 텍스트) — aria-label 및 brandNode 미지정 시 표시용 */
    brandName?: string;
    /** 브랜드명 시각 노드 (서식 있는 라벨용 — 예: 윗첨자). 지정 시 brandName 대신 표시 */
    brandNode?: ReactNode;
    /** 패널 배경 — Tailwind class 또는 inline style */
    bgClass?: string;
    bgStyle?: React.CSSProperties;
    /** 텍스트 컬러 컨트롤 (어두운 배경: white / 밝은 배경: dark) */
    textTone?: "light" | "dark";
    /** 본문 (네비 링크들) */
    children: ReactNode;
    /** 하단 영역 (프로필/로그아웃 등) */
    footer?: ReactNode;
}

export function UniverseMobileMenu({
    open,
    onClose,
    brandName = "메뉴",
    brandNode,
    bgClass,
    bgStyle,
    textTone = "light",
    children,
    footer,
}: UniverseMobileMenuProps) {
    // 첫 렌더에선 transition 없이 (slide-in 끊김 방지), 이후 한 번이라도 열렸으면 transition 적용
    const [hasOpened, setHasOpened] = useState(false);
    useEffect(() => { if (open) setHasOpened(true); }, [open]);

    const isDark = textTone === "light"; // 어두운 배경 = 밝은 텍스트

    return (
        <>
            {/* 백드롭 — 백그라운드 dim */}
            <div
                className={clsx(
                    "fixed inset-0 z-[9998] transition-opacity duration-300",
                    open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                style={{ background: "rgba(0,0,0,0.6)" }}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* 슬라이드 패널 — 2/3 너비, 최대 384px */}
            <div
                className={clsx(
                    "fixed top-0 right-0 bottom-0 z-[9999] w-2/3 max-w-sm flex flex-col shadow-2xl",
                    bgClass,
                    hasOpened && "transition-transform duration-300 ease-out",
                    open ? "translate-x-0" : "translate-x-full"
                )}
                style={bgStyle}
                role="dialog"
                aria-modal="true"
                aria-label={`${brandName} 모바일 메뉴`}
            >
                {/* 헤더 */}
                <div className={clsx(
                    "flex h-14 items-center justify-between px-5 border-b shrink-0",
                    isDark ? "border-white/10" : "border-neutral-200"
                )}>
                    <span className={clsx(
                        "text-sm font-semibold",
                        isDark ? "text-white/70" : "text-neutral-700"
                    )}>
                        {brandNode ?? brandName}
                    </span>
                    <button
                        onClick={onClose}
                        className={clsx(
                            "p-1.5 rounded-md transition-colors",
                            isDark
                                ? "text-white/50 hover:text-white hover:bg-white/5"
                                : "text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
                        )}
                        aria-label="메뉴 닫기"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* 본문 — 스크롤 가능 */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {children}
                </nav>

                {/* 푸터 (선택) */}
                {footer && (
                    <div className={clsx(
                        "border-t shrink-0 p-4",
                        isDark ? "border-white/10" : "border-neutral-200"
                    )}>
                        {footer}
                    </div>
                )}
            </div>
        </>
    );
}

/**
 * UniverseMobileMenuLink — 패널 안의 표준 메뉴 링크 (시각 일관성 유지용)
 */
export function UniverseMobileMenuLink({
    href,
    active,
    onClick,
    children,
    textTone = "light",
    accentColor = "#0F766E",
}: {
    href: string;
    active?: boolean;
    onClick?: () => void;
    children: ReactNode;
    textTone?: "light" | "dark";
    accentColor?: string;
}) {
    const isDark = textTone === "light";
    return (
        <a
            href={href}
            onClick={onClick}
            className={clsx(
                "flex items-center rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                active
                    ? isDark ? "bg-white/10 text-white" : "bg-neutral-100 text-neutral-900"
                    : isDark ? "text-neutral-300 hover:bg-white/5 hover:text-white" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
            )}
            style={active ? { color: accentColor } : undefined}
        >
            {children}
        </a>
    );
}
