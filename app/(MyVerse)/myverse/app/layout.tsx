// Myverse 앱 쉘 — 서버 사이드 인증 + 4 Pillars 사이드바 + 인디고 테마
//
// Phase 1: PP /planners/app 의 인증·구독 게이트 패턴을 그대로 흡수.
// 기존 7 탭(me·log·plan·dream·work·ai·verse)도 사이드바를 통해 접근 가능 (점진적 통합).

import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPlannerUser } from "@/lib/planners/client";
import { MyverseSidebar } from "@/features/myverse/MyverseSidebar";
import { MyverseAppHeader } from "@/features/myverse/MyverseAppHeader";

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
            redirect("/planners/onboarding");
        }
        if (
            plannerUser.subscription_status === "active" &&
            plannerUser.subscription_expires_at &&
            new Date(plannerUser.subscription_expires_at) < new Date()
        ) {
            plannerUser.subscription_status = "expired";
        }
        if (plannerUser.subscription_status === "expired") {
            redirect("/planners/purchase?expired=1");
        }
    }

    const handle = (member as { handle?: string | null }).handle ?? null;

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            <MyverseAppHeader
                name={member.name ?? null}
                handle={handle}
                avatarUrl={member.avatar_url ?? null}
            />
            <div className="flex flex-1 min-h-0">
                <MyverseSidebar handle={handle} />
                <main className="flex-1 min-w-0 overflow-x-clip pb-20 md:pb-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
