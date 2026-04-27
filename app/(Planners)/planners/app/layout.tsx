import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AppTopNav } from "@/features/planners/AppTopNav";
import { AppMonthBar } from "@/features/planners/AppMonthBar";
import { PwaRegister } from "@/features/planners/PwaRegister";
import { BetaFeedbackButton } from "@/features/planners/BetaFeedbackButton";
import { WelcomeTracker } from "@/features/planners/WelcomeTracker";
import { getPlannerUser } from "@/lib/planners/client";
import { PlannersThemeProvider } from "@/features/planners/PlannersThemeProvider";

async function getMember() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() { /* read-only */ },
            },
            auth: { storageKey: 'tenone-auth' },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: member } = await supabase
        .from('members')
        .select('id, name, email, avatar_url, member_roles!member_roles_member_id_fkey(role,is_active)')
        .eq('email', user.email!)
        .maybeSingle();
    return member;
}

const PRIVILEGED_ROLES = new Set(['super_admin', 'staff', 'manager']);

function isPrivileged(member: { member_roles?: Array<{ role: string; is_active: boolean }> | null } | null): boolean {
    if (!member?.member_roles) return false;
    return member.member_roles.some((r) => r.is_active && PRIVILEGED_ROLES.has(r.role));
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const member = await getMember();
    if (!member) {
        redirect("/login?redirect=/planners/app");
    }

    const plannerUser = await getPlannerUser(member.id);
    const privileged = isPrivileged(member as { member_roles?: Array<{ role: string; is_active: boolean }> | null });

    // 마스터·매니저·스태프는 온보딩/구독 게이트 우회 (운영·테스트 진입)
    if (!privileged) {
        if (!plannerUser || !plannerUser.onboarding_completed) {
            redirect("/planners/onboarding");
        }

        if (
            plannerUser.subscription_status === 'active' &&
            plannerUser.subscription_expires_at &&
            new Date(plannerUser.subscription_expires_at) < new Date()
        ) {
            plannerUser.subscription_status = 'expired';
        }

        if (plannerUser.subscription_status === 'expired') {
            redirect("/planners/purchase?expired=1");
        }
    }

    return (
        <>
            <PlannersThemeProvider />
            <PwaRegister />
            <Suspense><WelcomeTracker /></Suspense>
            <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
                <AppTopNav
                    mode={plannerUser?.mode ?? 'all_in_one'}
                    userName={member.name || undefined}
                    avatarUrl={member.avatar_url || undefined}
                    subscriptionStatus={plannerUser?.subscription_status ?? 'free'}
                />
                <div className="flex flex-1 min-h-0">
                    <main className="flex-1 overflow-x-hidden min-w-0">
                        {children}
                    </main>
                    <AppMonthBar />
                </div>
            </div>
            <BetaFeedbackButton />
        </>
    );
}
