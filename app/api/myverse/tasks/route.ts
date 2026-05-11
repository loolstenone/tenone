import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";
import type { PlannerTask } from "@/lib/myverse/types";

export interface TaskWithDate extends PlannerTask {
    date: string;
}

function todayKst(): string {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const status = url.searchParams.get("status"); // todo | done | carried | cancelled | all
    const limit = parseInt(url.searchParams.get("limit") || "200", 10);

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('myverse_daily')
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

/**
 * POST /api/myverse/tasks — 새 Task 생성 (Note 등에서 승격)
 * body: { text, date?, source?, source_note_id?, source_block_id?, source_email_id?, source_project_id?, priority?, time?, type? }
 */
export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const text = String(body.text ?? "").trim();
    if (!text) return NextResponse.json({ error: "missing_text" }, { status: 400 });

    const date = typeof body.date === "string" && body.date ? body.date : todayKst();

    const newTask: Record<string, unknown> = {
        id: crypto.randomUUID(),
        text,
        status: "todo",
        time: body.time ?? null,
        priority: body.priority ?? null,
        project_id: body.source_project_id ?? null,
        type: body.type ?? "normal",
        source: body.source ?? null,
        source_note_id: body.source_note_id ?? null,
        source_block_id: body.source_block_id ?? null,
        source_email_id: body.source_email_id ?? null,
        created_at: new Date().toISOString(),
    };

    const admin = createAdminClient();
    const { data: existing } = await admin
        .from("myverse_daily")
        .select("tasks")
        .eq("member_id", memberId)
        .eq("date", date)
        .maybeSingle();

    const tasks = [...(Array.isArray(existing?.tasks) ? existing.tasks : []), newTask];
    const { error } = await admin
        .from("myverse_daily")
        .upsert(
            { member_id: memberId, date, tasks, updated_at: new Date().toISOString() },
            { onConflict: "member_id,date" }
        );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: newTask, date });
}
