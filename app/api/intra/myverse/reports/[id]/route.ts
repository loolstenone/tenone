// 신고 상태 변경 (resolved/dismissed/reviewing) + 모먼트 강제 비공개 옵션
// PATCH /api/intra/myverse/reports/[id]  body: { status: "resolved"|"dismissed"|"reviewing", hide_moment?: true }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireIntraStaff } from "@/lib/myverse/intra-auth";

export const dynamic = "force-dynamic";

const VALID = new Set(["reviewing", "resolved", "dismissed"]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireIntraStaff();
    if (!auth.ok) return NextResponse.json({ error: "forbidden" }, { status: auth.status });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const status = typeof body?.status === "string" ? body.status : "";
    const hideMoment = body?.hide_moment === true;

    if (!VALID.has(status)) return NextResponse.json({ error: "invalid_status" }, { status: 400 });

    const admin = createAdminClient();
    const update: Record<string, unknown> = { status };
    if (status === "resolved" || status === "dismissed") update.resolved_at = new Date().toISOString();

    const { data: report, error } = await admin
        .from("myverse_moment_reports")
        .update(update)
        .eq("id", id)
        .select("moment_id")
        .maybeSingle();

    if (error) return NextResponse.json({ error: "update_failed", message: error.message }, { status: 500 });

    if (hideMoment && report?.moment_id) {
        await admin.from("myverse_daily_moments")
            .update({ visibility: "private" })
            .eq("id", report.moment_id);
    }

    return NextResponse.json({ ok: true });
}
