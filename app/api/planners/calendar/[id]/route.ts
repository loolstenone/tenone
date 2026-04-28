import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export const dynamic = "force-dynamic";

const VALID_RECURRENCE = ["none", "daily", "weekly", "monthly", "yearly"];
const VALID_STATUS = ["todo", "done", "carried", "canceled"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const patch: Record<string, unknown> = {};

    if (typeof body.title === "string")            patch.title = body.title.trim().slice(0, 200);
    if (typeof body.description === "string")      patch.description = body.description.slice(0, 4000);
    if (typeof body.start_date === "string")       patch.start_date = body.start_date;
    if (body.start_time === null)                  patch.start_time = null;
    else if (typeof body.start_time === "string")  patch.start_time = body.start_time;
    if (body.end_time === null)                    patch.end_time = null;
    else if (typeof body.end_time === "string")    patch.end_time = body.end_time;
    if (typeof body.recurrence === "string" && VALID_RECURRENCE.includes(body.recurrence))
        patch.recurrence = body.recurrence;
    if (body.recurrence_until === null)            patch.recurrence_until = null;
    else if (typeof body.recurrence_until === "string") patch.recurrence_until = body.recurrence_until;
    if (body.status === null)                      patch.status = null;
    else if (typeof body.status === "string" && VALID_STATUS.includes(body.status))
        patch.status = body.status;
    if (typeof body.color === "string" || body.color === null) patch.color = body.color;
    if (typeof body.with_whom === "string") patch.with_whom = body.with_whom.trim().slice(0, 200) || null;
    else if (body.with_whom === null) patch.with_whom = null;
    if (typeof body.location === "string") patch.location = body.location.trim().slice(0, 200) || null;
    else if (body.location === null) patch.location = null;

    const admin = createAdminClient();
    const { error } = await admin
        .from("planners_calendar_entries")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .eq("is_system", false);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const { id } = await params;
    const admin = createAdminClient();
    const { error } = await admin
        .from("planners_calendar_entries")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId)
        .eq("is_system", false);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
