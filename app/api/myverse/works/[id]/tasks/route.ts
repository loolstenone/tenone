import { NextResponse } from "next/server";
import { getMemberId } from "@/lib/myverse/auth";
import { createClient } from "@supabase/supabase-js";

const admin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/** GET /api/myverse/works/[id]/tasks */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { id } = await params;
    const db = admin();
    const { data, error } = await db
        .from("myverse_work_tasks")
        .select("*")
        .eq("work_id", id)
        .eq("member_id", memberId)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("due_time", { ascending: true, nullsFirst: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ tasks: data ?? [] });
}

/** POST /api/myverse/works/[id]/tasks — Task 생성 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { id: work_id } = await params;
    const body = await req.json();
    const { title, due_date, due_time, assignee, method, quadrant, memo } = body;
    if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

    const db = admin();
    const { data, error } = await db
        .from("myverse_work_tasks")
        .insert({
            work_id,
            member_id: memberId,
            title: title.trim(),
            due_date: due_date ?? null,
            due_time: due_time ?? null,
            assignee: assignee ?? null,
            method: method ?? null,
            quadrant: quadrant ?? "완중",
            memo: memo ?? null,
            status: "todo",
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ task: data }, { status: 201 });
}
