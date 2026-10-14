"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Settings, HelpCircle, Bell } from "lucide-react";
import { UniverseMobileMenu } from "@/components/UniverseMobileMenu";
import { LogoutButton } from "@/components/AccountControls";
import { AccountMenu } from "@/components/AccountMenu";
import { APP_BASE, PLANNERS_APP_NAV, isAppNavActive } from "@/features/planners/app/nav";

// 플래너'스 AI 앱 상단 바 (h-12 고정 — MyVerse 쉘의 pt-12와 짝). 구독·구매 링크 없음 (통신판매업 신고 전)
export function PlannersAppTopBar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const iconCls = (href: string) => `flex h-8 w-8 items-center justify-center ${isAppNavActive(pathname, href) ? "text-white" : "text-teal-100/70 hover:text-white"}`;

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-40 flex h-12 items-center gap-2 bg-[#134E4A] px-3 text-white md:px-4">
                <button onClick={() => setOpen(true)} className="flex h-8 w-8 items-center justify-center lg:hidden" aria-label="메뉴">
                    <Menu className="h-5 w-5" />
                </button>
                <Link href="/planners" aria-label="Planner's 홈">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brands/planners/logo-white.png" alt="Planner's" width={1074} height={258} className="h-5 w-auto" />
                </Link>
                <Link href={`${APP_BASE}/daily`} className="text-lg font-bold leading-none text-teal-200 hover:text-white">AI</Link>
                <div className="ml-auto flex items-center gap-1">
                    <Link href={`${APP_BASE}/search`} className={iconCls(`${APP_BASE}/search`)} title="검색" aria-label="검색"><Search className="h-4 w-4" /></Link>
                    <Link href={`${APP_BASE}/notifications`} className={iconCls(`${APP_BASE}/notifications`)} title="알림" aria-label="알림"><Bell className="h-4 w-4" /></Link>
                    <Link href={`${APP_BASE}/help`} className={iconCls(`${APP_BASE}/help`)} title="도움말" aria-label="도움말"><HelpCircle className="h-4 w-4" /></Link>
                    <Link href={`${APP_BASE}/settings`} className={iconCls(`${APP_BASE}/settings`)} title="설정" aria-label="설정"><Settings className="h-4 w-4" /></Link>
                    {/* 계정 메뉴 (유틸리티바 표준 §1.9.2 — 앱형: 데스크톱 드롭다운 + 로그아웃, 모바일 시트에 로그아웃) */}
                    <span className="ml-1 hidden lg:flex items-center gap-3">
                        <AccountMenu profilePath="/planners/my" siteId="planners" />
                        <LogoutButton />
                    </span>
                    <span className="ml-1 lg:hidden"><AccountMenu profilePath="/planners/my" siteId="planners" mode="sheet" /></span>
                </div>
            </header>

            <UniverseMobileMenu open={open} onClose={() => setOpen(false)} brandName="Planner's AI" bgClass="bg-[#134E4A]" textTone="light">
                {PLANNERS_APP_NAV.map((group) => (
                    <div key={group.label} className="mb-3">
                        <p className="px-4 pb-1 text-xs text-teal-300">{group.label}</p>
                        {group.items.map((item) => (
                            <Link
                                key={item.key}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={`block px-4 py-2 text-base ${isAppNavActive(pathname, item.href) ? "bg-white/10 text-white" : "text-teal-100 hover:bg-white/5 hover:text-white"}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                ))}
            </UniverseMobileMenu>
        </>
    );
}
