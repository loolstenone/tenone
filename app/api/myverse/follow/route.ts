// 팔로우 / 언팔로우 / 팔로우 상태 조회
// POST /api/myverse/follow      body: { handle } — 팔로우
// DELETE /api/myverse/follow?handle=xxx — 언팔로우
// GET /api/myverse/follow?handle=xxx — 상태 + 팔로워/팔로잉 수

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

async function lookupTarget(handle: string): Promise<{ id: string; name: string | null; avatar_url: string | null } | null> {
    const admin = createAdminClient();
    const { data } = await admin
        .from("members")
        .select("id, name, avatar_url")
        .eq("handle", handle.replace(/^@/, "").toLowerCase())
        .maybeSingle();
    return data;
}

export async function GET(req: Request) {
    const memberId = await getMemberId();
    const handle = new URL(req.url).searchParams.get("handle") ?? "";
    if (!handle) return NextResponse.json({ error: "missing_handle" }, { status: 400 });

    const target = await lookupTarget(handle);
    if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const admin = createAdminClient();
    const [followingRes, followersRes, isFollowingRes] = await Promise.all([
        admin.from("myverse_follows").select("*", { count: "exact", head: true }).eq("follower_id", target.id),
        admin.from("myverse_follows").select("*", { count: "exact", head: true }).eq("following_id", target.id),
        memberId
            ? admin.from("myverse_follows").select("id").eq("follower_id", memberId).eq("following_id", target.id).maybeSingle()
            : Promise.resolve({ data: null }),
    ]);

    return NextResponse.json({
        following_count: followingRes.count ?? 0,
        followers_count: followersRes.count ?? 0,
        is_following: !!isFollowingRes.data,
        is_self: memberId === target.id,
    });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const handle = String(body?.handle || "").trim();
    if (!handle) return NextResponse.json({ error: "missing_handle" }, { status: 400 });

    const target = await lookupTarget(handle);
    if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (target.id === memberId) return NextResponse.json({ error: "cannot_follow_self" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.from("myverse_follows").insert({
        follower_id: memberId,
        following_id: target.id,
    });
    if (error && !error.message.includes("duplicate")) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 알림
    await admin.from("myverse_notifications").insert({
        recipient_id: target.id,
        actor_id: memberId,
        type: "follow",
    }).then(() => {}, () => {});

    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const handle = new URL(req.url).searchParams.get("handle") ?? "";
    if (!handle) return NextResponse.json({ error: "missing_handle" }, { status: 400 });
    const target = await lookupTarget(handle);
    if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const admin = createAdminClient();
    await admin.from("myverse_follows")
        .delete()
        .eq("follower_id", memberId)
        .eq("following_id", target.id);

    return NextResponse.json({ ok: true });
}
