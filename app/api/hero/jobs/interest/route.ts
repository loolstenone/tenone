/**
 * POST /api/hero/jobs/interest
 * 채용 JD에 "관심 있어요" 클릭 → hero_matches INSERT (status=contacted, type=jd_interest)
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const { memberId, jdId } = await req.json() as { memberId?: string; jdId?: string };
        if (!memberId || !jdId) {
            return NextResponse.json({ error: "memberId, jdId 필수" }, { status: 400 });
        }

        const sb = createAdminClient();

        // JD에서 company_id 조회
        const { data: jd } = await sb
            .from("hero_jd")
            .select("company_id, status")
            .eq("id", jdId)
            .maybeSingle();

        if (!jd) {
            return NextResponse.json({ error: "JD not found" }, { status: 404 });
        }

        // 이미 관심 등록된 건지 확인 (declined/withdrawn 제외)
        const { data: existing } = await sb
            .from("hero_matches")
            .select("id, match_status")
            .eq("profile_member_id", memberId)
            .eq("jd_id", jdId)
            .not("match_status", "in", "(declined,withdrawn)")
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ ok: true, id: existing.id, alreadyExists: true });
        }

        const { data, error } = await sb
            .from("hero_matches")
            .insert({
                profile_member_id: memberId,
                company_id: jd.company_id,
                jd_id: jdId,
                match_status: "contacted",
                match_type: "jd_interest",
                match_score_breakdown: {},
                risk_notes: [],
                tenant_id: "tenone",
            })
            .select("id")
            .single();

        if (error) {
            console.error("[hero/jobs/interest]", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
