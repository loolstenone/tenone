// 모먼트 신고
// POST /api/myverse/moments/[id]/report  body: { reason, detail? }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const VALID_REASONS = new Set(["spam", "sexual", "violence", "hate", "self_harm", "illegal", "other"]);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const reason = typeof body?.reason === "string" ? body.reason : "";
    const detail = typeof body?.detail === "string" ? body.detail.slice(0, 1000) : null;

    if (!VALID_REASONS.has(reason)) return NextResponse.json({ error: "invalid_reason" }, { status: 400 });

    const admin = createAdminClient();

    // 모먼트 존재 확인 + 자기 자신 신고 차단
    const { data: moment } = await admin
        .from("myverse_daily_moments")
        .select("id, member_id")
        .eq("id", id)
        .maybeSingle();
    if (!moment) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (moment.member_id === memberId) return NextResponse.json({ error: "cannot_report_own" }, { status: 400 });

    const { error } = await admin.from("myverse_moment_reports").insert({
        moment_id: id, reporter_id: memberId, reason, detail,
    });
    if (error) {
        if (error.code === "23505") return NextResponse.json({ ok: true, already: true });
        return NextResponse.json({ error: "insert_failed", message: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
