// 사용자 차단 — 목록 조회 / 차단 / 해제
// GET    /api/myverse/blocks                       내 차단 목록
// POST   /api/myverse/blocks  { blocked_id | handle }  차단
// DELETE /api/myverse/blocks?blocked_id=...          차단 해제

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data } = await admin
        .from("myverse_user_blocks")
        .select("blocked_id, created_at")
        .eq("blocker_id", memberId)
        .order("created_at", { ascending: false });

    if (!data || data.length === 0) return NextResponse.json({ blocks: [] });

    const ids = data.map(r => r.blocked_id);
    const { data: members } = await admin
        .from("members")
        .select("id, name, handle, avatar_url")
        .in("id", ids);
    const byId = new Map((members ?? []).map(m => [m.id, m]));
    return NextResponse.json({
        blocks: data.map(r => ({ ...r, member: byId.get(r.blocked_id) ?? null })),
    });
}

async function resolveTarget(admin: ReturnType<typeof createAdminClient>, body: Record<string, unknown>) {
    if (typeof body?.blocked_id === "string") {
        const { data } = await admin.from("members").select("id").eq("id", body.blocked_id).maybeSingle();
        return data?.id ?? null;
    }
    if (typeof body?.handle === "string") {
        const handle = body.handle.replace(/^@/, "").trim();
        if (!handle) return null;
        const { data } = await admin.from("members").select("id").eq("handle", handle).maybeSingle();
        return data?.id ?? null;
    }
    return null;
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const admin = createAdminClient();
    const targetId = await resolveTarget(admin, body);
    if (!targetId) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    if (targetId === memberId) return NextResponse.json({ error: "cannot_block_self" }, { status: 400 });

    const { error } = await admin.from("myverse_user_blocks").insert({ blocker_id: memberId, blocked_id: targetId });
    if (error && error.code !== "23505") {
        return NextResponse.json({ error: "insert_failed", message: error.message }, { status: 500 });
    }

    // 부수 효과: 양방향 팔로우 정리
    await admin.from("myverse_follows").delete()
        .or(`and(follower_id.eq.${memberId},following_id.eq.${targetId}),and(follower_id.eq.${targetId},following_id.eq.${memberId})`);

    return NextResponse.json({ ok: true, blocked_id: targetId });
}

export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const blockedId = url.searchParams.get("blocked_id");
    if (!blockedId) return NextResponse.json({ error: "missing_blocked_id" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
        .from("myverse_user_blocks")
        .delete()
        .eq("blocker_id", memberId)
        .eq("blocked_id", blockedId);
    if (error) return NextResponse.json({ error: "delete_failed", message: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
