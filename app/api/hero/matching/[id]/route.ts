/**
 * 단일 매칭 상태 전이/피드백 업데이트
 * PATCH /api/hero/matching/:id
 *   body: { status, trialStart?, trialEnd?, trialResult?,
 *           talentSatisfaction?, companySatisfaction?,
 *           talentFeedback?, companyFeedback?, wouldRecommend? }
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_STATUS = ["proposed", "curated", "contacted", "interviewing", "trial", "hired", "declined", "withdrawn"] as const;

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        const body = await req.json();

        if (body.status && !VALID_STATUS.includes(body.status)) {
            return NextResponse.json({ error: `invalid status: ${body.status}` }, { status: 400 });
        }

        const sb = createAdminClient();
        const updates: Record<string, unknown> = {};

        if (body.status) updates.match_status = body.status;
        if (body.trialStart !== undefined) updates.trial_start = body.trialStart;
        if (body.trialEnd !== undefined) updates.trial_end = body.trialEnd;
        if (body.trialResult !== undefined) updates.trial_result = body.trialResult;
        if (body.talentSatisfaction !== undefined) updates.talent_satisfaction = body.talentSatisfaction;
        if (body.companySatisfaction !== undefined) updates.company_satisfaction = body.companySatisfaction;
        if (body.talentFeedback !== undefined) updates.talent_feedback = body.talentFeedback;
        if (body.companyFeedback !== undefined) updates.company_feedback = body.companyFeedback;
        if (body.wouldRecommend !== undefined) updates.would_recommend = body.wouldRecommend;
        if (body.aiMatchReport !== undefined) updates.ai_match_report = body.aiMatchReport;
        if (body.feeType !== undefined) updates.fee_type = body.feeType;
        if (body.feeRate !== undefined) updates.fee_rate = body.feeRate;
        if (body.feeAmount !== undefined) updates.fee_amount = body.feeAmount;
        if (body.feePaid !== undefined) updates.fee_paid = body.feePaid;

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "no fields to update" }, { status: 400 });
        }

        const { data, error } = await sb
            .from("hero_matches")
            .update(updates)
            .eq("id", id)
            .select("id, match_status")
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ok: true, id: data.id, status: data.match_status });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await ctx.params;
        const sb = createAdminClient();
        const { data, error } = await sb
            .from("hero_matches")
            .select("*, hero_companies(company_name, industry)")
            .eq("id", id)
            .maybeSingle();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
        return NextResponse.json({ match: data });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
