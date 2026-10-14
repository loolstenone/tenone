/**
 * GET /api/brand-join/mine — 내가 이용 중인 브랜드(slug) 목록 (본인, 유틸리티바 계정 메뉴용)
 * 원천 = member_brand_joins (status active · 탈퇴 안 함). 회원 식별은 세션만
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { data, error } = await createAdminClient().from("member_brand_joins")
        .select("brand_id")
        .eq("member_id", auth.memberId)
        .eq("status", "active")
        .is("withdrawn_at", null);
    if (error) {
        console.error("[brand-join/mine]", error);
        return NextResponse.json({ brands: [] });
    }
    return NextResponse.json({ brands: (data ?? []).map(r => r.brand_id as string) });
}
