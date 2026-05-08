// Google Photos 연결 해제

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function POST() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    await admin
        .from("myverse_oauth_tokens")
        .delete()
        .eq("member_id", memberId)
        .eq("provider", "google_photos");

    return NextResponse.json({ ok: true });
}
