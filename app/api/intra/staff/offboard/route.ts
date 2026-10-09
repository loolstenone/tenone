/** 퇴사 처리 — 인사(hr) 직무 또는 마스터만. 일반 회원 권한만 남기고 전부 회수 (lib/staff-lifecycle.ts) */
import { NextResponse, type NextRequest } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { canManageStaff, offboardStaff } from "@/lib/staff-lifecycle";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    if (auth.kind !== "user" || !(await canManageStaff(auth.memberId))) {
        return NextResponse.json({ error: "퇴사 처리는 인사 담당 또는 마스터만 할 수 있습니다" }, { status: 403 });
    }
    const body = await req.json().catch(() => null) as { memberId?: string; leftAt?: string } | null;
    if (!body?.memberId || !body.leftAt || !/^\d{4}-\d{2}-\d{2}$/.test(body.leftAt)) {
        return NextResponse.json({ error: "memberId · 퇴사일(YYYY-MM-DD) 확인" }, { status: 400 });
    }
    try {
        return NextResponse.json({ ok: true, ...(await offboardStaff(body.memberId, body.leftAt, auth.memberId)) });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
}
