"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";

// Myverse 브랜드 메뉴 — 로고가 홈 역할이므로 "Myverse" 메뉴 제거 (중복 제거)
// 정렬 원칙: 학습 → 도구 → 실천 → 성과
const navItems = [
    { name: "Planning",          href: "/myverse/planning",     desc: "기획의 방법론" },
    { name: "마이버스 도구", href: "/myverse/canvas-tool", desc: "PDF · AI 도구" },
    { name: "Programs",          href: "/myverse/programs",     desc: "교육 프로그램" },
    { name: "GPR",               href: "/myverse/gpr",          desc: "성과 관리" },
];

export function MyverseHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    const isActive = (href: string) => {
        if (href === "/myverse") return pathname === "/myverse";
        return pathname.startsWith(href);
    };

    // PP AI App 진입 경로 — 인증 상태에 따라 동적 라우팅
    const ppAiHref = isAuthenticated ? "/myverse/app" : "/myverse/canvas-tool#pp-ai";

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-teal-900 text-white">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center gap-6">
                {/* Logo — 명확히 분리된 좌측 그룹 */}
                <Link href="/myverse" className="shrink-0 flex items-center group">
                    <span className="text-lg font-bold tracking-tight text-white group-hover:text-teal-100 transition-colors">
                        myverse
                    </span>
                    <span className="ml-1 text-[9px] font-semibold text-teal-300 tracking-widest uppercase">AI</span>
                </Link>

                {/* 좌·중 사이 명확한 구분선 */}
                <span className="hidden md:block w-px h-5 bg-teal-700/50 shrink-0" />

                {/* Desktop Nav — 중앙 그룹 */}
                <div className="hidden md:flex items-center gap-1 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "px-3 py-1.5 text-sm font-medium transition-colors rounded",
                                isActive(item.href)
                                    ? "text-white bg-white/10"
                                    : "text-teal-200 hover:text-white hover:bg-white/5"
                            )}
                            title={item.desc}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Right group — Utilities (PP AI 워크스페이스 진입은 UniverseUtilityBar 내부) */}
                <div className="hidden md:flex items-center gap-2 shrink-0">
                    {/* 비인증 사용자에게만 노출되는 시작 CTA */}
                    {!isAuthenticated && (
                        <Link
                            href={ppAiHref}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-400 to-emerald-400 text-teal-950 text-sm font-semibold rounded-md hover:opacity-90 transition-opacity shadow-sm"
                            title="마이버스 AI 시작하기"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Myverse 시작</span>
                        </Link>
                    )}
                    <UniverseUtilityBar
                        aboutPath="/myverse/story"
                        profilePath="/myverse/my"
                        accentColor="#1a1a2e"
                        signupPath="/myverse/signup"
                        siteId="myverse"
                        siteName="Myverse"
                        workspacePath="/myverse/app"
                        workspaceLabel="Myverse"
                    />
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden p-2 text-teal-200 hover:text-white ml-auto"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="메뉴"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

        </header>

        {/* Mobile slide menu — UniverseMobileMenu 표준 */}
        <UniverseMobileMenu
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            brandName="Myverse"
            bgClass="bg-teal-950"
            textTone="light"
            footer={
                isAuthenticated ? (
                    <Link href="/myverse/my" onClick={() => setMobileOpen(false)} className="block text-sm text-teal-200 hover:text-white">마이페이지</Link>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link href={`/myverse/login?redirect=${encodeURIComponent(pathname)}`} onClick={() => setMobileOpen(false)} className="text-sm text-teal-200 hover:text-white">로그인</Link>
                        <Link href="/myverse/signup" onClick={() => setMobileOpen(false)} className="text-sm text-teal-200 hover:text-white">가입</Link>
                    </div>
                )
            }
        >
            <Link
                href={ppAiHref}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 text-teal-950 font-semibold rounded mb-3"
            >
                <Sparkles className="h-4 w-4" />
                {isAuthenticated ? "Myverse 앱 열기" : "Myverse 시작하기"}
            </Link>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                        "block rounded-lg px-4 py-2.5 transition-colors",
                        isActive(item.href)
                            ? "bg-white/10 text-white"
                            : "text-teal-200 hover:bg-white/5 hover:text-white"
                    )}
                >
                    <div className="text-base font-medium">{item.name}</div>
                    <div className="text-[10px] text-teal-400 mt-0.5">{item.desc}</div>
                </Link>
            ))}
        </UniverseMobileMenu>
        </>
    );
}
