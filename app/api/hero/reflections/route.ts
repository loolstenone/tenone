/**
 * GET  /api/hero/reflections?memberId=...&month=YYYY-MM
 * POST /api/hero/reflections  { memberId, month, q1?, q2?, q3?, q4?, q5? }
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const month = searchParams.get("month");

    if (!memberId) return NextResponse.json({ error: "memberId 필수" }, { status: 400 });

    const sb = createAdminClient();

    if (month) {
        const { data, error } = await sb
            .from("hero_reflections")
            .select("id, month, q1, q2, q3, q4, q5, updated_at")
            .eq("member_id", memberId)
            .eq("month", month)
            .maybeSingle();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ item: data ?? null });
    }

    // 전체 목록 (최근 12개월)
    const { data, error } = await sb
        .from("hero_reflections")
        .select("id, month, q1, q2, q3, q4, q5, updated_at")
        .eq("member_id", memberId)
        .order("month", { ascending: false })
        .limit(12);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
    const body = await req.json() as {
        memberId?: string;
        month?: string;
        q1?: string;
        q2?: string;
        q3?: string;
        q4?: string;
        q5?: string;
    };

    const { memberId, month, q1, q2, q3, q4, q5 } = body;

    if (!memberId || !month) {
        return NextResponse.json({ error: "memberId, month 필수" }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}$/.test(month)) {
        return NextResponse.json({ error: "month는 YYYY-MM 형식이어야 합니다" }, { status: 400 });
    }

    const MAX = 500;
    for (const [key, val] of Object.entries({ q1, q2, q3, q4, q5 })) {
        if (val && val.length > MAX) {
            return NextResponse.json({ error: `${key}는 ${MAX}자 이내로 작성해주세요` }, { status: 400 });
        }
    }

    const sb = createAdminClient();
    const { data, error } = await sb
        .from("hero_reflections")
        .upsert(
            {
                member_id: memberId,
                month,
                q1: q1?.trim() ?? null,
                q2: q2?.trim() ?? null,
                q3: q3?.trim() ?? null,
                q4: q4?.trim() ?? null,
                q5: q5?.trim() ?? null,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "member_id,month" },
        )
        .select("id, month, q1, q2, q3, q4, q5, updated_at")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data });
}
