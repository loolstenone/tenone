// Myverse 앱 쉘 — 서버 사이드 인증 + 4 Pillars 사이드바 + 인디고 테마
//
// SmarComm·WIO 패턴 — server redirect()는 Next.js 16 dev router의 prefetch 무한 루프 버그를
// 트리거하므로 인증 게이트는 ClientRedirect 컴포넌트로 처리. server는 항상 200 응답.

import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClientRedirect } from "@/components/ClientRedirect";
import { AppTopNav } from "@/features/myverse/planner/AppTopNav";
import { AppMonthBar } from "@/features/myverse/planner/AppMonthBar";
import { PwaRegister } from "@/features/myverse/planner/PwaRegister";
import { BetaFeedbackButton } from "@/features/myverse/planner/BetaFeedbackButton";
import { WelcomeTracker } from "@/features/myverse/planner/WelcomeTracker";
import { KeyboardShortcuts } from "@/features/myverse/planner/KeyboardShortcuts";
import { AiBriefingFab } from "@/features/myverse/planner/AiBriefingFab";
import { MobileBottomNav } from "@/features/myverse/planner/MobileBottomNav";
import { PlannersThemeProvider } from "@/features/myverse/planner/PlannersThemeProvider";
import type { PlannerMode, CustomMenuKey, PlannerUser } from "@/lib/myverse/types";

export const dynamic = "force-dynamic";

async function getMemberWithPlanner() {
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

    const admin = createAdminClient();
    const { data: member } = await admin
        .from("members")
        .select("id, name, email, avatar_url, handle, member_roles!member_roles_member_id_fkey(role,is_active), myverse_users!myverse_users_member_id_fkey(*)")
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
    const data = await getMemberWithPlanner();
    if (!data) {
        return <ClientRedirect to="/login?redirect=/myverse/app" />;
    }

    const { myverse_users, ...member } = data as typeof data & { myverse_users?: PlannerUser[] };
    const plannerUser: PlannerUser | null = myverse_users?.[0] ?? null;
    const privileged = isPrivileged(member as { member_roles?: RoleRow[] | null });

    if (!privileged) {
        if (!plannerUser || !plannerUser.onboarding_completed) {
            return <ClientRedirect to="/myverse/onboarding" />;
        }
        if (
            plannerUser.subscription_status === "active" &&
            plannerUser.subscription_expires_at &&
            new Date(plannerUser.subscription_expires_at) < new Date()
        ) {
            plannerUser.subscription_status = "expired";
        }
        if (plannerUser.subscription_status === "expired") {
            return <ClientRedirect to="/myverse/purchase?expired=1" />;
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
