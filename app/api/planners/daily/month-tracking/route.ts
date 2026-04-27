import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export const dynamic = "force-dynamic";

// 월간 한 줄 모음 + 트래킹 시계열 + 평균 집계
export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const year = parseInt(url.searchParams.get("year") || "0", 10);
    const month = parseInt(url.searchParams.get("month") || "0", 10);
    if (!year || !month) return NextResponse.json({ error: "year_month_required" }, { status: 400 });

    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDate = new Date(year, month, 0).getDate();
    const lastDay = `${year}-${String(month).padStart(2, "0")}-${String(lastDate).padStart(2, "0")}`;

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('planners_daily')
        .select('date, daily_result, daily_result_category, energy_level, satisfaction_level, mood_level, exercise_minutes, exercise_distance, bp_systolic, bp_diastolic, blood_sugar, body_weight, body_temp')
        .eq('member_id', memberId)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = data ?? [];
    const oneLiners = rows
        .filter((r) => r.daily_result && r.daily_result.trim())
        .map((r) => ({
            date: r.date,
            text: r.daily_result as string,
            category: r.daily_result_category as string | null,
        }));

    function avg(field: keyof typeof rows[number]): number | null {
        const vals = rows.map((r) => r[field]).filter((v): v is number => typeof v === "number");
        if (vals.length === 0) return null;
        return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
    }

    function sum(field: keyof typeof rows[number]): number {
        return rows.map((r) => r[field]).filter((v): v is number => typeof v === "number")
            .reduce((s, v) => s + v, 0);
    }

    const stats = {
        days_recorded: rows.length,
        energy_avg:       avg("energy_level"),
        satisfaction_avg: avg("satisfaction_level"),
        mood_avg:         avg("mood_level"),
        exercise_minutes_total:  sum("exercise_minutes"),
        exercise_distance_total: Math.round(sum("exercise_distance") * 10) / 10,
        exercise_days: rows.filter((r) => r.exercise_minutes != null && r.exercise_minutes > 0).length,
        bp_sys_avg:    avg("bp_systolic"),
        bp_dia_avg:    avg("bp_diastolic"),
        sugar_avg:     avg("blood_sugar"),
        weight_latest: rows.filter((r) => r.body_weight != null).slice(-1)[0]?.body_weight ?? null,
        temp_latest:   rows.filter((r) => r.body_temp != null).slice(-1)[0]?.body_temp ?? null,
    };

    const series = rows.map((r) => ({
        date: r.date,
        energy:       r.energy_level,
        satisfaction: r.satisfaction_level,
        mood:         r.mood_level,
        exercise_min: r.exercise_minutes,
        weight:       r.body_weight,
        bp_sys:       r.bp_systolic,
        sugar:        r.blood_sugar,
    }));

    return NextResponse.json({ stats, series, one_liners: oneLiners });
}
