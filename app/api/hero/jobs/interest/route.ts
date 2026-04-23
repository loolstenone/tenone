/**
 * POST /api/hero/jobs/interest
 * 채용 JD에 "관심 있어요" 클릭 → hero_matches INSERT
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    const { memberId, jdId } = await req.json() as { memberId?: string; jdId?: string };
    if (!memberId || !jdId) {
        return NextResponse.json({ error: "memberId, jdId 필수" }, { status: 400 });
    }

    const sb = createAdminClient();

    // 이미 관심 등록된 건지 확인
    const { data: existing } = await sb
        .from("hero_matches")
        .select("id")
        .eq("profile_member_id", memberId)
        .eq("jd_id", jdId)
        .maybeSingle();

    if (existing) {
        return NextResponse.json({ ok: true, alreadyExists: true });
    }

    const { error } = await sb.from("hero_matches").insert({
        profile_member_id: memberId,
        jd_id: jdId,
        match_status: "contacted",
        match_type: "job_interest",
    });

    if (error) {
        console.error("[hero/jobs/interest]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
