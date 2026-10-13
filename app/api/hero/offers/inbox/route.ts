/**
 * 인재 — 받은 제안 목록
 * GET /api/hero/offers/inbox
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMember } from "@/lib/api-guard";

export async function GET(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { data, error } = await createAdminClient().from("hero_offer_recipients")
        .select("id, status, responded_at, created_at, hero_offers(id, offer_type, title, respond_by, status, hero_companies(company_name, industry, size_category))")
        .eq("member_id", auth.memberId)
        .order("created_at", { ascending: false });
    if (error) {
        console.error("[hero/offers/inbox]", error.message);
        return NextResponse.json({ error: "제안을 불러오지 못했습니다." }, { status: 500 });
    }
    return NextResponse.json({ items: data ?? [] });
}
