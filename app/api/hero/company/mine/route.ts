/**
 * 내가 담당하는 기업 (활성) — 써치 라이트·팀 진단에서 기업 고르기
 * GET /api/hero/company/mine → { companies: [{ id, name }] }
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return auth;
    const { data } = await createAdminClient().from("hero_company_members")
        .select("company_id, hero_companies(company_name)")
        .eq("member_id", auth.memberId).eq("status", "active");
    const companies = ((data ?? []) as unknown as { company_id: string; hero_companies: { company_name: string } | null }[])
        .map(l => ({ id: l.company_id, name: l.hero_companies?.company_name ?? "" }));
    return NextResponse.json({ companies });
}
