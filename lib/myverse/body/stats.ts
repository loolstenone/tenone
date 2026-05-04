// BODY 영역 통계 — 운동·식사·수면의 일/주/연속 패턴
//
// 주요 지표:
//   - 운동 연속 일수 (streak)
//   - 주간 운동 빈도 (최근 8주)
//   - 일 평균 칼로리 섭취·소모
//   - 주간 평균 수면 시간

import { createAdminClient } from "@/lib/supabase/admin";

export interface WorkoutData {
    type?: string;
    distance_km?: number;
    duration_min?: number;
    calories_burned?: number;
    sets?: number;
    reps?: number;
    weight_kg?: number;
    heart_rate_avg?: number;
}

export interface MealData {
    meal_type?: "breakfast" | "lunch" | "dinner" | "snack";
    items?: Array<{
        name: string;
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        source?: string;
    }>;
}

export interface SleepData {
    duration_min?: number;
    quality?: 1 | 2 | 3 | 4 | 5;
    deep_min?: number;
    rem_min?: number;
    source?: string;
}

export interface BodyStats {
    workout_streak: number;
    workout_days_last_30: number;
    workouts_by_week: Array<{ week: string; count: number; minutes: number }>;
    avg_calories_in: number | null;
    avg_calories_burned: number | null;
    avg_sleep_minutes: number | null;
    weekly_workout_target: number;        // 사용자 목표 (기본 3)
}

/** 사용자 BODY 통계 종합 */
export async function getBodyStats(memberId: string, days = 90): Promise<BodyStats> {
    const admin = createAdminClient();
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().slice(0, 10);

    const { data: rows } = await admin
        .from("myverse_daily_routines")
        .select("date, body_subtype, body_data, start_time, end_time")
        .eq("member_id", memberId)
        .eq("domain", "body")
        .gte("date", sinceStr)
        .order("date", { ascending: false });

    const workouts = (rows ?? []).filter(r => r.body_subtype === "workout");
    const meals = (rows ?? []).filter(r => r.body_subtype === "meal");
    const sleeps = (rows ?? []).filter(r => r.body_subtype === "sleep");

    return {
        workout_streak: computeStreak(workouts.map(w => w.date as string)),
        workout_days_last_30: countUniqueDays(workouts.filter(w => w.date >= shiftDate(-30)).map(w => w.date as string)),
        workouts_by_week: weeklyAggregate(workouts),
        avg_calories_in: avgNullable(meals.map(m => sumMealCalories(m.body_data as MealData | null))),
        avg_calories_burned: avgNullable(workouts.map(w => (w.body_data as WorkoutData | null)?.calories_burned ?? null)),
        avg_sleep_minutes: avgNullable(sleeps.map(s => (s.body_data as SleepData | null)?.duration_min ?? null)),
        weekly_workout_target: 3,
    };
}

function shiftDate(deltaDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() + deltaDays);
    return d.toISOString().slice(0, 10);
}

function countUniqueDays(dates: string[]): number {
    return new Set(dates).size;
}

/** 연속 운동 일수 (오늘 또는 어제부터 시작) */
function computeStreak(workoutDates: string[]): number {
    if (workoutDates.length === 0) return 0;
    const set = new Set(workoutDates);
    const today = new Date().toISOString().slice(0, 10);
    let cursor = new Date(today + "T00:00:00");
    let streak = 0;

    // 오늘 안 했어도 어제까지 연속이면 streak 유지
    if (!set.has(cursor.toISOString().slice(0, 10))) {
        cursor.setDate(cursor.getDate() - 1);
        if (!set.has(cursor.toISOString().slice(0, 10))) return 0;
    }

    while (set.has(cursor.toISOString().slice(0, 10))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
}

function weeklyAggregate(workouts: Array<{ date: string; start_time?: string | null; end_time?: string | null; body_data?: unknown }>): Array<{ week: string; count: number; minutes: number }> {
    const byWeek: Record<string, { count: number; minutes: number }> = {};
    for (const w of workouts) {
        const d = new Date(w.date + "T00:00:00");
        const yr = d.getFullYear();
        const onejan = new Date(yr, 0, 1);
        const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
        const key = `${yr}-W${String(week).padStart(2, "0")}`;
        byWeek[key] ??= { count: 0, minutes: 0 };
        byWeek[key].count++;
        const data = w.body_data as WorkoutData | null;
        let mins = data?.duration_min ?? 0;
        if (!mins && w.start_time && w.end_time) {
            const [sh, sm] = w.start_time.split(":").map(Number);
            const [eh, em] = w.end_time.split(":").map(Number);
            mins = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
        }
        byWeek[key].minutes += mins;
    }
    return Object.entries(byWeek)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([week, v]) => ({ week, ...v }))
        .slice(-8);
}

function sumMealCalories(meal: MealData | null): number | null {
    if (!meal?.items) return null;
    let sum = 0;
    let any = false;
    for (const item of meal.items) {
        if (typeof item.calories === "number") {
            sum += item.calories;
            any = true;
        }
    }
    return any ? sum : null;
}

function avgNullable(values: Array<number | null>): number | null {
    const valid = values.filter((v): v is number => typeof v === "number");
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}
