import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

const VALID_CATEGORIES = ["general", "work", "meal", "exercise", "leisure", "transport", "home", "shopping", "medical", "social"];

// routines 테이블 카테고리 — 매핑 시 사용
const ROUTINES_CATEGORIES = ["general", "work", "exercise", "meal", "study", "leisure", "rest", "social", "faith", "health", "transport"];
function mapToRoutinesCategory(c: string): string {
    return ROUTINES_CATEGORIES.includes(c) ? c : "general";
}

/** GET /api/myverse/places?date=YYYY-MM-DD */
export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const date = new URL(req.url).searchParams.get("date");
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_daily_places")
        .select("*")
        .eq("member_id", memberId)
        .eq("date", date)
        .order("visited_at", { ascending: true, nullsFirst: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ places: data ?? [] });
}

/** POST /api/myverse/places — 장소 추가 */
export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const { date, place_name, visited_at, address, category, duration_min, note } = body;

    if (!date || !place_name) return NextResponse.json({ error: "date, place_name required" }, { status: 400 });

    const cat = VALID_CATEGORIES.includes(category) ? category : "general";

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_daily_places")
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

    // ── 시간 트래킹(routines) 미러링 — 같은 날짜/이름/시각 row 없으면 자동 추가 ──
    try {
        const actName = place_name.trim();
        const startT = visited_at || null;
        const { data: existing } = await admin
            .from("myverse_daily_routines")
            .select("id")
            .eq("member_id", memberId)
            .eq("date", date)
            .eq("activity", actName)
            .eq("start_time", startT)
            .maybeSingle();
        if (!existing) {
            const endT = (startT && duration_min) ? (() => {
                const [h, m] = startT.split(":").map(Number);
                const total = h * 60 + m + Number(duration_min);
                if (total >= 24 * 60) return null;
                return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
            })() : null;
            await admin.from("myverse_daily_routines").insert({
                member_id: memberId,
                date,
                activity: actName,
                start_time: startT,
                end_time: endT,
                category: mapToRoutinesCategory(cat),
                note: address?.trim() || null,
                level: null,
            });
        }
    } catch { /* mirror 실패는 본 작업에 영향 없음 */ }

    return NextResponse.json({ place: data });
}

/** DELETE /api/myverse/places?id=UUID */
export async function DELETE(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
        .from("myverse_daily_places")
        .delete()
        .eq("id", id)
        .eq("member_id", memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

/** PATCH /api/myverse/places?id=UUID — 장소 수정 */
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
        .from("myverse_daily_places")
        .update(patch)
        .eq("id", id)
        .eq("member_id", memberId)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ place: data });
}
