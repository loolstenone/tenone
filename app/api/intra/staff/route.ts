/**
 * 직원 입·퇴사 현황(GET) · 입사 초대(POST) — 처리는 인사(hr) 직무 또는 마스터만 (lib/staff-lifecycle.ts)
 */
import { NextResponse, type NextRequest } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageStaff, inviteStaff } from "@/lib/staff-lifecycle";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const { data, error } = await createAdminClient().from("tenone_staff_profiles")
        .select("member_id, employee_id, department, position, employment_type, hire_date, status, preset, invited_at, left_at, members!inner(name, email)")
        .order("invited_at", { ascending: false, nullsFirst: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const canManage = auth.kind === "user" && (await canManageStaff(auth.memberId));
    return NextResponse.json({ staff: data ?? [], canManage });
}

export async function POST(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    if (auth.kind !== "user" || !(await canManageStaff(auth.memberId))) {
        return NextResponse.json({ error: "입사 처리는 인사 담당 또는 마스터만 할 수 있습니다" }, { status: 403 });
    }
    const body = await req.json().catch(() => null);
    if (!body?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || !body?.name || !body?.preset) {
        return NextResponse.json({ error: "이름 · 이메일 · 권한 묶음은 필수입니다" }, { status: 400 });
    }
    try {
        const r = await inviteStaff(body, auth.memberId, req.nextUrl.origin);
        return NextResponse.json({ ok: true, ...r });
    } catch (e) {
        console.error("[staff/invite]", e);
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
