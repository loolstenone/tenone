// Todoist 연결 — 사용자가 API 토큰을 직접 제공 (Todoist 설정에서 발급)

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyToken } from "@/lib/planners/todoist";
import { getMemberId } from "@/lib/planners/auth";

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { token } = body;
    if (!token || typeof token !== "string") {
        return NextResponse.json({ error: "token_required" }, { status: 400 });
    }

    const { ok } = await verifyToken(token);
    if (!ok) return NextResponse.json({ error: "invalid_token" }, { status: 400 });

    const admin = createAdminClient();
    await admin.from("planners_integrations").upsert({
        member_id: memberId,
        provider: "todoist",
        status: "active",
        access_token: token,
        sync_direction: "read",
        updated_at: new Date().toISOString(),
    }, { onConflict: "member_id,provider" });

    return NextResponse.json({ ok: true });
}
