// 현재 로그인 회원 식별 — DM·소셜 등에서 본인 비교용
// GET /api/myverse/me

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();
    const { data } = await admin
        .from("members")
        .select("id, name, handle, avatar_url")
        .eq("id", memberId)
        .maybeSingle();

    return NextResponse.json({ member: data });
}
