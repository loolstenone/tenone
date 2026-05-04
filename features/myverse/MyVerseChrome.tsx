"use client";

// Myverse 마케팅 헤더/푸터 — 앱 경로(/myverse/app/*)에서는 숨김 (풀 화면 모드)
//
// /myverse/app/* 진입 시 자체 AppTopNav가 헤더 역할. 외부 chrome은 제거.
// 이외 마케팅·핸들·온보딩 등 모든 경로에서는 정상 노출.

import { usePathname } from "next/navigation";
import { MyVerseHeader } from "./MyVerseHeader";
import { MyVerseFooter } from "./MyVerseFooter";

export function MyVerseChromeHeader() {
    const pathname = usePathname();
    if (pathname.startsWith("/myverse/app")) return null;
    return <MyVerseHeader />;
}

export function MyVerseChromeFooter() {
    const pathname = usePathname();
    if (pathname.startsWith("/myverse/app")) return null;
    return <MyVerseFooter />;
}

// pt-14 (헤더 높이) 보정도 앱 경로에선 제거
export function MyVerseChromeMain({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isApp = pathname.startsWith("/myverse/app");
    return (
        <main className={isApp ? "flex-1" : "flex-1 pt-14"}>
            {children}
        </main>
    );
}
