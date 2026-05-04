// 공유 기록 + 자동 공개화 API
// POST /api/myverse/share { table, id, channel, autoPublish? }
//
// 동작:
//   1. 본인 row 검증
//   2. autoPublish=true 면 visibility='public' 토글 (현재 private/friends → public)
//   3. share_count += 1
//   4. 단축 URL 반환 (myverse.kr/@handle/m/{id} 등)

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const ALLOWED_TABLES = new Set([
    "myverse_daily_moments",
    "myverse_daily_places",
    "myverse_daily_routines",
    "myverse_calendar_entries",
    "myverse_projects",
]);

const ALLOWED_CHANNELS = new Set([
    "copy", "x", "threads", "linkedin", "kakao", "facebook", "instagram", "email", "web_share",
]);

const TABLE_TO_PATH: Record<string, string> = {
    myverse_daily_moments: "m",
    myverse_daily_places: "p",
    myverse_daily_routines: "r",
    myverse_calendar_entries: "e",
    myverse_projects: "proj",
};

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const table = String(body.table ?? "");
    const id = String(body.id ?? "");
    const channel = String(body.channel ?? "");
    const autoPublish = Boolean(body.autoPublish);

    if (!ALLOWED_TABLES.has(table)) return NextResponse.json({ error: "invalid_table" }, { status: 400 });
    if (!ALLOWED_CHANNELS.has(channel)) return NextResponse.json({ error: "invalid_channel" }, { status: 400 });
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

    const admin = createAdminClient();

    // 본인 핸들 조회 (URL 생성용)
    const { data: member } = await admin
        .from("members")
        .select("id, handle")
        .eq("id", memberId)
        .maybeSingle();

    if (!member?.handle) {
        return NextResponse.json({ error: "no_handle", hint: "공유하려면 핸들 등록 필요" }, { status: 400 });
    }

    // row 가져와서 visibility 확인
    const { data: row } = await admin
        .from(table)
        .select("id, visibility, share_count")
        .eq("id", id)
        .eq("member_id", memberId)
        .maybeSingle();
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const updates: Record<string, unknown> = {
        share_count: ((row.share_count as number) ?? 0) + 1,
    };
    if (autoPublish && row.visibility !== "public") {
        updates.visibility = "public";
    }

    const { error } = await admin.from(table).update(updates).eq("id", id).eq("member_id", memberId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const pathPart = TABLE_TO_PATH[table];
    const shortPath = `/myverse/${member.handle}/${pathPart}/${id}`;
    const url = `https://myverse.kr${shortPath}`;

    return NextResponse.json({
        ok: true,
        url,
        path: shortPath,
        handle: member.handle,
        visibility: updates.visibility ?? row.visibility,
    });
}
