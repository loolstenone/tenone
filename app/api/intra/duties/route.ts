/**
 * 직무 권한 부여·회수 — 조회는 직원, 변경은 super_admin만 (2026-10-10)
 *   SSOT: lib/staff-duties.ts · DB 정책: sql/staff-duty-roles.sql
 *   변경 후 대상자는 다음 토큰 갱신(최대 1시간) 또는 재로그인부터 적용된다 (JWT app_metadata.roles)
 */
import { NextResponse, type NextRequest } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { DUTY_KEYS } from "@/lib/staff-duties";

export const dynamic = "force-dynamic";

const STAFF_LEVELS = ["staff", "manager", "super_admin", "crew"];

async function isSuperAdmin(memberId: string | null): Promise<boolean> {
    if (!memberId) return false;
    const { data } = await createAdminClient().from("member_roles").select("id")
        .eq("member_id", memberId).eq("role", "super_admin").eq("context", "universe").eq("is_active", true).limit(1);
    return (data ?? []).length > 0;
}

export async function GET(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const admin = createAdminClient();
    const { data, error } = await admin.from("member_roles")
        .select("member_id, role, context, members!member_roles_member_id_fkey(name, email)")
        .eq("is_active", true)
        .or(`and(context.eq.universe,role.in.(${STAFF_LEVELS.join(",")})),context.eq.duty`);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const people: Record<string, { member_id: string; name: string; email: string; levels: string[]; duties: string[] }> = {};
    for (const r of (data ?? []) as unknown as { member_id: string; role: string; context: string; members: { name: string; email: string } | null }[]) {
        const p = (people[r.member_id] ??= { member_id: r.member_id, name: r.members?.name ?? "", email: r.members?.email ?? "", levels: [], duties: [] });
        (r.context === "duty" ? p.duties : p.levels).push(r.role);
    }
    const canEdit = auth.kind === "user" && (await isSuperAdmin(auth.memberId));
    return NextResponse.json({ people: Object.values(people).filter(p => p.levels.length), canEdit });
}

export async function POST(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    if (auth.kind !== "user" || !(await isSuperAdmin(auth.memberId))) {
        return NextResponse.json({ error: "직무 권한은 마스터만 부여·회수할 수 있습니다" }, { status: 403 });
    }
    const body = await req.json().catch(() => null) as { memberId?: string; duty?: string; grant?: boolean } | null;
    if (!body?.memberId || !body.duty || !DUTY_KEYS.includes(body.duty) || typeof body.grant !== "boolean") {
        return NextResponse.json({ error: "memberId · duty · grant 확인" }, { status: 400 });
    }
    const admin = createAdminClient();
    if (body.grant) {
        const { data: existing } = await admin.from("member_roles").select("id")
            .eq("member_id", body.memberId).eq("role", body.duty).eq("context", "duty").eq("is_active", true).limit(1);
        if (!(existing ?? []).length) {
            const { error } = await admin.from("member_roles").insert({
                member_id: body.memberId, role: body.duty, context: "duty", is_active: true, granted_by: auth.memberId,
            });
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        }
    } else {
        const { error } = await admin.from("member_roles").update({ is_active: false })
            .eq("member_id", body.memberId).eq("role", body.duty).eq("context", "duty").eq("is_active", true);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
