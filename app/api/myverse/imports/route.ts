// 임포트 이력 조회
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data } = await admin
        .from("myverse_imports")
        .select("*")
        .eq("member_id", memberId)
        .order("started_at", { ascending: false })
        .limit(20);

    return NextResponse.json({ imports: data ?? [] });
}
