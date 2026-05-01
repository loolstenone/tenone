import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["general", "work", "exercise", "meal", "study", "leisure", "rest", "social", "faith", "health", "transport"];

/** GET /api/planners/routines?date=YYYY-MM-DD */
export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const date = new URL(req.url).searchParams.get("date");
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_daily_routines")
        .select("*")
        .eq("member_id", memberId)
        .eq("date", date)
        .order("start_time", { ascending: true, nullsFirst: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ routines: data ?? [] });
}

/** POST /api/planners/routines — 일과 추가 */
export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { date, activity, start_time, end_time, category, note, level } = body;

    if (!date || !activity) return NextResponse.json({ error: "date, activity required" }, { status: 400 });

    const cat = VALID_CATEGORIES.includes(category) ? category : "general";
    const lvl = Number.isInteger(level) && level >= 1 && level <= 5 ? level : null;

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_daily_routines")
        .insert({
            member_id: memberId,
            date,
            activity: activity.trim(),
            start_time: start_time || null,
            end_time: end_time || null,
            category: cat,
            note: note?.trim() || null,
            level: lvl,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ routine: data });
}

/** DELETE /api/planners/routines?id=UUID */
export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
        .from("planners_daily_routines")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

/** PATCH /api/planners/routines?id=UUID */
export async function PATCH(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const body = await req.json();
    const allowed = ["activity", "start_time", "end_time", "category", "note", "level"];
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
        if (key in body) patch[key] = body[key];
    }
    if (patch.category && !VALID_CATEGORIES.includes(patch.category as string)) {
        patch.category = "general";
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_daily_routines")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ routine: data });
}
