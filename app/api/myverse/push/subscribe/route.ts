import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { endpoint, keys } = body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return NextResponse.json({ error: "invalid_subscription" }, { status: 400 });
    }

    const h = await headers();
    const userAgent = h.get("user-agent") || null;

    const admin = createAdminClient();
    await admin.from("myverse_push_subscriptions").upsert({
        member_id: memberId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: userAgent,
    }, { onConflict: "endpoint" });

    // 구독 등록 시 자동으로 push 알림 활성화
    await admin
        .from("myverse_users")
        .update({ notify_push_briefing: true, updated_at: new Date().toISOString() })
        .eq("member_id", memberId);

    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { endpoint } = body;
    if (!endpoint) return NextResponse.json({ error: "endpoint_required" }, { status: 400 });

    const admin = createAdminClient();
    await admin.from("myverse_push_subscriptions").delete().eq("member_id", memberId).eq("endpoint", endpoint);
    return NextResponse.json({ ok: true });
}
