// 흔적 통합 API — moments + places + routines를 단일 timeline 형태로 반환.
// 기존 /api/myverse/moments는 그대로 유지 (TracesTimelineView가 단계적 마이그레이션).
// rev: 2

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

interface UnifiedTrace {
    id: string;
    source: "moment" | "place" | "routine";
    date: string;
    happened_at: string | null;
    media_type: "image" | "video" | "text" | null;
    media_url: string | null;
    thumbnail_url: string | null;
    caption: string | null;
    body: string | null;
    location: string | null;
    with_whom: string | null;
    activity: string | null;
    category: string | null;
    duration_min: number | null;
    visibility: "private" | "public" | "friends" | null;
    domain: string | null;
}

export async function GET(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const sources = (url.searchParams.get("sources") ?? "moment,place,routine").split(",");

    const admin = createAdminClient();
    const tasks: PromiseLike<UnifiedTrace[]>[] = [];

    if (sources.includes("moment")) {
        let q = admin.from("myverse_daily_moments")
            .select("id, date, happened_at, media_type, media_url, thumbnail_url, caption, body, location, with_whom, activity, visibility, domain")
            .eq("member_id", memberId);
        if (date) q = q.eq("date", date);
        else if (from && to) q = q.gte("date", from).lte("date", to);
        tasks.push(q.then(({ data }) => (data ?? []).map(r => ({
            id: `m_${r.id}`, source: "moment" as const,
            date: r.date, happened_at: r.happened_at,
            media_type: r.media_type, media_url: r.media_url, thumbnail_url: r.thumbnail_url,
            caption: r.caption, body: r.body,
            location: r.location, with_whom: r.with_whom, activity: r.activity,
            category: null, duration_min: null,
            visibility: r.visibility, domain: r.domain,
        }))));
    }

    if (sources.includes("place")) {
        let q = admin.from("myverse_daily_places")
            .select("id, date, visited_at, place_name, address, category, duration_min, note")
            .eq("member_id", memberId);
        if (date) q = q.eq("date", date);
        else if (from && to) q = q.gte("date", from).lte("date", to);
        tasks.push(q.then(({ data }) => (data ?? []).map(r => ({
            id: `p_${r.id}`, source: "place" as const,
            date: r.date, happened_at: r.visited_at,
            media_type: null, media_url: null, thumbnail_url: null,
            caption: r.address ?? null, body: r.note ?? null,
            location: r.place_name, with_whom: null, activity: null,
            category: r.category, duration_min: r.duration_min,
            visibility: null, domain: null,
        }))));
    }

    if (sources.includes("routine")) {
        let q = admin.from("myverse_daily_routines")
            .select("id, date, start_time, end_time, activity, category, note, level")
            .eq("member_id", memberId);
        if (date) q = q.eq("date", date);
        else if (from && to) q = q.gte("date", from).lte("date", to);
        tasks.push(q.then(({ data }) => (data ?? []).map(r => {
            const happened_at = r.start_time ? `${r.date}T${r.start_time}` : null;
            const duration_min = (r.start_time && r.end_time)
                ? Math.max(0, Math.round((new Date(`${r.date}T${r.end_time}`).getTime() - new Date(`${r.date}T${r.start_time}`).getTime()) / 60000))
                : null;
            return {
                id: `r_${r.id}`, source: "routine" as const,
                date: r.date, happened_at,
                media_type: null, media_url: null, thumbnail_url: null,
                caption: r.note ?? null, body: r.note ?? null,
                location: null, with_whom: null, activity: r.activity,
                category: r.category, duration_min,
                visibility: null, domain: null,
            };
        })));
    }

    const all = (await Promise.all(tasks)).flat();
    // 시간 정렬 — happened_at 기준 desc, null은 뒤로
    all.sort((a, b) => {
        const ta = a.happened_at ? new Date(a.happened_at).getTime() : new Date(`${a.date}T23:59:59`).getTime();
        const tb = b.happened_at ? new Date(b.happened_at).getTime() : new Date(`${b.date}T23:59:59`).getTime();
        return tb - ta;
    });

    return NextResponse.json({ traces: all });
}
