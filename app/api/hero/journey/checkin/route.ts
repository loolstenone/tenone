/**
 * POST /api/hero/journey/checkin
 * Body: { memberId: string; energyLevel: 1..5; note?: string }
 *
 * 하루 1회 체크인 (UNIQUE member_id × checkin_date).
 * 재호출 시 기존 row 갱신 (upsert).
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { earnUC } from "@/lib/supabase/uc";

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

        // UC 적립 — 일일 체크인 + 스트릭 마일스톤 (best-effort, 실패해도 체크인은 성공)
        const earned: { action: string; amount: number }[] = [];
        try {
            const r1 = await earnUC(body.memberId, "hero_daily_checkin", "hero");
            if (r1.granted) earned.push({ action: "hero_daily_checkin", amount: r1.amount });

            if (streak === 7) {
                const r2 = await earnUC(body.memberId, "hero_streak_7d", "hero");
                if (r2.granted) earned.push({ action: "hero_streak_7d", amount: r2.amount });
            } else if (streak === 30) {
                const r2 = await earnUC(body.memberId, "hero_streak_30d", "hero");
                if (r2.granted) earned.push({ action: "hero_streak_30d", amount: r2.amount });
            } else if (streak === 100) {
                const r2 = await earnUC(body.memberId, "hero_streak_100d", "hero");
                if (r2.granted) earned.push({ action: "hero_streak_100d", amount: r2.amount });
            }
        } catch { /* silent — UC 실패는 체크인 실패로 번지지 않음 */ }

        return NextResponse.json({ ok: true, id: data.id, streak: streak ?? 0, earned });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
