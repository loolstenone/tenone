/**
 * 인트라 — 인재 제안 검토 목록
 * GET /api/intra/hero/offers?status=requested
 */
import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { offersLive } from "@/lib/hero/offers-server";

export async function GET(req: NextRequest) {
    const auth = await requireStaff(req);
    if (auth instanceof NextResponse) return auth;
    const status = req.nextUrl.searchParams.get("status");
    let q = createAdminClient().from("hero_offers")
        .select("*, hero_companies(company_name, industry, size_category), hero_jd(position_title)")
        .order("created_at", { ascending: false }).limit(200);
    if (status && status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [], live: offersLive() });
}
