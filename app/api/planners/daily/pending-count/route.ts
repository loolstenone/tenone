// 누적 미처리 카운트: today 기준 과거 N일 안의 status='todo' + 'hold' 합계.
// DailyView 가 이월 버튼을 노출/숨길지 결정할 때 사용.

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

interface Task { status: string }

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const today = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const lookbackDays = Math.min(Math.max(Number(url.searchParams.get("days")) || 60, 1), 180);

    const startDate = new Date(today + "T00:00:00Z");
    startDate.setUTCDate(startDate.getUTCDate() - lookbackDays);
    const startStr = startDate.toISOString().slice(0, 10);

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_daily")
        .select("date, tasks")
        .eq("member_id", memberId)
        .gte("date", startStr)
        .lt("date", today);

    if (error) {
        return NextResponse.json({ count: 0, days: 0, error: "read_failed" }, { status: 500 });
    }

    let count = 0;
    let daysWithPending = 0;
    let oldest: string | null = null;
    for (const row of data ?? []) {
        const tasks = ((row.tasks as Task[]) || []);
        const pending = tasks.filter((t) => t.status === "todo" || t.status === "hold").length;
        if (pending > 0) {
            count += pending;
            daysWithPending += 1;
            if (!oldest || (row.date as string) < oldest) oldest = row.date as string;
        }
    }
    return NextResponse.json({ count, days: daysWithPending, oldest, lookbackDays });
}
