// 캡슐 열기 — open_at 이후에만 가능. opened_at 기록.
// POST /api/myverse/capsules/[id]/open  body: { note_after_open?: string }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const note = typeof body?.note_after_open === "string" ? body.note_after_open.slice(0, 1000) : null;

    const admin = createAdminClient();
    const { data: existing, error: getErr } = await admin
        .from("myverse_time_capsules")
        .select("id, member_id, open_at, opened_at")
        .eq("id", id)
        .single();

    if (getErr || !existing) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (existing.member_id !== memberId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const today = new Date().toISOString().slice(0, 10);
    if (existing.open_at > today) {
        return NextResponse.json({ error: "still_locked", open_at: existing.open_at }, { status: 400 });
    }

    const { error } = await admin
        .from("myverse_time_capsules")
        .update({
            opened_at: existing.opened_at ?? new Date().toISOString(),
            ...(note ? { note_after_open: note } : {}),
        })
        .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
