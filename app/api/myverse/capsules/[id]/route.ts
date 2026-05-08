// 캡슐 상세 — 잠금 해제일이 지났을 때만 message 본문 반환
// GET /api/myverse/capsules/[id]
// POST /api/myverse/capsules/[id]/open  (open_at 도달 시 opened_at 기록)

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_time_capsules")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (data.member_id !== memberId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const today = new Date().toISOString().slice(0, 10);
    const isReady = data.open_at <= today;

    // 잠겨 있을 때는 message 가림
    return NextResponse.json({
        capsule: {
            id: data.id,
            created_at: data.created_at,
            open_at: data.open_at,
            opened_at: data.opened_at,
            title: data.title,
            message: isReady ? data.message : null,
            image_urls: isReady ? data.image_urls : [],
            note_after_open: data.note_after_open,
            status: data.opened_at ? "opened" : isReady ? "ready" : "pending",
        },
    });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const admin = createAdminClient();
    const { error } = await admin
        .from("myverse_time_capsules")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
