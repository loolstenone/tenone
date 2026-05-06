import { NextResponse } from "next/server";
import { getMemberId } from "@/lib/myverse/auth";
import { createClient } from "@supabase/supabase-js";

const admin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/** PATCH /api/myverse/works/[id] — Work 수정 (status, quadrant, title, dates 등) */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const allowed = ["title", "description", "start_date", "due_date", "color", "quadrant", "status"];
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const k of allowed) if (k in body) patch[k] = body[k];

    const db = admin();
    const { data, error } = await db
        .from("myverse_works")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ work: data });
}

/** DELETE /api/myverse/works/[id] */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { id } = await params;
    const db = admin();
    const { error } = await db
        .from("myverse_works")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
