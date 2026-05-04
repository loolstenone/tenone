import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const patch: Record<string, unknown> = {};
    if (typeof body.caption === "string")     patch.caption = body.caption.slice(0, 500);
    if (typeof body.happened_at === "string") patch.happened_at = body.happened_at;
    else if (body.happened_at === null)       patch.happened_at = null;
    if (typeof body.with_whom === "string")   patch.with_whom = body.with_whom.slice(0, 200);
    if (typeof body.location === "string")    patch.location = body.location.slice(0, 200);
    if (typeof body.activity === "string")    patch.activity = body.activity.slice(0, 200);

    const admin = createAdminClient();
    const { error } = await admin
        .from("myverse_daily_moments")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const admin = createAdminClient();

    // 미디어 URL 가져와 storage 도 삭제 시도
    const { data: row } = await admin
        .from("myverse_daily_moments")
        .select("media_url, thumbnail_url")
        .eq("id", id)
        .eq("member_id", memberId)
        .maybeSingle();

    const { error } = await admin
        .from("myverse_daily_moments")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // storage 파일 best-effort 삭제
    if (row?.media_url) {
        const path = extractStoragePath(row.media_url, "planners-moments");
        if (path) await admin.storage.from("planners-moments").remove([path]);
    }
    if (row?.thumbnail_url) {
        const path = extractStoragePath(row.thumbnail_url, "planners-moments");
        if (path) await admin.storage.from("planners-moments").remove([path]);
    }
    return NextResponse.json({ ok: true });
}

function extractStoragePath(publicUrl: string, bucketName: string): string | null {
    const marker = `/object/public/${bucketName}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(publicUrl.slice(idx + marker.length));
}
