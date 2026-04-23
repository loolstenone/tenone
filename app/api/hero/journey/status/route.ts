/**
 * GET /api/hero/journey/status?memberId=xxx
 *
 * 회원의 Journey 상태 반환:
 *   - 현재 스테이지 (Dreamer → Challenger → Trainee → Debut → Star → Legend)
 *   - 해금 조건 상태 (HIT A/B · 이력서 · JH · 매칭)
 *   - 오늘 체크인 여부 + 스트릭
 *   - 다음 스테이지 진입 조건
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    try {
        const memberId = new URL(req.url).searchParams.get("memberId");
        if (!memberId) {
            return NextResponse.json({ error: "memberId required" }, { status: 400 });
        }

        const sb = createAdminClient();

        // 스테이지 + 해금 조건
        const { data: stageRow, error: stageErr } = await sb
            .rpc("hero_journey_stage", { _member_id: memberId })
            .single();

        if (stageErr) {
            return NextResponse.json({ error: stageErr.message }, { status: 500 });
        }

        // 스트릭
        const { data: streak, error: streakErr } = await sb
            .rpc("hero_streak", { _member_id: memberId });

        if (streakErr) {
            return NextResponse.json({ error: streakErr.message }, { status: 500 });
        }

        // 오늘 체크인 여부
        const today = new Date().toISOString().slice(0, 10);
        const { data: todayCheckin } = await sb
            .from("hero_daily_checkins")
            .select("id, energy_level, note")
            .eq("member_id", memberId)
            .eq("checkin_date", today)
            .maybeSingle();

        // 받은 매칭 — 확인 안 한 것
        const { count: pendingMatches } = await sb
            .from("hero_matches")
            .select("id", { count: "exact", head: true })
            .eq("profile_member_id", memberId)
            .in("match_status", ["curated"]);

        const s = stageRow as {
            stage: string;
            stage_index: number;
            has_hit_a: boolean;
            has_hit_b: boolean;
            has_resume: boolean;
            has_jh: boolean;
            has_match: boolean;
            has_active_match: boolean;
        };

        return NextResponse.json({
            stage: s.stage,
            stageIndex: s.stage_index,
            conditions: {
                has_hit_a: s.has_hit_a,
                has_hit_b: s.has_hit_b,
                has_resume: s.has_resume,
                has_jh: s.has_jh,
                has_match: s.has_match,
                has_active_match: s.has_active_match,
            },
            streak: streak ?? 0,
            todayCheckedIn: !!todayCheckin,
            todayCheckin: todayCheckin ?? null,
            pendingMatches: pendingMatches ?? 0,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
