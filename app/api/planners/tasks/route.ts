import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";
import type { PlannerTask } from "@/lib/planners/types";

export interface TaskWithDate extends PlannerTask {
    date: string;
}

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const status = url.searchParams.get("status"); // todo | done | carried | cancelled | all
    const limit = parseInt(url.searchParams.get("limit") || "200", 10);

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('planners_daily')
        .select('date, tasks')
        .eq('member_id', memberId)
        .order('date', { ascending: false })
        .limit(90); // last 90 days of daily records

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const allTasks: TaskWithDate[] = [];
    for (const row of data ?? []) {
        const tasks: PlannerTask[] = Array.isArray(row.tasks) ? row.tasks : [];
        for (const t of tasks) {
            if (!t.text?.trim()) continue;
            if (status && status !== "all" && t.status !== status) continue;
            allTasks.push({ ...t, date: row.date });
        }
    }

    // Stable sort: by date desc, then original order preserved
    const sliced = allTasks.slice(0, limit);

    const grouped = {
        todo: sliced.filter(t => t.status === "todo"),
        done: sliced.filter(t => t.status === "done"),
        carried: sliced.filter(t => t.status === "carried"),
        cancelled: sliced.filter(t => t.status === "cancelled"),
    };

    return NextResponse.json({ tasks: sliced, grouped });
}
