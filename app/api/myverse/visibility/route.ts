// 공개 범위 변경 API — 모든 capture 테이블 공통
// PATCH /api/myverse/visibility { table, id, visibility }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const ALLOWED_TABLES = new Set([
    "myverse_daily_moments",
    "myverse_daily_places",
    "myverse_daily_routines",
    "myverse_calendar_entries",
    "myverse_projects",
    "myverse_contacts",
    "myverse_daily",
]);

const ALLOWED_VIS = new Set(["private", "friends", "public"]);

export async function PATCH(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const table = String(body.table ?? "");
    const id = String(body.id ?? "");
    const visibility = String(body.visibility ?? "");

    if (!ALLOWED_TABLES.has(table)) {
        return NextResponse.json({ error: "invalid_table" }, { status: 400 });
    }
    if (!ALLOWED_VIS.has(visibility)) {
        return NextResponse.json({ error: "invalid_visibility" }, { status: 400 });
    }
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

    const admin = createAdminClient();
    const updates: Record<string, unknown> = { visibility };
    if (visibility === "public") {
        // share_count는 실제 외부 공유 시점에만 ++ — 여기서는 토글만
    }

    const { error } = await admin
        .from(table)
        .update(updates)
        .eq("id", id)
        .eq("member_id", memberId);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
