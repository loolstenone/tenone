// TimeBlock API — 타임블로킹 CRUD
// GET    /api/myverse/timeblocks?date=YYYY-MM-DD
// GET    /api/myverse/timeblocks?from=YYYY-MM-DD&to=YYYY-MM-DD
// POST   { date, start_time, end_time, title?, task_id?, project_id?, ... }
// PATCH  { id, ...patch }
// DELETE ?id=...

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const STATES = new Set(["planned", "doing", "done", "skipped"]);

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const admin = createAdminClient();
    let q = admin
        .from("myverse_timeblocks")
        .select("*")
        .eq("member_id", memberId)
        .order("date")
        .order("start_time");

    if (date) q = q.eq("date", date);
    else if (from && to) q = q.gte("date", from).lte("date", to);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ blocks: data ?? [] });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const date = String(body.date ?? "");
    const start_time = String(body.start_time ?? "");
    const end_time = String(body.end_time ?? "");

    if (!date || !start_time || !end_time) {
        return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_timeblocks")
        .insert({
            member_id: memberId,
            date,
            start_time,
            end_time,
            title: body.title ?? null,
            task_id: body.task_id ?? null,
            project_id: body.project_id ?? null,
            state: STATES.has(body.state) ? body.state : "planned",
            color: body.color ?? null,
            note: body.note ?? null,
        })
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ block: data });
}

export async function PATCH(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (body.date !== undefined) patch.date = body.date;
    if (body.start_time !== undefined) patch.start_time = body.start_time;
    if (body.end_time !== undefined) patch.end_time = body.end_time;
    if (body.title !== undefined) patch.title = body.title;
    if (body.task_id !== undefined) patch.task_id = body.task_id;
    if (body.project_id !== undefined) patch.project_id = body.project_id;
    if (body.state !== undefined && STATES.has(body.state)) patch.state = body.state;
    if (body.color !== undefined) patch.color = body.color;
    if (body.note !== undefined) patch.note = body.note;

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_timeblocks")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ block: data });
}

export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

    const admin = createAdminClient();
    await admin
        .from("myverse_timeblocks")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);
    return NextResponse.json({ ok: true });
}
