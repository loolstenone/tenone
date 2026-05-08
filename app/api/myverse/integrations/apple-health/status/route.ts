import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const [{ count }, { data: latest }] = await Promise.all([
        admin.from("myverse_daily_health").select("*", { count: "exact", head: true }).eq("member_id", memberId).eq("source", "apple_health"),
        admin.from("myverse_daily_health").select("imported_at").eq("member_id", memberId).eq("source", "apple_health").order("imported_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    return NextResponse.json({
        days_count: count ?? 0,
        last_imported_at: latest?.imported_at ?? null,
    });
}
