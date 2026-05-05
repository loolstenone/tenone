// Myverse 앱 쉘 — 서버 사이드 인증 + 4 Pillars 사이드바 + 인디고 테마
//
// SmarComm·WIO 패턴 — server redirect()는 Next.js 16 dev router의 prefetch 무한 루프 버그를
// 트리거하므로 인증 게이트는 ClientRedirect 컴포넌트로 처리. server는 항상 200 응답.

import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
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

type AuthState =
    | { kind: "no_session" }
    | { kind: "no_member"; email: string }
    | { kind: "ok"; member: Record<string, unknown> };

async function getAuthState(): Promise<AuthState> {
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
    if (!user) return { kind: "no_session" };

    const admin = createAdminClient();
    const SELECT = "id, name, email, avatar_url, handle, auth_id, member_roles!member_roles_member_id_fkey(role,is_active), myverse_users!myverse_users_member_id_fkey(*)";

    // 1) auth_id로 먼저 (가장 정확) — onboarding API와 동일한 우선순위
    let { data: member } = await admin.from("members").select(SELECT).eq("auth_id", user.id).maybeSingle();

    // 2) auth_id 비어 있으면 email로 — 중복 row 있을 수 있어 가장 최근 것
    if (!member && user.email) {
        const { data: byEmail } = await admin
            .from("members").select(SELECT)
            .eq("email", user.email)
            .order("created_at", { ascending: false })
            .limit(1);
        member = byEmail?.[0] ?? null;
    }

    if (!member) return { kind: "no_member", email: user.email! };
    return { kind: "ok", member };
}

const PRIVILEGED = new Set(["super_admin", "staff", "manager"]);
type RoleRow = { role: string; is_active: boolean };

function isPrivileged(member: { member_roles?: RoleRow[] | null } | null): boolean {
    if (!member?.member_roles) return false;
    return member.member_roles.some(r => r.is_active && PRIVILEGED.has(r.role));
}

export default async function MyverseAppLayout({ children }: { children: React.ReactNode }) {
    // 온보딩은 layout 인증 게이트·앱 셸을 우회 (자체 페이지에서 클라이언트 인증 처리)
    // 이렇게 하면 /myverse/app/onboarding URL을 유지하면서 layout 무한 redirect 루프를 회피.
    const h = await headers();
    const pathname = h.get('x-pathname') || '';
    const isOnboarding = pathname === '/myverse/app/onboarding' || pathname.startsWith('/myverse/app/onboarding/');
    if (isOnboarding) {
        return <>{children}</>;
    }

    const state = await getAuthState();

    // 세션 없음 → 로그인. /login에서 인증되면 redirect 파라미터로 돌아옴.
    if (state.kind === "no_session") {
        return <ClientRedirect to="/login?redirect=/myverse/app" />;
    }

    // 세션 있는데 members row 없음 → 온보딩으로 (무한 루프 방지)
    // 이전 버그: /login으로 보내면 /login은 authenticated 감지 → router.replace('/myverse/app')
    // → layout 재진입 → ClientRedirect → /login → ... 무한 깜빡임.
    if (state.kind === "no_member") {
        return <ClientRedirect to="/myverse/app/onboarding" />;
    }

    const data = state.member as {
        id: string;
        name: string | null;
        email: string;
        avatar_url: string | null;
        handle: string | null;
        member_roles?: RoleRow[] | null;
        myverse_users?: PlannerUser[];
    };
    const { myverse_users, ...member } = data;
    const plannerUser: PlannerUser | null = myverse_users?.[0] ?? null;
    const privileged = isPrivileged(member);

    if (!privileged) {
        if (!plannerUser || !plannerUser.onboarding_completed) {
            return <ClientRedirect to="/myverse/app/onboarding" />;
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
