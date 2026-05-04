import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TimeTrackerView } from "@/features/planners/TimeTrackerView";
import { getPlannerUser } from "@/lib/myverse/client";

export const dynamic = "force-dynamic";

function todayKST(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
}

async function checkAccess(): Promise<{ allowed: boolean }> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() {},
            },
            auth: { storageKey: 'tenone-auth' },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { allowed: false };

    const { data: member } = await supabase
        .from('members')
        .select('id, member_roles!member_roles_member_id_fkey(role,is_active)')
        .eq('email', user.email!)
        .maybeSingle();
    if (!member) return { allowed: false };

    // 마스터·매니저·스태프는 항상 통과
    const PRIVILEGED = new Set(['super_admin', 'staff', 'manager']);
    type RoleRow = { role: string; is_active: boolean };
    const m = member as { member_roles?: RoleRow[] | null };
    const isPrivileged = m.member_roles?.some(r => r.is_active && PRIVILEGED.has(r.role)) ?? false;
    if (isPrivileged) return { allowed: true };

    // 일반 사용자는 time_tracking 토글이 ON일 때만
    const planner = await getPlannerUser((member as { id: string }).id);
    return { allowed: !!planner?.time_tracking };
}

export default async function TimePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const { allowed } = await checkAccess();
    if (!allowed) redirect("/planners/app/settings?section=mode");

    const params = await searchParams;
    const date = params.date || todayKST();
    return <TimeTrackerView initialDate={date} />;
}
