/**
 * POST /api/hero/goals/:id/checkin
 *   주간 체크인 upsert (week_start_date 유니크)
 *   Body: { memberId, vriefProgress[], gprProgress[], note?, weekStartDate? }
 *
 * 체크인 후 hero_goals.progress_percent 자동 계산·갱신.
 */
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface VriefProgress { code: string; level: number }
interface GprProgress { metric?: string; current: number }
interface VriefTarget { code: string; from: number; to: number }
interface GprTarget { metric?: string; target?: number }
interface GoalRow {
    vrief_targets: VriefTarget[];
    gpr_targets: GprTarget[];
}

function startOfWeekISO(): string {
    const now = new Date();
    const day = now.getDay(); // Sunday = 0
    now.setDate(now.getDate() - day);
    return now.toISOString().slice(0, 10);
}

function computeProgress(vriefTargets: VriefTarget[], gprTargets: GprTarget[], vriefProgress: VriefProgress[], gprProgress: GprProgress[]): number {
    const scores: number[] = [];

    for (const vt of vriefTargets) {
        const p = vriefProgress.find((x) => x.code === vt.code);
        if (!p) continue;
        const span = vt.to - vt.from;
        if (span <= 0) { scores.push(100); continue; }
        const achieved = Math.max(0, Math.min(span, p.level - vt.from));
        scores.push((achieved / span) * 100);
    }
    for (const gt of gprTargets) {
        if (!gt.metric || gt.target === undefined || gt.target <= 0) continue;
        const p = gprProgress.find((x) => x.metric === gt.metric);
        if (!p) continue;
        scores.push(Math.max(0, Math.min(100, (p.current / gt.target) * 100)));
    }

    if (!scores.length) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id: goalId } = await ctx.params;
        const body = (await req.json()) as {
            memberId: string;
            vriefProgress?: VriefProgress[];
            gprProgress?: GprProgress[];
            note?: string;
            weekStartDate?: string;
        };

        if (!body.memberId) {
            return NextResponse.json({ error: "memberId required" }, { status: 400 });
        }

        const sb = createAdminClient();
        const weekStart = body.weekStartDate ?? startOfWeekISO();

        const { data: checkin, error } = await sb.from("hero_goal_checkins").upsert({
            goal_id: goalId,
            member_id: body.memberId,
            week_start_date: weekStart,
            vrief_progress: body.vriefProgress ?? [],
            gpr_progress: body.gprProgress ?? [],
            note: body.note ?? null,
        }, { onConflict: "goal_id,week_start_date" }).select("*").single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // 진행률 자동 계산
        const { data: goal } = await sb.from("hero_goals")
            .select("vrief_targets, gpr_targets")
            .eq("id", goalId)
            .single();

        if (goal) {
            const g = goal as GoalRow;
            const pct = computeProgress(
                g.vrief_targets ?? [],
                g.gpr_targets ?? [],
                body.vriefProgress ?? [],
                body.gprProgress ?? [],
            );
            await sb.from("hero_goals").update({ progress_percent: pct }).eq("id", goalId);
        }

        return NextResponse.json({ ok: true, checkin });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        const { id: goalId } = await ctx.params;
        const sb = createAdminClient();
        const { data, error } = await sb.from("hero_goal_checkins")
            .select("*")
            .eq("goal_id", goalId)
            .order("week_start_date", { ascending: false });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ checkins: data ?? [] });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "unknown";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
