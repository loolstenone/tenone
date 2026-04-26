import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhook } from "@/lib/planners/slack";
import { getMemberId } from "@/lib/planners/auth";

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { webhook_url } = await req.json();
    if (!webhook_url || typeof webhook_url !== "string") {
        return NextResponse.json({ error: "webhook_url_required" }, { status: 400 });
    }

    const { ok } = await verifyWebhook(webhook_url);
    if (!ok) return NextResponse.json({ error: "invalid_webhook" }, { status: 400 });

    const admin = createAdminClient();
    await admin.from("planners_integrations").upsert({
        member_id: memberId,
        provider: "slack",
        status: "active",
        access_token: webhook_url,
        sync_direction: "write",
        updated_at: new Date().toISOString(),
    }, { onConflict: "member_id,provider" });

    return NextResponse.json({ ok: true });
}
