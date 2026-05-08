// DM 스레드 목록 + 새 스레드 시작
// GET  /api/myverse/dm/threads             내가 참여 중인 스레드 (최근순)
// POST /api/myverse/dm/threads { handle }  대화 시작/조회 (idempotent)

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

function threadKey(a: string, b: string): string {
    return a < b ? `${a}_${b}` : `${b}_${a}`;
}

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();

    const { data: threads } = await admin
        .from("myverse_dm_threads")
        .select("id, member_a, member_b, last_message_at, last_preview, created_at")
        .or(`member_a.eq.${memberId},member_b.eq.${memberId}`)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(50);

    if (!threads || threads.length === 0) {
        return NextResponse.json({ threads: [] });
    }

    const otherIds = Array.from(new Set(threads.map(t => t.member_a === memberId ? t.member_b : t.member_a)));
    const { data: others } = await admin
        .from("members")
        .select("id, name, handle, avatar_url")
        .in("id", otherIds);
    const byId = new Map((others ?? []).map(o => [o.id, o]));

    // 미읽음 카운트 — 각 스레드별 상대가 보낸 read_at NULL 메시지 수
    const threadIds = threads.map(t => t.id);
    const { data: unreadRows } = await admin
        .from("myverse_dm_messages")
        .select("thread_id")
        .in("thread_id", threadIds)
        .neq("sender_id", memberId)
        .is("read_at", null)
        .is("deleted_at", null);
    const unreadByThread = new Map<string, number>();
    for (const r of unreadRows ?? []) {
        unreadByThread.set(r.thread_id as string, (unreadByThread.get(r.thread_id as string) ?? 0) + 1);
    }

    const enriched = threads.map(t => ({
        id: t.id,
        last_message_at: t.last_message_at,
        last_preview: t.last_preview,
        unread: unreadByThread.get(t.id as string) ?? 0,
        other: byId.get(t.member_a === memberId ? t.member_b : t.member_a) ?? null,
    }));

    return NextResponse.json({ threads: enriched });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const handle = typeof body?.handle === "string" ? body.handle.trim().replace(/^@/, "") : "";
    const targetMemberId = typeof body?.member_id === "string" ? body.member_id : null;

    const admin = createAdminClient();
    let other: { id: string; name: string | null; handle: string | null; avatar_url: string | null } | null = null;

    if (targetMemberId) {
        const { data } = await admin.from("members")
            .select("id, name, handle, avatar_url")
            .eq("id", targetMemberId).maybeSingle();
        other = data;
    } else if (handle) {
        const { data } = await admin.from("members")
            .select("id, name, handle, avatar_url")
            .eq("handle", handle).maybeSingle();
        other = data;
    }

    if (!other) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    if (other.id === memberId) return NextResponse.json({ error: "cannot_dm_self" }, { status: 400 });

    const key = threadKey(memberId, other.id);

    const { data: existing } = await admin
        .from("myverse_dm_threads")
        .select("id, member_a, member_b, last_message_at, last_preview")
        .eq("thread_key", key)
        .maybeSingle();

    if (existing) {
        return NextResponse.json({ thread: { ...existing, other } });
    }

    const a = memberId < other.id ? memberId : other.id;
    const b = memberId < other.id ? other.id : memberId;
    const { data: created, error } = await admin
        .from("myverse_dm_threads")
        .insert({ thread_key: key, member_a: a, member_b: b })
        .select("id, member_a, member_b, last_message_at, last_preview")
        .single();

    if (error) return NextResponse.json({ error: "insert_failed", message: error.message }, { status: 500 });
    return NextResponse.json({ thread: { ...created, other } });
}
