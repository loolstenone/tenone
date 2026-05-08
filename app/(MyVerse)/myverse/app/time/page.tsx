import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ClientRedirect } from "@/components/ClientRedirect";
import { TimeTrackerView } from "@/features/myverse/planner/TimeTrackerView";
import { getMyverseUser } from "@/lib/myverse/client";

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
            auth: { storageKey: "tenone-auth" },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { allowed: false };

    const { data: member } = await supabase
        .from("members")
        .select("id, member_roles!member_roles_member_id_fkey(role,is_active)")
        .eq("email", user.email!)
        .maybeSingle();
    if (!member) return { allowed: false };

    const PRIVILEGED = new Set(["super_admin", "staff", "manager"]);
    type RoleRow = { role: string; is_active: boolean };
    const m = member as { member_roles?: RoleRow[] | null };
    const isPrivileged = m.member_roles?.some(r => r.is_active && PRIVILEGED.has(r.role)) ?? false;
    if (isPrivileged) return { allowed: true };

    const myverseUser = await getMyverseUser((member as { id: string }).id);
    return { allowed: !!myverseUser?.time_tracking };
}

export default async function TimePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const { allowed } = await checkAccess();
    if (!allowed) return <ClientRedirect to="/myverse/app/settings?section=mode" />;

    const params = await searchParams;
    const date = params.date || todayKST();
    return <TimeTrackerView initialDate={date} />;
}
