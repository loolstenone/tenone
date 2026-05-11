// 임포트된 메일 목록 + Triage 액션
// GET    /api/myverse/email-imports?state=inbox|task|event|archive
// PATCH  /api/myverse/email-imports  { id, triage_state, ... }   — task/event면 실제 생성
// DELETE /api/myverse/email-imports?id=...

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const STATES = new Set(["inbox", "task", "event", "note", "archive", "discard"]);

function todayKst(): string {
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 10);
}

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const state = url.searchParams.get("state") ?? "inbox";
    const category = url.searchParams.get("category");

    const admin = createAdminClient();
    let q = admin
        .from("myverse_email_imports")
        .select("*")
        .eq("member_id", memberId)
        .order("received_at", { ascending: false })
        .limit(50);

    if (STATES.has(state)) q = q.eq("triage_state", state);
    if (category) q = q.eq("auto_category", category);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ emails: data ?? [] });
}

export async function PATCH(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

    const admin = createAdminClient();

    // 현재 메일 조회 (text 추출용)
    const { data: email } = await admin
        .from("myverse_email_imports")
        .select("*")
        .eq("id", id)
        .eq("member_id", memberId)
        .maybeSingle();
    if (!email) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const patch: Record<string, unknown> = {};
    if (body.triage_state !== undefined && STATES.has(body.triage_state)) patch.triage_state = body.triage_state;
    if (body.auto_category !== undefined) patch.auto_category = body.auto_category;

    // ── triage_state=task → myverse_daily.tasks 에 INSERT ──
    if (body.triage_state === "task" && !email.converted_task_id) {
        const date = todayKst();
        const text = `${email.subject ?? "(제목 없음)"} — ${email.sender_name ?? email.sender_email ?? "메일"}`;
        const newTaskId = crypto.randomUUID();
        const newTask = {
            id: newTaskId,
            text,
            status: "todo",
            time: null,
            priority: email.auto_category === "receipt" ? "급경" : null,
            project_id: null,
            source: "email",
            source_email_id: id,
            created_at: new Date().toISOString(),
        };

        const { data: existingDaily } = await admin
            .from("myverse_daily")
            .select("tasks")
            .eq("member_id", memberId)
            .eq("date", date)
            .maybeSingle();

        const updatedTasks = [...(Array.isArray(existingDaily?.tasks) ? existingDaily.tasks : []), newTask];
        await admin.from("myverse_daily").upsert(
            { member_id: memberId, date, tasks: updatedTasks, updated_at: new Date().toISOString() },
            { onConflict: "member_id,date" }
        );

        patch.converted_task_id = newTaskId;
    }

    // ── triage_state=event → myverse_calendar_entries 에 INSERT ──
    if (body.triage_state === "event" && !email.converted_event_id) {
        const startDate = todayKst();
        const { data: entry } = await admin
            .from("myverse_calendar_entries")
            .insert({
                member_id: memberId,
                kind: "meeting",
                title: email.subject ?? "(제목 없음)",
                description: `From: ${email.sender_name ?? email.sender_email ?? "(메일)"} · ${email.snippet ?? ""}`.slice(0, 4000),
                start_date: startDate,
                start_time: null,
                end_time: null,
                recurrence: "none",
            })
            .select("id")
            .single();
        if (entry) patch.converted_event_id = entry.id;
    }

    const { data, error } = await admin
        .from("myverse_email_imports")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ email: data });
}

export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

    const admin = createAdminClient();
    await admin
        .from("myverse_email_imports")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);
    return NextResponse.json({ ok: true });
}
