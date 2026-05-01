import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["general", "work", "meal", "exercise", "leisure", "transport", "home", "shopping", "medical", "social"];

/** GET /api/planners/places?date=YYYY-MM-DD */
export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const date = new URL(req.url).searchParams.get("date");
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_daily_places")
        .select("*")
        .eq("member_id", memberId)
        .eq("date", date)
        .order("visited_at", { ascending: true, nullsFirst: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ places: data ?? [] });
}

/** POST /api/planners/places — 장소 추가 */
export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { date, place_name, visited_at, address, category, duration_min, note } = body;

    if (!date || !place_name) return NextResponse.json({ error: "date, place_name required" }, { status: 400 });

    const cat = VALID_CATEGORIES.includes(category) ? category : "general";

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_daily_places")
        .insert({
            member_id: memberId,
            date,
            place_name: place_name.trim(),
            visited_at: visited_at || null,
            address: address?.trim() || null,
            category: cat,
            duration_min: duration_min ? Number(duration_min) : null,
            note: note?.trim() || null,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ place: data });
}

/** DELETE /api/planners/places?id=UUID */
export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
        .from("planners_daily_places")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

/** PATCH /api/planners/places?id=UUID — 장소 수정 */
export async function PATCH(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const body = await req.json();
    const allowed = ["place_name", "visited_at", "address", "category", "duration_min", "note"];
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
        if (key in body) patch[key] = body[key];
    }
    if (patch.category && !VALID_CATEGORIES.includes(patch.category as string)) {
        patch.category = "general";
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_daily_places")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ place: data });
}
