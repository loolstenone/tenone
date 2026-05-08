// 흔적 리액션 토글
// POST /api/myverse/moments/[id]/react   body: { type?: 'heart' | 'wow' | 'wish' | 'smile' }
// DELETE /api/myverse/moments/[id]/react?type=heart

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const VALID = ["heart", "wow", "wish", "smile"] as const;
type ReactionType = (typeof VALID)[number];

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const type = (typeof body?.type === "string" ? body.type : "heart") as ReactionType;
    if (!VALID.includes(type)) return NextResponse.json({ error: "invalid_type" }, { status: 400 });

    const admin = createAdminClient();
    // 공개 흔적인지 확인 (비공개 흔적엔 리액션 금지)
    const { data: moment } = await admin
        .from("myverse_daily_moments")
        .select("id, member_id, visibility")
        .eq("id", id)
        .maybeSingle();
    if (!moment) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (moment.visibility !== "public" && moment.member_id !== memberId) {
        return NextResponse.json({ error: "not_public" }, { status: 403 });
    }

    const { error } = await admin.from("myverse_moment_reactions").insert({
        moment_id: id, member_id: memberId, reaction_type: type,
    });
    if (error && !error.message.includes("duplicate")) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 본인 흔적이 아니면 알림
    if (moment.member_id !== memberId) {
        await admin.from("myverse_notifications").insert({
            recipient_id: moment.member_id,
            actor_id: memberId,
            type: "reaction",
            moment_id: id,
        }).then(() => {}, () => {});
    }

    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const type = new URL(req.url).searchParams.get("type") ?? "heart";
    if (!VALID.includes(type as ReactionType)) return NextResponse.json({ error: "invalid_type" }, { status: 400 });

    const admin = createAdminClient();
    await admin.from("myverse_moment_reactions")
        .delete()
        .eq("moment_id", id)
        .eq("member_id", memberId)
        .eq("reaction_type", type);

    return NextResponse.json({ ok: true });
}
