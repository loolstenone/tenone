/**
 * POST /api/hero/journey/checkin
 * Body: { memberId: string; energyLevel: 1..5; note?: string }
 *
 * 하루 1회 체크인 (UNIQUE member_id × checkin_date).
 * 재호출 시 기존 row 갱신 (upsert).
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as {
            memberId: string;
            energyLevel: number;
            note?: string;
        };

        if (!body.memberId) {
            return NextResponse.json({ error: "memberId required" }, { status: 400 });
        }
        if (!body.energyLevel || body.energyLevel < 1 || body.energyLevel > 5) {
            return NextResponse.json({ error: "energyLevel 1~5 required" }, { status: 400 });
        }

        const sb = createAdminClient();
        const today = new Date().toISOString().slice(0, 10);

        const { data, error } = await sb
            .from("hero_daily_checkins")
            .upsert({
                member_id: body.memberId,
                checkin_date: today,
                energy_level: body.energyLevel,
                note: body.note ?? null,
            }, { onConflict: "member_id,checkin_date" })
            .select("id")
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // 스트릭 재계산
        const { data: streak } = await sb
            .rpc("hero_streak", { _member_id: body.memberId });

        return NextResponse.json({ ok: true, id: data.id, streak: streak ?? 0 });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
