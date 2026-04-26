import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyFeedUrl } from "@/lib/planners/ical";
import { getMemberId } from "@/lib/planners/auth";

export const maxDuration = 15;

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { feed_url } = await req.json();
    if (!feed_url || typeof feed_url !== "string") {
        return NextResponse.json({ error: "feed_url_required" }, { status: 400 });
    }

    const { ok, eventCount, error } = await verifyFeedUrl(feed_url);
    if (!ok) return NextResponse.json({ error: error ?? "invalid_feed" }, { status: 400 });

    const admin = createAdminClient();
    await admin.from("planners_integrations").upsert({
        member_id: memberId,
        provider: "ical",
        status: "active",
        access_token: feed_url,
        sync_direction: "read",
        updated_at: new Date().toISOString(),
    }, { onConflict: "member_id,provider" });

    return NextResponse.json({ ok: true, eventCount });
}
