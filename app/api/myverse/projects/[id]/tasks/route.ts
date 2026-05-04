// 특정 프로젝트의 모든 Task 합산 — myverse_daily.tasks를 스캔해 project_id 매칭
// 쓰기는 myverse_daily에 직접 (Daily에서 입력하는 것과 동일 데이터)
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();

    // 프로젝트 소유권 확인
    const { data: project } = await admin
        .from("myverse_projects")
        .select("id")
        .eq("id", projectId)
        .eq("member_id", memberId)
        .maybeSingle();
    if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // 해당 멤버의 모든 daily 스캔 (최근 365일)
    const since = new Date();
    since.setDate(since.getDate() - 365);
    const sinceStr = since.toISOString().slice(0, 10);

    const { data: daily } = await admin
        .from("myverse_daily")
        .select("date, tasks")
        .eq("member_id", memberId)
        .gte("date", sinceStr)
        .order("date", { ascending: false });

    type Task = {
        id: string; text: string; status: string;
        time?: string | null; project_id?: string | null;
    };

    const items: Array<{ date: string; task: Task }> = [];
    for (const row of (daily ?? []) as Array<{ date: string; tasks: Task[] | null }>) {
        const tasks = Array.isArray(row.tasks) ? row.tasks : [];
        for (const t of tasks) {
            if (t.project_id === projectId) items.push({ date: row.date, task: t });
        }
    }

    // 상태별 집계
    const stats = {
        total: items.length,
        todo: items.filter(i => i.task.status === "todo").length,
        done: items.filter(i => i.task.status === "done").length,
        carried: items.filter(i => i.task.status === "carried").length,
        cancelled: items.filter(i => i.task.status === "cancelled").length,
    };

    return NextResponse.json({ items, stats });
}

// POST — 프로젝트 페이지에서 직접 업무 추가
// body: { date: "YYYY-MM-DD", text: string, time?: "HH:MM", priority?: string }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: projectId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const admin = createAdminClient();

    // 소유권 확인
    const { data: project } = await admin
        .from("myverse_projects")
        .select("id")
        .eq("id", projectId)
        .eq("member_id", memberId)
        .maybeSingle();
    if (!project) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const body = await req.json();
    const date: string = body.date;
    const text: string = (body.text ?? "").trim();
    if (!date || !text) return NextResponse.json({ error: "date_and_text_required" }, { status: 400 });

    // 해당 날짜 daily 조회 후 tasks 배열에 추가
    const { data: row } = await admin
        .from("myverse_daily")
        .select("id, tasks")
        .eq("member_id", memberId)
        .eq("date", date)
        .maybeSingle();

    type Task = {
        id: string; text: string; status: string;
        time?: string | null; project_id?: string | null;
        priority?: string | null; source?: string;
    };

    const newTask: Task = {
        id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        text,
        status: "todo",
        time: body.time ?? null,
        project_id: projectId,
        priority: body.priority ?? null,
        source: "project",
    };

    const existing = (row && Array.isArray((row as { tasks?: Task[] }).tasks))
        ? ((row as { tasks: Task[] }).tasks)
        : [];
    const next = [...existing, newTask];

    if (row) {
        const { error } = await admin.from("myverse_daily").update({ tasks: next }).eq("id", (row as { id: string }).id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
        const { error } = await admin.from("myverse_daily").insert({
            member_id: memberId,
            date,
            tasks: next,
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: newTask, date });
}
