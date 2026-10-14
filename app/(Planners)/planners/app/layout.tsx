// Planner's 플래너'스 AI 앱 쉘 — MyVerse(동결)에서 옮겨 온 핵심 화면 (2026-10-14, app/(Planners)/CLAUDE.md '이전 계획' 4단계)
//
// - 로그인 안 됨 → 현재 페이지 위 LoginModal (§1.2.1 원칙 A) · 온보딩 안 함 → /planners/app/onboarding
// - ❌ 구독 게이트·구매 링크 없음 (통신판매업 신고 전) — MyVerse 쉘과 다른 점
// - 데이터·API는 MyVerse와 같다 (myverse_* 테이블 · /api/myverse/*)
// - server redirect() 대신 ClientRedirect (Next.js 16 dev router prefetch 루프 회피 — MyVerse 쉘과 같은 이유)

import Link from "next/link";
import { headers } from "next/headers";
import { ClientRedirect } from "@/components/ClientRedirect";
import { LoginRequired } from "@/components/LoginRequired";
import { MainContent } from "@/features/myverse/app/MainContent";
import { SidebarCollapseProvider } from "@/features/myverse/app/SidebarCollapseContext";
import { AppMonthBar } from "@/features/myverse/planner/AppMonthBar";
import { KeyboardShortcuts } from "@/features/myverse/planner/KeyboardShortcuts";
import { MyverseThemeProvider } from "@/features/myverse/app/MyverseThemeProvider";
import { PlannersAppTopBar } from "@/features/planners/app/PlannersAppTopBar";
import { PlannersAppSideNav } from "@/features/planners/app/PlannersAppSideNav";
import { getAuthState, isPrivileged, type RoleRow } from "@/lib/myverse/app-auth";
import type { MyverseUser } from "@/lib/myverse/types";

export const dynamic = "force-dynamic";

const ONBOARDING = "/planners/app/onboarding";

export default async function PlannersAppLayout({ children }: { children: React.ReactNode }) {
    const pathname = (await headers()).get("x-pathname") || "";
    const isOnboarding = pathname === ONBOARDING || pathname.startsWith(`${ONBOARDING}/`);
    const state = await getAuthState();

    if (isOnboarding) {
        // 이미 마친 사람·직원은 바로 오늘로
        if (state.kind === "ok") {
            const mu = (state.member as { myverse_users?: MyverseUser[] }).myverse_users?.[0];
            if (isPrivileged(state.member as { member_roles?: RoleRow[] }) || mu?.onboarding_completed) {
                return <ClientRedirect to="/planners/app/daily" />;
            }
        }
        return <>{children}</>;
    }

    if (state.kind === "no_session") {
        // 앱 화면은 사이트 헤더가 없으므로 돌아갈 길을 함께 둔다
        return (
            <div className="min-h-screen bg-white">
                <LoginRequired accentColor="#0F766E" message="플래너'스 AI는 로그인한 뒤 쓸 수 있습니다." />
                <p className="-mt-16 flex justify-center gap-4 text-sm text-neutral-500">
                    <Link href="/planners" className="hover:text-[#0F766E] hover:underline">Planner&apos;s 홈</Link>
                    <Link href="/planners/ai" className="hover:text-[#0F766E] hover:underline">플래너'스 AI 소개</Link>
                </p>
            </div>
        );
    }
    if (state.kind === "no_member") return <ClientRedirect to={ONBOARDING} />;

    const member = state.member as { member_roles?: RoleRow[] | null; myverse_users?: MyverseUser[] };
    const myverseUser = member.myverse_users?.[0] ?? null;
    if (!isPrivileged(member) && !myverseUser?.onboarding_completed) return <ClientRedirect to={ONBOARDING} />;

    return (
        <>
            {/* 앱 화면이 쓰는 아이콘 글꼴 (Material Symbols) — MyVerse 쉘과 같음 */}
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
                rel="stylesheet"
            />
            {/* 다크모드·사이드바 접힘 깜빡임 방지 — 저장 키는 MyVerse와 공유 */}
            <script dangerouslySetInnerHTML={{ __html: `(function(){try{var m=localStorage.getItem('myverse_theme_mode')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('myverse-dark');var c=localStorage.getItem('myverse_sidebar_collapsed')==='true';if(c)document.documentElement.classList.add('myverse-sidebar-collapsed');}catch(e){}})()` }} />
            <MyverseThemeProvider />
            <div className="myverse-app-shell flex min-h-screen flex-col bg-neutral-50 myverse-dark:bg-[#08080E]">
                <PlannersAppTopBar />
                <SidebarCollapseProvider>
                    <div className="flex min-h-0 flex-1 pt-12">
                        <PlannersAppSideNav />
                        <MainContent>{children}</MainContent>
                        <AppMonthBar />
                    </div>
                </SidebarCollapseProvider>
            </div>
            <KeyboardShortcuts />
        </>
    );
}
