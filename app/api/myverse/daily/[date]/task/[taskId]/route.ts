// 특정 날짜 daily의 단일 task 패치/삭제
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

type Task = Record<string, unknown> & { id: string };

async function loadTasks(date: string, memberId: string): Promise<{ row: { id: string; tasks: Task[] } | null }> {
    const admin = createAdminClient();
    const { data } = await admin
        .from("myverse_daily")
        .select("id, tasks")
        .eq("member_id", memberId)
        .eq("date", date)
        .maybeSingle();
    if (!data) return { row: null };
    const tasks = Array.isArray((data as { tasks?: Task[] }).tasks) ? (data as { tasks: Task[] }).tasks : [];
    return { row: { id: (data as { id: string }).id, tasks } };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ date: string; taskId: string }> }) {
    const { date, taskId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const patch = await req.json().catch(() => ({}));
    if (!date || !taskId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    const admin = createAdminClient();
    const { row } = await loadTasks(date, memberId);
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

    // 이동: 다른 날짜로 옮기는 경우
    const newDate: string | undefined = typeof patch.date === "string" && patch.date && patch.date !== date ? patch.date : undefined;
    const taskIndex = row.tasks.findIndex(t => t.id === taskId);
    if (taskIndex < 0) return NextResponse.json({ error: "task_not_found" }, { status: 404 });

    const updated: Task = { ...row.tasks[taskIndex], ...patch };
    delete (updated as { date?: unknown }).date;

    if (newDate) {
        // 원 날짜에서 제거
        const remaining = row.tasks.filter(t => t.id !== taskId);
        await admin.from("myverse_daily").update({ tasks: remaining }).eq("id", row.id);
        // 새 날짜에 추가
        const { row: targetRow } = await loadTasks(newDate, memberId);
        if (targetRow) {
            await admin.from("myverse_daily").update({ tasks: [...targetRow.tasks, updated] }).eq("id", targetRow.id);
        } else {
            await admin.from("myverse_daily").insert({ member_id: memberId, date: newDate, tasks: [updated] });
        }
    } else {
        const next = [...row.tasks];
        next[taskIndex] = updated;
        await admin.from("myverse_daily").update({ tasks: next }).eq("id", row.id);
    }
    return NextResponse.json({ task: updated, date: newDate ?? date });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ date: string; taskId: string }> }) {
    const { date, taskId } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (!date || !taskId) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    const admin = createAdminClient();
    const { row } = await loadTasks(date, memberId);
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const next = row.tasks.filter(t => t.id !== taskId);
    await admin.from("myverse_daily").update({ tasks: next }).eq("id", row.id);
    return NextResponse.json({ ok: true });
}
