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
        .select('id, name, email, avatar_url')
        .eq('email', user.email!)
        .maybeSingle();
    return member;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const member = await getMember();
    if (!member) {
        redirect("/login?redirect=/planners/app");
    }

    const plannerUser = await getPlannerUser(member.id);

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

    return (
        <>
            <PlannersThemeProvider />
            <PwaRegister />
            <Suspense><WelcomeTracker /></Suspense>
            <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
                <AppTopNav
                    mode={plannerUser.mode}
                    userName={member.name || undefined}
                    avatarUrl={member.avatar_url || undefined}
                    subscriptionStatus={plannerUser.subscription_status}
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
