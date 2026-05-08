// DM 메시지 — 한 스레드의 메시지 목록 + 전송
// GET  /api/myverse/dm/threads/[id]/messages    오래된 → 최신
// POST /api/myverse/dm/threads/[id]/messages  body: { body: string }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

async function authorizeThread(admin: ReturnType<typeof createAdminClient>, threadId: string, memberId: string) {
    const { data: thread } = await admin
        .from("myverse_dm_threads")
        .select("id, member_a, member_b")
        .eq("id", threadId)
        .maybeSingle();
    if (!thread) return null;
    if (thread.member_a !== memberId && thread.member_b !== memberId) return null;
    return thread as { id: string; member_a: string; member_b: string };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const admin = createAdminClient();
    const thread = await authorizeThread(admin, id, memberId);
    if (!thread) return NextResponse.json({ error: "not_found_or_forbidden" }, { status: 404 });

    const { data: messages } = await admin
        .from("myverse_dm_messages")
        .select("id, sender_id, body, created_at, read_at, deleted_at")
        .eq("thread_id", id)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(200);

    // 내가 받은 미읽음 메시지 일괄 읽음 처리
    await admin
        .from("myverse_dm_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("thread_id", id)
        .neq("sender_id", memberId)
        .is("read_at", null);

    // 상대 정보
    const otherId = thread.member_a === memberId ? thread.member_b : thread.member_a;
    const { data: other } = await admin
        .from("members")
        .select("id, name, handle, avatar_url")
        .eq("id", otherId)
        .maybeSingle();

    return NextResponse.json({ messages: messages ?? [], other });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const text = typeof body?.body === "string" ? body.body.trim() : "";
    if (!text || text.length > 2000) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

    const admin = createAdminClient();
    const thread = await authorizeThread(admin, id, memberId);
    if (!thread) return NextResponse.json({ error: "not_found_or_forbidden" }, { status: 404 });

    const { data: msg, error } = await admin
        .from("myverse_dm_messages")
        .insert({ thread_id: id, sender_id: memberId, body: text })
        .select("id, sender_id, body, created_at, read_at")
        .single();
    if (error) return NextResponse.json({ error: "insert_failed", message: error.message }, { status: 500 });

    // 스레드 last_* 업데이트
    await admin
        .from("myverse_dm_threads")
        .update({ last_message_at: msg.created_at, last_preview: text.slice(0, 120) })
        .eq("id", id);

    // 알림 — 상대에게
    const otherId = thread.member_a === memberId ? thread.member_b : thread.member_a;
    if (otherId !== memberId) {
        await admin.from("myverse_notifications").insert({
            recipient_id: otherId,
            actor_id: memberId,
            type: "dm",
            thread_id: id,
        });
    }

    return NextResponse.json({ message: msg });
}
