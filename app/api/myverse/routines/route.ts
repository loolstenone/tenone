import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["general", "work", "exercise", "meal", "study", "leisure", "rest", "social", "faith", "health", "transport"];

// places 테이블 카테고리 (일부만 routines와 겹침) — 매핑 시 사용
const PLACES_CATEGORIES = ["general", "work", "meal", "exercise", "leisure", "transport", "home", "shopping", "medical", "social"];
function mapToPlacesCategory(c: string): string {
    return PLACES_CATEGORIES.includes(c) ? c : "general";
}

/** GET /api/myverse/routines?date=YYYY-MM-DD */
export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const date = new URL(req.url).searchParams.get("date");
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_daily_routines")
        .select("*")
        .eq("member_id", memberId)
        .eq("date", date)
        .order("start_time", { ascending: true, nullsFirst: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ routines: data ?? [] });
}

/** POST /api/myverse/routines — 일과 추가 */
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
        .from("myverse_daily_routines")
        .insert({
            member_id: memberId,
            date,
            activity: activity.trim(),
            start_time: start_time || null,
            end_time: end_time || null,
            category: cat,
            note: note?.trim() || null,
            level: lvl,
            capture_mode: "manual",
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // ── 일간 장소(places) 미러링 — 같은 날짜/이름/시각 row 없으면 자동 추가 ──
    try {
        const placeName = activity.trim();
        const visitedAt = start_time || null;
        const { data: existing } = await admin
            .from("myverse_daily_places")
            .select("id")
            .eq("member_id", memberId)
            .eq("date", date)
            .eq("place_name", placeName)
            .eq("visited_at", visitedAt)
            .maybeSingle();
        if (!existing) {
            const duration = (start_time && end_time) ? (() => {
                const [sh, sm] = start_time.split(":").map(Number);
                const [eh, em] = end_time.split(":").map(Number);
                const d = (eh * 60 + em) - (sh * 60 + sm);
                return d > 0 ? d : null;
            })() : null;
            await admin.from("myverse_daily_places").insert({
                member_id: memberId,
                date,
                place_name: placeName,
                visited_at: visitedAt,
                address: note?.trim() || null,
                category: mapToPlacesCategory(cat),
                duration_min: duration,
                note: null,
            });
        }
    } catch { /* mirror 실패는 본 작업에 영향 없음 */ }

    return NextResponse.json({ routine: data });
}

/** DELETE /api/myverse/routines?id=UUID */
export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
        .from("myverse_daily_routines")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

/** PATCH /api/myverse/routines?id=UUID */
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
        .from("myverse_daily_routines")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ routine: data });
}
