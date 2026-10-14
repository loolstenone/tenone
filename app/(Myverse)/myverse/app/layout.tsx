// Myverse 앱 쉘 — 서버 사이드 인증 + 4 Pillars 사이드바 + 인디고 테마
//
// SmarComm·WIO 패턴 — server redirect()는 Next.js 16 dev router의 prefetch 무한 루프 버그를
// 트리거하므로 인증 게이트는 ClientRedirect 컴포넌트로 처리. server는 항상 200 응답.

import { Suspense } from "react";
import { getAuthState, isPrivileged, type RoleRow } from "@/lib/myverse/app-auth";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClientRedirect } from "@/components/ClientRedirect";
import { AppTopNav } from "@/features/myverse/planner/AppTopNav";
import { AppSideNav } from "@/features/myverse/app/AppSideNav";
import { MainContent } from "@/features/myverse/app/MainContent";
import { SidebarCollapseProvider } from "@/features/myverse/app/SidebarCollapseContext";
import { AppMonthBar } from "@/features/myverse/planner/AppMonthBar";
import { PwaRegister } from "@/features/myverse/app/PwaRegister";
import { BetaFeedbackButton } from "@/features/myverse/app/BetaFeedbackButton";
import { WelcomeTracker } from "@/features/myverse/app/WelcomeTracker";
import { KeyboardShortcuts } from "@/features/myverse/planner/KeyboardShortcuts";
import { MukkiFab } from "@/features/myverse/app/MukkiFab";
import { MobileBottomNav } from "@/features/myverse/app/MobileBottomNav";
import { MyverseThemeProvider } from "@/features/myverse/app/MyverseThemeProvider";
import type { MyverseMode, CustomMenuKey, MyverseUser } from "@/lib/myverse/types";
import { isMyverseSubscriberActive } from "@/lib/myverse/subscription";

export const dynamic = "force-dynamic";


export default async function MyverseAppLayout({ children }: { children: React.ReactNode }) {
    // 온보딩은 layout 인증 게이트·앱 셸을 우회 (자체 페이지에서 클라이언트 인증 처리)
    // 이렇게 하면 /planners/app/onboarding URL을 유지하면서 layout 무한 redirect 루프를 회피.
    const h = await headers();
    const pathname = h.get('x-pathname') || '';
    const isOnboarding = pathname === '/planners/app/onboarding' || pathname.startsWith('/planners/app/onboarding/');
    if (isOnboarding) {
        // 이미 완료한 사용자 또는 privileged → today로 바로
        const s = await getAuthState();
        if (s.kind === "ok") {
            const mu = (s.member as { myverse_users?: MyverseUser[] }).myverse_users?.[0];
            if (isPrivileged(s.member as { member_roles?: RoleRow[] }) || mu?.onboarding_completed) {
                return <ClientRedirect to="/myverse/app/capture" />;
            }
        }
        return <>{children}</>;
    }

    const state = await getAuthState();

    // 세션 없음 → 로그인. /login에서 인증되면 redirect 파라미터로 돌아옴.
    if (state.kind === "no_session") {
        return <ClientRedirect to="/myverse/login?redirect=/myverse/app" />;
    }

    // 세션 있는데 members row 없음 → 온보딩으로 (무한 루프 방지)
    // 단, 이미 onboarding URL에 있으면 무한 루프 — children 그대로 렌더
    if (state.kind === "no_member") {
        const currentPath = (await headers()).get('x-pathname') || '';
        const alreadyOnboarding = currentPath === '/planners/app/onboarding' || currentPath.startsWith('/planners/app/onboarding/') || currentPath === '/app/onboarding';
        if (alreadyOnboarding) return <>{children}</>;
        return <ClientRedirect to="/planners/app/onboarding" />;
    }

    const data = state.member as {
        id: string;
        name: string | null;
        email: string;
        avatar_url: string | null;
        handle: string | null;
        member_roles?: RoleRow[] | null;
        myverse_users?: MyverseUser[];
    };
    const { myverse_users, ...member } = data;
    const myverseUser: MyverseUser | null = myverse_users?.[0] ?? null;
    const privileged = isPrivileged(member);

    if (!privileged) {
        if (!myverseUser || !myverseUser.onboarding_completed) {
            return <ClientRedirect to="/planners/app/onboarding" />;
        }
        // 만료 검증 (SSOT 헬퍼)
        if (myverseUser.subscription_status === "active" && !isMyverseSubscriberActive(myverseUser)) {
            myverseUser.subscription_status = "expired";
            // DB best-effort 동기화 — 다음번 chat/cron이 정확한 상태를 보도록
            const syncAdmin = createAdminClient();
            syncAdmin.from("myverse_users").update({ subscription_status: "expired" }).eq("member_id", member.id).then(({ error }: { error: { message: string } | null }) => {
                if (error) console.error("[myverse/app/layout] expire sync failed:", error.message);
            });
        }
        if (myverseUser.subscription_status === "expired") {
            return <ClientRedirect to="/myverse/purchase?expired=1" />;
        }
    }

    return (
        <>
            {/* Stitch 디자인 폰트·아이콘 (Hanken Grotesk / Inter / Material Symbols) — 세션 122 */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link
                href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
                rel="stylesheet"
            />
            {/* 다크모드 + 사이드바 접힘 flash 방지 — React hydration 전에 동기적으로 실행 */}
            <script dangerouslySetInnerHTML={{ __html: `(function(){try{var m=localStorage.getItem('myverse_theme_mode')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('myverse-dark');var c=localStorage.getItem('myverse_sidebar_collapsed')==='true';if(c)document.documentElement.classList.add('myverse-sidebar-collapsed');}catch(e){}})()` }} />
            <MyverseThemeProvider />
            <PwaRegister />
            <Suspense><WelcomeTracker /></Suspense>
            <div className="myverse-app-shell min-h-screen bg-neutral-50 myverse-dark:bg-[#08080E] flex flex-col">
                <AppTopNav
                    mode={(myverseUser?.mode === "all_in_one" || myverseUser?.mode === "custom" ? myverseUser.mode : "weekly") as MyverseMode}
                    userName={member.name || undefined}
                    avatarUrl={member.avatar_url || undefined}
                    subscriptionStatus={myverseUser?.subscription_status ?? "free"}
                    showTimeTracking={myverseUser?.time_tracking ?? false}
                    customMenus={(myverseUser?.custom_menus as CustomMenuKey[] | undefined) ?? []}
                />
                <SidebarCollapseProvider>
                    <div className="flex flex-1 min-h-0 pt-12">
                        <AppSideNav />
                        <MainContent>{children}</MainContent>
                        <AppMonthBar />
                    </div>
                </SidebarCollapseProvider>
            </div>
            <BetaFeedbackButton />
            <KeyboardShortcuts />
            <MukkiFab />
            <MobileBottomNav />
        </>
    );
}
