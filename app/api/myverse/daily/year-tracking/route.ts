import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

// 연간 — 월별 task 통계 + 한 줄 모음 + 트래킹 평균
export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const year = parseInt(url.searchParams.get("year") || "0", 10);
    if (!year) return NextResponse.json({ error: "year_required" }, { status: 400 });

    const firstDay = `${year}-01-01`;
    const lastDay = `${year}-12-31`;

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('myverse_daily')
        .select('date, tasks, daily_result, daily_result_category, energy_level, satisfaction_level, mood_level, exercise_minutes, exercise_distance, bp_systolic, bp_diastolic, blood_sugar, body_weight, body_temp')
        .eq('member_id', memberId)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    type Row = {
        date: string; tasks: Array<{ status: string }> | null;
        daily_result: string | null; daily_result_category: string | null;
        energy_level: number | null; satisfaction_level: number | null; mood_level: number | null;
        exercise_minutes: number | null; exercise_distance: number | null;
        bp_systolic: number | null; bp_diastolic: number | null;
        blood_sugar: number | null; body_weight: number | null; body_temp: number | null;
    };
    const rows = (data ?? []) as Row[];

    // 월별 집계
    const months = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
        const monthRows = rows.filter((r) => parseInt(r.date.slice(5, 7), 10) === m);
        const taskCounts = { todo: 0, done: 0, carried: 0, canceled: 0, total: 0 };
        monthRows.forEach((r) => {
            if (Array.isArray(r.tasks)) {
                r.tasks.forEach((t) => {
                    taskCounts.total += 1;
                    const s = t.status || "todo";
                    if (s === "done") taskCounts.done += 1;
                    else if (s === "carried") taskCounts.carried += 1;
                    else if (s === "canceled") taskCounts.canceled += 1;
                    else taskCounts.todo += 1;
                });
            }
        });

        const avg = (k: keyof Row): number | null => {
            const vs = monthRows.map((r) => r[k]).filter((v): v is number => typeof v === "number");
            if (vs.length === 0) return null;
            return Math.round((vs.reduce((s, v) => s + v, 0) / vs.length) * 10) / 10;
        };
        const sum = (k: keyof Row): number => monthRows.map((r) => r[k]).filter((v): v is number => typeof v === "number").reduce((s, v) => s + v, 0);
        const exDays = monthRows.filter((r) => r.exercise_minutes != null && r.exercise_minutes > 0).length;

        return {
            month: m,
            days_recorded: monthRows.length,
            tasks: taskCounts,
            energy_avg:        avg("energy_level"),
            satisfaction_avg:  avg("satisfaction_level"),
            mood_avg:          avg("mood_level"),
            exercise_minutes:  sum("exercise_minutes"),
            exercise_distance: Math.round(sum("exercise_distance") * 10) / 10,
            exercise_days:     exDays,
            bp_sys_avg:        avg("bp_systolic"),
            bp_dia_avg:        avg("bp_diastolic"),
            sugar_avg:         avg("blood_sugar"),
            weight_avg:        avg("body_weight"),
        };
    });

    // 연 전체 한 줄 모음
    const oneLiners = rows
        .filter((r) => r.daily_result && r.daily_result.trim())
        .map((r) => ({
            date: r.date,
            text: r.daily_result as string,
            category: r.daily_result_category,
        }));

    // 연 전체 task 합계
    const totalTasks = months.reduce((acc, m) => ({
        todo:     acc.todo     + m.tasks.todo,
        done:     acc.done     + m.tasks.done,
        carried:  acc.carried  + m.tasks.carried,
        canceled: acc.canceled + m.tasks.canceled,
        total:    acc.total    + m.tasks.total,
    }), { todo: 0, done: 0, carried: 0, canceled: 0, total: 0 });

    return NextResponse.json({
        months,
        one_liners: oneLiners,
        totals: {
            tasks: totalTasks,
            days_recorded: rows.length,
        },
    });
}
