/**
 * HeRo JH (Job Hope) API
 * - GET  /api/hero/jh?memberId=xxx  → 본인 JH 응답 조회
 * - POST /api/hero/jh               → JH 응답 저장 (upsert by member_id)
 *
 * Tetrad 문서: docs/HeRo_Matching_Tetrad_v1.md
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    try {
        const memberId = req.nextUrl.searchParams.get("memberId");
        if (!memberId) {
            return NextResponse.json({ error: "memberId required" }, { status: 400 });
        }

        const sb = createAdminClient();
        const { data, error } = await sb
            .from("hero_jh_responses")
            .select("*")
            .eq("member_id", memberId)
            .maybeSingle();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ jh: data });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { memberId, responses, practicalFilters, status } = body as {
            memberId: string;
            responses: Record<string, unknown>;
            practicalFilters?: Record<string, unknown>;
            status?: "draft" | "active" | "paused";
        };

        if (!memberId || !responses) {
            return NextResponse.json(
                { error: "memberId and responses required" },
                { status: 400 }
            );
        }

        const sb = createAdminClient();

        // 필수 문항 검증 (JH1~11, 12는 선택)
        const requiredKeys = ["jh1", "jh2", "jh3", "jh4", "jh5", "jh6", "jh7", "jh8", "jh9", "jh10", "jh11"];
        const isComplete = requiredKeys.every(k => {
            const v = responses[k];
            return v !== undefined && v !== null && v !== ""
                && !(Array.isArray(v) && v.length === 0);
        });

        const finalStatus = status ?? (isComplete ? "active" : "draft");

        const { data, error } = await sb
            .from("hero_jh_responses")
            .upsert({
                member_id: memberId,
                responses,
                practical_filters: practicalFilters ?? {},
                status: finalStatus,
                submitted_at: isComplete ? new Date().toISOString() : null,
            }, { onConflict: "member_id" })
            .select("id, status")
            .single();

        if (error) {
            console.error("[hero/jh POST]", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, id: data.id, status: data.status }, { status: 201 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
