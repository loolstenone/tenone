"use client";

/**
 * UniverseMobileMenu — 유니버스 표준 모바일 슬라이드 메뉴 (SSOT, CLAUDE.md §1.9.3)
 *
 * - 우측에서 슬라이드 인, w-2/3 max-w-sm, 백드롭 클릭·X로 닫힘
 * - 본문 = 사이트 메뉴(children)
 * - 하단은 이 컴포넌트가 자동으로 그린다 (2026-10-14): [주 행동 버튼 cta] · 서비스 입구 · About · 공유 · (비로그인) 로그인·가입
 *   계정(마이페이지·계정 관리·로그아웃)은 헤더의 유틸리티바 아바타 → 계정 메뉴 시트가 전담
 * ❌ 하단에 마이페이지·로그아웃을 손으로 넣지 않는다 (footer prop 폐지 — 브랜드마다 달라져 로그아웃이 빠지던 사고)
 */

import { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";
import { LoginModal } from "@/components/LoginModal";
import { CrossSiteLink } from "@/components/CrossSiteLink";
import { shareCurrentPage } from "@/lib/share-page";
import type { ServiceEntry } from "@/components/UniverseUtilityBar";

/** 밝은 강조색(노랑 등)이면 글자를 어둡게 */
function isLightColor(hex: string): boolean {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) return false;
    const n = parseInt(m[1], 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

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
    /** 브랜드 소개 — 유틸리티바 aboutPath와 같게 */
    aboutPath?: string;
    aboutLabel?: string;
    /** 서비스 입구 — 유틸리티바 serviceEntry와 같게 */
    serviceEntry?: ServiceEntry;
    /** 브랜드 주 행동 버튼 1개 (예: 가입하기·Members & Alliance). 계정 링크를 넣지 않는다 */
    cta?: ReactNode;
    /** 가입·로그인 강조색 */
    accentColor?: string;
    /** 로그인 화면이 따로 있는 브랜드 (예: /wio/login) — 없으면 LoginModal */
    loginPath?: string;
    hideAuth?: boolean;
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
    aboutPath,
    aboutLabel,
    serviceEntry,
    cta,
    accentColor = "#171717",
    loginPath,
    hideAuth,
}: UniverseMobileMenuProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginTab, setLoginTab] = useState<"login" | "signup">("login");
    const [copied, setCopied] = useState(false);
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

                {/* 하단 — 자동 (cta · 서비스 입구 · About · 공유 · 로그인/가입) */}
                <div className={clsx("border-t shrink-0 p-4 space-y-3", isDark ? "border-white/10" : "border-neutral-200")}>
                    {cta}
                    {serviceEntry && (
                        <CrossSiteLink href={serviceEntry.href} onClick={onClose}
                            className={clsx("block text-sm font-semibold", isDark ? "text-white" : "text-neutral-900")}>
                            {serviceEntry.label}
                        </CrossSiteLink>
                    )}
                    <div className={clsx("flex items-center gap-4 text-sm", isDark ? "text-white/60" : "text-neutral-500")}>
                        {aboutPath && (
                            <Link href={aboutPath} onClick={onClose} className={isDark ? "hover:text-white" : "hover:text-neutral-900"}>
                                {aboutLabel ?? "ABOUT"}
                            </Link>
                        )}
                        <button type="button" className={isDark ? "hover:text-white" : "hover:text-neutral-900"}
                            onClick={async () => {
                                if ((await shareCurrentPage()) === "copied") { setCopied(true); setTimeout(() => setCopied(false), 2000); }
                            }}>
                            {copied ? "링크 복사됨" : "공유"}
                        </button>
                    </div>
                    {!hideAuth && !isLoading && !isAuthenticated && (
                        <div className="flex gap-2 pt-1">
                            {loginPath ? (
                                <Link href={loginPath} onClick={onClose}
                                    className={clsx("flex-1 rounded-lg border px-4 py-2 text-center text-sm", isDark ? "border-white/15 text-white/80" : "border-neutral-200 text-neutral-700")}>
                                    로그인
                                </Link>
                            ) : (
                                <button type="button" onClick={() => { setLoginTab("login"); setLoginOpen(true); }}
                                    className={clsx("flex-1 rounded-lg border px-4 py-2 text-center text-sm", isDark ? "border-white/15 text-white/80" : "border-neutral-200 text-neutral-700")}>
                                    로그인
                                </button>
                            )}
                            <button type="button" onClick={() => { setLoginTab("signup"); setLoginOpen(true); }}
                                className="flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold"
                                style={{ backgroundColor: accentColor, color: isLightColor(accentColor) ? "#111" : "#fff" }}>
                                가입하기
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} accentColor={accentColor} defaultTab={loginTab} />
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
