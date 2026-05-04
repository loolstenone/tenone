// Myverse 앱 쉘 — 서버 사이드 인증 + 4 Pillars 사이드바 + 인디고 테마
//
// Phase 1: PP /planners/app 의 인증·구독 게이트 패턴을 그대로 흡수.
// 기존 7 탭(me·log·plan·dream·work·ai·verse)도 사이드바를 통해 접근 가능 (점진적 통합).

import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPlannerUser } from "@/lib/myverse/client";
import { AppTopNav } from "@/features/planners/AppTopNav";
import { AppMonthBar } from "@/features/planners/AppMonthBar";
import { PwaRegister } from "@/features/planners/PwaRegister";
import { BetaFeedbackButton } from "@/features/planners/BetaFeedbackButton";
import { WelcomeTracker } from "@/features/planners/WelcomeTracker";
import { KeyboardShortcuts } from "@/features/planners/KeyboardShortcuts";
import { AiBriefingFab } from "@/features/planners/AiBriefingFab";
import { MobileBottomNav } from "@/features/planners/MobileBottomNav";
import { PlannersThemeProvider } from "@/features/planners/PlannersThemeProvider";
import type { PlannerMode, CustomMenuKey } from "@/lib/myverse/types";

export const dynamic = "force-dynamic";

async function getMember() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
            auth: { storageKey: "tenone-auth" },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: member } = await supabase
        .from("members")
        .select("id, name, email, avatar_url, handle, member_roles!member_roles_member_id_fkey(role,is_active)")
        .eq("email", user.email!)
        .maybeSingle();
    return member;
}

const PRIVILEGED = new Set(["super_admin", "staff", "manager"]);
type RoleRow = { role: string; is_active: boolean };

function isPrivileged(member: { member_roles?: RoleRow[] | null } | null): boolean {
    if (!member?.member_roles) return false;
    return member.member_roles.some(r => r.is_active && PRIVILEGED.has(r.role));
}

export default async function MyverseAppLayout({ children }: { children: React.ReactNode }) {
    const member = await getMember();
    if (!member) {
        redirect("/login?redirect=/myverse/app");
    }

    const plannerUser = await getPlannerUser(member.id);
    const privileged = isPrivileged(member as { member_roles?: RoleRow[] | null });

    if (!privileged) {
        if (!plannerUser || !plannerUser.onboarding_completed) {
            redirect("/myverse/onboarding");
        }
        if (
            plannerUser.subscription_status === "active" &&
            plannerUser.subscription_expires_at &&
            new Date(plannerUser.subscription_expires_at) < new Date()
        ) {
            plannerUser.subscription_status = "expired";
        }
        if (plannerUser.subscription_status === "expired") {
            redirect("/myverse/purchase?expired=1");
        }
    }

    return (
        <>
            <PlannersThemeProvider />
            <PwaRegister />
            <Suspense><WelcomeTracker /></Suspense>
            <div className="planners-app-shell min-h-screen bg-neutral-50 flex flex-col">
                <AppTopNav
                    mode={(plannerUser?.mode === "all_in_one" || plannerUser?.mode === "custom" ? plannerUser.mode : "weekly") as PlannerMode}
                    userName={member.name || undefined}
                    avatarUrl={member.avatar_url || undefined}
                    subscriptionStatus={plannerUser?.subscription_status ?? "free"}
                    showTimeTracking={plannerUser?.time_tracking ?? false}
                    customMenus={(plannerUser?.custom_menus as CustomMenuKey[] | undefined) ?? []}
                />
                <div className="flex flex-1 min-h-0">
                    <main className="flex-1 [overflow-x:clip] min-w-0 pb-14 md:pb-0">
                        {children}
                    </main>
                    <AppMonthBar />
                </div>
            </div>
            <BetaFeedbackButton />
            <KeyboardShortcuts />
            <AiBriefingFab />
            <MobileBottomNav />
        </>
    );
}
