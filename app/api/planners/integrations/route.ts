import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data } = await admin
        .from("planners_integrations")
        .select("id, provider, status, external_email, external_name, sync_direction, last_sync_at, created_at")
        .eq("member_id", memberId)
        .order("created_at");

    return NextResponse.json({ integrations: data ?? [] });
}

export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { provider } = body;
    if (!provider) return NextResponse.json({ error: "provider_required" }, { status: 400 });

    const admin = createAdminClient();
    await admin
        .from("planners_integrations")
        .update({ status: "disconnected", access_token: null, refresh_token: null, updated_at: new Date().toISOString() })
        .eq("member_id", memberId)
        .eq("provider", provider);

    // 캐시된 이벤트도 삭제
    if (provider === "google_calendar" || provider === "ical") {
        await admin.from("planners_external_events").delete().eq("member_id", memberId).eq("provider", provider);
    }

    return NextResponse.json({ ok: true });
}
