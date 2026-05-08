// Google Photos 연결 상태 — 토큰 노출 없이 메타만 반환

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data } = await admin
        .from("myverse_oauth_tokens")
        .select("provider, connected_at, last_sync_at, last_sync_count, raw_profile")
        .eq("member_id", memberId)
        .eq("provider", "google_photos")
        .maybeSingle();

    return NextResponse.json({ integration: data });
}
