/**
 * HeRo 매칭 API
 * - POST   /api/hero/matching            → 매칭 후보 확정 (proposed status)
 * - PATCH  /api/hero/matching/:id        → 상태 전이 또는 피드백 업데이트 (별도 route)
 *
 * 매칭 lifecycle:
 *   proposed → curated → contacted → interviewing → trial → hired
 *                                                            → declined / withdrawn
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            tihResponseId,
            memberId,
            jhResponseId,
            jdId,
            curatorMemberId,
            scoreBreakdown,
            riskNotes,
            matchType,
        } = body as {
            tihResponseId: string;
            memberId: string;       // 인재 member_id
            jhResponseId?: string;
            jdId?: string;
            curatorMemberId?: string;
            scoreBreakdown?: Record<string, unknown>;
            riskNotes?: Array<Record<string, unknown>>;
            matchType?: string;
        };

        if (!tihResponseId || !memberId) {
            return NextResponse.json(
                { error: "tihResponseId, memberId required" },
                { status: 400 }
            );
        }

        const sb = createAdminClient();

        // TIH에서 company_id 조회
        const { data: tih } = await sb
            .from("hero_tih_responses")
            .select("company_id")
            .eq("id", tihResponseId)
            .maybeSingle();

        if (!tih) {
            return NextResponse.json({ error: "TIH not found" }, { status: 404 });
        }

        if (!tih.company_id) {
            return NextResponse.json(
                { error: "TIH에 기업(company_id)이 연결되어 있지 않습니다. 기업 가입 후 연결이 필요합니다." },
                { status: 400 }
            );
        }

        // 중복 체크 (같은 member × company 매칭 이미 있는지)
        const { data: existing } = await sb
            .from("hero_matches")
            .select("id, match_status")
            .eq("profile_member_id", memberId)
            .eq("company_id", tih.company_id)
            .not("match_status", "in", "(declined,withdrawn)")
            .maybeSingle();

        if (existing) {
            return NextResponse.json({
                ok: true,
                id: existing.id,
                status: existing.match_status,
                message: "이미 진행 중인 매칭이 있습니다.",
            }, { status: 200 });
        }

        const { data, error } = await sb
            .from("hero_matches")
            .insert({
                profile_member_id: memberId,
                company_id: tih.company_id,
                tih_response_id: tihResponseId,
                jh_response_id: jhResponseId || null,
                jd_id: jdId || null,
                curator_member_id: curatorMemberId || null,
                match_status: "proposed",
                match_type: matchType || "tetrad_v1",
                match_score_breakdown: scoreBreakdown || {},
                risk_notes: riskNotes || [],
                tenant_id: "tenone",
            })
            .select("id, match_status")
            .single();

        if (error) {
            console.error("[hero/matching POST]", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, id: data.id, status: data.match_status }, { status: 201 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const companyId = req.nextUrl.searchParams.get("companyId");
        const memberId = req.nextUrl.searchParams.get("memberId");
        const status = req.nextUrl.searchParams.get("status");

        const sb = createAdminClient();
        let q = sb
            .from("hero_matches")
            .select("*, hero_companies(company_name)")
            .order("updated_at", { ascending: false })
            .limit(100);

        if (companyId) q = q.eq("company_id", companyId);
        if (memberId) q = q.eq("profile_member_id", memberId);
        if (status) q = q.eq("match_status", status);

        const { data, error } = await q;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ matches: data ?? [] });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
