// 공유 링크 공개 조회 — 인증 불필요

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext { params: Promise<{ token: string }> }

export async function GET(_: Request, ctx: RouteContext) {
    const { token } = await ctx.params;
    if (!token) return NextResponse.json({ error: "missing_token" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_canvases")
        .select("id, title, data, created_at, updated_at")
        .eq("share_token", token)
        .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ canvas: data });
}
