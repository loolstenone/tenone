import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const admin = createAdminClient();
    let q = admin.from("planners_daily_moments").select("*").eq("member_id", memberId);
    if (date) q = q.eq("date", date);
    else if (from && to) q = q.gte("date", from).lte("date", to);
    q = q.order("happened_at", { ascending: false }).order("created_at", { ascending: false });

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ moments: data ?? [] });
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json();
    const {
        date, media_type, media_url, thumbnail_url,
        caption, happened_at, with_whom, location, activity,
        width, height, duration_sec, file_size,
    } = body as Record<string, unknown>;

    if (!date || typeof date !== "string") return NextResponse.json({ error: "missing_date" }, { status: 400 });
    if (media_type !== "image" && media_type !== "video") return NextResponse.json({ error: "invalid_media_type" }, { status: 400 });
    if (!media_url || typeof media_url !== "string") return NextResponse.json({ error: "missing_media_url" }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("planners_daily_moments")
        .insert({
            member_id: memberId,
            date,
            media_type,
            media_url,
            thumbnail_url: typeof thumbnail_url === "string" ? thumbnail_url : null,
            caption: typeof caption === "string" ? caption.slice(0, 500) : null,
            happened_at: typeof happened_at === "string" ? happened_at : null,
            with_whom: typeof with_whom === "string" ? with_whom.slice(0, 200) : null,
            location:  typeof location  === "string" ? location.slice(0, 200) : null,
            activity:  typeof activity  === "string" ? activity.slice(0, 200) : null,
            width:  typeof width  === "number" ? width  : null,
            height: typeof height === "number" ? height : null,
            duration_sec: typeof duration_sec === "number" ? duration_sec : null,
            file_size:    typeof file_size    === "number" ? file_size    : null,
        })
        .select()
        .single();

    if (error || !data) return NextResponse.json({ error: error?.message || "insert_failed" }, { status: 500 });
    return NextResponse.json({ moment: data });
}
