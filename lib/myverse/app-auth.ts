// AI 플래너 앱 공통 인증 — 세션 → members → member_roles + myverse_users
// MyVerse 앱(/myverse/app, 동결)과 Planner's AI 플래너(/planners/app)가 같이 쓴다 (2026-10-14 MyVerse 레이아웃에서 분리)
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthState =
    | { kind: "no_session" }
    | { kind: "no_member"; email: string }
    | { kind: "ok"; member: Record<string, unknown> };

export async function getAuthState(): Promise<AuthState> {
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

    // members 기본 쿼리 — FK join 없이 안정적으로 조회
    const BASE = "id, name, email, avatar_url, handle, auth_id";

    // 1) 세션 기반 anon client로 조회 — RLS: auth.uid() = auth_id (SERVICE_ROLE_KEY 불필요)
    let { data: baseMember, error: anonErr } = await supabase.from("members").select(BASE).eq("auth_id", user.id).maybeSingle();

    // 2) anon 실패 시 admin client로 재시도
    if (!baseMember) {
        if (anonErr) console.error("[myverse/app/layout] members anon lookup error:", anonErr.message);
        const { data: adminMember, error: adminErr } = await admin.from("members").select(BASE).eq("auth_id", user.id).maybeSingle();
        if (adminErr) console.error("[myverse/app/layout] members admin lookup error:", adminErr.message);
        baseMember = adminMember;
    }

    // 3) auth_id 미매핑 → email로 fallback
    if (!baseMember && user.email) {
        const { data: byEmail } = await admin
            .from("members").select(BASE)
            .eq("email", user.email)
            .order("created_at", { ascending: false })
            .limit(1);
        baseMember = byEmail?.[0] ?? null;
    }

    if (!baseMember) return { kind: "no_member", email: user.email! };

    // member_roles + myverse_users 별도 조회
    const [{ data: roles, error: rolesErr }, { data: myverseRows, error: myverseErr }] = await Promise.all([
        admin.from("member_roles").select("role,is_active").eq("member_id", baseMember.id),
        admin.from("myverse_users").select("*").eq("member_id", baseMember.id).limit(1),
    ]);

    if (rolesErr) console.error("[myverse/app/layout] member_roles error:", rolesErr.message);
    if (myverseErr) console.error("[myverse/app/layout] myverse_users error:", myverseErr.message);

    const member = {
        ...baseMember,
        member_roles: roles ?? [],
        myverse_users: myverseRows ?? [],
    };

    return { kind: "ok", member };
}

const PRIVILEGED = new Set(["super_admin", "staff", "manager"]);
export type RoleRow = { role: string; is_active: boolean };

export function isPrivileged(member: { member_roles?: RoleRow[] | null } | null): boolean {
    if (!member?.member_roles) return false;
    return member.member_roles.some(r => r.is_active && PRIVILEGED.has(r.role));
}
