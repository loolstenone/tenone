import { NextResponse } from "next/server";
import { getMemberId } from "@/lib/myverse/auth";
import { createClient } from "@supabase/supabase-js";

const admin = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/** GET /api/myverse/works — 내 Works + 각 task 수 */
export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const db = admin();
    const { data, error } = await db
        .from("myverse_works")
        .select("*, myverse_work_tasks(id, status, quadrant, due_date, due_time)")
        .eq("member_id", memberId)
        .neq("status", "archived")
        .order("due_date", { ascending: true, nullsFirst: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ works: data ?? [] });
}

/** POST /api/myverse/works — Work 생성 */
export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, description, start_date, due_date, color, quadrant } = body;
    if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

    const db = admin();
    const { data, error } = await db
        .from("myverse_works")
        .insert({
            member_id: memberId,
            title: title.trim(),
            description: description ?? null,
            start_date: start_date ?? null,
            due_date: due_date ?? null,
            color: color ?? "#3B82F6",
            quadrant: quadrant ?? "완중",
            status: "active",
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ work: data }, { status: 201 });
}
