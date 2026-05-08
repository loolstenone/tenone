// 흔적 댓글
// GET /api/myverse/moments/[id]/comments
// POST /api/myverse/moments/[id]/comments  body: { body, parent_id? }
// DELETE /api/myverse/moments/[id]/comments?comment_id=...

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const admin = createAdminClient();

    // 공개 흔적만 댓글 조회 가능 (본인 비공개 댓글은 별도 처리)
    const { data: moment } = await admin
        .from("myverse_daily_moments")
        .select("visibility, member_id")
        .eq("id", id)
        .maybeSingle();
    if (!moment) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const memberId = await getMemberId();
    if (moment.visibility !== "public" && moment.member_id !== memberId) {
        return NextResponse.json({ error: "not_public" }, { status: 403 });
    }

    const { data: comments } = await admin
        .from("myverse_moment_comments")
        .select("id, parent_id, member_id, body, created_at, edited_at")
        .eq("moment_id", id)
        .order("created_at", { ascending: true });

    // 작성자 정보 일괄 조회
    const memberIds = Array.from(new Set((comments ?? []).map(c => c.member_id as string)));
    const { data: members } = memberIds.length > 0
        ? await admin.from("members").select("id, name, handle, avatar_url").in("id", memberIds)
        : { data: [] };
    const byId = new Map((members ?? []).map(m => [m.id, m]));

    const enriched = (comments ?? []).map(c => ({
        ...c,
        member: byId.get(c.member_id as string) ?? null,
    }));

    return NextResponse.json({ comments: enriched });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const text = String(body?.body || "").trim();
    const parent_id = typeof body?.parent_id === "string" ? body.parent_id : null;
    if (!text) return NextResponse.json({ error: "empty_body" }, { status: 400 });
    if (text.length > 500) return NextResponse.json({ error: "too_long" }, { status: 400 });

    const admin = createAdminClient();
    const { data: moment } = await admin
        .from("myverse_daily_moments")
        .select("id, member_id, visibility")
        .eq("id", id)
        .maybeSingle();
    if (!moment) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (moment.visibility !== "public" && moment.member_id !== memberId) {
        return NextResponse.json({ error: "not_public" }, { status: 403 });
    }

    const { data: created, error } = await admin.from("myverse_moment_comments").insert({
        moment_id: id,
        member_id: memberId,
        parent_id,
        body: text,
    }).select().single();

    if (error || !created) return NextResponse.json({ error: error?.message || "failed" }, { status: 500 });

    // 알림 — 본인 흔적이 아니면 흔적 주인에게, parent 있으면 parent 작성자에게도
    if (moment.member_id !== memberId) {
        await admin.from("myverse_notifications").insert({
            recipient_id: moment.member_id,
            actor_id: memberId,
            type: "comment",
            moment_id: id,
            comment_id: created.id,
        }).then(() => {}, () => {});
    }
    if (parent_id) {
        const { data: parent } = await admin.from("myverse_moment_comments").select("member_id").eq("id", parent_id).maybeSingle();
        if (parent && parent.member_id !== memberId && parent.member_id !== moment.member_id) {
            await admin.from("myverse_notifications").insert({
                recipient_id: parent.member_id,
                actor_id: memberId,
                type: "reply",
                moment_id: id,
                comment_id: created.id,
            }).then(() => {}, () => {});
        }
    }

    return NextResponse.json({ comment: created });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const commentId = new URL(req.url).searchParams.get("comment_id");
    if (!commentId) return NextResponse.json({ error: "missing_comment_id" }, { status: 400 });

    const admin = createAdminClient();
    // 댓글 작성자 또는 흔적 소유자만 삭제 가능
    const { data: comment } = await admin.from("myverse_moment_comments").select("id, member_id, moment_id").eq("id", commentId).maybeSingle();
    if (!comment || comment.moment_id !== id) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const { data: moment } = await admin.from("myverse_daily_moments").select("member_id").eq("id", id).maybeSingle();
    const ownerOk = comment.member_id === memberId || moment?.member_id === memberId;
    if (!ownerOk) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    await admin.from("myverse_moment_comments").delete().eq("id", commentId);
    return NextResponse.json({ ok: true });
}
