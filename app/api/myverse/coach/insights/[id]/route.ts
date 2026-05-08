// 인사이트 카드 — 개별 액션 (dismiss / react)
// PATCH /api/myverse/coach/insights/[id]  body: { dismiss?: true, reaction?: "helpful" | "loved" | "not_helpful" }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const VALID_REACTIONS = new Set(["helpful", "loved", "not_helpful"]);

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const update: Record<string, unknown> = {};
    if (body?.dismiss === true) update.dismissed_at = new Date().toISOString();
    if (typeof body?.reaction === "string" && VALID_REACTIONS.has(body.reaction)) {
        update.reaction = body.reaction;
        update.reacted_at = new Date().toISOString();
    }
    if (Object.keys(update).length === 0) return NextResponse.json({ error: "no_change" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
        .from("myverse_coach_insights")
        .update(update)
        .eq("id", id)
        .eq("member_id", memberId);

    if (error) return NextResponse.json({ error: "update_failed", message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
