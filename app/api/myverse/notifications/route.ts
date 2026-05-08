// 알림 목록 + 읽음 처리

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const unreadOnly = url.searchParams.get("unread") === "1";

    const admin = createAdminClient();
    let q = admin
        .from("myverse_notifications")
        .select("id, actor_id, type, moment_id, comment_id, read_at, created_at")
        .eq("recipient_id", memberId)
        .order("created_at", { ascending: false })
        .limit(50);
    if (unreadOnly) q = q.is("read_at", null);

    const { data: notifs } = await q;
    if (!notifs || notifs.length === 0) {
        return NextResponse.json({ notifications: [], unread_count: 0 });
    }

    const actorIds = Array.from(new Set(notifs.map(n => n.actor_id as string)));
    const { data: actors } = await admin
        .from("members")
        .select("id, name, handle, avatar_url")
        .in("id", actorIds);
    const byId = new Map((actors ?? []).map(a => [a.id, a]));

    const enriched = notifs.map(n => ({ ...n, actor: byId.get(n.actor_id as string) ?? null }));
    const unread_count = notifs.filter(n => !n.read_at).length;

    return NextResponse.json({ notifications: enriched, unread_count });
}

export async function POST() {
    // 모두 읽음 처리
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const admin = createAdminClient();
    await admin
        .from("myverse_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_id", memberId)
        .is("read_at", null);
    return NextResponse.json({ ok: true });
}
