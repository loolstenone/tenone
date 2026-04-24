import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AppSidebar } from "@/features/planners/AppSidebar";
import { PwaRegister } from "@/features/planners/PwaRegister";
import { getPlannerUser } from "@/lib/planners/client";

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
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: member } = await supabase
        .from('members')
        .select('id, name, email')
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

    // 온보딩 미완료 → 온보딩으로
    if (!plannerUser || !plannerUser.onboarding_completed) {
        redirect("/planners/onboarding");
    }

    // 만료된 구독 자동 expired 처리
    if (
        plannerUser.subscription_status === 'active' &&
        plannerUser.subscription_expires_at &&
        new Date(plannerUser.subscription_expires_at) < new Date()
    ) {
        plannerUser.subscription_status = 'expired';
    }

    // 무료 구독 상태 → purchase로
    // (베타 기간 운영자는 'free'를 허용하고 싶으면 이 블록 주석 처리)
    if (plannerUser.subscription_status === 'expired') {
        redirect("/planners/purchase?expired=1");
    }

    return (
        <>
            <PwaRegister />
            <div className="flex min-h-screen bg-[#FAFAF7]">
                <AppSidebar
                    mode={plannerUser.mode}
                    userName={member.name || undefined}
                    subscriptionStatus={plannerUser.subscription_status}
                    subscriptionExpires={plannerUser.subscription_expires_at}
                />
                <main className="flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </>
    );
}
