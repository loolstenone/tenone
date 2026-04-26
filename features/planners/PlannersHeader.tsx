"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Menu, X, User, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UniverseUtilityBar } from "@/components/UniverseUtilityBar";
import { loginHref } from "@/lib/login-href";

// Planner's 브랜드 메뉴 — 로고가 홈 역할이므로 "Planner's" 메뉴 제거 (중복 제거)
// 정렬 원칙: 학습 → 도구 → 실천 → 성과
const navItems = [
    { name: "Planning",          href: "/planners/planning",     desc: "기획의 방법론" },
    { name: "Planner's Planner", href: "/planners/planner-tool", desc: "PDF · AI 도구" },
    { name: "Programs",          href: "/planners/programs",     desc: "교육 프로그램" },
    { name: "GPR",               href: "/planners/gpr",          desc: "성과 관리" },
];

export function PlannersHeader() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user } = useAuth();

    const isActive = (href: string) => {
        if (href === "/planners") return pathname === "/planners";
        return pathname.startsWith(href);
    };

    // PP AI App 진입 경로 — 인증 상태에 따라 동적 라우팅
    const ppAiHref = isAuthenticated ? "/planners/app" : "/planners/planner-tool#pp-ai";

    return (
        <>
        <header className="fixed top-0 left-0 right-0 z-50 bg-teal-900 text-white">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 items-center gap-6">
                {/* Logo — 명확히 분리된 좌측 그룹 */}
                <Link href="/planners" className="shrink-0 flex items-center group">
                    <span className="text-lg font-bold tracking-tight text-white group-hover:text-teal-100 transition-colors">
                        Planner&apos;s
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

                {/* Right group — PP AI 진입 CTA + Utilities */}
                <div className="hidden md:flex items-center gap-2 shrink-0">
                    {/* PP AI App 명시적 CTA */}
                    <Link
                        href={ppAiHref}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-400 to-emerald-400 text-teal-950 text-sm font-semibold rounded-md hover:opacity-90 transition-opacity shadow-sm"
                        title={isAuthenticated ? "Planner's Planner AI 앱 열기" : "Planner's Planner AI 시작하기"}
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{isAuthenticated ? "PP AI 열기" : "PP AI 시작"}</span>
                    </Link>
                    <UniverseUtilityBar
                        aboutPath="/planners/about"
                        profilePath="/planners/my"
                        accentColor="#1a1a2e"
                        signupPath="/signup"
                        siteId="planners"
                        siteName="Planner's"
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

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-teal-950 border-t border-teal-800 px-4 py-4 space-y-1">
                    {/* PP AI 진입 — 모바일 최상단 강조 */}
                    <Link
                        href={ppAiHref}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-teal-400 to-emerald-400 text-teal-950 font-semibold rounded mb-3"
                    >
                        <Sparkles className="h-4 w-4" />
                        {isAuthenticated ? "PP AI 앱 열기" : "PP AI 시작하기"}
                    </Link>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={clsx(
                                "block px-3 py-2 text-sm rounded",
                                isActive(item.href)
                                    ? "text-white bg-white/10"
                                    : "text-teal-200 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <div>{item.name}</div>
                            <div className="text-[10px] text-teal-400 mt-0.5">{item.desc}</div>
                        </Link>
                    ))}
                    <div className="pt-3 border-t border-teal-800 flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link href="/profile" onClick={() => setMobileOpen(false)} className="text-sm text-teal-200 hover:text-white flex items-center gap-2">
                                <User className="h-4 w-4" /> {user?.name || "마이페이지"}
                            </Link>
                        ) : (
                            <>
                                <Link href={loginHref(pathname)} onClick={() => setMobileOpen(false)} className="text-sm text-teal-200 hover:text-white">로그인</Link>
                                <Link href="/signup" onClick={() => setMobileOpen(false)} className="text-sm text-teal-200 hover:text-white">가입</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
        </>
    );
}
