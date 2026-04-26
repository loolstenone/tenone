import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyToken } from "@/lib/planners/notion";
import { getMemberId } from "@/lib/planners/auth";

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { token } = await req.json();
    if (!token || typeof token !== "string") {
        return NextResponse.json({ error: "token_required" }, { status: 400 });
    }

    const { ok, name, email } = await verifyToken(token);
    if (!ok) return NextResponse.json({ error: "invalid_token" }, { status: 400 });

    const admin = createAdminClient();
    await admin.from("planners_integrations").upsert({
        member_id: memberId,
        provider: "notion",
        status: "active",
        access_token: token,
        external_name: name ?? null,
        external_email: email ?? null,
        sync_direction: "read",
        updated_at: new Date().toISOString(),
    }, { onConflict: "member_id,provider" });

    return NextResponse.json({ ok: true });
}
